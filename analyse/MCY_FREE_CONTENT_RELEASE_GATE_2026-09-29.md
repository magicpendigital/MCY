# Free content release gate — 2026-09-29

## Scope

This gate covers the three free-course shells in MCY and the 38 real videos from the **Một chút yoga** YouTube channel. It does not authorize paid courses, a paid video host, public YouTube visibility, or a Production deployment.

## Evidence

| Gate | Status | Evidence / remaining action |
|---|---|---|
| YouTube mapping and access | PASS · public metadata cross-check, 38/38 (2026-09-30) | Each catalog ID resolves to the same YouTube `videoDetails.videoId`, title/topic, owner channel ID and author; current watch-page metadata reports `isUnlisted=true`, `isPrivate=false`, `playabilityStatus=OK`. At least one returned `lengthSeconds` value matches each catalog display duration. This is a read-only public-page check, not a Studio UI audit or proof of real-device iframe playback; repeat before publication because channel state can change. |
| YouTube learner metadata | PASS | Titles were normalized, the same safety-oriented description was saved, and the audience was set to “Không, nội dung này không dành cho trẻ em”. |
| In-app playback | PARTIAL · local browser only | The app uses `youtube-nocookie.com/embed`, loads only after a learner chooses Play, and does not download or mirror the videos. Playwright checks one active player and simulates a blocked embed to verify in-app retry plus an explicitly chosen YouTube fallback. One local Edge capture showed actual video frames; a later capture of the same sample remained at a loading spinner. This is variable sample evidence, not stable playback for all 38 clips or physical-device/hosted playback. |
| Learner copy and brand surface | PASS | Catalog/detail copy no longer describes these lessons as preview, mockup, private-placeholder or access preparation. Vietnamese copy is the source copy; English remains explicitly partial. |
| Desktop and simulator behavior | PASS | Desktop web remains inside the centered learner canvas. iPhone and Pixel review flows pass the learner runtime suite. |
| Rights evidence | CHƯA CHẠY | Read-only YouTube Studio audit on 2026-09-30 confirmed the owner-controlled channel, 38-item Shorts inventory, and first-page rows with `Không công khai` plus `Thông báo —`. This proves platform state only. Record the exact owner declaration and any third-party evidence in [MCY_FREE_CONTENT_RIGHTS_EVIDENCE_2026-09-30.md](MCY_FREE_CONTENT_RIGHTS_EVIDENCE_2026-09-30.md) before a wider release. |
| Captions and language metadata | BLOCKED · Studio shows 0 languages / 38 (2026-10-01) | Channel-provided caption tracks are not listed for any of the 38 Shorts in YouTube Studio. The app discloses the missing Vietnamese track and points learners to CC for possible YouTube auto-captions. Confirm audio language and add/review captions with the instructor before public promotion; Studio status does not prove auto-captions are unavailable in playback. |
| Thumbnail and poster review | CHƯA CHẠY | YouTube auto-frames/thumbnails have not been reviewed clip-by-clip for legibility, safety and brand consistency. |
| Instructor attribution | CHƯA HOÀN TẤT | The owner identified Huyền My as instructor of the 38 clips and supplied the account invitation address on 2026-09-30. Do not store or display that email. Bind attribution to the display name on her verified account after the teacher onboarding/API gates pass; no invite or role was issued in this change. Obtain her rights declaration and preferred display name before publication. |
| Instructional and safety review | CHƯA CHẠY | Metadata cleanup is not a substitute for watching each clip. A qualified reviewer still needs to verify cues, transitions, contraindication language, camera framing and whether the course order is pedagogically sound. |
| Production release | BLOCKED | Keep the videos unlisted and use the preview deployment/debug APK until the open attribution, rights, caption, thumbnail and instructional/safety gates have evidence and an explicit release decision. |

## Read-only YouTube reconciliation — 2026-09-30

- Cross-checked all 38 IDs in `src/courses/freeCourses.ts` against YouTube's public watch-page metadata and oEmbed endpoint. All 38 returned HTTP 200; each page's video ID matched the catalog ID, channel ID was `UCHd1MgfJI7Zx4ij06vkg9rQ`, and author was `Một chút yoga`.
- All 38 current watch-page records reported `isUnlisted=true`, `isPrivate=false`, and `playabilityStatus=OK`. This confirms current public-page/player metadata only; no Studio controls were changed, and it does not substitute for rights evidence or a real iframe/device playback test.
- Titles and pose/topic wording correspond to the catalog. Lessons 19–31 omit the sequence prefix in the app title while retaining it as the lesson number; no ID-to-topic mismatch was found. Each catalog duration matched at least one YouTube `lengthSeconds` field. Where two values appeared they differed by one second, so preserve the existing display duration convention rather than claiming subsecond or exact media-duration validation.
- This closes the mapping/access metadata subgate only. The separate rights declaration, instructor-account binding, caption/language, poster, instructional/safety and production release gates remain open.

