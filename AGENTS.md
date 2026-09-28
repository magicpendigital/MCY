# Mobile Prototype Agent Guide

## MCY skills and change review — active 2026-09-27

- For any MCY feature, data, media, runtime, or release change, read [mcy-change-review](skills/mcy-change-review/SKILL.md) and select evidence by the actual diff. For learner-facing UI, copy, or visual assets also read [mcy-brand-ux](skills/mcy-brand-ux/SKILL.md). These repository skills travel with MCY; unrelated `nilaza-*` skills describe a different application and do not govern this one.
- [Implementation plan](analyse/MCY_IMPLEMENTATION_PLAN_2026-09-27.md) orders the approved UX direction and proposed future gates. Its phases are not evidence that a feature has shipped. The 2026-09-27 request authorized this plan and repository skill/review-guidance updates; it did not itself publish media, enable AI, or release production features. Later explicit user instructions set later scope.
- On each change, compare the latest explicit user decision, this guide, current source/configuration and dated proposals. Update or mark superseded instructions in the same change when a durable decision changes. Recheck provider limits, prices, external account state, and actual test availability before acting; do not carry dated snapshots forward as live facts.
- A skill or checklist cannot guarantee zero defects or secure a repository by itself. Record PASS/FAIL/CHƯA CHẠY evidence and residual risk. CI, required checks, protected branch/reviewer rules and restricted deploy/database permissions are separate enforcement layers; do not claim they are active without verifying them.

## MCY product direction — confirmed 2026-09-24

- The primary experience is daily check-in → a short AI conversation → a concrete practice plan for today → practice → honest reflection → a better-informed next choice.
- Help the learner know what to practice today, how to follow it, and how to continue. A large course/video library or a standalone chatbot is not the primary entry point.
- Courses, the teacher's own content, and human-led classes support this loop. AI-assisted selection is part of the intended core product, not merely a post-practice summary.
- Continue from the existing prototype as the design and interaction base, preserving all runtime boundaries below.
- Reflection must allow unchanged, worse, uncertain, and skipped responses. Never present missing feedback as improvement or demo statistics as observed outcomes.
- The user authorized building an interactive prototype for review, then explicitly expanded P1 on 2026-09-26 to include the learner app on web and native mobile, Supabase learner-data integration, Vercel deployment, Android installation on the connected device, and iOS project preparation. This still does not authorize payments, real AI processing, or production data use beyond the explicitly scoped learner records. Technical choices, prices, and roadmap gates in the review report remain proposals.

## Learner platform scope — confirmed 2026-09-26

- Keep the existing browser experience inside the iPhone / Pixel simulator as the review surface and verify both presets. On narrow mobile browsers, open the same learner app without the device frame or simulated status/keyboard chrome; `?mode=review` keeps the simulator and picker, while `?mode=web` explicitly forces the frameless browser surface. Also package the same learner app as a fullscreen native Capacitor app in P1; do not confuse the simulator shell with native distribution. Optimize the wide web UI in a later phase.
- Deploy the learner web build to Vercel. Install the Android debug build on the user's connected Android phone; prepare the iOS project, URL scheme, and data configuration for later real-iPhone testing.
- The initial P1 backend scope was Supabase email authentication, learner profile, append-only consent evidence, and explicitly consented check-ins. On 2026-09-26 the user expanded the next P1 step to a staging-only, invite-gated teacher trial for private lesson drafts and media uploads. AI inference, learner-visible publishing, session/run/reflection sync, commerce, support/data-request processing, and production release remain out of scope until their API/content/policy gates are approved.
- The public Supabase publishable key may ship in the client. Never put a service-role/secret key in Vite variables, web assets, or native bundles. Keep build-time Supabase URL/key configuration in ignored `.env.local` for local/native builds and the Vercel project environment for hosted builds.
- Preserve the existing simulator runtime and protected device chrome. If the user explicitly authorizes a runtime change for native packaging, verify simulator/native behavior first, then refresh only the affected `mobile-runtime.lock.json` hashes and run `npm run check:runtime`.

## Teacher trial expansion — confirmed 2026-09-26

