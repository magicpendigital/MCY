# Free content release gate — 2026-09-29

## Scope

This gate covers the three free-course shells in MCY and the 38 real videos from the **Một chút yoga** YouTube channel. It does not authorize paid courses, a paid video host, public YouTube visibility, or a Production deployment.

## Evidence

| Gate | Status | Evidence / remaining action |
|---|---|---|
| YouTube mapping and access | PASS | 38 stable video IDs are mapped into three app courses. All 38 videos were saved as **Không công khai** in YouTube Studio after explicit owner confirmation on 2026-09-29. |
| YouTube learner metadata | PASS | Titles were normalized, the same safety-oriented description was saved, and the audience was set to “Không, nội dung này không dành cho trẻ em”. |
| In-app playback | PASS | The app uses `youtube-nocookie.com/embed`, renders real unlisted players, and does not download or mirror the videos. Playwright verifies 18/18 iframe embeds in the first course and zero placeholders. |
| Learner copy and brand surface | PASS | Catalog/detail copy no longer describes these lessons as preview, mockup, private-placeholder or access preparation. Vietnamese copy is the source copy; English remains explicitly partial. |
| Desktop and simulator behavior | PASS | Desktop web remains inside the centered learner canvas. iPhone and Pixel review flows pass the learner runtime suite. |
| Rights evidence | CHƯA CHẠY | Channel access and owner confirmation do not prove rights for every person, location, music track or source asset. Store an owner rights declaration and any third-party evidence before a wider release. |
| Captions and language metadata | CHƯA CHẠY | No complete caption inventory or human caption review has been recorded for all 38 clips. Verify Vietnamese captions, audio language and accessibility before public promotion. |
| Thumbnail and poster review | CHƯA CHẠY | YouTube auto-frames/thumbnails have not been reviewed clip-by-clip for legibility, safety and brand consistency. |
| Instructional and safety review | CHƯA CHẠY | Metadata cleanup is not a substitute for watching each clip. A qualified reviewer still needs to verify cues, transitions, contraindication language, camera framing and whether the course order is pedagogically sound. |
| Production release | BLOCKED | Keep the videos unlisted and use the preview deployment/debug APK until the three content gates above have evidence and an explicit release decision. |

## Checks run for this handoff

- `npm run check:runtime` — PASS
- `npm run build` — PASS; Vite reports a non-blocking large main chunk warning
- `MCY_PLAYWRIGHT_CHANNEL=chrome npm run test:runtime -- --reporter=line --workers=1` — PASS, 21/21
- `npm run test:sites` — PASS, 4/4
- `npm run check:bundle-secrets` — PASS
- `git diff --check` — PASS

## Rollback / disable path

- Web: do not promote the preview branch to Production. If the preview is unsuitable, return the preview branch to the last known-good revision and redeploy it.
- YouTube: keep all 38 videos **Không công khai**; revert a specific video to private only from the owner-controlled YouTube Studio after identifying the affected ID.
- Android: reinstall the previous debug APK from the last verified build; the app does not change learner data as part of this content update.
