# MCY — independent R3: native session probe và gói learner trial, 13/10/2026

Review chốt lúc **2026-10-13 02:22:08 UTC**, ngày local 13/10. Reviewer `/root/auth_learner_final_review`; source working tree tại HEAD `82458fc219a2231ccac279112dfc0db5447b0edd` còn dirty. Áp dụng `skills/mcy-change-review/SKILL.md`, review matrix và các giới hạn hiện hành trong `AGENTS.md`.

**Không thấy P1/P2 còn mở trong checker hiện hành, bốn fixture mới và phạm vi chuẩn bị manual trial đã review.** Điều này không đóng lỗi/acceptance khôi phục native bằng shell: lần đó vẫn `UNCERTAIN_AFTER_RESTART`, được người dùng báo màn hình trắng/đứng. Gói ghi native mới vẫn **PREPARED / CHƯA ĐƯỢC OWNER DUYỆT / CHƯA CHẠY**. Reviewer không build/cài APK, chạy ADB, restart, điều hướng điện thoại, đọc token/env, gửi email hoặc ghi cloud trong review này.

## Input bất biến và phạm vi

Review bind [manifest native trial](MCY_NATIVE_LEARNER_TRIAL_OPERATION_2026-10-13.json) SHA256 **`71bf0aa806e92d792bd55ad23592af22a78d76733a97af5f6ffa4f97ac19865d`**, release `mcy-native-learner-trial-20261013`. Kiểm SHA trực tiếp **25 records**: 12 inputs, 12 frozen application/rehearsal inputs và manifest learner cũ; **0 mismatch, exit0**. Không sửa/regenerate manifest hoặc packet. Report này được manifest chỉ định là review gate, không nằm trong inputs nên không tạo vòng hash.

Đích chỉ `mcy-staging` / `mhumbczqrzutdnraafhs`, MagicpenDigital / `rzbpjfrndhrtxagpgdre`; Air1 Ultra `Q88549EEXCUOONGA`, package `com.nilaza.motchutyoga.mcydebug`, APK SHA **`5bf4104b019fbe31597c479ef2511e947803d056d42202b5c007843b5e9f74bc`**. Chỉ Learner A/B fictional, identity hashes bind trong manifest; không dùng tài khoản Owner hoặc coi nhãn helper là quyền server.

Manifest learner 11/10 **`13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143`** và các báo cáo R3 cũ giữ nguyên. Ngân sách live 12/10 **12 consent /2 check-ins /1 observation đã dùng đủ**, không được chạy lại hoặc mở rộng ngầm.

## Checker và kết quả physical bị giữ nguyên

Các P2 phát hiện trong source probe ban đầu đã được sửa trước lượt physical: intent độc quyền phải tồn tại trước điều hướng/restart; không overwrite intent của tiến trình khác khi `wx` thất bại; không xuất salted fingerprint qua assertion/error; selector Cá nhân ở fixed footer đúng/duy nhất/visible/enabled; route safe là home/discover/profile/journey; foreground và safe idle được kiểm lại ngay trong thao tác điều hướng và ngay trước restart; cached actor không đổi; deadline 60s truyền vào ADB/fetch/CDP/polls, post-restart tối đa 25s; owned forwarding/socket được cleanup. Chỉ nút cố định Cá nhân được phép điều hướng; không đụng input/media/alert/draft đang mở. Kết quả identity chỉ là **cached actor**, không xác minh server.

Reviewer đã rehearsal control flow của exact source cuối `b758…` trong bộ nhớ bằng mock ADB/CDP/fs/clock: **8/8 PASS, exit0** (success một stop/start; existing attempt; racing intent; wrong foreground; editing; stale edit; actor mismatch; deadline). Các failure trước restart có 0 restart; actor mismatch sau restart giữ uncertain/no PASS; foreign intent không đổi; logs/receipts không chứa fingerprint. Đây là mock của guard/control flow, không chứng minh browser expression, hệ điều hành hoặc backend thực.

