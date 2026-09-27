# Supabase staging

Project: `mcy-staging`  
Project ref: `mhumbczqrzutdnraafhs`  
Organization: `Nilaza`  
Region: `ap-southeast-1` (Singapore)  
API URL: `https://mhumbczqrzutdnraafhs.supabase.co`

## Migrations

- `20260925143000_initial_mcy_schema.sql`: core learner, practice, teacher, media, course, editorial and review tables with RLS.
- `20260925163500_harden_mcy_schema.sql`: trigger search-path hardening, foreign-key indexes and consolidated read policies.
- `20260926100000_operational_controls.sql`: additive server-owned control plane for role assignments, teacher access grants, consent evidence, privacy requests, support, audit, feature flags, idempotent jobs, content validation, notification preferences, devices and workspace invites. All 18 new tables are in `private` and have RLS enabled.
- `20260926101000_operational_fk_indexes.sql`: covering indexes for the new control-plane foreign keys.
- `20260926140000_learner_app_backend.sql`: narrow P1 learner-client grants and RPCs for append-only consent events, consent-state reads, idempotent owner-scoped check-ins, and owner-scoped check-in deletion. Applied to `mcy-staging` on 2026-09-26.
- `20260927033720_harden_teacher_profile_acl.sql`: revokes all direct table privileges from `PUBLIC`, `anon` and `authenticated`, restores SELECT only, and removes client write policies from `public.teachers`. Applied to `mcy-staging` on 2026-09-27 after live ACL/RLS review. Effective privileges confirm that clients cannot INSERT, UPDATE, DELETE or TRUNCATE; `service_role` retains backend privileges.

Migration filenames for the five earlier changes do not currently match their recorded remote version IDs, even though their migration names match. Do not run `supabase db push` until that history is reconciled and reviewed; the teacher ACL migration is tracked locally with its exact remote version. The Supabase CLI was unavailable in this environment, so this narrowly scoped migration was applied with the authenticated Supabase migration connector and recorded here from the resulting migration history.

Staging has one confirmed test Auth account with global application roles; it has no lesson, media or editorial seed rows and no active public teacher profile.

## Security boundaries

- Client access uses the publishable key only; never place a service-role/secret key in the app.
- Learner-owned check-in, dialogue, plan, run and reflection tables use owner RLS policies.
- Draft content, rights, review events, availability and AI grants are deny-by-default and should be changed by a server-side API/admin boundary.
- The new `private` schema is not granted to `anon` or `authenticated`, is not a client Data API surface, and is intended for a server/API using the service role. Keep role assignment, share grants, support data, audit events and feature-flag writes behind that API.
- `private.push_endpoints.token_ciphertext` must be encrypted with a KMS-managed key; `token_hash` is used for deduplication. Never log the plaintext push token.
- `private.share_grants` is the source of truth for time-bounded, field-scoped teacher/support access. The server must select only approved fields and write an audit event for every access.
- `private.job_runs` is the idempotency ledger for exports, media processing, notifications and AI work. Use `(job_type, idempotency_key)` for retries instead of duplicating side effects.
- Private media buckets and Storage policies are intentionally not created by the learner database migrations. The newly authorized teacher trial needs a separate reviewable migration/API gate before any bucket is created. Keep lesson uploads private and staged; teacher trial uploads cannot be learner-visible or published.

## Learner app P1 client contract

- The client uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; `.env.local` is ignored by Git. Copy `.env.example` for local builds. The same two build variables must be set in Vercel before deploying a usable hosted login.
- `capacitor.config.ts` points native packaging at `dist/client`. `npm run android:build` creates a debug APK after the web build and Capacitor sync. `npm run ios:sync` prepares the iOS project; Xcode on macOS is required for a device build/signing/install.
- Auth callbacks use `/auth/callback` on web and `motchutyoga://auth/callback` on native. A native build must never redirect to the developer computer's `localhost`: Capacitor selects the app URL scheme, which opens the installed app and returns to its existing PKCE session. Add the exact local web callback, deployed Vercel callback, and `motchutyoga://auth/callback` to Supabase Auth's redirect URL allowlist. The learner must open a magic link in the same browser/device session that requested it; on native, open it on the phone with the app installed. The learner confirms email delivery and local magic-link completion have worked. The real installed-app callback still needs a live email test after allowlisting.
- The current app supports both callback-based magic links and entry of a six-digit OTP when the configured email contains one. Keep the working magic-link template for the first hosted/native test. This Free project was created after Supabase's 2026-06-03 default-SMTP template change; if custom OTP content is required, configure a custom SMTP provider before editing the Auth template, then include `{{ .Token }}` and test it end to end.
- The Vercel dashboard confirmed project `mcy` connected to `magicpendigital/MCY`, branch `codex-mcy-p1-preview`, with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` scoped to Preview. On 2026-09-27 commit `8e0a8fa` built successfully at `https://mcy-v4v6ml2ad-magicpens-projects.vercel.app/` and rendered in the browser; production was not deployed. Recheck the latest Preview after each push. `vercel.json` builds `dist/client` and rewrites `/auth/callback` to the SPA. The Vercel API connector did not have account scope, so dashboard verification was done in the signed-in browser.
- P1 syncs only authenticated learner profiles, consent events and check-ins after the learner enables `wellbeing_data`. Guest check-ins stay in the page session. Practice content, AI dialogue, practice runs and post-practice reflections remain illustrative/session-only; privacy/help/export/delete requests are not presented as server-processed.
- The migration revokes broad direct `anon`/`authenticated` table access from learner tables. The app writes consent/check-in through authenticated, owner-checked RPCs; profile and owner-scoped reads use RLS. Never weaken these grants to make client writes pass.

## Deliberately staged hardening

The first attempt to combine new tables with changes to existing public RLS policies, content immutability triggers and teacher activation rules was rejected by the automatic safety review because of its blast radius. The later `harden_teacher_profile_acl` migration is deliberately limited to client privileges and the three self-write policies on `public.teachers`; it does not create a teacher API, activate profiles, issue invitations or provide media access. Keep those features behind separate contract-tested server/API and policy gates.

## Next setup step

For later AI, content, staff, commerce and operational workflows, create a separate server/API environment with `SUPABASE_URL` and a server-only secret, add reviewed seed content, then implement API contracts for role checks, share-grant projection, data requests and job idempotency. Keep publish/entitlement operations server-side; do not connect those features directly to learner tables or treat this staging project as production.

## Teacher pilot gate — added 2026-09-26

- The teacher workspace at `staff.html` is still a fixture; it does not authenticate, persist lesson drafts, or upload files. Staging has one confirmed global test owner with all nine application role grants and an audit entry; there is no active teacher profile, teacher API, or private media bucket.
- Direct table writes are now denied to `anon` and `authenticated` by `20260927033720_harden_teacher_profile_acl.sql`. This was verified with `has_table_privilege` for SELECT/INSERT/UPDATE/DELETE/TRUNCATE and by checking the live policy list; do not treat this catalog-level check as the required PostgREST negative integration suite.
- Before inviting other teachers, provide the trial teacher email roster. The invite endpoint must verify the caller's server-side owner role and write role assignments/audit events; invitee self-registration alone cannot grant teacher access.
- Before uploads, confirm allowed file types, representative file size, lesson rights attestation, retention/deletion period, and reviewer. Supabase Free is limited to 50 MB per file and 1 GB of total storage. TUS resumable upload is the appropriate transport for files over 6 MB, but larger lessons will require a plan or storage decision; do not upgrade automatically.
