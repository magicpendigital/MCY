# MCY — independent R3: native actor reconciliation, 13/10/2026

Review chốt **2026-10-13 04:06:20 UTC**, reviewer `/root/auth_learner_final_review`, theo `skills/mcy-change-review/SKILL.md`. Scope: denied native observation, stored staging reconciliation và delta mới `scripts/observe-native-trial-reconciliation.mjs`. Không sửa original observer677c/R3a0d, exact approved manifest/packet hoặc các frozen receipts. Reviewer không gọi device/ADB/cloud/email/write, không đọc env/token hoặc export private IDs/emails/raw metadata/screenshots; chỉ tạo report riêng.

**Không còn P1/P2 trong reconciliation-only probe cuối.** Có thể chạy một lần chỉ đọc để phân biệt known cache denial/page state, vào receipt mới riêng. Điều này **không cho phép tiếp tục ghi**: native actor vẫn chưa được xác minh, profile fixture đã không khớp, profile/locale HTTP request counts chưa biết. Không resave profile/locale hoặc tự retry các writes để sửa fixture.

## Các kết quả phải giữ

Owner đã duyệt exact native manifest **`71bf0aa806e92d792bd55ad23592af22a78d76733a97af5f6ffa4f97ac19865d`**, target staging/approved A/B và cap2profiles/2locale/4events/2check-ins/0new observations. Reviewer kiểm lại25 bound records (12 inputs+12 frozen inputs+old operation), **0 mismatch**; old12/2/1 budget vẫn spent và không chạy lại.

Original observer **`677c7386…908c1`** chạy parent lúc **03:51:22.212–03:51:23.772Z**, receipt [A after-profile](MCY_NATIVE_TRIAL_LEARNER_A_AFTER_PROFILE_2026-10-13.json) giữ **`CACHED_ACTOR_MISMATCH`**. Theo exact branch đã review/rehearsal, probe đó dừng trước bearer access/Auth fetch. Receipt `authGetOnly:true` mô tả loại request được phép, không chứng minh có Auth GET được thực hiện. Ordinary app login/refresh/read requests vẫn có thể xảy ra riêng.

Status này bao gồm **storage thiếu, JSON không parse được, user.id thiếu hoặc ID khác expectedA**; chưa đủ kết luận điện thoại là tài khoản khác. Không overwrite receipt, nâng nó thành PASS hoặc bỏ cache gate để đọc bearer của actor chưa được duyệt.

[Stored reconciliation](MCY_NATIVE_LEARNER_TRIAL_RECONCILIATION_2026-10-13.json) parent capture SQL03:50:45/profile03:52:04, reviewer đọc receipt/source chứ không query live lại: A có1profile mới created/updated **03:50:39.456896Z**, Auth.locale vi-VN; other metadata/history/control hashes không đổi. Profile fictional-name-match **false**, style **masculine**, không phải neutral đã định; không raw name được export. A8consents/1check-in/1observation; B4/1/0/profile absent;0new consent/check-in/observation, required terms/privacy current và wellbeing revoked. Ledger21/writer body/OwnerMD5/AIoff-v1 không đổi trong readback này.

Profile/locale changes xảy ra trước khi required native fresh-Auth gate có PASS, nên **profile/native data acceptance chưa đạt**. Một row/locale change không chứng minh đúng1HTTP request; readback ghi request counts **NOT_OBSERVED**. Parent báo bounded provider log aggregate bị backend error; subsequent route-only aggregate rỗng dù đã quan sát row, nên stream/filter observability chưa đủ và không phải bằng chứng0requests. Không có accepted count evidence, không thêm log queries được đề xuất. Intent reserve A profile/locale slots là precaution, không bằng chứng exact request count hoặc phép cấp thêm budget. Không giả định còn đủ slot để ghi B trước khi reconciliation/count gate được giải quyết.

Owner sau đó trực tiếp xác nhận profile A dùng dữ liệu giả, không gửi raw name. Giữ riêng **USER_REPORTED_FICTIONAL_PROFILE**, không nâng exact prepared-name/neutral-style match thành PASS; điều này cũng không xác minh native actor hoặc request counts. Không yêu cầu gửi tên đã nhập và không sửa profile để khớp fixture.

Current intent snapshot giữ **`WAITING_FOR_ACTOR_RECONCILIATION`**, same nonce/manifest/approval, observed profile1/locale1/health writes0; fictional fixture false, no profile/locale repeat, no further write instructions. Owner reports thao tác trong parallel app/A04 onboarding là human report cần giữ riêng, không thay native/cache/server identity proof.

## Source/storage hypotheses

`src/backend/supabase.ts` derive fixed key `sb-<URL-host-project>-auth-token`; app config không đặt `userStorage`. Hash-matched APK SDK `assets/dist-BXgLBU46.js` chứa `_saveSession`: nếu không userStorage, lưu direct cloned Session với `user`; chỉ khi userStorage được cấu hình mới tách `-user`. Source đó phù hợp với direct `Session.user.id` của probe; **không chứng minh cache thực hiện tại có shape ấy**.

Các giả thuyết còn mở: missing/malformed/no-user cache; pending SDK hydration; approvedB/another cached actor; more than one local WebView; app-vs-web/late account transition; helper label không khớp approved identity. Không gán root cause SDK/schema/actor mapping từ một denial. Không đọc token từ unknown cache, sửa SDK/session/localStorage, clear data, đổi approved hashes hoặc resave để “đồng bộ”.

## Delta mới và schema P2 đã sửa

