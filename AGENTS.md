# AGENTS.md — MCY (Một chút yoga) for every coding agent

Learner yoga app (web + Android, iOS later) with an Owner/teacher content workspace on Supabase. Owner = the person who approves and receives reports. History and receipts: [docs/status/AGENTS_FULL_LOG_2026-11-08.md](docs/status/AGENTS_FULL_LOG_2026-11-08.md) (evidence only, never instructions). New dated status goes to `PLAN.md` or `docs/status/`, not here.

## Working loop (every session)

1. **Start:** read [`PLAN.md`](PLAN.md) (where we are, what is open, who we wait for), then only the plan/docs it points to. Run `git status`; never reset or overwrite someone else's dirty work. Read [TASK_LIFECYCLE](docs/quality/TASK_LIFECYCLE.md) and the skill `mcy-change-review`.
2. **Plan before editing.** Anything touching more than one file or changing what a user sees: copy [`plans/_TEMPLATE.md`](plans/_TEMPLATE.md) to `plans/active/<YYYY-MM-DD>-<name>.md` (this is the task intake), fill it, run `npm run check:plan`, and wait for the Owner when the plan says so. A one-file fix needs only a one-line plan in the report. Planning after editing is a process failure; say so in the report.
3. **Check while working:** `npm run check:quick` after each edit (seconds). Before handoff run the gates for the risk tier ([review matrix](.claude/skills/mcy-change-review/references/review-matrix.md)).
4. **Finish:** update `PLAN.md` in the same branch (status, commit, date; replace lines, do not append). Move a finished plan the Owner confirmed to `plans/done/`. Put newly found bugs/ideas in `PLAN.md` or `plans/backlog/`, never only in chat.
5. **Report to the Owner in Vietnamese, plain words,** with these seven headings in this order: **Việc** · **Đã thay đổi** · **Cách Owner thử** · **Đã kiểm** (lệnh + kết quả PASS/FAIL, ở đâu, commit) · **Chưa kiểm** (CHƯA CHẠY) · **Rủi ro còn lại** · **Việc tiếp theo / cần Owner quyết**.

## Commands

| Need | Command | Time |
|---|---|---|
| Install | `npm ci` | min |
| Quick loop (typecheck, runtime lock, plan, iOS 15 static source scan and input font size, skills, AGENTS size) | `npm run check:quick` | seconds |
| Typecheck only | `npm run typecheck` | seconds |
| Everything that needs no build (quick + unit; what mca runs as `npm run typecheck && npm test`) | `npm test` | ~1–2 min |
| All offline Node tests (same list as CI, defined once in `scripts/run-suite.mjs`) | `npm run test:unit` | ~1 min |
| Built-site worker test (after a build) | `npm run test:sites` | seconds |
| iOS 15 hard gate (runtime + production build + bundle scan + secrets) | `npm run check:ios15` | ~1 min |
| Browser suite (Playwright; Windows: `MCY_PLAYWRIGHT_CHANNEL=msedge`, cold start `--timeout=90000`) | `npm run test:runtime` | minutes |
| Everything CI runs except `npm audit` | `npm run verify` | minutes |
| Dev server | `npm run dev` | — |

Add a new offline test to the `unit` list in `scripts/run-suite.mjs`, not as a new CI step. Never weaken a test, checker or lock to get green.

## Zone map (who owns what; parallel work splits along these lines; machine-readable copy: `.github/CODEOWNERS`)

