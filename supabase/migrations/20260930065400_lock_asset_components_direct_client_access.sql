-- Applied to mcy-staging through the authorized Supabase connector because the
-- local Supabase CLI is unavailable. Keep this filename aligned with the
-- recorded remote migration version 20260930065400.
--
-- No current client or Edge Function consumes asset_components. Preserve the
-- service_role grants for reviewed server-side asset and rights workflows.

revoke all privileges on table public.asset_components
from anon, authenticated;
