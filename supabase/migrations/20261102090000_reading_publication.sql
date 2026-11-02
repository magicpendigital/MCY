-- Learner-visible switch for approved reading units. Approval (mcy_content_review_states) never publishes by itself:
-- a unit reaches learners only when it is approved at its exact content version, a reviewer switched it on here, and the
-- Edge function's content/image rules pass. Everything here is private; only the owner-control-plane (service_role)
-- calls the RPCs, which re-check the verified Owner/assigned-teacher actor. Expand-only; no existing table is changed.
create table private.mcy_reading_publication (
  candidate_id text not null, content_version text not null,
  visible boolean not null default false,
  -- null = follow the Owner's default; true/false = per-unit override for units that still lack images.
  text_only_allowed boolean,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(candidate_id,content_version),
  foreign key(candidate_id,content_version) references private.mcy_content_review_states(candidate_id,content_version),
  check(candidate_id ~ '^reading-[a-z0-9-]{1,72}$')
);
create table private.mcy_reading_publication_defaults (
  singleton boolean primary key default true check(singleton),
  text_only_allowed boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into private.mcy_reading_publication_defaults default values;
create table private.mcy_reading_publication_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null check(kind in ('unit','default')),
  candidate_id text, content_version text,
  payload jsonb not null, occurred_at timestamptz not null default now()
);
create index mcy_reading_publication_actor_time on private.mcy_reading_publication_events(actor_id,occurred_at desc);
alter table private.mcy_reading_publication enable row level security;
alter table private.mcy_reading_publication_defaults enable row level security;
alter table private.mcy_reading_publication_events enable row level security;
revoke all on private.mcy_reading_publication,private.mcy_reading_publication_defaults,private.mcy_reading_publication_events
  from public,anon,authenticated,service_role;

