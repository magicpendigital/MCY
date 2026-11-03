# Reviewed practice content for the first staging pilot

## Owner workflow on staging — 2026-10-11

Open [Owner workspace](https://motchutyoga.magicpendigital.com/?workspace=owner), sign in with a current verified Owner role and select **Duyệt nội dung**. The Preview retains Vercel protection. Owner Edge v5 and the exact content-review migration are deployed; [acceptance](../../analyse/MCY_CONTENT_REVIEW_STAGING_ACCEPTANCE_2026-10-11.md) and [independent technical review](../../analyse/MCY_CONTENT_REVIEW_STAGING_TECHNICAL_REVIEW_2026-10-11.md) supersede the dated local-only checkpoint.

Owner is the initial responsible reviewer. Owner and assigned-teacher panels use verified identity, current global role/profile, exact-version assignment and expiry. Owner can assign for 1–30 days or revoke; changing capability invalidates the decision. No teacher profile is currently active, so live positive delegation remains untested and the roster is empty. Autonomous system grants remain future scope. No global role/expiry was changed.

The workflow records human-supplied qualifications, review/media-rights bases and explicit criteria; it does not certify their truth. The only candidate is the public non-exercise introduction with English sample audio. Never import private teacher drafts into this static registry/client bundle. Database approval does not publish or add a practice recommendation.

Build verifies candidate text/media hashes separately from approved sessions. Deployed migration `20261010113419_owner_content_review.sql` has final SHA256 `a206a63d3daa86747d8e3447193235ad88534775676a3582ac3ccd92472191c1`; the older undeployed candidate failed a real lock-wait expiry regression and was corrected before application. Docker/PostgREST11/11 and role-verified live read/negative API14/14 pass. No live approval/assignment was created. Run `npm run test:content-review` and `npm run test:content-review-rehearsal` (explicit local PGlite runtime needed) for fictional-actor contracts. Do not bundle the five remaining pending migrations or treat these tests as expert/rights review.

The learner selector is a bounded choice among released, reviewed sessions. It does not generate yoga movements or accept chat transcripts. `reviewedPracticeCatalog.ts` remains empty until actual expert/rights review is complete. The preparation sample at `/?workspace=content-review` is a draft outside that catalog.

## Required review

For each candidate, record the responsible qualified reviewer, qualification, exact review basis, eligible audience, exclusions, preparation, sequence/transitions, adaptation and stop guidance. Review the entire session at its actual practice pace, not only individual clips or their filenames. Missing discomfort feedback is not a health clearance. The first contract refuses AI selection for `reported` and `uncertain` body states; a future severity/red-flag contract requires a separate review.

Verify ownership and permission for every image, narration and text; name synthetic media and label audio language independently of UI language. Check Vietnamese narration and its transcript, intelligibility, duration, visual accuracy, readable text and accessible alternatives. AI-created anatomical/pose illustrations require expert review before learner publication. A technical agent review does not supply that expertise.

The initial static catalog contains freely accessible published assets under `public/assets/practice`. It is not a private teacher-draft, paid-entitlement or private-media API. Never import teacher drafts, unapproved media or private cohort material into it.

## Version and evidence

After review, use `contentVersion()` in `scripts/check-reviewed-practice-catalog.mjs` to hash canonical session metadata/text (excluding its `version`) plus the exact SHA-256 of every referenced image/audio file. Store its approved version, reviewer label and dates in the session. Create the matching reviewed record at `docs/content-review/<id>.json`, containing:

- `sessionId`, `contentVersion`, `reviewerLabel` matching the session;
- `expertApproved: true` and `rightsApproved: true` only after those real reviews;
- nonempty `expertQualification` and `reviewBasis` describing the actual evidence.

The build checker rejects expired/draft entries, missing media, changed text/media under an old version, duplicated IDs and missing/mismatched approval records. It checks consistency, not the truth of an approval or the identity of a reviewer. Independent human review and the repository/release controls remain necessary. Do not fill these fields from an AI assertion to obtain a green build.

Run `npm run check:practice-catalog` and `npm run test:practice-catalog`. An empty catalog passes as a closed state with `readyForRecommendations=false`; it never proves inference is ready. Before staging activation, apply only reviewed migrations, verify actual Auth/consent/ACL boundaries, test the provider route and quota/withdrawal/kill-switch behavior, and bind the exact build/target to its release packet. Production and native release remain separate.