Lượt physical do parent thực hiện một lần lúc **01:59:53.217–02:00:20.408Z** giữ [intent](../.vercel/mcy-native-session-restoration-20261013.intent.json) `UNCERTAIN_AFTER_RESTART`, `restarted=true`, chưa hoàn tất comparison. **Không tồn tại `MCY_NATIVE_SESSION_RESTORATION_2026-10-13.json` PASS receipt**. Owner báo “Màn hình trắng hoặc đứng”; không chạy lại. Source thực thi được archive đúng bytes `b758…`, không rewrite để đại diện trạng thái mới.

Current `check-native-session-restoration.mjs` **từ chối `--restore` vô điều kiện trước đọc artifact hoặc gọi ADB**. Reviewer kiểm syntax PASS và gọi đúng `--restore`: exit1/retired guard/empty stdout, không device access. Default chỉ còn guarded account precheck; nó có thể bấm Cá nhân từ safe idle, đọc tín hiệu UI/storage và dùng fingerprint tạm trong RAM. Không export UID/token/fingerprint/private text; không gọi Auth/consent/check-in trực tiếp. App có thể tự refresh Auth/read hydration bình thường; không được diễn đạt là tuyệt đối không có network từ app.

`inspect-native-session-state.mjs` syntax PASS, source review không P1/P2 trong scope observation: yêu cầu intent uncertain, exact PID/package/local `https://localhost/`, bounded local CDP, cleanup forwarding; chỉ route allowlist/DOM booleans/storage-key presence. Không điều hướng, restart, export giá trị session/text/screenshots. Receipt chỉ `OBSERVATION_ONLY_NO_RESTORATION_PASS`.

## Khôi phục bằng icon và giới hạn điều tra startup

[Recovery riêng](MCY_NATIVE_LAUNCHER_RECOVERY_2026-10-13.json) ghi Owner tự đóng Recent/chạm icon thật rồi báo **“Giao diện hiện và vẫn đăng nhập”**. Sau đó [inspection 02:11:15.617Z](MCY_NATIVE_SESSION_UNCERTAIN_INSPECTION_2026-10-13.json) cho foreground đúng, native Android, ready complete, root1/home/no alert/storage-key present. Trên home, `hasAccount`/`hasSignedInAccount` đều false; không biến receipt này thành xác nhận server sign-in. Parent chạy account precheck sau recovery và báo visible signed-in PASS. Đây là corroboration UI và **USER_REPORTED_UI_AND_SIGNIN_RECOVERY**, không comparison với cached actor trước restart: salt cũ đã mất, không chứng minh cùng UID/server identity.

Đã đọc native MainActivity/manifest, Capacitor Android Bridge/WebView và [checkpoint 03/10](MCY_ANDROID_WHITE_SCREEN_CHECKPOINT_2026-10-03.md). Dated03/10 đã ghi shell/force-stop FAIL, real Launcher PASS3/3 **trên APK cũ**, kèm system ActivityManager “process is bad”/sandbox-service denials. Đây là bằng chứng đường mở cần được đối chiếu trước chọn phép thử, không phải regression PASS3/3 cho APK hiện tại. MainActivity hiện extends BridgeActivity, không có app-specific renderer recovery; source này không xác định nguyên nhân lần trắng hiện tại.

Fresh [package readback 02:08:02.850Z](MCY_NATIVE_WHITE_PACKAGE_STATE_2026-10-13.json) có `stopped=true`, system-warning match0 trong bounded window. [Diagnostic](MCY_NATIVE_WHITE_DIAGNOSTICS_2026-10-13.json) chỉ sample last250 app-process lines/counters, không chứng minh system ActivityManager không có denial. Các sample không match, process/foreground còn và CDP timeout **không chứng minh sâu lỗi ROM/framework, renderer crash, assets hay Auth JS**. Không patch app, đổi WebView, clear data hoặc gọi crash probe để suy đoán chữa lỗi.