-- Whole-library snapshot used to rebuild the public manifest. Returns identifiers and switches only, never review text.
create function public.mcy_reading_publication_snapshot(p_actor_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r text;
begin
  r:=private.mcy_content_review_actor(p_actor_id);
  return jsonb_build_object('role',r,
    'default_text_only_allowed',(select d.text_only_allowed from private.mcy_reading_publication_defaults d where d.singleton),
    -- reviewed_at lets the caller require that the switch was set after the latest review, so a new review hides a unit until re-enabled.
    'approved',coalesce((select jsonb_agg(jsonb_build_object('candidate_id',s.candidate_id,'content_version',s.content_version,'reviewed_at',s.updated_at) order by s.candidate_id)
      from private.mcy_content_review_states s where s.scope='learning_reading' and s.decision='approved'),'[]'::jsonb),
    'rows',coalesce((select jsonb_agg(jsonb_build_object('candidate_id',p.candidate_id,'content_version',p.content_version,
      'visible',p.visible,'text_only_allowed',p.text_only_allowed,'updated_at',p.updated_at) order by p.candidate_id)
      from private.mcy_reading_publication p),'[]'::jsonb));
end $$;

-- p_text_only_mode: 'inherit' follows the Owner default, 'allow' shows the unit without images, 'require' holds it until images are complete.
create function public.mcy_reading_publication_set(p_actor_id uuid,p_candidate jsonb,p_visible boolean,p_text_only_mode text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r text; v private.mcy_content_review_states%rowtype; cur private.mcy_reading_publication%rowtype;
  mode_value boolean; receipt jsonb; had boolean;
begin
  r:=private.mcy_content_review_actor(p_actor_id);
  perform private.mcy_content_review_validate(p_candidate);
  if p_candidate->>'scope'<>'learning_reading' or p_visible is null or p_text_only_mode is null
    or p_text_only_mode not in ('inherit','allow','require') then
    raise exception using errcode='22023',message='invalid_publication';
  end if;
  mode_value:=case p_text_only_mode when 'allow' then true when 'require' then false else null end;
  perform pg_advisory_xact_lock(hashtextextended('mcy-reading-publication',0));
  r:=private.mcy_content_review_actor(p_actor_id);
  if (select count(*) from private.mcy_reading_publication_events where actor_id=p_actor_id and occurred_at>clock_timestamp()-interval '24 hours')>=200 then
    raise exception using errcode='PT429',message='reading_publication_limit_reached';
  end if;
  if r='teacher' then
    perform 1 from private.mcy_content_reviewer_assignments a where a.candidate_id=p_candidate->>'id'
      and a.content_version=p_candidate->>'version' and a.reviewer_id=p_actor_id and a.active and a.expires_at>clock_timestamp() for share;
    if not found then raise exception using errcode='42501',message='content_review_access_required'; end if;
  end if;
  select * into v from private.mcy_content_review_states where candidate_id=p_candidate->>'id' and content_version=p_candidate->>'version' for share;
  if not found then raise exception using errcode='22023',message='no_existing_review'; end if;
  if v.title<>p_candidate->>'title' or v.scope<>p_candidate->>'scope' then raise exception using errcode='22023',message='candidate_metadata_mismatch'; end if;
  if p_visible and v.decision<>'approved' then raise exception using errcode='22023',message='unit_not_approved'; end if;
  select * into cur from private.mcy_reading_publication where candidate_id=v.candidate_id and content_version=v.content_version for update;
  had:=found;
  if had and cur.visible=p_visible and cur.text_only_allowed is not distinct from mode_value then
    return jsonb_build_object('candidate_id',v.candidate_id,'content_version',v.content_version,'visible',cur.visible,'text_only_allowed',cur.text_only_allowed,'unchanged',true);
  end if;
  insert into private.mcy_reading_publication(candidate_id,content_version,visible,text_only_allowed,updated_by,updated_at)
    values(v.candidate_id,v.content_version,p_visible,mode_value,p_actor_id,clock_timestamp())
    on conflict(candidate_id,content_version) do update set visible=excluded.visible,text_only_allowed=excluded.text_only_allowed,
      updated_by=excluded.updated_by,updated_at=excluded.updated_at;
  receipt:=jsonb_build_object('candidate_id',v.candidate_id,'content_version',v.content_version,'visible',p_visible,'text_only_allowed',mode_value,'unchanged',false);
  insert into private.mcy_reading_publication_events(actor_id,kind,candidate_id,content_version,payload,occurred_at)
    values(p_actor_id,'unit',v.candidate_id,v.content_version,receipt,clock_timestamp());
  return receipt;
end $$;

create function public.mcy_reading_publication_set_default(p_actor_id uuid,p_text_only_allowed boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare cur boolean; receipt jsonb;
begin
  if private.mcy_content_review_actor(p_actor_id)<>'owner' then raise exception using errcode='42501',message='owner_access_required'; end if;
  if p_text_only_allowed is null then raise exception using errcode='22023',message='invalid_publication'; end if;
  perform pg_advisory_xact_lock(hashtextextended('mcy-reading-publication',0));
  if private.mcy_content_review_actor(p_actor_id)<>'owner' then raise exception using errcode='42501',message='owner_access_required'; end if;
  if (select count(*) from private.mcy_reading_publication_events where actor_id=p_actor_id and occurred_at>clock_timestamp()-interval '24 hours')>=200 then
    raise exception using errcode='PT429',message='reading_publication_limit_reached';
  end if;
  select text_only_allowed into strict cur from private.mcy_reading_publication_defaults where singleton for update;
  if cur=p_text_only_allowed then return jsonb_build_object('default_text_only_allowed',cur,'unchanged',true); end if;
  update private.mcy_reading_publication_defaults set text_only_allowed=p_text_only_allowed,updated_by=p_actor_id,updated_at=clock_timestamp() where singleton;
  receipt:=jsonb_build_object('default_text_only_allowed',p_text_only_allowed,'unchanged',false);
  insert into private.mcy_reading_publication_events(actor_id,kind,payload,occurred_at) values(p_actor_id,'default',receipt,clock_timestamp());
  return receipt;
end $$;

revoke all on function public.mcy_reading_publication_snapshot(uuid),public.mcy_reading_publication_set(uuid,jsonb,boolean,text),
  public.mcy_reading_publication_set_default(uuid,boolean) from public,anon,authenticated;
grant execute on function public.mcy_reading_publication_snapshot(uuid),public.mcy_reading_publication_set(uuid,jsonb,boolean,text),
  public.mcy_reading_publication_set_default(uuid,boolean) to service_role;

-- Public bucket for the images and JSON of units that are currently switched on. It deliberately has no storage.objects
-- policy, so only the service role can write; anyone can read an object by its exact path. Images are named <sha256>.webp.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reading-published', 'reading-published', true, 1048576, array['image/webp','application/json'])
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from storage.buckets where id = 'reading-published' and public and file_size_limit = 1048576
      and allowed_mime_types @> array['image/webp','application/json']::text[] and allowed_mime_types <@ array['image/webp','application/json']::text[]) then
    raise exception 'reading-published must be a public bucket limited to webp and json' using errcode = '42501';
  end if;
end $$;
