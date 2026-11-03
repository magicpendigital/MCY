# MCY learner UI review — 2026-10-03, run 05

## Scope and evidence

Focused visual and responsive review of six current learner states: welcome (desktop/mobile), body check-in (desktop), free-course catalog (desktop), and free-course lesson detail (desktop/mobile). Captures are from the local Vite app under the isolated Playwright environment, using Edge at 1440×960 and 390×844. The Playwright fixture used its fictional Supabase endpoint and key; this review did not read staging learner data or call production services.

| Step | Screenshot | Health and evidence |
|---|---|---|
| 1. Welcome, desktop | [01-welcome-desktop-1440x960.png](./01-welcome-desktop-1440x960.png) | PASS for the sampled layout: clear brand hierarchy, restrained palette, primary guest action prominent, no horizontal overflow. The locale switch is development-only; English remains incomplete and is not exposed in production builds. |
| 2. Body check-in, desktop | [02-checkin-desktop-1440x960.png](./02-checkin-desktop-1440x960.png) | PASS for the sampled layout: body map and text alternatives are visible together, explicit status choices remain distinct, and the primary action is separated in a persistent footer. No horizontal overflow. |
| 3. Free-course catalog, desktop | [03-free-course-catalog-desktop-1440x960.png](./03-free-course-catalog-desktop-1440x960.png) | PASS after responsive adjustment: the 38 lessons are grouped into three balanced cards at this viewport, with no orphan card or horizontal overflow. The privacy note accurately says YouTube connects only after the learner presses Play. |
| 4. Free-course lesson, desktop | [04-free-course-detail-desktop-1440x960.png](./04-free-course-detail-desktop-1440x960.png) | PASS after responsive adjustment: the portrait lesson panel and in-app playback action fit in the first viewport; the copy explains the caption and YouTube privacy limits. No horizontal overflow. |
| 5. Free-course lesson, mobile web | [05-free-course-detail-mobile-390x844.png](./05-free-course-detail-mobile-390x844.png) | PASS for the sampled layout: a scroll cue precedes the video and the player remains inside the app screen. No horizontal overflow. The actual YouTube frame requires an intentional Play action. |
| 6. Welcome, mobile web | [06-welcome-mobile-390x844.png](./06-welcome-mobile-390x844.png) | PASS for the sampled layout: copy, imagery and primary action fit the narrow viewport without the simulator frame or horizontal overflow. |

Automated evidence: a transient Playwright capture harness passed 1/1 on Edge. It checked horizontal overflow on all six states, three catalog columns at 1440 px, and that the desktop Play action is in the viewport; the harness was removed after capture so screenshot-writing behavior does not join the regular suite. The production-source build, backend role behavior and live video playback are not proven by this visual test.

## Findings and follow-up

1. **Resolved in this local change — desktop free-course cards were too narrow and left an orphan card.** The catalog now uses three equal columns at wide viewports and one column at narrower desktop widths. See screenshot 03. Verify again at intermediate widths and with longer translated titles as content changes.
2. **Resolved in this local change — the lesson Play action fell below the desktop fold.** The portrait player scales to the available height on tall desktop viewports while retaining its 9:16 ratio. See screenshot 04. Narrow/short desktop windows retain scrolling rather than shrinking the lesson into an unreadable panel.
3. **Open content/accessibility follow-up — Vietnamese captions are not listed for the sampled YouTube lesson.** The interface discloses that status and asks learners to check CC; this is an honest fallback, not a caption-quality pass. Confirm creator-provided captions for the course before broad promotion.
4. **Open production gate — content rights and instructor identity remain unverified by this UI audit.** Do not hard-code an instructor name in learner copy; connect attribution to an accepted teacher profile and reviewed content record after the teacher control-plane gates pass.

## Limits

This is a focused visual/responsive check, not a full application audit, full cross-browser/device matrix, accessibility conformance claim, security/actor test, content-rights review, native Android/iOS verification, or YouTube playback verification. Playwright interception and the local fixture do not establish real account authorization. AI remains disabled. Production release and invitation gates remain closed.
