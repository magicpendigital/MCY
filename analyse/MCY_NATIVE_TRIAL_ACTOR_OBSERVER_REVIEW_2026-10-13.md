# MCY — independent R3: native actor observer, 13/10/2026

Review chốt **2026-10-13 03:42:22 UTC**, reviewer `/root/auth_learner_final_review`. Scope: source mới `scripts/observe-native-trial-actor.mjs`, approval/exclusive intent/baseline của manual native trial. Theo `skills/mcy-change-review/SKILL.md` và R3 matrix; không sửa app, APK, prepared manifest/packet hoặc các R3/receipts đã frozen.

**Không còn P1/P2 trong source observer cuối và các input đã review.** Có thể dùng observer chỉ đọc sau khi người dùng tự đăng nhập đúng A/B, trước các bước ghi trong gói đã duyệt. Đây là source/rehearsal clearance; chưa có native Auth GET thực hoặc positive data acceptance trong report này. Reviewer không gọi ADB/device/cloud, không đọc env/token/UID thật hoặc private screenshots, không gửi email hoặc ghi dữ liệu. Chỉ tạo report mới này.

## Approval và input

[Owner decision](MCY_NATIVE_LEARNER_TRIAL_APPROVAL_2026-10-13.json) ghi direct reply “Duyệt gói native và giới hạn trên”, exact [manifest](MCY_NATIVE_LEARNER_TRIAL_OPERATION_2026-10-13.json) **`71bf0aa806e92d792bd55ad23592af22a78d76733a97af5f6ffa4f97ac19865d`**, prepared R3 **`96136072eca4b1d8247c6a751133a09820af1daa6098a2763f46c0993403efc0`**. Scope chỉ staging `mhumbczqrzutdnraafhs` / MagicpenDigital `rzbpjfrndhrtxagpgdre`, Air1 Ultra `.mcydebug` APK **`5bf4104b019fbe31597c479ef2511e947803d056d42202b5c007843b5e9f74bc`**, approved disposable A/B.

Cap không đổi: tối đa **2 profile upsert requests tạo2 profiles /2 cosmetic Auth locale updates /4 wellbeing events /2 check-ins /0 new observations**, không role/expiry/SQL/deploy/AI/Production. Người dùng tự local sign-out/email/login; observer không thực hiện các thao tác đó. Budget12/2/1 của operation cũ đã dùng đủ, không lặp lại.

Reviewer kiểm SHA trực tiếp 25 records của manifest: 12 inputs +12 frozen application inputs +originalOperation **`13521cea…2143`**, **0 mismatch, exit0**. Prepared status/PENDING fields trong manifest là lịch sử và giữ nguyên; quyết định mới nằm ở approval riêng. Observer kiểm 24 `inputs+frozenApplicationSource` trước/sau, không nên mô tả vòng đó là 25; kiểm originalOperation là bước độc lập bổ sung của preflight/reviewer.

[Exclusive intent](../.vercel/mcy-native-learner-trial-20261013.intent.json) được đọc đúng `WAITING_FOR_A_LOGIN`, nonce `2d8afaa2-fac3-45c4-8b7c-c41e10dd0184`, manifest/approval/baseline hash và target/APK/caps khớp; observed effects đều0. Stored helper A/B Auth403 được ghi rõ **không chấp nhận làm identity evidence**. Intent được tạo trước manual sign-out/write. Sau khi tiến hành, phase/hash sẽ thay đổi có chủ đích và cần receipt riêng; snapshot này không khẳng định phase còn hiện hành.

## P2 đã đóng trước invocation

Initial source **`bb429dd465d03d044933921c8149e6f7ac9a82b71c9325e00a1fdda7bfb7ea98`** chỉ kiểm intent trước async CDP/Auth và tính source hash tại cuối. Nếu intent STOP/đổi actor/nonce hoặc source thay đổi trong lúc chờ, nó có thể ghi PASS cũ với pins mới. Bản sửa đầu vẫn parse intent và hash bằng hai lần đọc, còn race giữa validated phase và captured bytes.

