# MCY learner UX audit — free YouTube lesson player

Date: 2026-10-03  
Scope: course detail pre-play and embedded-player layout on desktop web and narrow mobile web. This is a focused UX/accessibility review, not a full-app or production sign-off.

## 1. Audit scope

- Desktop web at 1440×1000; mobile web at 390×844 and 320×568.
- Review of source/caption disclosures, scroll discovery, portrait poster/player sizing, and course description/navigation placement.
- Microsoft Edge through the isolated Playwright fixture. No staging or production requests were used for the layout test.

## 2. User goal

Choose a free lesson and watch it inside the app, with clear source and caption information and no abrupt change in the screen when playback starts.

## 3. Strengths

- The course detail retains MCY's ivory, forest and terracotta visual language; it does not imitate a generic chat or external video page.
- Caption availability and YouTube data handling remain visible before playback. The in-app Play action remains explicit and the learner can move between lessons.
- At desktop width, portrait media and lesson copy form a balanced two-column composition. At narrow widths, the source and caption notes remain readable and the document does not overflow horizontally.
- The poster now uses the same 9:16 geometry as portrait playback. Mobile portrait screens show a short scroll cue before the media; a learner can scroll to the complete Play control.
- Keyboard focus, course readability/contrast assertions, iPhone/Pixel review flows, and short-viewport reachability continue to pass in the broader local suite.

## 4. Notable risks

- The pre-play treatment is intentionally typography-led because there is no approved, rights-reviewed still available. It is not evidence of the lesson's visual content.
- On 390×844 and 320×568, the portrait player and Play action continue below the first viewport after the disclosures. The cue communicates that scrolling is needed; the player is not intended to shrink/crop a portrait lesson to imitate a landscape card.
- Content-rights evidence, current caption review, verified instructor attribution and instructional/safety review remain open release gates. This visual change does not close them.

## 5. Opportunity areas

- If a thumbnail is later approved with rights evidence, compare it with the restrained text poster without changing the player aspect ratio.
- Verify portrait playback, audio, YouTube identity/referrer behavior and safe-area handling on a connected Android device and a real iOS Safari/WebView before native distribution.

## 6. Optional comparison context

No external product comparator was needed; the relevant comparison is between the current poster and the app's own portrait source/player contract.

## 7. Recommendations

1. Keep poster and active portrait player at a stable 9:16 ratio; do not add an unreviewed thumbnail or mock frame.
2. Retain the mobile scroll cue and the full scroll-reachable Play control.
3. Close rights, caption, instructor and instructional-safety gates before publishing the course as production content.
4. Repeat the player check on physical devices before release; Edge fixture results are not native playback evidence.

## Evidence and limits

- Screenshots: [desktop detail](01-course-detail-desktop-portrait-poster.png), [mobile 390×844](02-course-detail-mobile-390x844.png), [mobile 320×568 with cue](03-course-detail-mobile-320x568-scroll-cue.png).
- `npm run test:runtime -- --workers=1 --reporter=line` in Microsoft Edge: **PASS 55/55**. The focused layout test checks portrait ratios at mobile and desktop widths, no horizontal overflow, and ≤1 px bounding-box change when the iframe replaces the poster. Its iframe response is locally stubbed for deterministic geometry; this does not prove live YouTube playback.
- `npm run check:runtime`: **PASS 28/28**; `npm run test:playwright-environment`: **PASS 1/1**; `npm run test:sites`: **PASS 4/4**.
- `npm run build`: **PASS**, TypeScript + Vite 581 modules + Sites preparation. Vite still reports the learner entry above 500 kB (601.30 kB raw / 186.06 kB gzip); this optimization concern remains open.
- `npm run check:bundle-secrets`: **PASS**, 13 text files; `git diff --check`: **PASS** (Git emitted only existing LF→CRLF advisory warnings).
- Physical Android/iOS, screen-reader behavior and a fresh real-player playback capture were **CHƯA CHẠY** in this pass. No deploy, staging migration, invitation, AI/provider request, YouTube Studio edit or production change occurred.
