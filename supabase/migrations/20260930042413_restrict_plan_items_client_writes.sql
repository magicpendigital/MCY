-- Applied to mcy-staging through the authorized Supabase connector because the
-- local Supabase CLI is unavailable. Keep this filename aligned with the
-- recorded remote migration version 20260930042413.
--
-- Learner plan items are not currently written by the client. Future plan
-- synchronization must use a reviewed, consent-aware server/API boundary.

revoke all privileges on table public.plan_items
from public, anon, authenticated;

grant select on table public.plan_items to authenticated;

drop policy if exists plan_items_insert_own on public.plan_items;
