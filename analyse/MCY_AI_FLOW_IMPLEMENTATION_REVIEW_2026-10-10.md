# MCY — independent technical source review, 10/10/2026

Reviewer: existing independent agent `/root/owner_repair_review`, under the Owner's earlier explicit authorization to assign independent R3 review. This was a continuation within the same task; no new user-owned thread or cloud action. Technical source review does not provide yoga/clinical expertise or prove rights to media.

Scope: new practice context/catalog/selector/admission migration and rehearsal, Owner OpenRouter readiness/copy, learner Plan/start/stop/reader/reflection/memory and account/consent isolation, content-version/asset/evidence checker and fixtures. Unrelated pre-existing dirty teacher/collaboration/native changes were not accepted as reviewed by this record. HEAD is `82458fc219a2231ccac279112dfc0db5447b0edd`; the working source is dirty, so final file hashes are bound in the implementation receipt.

## Findings and resolution

| Finding | Resolution |
|---|---|
| Usage could be lost when provider returned a paid response with invalid model/output | Capture bounded token counts before validating output; finalization records known counts on failure. Negative tests PASS. |
| Enum coercion could accept array values through `String(value)` | Strict type and enum checks for action/context/status; malformed inputs rejected before admission/provider. Tests PASS. |
| Owner editable legacy prompt did not affect the fixed selector | Made read-only and explained its retained/unused status. No save semantic or deployed SQL rewrite. |
| P1: consent refs were accidentally scoped to Onboarding rather than AccountDetailScreen | TS independently FAIL with6 TS2304; moved refs to AccountDetailScreen. Final TS PASS exit0. |
| Pending consent writes silently dropped a second click; shared SDK could switch actor between initiation and dispatch | Visible pending/disabled controls, immutable initiating-token client and identity guards before/after requests. Browser fixture verifies original Authorization header and late response isolation. |

Final independent source check: **no additional P1/P2 finding within scope**. The reviewer inspected installed SDK `SupabaseClient.ts` to confirm the custom `accessToken` closure is used by REST and Functions without replacing it with the later shared Auth/session refresh. Local `getSession`/user/expiry checks are consistency checks, not independent server authentication; exposed server endpoints must still verify Auth/current consent/authorization.

Independent validation reported: frontend TypeScript **PASS exit0**, selected backend/context/catalog tests **PASS17/17**; earlier focused backend/source review **PASS29/29** and SQL rehearsal **PASS3/3**. Final browser replay was performed by the implementing agent, not the independent reviewer. Refer to [implementation receipt](MCY_AI_FLOW_IMPLEMENTATION_EVIDENCE_2026-10-10.json) for final complete test/build results.

After review/full92, only screenshot/scroll/mouse capture lines were added to two existing UI test cases to export Plan/Practice images; their assertions and app/backend/build source are unchanged. Focused replay PASS2/2. These capture-only lines were not separately claimed as independently reviewed.

## Limits

- Catalog is empty. Draft image/text/English synthetic audio is not approved practice or clinical content; no expert/rights approval is inferred from a checker PASS.
- SQL execution used a fictional PostgreSQL17/PGlite scaffold and local migration baseline, not live Supabase Auth/PostgREST/multi-session rehearsal.
- UI/Auth/RPC/provider tests use fictional `.invalid` fixtures. No fresh live actor, inference, quota, deployed stop/restore or end-to-end provider policy evaluation was performed.
- No migration apply, Edge/Vercel deploy, Production promotion, AI config/flag change, role extension or positive Owner live save. Review is not authorization to perform those actions or evidence that release controls are enforced remotely.
