# MCY — review độc lập sửa callback native song song

Review bắt đầu **2026-10-12 17:59 UTC / 2026-10-13 00:59 Asia/Bangkok**; pre-apply source/preflight conclusion18:03Z và parent post-apply receipt đã đọc trong follow-up. Đây là R3 Auth/config review theo `skills/mcy-change-review`, AGENTS hiện hành và Supabase skill; ngày file dùng local date. Không đổi timestamp bằng ngày local.

**Không thấy P1/P2 trong exact selective staging repair được review: chỉ thêm `motchutyoga-mcydebug://auth/callback`, giữ nguyên17 URL cũ. Parent đã apply một lần và post-readback PASS; config defect được sửa. Human native sign-in sau sửa vẫn pending.** Pre-apply conclusion cho phép đúng operation với fresh exact-diff, exclusive intent và post-readback guards đã review. Đây là kết luận kỹ thuật trong scope user13/10 yêu cầu bước tiếp theo và sửa báo lỗi native; không tự tạo authorization hoặc nghiệm thu physical Auth. Reviewer không push config, chạy ADB, gửi email, đọc code/token/credentials, ghi dữ liệu, grant role hoặc bật AI.

## Defect và bằng chứng

User native trial báo **“Email mở sai app/trình duyệt”**. Frozen [packaging R3](MCY_NATIVE_LEARNER_COMPATIBILITY_REVIEW_2026-10-13.md), SHA `f497daa013b80d92a85b17c3ececcdd9a7b702ace0d596c08d40e146a6f59208`, giữ trạng thái physical Auth fail/pending; không sửa lại báo cáo cũ để gọi startup là Auth PASS.

Fresh parent official-CLI [config probe](MCY_NATIVE_AUTH_CONFIG_PROBE_2026-10-13.json) capture17:56:38.988Z cho17 URLs, native release `motchutyoga://auth/callback` có trong list nhưng parallel exact URL không có. [Sanitized actual-request probe](MCY_NATIVE_AUTH_REQUEST_PROBE_2026-10-13.json) capture17:59:52.372Z ghi native=true/platform android, OTP request redirect scheme=`motchutyoga-mcydebug:`, host=`auth`, path=`/callback`, no query names; không đọc email/code/token hoặc gọi API mới. Parent báo Android read-only resolver bare URI chọn đúng `.mcydebug`; reviewer không tự chạy resolver.

APK trước đó đã được reviewer đọc compiled manifest/resource và JS literal đúng parallel URI. Chain actual request→missing hosted allowlist xác nhận một config defect cần sửa, không cần đổi APK/callback helper hoặc mở wildcard. [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) yêu cầu requested redirect khớp allowlist và hỗ trợ custom mobile URI. Việc thiếu URI giải thích observed routing failure phù hợp nguồn; chưa chứng minh sau khi thêm URL thì mọi email/client/PKCE case sẽ thành công. Standard `.debug` callback không được thêm trong narrow parallel repair này.

## Independent target và exact input review

Independent MCP `get_project` trong lượt này trả **mcy-staging** /ref `mhumbczqrzutdnraafhs`, organization `rzbpjfrndhrtxagpgdre`, `ACTIVE_HEALTHY`, PostgreSQL17. Đây là project/org readback thực tế, không infer từ domain, local link hoặc badge Production của provider. Không dùng target mặc định.

Isolated `.vercel/mcy-native-auth-20261013/supabase/config.toml` chỉ có `project_id="mcy"`, `[auth]` và `additional_redirect_urls`. Directory inventory có đúng config file, không HTML/content-path input. Independent local assertions **PASS exit0**: config bytes/hash đúng preflight; before17 unique, after18 unique; exact old17 thứ tự/bytes giữ nguyên, chỉ append bare parallel URI; không wildcard/role/query redirect mới. Script/probe hashes khớp preflight; frozen packaging report giữ đúng hash.

Parent [preflight](MCY_NATIVE_AUTH_REDIRECT_PREFLIGHT_2026-10-13.json) capture17:59:05.786Z **PASS** ghi duy nhất declared path `auth.additional_redirect_urls`, update17→18 và18 hashes cho unmanaged differences. Reviewer đọc script và toàn bộ sanitized preflight/probe. Reviewer attempted direct official CLI version/config-diff: version **2.119.0 PASS** với telemetry disabled; direct config-diff **exit1/unavailable in reviewer Auth context**, raw output withheld. Initial version attempt bị EPERM telemetry cache write ngoài workspace; corrected invocation dùng same telemetry-disable env, không sửa checker/config/credential. Không claim reviewer đã independently rerun hosted config diff thành công; fresh hosted-diff evidence thuộc parent preflight. Independent target MCP và exact local binding vẫn PASS.

## Script gate review

`scripts/repair-native-auth-redirect.mjs` binds root, explicit projectRef, existing17 URL probe, official Site URL và missing exact parallel URI. `--prepare` creates/checks exact isolated config and rejects different existing bytes/links; no mutation command ở mode prepare. Apply/readback reread exact config and leaf guard. Script syntax `node --check` **PASS exit0**, không thực thi repair script bởi reviewer.

