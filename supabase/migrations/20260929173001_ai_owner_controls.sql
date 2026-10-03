-- Staging AI control plane. Secrets and learner messages are never stored here.
create table private.ai_configurations (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false,
  model_id text not null default '',
  system_prompt text not null,
  temperature numeric(3,2) not null default 0.30 check (temperature between 0 and 0.70),
  max_output_tokens integer not null default 320 check (max_output_tokens between 64 and 512),
  per_user_daily_limit integer not null default 10 check (per_user_daily_limit between 1 and 50),
  global_daily_limit integer not null default 100 check (global_daily_limit between 1 and 500),
  version_no integer not null default 1 check (version_no > 0),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (model_id = '' or model_id ~ '^[a-z0-9][a-z0-9._/-]{1,200}$'),
  check (length(system_prompt) between 40 and 6000)
);

insert into private.ai_configurations (singleton, enabled, model_id, system_prompt)
values (
  true,
  false,
  '',
  'Bạn là trợ lý đồng hành nhẹ nhàng của Một chút yoga. Hãy lắng nghe nhu cầu trong ngày, hỏi tối đa một câu làm rõ khi cần, rồi giúp người dùng tự chọn nội dung phù hợp trong thư viện đã được giảng viên duyệt. Trả lời ngắn gọn, tự nhiên bằng ngôn ngữ người dùng đang dùng.'
);

