-- Narrow staging review workflow: Owner is the initial reviewer; teachers need
-- an explicit expiring capability for one exact content version. No publish API.
create table private.mcy_content_review_states (
  candidate_id text not null, content_version text not null,
  title text not null, scope text not null check(scope in ('learning_intro','practice_session')),
  revision integer not null default 0 check(revision >= 0),
  decision text not null default 'pending' check(decision in ('pending','approved','changes_requested','withdrawn')),
  reviewer_id uuid references auth.users(id) on delete set null,
  qualification text, review_basis text, rights_basis text, checklist jsonb,
  updated_at timestamptz not null default now(),
  primary key(candidate_id,content_version),
  check(candidate_id ~ '^[a-z0-9_-]{1,80}$'), check(content_version ~ '^[a-f0-9]{64}$')
);
create table private.mcy_content_reviewer_assignments (
  candidate_id text not null, content_version text not null,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  active boolean not null, expires_at timestamptz not null,
  primary key(candidate_id,content_version,reviewer_id),
  foreign key(candidate_id,content_version) references private.mcy_content_review_states(candidate_id,content_version)
);
create table private.mcy_content_review_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  candidate_id text not null, content_version text not null,
  revision integer not null, kind text not null check(kind in ('review','assignment')),
  payload jsonb not null, occurred_at timestamptz not null default now(),
  unique(candidate_id,content_version,revision),
  foreign key(candidate_id,content_version) references private.mcy_content_review_states(candidate_id,content_version)
);
create index mcy_content_review_actor_time on private.mcy_content_review_events(actor_id,occurred_at desc);
create index mcy_content_review_assignee on private.mcy_content_reviewer_assignments(reviewer_id,expires_at) where active;
alter table private.mcy_content_review_states enable row level security;
alter table private.mcy_content_reviewer_assignments enable row level security;
alter table private.mcy_content_review_events enable row level security;
revoke all on private.mcy_content_review_states,private.mcy_content_reviewer_assignments,private.mcy_content_review_events from public,anon,authenticated,service_role;

create function private.mcy_content_review_actor(p_actor uuid) returns text
language plpgsql set search_path='' as $$
begin
  -- Hold verified identity through the operation, including subsequent lock waits.
  perform 1 from auth.users where id=p_actor and email_confirmed_at is not null for share;
  if p_actor is null or not found then
    raise exception using errcode='42501',message='content_review_access_required';
  end if;
  perform 1 from private.role_assignments r where r.user_id=p_actor and r.role='owner'
    and r.scope_type='global' and r.status='active' and r.starts_at<=clock_timestamp()
    and (r.ends_at is null or r.ends_at>clock_timestamp()) for share;
  -- A FOR SHARE predicate may run before a wait on an unchanged tuple. Refresh
  -- wall-clock expiry after obtaining the lock, including read-only admission.
  if found and exists(select 1 from private.role_assignments r where r.user_id=p_actor and r.role='owner'
    and r.scope_type='global' and r.status='active' and r.starts_at<=clock_timestamp()
    and (r.ends_at is null or r.ends_at>clock_timestamp())) then return 'owner'; end if;
  perform 1 from private.role_assignments r where r.user_id=p_actor and r.role='teacher'
    and r.scope_type='global' and r.status='active' and r.starts_at<=clock_timestamp()
    and (r.ends_at is null or r.ends_at>clock_timestamp()) for share;
  if found then
    perform 1 from public.teachers t where t.user_id=p_actor and t.active for share;
    if found and exists(select 1 from private.role_assignments r where r.user_id=p_actor and r.role='teacher'
      and r.scope_type='global' and r.status='active' and r.starts_at<=clock_timestamp()
      and (r.ends_at is null or r.ends_at>clock_timestamp())) then return 'teacher'; end if;
  end if;
  raise exception using errcode='42501',message='content_review_access_required';