Trước apply, fresh `config diff --project-ref … --workdir … --output-format json` phải đúng target, exactly **1 declared update**, correct path, remote list đúng probe17 và local list đúng expected18; Site URL remote đúng. Preflight/script/probe/config SHA phải khớp; before/after URLs và18 unmanaged hashes khớp nguyên vẹn; tuổi preflight0–<20 phút. Không chạy root generic config hoặc `--include-unmanaged` để chấp nhận broad diff.

Apply tạo **exclusive `wx` intent receipt trước một config push** vào đúng project/workdir. Existing attempt receipt chặn automatic reapply. CLI timeout45s/exit nonzero hoặc unexpected readback ghi `FAILED_OR_UNCERTAIN_READBACK_REQUIRED`; không loop/retry hoặc giả định chưa có cloud mutation. Sau exit0 phải fresh diff có **0 declared changes**,18 unmanaged hashes giữ nguyên mới ghi PASS_READBACK. Một zero-diff riêng lẻ không thay human sign-in acceptance. Reviewer không execute `--apply`/`--prepare`/`--readback` vì prepare cũng viết receipt, và apply là cloud mutation do parent vận hành.

Minimal config không khai Site URL/SMTP/templates/content paths/keys/SQL/roles/AI; source chỉ dùng `config diff` và single `config push`. Không có OTP/mail trigger hoặc mutation API khác. [Official CLI divergences](https://github.com/supabase/cli/blob/develop/apps/cli/docs/go-cli-divergences.md) và prior actual config operations là context cho declared-field selective workflow; không dùng general release checker/profile waiver.

**Giới hạn preservation evidence:**18 unmanaged hashes là đúng18 differential properties được liệt kê (SMTP/email knobs/site/MFA/rate/pooler/storage). Chúng không phải fresh readback của toàn bộ13 HTML bodies, API-secret values hoặc mọi provider setting. Source/TOML không có template upload inputs, nên repair không có body-upload scope; không diễn đạt18 hashes như exhaustive template/secret audit. Fresh post-push exact URL/no declared drift và same18 hashes vẫn bắt buộc.

## Parent apply/readback và current acceptance

Reviewer đọc [single apply receipt](MCY_NATIVE_AUTH_REDIRECT_APPLY_2026-10-13.json), start **18:03:46.211Z** /complete **18:03:50.662Z**, phase **PASS_READBACK**: đúng target/org, bind exact preflightSHA, chỉ thêm parallel URI, unrelatedPreserved=true, automaticRetry=false. Parent reported final separate `--readback` **PASS /0 declared diff /18 unmanaged hashes unchanged**. Source gate chỉ đặt phasePASS sau zero declared diff/same hashes; reviewer đã đọc exact unchanged script, config và preflight hashes sau apply. Không claim reviewer tự đọc live Auth config qua CLI thành công.

APK `5bf4104b…`, frozen packaging R3 `f497daa0…` và learner operation manifest `13521cea…` giữ nguyên; không rebuild/reinstall hoặc đổi generic Supabase config để sửa routing. Apply receipt không trigger email/SQL/role/AI; parent chờ user gửi **email mới từ native app và mở trên cùng phone**. Previous user failure giữ trong frozen packaging report như historical pre-fix outcome. Missing callback defect đã closed bằng config readback; real native email→correct app→confirmed session vẫn **PENDING_USER_RETEST**, không nâng thành Auth PASS từ missing-URL fix hoặc bare-URI resolver.

## Source/evidence hashes

| Input | SHA256 |
| --- | --- |
| Repair script | `4a7c3c19c7387e922c8ee7d41edeb58a6b10db4a8131edf6acac6c8c501a4802` |
| Isolated config | `22799858216e0ef82cf3d3f3921452b43d3a244258d25826245e4a89047a42db` |
| Hosted config probe | `fc17c44f47c4a0ee6d2606028aca68af4a7202c88a2a21ecc848692cf9d881f7` |
| Preflight | `2c022226a96d0e7f7ee2a3ec7e4aa454afe5805a8faab73ceb84b93e4218c9f2` |
| Sanitized actual-request probe | `b3591fdef5aca4240478ac09de01efe6455f2b86af3f16cb4d29031018084694` |
| Parent single apply/readback receipt | `c7f144bc8852c9cdc3fade09bbcffba0d1ae743b25f9141832512db6b300c47b` |
| Exact installed/archive APK — unchanged | `5bf4104b019fbe31597c479ef2511e947803d056d42202b5c007843b5e9f74bc` |
| Frozen packaging R3 — unchanged | `f497daa013b80d92a85b17c3ececcdd9a7b702ace0d596c08d40e146a6f59208` |
| Frozen learner operation manifest — unchanged | `13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143` |

Cloud push/result **không thực thi bởi reviewer**; parent single apply/post-readback PASS được đọc cùng source/hash bindings. Human latest native email→app→session verification còn required. Old links/web-issued links không chứng minh repaired native initiating session. No source/APK rebuild, template reload, SMTP/key/DNS/Production change hoặc new learner writes được clearance từ báo cáo này. Nếu exact diff/input/target thay đổi, dừng narrow operation và review lại; không tự thêm callback khác, grant/expiry extension, pending SQL hay AI enablement.
