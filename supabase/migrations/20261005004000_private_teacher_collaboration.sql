-- Local candidate only. No live application, enrollment, invitations or publication.
begin;
create table private.mcy_collaboration_members (
  user_id uuid primary key references auth.users(id),
  role text not null check (role in ('author','reviewer','admin','learner')),
  status text not null default 'active' check (status in ('active','revoked')),
  expert_verified boolean not null default false,
  qualification_basis text check(length(qualification_basis)<=1000),
  created_at timestamptz not null default now()
);
create table private.mcy_collaboration_profiles (
  user_id uuid primary key references private.mcy_collaboration_members(user_id),
  display_name text not null check(length(display_name) between 1 and 120),
  bio text not null default '' check(length(bio)<=2000),
  updated_at timestamptz not null default now()
);
create table private.mcy_collaboration_documents (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references auth.users(id),
  kind text not null check(kind in ('lesson','course')), current_version_id uuid,
  published_version_id uuid, created_at timestamptz not null default now()
);
create table private.mcy_collaboration_versions (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references private.mcy_collaboration_documents(id),
  author_id uuid not null references auth.users(id), version_no integer not null check(version_no>0),
  payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=50000),
  created_at timestamptz not null default now(), unique(document_id,version_no)
);
alter table private.mcy_collaboration_documents add foreign key(current_version_id) references private.mcy_collaboration_versions(id);
alter table private.mcy_collaboration_documents add foreign key(published_version_id) references private.mcy_collaboration_versions(id);
create table private.mcy_collaboration_states (
  version_id uuid primary key references private.mcy_collaboration_versions(id),
  status text not null default 'draft' check(status in ('draft','submitted','changes_requested','approved','withdrawn','superseded')),
  reviewer_id uuid references auth.users(id)
);
create table private.mcy_collaboration_reviews (
  id uuid primary key default gen_random_uuid(), version_id uuid not null references private.mcy_collaboration_versions(id),
  reviewer_id uuid not null references auth.users(id), decision text not null check(decision in ('approved','changes_requested')),
  message text not null check(length(message) between 1 and 4000), created_at timestamptz not null default now()
);
create table private.mcy_collaboration_invite_requests (
  id uuid primary key default gen_random_uuid(), actor_id uuid not null references auth.users(id),
  email text not null check(length(email)<=254), reason text not null check(length(reason) between 1 and 1000),
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create unique index mcy_one_pending_invite on private.mcy_collaboration_invite_requests(lower(email)) where status='pending';
create table private.mcy_collaboration_enrollments (
  id uuid primary key default gen_random_uuid(), learner_id uuid not null references auth.users(id),
  teacher_id uuid not null references auth.users(id), course_version_id uuid not null references private.mcy_collaboration_versions(id),
  learner_label text not null check(length(learner_label) between 1 and 120),
  status text not null check(status in ('active','revoked')), assignment_generation integer not null default 1,
  completed_at timestamptz, created_at timestamptz not null default now()
);
create table private.mcy_collaboration_attendance (
  id uuid primary key default gen_random_uuid(), enrollment_id uuid not null references private.mcy_collaboration_enrollments(id),
  lesson_version_id uuid not null references private.mcy_collaboration_versions(id),
  assignment_generation integer not null, completed_at timestamptz not null default now()
);
create table private.mcy_collaboration_feedback (
  id uuid primary key default gen_random_uuid(), enrollment_id uuid not null references private.mcy_collaboration_enrollments(id),
  attendance_id uuid references private.mcy_collaboration_attendance(id), kind text not null check(kind in ('session','course')),
  teacher_id uuid not null references auth.users(id), assignment_generation integer not null,
  current_revision integer not null default 0,
  check((kind='session' and attendance_id is not null) or (kind='course' and attendance_id is null))
);
create unique index mcy_feedback_subject on private.mcy_collaboration_feedback(enrollment_id,kind,coalesce(attendance_id,'00000000-0000-0000-0000-000000000000'::uuid),assignment_generation);
create table private.mcy_collaboration_feedback_versions (
  feedback_id uuid not null references private.mcy_collaboration_feedback(id), revision integer not null,
  teacher_id uuid not null references auth.users(id), body text not null check(length(body) between 1 and 4000),
  provenance text not null check(provenance in ('human','ai_assisted_teacher_confirmed')),
  created_at timestamptz not null default now(), primary key(feedback_id,revision)
);
create table private.mcy_collaboration_feedback_sends (
  feedback_id uuid not null, revision integer not null, actor_id uuid not null references auth.users(id),
  idempotency_key uuid not null unique, sent_at timestamptz not null default now(),
  primary key(feedback_id,revision), foreign key(feedback_id,revision) references private.mcy_collaboration_feedback_versions(feedback_id,revision)
);
create table private.mcy_collaboration_audit (
  id uuid primary key default gen_random_uuid(), actor_id uuid not null references auth.users(id),
  action text not null, object_id uuid, created_at timestamptz not null default now()
);
-- No publication action exists. Retrieval remains closed even for approved content.
create table private.mcy_collaboration_settings(id boolean primary key default true check(id), publication_enabled boolean not null default false);
insert into private.mcy_collaboration_settings(id) values(true);

create function private.mcy_collaboration_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception using errcode='42501',message='immutable_snapshot'; end $$;
create trigger mcy_content_immutable before update or delete on private.mcy_collaboration_versions for each row execute function private.mcy_collaboration_immutable();
create trigger mcy_review_immutable before update or delete on private.mcy_collaboration_reviews for each row execute function private.mcy_collaboration_immutable();
create trigger mcy_feedback_immutable before update or delete on private.mcy_collaboration_feedback_versions for each row execute function private.mcy_collaboration_immutable();
create trigger mcy_send_immutable before update or delete on private.mcy_collaboration_feedback_sends for each row execute function private.mcy_collaboration_immutable();
create trigger mcy_audit_immutable before update or delete on private.mcy_collaboration_audit for each row execute function private.mcy_collaboration_immutable();

create function private.mcy_collaboration_role(p_actor uuid) returns text language plpgsql set search_path='' as $$
declare r text;
begin
 select role into r from private.mcy_collaboration_members where user_id=p_actor and status='active' for share;
 if r is null then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
 if r<>'learner' and not exists(select 1 from private.role_assignments a where a.user_id=p_actor and a.status='active'
   and a.scope_type='global' and a.starts_at<=now() and (a.ends_at is null or a.ends_at>now())
   and a.role::text=case r when 'author' then 'teacher' when 'reviewer' then 'content_reviewer' else 'owner' end)
 then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
 if r='author' and not exists(select 1 from public.teachers where user_id=p_actor and active)
 then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
 return r;
end $$;
create function private.mcy_collaboration_approved(p_version uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from private.mcy_collaboration_versions v
 join private.mcy_collaboration_documents d on d.id=v.document_id
 join private.mcy_collaboration_states s on s.version_id=v.id
 join private.mcy_collaboration_members m on m.user_id=s.reviewer_id and m.status='active' and m.role='reviewer' and m.expert_verified
 where v.id=p_version and s.status='approved' and s.reviewer_id<>v.author_id
 and exists(select 1 from private.role_assignments a where a.user_id=m.user_id and a.role::text='content_reviewer'
 and a.status='active' and a.scope_type='global' and a.starts_at<=now() and (a.ends_at is null or a.ends_at>now()))
 and not exists(select 1 from private.mcy_collaboration_states x join private.mcy_collaboration_versions vx on vx.id=x.version_id where vx.document_id=d.id and x.status='withdrawn'));
$$;
create function private.mcy_collaboration_course_approved(p_version uuid) returns boolean language sql stable set search_path='' as $$
 select private.mcy_collaboration_approved(p_version) and exists(select 1 from private.mcy_collaboration_versions v
 join private.mcy_collaboration_documents d on d.id=v.document_id where v.id=p_version and d.kind='course'
 and jsonb_array_length(v.payload->'lesson_version_ids')>0
 and not exists(select 1 from jsonb_array_elements_text(v.payload->'lesson_version_ids') item
 where not private.mcy_collaboration_approved(item::uuid)));
$$;

create function public.mcy_collaboration_dispatch(p_actor_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r text; d private.mcy_collaboration_documents%rowtype; v private.mcy_collaboration_versions%rowtype;
 e private.mcy_collaboration_enrollments%rowtype; f private.mcy_collaboration_feedback%rowtype;
 a private.mcy_collaboration_attendance%rowtype; result jsonb; vid uuid; key_id uuid; target uuid; n integer; item text; decision text;
begin
 r:=private.mcy_collaboration_role(p_actor_id);
 if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>55000
 or p_payload ?| array['actor_id','user_id','role','expert_verified','publish','publication_enabled']
 then raise exception using errcode='22023',message='invalid_collaboration_request'; end if;

 if p_action='workspace' then
  select jsonb_build_object('role',r,'profile',(select to_jsonb(p)-'user_id' from private.mcy_collaboration_profiles p where p.user_id=p_actor_id),
   'documents',coalesce((select jsonb_agg(jsonb_build_object('id',dd.id,'kind',dd.kind,'author_id',dd.author_id,'version_id',vv.id,'version_no',vv.version_no,'title',vv.payload->>'title','status',ss.status))
    from private.mcy_collaboration_documents dd join private.mcy_collaboration_versions vv on vv.id=dd.current_version_id join private.mcy_collaboration_states ss on ss.version_id=vv.id
    where dd.author_id=p_actor_id or (r='reviewer' and ss.reviewer_id=p_actor_id and ss.status='submitted') or r='admin'),'[]'::jsonb),
   'enrollments',coalesce((select jsonb_agg(jsonb_build_object('id',ee.id,'learner_label',ee.learner_label,'course_version_id',ee.course_version_id,'completed',ee.completed_at is not null,
    'sessions',(select coalesce(jsonb_agg(jsonb_build_object('id',aa.id,'lesson_version_id',aa.lesson_version_id)),'[]'::jsonb) from private.mcy_collaboration_attendance aa where aa.enrollment_id=ee.id and aa.assignment_generation=ee.assignment_generation)))
    from private.mcy_collaboration_enrollments ee where ee.status='active' and ((r='author' and ee.teacher_id=p_actor_id) or (r='learner' and ee.learner_id=p_actor_id))),'[]'::jsonb)) into result;
  return result;
 elsif p_action='save_profile' then
  if length(trim(p_payload->>'display_name')) not between 1 and 120 or length(coalesce(p_payload->>'bio',''))>2000 or p_payload->>'display_name' is null then raise exception using errcode='22023',message='invalid_profile'; end if;
  insert into private.mcy_collaboration_profiles(user_id,display_name,bio) values(p_actor_id,trim(p_payload->>'display_name'),coalesce(p_payload->>'bio',''))
  on conflict(user_id) do update set display_name=excluded.display_name,bio=excluded.bio,updated_at=now();
  result:=jsonb_build_object('saved',true);
 elsif p_action='invite_request' then
  if r<>'author' then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  if (p_payload->>'email') is null or (p_payload->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(p_payload->>'email')>254
   or coalesce(length(trim(p_payload->>'reason')),0) not between 1 and 1000 then raise exception using errcode='22023',message='invalid_invite_request'; end if;
  if (select count(*) from private.mcy_collaboration_invite_requests where actor_id=p_actor_id and created_at>now()-interval '1 day')>=5 then raise exception using errcode='54000',message='collaboration_limit'; end if;
  insert into private.mcy_collaboration_invite_requests(actor_id,email,reason) values(p_actor_id,lower(trim(p_payload->>'email')),trim(p_payload->>'reason')) returning jsonb_build_object('id',id,'status',status) into result;
 elsif p_action='admit_member' then
  if r<>'admin' or coalesce(p_payload->>'member_role','') not in ('author','reviewer','learner')
   or not exists(select 1 from auth.users where id=(p_payload->>'member_id')::uuid and email_confirmed_at is not null)
  then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  if p_payload->>'member_role'<>'learner' and not exists(select 1 from private.role_assignments ra where ra.user_id=(p_payload->>'member_id')::uuid
   and ra.role::text=case p_payload->>'member_role' when 'author' then 'teacher' else 'content_reviewer' end
   and ra.status='active' and ra.scope_type='global' and ra.starts_at<=now() and (ra.ends_at is null or ra.ends_at>now()))
  then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  if p_payload->>'member_role'='author' and not exists(select 1 from public.teachers where user_id=(p_payload->>'member_id')::uuid and active)
   then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  if p_payload->>'member_role'='reviewer' and (p_payload->'expert_confirmed' is distinct from 'true'::jsonb
   or coalesce(length(trim(p_payload->>'qualification_basis')),0) not between 1 and 1000)
  then raise exception using errcode='42501',message='expert_confirmation_required'; end if;
  if exists(select 1 from private.mcy_collaboration_members where user_id=(p_payload->>'member_id')::uuid and (role<>p_payload->>'member_role' or status<>'active'))
  then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
  insert into private.mcy_collaboration_members(user_id,role,expert_verified,qualification_basis)
   values((p_payload->>'member_id')::uuid,p_payload->>'member_role',p_payload->>'member_role'='reviewer',p_payload->>'qualification_basis')
   on conflict(user_id) do nothing;
  target:=(p_payload->>'member_id')::uuid;result:=jsonb_build_object('admitted',true);
 elsif p_action='admin_report' then
  if r<>'admin' then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  return jsonb_build_object('members',(select coalesce(jsonb_agg(to_jsonb(m)),'[]'::jsonb) from private.mcy_collaboration_members m),
   'invite_requests',(select coalesce(jsonb_agg(to_jsonb(q)),'[]'::jsonb) from private.mcy_collaboration_invite_requests q where q.status='pending'),
   'audit',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from(select action,object_id,created_at from private.mcy_collaboration_audit order by created_at desc limit 100)x));
 elsif p_action='revoke_member' then
  if r<>'admin' or (p_payload->>'member_id')::uuid=p_actor_id then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  update private.mcy_collaboration_members set status='revoked' where user_id=(p_payload->>'member_id')::uuid;
  target:=(p_payload->>'member_id')::uuid; result:=jsonb_build_object('revoked',true);
 elsif p_action='decide_invite_request' then
  if r<>'admin' or coalesce(p_payload->>'decision','') not in ('approved','rejected') then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  update private.mcy_collaboration_invite_requests set status=p_payload->>'decision' where id=(p_payload->>'request_id')::uuid and status='pending' returning id into target;
  if target is null then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
  result:=jsonb_build_object('status',p_payload->>'decision','invitation_sent',false);
 elsif p_action in ('read_document','save_document','submit_document','withdraw_document','assign_reviewer','review_document') then
  target:=(p_payload->>'document_id')::uuid;
  if target is not null then
   select * into d from private.mcy_collaboration_documents where id=target for update;
   if d.id is null then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
   select * into v from private.mcy_collaboration_versions where id=d.current_version_id;
   if not (d.author_id=p_actor_id and r='author') and not(r='admin' and p_action='assign_reviewer')
    and not(r='reviewer' and p_action in ('read_document','review_document') and exists(select 1 from private.mcy_collaboration_states where version_id=v.id and reviewer_id=p_actor_id and status='submitted'))
   then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  elsif p_action<>'save_document' or r<>'author' then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  if p_action='read_document' then
   return jsonb_build_object('document_id',d.id,'kind',d.kind,'version_id',v.id,'version_no',v.version_no,'payload',v.payload,
    'status',(select status from private.mcy_collaboration_states where version_id=v.id),
    'pinned_lessons',coalesce((select jsonb_agg(jsonb_build_object('version_id',pv.id,'version_no',pv.version_no,'payload',pv.payload))
     from private.mcy_collaboration_versions pv join private.mcy_collaboration_documents pd on pd.id=pv.document_id
     where d.kind='course' and pd.kind='lesson' and v.payload->'lesson_version_ids' @> jsonb_build_array(pv.id::text)
     and (r='author' or private.mcy_collaboration_approved(pv.id))),'[]'::jsonb),
    'history',(select jsonb_agg(jsonb_build_object('version_id',h.id,'version_no',h.version_no,'author_id',h.author_id,'created_at',h.created_at,'status',s.status)) from private.mcy_collaboration_versions h join private.mcy_collaboration_states s on s.version_id=h.id where h.document_id=d.id and (r='author' or h.id=v.id)),
    'reviews',(select coalesce(jsonb_agg(to_jsonb(rr)),'[]'::jsonb) from private.mcy_collaboration_reviews rr join private.mcy_collaboration_versions rv on rv.id=rr.version_id where rv.document_id=d.id and (r='author' or rv.id=v.id)));
  end if;
  if d.id is not null and ((p_payload->>'expected_version')::integer is distinct from v.version_no) then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
  if p_action='save_document' then
   if exists(select 1 from private.mcy_collaboration_states ws join private.mcy_collaboration_versions wv on wv.id=ws.version_id where wv.document_id=d.id and ws.status='withdrawn')
   then raise exception using errcode='42501',message='document_withdrawn'; end if;
   if p_payload->>'kind' is null or (p_payload->>'kind') not in ('lesson','course') or (d.id is not null and d.kind<>p_payload->>'kind')
    or jsonb_typeof(p_payload->'content') is distinct from 'object' or coalesce(length(trim(p_payload->'content'->>'title')),0) not between 1 and 120
    or octet_length((p_payload->'content')::text)>50000 then raise exception using errcode='22023',message='invalid_document'; end if;
   if (select count(*) from private.mcy_collaboration_versions where author_id=p_actor_id and created_at>now()-interval '1 day')>=100 then raise exception using errcode='54000',message='collaboration_limit'; end if;
   if p_payload->>'kind'='lesson' then
    if jsonb_typeof(p_payload->'content'->'segments') is distinct from 'array' or jsonb_array_length(p_payload->'content'->'segments') not between 1 and 40 then raise exception using errcode='22023',message='invalid_lesson'; end if;
    if exists(select 1 from jsonb_array_elements(p_payload->'content'->'segments') segment where jsonb_typeof(segment) is distinct from 'object'
     or coalesce(length(trim(segment->>'instruction')),0) not between 1 and 12000 or coalesce(length(segment->>'stop_cue'),0)>2000)
    then raise exception using errcode='22023',message='invalid_lesson'; end if;
   else
    if jsonb_typeof(p_payload->'content'->'lesson_version_ids') is distinct from 'array' or jsonb_array_length(p_payload->'content'->'lesson_version_ids') not between 1 and 40 then raise exception using errcode='22023',message='invalid_course'; end if;
    for item in select jsonb_array_elements_text(p_payload->'content'->'lesson_version_ids') loop
     if not exists(select 1 from private.mcy_collaboration_versions cv join private.mcy_collaboration_documents cd on cd.id=cv.document_id where cv.id=item::uuid and cd.author_id=p_actor_id and cd.kind='lesson') then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
    end loop;
   end if;
   if d.id is null then insert into private.mcy_collaboration_documents(author_id,kind) values(p_actor_id,p_payload->>'kind') returning * into d; end if;
   if exists(select 1 from private.mcy_collaboration_states where version_id=v.id and status='submitted') then update private.mcy_collaboration_states set status='superseded' where version_id=v.id; end if;
   n:=coalesce(v.version_no,0)+1;
   insert into private.mcy_collaboration_versions(document_id,author_id,version_no,payload) values(d.id,p_actor_id,n,p_payload->'content') returning id into vid;
   insert into private.mcy_collaboration_states(version_id) values(vid);
   update private.mcy_collaboration_documents set current_version_id=vid where id=d.id;
   result:=jsonb_build_object('document_id',d.id,'version_id',vid,'version_no',n); target:=d.id;
  elsif p_action='submit_document' then
   update private.mcy_collaboration_states set status='submitted',reviewer_id=null where version_id=v.id and status in ('draft','changes_requested');
   if not found then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
   result:=jsonb_build_object('status','submitted');
  elsif p_action='withdraw_document' then
   update private.mcy_collaboration_states set status='withdrawn' where version_id in(select id from private.mcy_collaboration_versions where document_id=d.id);
   update private.mcy_collaboration_documents set published_version_id=null where id=d.id;
   result:=jsonb_build_object('status','withdrawn');
  elsif p_action='assign_reviewer' then
   if r<>'admin' or not exists(select 1 from private.mcy_collaboration_members m where m.user_id=(p_payload->>'reviewer_id')::uuid and m.role='reviewer' and m.status='active' and m.expert_verified and m.user_id<>d.author_id)
    or private.mcy_collaboration_role((p_payload->>'reviewer_id')::uuid)<>'reviewer' then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
   update private.mcy_collaboration_states set reviewer_id=(p_payload->>'reviewer_id')::uuid where version_id=v.id and status='submitted';
   if not found then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
   result:=jsonb_build_object('assigned',true);
  else
   decision:=p_payload->>'decision';
   if r<>'reviewer' or not exists(select 1 from private.mcy_collaboration_members where user_id=p_actor_id and expert_verified)
    or coalesce(decision,'') not in ('approved','changes_requested') or coalesce(length(trim(p_payload->>'message')),0) not between 1 and 4000 then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
   if decision='approved' and d.kind='course' then
    for item in select jsonb_array_elements_text(v.payload->'lesson_version_ids') loop
     if not private.mcy_collaboration_approved(item::uuid) then raise exception using errcode='42501',message='course_children_unapproved'; end if;
    end loop;
   end if;
   insert into private.mcy_collaboration_reviews(version_id,reviewer_id,decision,message) values(v.id,p_actor_id,decision,trim(p_payload->>'message'));
   update private.mcy_collaboration_states set status=decision where version_id=v.id;
   result:=jsonb_build_object('status',decision);
  end if;
 elsif p_action='approved_catalog' then
  if r<>'learner' then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('version_id',catalog_v.id,'kind',catalog_d.kind,'payload',catalog_v.payload)) from private.mcy_collaboration_documents catalog_d
   join private.mcy_collaboration_versions catalog_v on catalog_v.id=catalog_d.published_version_id
   where (select publication_enabled from private.mcy_collaboration_settings where id)
   and private.mcy_collaboration_approved(catalog_v.id) and (catalog_d.kind='lesson' or private.mcy_collaboration_course_approved(catalog_v.id))
   and exists(select 1 from private.mcy_collaboration_enrollments catalog_e join private.mcy_collaboration_versions cv on cv.id=catalog_e.course_version_id where catalog_e.learner_id=p_actor_id and catalog_e.status='active'
    and private.mcy_collaboration_course_approved(catalog_e.course_version_id)
    and (catalog_e.course_version_id=catalog_v.id or cv.payload->'lesson_version_ids' @> jsonb_build_array(catalog_v.id::text)))),'[]'::jsonb);
 elsif p_action in ('admin_enrollment','admin_completion') then
  if r<>'admin' then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  target:=(p_payload->>'enrollment_id')::uuid;
  if target is not null then select * into e from private.mcy_collaboration_enrollments where id=target for update; end if;
  if p_action='admin_enrollment' then
   if not private.mcy_collaboration_course_approved((p_payload->>'course_version_id')::uuid)
    or private.mcy_collaboration_role((p_payload->>'teacher_id')::uuid)<>'author'
    or private.mcy_collaboration_role((p_payload->>'learner_id')::uuid)<>'learner'
    or coalesce(p_payload->>'status','') not in ('active','revoked') then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
   if target is null then
    insert into private.mcy_collaboration_enrollments(teacher_id,learner_id,learner_label,course_version_id,status)
    values((p_payload->>'teacher_id')::uuid,(p_payload->>'learner_id')::uuid,p_payload->>'learner_label',(p_payload->>'course_version_id')::uuid,p_payload->>'status') returning * into e;
   else
    if e.id is null or e.assignment_generation is distinct from (p_payload->>'expected_generation')::integer then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
    update private.mcy_collaboration_enrollments set teacher_id=(p_payload->>'teacher_id')::uuid,learner_id=(p_payload->>'learner_id')::uuid,
      learner_label=p_payload->>'learner_label',course_version_id=(p_payload->>'course_version_id')::uuid,status=p_payload->>'status',assignment_generation=assignment_generation+1,completed_at=null where id=e.id returning * into e;
   end if;
   result:=jsonb_build_object('id',e.id,'assignment_generation',e.assignment_generation);target:=e.id;
  else
   if e.id is null or e.status<>'active' or e.assignment_generation is distinct from (p_payload->>'expected_generation')::integer
    or not private.mcy_collaboration_course_approved(e.course_version_id) then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
   if p_payload->>'kind'='course' then update private.mcy_collaboration_enrollments set completed_at=now() where id=e.id; result:=jsonb_build_object('completed',true);
   elsif p_payload->>'kind'='session' then
    if not exists(select 1 from private.mcy_collaboration_versions where id=e.course_version_id and payload->'lesson_version_ids' @> jsonb_build_array(p_payload->>'lesson_version_id')) then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
    insert into private.mcy_collaboration_attendance(enrollment_id,lesson_version_id,assignment_generation) values(e.id,(p_payload->>'lesson_version_id')::uuid,e.assignment_generation) returning jsonb_build_object('attendance_id',id) into result;
   else raise exception using errcode='22023',message='invalid_completion'; end if;
  end if;
 elsif p_action in ('read_feedback','save_feedback','send_feedback') then
  select * into e from private.mcy_collaboration_enrollments where id=(p_payload->>'enrollment_id')::uuid for update;
  if e.id is null or e.status<>'active' or not((r='author' and e.teacher_id=p_actor_id) or (r='learner' and e.learner_id=p_actor_id and p_action='read_feedback'))
   or not private.mcy_collaboration_course_approved(e.course_version_id) then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
  target:=e.id;
  if p_action='read_feedback' then
   return coalesce((select jsonb_agg(jsonb_build_object('id',ff.id,'kind',ff.kind,'attendance_id',ff.attendance_id,'revision',fv.revision,'teacher_id',fv.teacher_id,
    'body',fv.body,'provenance',fv.provenance,'created_at',fv.created_at,'sent_at',ss.sent_at))
    from private.mcy_collaboration_feedback ff join private.mcy_collaboration_feedback_versions fv on fv.feedback_id=ff.id
    left join private.mcy_collaboration_feedback_sends ss on ss.feedback_id=fv.feedback_id and ss.revision=fv.revision
    where ff.enrollment_id=e.id and ff.assignment_generation=e.assignment_generation and ((r='author' and ff.teacher_id=p_actor_id) or ss.sent_at is not null)),'[]'::jsonb);
  end if;
  if p_action='save_feedback' then
   if (select count(*) from private.mcy_collaboration_feedback_versions where teacher_id=p_actor_id and created_at>now()-interval '1 day')>=100 then raise exception using errcode='54000',message='collaboration_limit'; end if;
   if coalesce(p_payload->>'kind','') not in ('session','course') or coalesce(length(trim(p_payload->>'body')),0) not between 1 and 4000
    or coalesce(p_payload->>'provenance','') not in ('human','ai_assisted_teacher_confirmed')
    or (p_payload->>'provenance'='ai_assisted_teacher_confirmed' and p_payload->'teacher_confirmed' is distinct from 'true'::jsonb) then raise exception using errcode='22023',message='invalid_feedback'; end if;
   if p_payload->>'kind'='session' then
    select * into a from private.mcy_collaboration_attendance where id=(p_payload->>'attendance_id')::uuid;
    if a.id is null or a.enrollment_id<>e.id or a.assignment_generation<>e.assignment_generation
     or not exists(select 1 from private.mcy_collaboration_versions where id=e.course_version_id and payload->'lesson_version_ids' @> jsonb_build_array(a.lesson_version_id::text)) then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
   elsif e.completed_at is null or p_payload->>'attendance_id' is not null then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
   select * into f from private.mcy_collaboration_feedback where enrollment_id=e.id and kind=p_payload->>'kind' and attendance_id is not distinct from a.id and assignment_generation=e.assignment_generation for update;
   if coalesce(f.current_revision,0) is distinct from (p_payload->>'expected_revision')::integer then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
   if f.id is null then insert into private.mcy_collaboration_feedback(enrollment_id,attendance_id,kind,teacher_id,assignment_generation) values(e.id,a.id,p_payload->>'kind',p_actor_id,e.assignment_generation) returning * into f; end if;
   n:=f.current_revision+1;
   insert into private.mcy_collaboration_feedback_versions(feedback_id,revision,teacher_id,body,provenance) values(f.id,n,p_actor_id,trim(p_payload->>'body'),p_payload->>'provenance');
   update private.mcy_collaboration_feedback set current_revision=n where id=f.id;
   result:=jsonb_build_object('id',f.id,'revision',n,'sent',false);
  else
   select * into f from private.mcy_collaboration_feedback where id=(p_payload->>'feedback_id')::uuid for update;
   if f.id is null or f.enrollment_id<>e.id or f.teacher_id<>p_actor_id or f.assignment_generation<>e.assignment_generation then raise exception using errcode='42501',message='collaboration_access_denied'; end if;
   key_id:=(p_payload->>'idempotency_key')::uuid;
   if key_id is null then raise exception using errcode='22023',message='invalid_feedback_send'; end if;
   if exists(select 1 from private.mcy_collaboration_feedback_sends where idempotency_key=key_id and feedback_id=f.id and revision=(p_payload->>'expected_revision')::integer and actor_id=p_actor_id) then return jsonb_build_object('sent',true,'duplicate',true); end if;
   if f.current_revision is distinct from (p_payload->>'expected_revision')::integer then raise exception using errcode='PT409',message='collaboration_conflict'; end if;
   insert into private.mcy_collaboration_feedback_sends(feedback_id,revision,actor_id,idempotency_key) values(f.id,f.current_revision,p_actor_id,key_id);
   result:=jsonb_build_object('sent',true);
  end if;
 else raise exception using errcode='22023',message='unsupported_collaboration_action'; end if;
 insert into private.mcy_collaboration_audit(actor_id,action,object_id) values(p_actor_id,p_action,target);
 return result;
end $$;

-- Private cohort replaces public active profiles; old actor-bound draft RPCs stay intact.
revoke select on public.teachers,public.sessions,public.session_versions,public.session_segments from public,anon,authenticated;
revoke all on function public.mcy_collaboration_dispatch(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.mcy_collaboration_dispatch(uuid,text,jsonb) to service_role;
revoke all on function private.mcy_collaboration_role(uuid),private.mcy_collaboration_approved(uuid),private.mcy_collaboration_course_approved(uuid),private.mcy_collaboration_immutable() from public,anon,authenticated,service_role;
do $$ declare t text; begin
 for t in select tablename from pg_tables where schemaname='private' and tablename like 'mcy_collaboration_%' loop
  execute format('alter table private.%I enable row level security',t);
  execute format('revoke all on table private.%I from public,anon,authenticated,service_role',t);
 end loop;
end $$;
commit;
