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

## Create the upload key (Owner, once)

Run on your own machine, keep the file and passwords in a password manager, never in chat or the repository:

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore "D:\secure\mcy-upload.jks" -alias mcy-upload -keyalg RSA -keysize 2048 -validity 10000
```

Enroll in Play App Signing when creating the app so Google holds the app-signing key; this key is only the upload key and can be reset through Play support if lost. Then set the four `MCY_UPLOAD_*` variables in your shell and rebuild.

## Play Console checklist (Owner-controlled, personal account)

1. Create the app with the application ID above; default language Vietnamese; free app.
2. Closed testing: Play requires at least 12 testers opted in continuously for 14 days before production access for personal accounts created after 13 Nov 2023. Start this track as soon as a signed bundle exists; use real testers.
3. Store listing: icon 512×512, feature graphic 1024×500, phone screenshots from a real build, honest short/long description (no treatment or cure claims).
4. App content: privacy policy URL (public, stable), Data safety form, ads declaration (none), target audience (not for children), content rating, health-app declarations if the form applies, account-deletion URL.
5. Account deletion: in-app path plus a public web request page are required for apps that let users create accounts. **Not implemented yet**; see the report's Phase 2.

## Still open before a production upload

Native session restore on Air1 Ultra (HALTED), FlowStack accessibility P2, public privacy policy/terms and deletion page, signed bundle, tester roster, Auth allowlist check, physical-device acceptance of the new application ID.