Final source **`677c73861ef9fc034b73491b1790df172aca73e9c7e6303eef4d870355f908c1`** đọc manifest/approval/intent mỗi loại thành một buffer, parse/hash cùng bytes; capture source/approval/intent trước device access. Sau async result **và cleanup**, nó kiểm lại captured source/approval/intent, manifest và24 input hashes. Drift trả `INPUT_DRIFT_DURING_READ`, bỏ metadata/PASS signals; receipt bind các hashes đã capture. P2 đóng; không thấy P1/P2 còn lại trong phạm vi này.

## Trace identity, privacy và bounds

Fixed package/serial, installed và archived APK SHA, extracted entry hash được kiểm; public key duy nhất lấy từ hash-bound APK entry, chỉ mẫu `sb_publishable_…`. Không load credential/env/helper access token. Guard yêu cầu stopped=false, foreground đúng, awake/unlocked, PID đúng; local owned forwarding, WebView page chính xác `https://localhost/`.

Embedded expression chỉ hoạt động trên native Android/ready complete. Nó hash cached UID và so đúng approved actor **trước truy cập bearer hoặc fetch**; mismatched cache không export UID/hash của người đang đăng nhập và không gọi Auth. Chỉ approved actor có session chưa hết hạn được một **GET** fixed `https://mhumbczqrzutdnraafhs.supabase.co/auth/v1/user`; redirect:error, abort7s, không SDK refresh/injection/global session writes. Server ID hash phải trùng, email confirmed và generic Auth role authenticated. Role này **không chứng minh no staff/teacher**, nên SQL authority gate riêng vẫn bắt buộc.

UID/token/response ở trong WebView. Canonical recursive key ordering hash toàn user_metadata trừ **top-level locale**, hash app_metadata nguyên vẹn; chỉ locale enum/null được export. Sau mọi awaited GET/crypto, cached UID/token/finite unexpired expiry được đọc lại; account change hoặc same-account JWT refresh đều fail closed. Không scrape DOM/private text, gọi UI, chụp ảnh, bật Network/console hoặc đọc email/link/mã. Active route chỉ enum/unrecognized.

Host chỉ nhận schema allowlist: status/HTTP integer/booleans/64hex metadata digests/locale/route enum. Failure không chứa metadata, provider/Runtime errors được sanitize. Receipt `wx`, existing receipt bị chặn trước device; race wx không overwrite. 30s overall deadline đi qua ADB6s/local fetch4s/CDP12s, cleanup owned forwarding3s riêng, socket close. Có thể còn ordinary app Auth refresh/read hydration hoặc provider request logs; không diễn đạt probe/app là hoàn toàn không có network/log bookkeeping. Observer không restart/install/clear data/sign-out/email/profile/consent/check-in hoặc provider inference.

## Independent rehearsal trên exact final source

`node --check scripts/observe-native-trial-actor.mjs`: **PASS exit0**.

Reviewer trích **actual embedded expression** từ source cuối, chạy in-memory VM với fictional UID/token/metadata và mocked GET: **12 groups PASS exit0**. Gồm exact fixed GET; canonical reordered keys/top locale giữ digest; nonlocale và nested locale đổi digest; wrong cache không đọc bearer/không fetch; nonnative/expired; Auth403 không metadata; wrong server ID/unconfirmed/non-authenticated denial; JWT refresh/account switch giữa await; provider exception không export. Không dùng real actor ID/token/key hoặc network.

Reviewer chạy **actual full host control flow** của cùng source trong AsyncFunction, mock fs/ADB/CDP/fetch/console, không sửa file thật: **13 groups PASS exit0**. Success; source/approval/intent/input drift đều non-PASS/no metadata; existing receipt và wrong phase có0ADB; stopped/foreground failures; cleanup failure; Auth denial; invalid result schema; racing wx receipt không overwrite. Captured source hash trong mock receipt khớp exact executed source. Đây là guard rehearsal, không physical WebView/CORS/Auth/API acceptance. Không broad UI/build rerun vì app/APK/input fixtures không đổi; independent4UI và parent29UI trước đó giữ scope tại prepared R3961….

