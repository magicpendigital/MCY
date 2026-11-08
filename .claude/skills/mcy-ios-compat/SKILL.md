---
name: mcy-ios-compat
description: Hard gate for the MCY learner web/native client on old iPhones (iOS 15.x). Use whenever writing or reviewing client TypeScript/TSX, CSS, a new dependency, index.html or anything that ships in the web bundle or the Capacitor app, and before every push, APK install or AAB upload. Prevents the recurring blank/broken display on iOS 15 (INC-001).
---

# MCY iOS 15 compatibility gate

The Owner's iPhone runs iOS 15.x and the same display bugs came back after earlier fixes. Treat this skill as a checklist you run **while writing** and a gate you run **before shipping**. The incident history and the open items are in [docs/quality/KNOWN_INCIDENTS.md](../../../docs/quality/KNOWN_INCIDENTS.md) (INC-001); update that file in the same change when you add an exception or find a new failure.

## Baseline

- Supported floor: **iOS 15.0** (Safari/WKWebView 15.0), Android 7 / Chrome 80+. Cosmetic degradation is allowed; a white screen, a lost button, unreadable text or a control that cannot be tapped is not.
- Vite 8 does not downlevel for Safari 15 beyond `build.target` and never polyfills. Vite does **not** reject regex lookbehind or missing APIs at build time. Edge/Chromium and Playwright cannot show iOS 15 behaviour.
- What breaks, and how:
  - **Syntax** an old parser rejects (regex lookbehind `(?<=`, class `static {}`, regex `v` flag) stops the **whole JS chunk** from loading.
  - **A missing API** throws only when called: `crypto.randomUUID`, `Array/String.at`, `structuredClone`, `Object.hasOwn`, `findLast`, `toSorted`, `AbortSignal.timeout`, `Promise.withResolvers`, `Object.groupBy`.
  - **CSS** declarations or whole rules are **dropped silently**: `dvh/svh/lvh` and `cqi/cqw` units (the whole declaration), `:has()` and `@container` (the whole rule), `@layer`, `color-mix`, native CSS nesting, `@property`, `oklch/lab/light-dark`. This is how the Welcome screen lost its padding and font sizes.
  - `inert` is ignored before iOS 15.5 (the screen behind a route stays tappable).

## While writing

1. Use the wrappers in `src/compat` (`newId`, `lastOf`, `timeoutSignal`) instead of the raw APIs. Add a wrapper there when you need another API; do not call it raw.
2. Rewrite regexes without lookbehind; check Unicode strings another way.
3. For a viewport or container unit write the plain declaration first, then the modern one in the **same rule**: `height: 100vh; height: 100dvh;`, `padding: 56px 20px; padding: clamp(38px, 7svh, 64px) 20px;`. The test fails if the order is missing.
4. Do not add `:has()`, `@container`, `@layer`, `color-mix`, native nesting, `@property` or `inert` unless there is a fallback that still works and the budget in `tests/browser-compat.test.mjs` is raised with a note in INC-001. The budgets only go down.
5. A new route chunk is wrapped by `RouteBoundary`; one chunk failing must not take down Welcome, check-in or Khám phá.
6. A new dependency can bring any of the above into the bundle. After adding or upgrading one, run the gate below and read the numbers it prints.
7. Text inputs are at least 16px (iOS zooms smaller ones). Keep browser pinch zoom.

## The gate (before every push, APK install or AAB upload)

```bash
npm run check:ios15            # runtime integrity, production build, source + built JS + built CSS checks, bundle secret scan
npm run check:ios15 -- --no-build   # only to reuse a dist built from the exact commit you are about to ship
```

A red gate stops the release. Fix the cause. Never raise a budget, add an exception or skip the build to get green; an exception needs a written reason in the test and in INC-001. The static gate proves the code does not use what iOS 15.0 lacks; it does **not** prove how the screens look.

## Real-device check (CHƯA CHẠY until someone actually does it)

Ask the Owner for the exact iOS minor version (Settings → General → About) and the screen that fails. 15.0–15.3 lack `dvh/svh`, `:has()` and `:focus-visible`; 15.4+ have them but lack container queries (16.0). Open the Preview URL on the iPhone (or a cloud iOS 15 device) and walk these six places, noting any dropped padding, missing footer, clipped button or white screen: Welcome (footer buttons reachable), check-in step 1 and step 2, Khám phá (video list first, then "Đọc thêm"), a lesson page (poster, play, previous/next), Cá nhân, sign-in. Record the result as PASS/FAIL/CHƯA CHẠY with device and iOS version in the release ledger. Do not report iOS as tested because Edge or WebKit passed.

## Handoff wording

"Đã đối chiếu `docs/quality/KNOWN_INCIDENTS.md`: áp dụng INC-001; `npm run check:ios15` PASS/FAIL trên commit …; iPhone iOS 15 thật: CHƯA CHẠY/PASS (thiết bị, bản iOS)."

## Known open items (do not paper over them)

`height: 100dvh` in protected `src/styles.css` (listed as an exception; needs the Owner's permission to edit), every existing `:has()` and `@container` rule, `inert` in protected `FlowStack.tsx`, and the missing real-device evidence. When one is closed, remove it here and in INC-001.