- Prepare a staging-only, invite-only teacher pilot so trial teachers can create lesson drafts and upload private media for review. Do not expose drafts in the learner catalog or publish them from the teacher account.
- Teacher role grants and teacher-profile activation must be server-controlled and auditable. A user must never create or elevate their own teacher role through profile fields or direct table writes. Require a verified owner to issue invitations; assign an independent reviewer before any publish gate is implemented.
- Do not assume a backend role can access the `private` schema because it has a service-role key. Verify effective schema and table privileges first; current staging denies `anon`, `authenticated` and `service_role` access to `private.role_assignments` and `private.teacher_assignments`. Any future server access needs a narrowly scoped, reviewed database/API boundary; never widen these grants to a client.
- Store trial media in a private bucket and issue narrowly scoped, short-lived upload/download access. Keep uploads staged until content type/size, ownership, rights evidence, and security scanning are addressed. Teachers must have no learner-record access by default.
- On 2026-09-26, `mcy-staging` was on the Free plan with a reported 50 MB/file and 1 GB storage limit. Recheck quota and usage before an upload; treat any first trial as non-production test content. Do not upgrade the plan or create paid storage without explicit user direction.
- On 2026-09-26, a staging test account was bootstrapped with all nine global application roles and a system audit event; keep its email out of committed documentation. At that date no active teacher profile, teacher API, private media bucket, or external teacher roster existed. Recheck current state before invitations or real uploads and confirm roster, file types/sizes and teacher privacy/rights statement.
- The initial migration left authenticated teacher self-write policies and broad client table ACLs. On 2026-09-27, staging migration `20260927033720_harden_teacher_profile_acl.sql` revoked all table privileges from `PUBLIC`, `anon` and `authenticated`, restored SELECT only under the existing active/owner policy, and removed INSERT/UPDATE/DELETE policies. Live effective-privilege checks now show client INSERT/UPDATE/DELETE/TRUNCATE denied; `service_role` also has no `USAGE` on `private`. `npm run test:teacher-acl` covers anonymous writes; `npm run test:teacher-actors` checks direct writes for distinct authenticated fixtures. The fixture labels do not prove role bindings; verify those separately through owner-controlled staging setup. Do not deploy the invite/activation API until the actor tests pass and an authorized server boundary is implemented. Never expose service-role credentials to clients.

## Durable visual direction — confirmed 2026-09-25

- The six-panel concept image provided by the user is the visual source of truth for the prototype's app-owned UI: warm ivory canvas, dark forest-green typography, terracotta primary CTA, editorial serif headings, soft photographic yoga imagery, restrained cards, and generous calm spacing. The original concept's leaf mark has since been superseded by the user's selected abstract working mark, Khoảng mở (2026-09-26).
- Keep the concept's visual anatomy: photographic welcome; body-map check-in with selectable regions and energy faces; today's practice recommendation with hero photo, movement previews, and a gentler alternative; illustrated practice screen with a circular progress control; before/after body reflection; journey with body-map and an honest trend view.
- Preserve the newer product loop by placing the short AI conversation between the concept's check-in and today's recommendation. This interaction must use the same visual language, not a generic chat UI.
- Concept imagery and trend values are illustrative. The prototype must not label a body region as improved or draw measured progress without user-entered feedback; unselected, unchanged, worse, and skipped responses remain distinct.

## Brand direction — current decision and research hypotheses

- Vietnam-facing name: **Một chút yoga**. English-facing name selected by the user on 2026-09-27: **A Little Yoga**. Use one shared symbol, palette, photography and voice across both; validate broader international positioning before release.
- Vietnamese slogan corrected by the user on 2026-09-27: **Vạn chút an yên**, shortened from **Một chút yoga, vạn chút an yên**. English slogan selected by the user on 2026-09-27: **A little more peace**. These names and slogans are used in the locale-aware welcome and app header; the remaining English interface is still incomplete and internal.
- The invitation **Make room for a little yoga.** is a candidate campaign line. Validate whether English-speaking users read “little” as approachable rather than children’s yoga or only very short sessions before committing internationally.
- Earlier leaf, sprout and seated-figure explorations were candidates and are superseded for this phase by the chosen abstract working mark. Do not apply their old construction instructions to current UI or restart those explorations without a new request.
- On 2026-09-26, the user selected **Khoảng mở** as the working mark for this phase. Use the same open arc and point geometry across light/dark variants, the app icon, in-app mark, and brand motion. This selection guides the current handoff and prototype, but does not establish trademark clearance or permanently close future brand validation.
- Use the supplied brand guidelines, design tokens, and motion specification as the implementation handoff. The campaign invitation remains a hypothesis until tested with English-speaking users.

## Check-in and journey prototype direction — approved 2026-09-25