end $$;
create function private.mcy_content_review_validate(p_candidate jsonb) returns void
language plpgsql set search_path='' as $$
begin
  if p_candidate is null or jsonb_typeof(p_candidate)<>'object'
    or (select array_agg(k order by k) from jsonb_object_keys(p_candidate) k) is distinct from array['id','scope','title','version']::text[]
    or jsonb_typeof(p_candidate->'id') is distinct from 'string' or (p_candidate->>'id') !~ '^[a-z0-9_-]{1,80}$'
    or jsonb_typeof(p_candidate->'version') is distinct from 'string' or (p_candidate->>'version') !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(p_candidate->'title') is distinct from 'string' or length(btrim(p_candidate->>'title')) not between 1 and 200
    or jsonb_typeof(p_candidate->'scope') is distinct from 'string' or (p_candidate->>'scope') not in ('learning_intro','practice_session') then
    raise exception using errcode='22023',message='invalid_candidate';
  end if;
end $$;
create function private.mcy_content_review_lock(p_actor uuid,p_candidate jsonb,p_expected integer,p_limited boolean) returns void
language plpgsql set search_path='' as $$
declare v private.mcy_content_review_states%rowtype;
begin
  perform private.mcy_content_review_validate(p_candidate);
  if p_expected is null or p_expected<0 then raise exception using errcode='22023',message='invalid_revision'; end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-actor:'||p_actor::text,0));
  perform pg_advisory_xact_lock(hashtextextended('mcy-content-version:'||(p_candidate->>'id')||':'||(p_candidate->>'version'),0));
  -- Recheck wall-clock expiry after a possible lock wait.
  perform private.mcy_content_review_actor(p_actor);
  if p_limited and (select count(*) from private.mcy_content_review_events where actor_id=p_actor and occurred_at>clock_timestamp()-interval '24 hours')>=20 then
    raise exception using errcode='PT429',message='content_review_limit_reached';
  end if;
  if p_limited then
    insert into private.mcy_content_review_states(candidate_id,content_version,title,scope)
      values(p_candidate->>'id',p_candidate->>'version',p_candidate->>'title',p_candidate->>'scope') on conflict do nothing;
  end if;
  select * into v from private.mcy_content_review_states where candidate_id=p_candidate->>'id' and content_version=p_candidate->>'version' for update;
  if not found then raise exception using errcode='22023',message='no_existing_review'; end if;
  if v.title<>p_candidate->>'title' or v.scope<>p_candidate->>'scope' then raise exception using errcode='22023',message='candidate_metadata_mismatch'; end if;
  if v.revision<>p_expected then raise exception using errcode='PT409',message='content_review_conflict'; end if;
end $$;

