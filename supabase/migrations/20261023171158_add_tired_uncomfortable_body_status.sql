-- Owner feedback 2026-10-23: the overall check-in answer offers "Mệt" and "Khó chịu"
-- next to the existing "Bình thường" (none_now) and "Bỏ qua" (skipped).
-- Expand-only: two new accepted body_status values, existing rows and meanings untouched.
-- Applied to mcy-staging (mhumbczqrzutdnraafhs) on 2026-10-23 through the Supabase connector as version 20261023171158;
-- the file name matches the remote version.

alter table public.checkins
  drop constraint if exists checkins_body_status_check,
  add constraint checkins_body_status_check
    check (body_status is null or body_status in ('reported', 'none_now', 'uncertain', 'skipped', 'tired', 'uncomfortable'));

-- Patch the deployed writer in place instead of copying its definition: the rewrite only
-- succeeds when the current definition still contains exactly one copy of the old allow-list,
-- so drift (a later redefinition) stops the migration instead of being overwritten.
-- CREATE OR REPLACE keeps owner, search_path, ACL and dependent grants.
do $migration$
declare
  v_oid oid;
  v_definition text;
  v_old constant text := $$('reported', 'none_now', 'uncertain', 'skipped')$$;
  v_new constant text := $$('reported', 'none_now', 'uncertain', 'skipped', 'tired', 'uncomfortable')$$;
  v_occurrences integer;
begin
  select p.oid into v_oid
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'save_my_checkin_expanded';
  if v_oid is null then
    raise exception 'private.save_my_checkin_expanded is missing; refusing to continue';
  end if;
  v_definition := pg_catalog.pg_get_functiondef(v_oid);
  v_occurrences := (pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_old, ''))) / pg_catalog.length(v_old);
  if v_occurrences <> 1 then
    raise exception 'private.save_my_checkin_expanded changed (% allow-list copies found, expected 1); refusing to continue', v_occurrences;
  end if;
  execute pg_catalog.replace(v_definition, v_old, v_new);
end
$migration$;
