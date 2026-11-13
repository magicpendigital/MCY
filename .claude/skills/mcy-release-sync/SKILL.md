---
name: mcy-release-sync
description: Release or update the MCY app on every platform from one commit — web (Vercel Preview), the Android test phone, and Google Play Internal testing — with versionCode, evidence and a ledger. Use whenever the user asks to update the website, build a new Android version, install on the phone, upload to Play Console, or "sync" platforms.
---

# MCY release sync

Keep web, the test phone and Google Play on **the same committed source**. The full procedure, platform matrix, stop conditions and rollback are in [docs/release/CROSS_PLATFORM_RELEASE.md](../../../docs/release/CROSS_PLATFORM_RELEASE.md); the history is [RELEASE_LEDGER.md](../../../docs/release/RELEASE_LEDGER.md). Read both, plus `AGENTS.md` and `git status`, before acting. For the evidence gates behind staging/production use [RELEASE_RUNBOOK.md](../../../docs/release/RELEASE_RUNBOOK.md) and [mcy-change-review](../mcy-change-review/SKILL.md).

## When to use

Any request to ship user-visible work: "update the website", "new Android build", "install on my phone", "upload to Play", "make all platforms match". A request to *build* does not imply permission to *publish*: pushing, installing, uploading and applying backend changes each need the Owner's request in this task.

## Procedure

1. **Open the batch.** Run `node scripts/release-sync-status.mjs`. State which platforms the user asked for and the planned `versionCode` (ledger max + 1) and `versionName`.
2. **Close the source.** Commit by group; for shared files that hold someone else's unfinished work commit only your hunks (rebuild from `git show HEAD:<file>`), never `git add -A`. No large binaries in history before a push (originals go to the external archive, WebP is committed). Rewriting is allowed only for local, unpushed commits and needs a backup branch.
3. **Verify on a clean export of HEAD** (`git archive`, junction `node_modules`): **`npm run check:ios15` first (hard gate, see [mcy-ios-compat](../mcy-ios-compat/SKILL.md); red = stop)**, then `tsc --noEmit`, `check:legal`, relevant Node tests and Playwright (`MCY_PLAYWRIGHT_CHANNEL=msedge`, `--timeout=90000` on a cold start; full suite for UI/flow changes). If a long run is cut short, rerun only the failing spec files and say so in the ledger; do not call it a clean full-suite pass.
4. **Web.** `git push origin main` (the only working branch since 2026-11-13; `codex-mcy-p1-preview` is frozen; never force; a large push can time out with HTTP 408, so keep generated output out of commits). The workflow in `.github/workflows/quality.yml` runs on every push; look for the run, but Vercel deploys regardless, so the local gate in step 3 is the control that counts. Confirm the Vercel deployment is READY for HEAD, then fetch the live site without cookies and check the new strings plus `/privacy.html`, `/terms.html`, `/delete-account.html`.
5. **Android.** From the same HEAD: signed AAB through `scripts/play-release.ps1 -Build -VersionCode N -VersionName x.y.z` (public Supabase URL/key in process env; upload-key password only in the process env, never printed or written); parallel APK through `npm run android:parallel:build` from a clean export, then one `adb install -r`. Never uninstall, clear data, force-stop or shell-launch on the Owner's phone. If `adb devices` is empty, the phone is usually in charge-only or USB-tethering mode: ask the Owner for File transfer + USB debugging, then restart adb. Verify AAB manifest (package, versionCode, targetSdk 36, allowBackup=false) and signing fingerprint.
6. **Google Play.** Ask which Chrome profile/browser holds the Tuyên Trịnh Play login (extension names such as "Browser 2" change between sessions), use app `/u/1` when two accounts are signed in; upload the AAB to **Internal testing** and publish only if asked; read Play's warnings; do not touch closed/production tracks without a separate decision. If the browser session is not signed in or Play asks for a human step, stop and hand it back.
7. **Record.** Append the ledger row, update `PLAN.md` (section 4, in place), commit both, rerun `release-sync-status.mjs`, report commit, versionCode, hashes, deployment id, install result, Play status, and what was **not** verified (device behavior, TalkBack, iOS).

## Rules that must not be skipped

- `npm run check:ios15` is green on the exact commit before any push, install or upload; the iPhone iOS 15 result is reported as CHƯA CHẠY unless a real device or equivalent was used.
- Same commit on all platforms in one batch; if one platform fails, record it as behind in the ledger rather than shipping a different commit silently.
- `versionCode` strictly increases; check Play's current latest before choosing it.
- Backend before client when the new client needs new RPCs/Edge/columns; the client must degrade gracefully against the old backend.
- Unreviewed or private content never enters the learner bundle; AI/practice stays gated.
- Update `AGENTS.md`, the runbook and this skill in the same change when the process itself changes.
