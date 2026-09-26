-- Một chút yoga — operational control plane v1
-- Safe additive migration: new server-owned tables only. Existing public
-- tables, policies, data and storage objects are left unchanged.

create schema if not exists private;

create table if not exists private.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in (
    'terms', 'privacy', 'wellbeing_data', 'teacher_sharing',
    'notifications', 'marketing'
  )),
  action text not null check (action in ('granted', 'revoked')),
  policy_version text not null,
  source text not null check (source in (
    'onboarding', 'settings', 'teacher_invite', 'support', 'system'
  )),
  evidence jsonb not null default '{}'::jsonb,
  idempotency_key text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists private.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in (
    'owner', 'security_admin', 'content_editor', 'content_reviewer',
    'teacher', 'support', 'finance', 'analyst', 'growth'
  )),
  scope_type text not null check (scope_type in (
    'global', 'content', 'session', 'course', 'cohort', 'ticket', 'account'
  )),
  scope_id uuid,
  status text not null default 'active'
    check (status in ('active', 'revoked', 'expired')),
  reason text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  assigned_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (scope_type <> 'global' or scope_id is null),
  check (ends_at is null or ends_at >= starts_at),
  check (status <> 'revoked' or revoked_at is not null)
);

create table if not exists private.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_user_id uuid not null references auth.users(id) on delete cascade,
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  scope_type text not null check (scope_type in (
    'all_history', 'checkins', 'plans', 'runs', 'reflections', 'course'
  )),
  scope_id uuid,
  status text not null default 'active'
    check (status in ('active', 'paused', 'revoked', 'expired')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  assigned_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  check (teacher_user_id <> learner_user_id),
  check (scope_type <> 'course' or scope_id is not null),
  check (ends_at is null or ends_at >= starts_at)
);

create table if not exists private.share_grants (
  id uuid primary key default gen_random_uuid(),
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_kind text not null check (recipient_kind in ('teacher', 'support')),
  scope_type text not null check (scope_type in (
    'all_history', 'checkins', 'plans', 'runs', 'reflections', 'journey'
  )),
  scope_id uuid,
  fields text[] not null default '{}',
  status text not null default 'active'
    check (status in ('active', 'revoked', 'expired')),
  source text not null check (source in ('learner', 'owner', 'system')),
  consent_event_id uuid references private.consent_events(id) on delete restrict,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (learner_user_id <> recipient_user_id),
  check (expires_at is null or expires_at >= granted_at),
  check (status <> 'revoked' or revoked_at is not null)
);

create table if not exists private.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (request_type in ('export', 'delete', 'correct')),
  status text not null default 'requested' check (status in (
    'requested', 'identity_check', 'queued', 'processing',
    'completed', 'rejected', 'cancelled', 'failed'
  )),
  idempotency_key text,
  requested_at timestamptz not null default now(),
  verified_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  result_object_key text,
  failure_code text,
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (completed_at is null or completed_at >= requested_at)
);

create table if not exists private.data_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references private.data_requests(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists private.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_key text not null unique,
  requester_user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in (
    'account', 'content', 'practice', 'privacy', 'billing', 'bug', 'other'
  )),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open'
    check (status in ('open', 'pending_user', 'pending_internal', 'resolved', 'closed')),
  subject text not null,
  redacted_context jsonb not null default '{}'::jsonb,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists private.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references private.support_tickets(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  visibility text not null default 'user'
    check (visibility in ('user', 'internal')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists private.audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('user', 'service', 'system')),
  action text not null,
  object_schema text,
  object_table text,
  object_id uuid,
  outcome text not null default 'success'
    check (outcome in ('success', 'denied', 'failure')),
  request_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists private.feature_flags (
  flag_key text primary key check (flag_key ~ '^[a-z0-9][a-z0-9_.-]{1,100}$'),
  description text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  enabled boolean not null default false,
  rollout_percent numeric(5,2) not null default 0
    check (rollout_percent between 0 and 100),
  targeting jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  version_no integer not null default 1 check (version_no > 0),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table if not exists private.feature_flag_events (
  id uuid primary key default gen_random_uuid(),
  flag_key text not null,
  version_no integer not null,
  action text not null check (action in ('created', 'updated', 'archived', 'restored')),
  actor_id uuid references auth.users(id) on delete set null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists private.job_runs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  idempotency_key text not null,
  aggregate_type text,
  aggregate_id uuid,
  status text not null default 'queued' check (status in (
    'queued', 'running', 'succeeded', 'failed', 'dead_letter', 'cancelled'
  )),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  completed_at timestamptz,
  input_digest text,
  output_ref text,
  error_code text,
  error_detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_type, idempotency_key)
);

create table if not exists private.content_schema_registry (
  schema_key text not null,
  schema_version text not null,
  content_kind text not null check (content_kind in ('session', 'editorial')),
  schema_json jsonb not null,
  status text not null default 'active' check (status in ('active', 'deprecated')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (schema_key, schema_version)
);

create table if not exists private.content_validation_runs (
  id uuid primary key default gen_random_uuid(),
  content_kind text not null check (content_kind in ('session', 'editorial')),
  content_version_id uuid not null,
  schema_key text not null,
  schema_version text not null,
  validator_version text not null,
  status text not null check (status in ('passed', 'failed', 'warning')),
  errors jsonb not null default '[]'::jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (schema_key, schema_version)
    references private.content_schema_registry(schema_key, schema_version)
    on delete restrict
);

create table if not exists private.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  practice_reminders boolean not null default true,
  product_updates boolean not null default true,
  marketing boolean not null default false,
  quiet_hours jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists private.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('ios', 'android', 'web')),
  device_label text,
  app_version text,
  os_version text,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists private.push_endpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references private.user_devices(id) on delete cascade,
  provider text not null check (provider in ('apns', 'fcm', 'webpush')),
  token_ciphertext bytea not null,
  key_version text not null,
  token_hash text not null,
  active boolean not null default true,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, token_hash)
);