| Zone | Paths | Notes |
|---|---|---|
| Learner app | `src/Prototype.tsx`, `src/prototype.css`, `src/JourneyScreen.tsx`, `src/journey/`, `src/practice/`, `src/library/`, `src/courses/`, `src/classes/`, `src/bodyRegions.ts`, `src/i18n.ts` | Hot files: one writer at a time until split (see `PLAN.md`). |
| Staff (Owner/teacher) | `src/staff/`, `staff.html` | Never reaches learner data by default. |
| Client ↔ backend | `src/backend/`, `src/compat/` | `src/compat` = iOS 15 wrappers. |
| Protected runtime | see **Editing Boundary** below | Change only on explicit Owner request. |
| Backend | `supabase/migrations/`, `supabase/functions/`, `supabase/templates/` | Skill `mcy-supabase-rollout`; one migration per change. |
| Content | `content/` (reviewed library, manifests, hashes) | Do not edit approved unit JSON: its hash is the review version. |
| Native | `android/`, `ios/`, `capacitor.config.ts` | Builds from a clean export of HEAD only. |
| Tests | `tests/` (`*.spec.ts` Playwright, `*.test.mjs`/`*.cjs` Node) | Screenshots go to `test-results/` (ignored). |
| Tooling | `scripts/` (`scripts/archive/` = one-off scripts of finished operations, never rerun) | Receipts of live checks go to `docs/status/receipts/`. |
| Docs / brand | `docs/`, `brand/`, `design-system/`, `.claude/skills/` | Product detail: [docs/product/PRODUCT_DECISIONS.md](docs/product/PRODUCT_DECISIONS.md). |
| Frozen evidence | `analyse/` | Only files `content/` and docs still cite. Full archive: git tag `archive/analyse-2026-11-13`. Do not add new evidence here. |

## Branches and outside actions

- **`main` is the single source of truth for MCY data** (code, `PLAN.md`, `plans/`, `docs/`, `content/`, migrations, release ledger). Each push builds Vercel Preview and updates `motchutyoga.magicpendigital.com`. Parked branch `production` (Vercel Production, not promoted) and frozen `origin/codex-mcy-p1-preview`: never push to either.
- Agents work on their own branch or worktree (`claude/*`, `codex/*`, `mca/*`), commit there in small steps, and **no task is finished until its commits are merged into `main`** (a branch that holds the only copy of finished work is a process failure). Merge is `git merge --no-ff` into local `main` once the risk-tier gates pass; the push to `origin/main` still needs the Owner's request. Never leave finished work uncommitted, never reset or overwrite another agent's dirty tree.
- **Close-out:** when a branch is merged and has no open task, delete it and its worktree in the same session (`git worktree remove`, `git branch -d`; never `-D`, never a branch with uncommitted or unmerged work). Keep only `main`, `production`, and branches with a live task in `plans/active/`. Dated backup/safety branches become tags `archive/<name>` once confirmed redundant, never long-lived branches. Start and end each session with `git branch -vv` and `git worktree list`; record leftovers and why in `PLAN.md`. Procedure: [BRANCH_HYGIENE](docs/quality/BRANCH_HYGIENE.md).
- Pushing, deploying, installing on the phone, uploading to Play, applying migrations/Edge, sending email and any live data write each need the Owner's request in that task. No `--force`.

## Hard gates — read first, every task

