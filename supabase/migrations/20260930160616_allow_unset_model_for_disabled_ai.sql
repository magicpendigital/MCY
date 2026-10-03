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

  if p_model_id is null
     or (p_enabled and p_model_id !~ '^[a-z0-9][a-z0-9._/-]{1,200}$')
     or (not p_enabled and p_model_id <> ''
         and p_model_id !~ '^[a-z0-9][a-z0-9._/-]{1,200}$') then
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

revoke all on function public.mcy_ai_save_owner_config(uuid, integer, boolean, text, text, numeric, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.mcy_ai_save_owner_config(uuid, integer, boolean, text, text, numeric, integer, integer, integer) to service_role;
