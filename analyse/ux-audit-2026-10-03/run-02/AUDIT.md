# MCY learner UX audit — free video lesson flow

Date: 2026-10-03  
Surface: isolated local Vite app (`mcy-playwright.invalid` Supabase fixture), Microsoft Edge via Playwright  
Scope: desktop welcome → check-in → free-course catalog → lesson detail → embedded YouTube playback → self-reported reflection; mobile web at 390×844 and 320×568. This is a focused visual/interaction audit, not a full-app accessibility or production sign-off.

## Verdict

The free-video path reads as part of MCY rather than a separate embedded site: warm ivory surfaces, forest editorial headings, terracotta actions, calm density, and consistent app navigation. Course detail is intentionally not the same screen as a guided-practice template: it has a real YouTube lesson and a self-report action, but no MCY-owned movement sequence, timer, or proof that a video was watched. The distinction is product-correct and avoids inventing completion data.

The key path works in this local run. The first selected lesson loaded as a real in-app YouTube iframe and rendered video frames in desktop and mobile Edge. No horizontal document overflow was measured at 1440, 390, or 320 CSS px. A follow-up now adds a visible scroll cue at 320×568, but the pre-play poster remains text-only and wide although the source is portrait, and content-rights/caption/instructor gates remain open; the flow is not production-ready yet.

## Steps and screenshot evidence

1. **Welcome — healthy.** [01-welcome-desktop.png](01-welcome-desktop.png). Strong brand hierarchy and clear guest/account paths. The English selector remains an internal partial preview, consistent with current guidance.
2. **Body check-in — healthy, with evidence limited to the desktop browser state.** [02-check-in-desktop.png](02-check-in-desktop.png). Full-body map and labeled regions are both visible; “không thấy khó chịu”, “chưa xác định”, and “bỏ qua” remain distinct; the screen avoids presenting the illustration as a diagnosis.
3. **Free-course catalog — healthy.** [03-course-catalog-desktop.png](03-course-catalog-desktop.png), [07-course-catalog-mobile.png](07-course-catalog-mobile.png), and [13-course-catalog-opaque-nav.png](13-course-catalog-opaque-nav.png). Three real course groups show 18, 13 and 7 videos; the page explains that the learner chooses individual videos and that MCY does not personalize them. The scroll cue is visible on mobile.
4. **Lesson detail before Play — coherent; short-screen discovery improved.** [04-course-detail-desktop.png](04-course-detail-desktop.png), [08-course-detail-mobile.png](08-course-detail-mobile.png), [09-course-detail-320x568.png](09-course-detail-320x568.png), and the follow-up [scroll-cue capture](../run-03/09-course-detail-320x568-scroll-cue.png). Source/caption disclosures precede playback and navigation identifies the selected lesson. At 320×568 the Play control remains below the initial viewport, but a compact cue is fully visible and tells the learner to scroll; the regression test verifies the full Play label after scrolling.
5. **Embedded playback — healthy in this browser smoke only.** [05-player-desktop.png](05-player-desktop.png) and [11-player-mobile.png](11-player-mobile.png). The selected YouTube frame appears inside the app, not a navigation away; the iframe has a lesson-specific title and YouTube controls. This proves one local browser sample, not all 38 lessons, device WebViews, playback audio, or hosted behavior.
6. **Reflection — healthy and honest about its source.** [06-reflection-desktop.png](06-reflection-desktop.png). The prompt states that the learner practiced only after the learner chooses the self-report action. With no prior regions recorded, it says so rather than showing an improvement.
7. **Catalog scroll end — healthy.** [12-course-catalog-at-scroll-end.png](12-course-catalog-at-scroll-end.png). At the end of scroll, the source note and guide row finish above navigation (guide bottom 748 px; nav begins 776 px). The content is reachable and does not require removal of the nav.

`run-01` was rejected as audit evidence because several screenshots were captured before screen transitions and player loading had settled. This report uses only the accepted current-run images in `run-02`.

## Findings

### Addressed in this pass

- The mobile bottom navigation used a 97%-opaque background, allowing a thin slice of the catalog note underneath to show through at the top of the bar. It now uses the solid `surface` token. A regression assertion checks the computed opaque surface.
- The catalog’s full note and guide are scroll-reachable above navigation; no spacing change was needed.
- A compact “Cuộn xuống để xem video và phát trong ứng dụng” cue is visible only at very narrow, short portrait sizes. It does not cover the pre-play caption/privacy disclosures or protected chrome; E2E checks that the cue is fully visible and the Play label becomes fully visible after scroll.

### Remaining UX/content risks

- **P1 — poster/player mismatch:** the pre-play state is a typography-only 16:9 card, but the loaded lesson is 9:16. Clicking Play creates a large vertical layout change. It looks less finished than the real video. Do not substitute stock/AI art or unreviewed YouTube stills; first obtain approved, rights-backed poster assets, or redesign the pre-play state to match the real source ratio and test the short-screen flow.
- **P1 — release content gates:** a Vietnamese channel-provided caption is not listed in the current lesson data and the UI discloses this; the last cited YouTube Studio audit in the release-gate file is dated 2026-10-01 and must be refreshed before release. Rights declaration, verified instructor-profile attribution, thumbnail review, and instructional/safety review are not closed. Keep the instructor name out of production UI until verified and approved.
- **P2 — 320 px density:** long title, metadata chips and two notices consume most of the first viewport. Current layout has no horizontal overflow; the new cue makes the below-fold player discoverable, but recheck density after the poster redesign.