create table if not exists private.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  role text not null check (role in (
    'owner', 'security_admin', 'content_editor', 'content_reviewer',
    'teacher', 'support', 'finance', 'analyst', 'growth'
  )),
  scope_type text not null check (scope_type in (
    'global', 'content', 'session', 'course', 'cohort', 'ticket', 'account'
  )),
  scope_id uuid,
  token_hash text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (scope_type <> 'global' or scope_id is null)
);

-- Only the new tables receive RLS here. They have no client policies yet, so
-- authenticated/anon access is denied until server APIs are implemented.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'consent_events', 'role_assignments', 'teacher_assignments', 'share_grants',
    'data_requests', 'data_request_events', 'support_tickets', 'support_messages',
    'audit_events', 'feature_flags', 'feature_flag_events', 'job_runs',
    'content_schema_registry', 'content_validation_runs',
    'notification_preferences', 'user_devices', 'push_endpoints', 'workspace_invites'
  ] loop
    execute format('alter table private.%I enable row level security', table_name);
  end loop;
end
$$;

create unique index if not exists role_assignments_active_key_idx
  on private.role_assignments(
    user_id, role, scope_type,
    (coalesce(scope_id, '00000000-0000-0000-0000-000000000000'::uuid))
  ) where status = 'active';
create index if not exists role_assignments_user_active_idx
  on private.role_assignments(user_id, status, starts_at desc);
create index if not exists teacher_assignments_teacher_active_idx
  on private.teacher_assignments(teacher_user_id, status, starts_at desc);
create index if not exists teacher_assignments_learner_active_idx
  on private.teacher_assignments(learner_user_id, status, starts_at desc);
create index if not exists share_grants_recipient_active_idx
  on private.share_grants(recipient_user_id, status, expires_at);
create index if not exists share_grants_learner_active_idx
  on private.share_grants(learner_user_id, status, expires_at);
create index if not exists consent_events_user_purpose_idx
  on private.consent_events(user_id, purpose, occurred_at desc);
create unique index if not exists consent_events_idempotency_idx
  on private.consent_events(user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists data_requests_user_status_idx
  on private.data_requests(user_id, status, requested_at desc);
create unique index if not exists data_requests_idempotency_idx
  on private.data_requests(user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists data_request_events_request_idx
  on private.data_request_events(request_id, created_at desc);
create index if not exists support_tickets_user_status_idx
  on private.support_tickets(requester_user_id, status, updated_at desc);
create index if not exists support_tickets_assignee_status_idx
  on private.support_tickets(assigned_to, status, priority, updated_at desc);
create index if not exists support_messages_ticket_idx
  on private.support_messages(ticket_id, created_at);
create index if not exists audit_events_target_idx
  on private.audit_events(object_table, object_id, occurred_at desc);
create index if not exists audit_events_actor_idx
  on private.audit_events(actor_id, occurred_at desc);
create index if not exists feature_flags_active_idx
  on private.feature_flags(status, starts_at, ends_at);
create index if not exists feature_flag_events_key_idx
  on private.feature_flag_events(flag_key, created_at desc);
create index if not exists job_runs_ready_idx
  on private.job_runs(status, available_at)
  where status = 'queued';
create index if not exists job_runs_aggregate_idx
  on private.job_runs(aggregate_type, aggregate_id, created_at desc);
create index if not exists content_validation_target_idx
  on private.content_validation_runs(content_kind, content_version_id, checked_at desc);
create index if not exists user_devices_user_active_idx
  on private.user_devices(user_id, revoked_at, last_seen_at desc);
create index if not exists push_endpoints_user_active_idx
  on private.push_endpoints(user_id, active, revoked_at);
create index if not exists workspace_invites_email_idx
  on private.workspace_invites(email_hash, expires_at);

comment on schema private is
  'Server-owned control plane. Do not expose through PostgREST or client SDKs.';
comment on table private.share_grants is
  'Explicit, time-bounded learner consent for a teacher/support recipient.';
comment on table private.audit_events is
  'Security and data-access audit trail; do not store secrets or raw health payloads.';
comment on table private.job_runs is
  'Idempotent work ledger for exports, media processing, notifications and AI jobs.';
