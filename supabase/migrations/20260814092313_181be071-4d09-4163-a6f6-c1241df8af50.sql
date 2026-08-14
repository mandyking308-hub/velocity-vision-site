-- 1) Daily Free Preview credit grant scheduler (idempotent)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'grant-free-daily-credits') then
    perform cron.unschedule('grant-free-daily-credits');
  end if;
  perform cron.schedule(
    'grant-free-daily-credits',
    '15 3 * * *',
    $cron$ select public.grant_free_daily_credits(); $cron$
  );
end $$;

-- Execution stays server-side only.
revoke execute on function public.grant_free_daily_credits() from anon, authenticated, public;

-- 2) Free Preview contact limit: derive the actor from the session when omitted.
create or replace function public.enforce_free_preview_contact_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  actor uuid;
  plan_val text;
  cnt integer;
begin
  actor := coalesce(new.created_by, auth.uid());
  -- Service-role / internal paths with no session and no explicit owner stay unchanged.
  if actor is null then
    return new;
  end if;
  -- Stamp ownership so the row is always attributable and counted next time.
  new.created_by := actor;

  select plan into plan_val from public.user_plans where user_id = actor limit 1;
  if plan_val is distinct from 'free_preview' then
    return new;
  end if;
  if not public.plan_entitlement_active(actor) then
    raise exception 'free_preview_expired' using errcode = 'P0001';
  end if;
  select count(*) into cnt from public.contacts where created_by = actor;
  if cnt >= 25 then
    raise exception 'free_preview_contact_limit_reached'
      using errcode = 'P0001',
            hint = 'Free Preview supports up to 25 contacts. Upgrade to a paid plan to work with larger audiences.';
  end if;
  return new;
end;
$function$;

-- 3) Recurring cadence gate: same owner-null hardening.
create or replace function public.enforce_recurring_cadence_plan()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  plan_val text;
  owner uuid := coalesce(new.created_by, new.owner_id, auth.uid());
begin
  if new.cadence_type is null or new.cadence_type = 'one_off' then
    return new;
  end if;
  if owner is null then
    return new;
  end if;
  if auth.uid() is not null and new.created_by is null then
    new.created_by := auth.uid();
  end if;
  if public.has_role(owner, 'admin') then
    return new;
  end if;
  plan_val := public.effective_plan_for_actions(owner);
  if plan_val is null then
    raise exception 'plan_not_entitled' using errcode = 'check_violation',
      hint = 'An active paid entitlement is required for recurring cadence.';
  end if;
  if plan_val not in ('growth', 'agency') then
    raise exception 'recurring_cadence_requires_growth' using errcode = 'check_violation',
      hint = 'Recurring cadence is available on Growth and Agency. Starter and Free Preview support one-off campaigns.';
  end if;
  return new;
end;
$function$;