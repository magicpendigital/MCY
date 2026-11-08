---
name: mcy-supabase-rollout
description: Apply a Supabase migration or deploy an Edge Function for MCY (staging project mcy-staging) safely: preconditions, PGlite rehearsal, apply, effective-privilege readback, local file rename, Edge deploy and verification. Use when a task touches supabase/migrations, supabase/functions, RPCs, RLS, storage buckets or Owner/teacher/content actions, or when the Owner asks to "áp lên staging".
---

# MCY Supabase rollout (staging)

Cloud changes need the Owner's explicit request in the current task; local code and tests do not. Never run `supabase db push`, never bundle other pending migrations, never touch Production. Project: `mcy-staging` (`mhumbczqrzutdnraafhs`, org MagicpenDigital). Details and history: [docs/release/RELEASE_RUNBOOK.md](../../../docs/release/RELEASE_RUNBOOK.md) and the status bullets in `AGENTS.md`. Risk tier from [mcy-change-review](../mcy-change-review/SKILL.md): schema, RPC, RLS and roles are R2–R3.

## 1. Write it so it can be proven

- Expand-only migrations. Business conflicts raise `PT409`, never `40001`/`40P01` (INC-002). Patching an existing function in place uses a **drift guard** (refuse unless the exact expected text occurs exactly once).
- Every new table: RLS on, `revoke all` from `public, anon, authenticated, service_role`. Every RPC: `security definer`, `set search_path = ''`, schema-qualified objects, the actor verified inside, `revoke` from `public, anon, authenticated`, `grant execute` to `service_role` only.
- Edge code verifies the JWT, takes the actor from the token (never from the body), validates strictly, maps database errors to stable codes and never echoes details.

## 2. Rehearse before the cloud

- `tests/*-rehearsal.cjs` run the staging chain in PGlite (`tests/support/pglite-chain.cjs`; install `@electric-sql/pglite` in a scratch folder and set `MCY_PGLITE_MODULE_PATH`). Cover: happy path, every actor (Owner, teacher, other teacher, learner), expired roles, quotas, idempotent repeats, immutability triggers, ACL/RLS/search_path assertions, and the drift guard refusing a changed function. Fix what it finds before touching staging; it has caught real defects.
- Edge handler tests (`tests/*-handler.test.mjs`) use a fake `rpc`; UI tests use fictional sessions. These are fixtures, not role or staging evidence.

## 3. Preconditions on staging (read-only)

Confirm project ref/org/status, `list_migrations` equals the local files up to the new one (nothing remote-only), the objects you will create do not exist, and any text you patch occurs once. Record the counts that must stay unchanged (review states, check-ins, AI config).

## 4. Apply and read back

Apply with the connector (`apply_migration`, name in snake_case), then read back from the catalog: ledger version, constraints/validators, table owner + RLS + effective privileges for `anon`, `authenticated`, `service_role`, each function's `security definer`, `search_path`, owner and EXECUTE for the three roles, triggers, unchanged counts, and (read-only, no write) one call as the Owner to prove it runs. Rename the local migration file to the **remote version** and update references/tests; rerun the rehearsal.

## 5. Edge deploy

`npx supabase functions deploy <name> --project-ref mhumbczqrzutdnraafhs --use-api --yes` (the CLI refuses agent runs without `--yes`; only after the Owner asked for the deploy and the target is confirmed). Then `list_edge_functions` (version, ACTIVE, `verify_jwt: true`), an unauthenticated call answers 401, and restore any file the CLI touched (`supabase/.temp`).

## 6. Record and stop

Add the status bullet (what was applied, remote version, readback results, what was **not** run) and update the README of the feature. Do not run actions that need the Owner's own session (imports, approvals) and never write approval records on the Owner's behalf. Stop and report on any drift, unexpected count or failed readback; do not improvise a fix on staging.