## Baseline, digest metrics và execution còn mở

[Execution baseline](MCY_NATIVE_LEARNER_TRIAL_EXECUTION_BASELINE_2026-10-13.json) parent capture **03:31:52.615701Z**, reviewer kiểm receipt/hash/source SQL, không query cloud lại: A8consents/1check-in/1observation và B4/1/0; profiles0, confirmed/no active staff/teacher, current terms/privacy, wellbeing revoked. Ledger21, writer bodyMD5 `ba61a962de9c9fdfc364ad6fe83837e6`, definitionMD5 `56bb448ca2dcb1af60d01e097ef974f1`, Owner definitionMD5 `5ad67fe52caf79bd07c51caa0c30db92`, AIoff/v1/model unset. Intent baseline SHA matches bytes. Read-only target ACTIVE_HEALTHY/APK/stoppedfalse là parent preflight đã báo, không fresh live attestation của reviewer trong report này.

SQL metadata digests dùng PostgreSQL `jsonb::text`, native observer dùng compact recursive JS canonicalization. **Chỉ so SQL-before↔SQL-after và native-before↔native-after trong cùng thuật toán**, không so chéo hai family hoặc gọi khác digest là drift. Old-history digest phải so đúng subset bản ghi cũ khi đã thêm check-in mới. Native saved valid Auth locale được giữ; absent/invalid mới fallback profile vi-VN. Upstream [Supabase MagicLink source](https://raw.githubusercontent.com/supabase/auth/master/internal/api/magic_link.go) phân biệt existing confirmed và signup branch; đây không xác minh version hosted. Fresh before/after metadata readback vẫn cần thiết, không suy provider behavior chỉ từ nguồn upstream.

Chưa có real native A/B observer PASS, profile/locale/grant/check-in/reopen/revoke/account-switch data acceptance trong supplemental này. Trước từng write, cần actual phone Auth200/matching actor cùng fresh server authority/current policy/profile/count/metadata baseline; không dựa vào helper403 hoặc visible sign-in. B phải được xác minh sau B login trước B writes. Auth GET receipt là snapshot theo capturedAt/phase, không quyền lâu dài hoặc miễn consent/role recheck tại writer.

Các receipt observation không phải write executor và không tự mở quota/retry. Uncertain commit dừng/readback, không bấm save mới/key mới; giữ lịch sử, wellbeing revoke cuối trong cap. No new write sau revoked không có nghĩa Journey/history cũ bị xóa. Shell restoration uncertain/user white-screen report vẫn giữ; real-icon recovery riêng không thành server/same-actor/cold-start PASS. Không thay release/Production/content/AI/iOS hoặc rejected Owner-save gate.

## Hash chốt

| Input | SHA256 |
|---|---|
| Observer final source | `677c73861ef9fc034b73491b1790df172aca73e9c7e6303eef4d870355f908c1` |
| Exact prepared manifest | `71bf0aa806e92d792bd55ad23592af22a78d76733a97af5f6ffa4f97ac19865d` |
| Owner approval | `366a5d71673966094ba583f602bf348f2c30da6fcf353e104539a38f7ed0e291` |
| Prepared R3 retained | `96136072eca4b1d8247c6a751133a09820af1daa6098a2763f46c0993403efc0` |
| Intent snapshot WAITING_FOR_A_LOGIN | `43d5dbf9699487b734b9b4136c2bb91243ea6828929e72b11a2744d3a374621c` |
| Execution baseline | `021f3f232f282a732f8f858f4b09dbbd8908a9893d98b2093f2f0bb306be0578` |
| Read-only execution-baseline SQL | `4c05d2a87e9af665eecd070e457a4831dea8b971511423e404d154f746c19c22` |

Không rewrite frozen inputs để thể hiện approval hoặc acceptance mới. Source/hash thay đổi tiếp phải review lại đúng diff; execution và data counts phải ghi receipt riêng.
