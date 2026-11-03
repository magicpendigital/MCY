-- Owner request 2026-10-23: the 14 prepared reading units become Owner-reviewable candidates
-- (Preview, never learner-visible). They need their own scope so the audio and measured-duration
-- checks that only apply to timed practice sessions are not demanded of a reading unit;
-- the existing save function already exempts every scope except practice_session.
-- Expand-only. Local candidate: apply only after the exact-target review in docs/release/RELEASE_RUNBOOK.md.

do $migration$
declare
  v_constraint text;
  v_oid oid;
  v_definition text;
  v_old constant text := $$not in ('learning_intro','practice_session')$$;
  v_new constant text := $$not in ('learning_intro','learning_reading','practice_session')$$;
  v_occurrences integer;
begin
  -- 1. Widen the scope check on the review state table.
  select c.conname into v_constraint
  from pg_catalog.pg_constraint c
  where c.conrelid = 'private.mcy_content_review_states'::regclass
    and c.contype = 'c'
    and pg_catalog.pg_get_constraintdef(c.oid) like '%learning_intro%practice_session%';
  if v_constraint is null then
    raise exception 'scope check on private.mcy_content_review_states not found; refusing to continue';
  end if;
  execute pg_catalog.format('alter table private.mcy_content_review_states drop constraint %I', v_constraint);
  alter table private.mcy_content_review_states
    add constraint mcy_content_review_states_scope_check
    check (scope in ('learning_intro', 'learning_reading', 'practice_session'));

  -- 2. Patch the candidate validator in place; stop when its definition has drifted.
  select p.oid into v_oid
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'mcy_content_review_validate';
  if v_oid is null then
    raise exception 'private.mcy_content_review_validate is missing; refusing to continue';
  end if;
  v_definition := pg_catalog.pg_get_functiondef(v_oid);
  v_occurrences := (pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_old, ''))) / pg_catalog.length(v_old);
  if v_occurrences <> 1 then
    raise exception 'private.mcy_content_review_validate changed (% scope lists found, expected 1); refusing to continue', v_occurrences;
  end if;
  execute pg_catalog.replace(v_definition, v_old, v_new);
end
$migration$;