- Make the body map a way to enter separate, self-reported observations for each region. Keep a text region list alongside the illustration; allow left/right shoulder detail, a level, and a free note. Keep “no discomfort now,” “unsure,” and “skip” distinct from an unselected region.
- The body illustration may be neutral, feminine, or masculine, chosen as a visual preference. Do not require gender disclosure or infer gender, recommendations, or health state from the illustration. Keep the face neutral; use explicit labels and region points for state.
- The journey uses a selectable timeline of actual snapshots. Selecting a point shows the same body illustration with region markers and notes from that point. Preserve gaps and multiple records on one day. A clearly labeled sample timeline may demonstrate the idea, but must never be presented as a user's outcome.
- Compare like-for-like self-reports by region and time. Do not generate an improvement percentage, smooth missing days, or interpret yoga as having cured pain. Post-practice reflection can mark each region as better, unchanged, worse, uncertain, or omitted independently from the overall feeling.

## Body illustration feedback — 2026-09-25

- Superseded for check-in anatomy by the user's 2026-09-28 tester feedback below. Keep this date's upper-body illustration guidance for historical comparison only; do not use it to remove lower-body areas that are now in the approved check-in.
- Keep the Journey's selected snapshot readable and marker-aligned. If the full-body Journey view becomes too small, improve its viewing layout while retaining access to all recorded regions.

## Check-in feedback from user testing — 2026-09-28 (R1 and R2 implementation)

- Testers asked for a full-person check-in map with arm, elbow/wrist, hand, knee and foot areas because office work can involve more than the neck, shoulders and back. The approved map now groups trunk, arms and legs; keep the labeled region list as an equal selection path and preserve usable touch targets. Treat every entry as the learner's present-moment self-report, not a diagnosis or recommendation.
- The stable persisted codes are locale-neutral: `neck`, `upper_back`, `lower_back`, plus paired `shoulder`, `upper_arm`, `elbow`, `forearm_wrist`, `hand`, `knee` and `foot` values suffixed `_left`, `_right` or `_unspecified`. “Both” writes left and right entries; equal paired values may render as “both.” Never rewrite existing observations as part of a taxonomy expansion. Frontend RPC serialization must map `regionCode` to SQL's `region_code` field.
- The requested default is the feminine illustration, with feminine, masculine and neutral display choices. Apply a new default only to new/unspecified preferences; preserve every saved preference and do not infer gender or personalize a practice from the illustration choice.
- The implemented back-view asset set uses the feminine illustration first, with masculine and neutral display choices, matching green clothing, framing and marker coordinates. Keep image choice separate from gender disclosure and never infer personalization from it. Preserve existing saved preferences; the database default only changes future profile creation and missing UI preference falls back to feminine.
- On iOS mobile web, region-note focus reportedly zooms too far in. Both app textareas now use `font-size: 16px` instead of 12px; this is a likely mitigation, not proof of physical iOS behavior. Preserve browser pinch zoom and verify focus, keyboard and layout on actual iOS Safari. The R1 fixes were deployed to the Vercel Preview branch on 2026-09-28; this is not a production release.
- The tester also reports that advancing from the body-selection page retains a previous scroll position. Header navigation and check-in step changes now reset the active `.mobile-scroll`, instead of the non-scrolling `[data-phone-screen]`. Playwright verifies the next step starts at the top and that Back returns to the top without losing selections; physical iOS behavior remains unverified.
- R2 body-map UI, localized region taxonomy, side-aware check-in/reflection/Journey rendering, matching three-image set and staging database contract are implemented. Staging migration `20260928063009_expand_body_region_checkin_support` is applied and verified; anonymous PostgREST denial passes. Vercel Preview commit `563d09e` is Ready on `codex-mcy-p1-preview` and points to `mcy-staging`; this task did not change the existing Production deployment from `main` at `992ccd8`. Authenticated learner write/consent actor tests and actual iOS Safari remain unverified. The debug APK was installed on the connected Air1 Ultra; user-facing interaction on the physical device still needs testing.

## UI/UX review feedback — 2026-09-26

- The user reported incomplete brand-kit application, missing branded launcher icons, and broken-looking Vietnamese typography. The 2026-09-27 implementation uses the current Khoảng mở mark for app identity and Roboto with Vietnamese glyph subsets for app-owned UI. Preserve typography checks for diacritics, weights, scale and fallback behavior.
- The check-in screen did not make below-the-fold controls discoverable. It now uses a two-step flow with a visible scroll cue, explicit step state, one primary next-step action and separate skip/sample actions. Destructive skip confirms before clearing existing region entries.
- Fixed bottom actions use horizontal insets and an opaque safe-area surface. Keep final content scrollable above the footer, prevent text from showing through at the screen edge, and preserve iOS/Android protected chrome.
- The 2026-09-26 request asked for analysis and a plan. Later implementation requests may proceed within their explicit scope; this historical plan-only limit is not a standing ban.