Primary-source lead: Android13 [ProcessList](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android13-release/services/core/java/com/android/server/am/ProcessList.java) phân biệt bad-process handling ở background với explicit user launch. Điều này phù hợp để điều tra đường mở, nhưng không chứng minh vendor ROM hiện tại hoặc nguyên nhân lần này. Android [WebViewClient.onRenderProcessGone](https://developer.android.com/reference/android/webkit/WebViewClient#onRenderProcessGone(android.webkit.WebView,%20android.webkit.RenderProcessGoneDetail)) yêu cầu cleanup WebView đã mất renderer; chỉ áp dụng nếu có bằng chứng event thực, không phải lý do tự động reload/clear data. Native startup SLA, OS reclaim, expired/revoked session và full cold-start vẫn chưa được kiểm.

## Bốn regression mới và bằng chứng kiểm thử

Exact `tests/learner-device-acceptance.spec.ts` SHA **`6dfc474e63da334045d6294f4812b18f43d86390d228b8ad7076d4c4ca586571`**. Review nguồn xác nhận runner-owned Vite/teardown, fictional `mcy-playwright.invalid`, fictional A/B/session keys; real `*.supabase.co` bị abort và ghi unexpected. Không seed từ `.env.local`. Mock ghi chỉ vào bộ nhớ; unexpected API bị từ chối.

Reviewer chạy độc lập:

```text
MCY_PLAYWRIGHT_CHANNEL=msedge MCY_PLAYWRIGHT_VITE_CONFIG_LOADER=runner MOBILE_RUNTIME_TEST_PORT=4182
npx playwright test tests/learner-device-acceptance.spec.ts --workers=1 --reporter=line --output=test-results/native-device-independent-final-20261013
```

**4/4 PASS, exit0, 25.0s**. Lần sandbox trước đó fail4 ở browser launch trước assertion (Edge temporary site-list access), giữ intermediate; lần final dùng Edge tạm ngoài sandbox đã được automatic review cho phép, cùng fixture/source/assertions. Không staging/device/email writes.

Coverage: reload reuse current consent không ghi lại; một standalone check-in đọc trong Journey sau reload, missing reflection không giả cải thiện; A→B→A không lộ history A sang B; revoke wellbeing còn revoked sau reload, bấm save-only không phát writer RPC/không tăng row. Fixture không mô hình hóa toàn bộ SQL concurrency/idempotency mismatch/real Auth/RLS. Không gọi đây là physical native hoặc staging data acceptance.

Parent [UI receipt](MCY_NATIVE_LEARNER_UI_EVIDENCE_2026-10-13.json) final29/29 exit0 (4 mới +15 learner write +10 callback), isolation1 và runtime28 PASS. Đây là parent-run evidence đã đọc, khác independent4/4. Không broad rerun/build vì app/runtime source và APK không đổi; prior build/scanner/native packaging evidence giữ scope lịch sử.

## Manual trial mới: đầy đủ effects nhưng chưa được phép ghi

[Packet](MCY_NATIVE_LEARNER_TRIAL_OPERATION_2026-10-13.md) và manifest tính **tối đa2 profile upsert requests tạo2 profile;2 Auth metadata locale updates;4 wellbeing grant/revoke events;2 check-ins;0 new observations**, không delete/grant role/expiry extension/SQL/deploy/AI. Profile giả QA A/B, neutral, public profile locale vi-VN, timezone thiết bị; check-in none_now/energy2/standalone/no note/no regions. Intent nonce/baseline độc quyền phải được lưu trước sign-out/ghi; unknown commit phải readback rồi dừng, không retry/key mới. Người dùng tự local sign-out/email-login/Recent/icon; agent chỉ xác minh đọc, không email/session injection hoặc shell restart.

Source trace xác nhận hydration chỉ đọc; AuthSessionRouter reuse terms/privacy hiện hành và đưa actor thiếu profile tới onboarding. `persistProfile()` thực hiện profile upsert một lần rồi cosmetic Auth PUT dùng initiating verified token. **Precision:** native email metadata.locale giữ locale hợp lệ đã lưu trong initiating session; khi absent/invalid mới fallback public-profile vi-VN. Không ép Auth locale thành vi-VN, không sửa khóa metadata/role khác. Cap2 tính requests/side effects này dù trả về không rõ; không thử thêm PUT để “đồng bộ cho chắc”.

[Stored preflight 02:14:41.06007Z](MCY_NATIVE_LEARNER_TRIAL_PREFLIGHT_2026-10-13.json) do parent capture, reviewer đọc receipt/source SQL nhưng **không query cloud lại trong supplemental này**: ledger21; Owner definitionMD5 `5ad67fe52caf79bd07c51caa0c30db92`; writer bodyMD5 `ba61a962de9c9fdfc364ad6fe83837e6`, definitionMD5 `56bb448ca2dcb1af60d01e097ef974f1` là hai metric khác. AIoff/v1/model unset. A8/1/1, B4/1/0, profiles0, confirmed/no active staff/teacher, current terms/privacy, wellbeing revoked. Nếu thực hiện đủ cap: A10/2/1 +profile1, B6/2/0 +profile1; wellbeing revoked cuối. Receipt có thời điểm, không bảo đảm baseline còn đúng lúc execution.

Trước bất kỳ write phải có **Owner duyệt riêng exact manifest/effects**, fresh exact org/project/APK/source, actual native initiating A/B khớp confirmed Auth và authority/consent/profile/count/metadata baseline. UI signed-in/session-key hoặc token helper label không thay server identity; bất kỳ cách probe bổ sung phải giữ privacy/bounds và review theo diff. Không log token/email/link/mã/real Owner UID/private screenshot. Mỗi actor chỉ một profile save/check-in và grant/revoke; stop khi drift/cap/5xx/uncertain/white/cross-account/AI request. Revoke sau grant nằm trong cap4, không mở thêm cleanup SQL.

Sau revoke, tiêu chí là **0 new writer request/0 new rows** cho lượt chưa lưu. Các check-in/observation lịch sử vẫn được giữ và có thể còn hiển thị trong Journey; không yêu cầu Journey toàn bộ rỗng hoặc xóa lịch sử. Channel Android, payload mới/ownership/idempotency, profile/cosmetic locale và preserved old history cần readback thực mới. Preparation, fixtures và human recovery không waive release checker, Production, content expertise/rights/catalog,4 pending migrations, AI, Xcode/iPhone, playback/full accessibility hoặc specific rejected Owner-config-save gate.

## Hash bổ sung được review

| Input | SHA256 |
|---|---|
| Current precheck-only script | `8f7b4daeb73ce27aefe9a9091b0db4348e4b48310566de2261986d538d1da75d` |
| Failed exact archived source | `b758c902a3d510dd9bc872811bcf64bc26f947eeaa639b8cf6c7fc41f710b89c` |
| Exclusive failed intent | `8aac0063e8c5b10d0a1b5f96138182a1de66c030e456d70dd09027fbbb3cddfd` |
| Read-only inspector source | `d844121e5a30bd0b684aada13f0c857dc527bc59bb7450bdd88a94b23ecda404` |
| Observation receipt | `600ea4c24bca47a4f606fbd13f402f0720a45e6e30e9ace5a35bb7ebbbe0c86c` |
| Human launcher recovery | `e745cdaa95a220786b79eab7c9258f452051a98962bfb494a224d57ce526b2d6` |
| Package stopped-state receipt | `a2047f5b9f51612a113d9a935467e9b9983e405b6a645eac0a596f4c55cccf64` |
| Bounded app-process diagnostics | `7d720ea077bcfc10d3b99ce8574bdb07639d37ade61b4ae05db088fddfbca177` |
| Preserved packaging R3 | `f497daa013b80d92a85b17c3ececcdd9a7b702ace0d596c08d40e146a6f59208` |
| Preserved selective Auth R3 | `d8f21a9d893fbee7231ece935632240e513e2c59a97b522e08edf72346cbb40a` |

Review không sửa các input trên; chỉ tạo report này. Mọi approval/execution sau đó phải là receipt riêng, không rewrite prepared/failure evidence thành PASS.
