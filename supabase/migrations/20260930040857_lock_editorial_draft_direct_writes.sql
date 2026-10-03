-- Applied to mcy-staging through the authorized Supabase connector because the
-- local Supabase CLI is unavailable. Keep this filename aligned with remote
-- migration version 20260930040857.
--
-- Editorial drafts are not authored directly by browser/mobile clients. A
-- future authoring API must verify a server-granted role and record an audit.
revoke all privileges on table public.editorial_versions
from public, anon, authenticated;

grant select on table public.editorial_versions to anon, authenticated;
