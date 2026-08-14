-- Customer email activation must remain paid-plan only at the database boundary.
-- This closes direct API / controlled-test / background-claim paths that could
-- otherwise bypass UI gating. Internal founder/admin users remain unaffected.

create or replace function public.enforce_paid_plan_customer_send()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  actor uuid := new.user_id;
  effective text;
  needs_gate boolean := false;
begin
  if actor is null then
    return new;
  end if;

  -- Internal operations are not customer-plan traffic.
  if public.has_role(actor, 'admin') or public.has_role(actor, 'founder') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    needs_gate := coalesce(new.status, '') in ('sending', 'scheduled');
  elsif tg_op = 'UPDATE' then
    -- Recheck at the moment a queued item is claimed for actual delivery.
    needs_gate := coalesce(new.status, '') = 'sending'
      and coalesce(old.status, '') <> 'sending';
  end if;

  if not needs_gate then
    return new;
  end if;

  effective := public.effective_plan_for_actions(actor);
  if effective is null or effective not in ('starter', 'growth', 'agency') then
    raise exception 'plan_send_not_permitted'
      using errcode = 'P0001',
            hint = 'Live or scheduled email sending is available only on an active paid plan.';
  end if;

  return new;
end;
$function$;

-- Replace idempotently so rerunning the migration cannot stack triggers.
drop trigger if exists trg_enforce_paid_plan_customer_send on public.email_sends;
create trigger trg_enforce_paid_plan_customer_send
before insert or update of status on public.email_sends
for each row
execute function public.enforce_paid_plan_customer_send();