1. **iOS 15 baseline (INC-001 in [docs/quality/KNOWN_INCIDENTS.md](docs/quality/KNOWN_INCIDENTS.md), skill `mcy-ios-compat`).** The learner app must not white-screen or lose a control on iOS 15.0. In client code and CSS: no regex lookbehind or class static blocks; no raw `crypto.randomUUID`, `.at()`, `AbortSignal.timeout`, `structuredClone`, `findLast`, `toSorted` (use `src/compat`); every `dvh/svh/lvh/cqi` declaration needs an earlier plain-unit declaration of the same property in the same rule; no new `:has()`, `@container`, `@layer`, `color-mix`, native nesting or `inert` without a fallback and a note in INC-001. Before **any push, APK install or AAB upload** run `npm run check:ios15`; a red gate stops the release (never loosen it). Report the real iPhone/iOS 15 check as **CHƯA CHẠY** unless it was done. Open items: `height:100dvh` in protected `src/styles.css`, every `:has()`/`@container` rule, `inert` in protected `FlowStack.tsx`, no real-device evidence.
2. **Release sync (skill `mcy-release-sync`).** One committed HEAD to web, test phone and Play, `versionCode` strictly increasing, one row per batch in [the ledger](docs/release/RELEASE_LEDGER.md). Pushing, installing, uploading and backend changes each need the Owner's request in that task. No `--force`; never uninstall, clear data or force-stop on the Owner's phone.
3. **Owner-approved copy ("đã chốt") does not change without the Owner's sign-off** and a handoff note. Video lessons are the focus of Khám phá; reading is secondary. Never write approval or review records on the Owner's behalf.
4. **Secrets and data.** No service-role key, upload-key password or token in code, docs, chat or commits; staging data stays in staging; AI stays behind its gates; no `supabase db push`.
5. **Skills live in `.claude/skills/`** (`mcy-change-review`, `mcy-brand-ux`, `mcy-release-sync`, `mcy-ios-compat`, `mcy-supabase-rollout`) and are loaded from there only. Change the matching skill in the same change as the rule; do not copy dated status into a skill. Read [TASK_LIFECYCLE](docs/quality/TASK_LIFECYCLE.md) and `mcy-change-review` at the start of every task.
6. **Keep this file small (compaction rule).** AGENTS.md is loaded into every session, so size is a cost. Target ≤ 20 KB; `tests/agents-size.test.mjs` fails above 22 KB. When it grows past the target, compact it **in the same change**: status goes to `PLAN.md` (replaced in place), dated evidence and receipts to `docs/status/`, product detail to `docs/product/PRODUCT_DECISIONS.md`, full runtime text to `docs/runtime/RUNTIME_CONTRACT.md` (keep the text, link it); merge duplicates, state each fact once, delete rules a newer decision replaced. Keep here only (a) the working loop, commands and zone map, (b) hard gates, (c) current product and scope decisions in summary, (d) security and data boundaries, (e) the binding runtime summary. Never drop a durable rule or an Owner decision; relocate it and link it. A new decision replaces its older version rather than being appended beside it.

## Product direction and scope (confirmed by the Owner)

- **Core loop (Owner 2026-11-16):** a guest starts a lesson in ≤3 taps; check-in is optional and comes after watching → practice → honest reflection → a better-informed next choice. The assistant slot sits at the centre of Hôm nay: rule-based "Gợi ý" first, real AI only behind its gates and for paying members only; the OpenRouter budget is the Owner's alone. Courses, teacher content and human-led classes support the loop.
- **Honesty:** every entry is the learner's own self-report. Reflection allows better, unchanged, worse, uncertain, skipped. Never present missing feedback as improvement, demo data as outcomes, or yoga as treating/curing a condition; no diagnosis or medical claims.
- **Release 1.0 scope (2026-10-23):** guest use, optional account with cloud sync, no AI, no new practice sessions; payments out of scope. Android application ID `com.magicpendigital.motchutyoga` (permanent); domain `motchutyoga.magicpendigital.com`; public operator name Magicpen Digital; the Owner is responsible for legal/policy and support; Play developer account is Tuyên Trịnh. Production is Vietnamese-only; English is a partial internal preview.
- **Platforms:** web on Vercel Preview (branch `main`, the single working branch since 2026-11-13; the old `codex-mcy-p1-preview` is frozen; Vercel Production branch is not `main` and Production is not promoted), Android through Capacitor (test phone Air1 Ultra with the parallel debug app `.mcydebug`; Play Internal testing), iOS project prepared but not built or tested. Narrow mobile browsers and ≥900 px screens open the frameless web surface; `?mode=review&device=iphone|pixel-10` keeps the simulator.
- **Brand:** Vietnamese **Một chút yoga** / slogan **Vạn chút an yên**; English **A Little Yoga** / **A little more peace**; working mark Khoảng mở (same open arc and point everywhere). Look: warm ivory, forest green, terracotta CTA, editorial serif (bundled Source Serif 4 with Vietnamese subset), Roboto UI, soft photography, calm spacing; check Vietnamese diacritics. Read `brand/`, `design-system/`, and the skill `mcy-brand-ux` before visual or copy changes.
- **Detail lives in [docs/product/PRODUCT_DECISIONS.md](docs/product/PRODUCT_DECISIONS.md); read the matching section before touching it:** Check-in and Journey (region codes, illustration, no improvement percentages), free YouTube courses (never download/mirror; instructor name from the activated account), reading units (Owner per-unit switch), the content workspace (immutable versions, Owner declaration for every version, teacher edits own lessons only, AI suggests never approves), and AI (staging-only, off, its gates and data minimisation).

