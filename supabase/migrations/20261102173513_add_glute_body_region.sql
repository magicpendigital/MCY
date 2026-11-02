-- Owner feedback 2026-11-02: the check-in body map gets a "Mông" (glute) area in the trunk group, with left, right and
-- unspecified sides like the other paired regions. Expand-only: three new accepted region codes, existing rows untouched.
-- Applied to mcy-staging on 2026-11-02 through the Supabase connector as version 20261102173513; the file name matches. The in-place patch below refuses to run if the deployed writer has drifted.

alter table public.checkin_observations
  drop constraint if exists checkin_observations_region_code_check,
  add constraint checkin_observations_region_code_check check (region_code in (
    'neck',
    'shoulder_left', 'shoulder_right', 'shoulder_unspecified',
    'upper_arm_left', 'upper_arm_right', 'upper_arm_unspecified',
    'elbow_left', 'elbow_right', 'elbow_unspecified',
    'forearm_wrist_left', 'forearm_wrist_right', 'forearm_wrist_unspecified',
    'hand_left', 'hand_right', 'hand_unspecified',
    'upper_back', 'lower_back',
    'glute_left', 'glute_right', 'glute_unspecified',
    'knee_left', 'knee_right', 'knee_unspecified',
    'foot_left', 'foot_right', 'foot_unspecified'
  ));

alter table public.reflection_observations
  drop constraint if exists reflection_observations_region_code_check,
  add constraint reflection_observations_region_code_check check (region_code in (
    'neck',
    'shoulder_left', 'shoulder_right', 'shoulder_unspecified',
    'upper_arm_left', 'upper_arm_right', 'upper_arm_unspecified',
    'elbow_left', 'elbow_right', 'elbow_unspecified',
    'forearm_wrist_left', 'forearm_wrist_right', 'forearm_wrist_unspecified',
    'hand_left', 'hand_right', 'hand_unspecified',
    'upper_back', 'lower_back',
    'glute_left', 'glute_right', 'glute_unspecified',
    'knee_left', 'knee_right', 'knee_unspecified',
    'foot_left', 'foot_right', 'foot_unspecified'
  ));

-- Patch the deployed writer in place (same technique as 20261023171158): the rewrite only succeeds when the current
-- definition contains exactly one copy of the old allow-list tail, so a later redefinition stops the migration instead of
-- being overwritten. CREATE OR REPLACE keeps owner, search_path, ACL and dependent grants.
do $migration$
declare
  v_oid oid;
  v_definition text;
  v_old constant text := $$'foot_left', 'foot_right', 'foot_unspecified'$$;
  v_new constant text := $$'glute_left', 'glute_right', 'glute_unspecified',
      'foot_left', 'foot_right', 'foot_unspecified'$$;
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
  -- Already patched (for example this file ran before): nothing to do, and the allow-list must not gain a second copy.
  if pg_catalog.strpos(v_definition, $$'glute_left'$$) > 0 then
    raise notice 'private.save_my_checkin_expanded already allows the glute regions; skipping the writer patch';
    return;
  end if;
  v_occurrences := (pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_old, ''))) / pg_catalog.length(v_old);
  if v_occurrences <> 1 then
    raise exception 'private.save_my_checkin_expanded changed (% allow-list copies found, expected 1); refusing to continue', v_occurrences;
  end if;
  execute pg_catalog.replace(v_definition, v_old, v_new);
end
$migration$;
