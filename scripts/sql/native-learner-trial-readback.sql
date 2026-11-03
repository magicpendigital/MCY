-- Read only; returns counts/authority/consent summaries, never notes, email or tokens.
with targets(label, identity_sha256) as (values
('LEARNER_A','995e6d265987a1c5cd6c831d6b2dda54998092aa769082cc72bf93fa209ece68'),
('LEARNER_B','1dce191e95a843797bb7e8ebb9c63e5f0a5e20aa7ee98720be3df467421bebd3')),
actors as (select t.label,t.identity_sha256,u.id,u.email_confirmed_at from targets t left join auth.users u on encode(sha256(convert_to(u.id::text,'UTF8')),'hex')=t.identity_sha256)
select jsonb_build_object(
'capturedAt',clock_timestamp(),'kind','NativeLearnerTrialReadOnlyPreflight','projectRef','mhumbczqrzutdnraafhs',
'ai',(select jsonb_build_object('enabled',enabled,'version',version_no,'modelUnset',model_id='') from private.ai_configurations where singleton),
'ownerDefinitionMd5',(select md5(pg_get_functiondef(p.oid)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='mcy_ai_save_owner_config'),
'writerBodyMd5',(select md5(p.prosrc) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='save_my_checkin_for_current_user_with_current_consent'),
'writerDefinitionMd5',(select md5(pg_get_functiondef(p.oid)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='save_my_checkin_for_current_user_with_current_consent'),
'ledgerApplied',(select count(*) from supabase_migrations.schema_migrations),
'actors',(select jsonb_agg(jsonb_build_object('label',a.label,'identitySha256',a.identity_sha256,'found',a.id is not null,'confirmed',a.email_confirmed_at is not null,'hasProfile',exists(select 1 from public.profiles p where p.user_id=a.id),
'activeStaffRoles',(select count(*) from private.role_assignments r where r.user_id=a.id and r.status='active' and r.starts_at<=clock_timestamp() and (r.ends_at is null or r.ends_at>clock_timestamp()) and r.revoked_at is null),
'activeTeacherProfile',exists(select 1 from public.teachers t where t.user_id=a.id and t.active),
'consentCount',(select count(*) from private.consent_events c where c.user_id=a.id),
'checkinCount',(select count(*) from public.checkins c where c.user_id=a.id),
'observationCount',(select count(*) from public.checkin_observations o where o.user_id=a.id),
'latestConsent',(select jsonb_agg(to_jsonb(c)) from (select distinct on (purpose) purpose,action,policy_version from private.consent_events where user_id=a.id order by purpose,occurred_at desc,id desc)c)
) order by a.label) from actors a)
) as receipt;
