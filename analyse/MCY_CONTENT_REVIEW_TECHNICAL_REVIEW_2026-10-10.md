# MCY — independent technical review, Owner content workflow

Historical local-only checkpoint. The [2026-10-11 final SQL/deployed readback review](MCY_CONTENT_REVIEW_STAGING_TECHNICAL_REVIEW_2026-10-11.md) supersedes this candidate hash and its exact-stack/HTTP gates for the narrowly deployed Owner review scope. This dated record is preserved as evidence of the old unapplied candidate.

Existing independent agent `/root/owner_repair_review`, under the Owner's prior authorization for R3 review. Local source only; no cloud operations by the reviewer and no qualified content approval.

Final migration: `20261010113419_owner_content_review.sql`, SHA256 `ff225000c9bd3175462b17c58a8059486ba9bc49374311736a32cd55abefa8c3`.

Scope: private tables/helpers/RPCs, fixed version-bound candidates, verified-Auth Owner routing, Owner panel, lazy teacher entry/account guards and candidate text/media checker. The wider dirty tree is not certified.

Resolved findings: repeated quota-exempt withdrawals/inactive assignment inserts; transaction-start expiry after lock waits; dual-role Owner/teacher roster mismatch; post-lock role downgrade retaining Owner authority. No-op now writes nothing; missing state cannot be created through the exempt path; role/time and literal Owner/target-teacher are rechecked after locks.

Final result: **no remaining P1/P2 in local technical scope**. Independent PGlite9/9, Owner/content/catalog20/20 and checker PASS0sessions/1draft. Controlled post-lock mutation is rollback-only/fictional, not real contention. Parent's UI is separate execution evidence, not independently rerun by reviewer.

Open gates: exact Supabase/PostgREST HTTP, fresh deployed ACL/schema, multi-session contention, role-verified staging actors/expiry, record privacy/retention, exact release artifact/target and actual expertise/media rights. Local technical review clears none of these by itself.