## Verification and limits

- Direct Playwright capture in Microsoft Edge, with isolated Supabase test configuration: document widths were 1440/1440, 390/390 and 320/320. The embedded player rendered actual video frames for the selected lesson in this capture. Scroll-end geometry confirms course note/guide clearance.
- `npm run check:runtime`: **PASS**, 28 protected runtime files.
- Targeted runtime E2E: iPhone simulator flow, Pixel simulator flow, free-course responsive layout and the new bottom-nav surface assertion each printed `ok` (**4 cases**). The Windows Playwright runner did not exit after the final case and was interrupted; according to the review rule the suite is **CHƯA XÁC NHẬN**, not PASS.
- Full runtime rerun: all **52/52** Playwright cases printed `ok`, but the runner emitted no summary and remained alive after test 52. It was interrupted; command exit code was **1**. Record this as **CHƯA XÁC NHẬN** until teardown exits naturally with a successful code.
- `npm run test:sites`: **PASS**, 4/4.
- First canonical `npm run build` attempt: **FAIL** because sandbox write to `node_modules/.vite-temp/...` returned `EPERM`; later full build verification is recorded below. The isolated build at that point built 580 modules and passed the known-pattern client secret scan on 13 files. The then-measured learner entry was 599.62 kB raw / 185.65 kB gzip. Capacitor parallel build reached its isolated web build and secret scan but `cap sync android` failed with `EPERM`; no APK/install was verified and ADB showed no connected device.
- Screenshots do not verify keyboard-only focus, screen-reader order, contrast with all states, reduced motion, actual Android/iOS WebView behavior, or complete WCAG 2.2 AA. No physical iPhone or Android device was connected for this pass.
- No staging schema/function, YouTube Studio metadata, hosted deployment, AI setting, teacher invite, or production state was changed.

## Follow-up verification — Playwright teardown, 2026-10-03

- The earlier interrupted E2E results above are superseded by this clean-exit rerun. On Windows, Playwright's managed `webServer` printed its shutdown message while the Vite PID launched for the test still held its port; stopping that exact test-owned PID allowed the prior run to finish. The harness now starts Vite from Playwright `globalSetup` and returns an explicit `server.close()` teardown instead of asking Playwright's shell-managed webServer to kill a nested process.
- Added `npm run test:playwright-environment`: **PASS 1/1**, with canary values confirming that Vite receives only the fictional Supabase URL/key and none of the three known server credential variables. A one-case Edge smoke exited naturally **PASS 1/1**. The complete `npm run test:runtime -- --workers=1` on Edge then exited **0, PASS 52/52**; `check:runtime` was **PASS 28/28**.
- The first clean-exit full run exposed one stale English-copy assertion (51/52). The assertion now matches the current caption notice and checks both the channel-caption disclosure and YouTube auto-caption hint; the focused English flow and subsequent complete suite pass. Product copy/data was not changed.
- The original 320×568 screenshot showed only the beginning of the player card. A new responsive hint, limited to viewports at or below 360×700 in portrait, states “Cuộn xuống để xem video và phát trong ứng dụng.” A fresh Edge screenshot is saved in `run-03/09-course-detail-320x568-scroll-cue.png`; the flow test now requires the hint fully in view and scrolls until the entire Play label is in view before tapping. No privacy/caption notice was removed or covered.
- After this UI change, `npm run test:runtime -- --workers=1` exited **0, PASS 52/52** with runtime integrity **28/28**. The short portrait responsive case passed. The cue is UI evidence in Edge only, not physical-device confirmation.
- `npm run test:sites` **PASS 4/4**. A scoped local build approval allowed canonical `npm run build` to complete **PASS** (runtime integrity 28/28, TypeScript, Vite 580 modules, Sites preparation); `npm run check:bundle-secrets` then passed on 13 text files. The learner entry is 600.52 kB raw / 185.81 kB gzip and still triggers Vite's >500 kB warning. This refreshed local `dist` only; no hosted deployment occurred.
- `npm run test:dependency-security` **PASS 1/1**; current full `npm audit --audit-level=high` and production-only `npm audit --omit=dev --audit-level=high` both report **0 vulnerabilities**. This does not replace source/permission review.
- No staging, hosted preview/production, YouTube Studio, invite, AI/provider, native install or learner-data state changed. Physical Android/iOS, keyboard-only and screen-reader behavior remain unverified.

## Recommendation

Keep the current course/detail structure. The short-screen discovery cue is implemented and covered. Before promoting free courses, close the rights/caption/instructor/safety review gates and improve the pre-play media treatment without inventing an unapproved asset; then verify the resulting UI on a connected Android device and real iOS Safari.

## Native package follow-up — 2026-10-03

- `npm run android:parallel:build`: **PASS**. APK `android/app/build/outputs/apk/parallel/app-parallel.apk`, 6,529,173 bytes, SHA-256 `7600E38C2B482AD30E29C6210580AA00CF7FC397AF8D27CE5915473408652B94`. APK metadata confirms application ID `com.nilaza.motchutyoga.mcydebug`; the existing production and `.debug` identities are unchanged.
- `adb devices -l` returned no connected devices. The APK was **not installed or device-tested**. Physical Android/WebView and iOS Safari verification remain open; this package build does not constitute release readiness.
- No staging, hosted deployment, YouTube Studio, AI/provider, teacher invitation, learner-data or production state was changed.
