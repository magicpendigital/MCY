-- Emergency staging stop after the separately approved actor-bound migration.
-- No role assignment, data deletion or reopening of the historical writer.
begin;
revoke execute on function public.save_my_checkin_for_current_user_with_current_consent(uuid,date,text,smallint,text,text,jsonb,text) from public,anon,authenticated;
revoke execute on function public.save_my_checkin_with_current_consent(date,text,smallint,text,text,jsonb,text) from public,anon,authenticated;
commit;
