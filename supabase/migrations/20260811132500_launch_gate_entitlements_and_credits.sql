-- Launch-gate hardening: authoritative plan entitlement, credit allocation,
-- atomic credit reservation, recurring cadence and workspace limits.

begin;

create or replace function public.plan_entitlement_active(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select
      up.plan in ('free_preview','starter','growth','agency')
      and lower(coalesce(up.status,'')) in ('active','trialing','canceling')
      and up.period_end is not null
      and up.period_end > now()
    from public.user_plans up
    where up.user_id = _user_id
    limit 1
  ), false);
$$;

create or replace function public.effective_plan_for_actions(_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when public.plan_entitlement_active(_user_id) then up.plan else null end
  from public.user_plans up
  where up.user_id = _user_id
  limit 1;
$$;

create or replace function public.credit_balance_for_user(_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  plan_row public.user_plans;
  current_inc integer := 0;
  current_spend integer := 0;
  topup_grants integer := 0;
  explicit_topup_spend integer := 0;
  topup_overage integer := 0;
  free_inc integer := 0;
  free_spend integer := 0;
  topup_net integer := 0;
  remaining_val integer := 0;
begin
  select * into plan_row from public.user_plans where user_id = _user_id limit 1;
  if not found then
    return jsonb_build_object('included',0,'used',0,'topup_balance',0,'remaining',0);
  end if;

  select coalesce(sum(delta),0)::int into topup_grants
  from public.credit_ledger
  where user_id = _user_id
    and reason in ('topup','stripe_topup','qa_manual_grant','manual_grant')
    and delta > 0;

  select coalesce(sum(-delta),0)::int into explicit_topup_spend
  from public.credit_ledger
  where user_id = _user_id and reason = 'paid_topup_spend' and delta < 0;

  if plan_row.plan = 'free_preview' then
    select coalesce(sum(delta),0)::int into free_inc
      from public.credit_ledger
      where user_id = _user_id and reason in ('free_welcome_grant','free_daily_grant') and delta > 0;
    select coalesce(sum(-delta),0)::int into free_spend
      from public.credit_ledger
      where user_id = _user_id and reason = 'free_preview_spend' and delta < 0;

    -- Free Preview never consumes paid top-ups and becomes action-ineligible
    -- at period end. Historical top-ups, if any, remain owned but unusable
    -- until an eligible paid plan is active again.
    if not public.plan_entitlement_active(_user_id) then
      return jsonb_build_object(
        'included',0,
        'used',0,
        'topup_balance',greatest(0, topup_grants - explicit_topup_spend),
        'remaining',0
      );
    end if;

    return jsonb_build_object(
      'included', free_inc,
      'used', free_spend,
      'topup_balance', greatest(0, topup_grants - explicit_topup_spend),
      'remaining', greatest(0, free_inc - free_spend)
    );
  end if;

  -- Allocate each paid cycle's included credits first. Any spend above that
  -- cycle grant consumes carried top-up balance. This prevents the client and
  -- server from overstating credits after included credits are exhausted.
  with grants as (
    select
      created_at as start_at,
      lead(created_at) over (order by created_at) as end_at,
      delta::int as grant_amount
    from public.credit_ledger
    where user_id = _user_id and reason = 'plan_grant' and delta > 0
  ), cycles as (
    select
      g.start_at,
      g.end_at,
      g.grant_amount,
      coalesce(sum(-l.delta) filter (where l.delta < 0),0)::int as spend_amount
    from grants g
    left join public.credit_ledger l
      on l.user_id = _user_id
     and l.reason like 'spend_%'
     and l.created_at >= g.start_at
     and (g.end_at is null or l.created_at < g.end_at)
    group by g.start_at, g.end_at, g.grant_amount
  )
  select coalesce(sum(greatest(spend_amount - grant_amount,0)),0)::int
  into topup_overage
  from cycles;

  select coalesce(sum(delta),0)::int into current_inc
  from public.credit_ledger
  where user_id = _user_id and reason = 'plan_grant' and delta > 0
    and created_at >= plan_row.period_start;

  select coalesce(sum(-delta),0)::int into current_spend
  from public.credit_ledger
  where user_id = _user_id and reason like 'spend_%' and delta < 0
    and created_at >= plan_row.period_start;

  topup_net := greatest(0, topup_grants - explicit_topup_spend - topup_overage);
  remaining_val := greatest(0, current_inc - current_spend) + topup_net;

  return jsonb_build_object(
    'included', current_inc,
    'used', current_spend,
    'topup_balance', topup_net,
    'remaining', remaining_val
  );
end;
$$;

create or replace function public.get_current_credit_balance()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  return public.credit_balance_for_user(uid);
end;
$$;

create or replace function public.reserve_campaign_credits(_cost integer, _action text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  plan_row public.user_plans;
  balance jsonb;
  remaining_val integer := 0;
  ledger_id uuid;
  spend_reason text;
  pack_count integer := 0;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if _cost is null or _cost <= 0 then raise exception 'invalid_cost'; end if;
  if _action is null or btrim(_action) = '' then raise exception 'invalid_action'; end if;

  -- Serialize reservations per user so two browser tabs cannot both observe
  -- the same balance and race it below zero.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  select * into plan_row from public.user_plans where user_id = uid limit 1;
  if not found then raise exception 'no_plan' using errcode = 'P0002'; end if;

  if not public.plan_entitlement_active(uid) then
    if plan_row.plan = 'free_preview' then
      raise exception 'free_preview_expired' using errcode = 'P0001';
    elsif plan_row.plan = 'starter' then
      raise exception 'starter_expired' using errcode = 'P0001';
    else
      raise exception 'plan_not_entitled' using errcode = 'P0001';
    end if;
  end if;

  if plan_row.plan = 'free_preview' then
    if _action = 'full_campaign_pack' then
      select count(*) into pack_count
      from public.campaigns
      where created_by = uid and pack is not null;
      if pack_count >= 1 then
        raise exception 'free_preview_pack_limit' using errcode = 'P0001',
          hint = 'Free Preview includes one full campaign pack. Upgrade to generate more.';
      end if;
    end if;
    spend_reason := 'free_preview_spend';
  else
    spend_reason := 'spend_' || _action;
  end if;

  balance := public.credit_balance_for_user(uid);
  remaining_val := coalesce((balance->>'remaining')::integer, 0);
  if remaining_val < _cost then
    raise exception 'insufficient_credits' using errcode = 'P0001';
  end if;

  insert into public.credit_ledger (user_id, delta, reason, meta)
  values (uid, -_cost, spend_reason,
    jsonb_build_object('action', _action, 'cost', _cost, 'reserved', true))
  returning id into ledger_id;

  return ledger_id;
end;
$$;

create or replace function public.enforce_recurring_cadence_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_val text;
  owner uuid := coalesce(new.created_by, new.owner_id);
begin
  if new.cadence_type is null or new.cadence_type = 'one_off' then return new; end if;
  if owner is null then return new; end if;
  if public.has_role(owner, 'admin') then return new; end if;

  plan_val := public.effective_plan_for_actions(owner);
  if plan_val is null then
    raise exception 'plan_not_entitled' using errcode = 'check_violation',
      hint = 'An active paid entitlement is required for recurring cadence.';
  end if;
  if plan_val not in ('growth','agency') then
    raise exception 'recurring_cadence_requires_growth' using errcode = 'check_violation',
      hint = 'Recurring cadence is available on Growth and Agency. Starter and Free Preview support one-off campaigns.';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_workspace_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  plan_val text;
  user_company uuid;
  ws_count integer := 0;
begin
  -- Service-role/system writes do not carry a user JWT and are handled by
  -- trusted server code. Authenticated customer writes are always checked.
  if uid is null then return new; end if;
  if public.has_role(uid, 'admin') then return new; end if;

  plan_val := public.effective_plan_for_actions(uid);
  if plan_val is null then
    raise exception 'plan_not_entitled' using errcode = 'check_violation';
  end if;

  select company_id into user_company from public.profiles where user_id = uid limit 1;
  if user_company is null or new.agency_company_id is distinct from user_company then
    raise exception 'workspace_company_mismatch' using errcode = 'insufficient_privilege';
  end if;

  select count(*) into ws_count
  from public.client_workspaces
  where agency_company_id = new.agency_company_id;

  if plan_val <> 'agency' and ws_count >= 1 then
    raise exception 'workspace_limit_reached' using errcode = 'check_violation',
      hint = 'Your plan allows one workspace. An active Agency plan is required for multiple client workspaces.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_workspace_plan_limit on public.client_workspaces;
create trigger trg_enforce_workspace_plan_limit
before insert on public.client_workspaces
for each row execute function public.enforce_workspace_plan_limit();

create or replace function public.provision_first_workspace(
  _name text,
  _industry text default null,
  _website text default null,
  _country text default null
)
returns public.client_workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing_company uuid;
  new_company uuid;
  ws public.client_workspaces;
  clean_name text := nullif(btrim(_name), '');
  ws_count integer := 0;
  is_admin boolean := false;
  plan_val text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if clean_name is null then raise exception 'workspace name required'; end if;

  is_admin := public.has_role(uid, 'admin');
  if not is_admin then
    plan_val := public.effective_plan_for_actions(uid);
    if plan_val is null then raise exception 'plan_not_entitled' using errcode = 'check_violation'; end if;
  end if;

  select company_id into existing_company from public.profiles where user_id = uid limit 1;

  if not is_admin and existing_company is not null then
    select count(*) into ws_count from public.client_workspaces where agency_company_id = existing_company;
    if plan_val <> 'agency' and ws_count >= 1 then
      raise exception 'workspace_limit_reached' using errcode = 'check_violation',
        hint = 'Your plan allows one workspace. Upgrade to Agency for multiple client workspaces.';
    end if;
  end if;

  if existing_company is null then
    insert into public.companies (name, account_type, status, country, created_by)
    values (clean_name, 'business', 'active_client', _country, uid)
    returning id into new_company;
    update public.profiles set company_id = new_company where user_id = uid;
  else
    new_company := existing_company;
  end if;

  insert into public.client_workspaces (agency_company_id, name, industry, website, default_country)
  values (new_company, clean_name, _industry, _website, _country)
  returning * into ws;
  return ws;
end;
$$;

create or replace function public.enforce_free_preview_contact_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_val text;
  cnt integer;
begin
  if new.created_by is null then return new; end if;
  select plan into plan_val from public.user_plans where user_id = new.created_by limit 1;
  if plan_val is distinct from 'free_preview' then return new; end if;
  if not public.plan_entitlement_active(new.created_by) then
    raise exception 'free_preview_expired' using errcode = 'P0001';
  end if;
  select count(*) into cnt from public.contacts where created_by = new.created_by;
  if cnt >= 25 then
    raise exception 'free_preview_contact_limit_reached' using errcode = 'P0001',
      hint = 'Free Preview supports up to 25 contacts. Upgrade to a paid plan to work with larger audiences.';
  end if;
  return new;
end;
$$;

-- Credit mutation is server/RPC-only. Customers may read their own ledger but
-- cannot manufacture negative rows or choose spend reasons from the browser.
drop policy if exists ledger_spend_insert_self on public.credit_ledger;

revoke all on function public.credit_balance_for_user(uuid) from public;
revoke all on function public.plan_entitlement_active(uuid) from public;
revoke all on function public.effective_plan_for_actions(uuid) from public;
grant execute on function public.get_current_credit_balance() to authenticated;
grant execute on function public.reserve_campaign_credits(integer,text) to authenticated;
grant execute on function public.finalise_campaign_credits(uuid,uuid,text) to authenticated;
grant execute on function public.refund_campaign_credits(uuid) to authenticated;

commit;