## Read-only YouTube Studio recheck — 2026-10-01

- Read-only review of the channel's Shorts inventory showed 38/38 videos still set to **Không công khai**. The titles displayed in Studio match the corresponding titles in `src/courses/freeCourses.ts`; the descriptions retain the safety-oriented text. No Studio fields were edited or saved.
- The Studio Subtitles table was paginated through all 38 Shorts. Each row showed **Ngôn ngữ: 0**. This is evidence that Studio listed no channel-provided subtitle language/track for these videos at review time. It does not establish whether YouTube may generate automatic captions in an individual player, nor does it verify audio language, transcript accuracy, caption timing, or accessibility quality.
- The free-course catalog now carries `channelCaptionLanguages` per lesson and visibly notes that no Vietnamese channel-provided caption is listed, while directing learners to check the player's CC control for possible auto-captions. Update this metadata and copy after any caption track is reviewed and added; do not infer language from the app UI locale.
- Caption release status is **BLOCKED**, not merely unreviewed: teacher-approved Vietnamese captions and human review have not been supplied. Do not synthesize or upload captions, change visibility, or save/publish channel metadata without the required content review and fresh owner confirmation.

## UI/UX follow-up — 2026-09-30

**Audit correction:** The known 19/21 swap was corrected and covered by sampled E2E checks. A read-only cross-check of all 38 public YouTube pages now closes the ID/title/duration/access metadata subgate; it is not a Studio UI audit and does not close the separate iframe playback, rights, accessibility or instructional-review gates.

- PASS: Course detail now renders portrait lesson media in a source-aware 9:16 frame instead of forcing the Shorts footage into a 16:9 mock frame. Landscape media keeps a 16:9 path for future approved content.
- PASS: Course 3 description, lesson guidance and source attribution were rewritten for learners. The surface no longer uses internal editorial wording or privacy-domain terminology.
- PASS: Manual local-browser review confirmed the course detail keeps the warm ivory / forest / terracotta system, serif hierarchy and restrained course framing. The daily practice catalog remains the primary entry point; free courses remain a supporting content shelf.
- PASS: Manual local-browser review confirmed Course 3 renders 7 real YouTube players with 360 × 640 portrait boxes and no placeholder cards.
- PASS: Vercel Preview deployment `AqPu4F9Xg` is Ready from commit `ba0afbb`; the branch alias `mcy-git-codex-mcy-p1-preview-magicpens-projects.vercel.app` serves the updated course detail.
- CHƯA CHẠY: Android web assets synced successfully on 2026-09-30, but `npx cap build android` failed twice: first with a process `JAVA_HOME` mismatch, then with `AccessDeniedException` on SDK `build-tools/35.0.0/core-lambda-stubs.jar` after selecting JDK 21. No current APK was built or installed.
- PASS with runner caveat: all 25 Playwright cases reported `ok` on 2026-09-30, including 320×568 course action visibility, iPhone/Pixel simulator, desktop canvas and Owner surface. The run was interrupted after the last case while the Playwright-managed Vite child remained alive; the runner's final exit/teardown status was not verified.
- BLOCKED: This visual pass does not close rights, caption, poster, full mapping or instructional-review gates. Production release remains blocked until those gates have evidence and an explicit release decision.

## Checks run for this handoff

- `npm run check:runtime` — PASS, 28 protected files
- `npm run build` — PASS; main learner bundle 830.07 kB minified / 245.13 kB gzip, with Vite's >500 kB warning
- Playwright — 25/25 individual cases reported `ok`; runner exit/teardown not verified
- `npm run test:sites` — PASS, 4/4
- `npm run check:bundle-secrets` — PASS, 7 scanned text files
- `npm run test:teacher-acl` and `npm run test:checkin-rpc-anon` — PASS, PostgreSQL `42501`, no data changed
- `npm run test:teacher-actors` — CHƯA CHẠY; five isolated authenticated actor tokens are unavailable
- `npm audit --omit=dev --audit-level=high` — exit 0 for high threshold, but 3 moderate advisories remain through `@capacitor/cli → xcode → uuid`
- `git diff --check` — PASS

## Rollback / disable path

- Web: do not promote the preview branch to Production. If the preview is unsuitable, return the preview branch to the last known-good revision and redeploy it.
- YouTube: keep all 38 videos **Không công khai**; revert a specific video to private only from the owner-controlled YouTube Studio after identifying the affected ID.
- Android: reinstall the previous debug APK from the last verified build; the app does not change learner data as part of this content update.