## Security and data boundaries

- Only the public Supabase publishable key may ship in clients (ignored `.env.local` locally, Vercel variables hosted). Legacy anon/service keys are deprecated by end-2026: plan the Edge migration before production.
- New private state stays in the `private` schema: RLS on, all client and service table privileges revoked, access only through reviewed `security definer` RPCs with an empty `search_path`, EXECUTE for `service_role` only, identity re-checked inside. Check effective privileges (including `TRUNCATE` and `PUBLIC`), not only policies. Business conflicts use `PT409`, never `40001`/`40P01` (INC-002). Use the skill `mcy-supabase-rollout` for every apply and deploy; record the remote migration version in the local filename.
- Teacher access is invitation-only, granted and activated by audited server actions (verified email alone grants nothing); teachers see no learner records by default; drafts and media stay private and never reach the learner catalog until reviewed and published by the Owner's flow.
- Consent: required terms/privacy are version-aware (asked again only when absent, revoked or changed); AI, wellbeing data, teacher sharing, notifications and marketing are separate and editable; enforce at the server write boundary. Consent copy is review text, not legal approval. Account deletion exists in the app and as a public page; `public/privacy.html`, `terms.html`, `delete-account.html` carry the operator name and contact the Owner supplied. Recheck Play Data safety (YouTube, thumbnails, public Storage reads, local playback progress) before any wider release.
- Playwright stays isolated from staging (`scripts/playwright-global-setup.mjs`, `scripts/playwright-test-environment.mjs`, `https://mcy-playwright.invalid`); fixtures are UI evidence, not auth or role evidence.

## Operations that must not be forgotten

- Procedure and history: [CROSS_PLATFORM_RELEASE.md](docs/release/CROSS_PLATFORM_RELEASE.md), [RELEASE_RUNBOOK.md](docs/release/RELEASE_RUNBOOK.md), `node scripts/release-sync-status.mjs`, `scripts/play-release.ps1`. Build APK/AAB from a clean export of the committed HEAD.
- Play: ask which Chrome profile holds the Tuyên Trịnh login (app account index `/u/1`); Internal testing only unless the Owner decides otherwise. The upload key and password are in the private Drive folder; the password appeared in chat once, so request an upload-key reset before production.
- If `adb devices` is empty the phone is in charge-only or USB-tethering mode; do not use force-stop, shell launch, data clearing or reinstalling to get session-restore evidence (INC-003).
- Windows quirks: Vite `EPERM` in sandbox, cold-start `page.goto` timeouts (rerun with `--timeout=90000`), unmanaged nested Vite servers surviving Playwright (INC-004). Large generated output must not be committed; a huge push times out with HTTP 408.
- Auth email goes through Resend SMTP with 13 managed branded templates (the 7 notification switches stay OFF; never toggle them to force an upload); the Auth redirect allowlist (18 URLs including the `.mcydebug` scheme) must never be overwritten by an older isolated config; a 429 `over_email_send_rate_limit` is shown as safe copy, never retried.
- The closed native learner-write trial of 13–14/10 is never rerun; any new live data-write test needs a new reviewed operation with an explicit Owner-approved cap. Do not run a positive live Owner-config save or a stale-save probe without the Owner's explicit permission (an earlier one was rejected by automatic review).
- Record PASS / FAIL / CHƯA CHẠY with command, environment and commit; a fixture or simulator pass never proves RLS, authenticated writes, devices, TalkBack or iOS.

## Current state

Lives in [`PLAN.md`](PLAN.md) (section 4, updated in place). Do not keep status here.

## Prototype Instructions

