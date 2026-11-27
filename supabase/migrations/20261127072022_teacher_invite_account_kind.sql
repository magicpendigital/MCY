-- Teacher invitations for addresses that already have an account (Owner request 2026-11-27).
-- 1. mcy_teacher_invite_account_kind tells the Edge whether the invited address has no
--    account, an ordinary (learner) account, or an account holding any active role other
--    than teacher (Owner/staff). It stores nothing and returns one of three words. A staff
--    answer is audited without the address, because the Edge refuses that invitation.
-- 2. mcy_teacher_invite_mark_existing_account_emailed settles an in_progress invitation
--    after the Edge sent the dedicated teacher-instructions email to an existing account.

create or replace function public.mcy_teacher_invite_account_kind(
  p_actor_id uuid,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  if p_actor_id is null or p_email is null
     or pg_catalog.length(p_email) > 254
     or p_email <> pg_catalog.lower(pg_catalog.btrim(p_email))
     or p_email !~ '^[^[:space:]@<>]+@[^[:space:]@<>]+\.[^[:space:]@<>]+$' then
    raise exception using errcode = '22023', message = 'Invalid teacher invitation';
  end if;

  if not exists (
    select 1 from private.role_assignments r
    where r.user_id = p_actor_id and r.role = 'owner' and r.scope_type = 'global'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Owner role required';
  end if;

  select u.id into v_user_id
  from auth.users u
  where pg_catalog.lower(u.email) = p_email
  order by u.created_at
  limit 1;

  if v_user_id is null then
    return 'none';
  end if;

  if exists (
    select 1 from private.role_assignments r
    where r.user_id = v_user_id and r.role <> 'teacher'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    insert into private.audit_events (
      actor_id, actor_type, action, object_schema, object_table, object_id,
      outcome, reason, metadata
    ) values (
      p_actor_id, 'user', 'teacher.invite.refused_staff_account', 'private', 'workspace_invites', null,
      'denied', 'Invited address belongs to an account with an Owner or staff role; no invitation was created',
      pg_catalog.jsonb_build_object('role', 'teacher', 'email_sent', false)
    );
    return 'staff';
  end if;

  return 'learner';
end
$$;

create or replace function public.mcy_teacher_invite_mark_existing_account_emailed(
  p_actor_id uuid,
  p_invite_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if p_actor_id is null or p_invite_id is null or not exists (
    select 1 from private.role_assignments r
    where r.user_id = p_actor_id and r.role = 'owner' and r.scope_type = 'global'
      and r.status = 'active' and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Owner role required';
  end if;

  update private.workspace_invites i
  set delivery_state = 'sent', delivery_updated_at = pg_catalog.now()
  where i.id = p_invite_id and i.invited_by = p_actor_id
    and i.role = 'teacher' and i.scope_type = 'global'
    and i.accepted_at is null and i.delivery_state = 'in_progress';
  get diagnostics v_updated = row_count;
  if v_updated = 1 then
    insert into private.audit_events (
      actor_id, actor_type, action, object_schema, object_table, object_id,
      outcome, reason, metadata
    ) values (
      p_actor_id, 'user', 'teacher.invite.delivery_confirmed', 'private', 'workspace_invites', p_invite_id,
      'success', 'Email provider accepted the teacher-instructions email for an existing account',
      pg_catalog.jsonb_build_object('delivery_state', 'sent', 'email_sent', true, 'existing_account', true)
    );
    return true;
  end if;
  return false;
end
$$;

revoke all on function public.mcy_teacher_invite_account_kind(uuid, text) from public, anon, authenticated;
revoke all on function public.mcy_teacher_invite_mark_existing_account_emailed(uuid, uuid) from public, anon, authenticated;
grant execute on function public.mcy_teacher_invite_account_kind(uuid, text) to service_role;
grant execute on function public.mcy_teacher_invite_mark_existing_account_emailed(uuid, uuid) to service_role;
