# MCY Auth email — independent R3 source review, 2026-10-11

**Historical review.** Final source/hash/test acceptance is [the follow-up R3](MCY_AUTH_LEARNER_FINAL_REVIEW_2026-10-11.md); hosted/config/deployment status is [the implementation report](MCY_AUTH_EMAIL_IMPLEMENTATION_2026-10-11.md). The local-only `content_path` assumption below is superseded by inspected official CLI2.119.0 source: it uploads six Auth bodies and skips seven disabled notification bodies. Initial manifest `2176eedb…`/renderer78 is historical; final security subjects and renderer are bound to `63012a11…`. Preserve this text as the original reviewer evidence, not a current13-body acceptance.

Reviewer: independent agent `/root/auth_email_review`. Review applies to the narrow VI/EN Auth email subject/body candidate and cosmetic locale selection. It does not approve the separate learner write migration or claim cloud application.

## Decision

No remaining P1/P2 findings in the 13 email subjects/bodies, locale helper, selector and callback metadata update reviewed below. The narrow Dashboard change is eligible when the original hosted subjects/bodies have been captured for rollback, only the reviewed subject/body fields change, all seven security notification switches remain OFF, and each saved field is read back against the generated manifest. Review does not authorize SMTP/key/provider changes, role grants, AI configuration saves, additional migrations or Production promotion.

All six Auth scenarios and seven security notification scenarios have calm, explicit VI/EN copy, the correct `Một chút yoga` / `A Little Yoga` names, ivory/ink/terracotta styling, and no health or improvement claim. Invite copy distinguishes account creation from separately checked workspace access. Security notifications provide a response if the recipient did not make the change. Provider confirmation URLs remain `{{ .ConfirmationURL }}`; reauthentication is code-only. No user-controlled greeting, free text, role metadata or learner data enters the email copy.

## Corrections independently identified and verified

- Removed the metadata-sync shortcut based on cached SDK `user_metadata.locale`: a successful direct Auth PUT does not refresh that SDK cache, so the shortcut could falsely report a preference as synchronized. The update now always uses the initiating verified, unexpired session token.
- Native callbacks preserve their exact registered schemes. The native screen no longer offers an immediate email-language choice it cannot honor for an existing confirmed account; it explains that native email uses the saved preference, which can be changed when signing in on web. Web requests carry an exact allowlisted locale hint in `RedirectTo`, so a confirmed account receives the requested language before metadata is updated after successful authentication.
- The learner verification input permits the deployed eight-digit OTP as well as six digits, without changing server expiry or OTP configuration.

## Evidence and limits

Independent isolated Playwright helper subset: **4/4 PASS**, exit 0, fictional backend on port 4263. Covers locale allowlisting/exact native callbacks, initiating-token-only metadata request, expired/failure no retry, and stale-SDK-locale regression. The parent executes the full browser acceptance separately; this reviewer does not claim an independent full UI run or physical native acceptance.

Directly inspected final `analyse/MCY_AUTH_EMAIL_DOCKER_2026-10-11.json`: **PASS**, 13 scenarios × 6 language/metadata cases = 78 renderer cases, authenticated metadata preservation/anonymous denial check, and owned-resource cleanup. Harness SHA256 `f8448f5ace04e08c79c9a710cd6abfe22f29dcd2d456050d7a11f7473643d18e`; manifest SHA256 matches the source reviewed below. All bodies and subjects are exercised through the common actual GoTrue MagicLink renderer. This proves template rendering, not real signup/invite/recovery/email-change/MFA notification triggers. Seven notification switches stay OFF. Password recovery UI is not implemented by this template change. Live branded inbox/link acceptance remains separate.

The earlier full renderer attempt failed on a host template-fetch timeout and is preserved as `MCY_AUTH_EMAIL_DOCKER_FULL_ATTEMPT_2026-10-11.json`; it is not counted as PASS.

## Reviewed hashes

| File | SHA256 |
| --- | --- |
| `scripts/auth-email-templates.mjs` | `6089803e66a27537e5f59a51baeeda424a7a05fe2a349499efa60360d9c627cf` |
| `supabase/templates/manifest.json` | `2176eedb6c5788ca806774e450f59cf7b4dc039ab66aa662708506f0f4afee7c` |
| `src/backend/authEmailMetadata.ts` | `1aa385a2792330930d18e5051a1e3330bacc7571723efc4b64fff378185c5067` |
| `src/backend/EmailLanguageSelect.tsx` | `2c780deb7cb90a03b22cae741fc3985281d545b94758303bd49c542635a8e148` |
| `src/backend/emailLocale.ts` | `09bb5afd406e8ca1af791e0dbb819e6e26e8d2e76222fae5393e42d6f9f7ba02` |
| `src/backend/AuthCallback.tsx` | `5dc40e88ddb53d89c255430d6694224d634024c328d26ad0830a64c412cdf120` |
| `tests/auth-email.spec.ts` | `9d99bf0b427f7ec0628063a0a9f212277cc5f13289891f50ac7befa1bd1921c5` |

Further source changes require review of the affected behavior. This hash set excludes the in-progress `Prototype.tsx` learner write follow-up; that follow-up has separately reported blockers and is not cleared here.

## Primary-source checks

- [Supabase Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates): stored `.Data` metadata, provider confirmation variables and hosted Dashboard customization.
- [Local-development email customization](https://supabase.com/docs/guides/local-development/customizing-email-templates): `content_path` is a local template path; hosted templates are copied into the Dashboard. A CLI diff declaring subjects without inline body content is not proof that the hosted HTML changed.
- [Official Auth MagicLink handler](https://github.com/supabase/auth/blob/master/internal/api/magic_link.go): OTP request `data` is used for signup/new or unconfirmed users; it does not update an existing confirmed user's metadata.
- [Official Go template mailer](https://github.com/supabase/auth/blob/master/internal/mailer/templatemailer/template.go) and [mail data construction](https://github.com/supabase/auth/blob/master/internal/mailer/templatemailer/templatemailer.go): subject and body use Go templates, `.Data` comes from saved user metadata, and redirect hints are not present on every security notification event. Those events fall back to the saved locale.

No cloud mutation, real email send, credential-store read, role grant or source implementation edit was performed by this reviewer.

## Rollout evidence correction and safer subject path

Follow-up review of fresh official CLI preflight at `2026-10-11T10:00:59.430Z` confirms all 13 remote subjects still have the defaults. Earlier in-tab editing/reloading observations are not accepted as hosted save evidence. The attempted Invite form save was rejected by automatic approval review for a subject mismatch; the reviewer did not retry or bypass that action.

An isolated official CLI subject/redirect configuration is an eligible safer alternative when the immutable configuration declares exactly the 13 manifest subject fields and the reviewed exact `additional_redirect_urls`, with no SMTP/key/notification-enable field. Match every declared value to the manifest and callback list before apply; require fresh zero declared differences afterward and unchanged hashes for the 18 unmanaged differences. The preflight regex currently permits arbitrary scenario names and `content_path`; tighten it to the exact expected field set before considering it a durable enforcement guard. CLI content paths remain insufficient evidence of hosted HTML application.

Dashboard body saves must start from a fresh loaded form after the independent subject readback, leave subjects unchanged, retain the original body for rollback, and receive fresh body readback afterward. Since a Save can submit the whole form, repeat the independent CLI subject comparison after each body save. A redacted DOM value or unreliable clipboard cannot prove the subject is correct. If a body-only action cannot be safely reviewed, or another save is rejected, stop that action; do not treat a later in-tab value as server acceptance. All seven security notification switches must remain OFF.
