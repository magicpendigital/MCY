-- Run only after independently matching deployed candidate SQL/ACLs and fixing
-- the incident that required STOP. Keeps the historical writer closed.
begin;
revoke execute on function public.save_my_checkin_for_current_user_with_current_consent(uuid,date,text,smallint,text,text,jsonb,text) from public,anon;
grant execute on function public.save_my_checkin_for_current_user_with_current_consent(uuid,date,text,smallint,text,text,jsonb,text) to authenticated;
revoke execute on function public.save_my_checkin_with_current_consent(date,text,smallint,text,text,jsonb,text) from public,anon,authenticated;
commit;