create function public.mcy_content_review_read(p_actor_id uuid,p_candidates jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r text; c jsonb; items jsonb:='[]'; teachers jsonb:='[]'; state jsonb; assignments jsonb;
begin
  r:=private.mcy_content_review_actor(p_actor_id);
  if p_candidates is null or jsonb_typeof(p_candidates)<>'array' or jsonb_array_length(p_candidates)>30 then
    raise exception using errcode='22023',message='invalid_candidates';
  end if;
  for c in select value from jsonb_array_elements(p_candidates) loop
    perform private.mcy_content_review_validate(c);
    if r='owner' or exists(select 1 from private.mcy_content_reviewer_assignments a where a.candidate_id=c->>'id'
      and a.content_version=c->>'version' and a.reviewer_id=p_actor_id and a.active and a.expires_at>clock_timestamp()) then
      select jsonb_build_object('revision',s.revision,'decision',s.decision,'reviewer_id',s.reviewer_id,
        'qualification',s.qualification,'review_basis',s.review_basis,'rights_basis',s.rights_basis,'checklist',s.checklist,'updated_at',s.updated_at)
        into state from private.mcy_content_review_states s where s.candidate_id=c->>'id' and s.content_version=c->>'version';
      select coalesce(jsonb_agg(jsonb_build_object('reviewer_id',a.reviewer_id,'active',a.active,'expires_at',a.expires_at)),'[]') into assignments
        from private.mcy_content_reviewer_assignments a where a.candidate_id=c->>'id' and a.content_version=c->>'version' and (r='owner' or a.reviewer_id=p_actor_id);
      items:=items||jsonb_build_array(jsonb_build_object('candidate_id',c->>'id','content_version',c->>'version',
        'state',coalesce(state,jsonb_build_object('revision',0,'decision','pending')),'assignments',assignments));
    end if;
  end loop;
  if r='teacher' and jsonb_array_length(items)=0 then raise exception using errcode='42501',message='content_review_access_required'; end if;
  if r='owner' then
    select coalesce(jsonb_agg(jsonb_build_object('user_id',t.user_id,'label',t.public_name)),'[]') into teachers from (
      select t.user_id,t.public_name from public.teachers t join auth.users u on u.id=t.user_id
      where t.active and u.email_confirmed_at is not null and exists(select 1 from private.role_assignments a
        where a.user_id=t.user_id and a.role='teacher' and a.scope_type='global' and a.status='active'
        and a.starts_at<=clock_timestamp() and (a.ends_at is null or a.ends_at>clock_timestamp()))
      and not exists(select 1 from private.role_assignments a where a.user_id=t.user_id and a.role='owner'
        and a.scope_type='global' and a.status='active' and a.starts_at<=clock_timestamp() and (a.ends_at is null or a.ends_at>clock_timestamp()))
      order by t.public_name,t.user_id limit 20) t;
  end if;
  return jsonb_build_object('can_assign',r='owner','default_reviewer','owner','items',items,'eligible_reviewers',teachers);
end $$;

create function public.mcy_content_review_save(p_actor_id uuid,p_candidate jsonb,p_expected_revision integer,p_decision text,
  p_qualification text,p_review_basis text,p_rights_basis text,p_checklist jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r text; c text; v private.mcy_content_review_states%rowtype; receipt jsonb;
begin
  r:=private.mcy_content_review_actor(p_actor_id);
  perform private.mcy_content_review_validate(p_candidate);
  if p_decision is null or p_decision not in ('approved','changes_requested','withdrawn')
    or p_qualification is null or length(btrim(p_qualification)) not between 10 and 1000
    or p_review_basis is null or length(btrim(p_review_basis)) not between 10 and 2000
    or p_rights_basis is null or length(btrim(p_rights_basis)) not between 10 and 2000
    or p_checklist is null or jsonb_typeof(p_checklist)<>'object'
    or (select array_agg(k order by k) from jsonb_object_keys(p_checklist) k) is distinct from
      array['accessibility','actualDurationChecked','audienceScope','contentAccuracy','expertiseConfirmed','rightsConfirmed','stopGuidance','vietnameseAudioReady']::text[] then
    raise exception using errcode='22023',message='invalid_review';
  end if;
  for c in select jsonb_object_keys(p_checklist) loop
    if jsonb_typeof(p_checklist->c)<>'boolean' then raise exception using errcode='22023',message='invalid_review'; end if;
    if p_decision='approved' and (p_checklist->c)<>'true'::jsonb
      and (p_candidate->>'scope'='practice_session' or c not in ('vietnameseAudioReady','actualDurationChecked')) then
      raise exception using errcode='22023',message='review_checks_incomplete';
    end if;
  end loop;
  perform private.mcy_content_review_lock(p_actor_id,p_candidate,p_expected_revision,p_decision<>'withdrawn');
  r:=private.mcy_content_review_actor(p_actor_id);
  if r='teacher' then
    perform 1 from private.mcy_content_reviewer_assignments a where a.candidate_id=p_candidate->>'id'
      and a.content_version=p_candidate->>'version' and a.reviewer_id=p_actor_id and a.active and a.expires_at>clock_timestamp() for share;
    if not found then raise exception using errcode='42501',message='content_review_access_required'; end if;
  end if;
  select * into strict v from private.mcy_content_review_states where candidate_id=p_candidate->>'id' and content_version=p_candidate->>'version';
  if p_decision='withdrawn' and v.decision in ('pending','withdrawn') then
    return jsonb_build_object('candidate_id',v.candidate_id,'content_version',v.content_version,'revision',v.revision,'decision',v.decision,'unchanged',true,'published',false);
  end if;
  update private.mcy_content_review_states set revision=revision+1,decision=p_decision,reviewer_id=p_actor_id,
    qualification=p_qualification,review_basis=p_review_basis,rights_basis=p_rights_basis,checklist=p_checklist,updated_at=clock_timestamp()
    where candidate_id=p_candidate->>'id' and content_version=p_candidate->>'version' returning * into strict v;
  receipt:=jsonb_build_object('candidate_id',v.candidate_id,'content_version',v.content_version,'revision',v.revision,'decision',v.decision,
    'reviewer_id',p_actor_id,'scope',v.scope,'qualification',v.qualification,'review_basis',v.review_basis,'rights_basis',v.rights_basis,
    'checklist',v.checklist,'reviewed_at',v.updated_at,'published',false);
  insert into private.mcy_content_review_events(actor_id,candidate_id,content_version,revision,kind,payload,occurred_at)
    values(p_actor_id,v.candidate_id,v.content_version,v.revision,'review',receipt,clock_timestamp());
  return receipt;
end $$;

create function public.mcy_content_reviewer_assign(p_actor_id uuid,p_candidate jsonb,p_expected_revision integer,
  p_reviewer_id uuid,p_active boolean,p_expires_in_days integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v private.mcy_content_review_states%rowtype; receipt jsonb; expiry timestamptz;
begin
  if private.mcy_content_review_actor(p_actor_id)<>'owner' then raise exception using errcode='42501',message='owner_access_required'; end if;
  if p_reviewer_id is null or p_reviewer_id=p_actor_id or p_active is null or p_expires_in_days is null or p_expires_in_days not between 1 and 30 then
    raise exception using errcode='22023',message='invalid_assignment';
  end if;
  if p_active then
    if private.mcy_content_review_actor(p_reviewer_id)<>'teacher' then raise exception using errcode='42501',message='active_teacher_required'; end if;
  elsif not exists(select 1 from auth.users where id=p_reviewer_id) then raise exception using errcode='22023',message='invalid_assignment'; end if;
  perform private.mcy_content_review_lock(p_actor_id,p_candidate,p_expected_revision,p_active);
  if private.mcy_content_review_actor(p_actor_id)<>'owner' then raise exception using errcode='42501',message='owner_access_required'; end if;
  if p_active then
    if private.mcy_content_review_actor(p_reviewer_id)<>'teacher' then raise exception using errcode='42501',message='active_teacher_required'; end if;
  else
    perform 1 from private.mcy_content_reviewer_assignments where candidate_id=p_candidate->>'id'
      and content_version=p_candidate->>'version' and reviewer_id=p_reviewer_id and active for update;
    if not found then
      return jsonb_build_object('candidate_id',p_candidate->>'id','content_version',p_candidate->>'version','revision',p_expected_revision,'unchanged',true,'published',false);
    end if;
  end if;
  expiry:=clock_timestamp()+make_interval(days=>p_expires_in_days);
  insert into private.mcy_content_reviewer_assignments(candidate_id,content_version,reviewer_id,assigned_by,active,expires_at)
    values(p_candidate->>'id',p_candidate->>'version',p_reviewer_id,p_actor_id,p_active,expiry)
    on conflict(candidate_id,content_version,reviewer_id) do update set assigned_by=excluded.assigned_by,active=excluded.active,expires_at=excluded.expires_at;
  -- Capability changes invalidate the prior decision; a new review is required.
  update private.mcy_content_review_states set revision=revision+1,decision='pending',reviewer_id=null,
    qualification=null,review_basis=null,rights_basis=null,checklist=null,updated_at=clock_timestamp()
    where candidate_id=p_candidate->>'id' and content_version=p_candidate->>'version' returning * into strict v;
  receipt:=jsonb_build_object('candidate_id',v.candidate_id,'content_version',v.content_version,'revision',v.revision,
    'decision','pending','reviewer_id',p_reviewer_id,'active',p_active,'expires_at',expiry,'published',false);
  insert into private.mcy_content_review_events(actor_id,candidate_id,content_version,revision,kind,payload,occurred_at)
    values(p_actor_id,v.candidate_id,v.content_version,v.revision,'assignment',receipt,clock_timestamp());
  return receipt;
end $$;

revoke all on function private.mcy_content_review_actor(uuid),private.mcy_content_review_validate(jsonb),
  private.mcy_content_review_lock(uuid,jsonb,integer,boolean) from public,anon,authenticated,service_role;
revoke all on function public.mcy_content_review_read(uuid,jsonb),public.mcy_content_review_save(uuid,jsonb,integer,text,text,text,text,jsonb),
  public.mcy_content_reviewer_assign(uuid,jsonb,integer,uuid,boolean,integer) from public,anon,authenticated;
grant execute on function public.mcy_content_review_read(uuid,jsonb),public.mcy_content_review_save(uuid,jsonb,integer,text,text,text,text,jsonb),
  public.mcy_content_reviewer_assign(uuid,jsonb,integer,uuid,boolean,integer) to service_role;
