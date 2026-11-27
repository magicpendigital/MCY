-- S1 (plan plans/active/2026-11-27-teacher-course-groups-s1.md, Owner 2026-11-27): a teacher may propose a free course
-- (course_group) made of the teacher's OWN video lessons; the Owner reviews and switches it on like a lesson. The public
-- snapshot only publishes lessons that sit inside a shown course, so without this an approved teacher lesson never reaches learners.
-- One drift-guarded in-place patch of public.mcy_content_save_version (same pattern as 20261108162119 §5); no new table, no grant
-- change (CREATE OR REPLACE keeps the ACL). A teacher course:
--   * lists 1..80 lesson ids, each a video_lesson authored by this same teacher (no MCY lesson, no other teacher's lesson);
--   * carries no "guidance": benefits/cautions and their reviewed flag are MCY-reviewed wording, never set by an author.
-- Refusals use 22023 (the Edge reports invalid_content). Screen texts and reading units stay MCY-only. Local candidate.
do $migration$
declare
  v_oid oid; v_definition text; v_occurrences integer;
  v_kind_old constant text := E'  if r = ''teacher'' and p_kind <> ''video_lesson'' then raise exception using errcode = ''42501'', message = ''content_kind_not_allowed''; end if;';
  v_kind_new constant text := E'  if r = ''teacher'' and p_kind not in (''video_lesson'', ''course_group'') then raise exception using errcode = ''42501'', message = ''content_kind_not_allowed''; end if;';
  v_hash_old constant text := E'  h := private.mcy_content_hash(p_kind, btrim(p_title), p_payload);';
  v_hash_new constant text := E'  -- S1: a teacher course holds only the teacher''s own video lessons and no guidance (checked after the role recheck and item lock).\n'
    || E'  if r = ''teacher'' and p_kind = ''course_group'' and (p_payload ? ''guidance'' or jsonb_typeof(p_payload->''lessonIds'') is distinct from ''array''\n'
    || E'    or jsonb_array_length(p_payload->''lessonIds'') not between 1 and 80\n'
    || E'    or exists (select 1 from jsonb_array_elements(p_payload->''lessonIds'') e where jsonb_typeof(e) <> ''string''\n'
    || E'      or not exists (select 1 from private.mcy_content_items li where li.item_id = (e #>> ''{}'') and li.kind = ''video_lesson''\n'
    || E'        and li.author_kind = ''teacher'' and li.author_id = p_actor_id))) then\n'
    || E'    raise exception using errcode = ''22023'', message = ''course_lessons_not_own'';\n'
    || E'  end if;\n'
    || v_hash_old;
begin
  select p.oid into v_oid from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'mcy_content_save_version';
  if v_oid is null then raise exception 'public.mcy_content_save_version is missing; refusing to continue'; end if;
  v_definition := pg_catalog.pg_get_functiondef(v_oid);
  v_occurrences := (pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_kind_old, ''))) / pg_catalog.length(v_kind_old);
  if v_occurrences <> 2 then
    raise exception 'public.mcy_content_save_version changed (% teacher kind checks found, expected 2); refusing to continue', v_occurrences;
  end if;
  v_occurrences := (pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_hash_old, ''))) / pg_catalog.length(v_hash_old);
  if v_occurrences <> 1 then
    raise exception 'public.mcy_content_save_version changed (% hash lines found, expected 1); refusing to continue', v_occurrences;
  end if;
  execute pg_catalog.replace(pg_catalog.replace(v_definition, v_kind_old, v_kind_new), v_hash_old, v_hash_new);
end
$migration$;
