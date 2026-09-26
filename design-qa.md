# MCY prototype visual and interaction QA — 2026-09-25

**Source visual truth:** `C:\Users\Admin\AppData\Local\Temp\codex-clipboard-0babd210-7680-40e3-8b24-0c410aef41ab.png` (1043 × 1508 montage; check-in, reflection and journey panels). Product changes approved in `analyse/ux-audit-2026-09-25/MCY_CHECKIN_JOURNEY_PLAN.md` take precedence where the early concept implied unmeasured improvement.

**Rendered implementation:** `http://127.0.0.1:4173/`, Codex in-app browser tab 2. Captures were displayed in this task during QA; the browser capture API did not export a screenshot file path. iPhone screen measured **393 × 852 CSS px at DPR 1** with a 1400 × 1200 test viewport; Pixel 10 was also inspected at the ordinary preview size. The source check-in panel is about 336 × 734 px inside the montage, so comparison used anatomy, hierarchy and interaction state rather than a raw pixel overlay. The viewport override is reset after QA.

**States compared:** empty check-in with body map and energy choices; selected shoulder and region editor; body illustration picker; before/after reflection; live journey snapshot; synthetic day-30, day-20 skipped, day-1 multi-record and comparison states. The working app was captured in the browser at each key state. Console error log was empty.

## Findings and iteration

1. **[P2 fixed] Check-in hierarchy:** The first implementation put the region fallback list before the energy question, hiding the concept's energy card below the first viewport. The energy card now sits immediately after the body image; the text region list remains available by scrolling. Re-captured on the iPhone at 393 × 852: heading, body points, energy card and fixed CTA appear together.
2. **[P2 fixed] Check-in CTA color:** The initial footer used terracotta, while the check-in panel in the source uses forest green. The check-in footer is now forest green; the recommendation CTA remains terracotta.
3. **[P1 fixed] Reflection state:** Reusing the pre-practice observation as an editor default had preselected a post-practice level. The editor now starts with no post level and a disabled save button, while retaining the shoulder side as context. Each region has an explicit “Giữ như trước” action.
4. **[P2 fixed] Timeline discoverability:** The first 30-day strip began at day 1 even when day 30 was selected. The 30-day view now lists only recorded days, newest first, and keeps skipped records explicit. The 7-day view still exposes blank days without inventing values.
5. **[P2 fixed] Region sheet:** The first sheet required scrolling to find “Lưu vùng này”. A taller snap shows the action on iPhone and Pixel. Text entry remains keyboard-aware.

**Current full-view comparison:** The same ivory, forest-green, terracotta and serif language remains visible. The app keeps the concept's body map, energy faces, photo-led recommendation, circular timer, paired reflection and journey body map. The approved extensions add side-specific input, optional illustration style, multiple snapshot records and a short AI conversation. The body figure is a soft photographic illustration rather than the earlier flat silhouette; this is a deliberate visual prototype variant to review with learners.

**Focused comparison:** On the iPhone check-in capture, all four marker targets sit on the named neck/shoulder/upper-back/lower-back regions, and the shoulder editor keeps left/right choice legible. On the reflection capture, the pre and post illustrations remain separate and no post marker appears until the learner chooses a level. On the journey capture, a selected day shows its own body map and notes rather than a generic trend image. Copy labels synthetic outcomes and does not claim a percentage or a cure.

**Interaction checks:** iPhone and Pixel navigation; region selection and editing; style picker; dialogue to recommendation to practice to reflection to journey; no-match content path; synthetic timeline day switch; multiple records in one day; comparison; and modal confirmation when replacing recorded regions. `npm run build` and protected runtime integrity passed. `git diff --check` found no whitespace errors. The browser console had no errors.

**Remaining P3 / next research round:** Validate whether adults prefer the photographic body illustration or a flatter map, whether the small energy labels remain comfortable at larger text settings, and whether the 30-day newest-first order matches user expectations. A 5–7-person usability test remains future work; no learner outcomes or production integrations were tested.

**final result: passed**