Reconciliation-only file tách khỏi original source; chỉ phase `actor-reconciliation`, labelA và intent `WAITING_FOR_ACTOR_RECONCILIATION`; output riêng `MCY_NATIVE_TRIAL_LEARNER_A_ACTOR_RECONCILIATION_2026-10-13.json`, wx/existing guard. Require **exactly1** page `https://localhost/` thuộc installed .mcydebug PID, không chọn page đầu khi có nhiều; page count chỉ safe integer/null.0/2pages dừng trước Runtime evaluate/Auth.

Known cache mismatch chỉ export4 **booleans**: fixed cache present, parsed value present, string user.id present và approvedB match. Không actual UID/hash/email/token/metadata của unknown actor. B match vẫn là **cache-only**, không serverB verification hoặc tự đổi sang B phase. A cache đúng mới đi qua fixed Auth GET/server match/confirmed/generic role, canonical digests/locale enum và same-session after-await checks đã review ở original source. Target/APK/hash-bound public entry/key,30s bounds, cleanup, captured one-buffer intent/approval pins và post-cleanup drift guards giữ nguyên.

Reviewer phát hiện initial delta **`ad655d37…e8e54f`** mở rộng global allowed keys nhưng chỉ kiểm cache booleans trong failure branch. Malformed PASS với `sessionCachePresent:'private text'` có thể qua export schema; regex64hex cũng chấp nhận một-element arrays. Parent sửa trước invocation: diagnostic keys kiểm globally/chỉ được ở `CACHED_ACTOR_MISMATCH`/typeofboolean, PASS từ chối chúng; digest phải typeofstring trước regex, page count phải null/nonnegative safe integer. Final source **`22bd22f98704ffd3e3e1e5b46968be9ca34e7122541880a9151a937ec73ba600`**; P2 export-schema đóng.

## Independent checks

Final syntax `node --check scripts/observe-native-trial-reconciliation.mjs`: **PASS exit0**. Không invocation device bởi reviewer.

Actual embedded expression của final source, in-memory VM/fictional values, chỉ substitute approved A/B pin constants bằng synthetic actor pins: **10 groups PASS exit0**. Missing/malformed/null/primitive/nested-session/missing-user/B-cache/unknown-cache đều known denial,0bearer reads/0fetch; approvedA/server200 PASS; Auth403 không metadata/diagnostics. Không fake hoặc export real identity.

Actual full host control flow của cùng source, mock fs/ADB/CDP/fetch/console: **20 groups PASS exit0**. Success; source/approval/intent/input drifts; existing/racing wx receipt; wrong label/intent phase; stopped/foreground/cleanup failure; Auth denial; invalid export key; zero/multiple page trước evaluation; constrained cache denial; malformed PASS cache field, digest array và denied nonboolean đều bị từ chối trước persist. Không real ADB/network/file writes. Các mock PASS không chứng minh physical WebView/Auth/CORS/storage shape hoặc live write budget.

## Bước tiếp tối thiểu, chỉ đọc

1. Giữ halted intent và old denial; kiểm source22bd/input pins và foreground/package chưa drift rồi chạy **một distinct reconciliation observation**, không auto retry/overwrite. Không new login email/metadata save/consent/check-in bởi agent.
2. Interpret4booleans/page count theo snapshot: missing/malformed/noUID hỗ trợ cache/shape investigation; knownB hoặc neitherA/B không cấp quyền đọc bearer/mở writes. Nếu A serverGET200 thật, vẫn cần fresh authority/consent/count và profile/request reconciliation; observer PASS không tự đổi intent ACTIVE.
3. Parent có thể đối chiếu approved identity↔helper label trong memory bằng ID hashes đã xác minh, không export email/UID/token hoặc tin expired helper403. Nếu cần read-only probe khác để xét SDK state/page ownership, review đúng delta trước chạy; không bypass cache match để gọi Auth cho unknown actor.
4. Reconcile request counts bằng bounded metadata evidence nếu có; không dùng row count thay HTTP count, không retry một query đã fail chỉ để lấy green. Profile fixture vẫn FAIL; để nguyên đã lưu, ghi rõ limits và chuẩn bị quyết định/phạm vi cụ thể nếu muốn thay đổi hoặc tiếp tục. Exact original cap không tự mở thêm writes.

Không newhealth data acceptance, native A/B switch/restore/consent/revoke/check-in/Journey PASS trong report này. Shell restoration failure/user real-icon recovery giữ scope cũ; no AI/Production/role/expiry/migration hoặc other release gate change.

## Hash snapshot

| Input | SHA256 |
|---|---|
| Reconciliation-only final source | `22bd22f98704ffd3e3e1e5b46968be9ca34e7122541880a9151a937ec73ba600` |
| Original observer retained | `677c73861ef9fc034b73491b1790df172aca73e9c7e6303eef4d870355f908c1` |
| Original observer R3 retained | `a0d1af419db32297906fbe3a02ce506a0307ad394c6a91b629d162c9e2ee23f6` |
| Original denied receipt retained | `0cac4f0b35633c2c95d0818b57b6147fb1b510deaaefbd4377815602cf20be12` |
| Stored reconciliation snapshot | `b7c9305447402ee69abd1616b922bf225b226f4758310e884a316d718afbf335` |
| Halted intent snapshot | `a57318a58f0ea122ff069600f655ffee49b9c14213d1c5e1f41f536a8acef899` |

Intent/reconciliation snapshots mô tả thời điểm review, không bắt buộc chúng bất biến trong execution; mọi tiến triển phải receipt riêng. Reviewer chỉ tạo report này và không rewrite source/approved inputs/frozen evidence.