create table private.ai_usage_events (
  request_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  model_id text not null,
  status text not null check (status in ('started', 'succeeded', 'failed')),
  input_tokens integer check (input_tokens is null or input_tokens between 0 and 100000),
  output_tokens integer check (output_tokens is null or output_tokens between 0 and 100000),
  error_code text check (error_code is null or error_code ~ '^[a-z0-9_]{1,60}$'),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table private.ai_configurations enable row level security;
alter table private.ai_usage_events enable row level security;
revoke all on table private.ai_configurations from public, anon, authenticated, service_role;
revoke all on table private.ai_usage_events from public, anon, authenticated, service_role;

create index ai_usage_events_user_created_idx
  on private.ai_usage_events(user_id, created_at desc);
create index ai_usage_events_created_idx
  on private.ai_usage_events(created_at desc);

create or replace function public.mcy_ai_get_owner_config(p_actor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_config private.ai_configurations%rowtype;
begin
  if p_actor_id is null or not exists (
    select 1
    from private.role_assignments r
    where r.user_id = p_actor_id
      and r.role = 'owner'
      and r.scope_type = 'global'
      and r.status = 'active'
      and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Owner role required';
  end if;

  select c.* into strict v_config
  from private.ai_configurations c
  where c.singleton = true;

  return pg_catalog.to_jsonb(v_config) - 'singleton';
end
$$;

create or replace function public.mcy_ai_save_owner_config(
  p_actor_id uuid,
  p_expected_version integer,
  p_enabled boolean,
  p_model_id text,
  p_system_prompt text,
  p_temperature numeric,
  p_max_output_tokens integer,
  p_per_user_daily_limit integer,
  p_global_daily_limit integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_config private.ai_configurations%rowtype;
begin
  if p_actor_id is null or not exists (
    select 1
    from private.role_assignments r
    where r.user_id = p_actor_id
      and r.role = 'owner'
      and r.scope_type = 'global'
      and r.status = 'active'
      and r.starts_at <= pg_catalog.now()
      and (r.ends_at is null or r.ends_at > pg_catalog.now())
  ) then
    raise exception using errcode = '42501', message = 'Owner role required';
  end if;
  if p_model_id is null or p_model_id !~ '^[a-z0-9][a-z0-9._/-]{1,200}$' then
    raise exception using errcode = '22023', message = 'Choose a supported model';
  end if;
  if p_system_prompt is null or length(p_system_prompt) not between 40 and 6000 then
    raise exception using errcode = '22023', message = 'System prompt must be 40 to 6000 characters';
  end if;
  if p_temperature is null or p_temperature not between 0 and 0.70
     or p_max_output_tokens not between 64 and 512
     or p_per_user_daily_limit not between 1 and 50
     or p_global_daily_limit not between 1 and 500 then
    raise exception using errcode = '22023', message = 'AI limits are outside the allowed range';
  end if;

  select c.* into strict v_config
  from private.ai_configurations c
  where c.singleton = true
  for update;
  if p_expected_version is distinct from v_config.version_no then
    raise exception using errcode = '40001', message = 'AI configuration changed; reload before saving';
  end if;

  update private.ai_configurations c
  set enabled = p_enabled,
      model_id = p_model_id,
      system_prompt = p_system_prompt,
      temperature = p_temperature,
      max_output_tokens = p_max_output_tokens,
      per_user_daily_limit = p_per_user_daily_limit,
      global_daily_limit = p_global_daily_limit,
      version_no = c.version_no + 1,
      updated_by = p_actor_id,
      updated_at = pg_catalog.now()
  where c.singleton = true
  returning c.* into v_config;

  insert into private.audit_events (
    actor_id, actor_type, action, object_schema, object_table, outcome, reason, metadata
  ) values (
    p_actor_id, 'user', 'ai_config.updated', 'private', 'ai_configurations', 'success',
    'Owner updated staging AI controls',
    pg_catalog.jsonb_build_object(
      'version_no', v_config.version_no,
      'enabled', v_config.enabled,
      'model_id', v_config.model_id,
      'temperature', v_config.temperature,
      'max_output_tokens', v_config.max_output_tokens,
      'per_user_daily_limit', v_config.per_user_daily_limit,
      'global_daily_limit', v_config.global_daily_limit
    )
  );

  return pg_catalog.to_jsonb(v_config) - 'singleton';
end
$$;

create or replace function public.mcy_ai_begin_request(p_actor_id uuid, p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_config private.ai_configurations%rowtype;
  v_latest text[];
  v_user_count integer;
  v_global_count integer;
begin
  if p_actor_id is null or p_request_id is null then
    raise exception using errcode = '22023', message = 'Actor and request ID are required';
  end if;

  select c.* into strict v_config
  from private.ai_configurations c
  where c.singleton = true;
  if not v_config.enabled or v_config.model_id = '' then
    raise exception using errcode = '55000', message = 'AI is not enabled';
  end if;

  select array[
    (select e.action from private.consent_events e where e.user_id = p_actor_id and e.purpose = 'terms' order by e.occurred_at desc, e.created_at desc, e.id desc limit 1),
    (select e.policy_version from private.consent_events e where e.user_id = p_actor_id and e.purpose = 'terms' order by e.occurred_at desc, e.created_at desc, e.id desc limit 1),
    (select e.action from private.consent_events e where e.user_id = p_actor_id and e.purpose = 'privacy' order by e.occurred_at desc, e.created_at desc, e.id desc limit 1),
    (select e.policy_version from private.consent_events e where e.user_id = p_actor_id and e.purpose = 'privacy' order by e.occurred_at desc, e.created_at desc, e.id desc limit 1),
    (select e.action from private.consent_events e where e.user_id = p_actor_id and e.purpose = 'ai_processing' order by e.occurred_at desc, e.created_at desc, e.id desc limit 1),
    (select e.policy_version from private.consent_events e where e.user_id = p_actor_id and e.purpose = 'ai_processing' order by e.occurred_at desc, e.created_at desc, e.id desc limit 1)
  ] into v_latest;
  if v_latest is distinct from array[
    'granted', 'terms-review-0.1', 'granted', 'privacy-review-0.1',
    'granted', 'ai-processing-review-1.0'
  ]::text[] then
    raise exception using errcode = '42501', message = 'Current consent required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('mcy-ai-global', 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor_id::text, 0));
  if exists (select 1 from private.ai_usage_events u where u.request_id = p_request_id) then
    raise exception using errcode = '23505', message = 'Request already processed';
  end if;

  select pg_catalog.count(*)::integer into v_user_count
  from private.ai_usage_events u
  where u.user_id = p_actor_id and u.created_at > pg_catalog.now() - interval '24 hours';
  select pg_catalog.count(*)::integer into v_global_count
  from private.ai_usage_events u
  where u.created_at > pg_catalog.now() - interval '24 hours';
  if v_user_count >= v_config.per_user_daily_limit or v_global_count >= v_config.global_daily_limit then
    raise exception using errcode = '54000', message = 'AI usage limit reached';
  end if;

  insert into private.ai_usage_events (request_id, user_id, model_id, status)
  values (p_request_id, p_actor_id, v_config.model_id, 'started');
  return pg_catalog.to_jsonb(v_config) - 'singleton';
end
$$;

create or replace function public.mcy_ai_finish_request(
  p_actor_id uuid,
  p_request_id uuid,
  p_model_id text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_status text,
  p_error_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_id is null or p_request_id is null
     or p_status not in ('succeeded', 'failed')
     or (p_input_tokens is not null and p_input_tokens not between 0 and 100000)
     or (p_output_tokens is not null and p_output_tokens not between 0 and 100000)
     or (p_error_code is not null and p_error_code !~ '^[a-z0-9_]{1,60}$') then
    raise exception using errcode = '22023', message = 'Invalid AI usage status';
  end if;

  update private.ai_usage_events u
  set model_id = coalesce(nullif(p_model_id, ''), u.model_id),
      input_tokens = p_input_tokens,
      output_tokens = p_output_tokens,
      status = p_status,
      error_code = p_error_code,
      finished_at = pg_catalog.now()
  where u.request_id = p_request_id
    and u.user_id = p_actor_id
    and u.status = 'started';
  return found;
end
$$;

revoke all on function public.mcy_ai_get_owner_config(uuid) from public, anon, authenticated;
revoke all on function public.mcy_ai_save_owner_config(uuid, integer, boolean, text, text, numeric, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.mcy_ai_begin_request(uuid, uuid) from public, anon, authenticated;
revoke all on function public.mcy_ai_finish_request(uuid, uuid, text, integer, integer, text, text) from public, anon, authenticated;
grant execute on function public.mcy_ai_get_owner_config(uuid) to service_role;
grant execute on function public.mcy_ai_save_owner_config(uuid, integer, boolean, text, text, numeric, integer, integer, integer) to service_role;
grant execute on function public.mcy_ai_begin_request(uuid, uuid) to service_role;
grant execute on function public.mcy_ai_finish_request(uuid, uuid, text, integer, integer, text, text) to service_role;

comment on table private.ai_configurations is 'Owner-managed staging AI controls; API secrets are stored only in Edge Function secrets.';
comment on table private.ai_usage_events is 'Privacy-minimal AI quota ledger; never stores prompts, messages, outputs or raw learner data.';
comment on function public.mcy_ai_begin_request(uuid, uuid) is 'Service-only AI admission boundary: verifies current terms/privacy/AI consent and enforces rolling 24-hour quotas.';
