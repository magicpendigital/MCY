-- Applied to mcy-staging through the authorized Supabase connector because the
-- local Supabase CLI is unavailable. Keep this filename aligned with the
-- recorded remote migration version 20260930041541.
--
-- Browser/mobile direct writes to draft tables are not an approved authoring
-- path. These policies previously checked only a caller-controlled owner/author
-- ID, not an active server-granted role. Future authoring must use a reviewed
-- server boundary that checks role, ownership and audit evidence.

drop policy if exists sessions_owner_write on public.sessions;
drop policy if exists sessions_owner_update on public.sessions;
drop policy if exists session_versions_owner_insert on public.session_versions;
drop policy if exists session_versions_owner_update on public.session_versions;
drop policy if exists segments_owner_write on public.session_segments;
drop policy if exists editorial_versions_author_insert on public.editorial_versions;
drop policy if exists editorial_versions_author_update on public.editorial_versions;
