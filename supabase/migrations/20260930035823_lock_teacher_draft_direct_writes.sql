-- Applied to mcy-staging through the authorized Supabase connector because the
-- local Supabase CLI is unavailable. Keep this filename aligned with remote
-- migration version 20260930035823.
--
-- Teacher draft changes must go through a server-controlled API that verifies
-- the active teacher role and ownership. Keep learner/browser roles read-only.
revoke all privileges on table
  public.sessions,
  public.session_versions,
  public.session_segments
from public, anon, authenticated;

grant select on table
  public.sessions,
  public.session_versions,
  public.session_segments
to anon, authenticated;