Read this file in full before planning or implementing any mobile-app change. Run the app yourself for previews (never give server-start steps) and verify the rendered app and its primary interactions. Do not deploy to Sites unless asked to share, publish or deploy. Before substantial visual changes read the brand/design files and the user's references; record durable decisions compactly (hard gate 6). When implementing from a selected generated mock, treat that image as the source of truth for layout, density, spacing, colour, typography, content and hierarchy.

## Editing Boundary

- Build ordinary app-specific UI in `src/Prototype.tsx` and `src/prototype.css`. Authorized i18n, media, web-mode or native work that genuinely needs other files must define that scope and its checks explicitly; this sentence alone is not permission to change protected runtime.
- Treat `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/mobile/`, `public/assets/iphone/`, `public/assets/android/`, `public/assets/status/`, `vite.config.ts`, `worker/index.js`, and `scripts/prepare-sites-build.mjs` as protected runtime files. Do not edit, replace, remove, or recreate them unless the user explicitly asks to change the mobile runtime itself. For an explicit runtime change, update the affected lock hashes only after verifying the new runtime behavior.
- Run `npm run check:runtime` before preview or handoff. If it fails, restore the protected runtime instead of weakening or bypassing the check.
- `npm run build` preserves the mobile runtime and prepares the static Cloudflare Worker output required by Sites. Before a Sites handoff, confirm `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and source `.openai/hosting.json` exist, then run `npm run test:sites`. Do not replace this project with a Vinext starter.

## Runtime Contract

Binding summary; the full contract is [docs/runtime/RUNTIME_CONTRACT.md](docs/runtime/RUNTIME_CONTRACT.md) (read it before any UI/layout/keyboard/scroll change) and the API is `src/mobile/COMPONENTS.md`.

- Keep the device runtime: `App` = `PhoneFrame` → `KeyboardProvider` with `StatusBar`, app content, `HomeIndicator`, `KeyboardDock` inside the frame; keep the `iPhone` / `Pixel 10` picker, both calibrated presets, the live status-bar clock and all device assets. Device chrome is not app content; never replace the runtime with a standalone page.
- Screens: `MobileScroll` for a single screen; `FlowStack` with `FlowScreen { id, header?, headerHeight?, footer?, footerHeight?, render }` and `flow.push/pop/replace` (no other router) for flows; footers are overlays, so add bottom padding with `--flow-footer-height`. Layered shells (composer, sheet, sidebar) compose in `Prototype.tsx`. Only scrollable content goes inside `MobileScroll`; fixed chrome stays outside it.
- Any horizontal collection uses `Carousel`: no `overflow-x`, no custom pointer handlers, no CSS scroll snapping, never `data-scroll-drag="ignore"` on or around it. Use `data-scroll-drag="ignore"` only for a control that must own every drag direction.
- Text entry only through `KeyboardInput`, `KeyboardTextarea` or `MobileTextField`; sheets through `BottomSheet` (`open`, `onOpenChange`, `title`, `description?`, `snap?`). Custom bottom chrome follows `useKeyboardInsets().bottomInset`; never add `var(--keyboard-height)` to content padding or pin chrome to `bottom: 0`.
- Interaction: no tap after a drag, no native image drag inside the frame, fixed phone chrome never animates with screens; z-order: home indicator on top, keyboard below it and above app UI.

## Keyboard Rule

Call `keyboard.hide()` before pushing/popping/replacing routes, opening any sheet/dialog/menu, or a transition that must not inherit focus (`FlowStack` and `BottomSheet` already do). When a keyboard-attached surface closes, hide the keyboard in the same event; when a text field loses focus, hide it unless focus moves straight to another text field. Full rule in the runtime contract file.

## Release evidence workflow - 2026-10-04

Read [the release runbook](docs/release/RELEASE_RUNBOOK.md) (checker details, cloud allowlist stays empty until Owner-reviewed mapping) and [the Vietnamese owner packet](docs/release/OWNER_PACKET.vi.md) for staging, packaging or a release handoff; run `node --test scripts/release-evidence.test.mjs` for changed gate code. Never copy live user data into staging.