## UI/UX plan follow-up — 2026-09-27

- The user accepted the preceding UI/UX direction. The 2026-09-27 prototype implements the two-step check-in, distinct skip meanings, brand/font fixes, inset opaque action surfaces and a mobile-browser mode without device chrome. Keep desktop simulator review available through an explicit review mode.
- Keep the body-orientation caption outside the illustration bounds with visible separation from both the image and illustration-picker control.
- The current localization layer supports Vietnamese and an explicitly internal, incomplete English preview on the main learner loop and Journey. The Journey screen, sample states, comparisons and bottom navigation are translated and covered by the internal E2E path. Consent, account, support and knowledge screens remain Vietnamese and must stay disclosed where English preview is offered. Reuse the existing profile locale field; do not claim complete English support or add a schema migration unless a concrete data need requires it.
- The narrow/mobile browser defaults to the unframed app; `?mode=web` forces it and `?mode=review&device=iphone` or `?mode=review&device=pixel-10` preserves the simulator for review. Keep Capacitor native mode separate and verify runtime changes against simulator plus native behavior before changing its lock hashes.
- Portrait/landscape lesson media, illustrated yoga knowledge and recorded meditation remain future content proposals. AI meditation guidance, teacher publishing, external uploads, new backend scope and production release still require their stated authorization and safety gates.
- User-supplied lesson source folder: `D:\nilaza\documents`. Local metadata inspection found 38 portrait MOV files, mostly 1080x1920 (one 1080x1918), about 17–63 seconds each and 551 MB total. Metadata is not a content, instructional-quality, rights, or codec-playback review. Do not upload, transcribe, translate, or send these files to AI services based on this planning request.
- Preserve the iPhone/Pixel review surface. The actual-mobile-browser presentation mode was implemented in the authorized 2026-09-27 runtime change; hiding the bezel alone is insufficient because viewport, safe areas and keyboard behavior also differ.
- The user requested a comparison of self-hosting and embedded video platforms such as YouTube. Treat provider choices and budgets as proposals; that analysis did not authorize uploading/publishing teacher videos, subscribing to paid services, or changing staging privacy gates.

## Responsive learner-flow follow-up — 2026-09-27

- On short mobile viewports, keep the welcome screen's guest/account actions visible when its content can fit; let the welcome composition and imagery adapt to the actual available height instead of positioning the actions at the bottom of a fixed 852px canvas.
- Keep the welcome screen's guest, create-account and login actions in a persistent inset footer; prevent the wordmark from crossing the subject's face, and compact the welcome content and image crop on short landscape screens so its essential benefits stay visible above the footer.
- Keep the consent screen's Continue action in an inset, opaque footer while consent purposes remain scrollable. Ask for required service/privacy acceptance on first account use and again only when either required version is missing, revoked, or has changed; changing account sessions alone must not reopen the screen. Keep AI, wellbeing-data, teacher-sharing, notifications and marketing choices separate and editable in settings. The current consent copy remains review text, not final legal policy.
- Keep the welcome wordmark within the quiet left area of its photo and scale it to the available viewport; never preserve an 852px canvas on short phones. Teacher account creation uses verified email, but teacher access remains invitation-only and cannot be self-selected or self-granted.
- Keep the primary action and its meaningful alternative available in an inset, opaque safe-area footer for the core dialogue, practice, check-in, plan and reflection steps. Keep longer content scrollable above it, with bottom padding derived from the FlowStack footer height. Do not cover content or protected device chrome.
- Verify the main learner loop on a short portrait viewport as well as both simulator presets, mobile web and short landscape. A visible control is not enough: check that it remains tappable, keyboard-attached surfaces still move with the runtime, and scroll can reach the final content.

## Prototype Instructions

In ChatGPT Work Mode, run `sites-preview start "$PWD"`, open `http://terminal.local:4173/` in the cloud browser, and verify the rendered app and its primary interactions. Keep that preview open and tell the user to inspect it in the cloud browser; do not present the local URL as a user-facing chat link. In Codex Desktop, run the local server yourself, open the preview in the in-app browser, and provide the clickable local URL. Do not deploy to Sites unless the user explicitly asks to share, publish, or deploy. Do not give the user server-start instructions when you can run it.

