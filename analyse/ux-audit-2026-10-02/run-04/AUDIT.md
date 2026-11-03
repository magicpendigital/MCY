# UX audit — free learning flow

**Captured:** 2026-10-02, local learner build at `http://127.0.0.1:4178/?mode=web`  
**Browser:** Microsoft Edge through Playwright; visible app preview separately checked in the Codex in-app browser.  
**Scope:** welcome, body check-in, free-course catalog, course detail and the user-initiated YouTube player. Viewports include 1440×1000 desktop and 390×844 mobile. This is a focused UX/visual review, not a complete application or WCAG conformance audit.

## Steps and health

1. **Welcome — Good.** Desktop and mobile retain the selected warm-ivory, forest and terracotta language; the wordmark, photo and inset action remain legible and within the viewport. See `../run-03/01-welcome-desktop.png` and `../run-03/02-welcome-mobile.png`. The English control is development-only and the production-build E2E test verifies that the incomplete locale is not exposed in production.
2. **Body check-in — Good, with device verification still open.** The full-body map, equally usable text regions, step indicator and distinct skip action remain visible. Desktop and mobile screenshots: `../run-03/04-checkin-desktop.png` and `../run-03/03-checkin-mobile.png`. Automated coverage exercises iPhone/Pixel simulator layouts, short portrait/landscape viewports, scrolling, focus, and fixed actions; this does not replace physical iOS/Android assistive-technology testing.
3. **Free-course catalog — Good after copy refinement.** The wide layout uses the available desktop canvas without a phone frame or horizontal overflow. At mobile size all three course cards fit in the initial view after removing repetitive metadata; lower source/privacy guidance remains scrollable above navigation. Updated screenshots: `01-catalog-desktop.png`, `02-catalog-mobile.png`, `03-catalog-mobile-scrolled.png`. Card action now correctly says **“Mở khóa học”**; the note explains that the player loads only after the learner chooses Play.
4. **Course detail and player — Good, subject to platform/content gates.** The page groups lesson count, free access and channel, then keeps caption/source/privacy notes before the video. Desktop and mobile: `04-course-detail-desktop.png` and `05-course-detail-mobile.png`. The player is user-initiated and the updated post-load message says it is open while MCY does not track viewing progress. In the in-app browser, the real YouTube iframe displayed the lesson; a separate Playwright image caught a transient loading spinner and was rejected as screenshot evidence. Native WebView identity/playback and rights/caption review remain unverified.

## Findings and changes

- The catalog's previous note implied that tapping a course immediately played a video; in fact it opens a course detail first. Corrected the note and made its player-load behavior explicit.
- Replaced repetitive “YouTube · miễn phí / đã sẵn sàng” metadata with concise “Miễn phí / Mở khóa học” labels. The course detail still clearly identifies YouTube and the channel.
- The previous post-iframe copy said MCY could not confirm playback had started, which could contradict a visibly playing video. It now states that the player is open and playback progress is not tracked.
- Desktop is a centered responsive learner surface, not a phone mockup. The wider layout keeps a readable content measure; 390 px captures have no horizontal overflow.
- Automated checks also cover 320 px, short landscape, contrast/font-size assertions, keyboard focus, inactive routes and safe-area actions. Screenshot review alone does not establish WCAG 2.2 AA conformance.

## Evidence and limitations

- Accepted screenshots are the numbered PNGs referenced above. The earlier `run-02` capture included transition/full-page artifacts and is not relied upon; `run-03/10-youtube-in-app-player-mobile.png` showed a loading spinner and is explicitly not accepted.
- After the final copy/test edit, Microsoft Edge Playwright passed **46/46** tests. `tsc --noEmit`, 28 protected-runtime checks, client-secret bundle scan, 41 offline AI/Owner/teacher/Sites tests and `git diff --check` passed. A standalone production Vite bundle was emitted to a unique temporary directory; canonical Sites packaging and deploy were not completed.
- No physical iPhone/iOS Safari, native WebView, production Vercel deployment, screen-reader session, or teacher workflow was evaluated in this capture.

**Verdict:** the learner-facing free-video flow is visually coherent and its copy now matches the actual interaction. This UX result does not clear the separate database, teacher, AI, rights, native, deployment or production-release gates; the MVP remains **not production-ready**.
