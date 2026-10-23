-- Google Play and the Owner require in-app account deletion for accounts created in the app.
-- A signed-in learner deletes their own Auth user; every learner-owned row cascades
-- (profiles, check-ins, observations, consent evidence, AI usage, notification settings, devices, ...).
-- Rows that only keep a nullable actor reference (audit events, invitations) lose the reference.
-- Local candidate: apply only after the exact-target review in docs/release/RELEASE_RUNBOOK.md.

create or replace function public.delete_my_account(p_confirmation text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;
  if p_confirmation is distinct from 'DELETE_MY_ACCOUNT' then
    raise exception using errcode = '22023', message = 'Explicit deletion confirmation required';
  end if;

  -- Serialize with in-flight consent and check-in writes for the same actor.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('mcy.consent-events:' || v_user_id::text, 0));

  -- Owner, reviewer and teacher accounts own review/authoring history. The Owner handles
  -- those accounts deliberately; they are never deleted through the learner flow.
  if exists (
    select 1 from private.role_assignments r
    where r.user_id = v_user_id and r.status = 'active' and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Accounts with a staff role are deleted by the Owner';
  end if;

  begin
    delete from auth.users where id = v_user_id;
  exception when foreign_key_violation then
    raise exception using errcode = '42501', message = 'This account has records the Owner must resolve first';
  end;
  if not found then
    raise exception using errcode = 'P0002', message = 'Account no longer exists';
  end if;

  -- Count-only trail: no actor, email or other identifier survives.
  insert into private.audit_events (actor_id, actor_type, action, outcome, metadata)
  values (null, 'system', 'learner_account_deleted', 'success', '{}'::jsonb);
end
$function$;

revoke all on function public.delete_my_account(text) from public, anon, authenticated;
grant execute on function public.delete_my_account(text) to authenticated;