Before planning or implementing any mobile-app change, read this `AGENTS.md` in full. It is the source of truth for the template's runtime and component guidance.

Before making substantial visual changes, inspect the current brand/design files and user-provided references; when context remains unclear, use an available Product Design audit or context capability. Do not depend on a `get-context` skill unless it actually exists. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Editing Boundary

- Build ordinary app-specific UI in `src/Prototype.tsx` and `src/prototype.css`. Authorized i18n, media, web-mode or native work that genuinely needs other files must define that scope and its checks explicitly; this sentence alone is not permission to change protected runtime.
- Treat `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/mobile/`, `public/assets/iphone/`, `public/assets/android/`, `public/assets/status/`, `vite.config.ts`, `worker/index.js`, and `scripts/prepare-sites-build.mjs` as protected runtime files. Do not edit, replace, remove, or recreate them unless the user explicitly asks to change the mobile runtime itself. For an explicit runtime change, update the affected lock hashes only after verifying the new runtime behavior.
- Run `npm run check:runtime` before preview or handoff. If it fails, restore the protected runtime instead of weakening or bypassing the check.
- `npm run build` preserves the mobile runtime and prepares the static Cloudflare Worker output required by Sites. Before a Sites handoff, confirm `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and source `.openai/hosting.json` exist, then run `npm run test:sites`. Do not replace this project with a Vinext starter.

## Runtime Contract

- Preserve the mobile device runtime unless the user's task explicitly asks otherwise. Do not replace it with a standalone page. Visual fidelity applies to app-owned content inside the device screen, not to template-owned device chrome.
- Keep `App` composed around `PhoneFrame` -> `KeyboardProvider`, with `StatusBar`, app content, `HomeIndicator`, and `KeyboardDock` mounted inside the phone frame. `StatusBar` and the iOS home indicator are overlaid device chrome. When the Android keyboard is closed, the app viewport reserves the protected navigation-bar region instead of painting behind it. When the Android keyboard is open, preserve the current full-screen keyboard layout: its asset includes the IME navigation strip and the separate black navigation bar is hidden. iOS screens continue to paint behind the home-indicator area and own their safe-area content padding.
- Preserve the `iPhone` / `Pixel 10` device picker and both calibrated device presets. The Pixel screen is `427 x 952`; its `32 x 32` camera circle and `public/assets/android/navigation-bar.svg` bottom navigation bar are protected device chrome, not app content.
- Preserve the device picker's intentionally lightweight Codex styling in the top-right corner: its trigger wrapper is borderless and transparent, its trigger sizes to content, and its right-aligned menu uses the compact 3px inset plus the specified hairline and elevation shadow layers. Keep the prototype root and default app screen white.
- Preserve `StatusBar` as live device chrome, including its platform-specific typography, source status-icon assets, and spacing. Pixel 10 uses Roboto, Android indicators, and 32px top, left, and right padding. iPhone uses its iOS indicators, system typography, and calibrated spacing. Do not hardcode screenshot times like `9:41` into the status bar, replace its real-time clock, or move status bar content into app markup unless the user explicitly asks for a fixed/mock device time.
- `PhoneFrame` owns the calibrated device frame, screen portal, device picker, camera cutout, and custom cursor. Keep device assets in `public/assets/iphone/` and `public/assets/android/`; if an asset fails to load, repair the asset path or restore the asset instead of removing the frame, keyboard, or image render.
- Use `MobileScroll` directly for simple single-screen prototypes. Use `FlowStack` for conventional multi-screen flows whose routes can own their fixed header and footer; when using it, define each route as a `FlowScreen`: `{ id, header?, headerHeight?, footer?, footerHeight?, render }`, and use `flow.push(screen)`, `flow.pop()`, and `flow.replace(screen)` from `FlowStack` render callbacks or `useFlow()` instead of introducing another router.
- Use `Carousel` for a carousel, horizontal rail, swipeable cards, image or media strip, horizontally scrollable cards, chip rail, or other horizontal collection.
- For a layered app shell—such as a persistent composer, independently presented sheet, pushed/peek sidebar, or app-wide transition—compose directly in `Prototype.tsx` rather than forcing it through `FlowStack`. Keep app-owned fixed chrome as sibling layers outside `MobileScroll`.
- When using `FlowScreen`, put route-owned fixed headers or footers in `FlowScreen.header` or `FlowScreen.footer`. Set `headerHeight` to the visible app-toolbar height; `FlowStack` adds the device's top safe-area/status-bar inset automatically. Do not include `StatusBar` or its height in the header. Set `footerHeight` to the full app-footer height. `FlowScreen.footer` is an overlay, not reserved layout space; screens using it must add their own bottom content padding such as `padding-bottom: calc(var(--flow-footer-height) + var(--mobile-safe-area-height) + 24px)` so final content can scroll above the footer while still painting behind it.
- Render only scrollable content inside `MobileScroll`; it is for content that should move with scroll and rubber-band overscroll. Keep app-owned headers, nav bars, tabs, composers, and overlays outside it. This keeps scroll physics, safe areas, keyboard insets, scrollbars, and drag click suppression active without letting content paint under fixed chrome.
- Buttons, links, cards, and images inside `MobileScroll` should still allow drag scrolling when the pointer moves beyond tap slop. Use `data-scroll-drag="ignore"` only for rare controls that must own the drag gesture themselves.
- Do not add `var(--keyboard-height)` to ordinary screen/content padding inside `MobileScroll`; the scroll viewport already shrinks above the simulated keyboard. For custom fixed composers, search bars, or toast chrome, use `useKeyboardInsets().bottomInset`. It is relative to the app viewport: Android returns `0` while the closed-keyboard viewport already reserves navigation, then returns the keyboard height while open; iOS continues to clear the home indicator while closed and ride directly above the keyboard while open. Do not pin custom bottom chrome to `bottom: 0` or only `keyboardHeight`.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for every text-entry control. A raw `input` or `textarea` disconnects focus, keyboard animation, safe-area insets, and attached surfaces.
- Use `BottomSheet` for phone-scoped sheets. Its props are `open`, `onOpenChange`, `title`, optional `description`, optional `snap`, and `children`; it renders through the phone screen portal and dismisses the keyboard before opening.

## Horizontal Carousels

- Use `Carousel` for horizontally draggable cards, images, media, chips, or other horizontal collections. Do not recreate these with `overflow-x`, custom pointer handlers, or a generic div.
- `Carousel` can be nested directly inside `MobileScroll`. It owns horizontal gestures and automatically yields vertical gestures to the parent.
- Never put `data-scroll-drag="ignore"` on or around a `Carousel`; doing so prevents vertical parent scrolling when a gesture begins inside it.
- Do not add CSS scroll snapping to `Carousel`; its runtime owns momentum and release motion.
- Use `data-scroll-drag="ignore"` only when a control must prevent parent scrolling in every drag direction.

See `src/mobile/COMPONENTS.md` for the full component and gesture contract.

## Keyboard Rule

The simulated keyboard is a separate top-layer component. Before presenting anything that behaves like iOS navigation or modal UI, dismiss it first.

Call `keyboard.hide()` before:

- pushing, popping, or replacing FlowStack routes
- opening bottom sheets, action sheets, dialogs, menus, or navigation sheets
- starting transitions where the destination should not inherit text-input focus

`FlowStack` already hides the keyboard for `push`, `pop`, and `replace`. `BottomSheet` already hides it before opening. If you add new modal/sheet/navigation primitives, follow the same rule.

When a composer, search surface, or other keyboard-attached component closes, call `keyboard.hide()` in the same event before changing that component's open state. Position attached surfaces from `useKeyboardInsets()` rather than a separate timer or visibility flag so both dismiss together.

When any text-entry control loses focus, dismiss the simulated keyboard. If the control is custom or does not use the runtime's keyboard-aware fields, handle its blur event and call `keyboard.hide()` explicitly. Keep the keyboard open only when focus is moving directly to another text-entry control that should share the same keyboard session.

## Interaction Rules

- Do not trigger buttons or inputs after a pointer has become a drag. Preserve the drag suppression behavior in `MobileScroll`.
- Do not allow native browser image/file dragging inside the phone frame. Preserve the phone-level `dragstart` suppression and non-draggable image styles so scroll drags that begin on images still scroll the prototype.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for text entry so the simulated keyboard and safe-area insets stay connected.
- Fixed phone chrome should not animate with pushed screens. Screen content can animate; the status bar, camera cutout, and preview chrome should stay put.
- Keep the keyboard below the home indicator/safe area layer in z-index, and above ordinary app UI while visible.
- Keep the home indicator as the topmost safe-area layer in the z-index above everything else in the prototype.
