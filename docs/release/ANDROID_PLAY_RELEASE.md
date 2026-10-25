# Android / Google Play release — preparation (2026-10-23)

Preparation only. Nothing here uploads to Play, changes Auth/Supabase/Vercel configuration, or releases to users. Recheck Play Console requirements at submission time.

## Identity (permanent once the app exists in Play Console)

- Application ID: `com.magicpendigital.motchutyoga` (Owner decision 2026-10-23). Debug variants: `.debug`, `.mcydebug`.
- Previous builds used `com.nilaza.motchutyoga*`. Those packages are separate apps: they keep their own data and signing keys and can stay installed beside the new ones. They also register the same custom URL schemes, so with both families installed Android may show an app chooser for the email sign-in link. Test the new family on a phone without the old `.mcydebug` package, or remove the old package yourself first. Never uninstall anything on the Owner phone from an agent session.
- iOS bundle identifier and Info.plist URL name were aligned to the same ID in source. iOS is a later phase and has not been built.
- Custom URL schemes are unchanged: release `motchutyoga`, debug `motchutyoga-debug`, parallel `motchutyoga-mcydebug`. The release callback `motchutyoga://auth/callback` must be present in the Supabase Auth redirect allowlist before a release build can complete email sign-in; verify in the Dashboard (the 13/10 repair added only the `mcydebug` URL). Verified HTTPS App Links on `motchutyoga.magicpendigital.com` (needs `assetlinks.json` with the Play signing certificate fingerprint) are the sturdier long-term option and are not set up yet.

## Build the upload bundle

```bash
npm run android:release:bundle
```

Runs the canonical web build (runtime check, catalog check, TypeScript, Vite, bundle secret scan), `cap sync android`, then Gradle `bundleRelease`. Output: `android/app/build/outputs/bundle/release/app-release.aab`. With no signing variables the AAB is **unsigned** and cannot be uploaded; that is the safe default.

Prepared bundle check on 2026-10-23: unsigned AAB 9,568,056 bytes; merged manifest `package=com.magicpendigital.motchutyoga`, versionCode 1, versionName 1.0.0, targetSdk 36, `allowBackup=false`. Not uploaded, not installed.

Environment variables read by `android/app/build.gradle` (nothing is stored in the repository):

| Variable | Meaning |
|---|---|
| `MCY_VERSION_CODE` | integer, must increase for every Play upload (default 1) |
| `MCY_VERSION_NAME` | shown to users (default 1.0.0) |
| `MCY_UPLOAD_STORE_FILE` | absolute path to the upload keystore (outside the repo) |
| `MCY_UPLOAD_STORE_PASSWORD`, `MCY_UPLOAD_KEY_ALIAS`, `MCY_UPLOAD_KEY_PASSWORD` | keystore secrets |

## Create the upload key and build the signed bundle (Owner)

Use the helper; it never writes a password to disk or the repository:

```powershell
powershell -File scripts/play-release.ps1 -CreateKey
powershell -File scripts/play-release.ps1 -Build -VersionCode 1 -VersionName 1.0.0
```

- `-CreateKey` (once) runs `keytool` and stores `%USERPROFILE%\mcy-signing\mcy-upload.p12`. Save the file and password in a password manager and keep a second copy.
- `-Build` asks for the password, exports the **committed HEAD** (uncommitted work never ships), builds, signs, verifies, and writes `mcy-<commit>-v<code>.aab` in the repository root (git-ignored) plus its SHA-256 and the upload-certificate fingerprint. Raise `-VersionCode` for every Play upload.

Enroll in Play App Signing when creating the app so Google holds the app-signing key; this key is only the upload key and can be reset through Play support if lost.

## Play Console checklist (Owner-controlled, personal account)

1. Create the app with the application ID above; default language Vietnamese; free app.
2. Closed testing: Play requires at least 12 testers opted in continuously for 14 days before production access for personal accounts created after 13 Nov 2023. Start this track as soon as a signed bundle exists; use real testers.
3. Store listing: icon 512×512, feature graphic 1024×500, phone screenshots from a real build, honest short/long description (no treatment or cure claims).
4. App content: privacy policy URL (public, stable), Data safety form, ads declaration (none), target audience (not for children), content rating, health-app declarations if the form applies, account-deletion URL.
5. Account deletion: implemented (Cá nhân → Bảo mật tài khoản → Xóa tài khoản) with the public page `/delete-account.html`; use `https://motchutyoga.magicpendigital.com/delete-account.html` and `/privacy.html` in the Console.

## Still open before a production upload

- Signed bundle (Owner creates the upload key), tester roster (≥12 for 14 days), store assets, Data safety answers (drafts in `PLAY_CONSOLE_DRAFTS.vi.md`).
- Supabase Dashboard → Authentication → URL Configuration → Redirect URLs must contain `motchutyoga://auth/callback` (release scheme). Not verifiable from the agent connector; confirm before the first internal test, otherwise the email link cannot return to the release app.
- The restore mitigation and restore card were accepted on the Air1 Ultra by the Owner's report (2026-10-25); the signed release build still needs its own first-run check from Play internal testing.
- Production web: the domain currently points at a Preview branch deployment; decide whether to move it to Production before public launch.
