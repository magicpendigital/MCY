# MCY — review độc lập executor, bounded harness và deployed SQL

Review window: **2026-10-11 18:43–18:58 UTC / 2026-10-12 01:43–01:58 Asia/Bangkok**. Readback function capture18:50:40.455640Z; catalog18:51:46.594420Z; final actor counts18:57:06.614764Z; final Owner/AI/activity18:57:58.177803Z. Ngày12/10 là ngày local; không đổi timestamp evidence11/10.

**Không còn P1/P2 trong phạm vi executor/harness, deployed SQL/ACL và bounded run được review sau sửa baseline guard.** Parent đã chạy matrix10 groups/41 requests; independent final SQL counts/ownership khớp giới hạn đã duyệt. Nghiệm thu này chỉ bao gồm selective staging learner writes và snapshot có thời điểm; không mở Production hoặc các gate khác.

Review theo `skills/mcy-change-review/SKILL.md`, AGENTS.md hiện hành và Supabase skill. Reviewer chỉ đọc nguồn/public receipts, kiểm syntax/hash/inventory local và gọi MCP `get_project`/bốn `SELECT` read-only trên đúng project. Không chạy executor/harness, không đọc `.env`/token, không thực hiện cloud/API writes, role grant/expiry extension, STOP/RESUME hoặc inference. Hai báo cáo đóng băng11/10 giữ nguyên.

## Manifest và approval scope

Parent chuyển tiếp quyết định Owner duyệt manifest **`13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143`**, target `mhumbczqrzutdnraafhs` / org `rzbpjfrndhrtxagpgdre`, candidate `20261002120000`, giới hạn12 consent events /2 check-in rows /1 observation giả. Reviewer xác nhận bytes JSON đúng hash này; `ownerPacket`, prepare script và review supplement đã được bind đúng SHA.

Offline verification **PASS exit0**:45 pinned entries từ source/evidence/packet/all-local-migrations khớp;21 isolated files đúng tên/hash; config chỉ `project_id = "mcy"` và newline; arguments khớp `migration up --linked --include-all --project-ref … --workdir …`. Không sửa approved manifest hoặc input để làm kiểm tra đạt.

## P2 baseline gate — đã đóng

Executor đầu chỉ kiểm fresh status/age/ledger, Owner definition MD5/OID và AI. Scenario: baseline còn MD5/OID đúng nhưng Owner ACL/owner/search_path hoặc private schema USAGE đã drift; script vẫn có thể ghi intent và apply dù phiếu yêu cầu dừng.

Source final kiểm trước intent/apply: operator `postgres`, new writer absent, Owner owner/search_path/ACL/MD5/OID, private USAGE allfalse, đủ60 effective table privileges với đúng một row cho mỗi tổ hợp, và ba original function OID/body MD5/ACL/owner/config. AIoff/version1/model-unset, target/manifest/ledger và age<15phút vẫn bắt buộc. Baseline public receipt đã đọc có đúng các giá trị này. **P2 CLOSED**; không thay approved input để sửa guard.

## Executor final

Executor bind đúng manifest và toàn bộ pinned hashes, inventory root25 và isolated21. Official read-only list trước apply phải có20 aligned và candidate là pending duy nhất; post-list phải có21 aligned/zero pending. Apply arguments được đối chiếu exact với approved manifest, chọn remote rõ bằng `--linked` và không đưa bốn pending migration khác vào workdir.

Một intent receipt được tạo bằng exclusive `wx` trước một apply spawn. Receipt đã tồn tại thì apply bị từ chối; không có loop/retry. Spawn timeout/error/exit không rõ ghi `UNCERTAIN_OR_FAILED_READBACK_REQUIRED`; exit0 vẫn chỉ là `CLI_EXIT_0_READBACK_REQUIRED`. Raw CLI output được giữ kín, receipt chỉ giữ digest/status. Unknown outcome cần readback và quyết định tiếp; không xóa receipt rồi tự chạy lại. Trường text `humanDecision` là ghi nhận quyết định do parent chuyển tiếp, không tự tạo authorization.

Parent apply receipt: start18:48:22.837Z, complete18:48:26.845Z, exit0, no spawn error, exact target/args/manifest và fresh baseline hash; reviewer không chạy apply. Direct readback bên dưới kiểm thêm kết quả thực tế thay vì chỉ tin return code hoặc parent receipt.

## Direct MCP deployed readback

MCP `get_project` độc lập trả đúng `mcy-staging`, project/org ở trên, `ACTIVE_HEALTHY`, PostgreSQL17. Không dùng project mặc định hoặc suy luận target từ local link.

Đọc `pg_proc.prosrc` qua normalized MD5 trên server rồi so với body tách trực tiếp từ candidate local: chỉ đổi CRLF→LF và trim whitespace ngoài body; không rewrite SQL. Cả ba khớp:

| Function | Normalized body MD5 local = deployed |
| --- | --- |
| `public.save_my_checkin_for_current_user_with_current_consent` | `500ffba848e69b2ce0035e807825fef6` |
| `public.record_my_consent` | `f48c6eb1e479f979a248cfd60e633da3` |
| `private.save_my_checkin_expanded` | `7529791d4355a101afd787999966dca8` |

Raw body MD5 lần lượt `ba61a962de9c9fdfc364ad6fe83837e6`, `6a7534352bc89b5069536a0781652dda`, `053832f4c0a837155c9d84b348936e36`, cũng khớp receipt parent. Ba function có owner `postgres`, empty search_path và security-definer đúng source. New wrapper OID19547 cho authenticated EXECUTE; anon/PUBLIC không có EXECUTE. Consent giữ authenticated/service EXECUTE; private helper OID19204 chỉ postgres, client/service EXECUTE false. Service EXECUTE của new public wrapper được **quan sát true** theo deployed ACL/default privileges; không gọi đó là authenticated-only ACL hoặc một grant do reviewer thực hiện.

Old public writer OID19199 giữ body MD5 `cd2531b703fd1f588b0469a55e67f8ef`; anon/PUBLIC/authenticated EXECUTE false, trusted service EXECUTE true. Private schema USAGE false cho cả anon/authenticated/service. STOP client vẫn không bao gồm trusted service direct writes hoặc hủy in-flight transaction như phiếu đã nêu.

Direct catalog trả đúng21 applied versions bằng20 baseline + duy nhất candidate; bốn pending candidate khác không xuất hiện. Owner **definition** MD5 `5ad67fe52caf79bd07c51caa0c30db92`, OID19270/owner/ACL/search_path không đổi. Owner prosrc MD5 là metric khác, không đánh đồng hai hash. AIoff/version1/model-unset. Năm table RLS true, ACL đúng baseline; matrix60 effective table privileges đúng client denial/service scope. Các client không có direct INSERT/UPDATE/DELETE/TRUNCATE vào các learner tables được kiểm.

## Bounded live harness final

Harness bind approved manifest, exact Supabase origin và publishable key class; không dùng service credentials. Nó cần deployed PASS receipt cùng manifest và actor gate<15phút, đúng hai nhãn A/B đã được đánh dấu confirmed/disposable/no active staff/no active teacher. Fresh Auth GET phải xác minh ID khớp token subject và identity digest của gate, hai ID khác nhau, expiry còn>5phút. Nhãn helper hoặc JWT claim chưa qua Auth không đủ. Parent gate18:46:57.092468Z ghi baseline0consent/0checkin/0observation và token expiry19:44:03Z/19:44:16Z; reviewer đọc public gate, không đọc token hoặc tự xác thực actor.

Planned new consent events:6 required grants +2 stale/current privacy +2 revoked/current wellbeing +2 final wellbeing revocations =12. Không cấp optional AI/Teacher/marketing consent. Hai positive check-ins dùng đúng hai planned actor keys; A có một observation giả, B không có. Negative/replay paths dùng planned/existing keys; direct INSERT probe dùng existing ID. Exact replay là case có chủ đích; không phải automatic retry sau network/unknown outcome. Reservation counter là budget trước positive request, không thay actual database counts hoặc chứng minh mọi negative đã rollback.

Một exclusive run receipt được ghi trước requests; tất cả HTTP requests chạy một lần, bounded timeout12s, redirect error, response size bound; không có retry SDK/loop, email trigger, AI, delete hoặc role mutation. Receipt không lưu UID/token/response body; chỉ digest identity/check-in, endpoint bỏ query, status/code và stage. Bất kỳ HTTP5xx, timeout, unexpected code/status/body đều dừng run và acceptance; uncertain writes phải được readback, không rerun harness để che lỗi.

Matrix cover actor/null/anon denial, six required consents, exact consent replay/changed payload, stale/revoked consent, old/helper denial, two saves, exact full-payload replay/changed energy or observation, owned stored fields/cross-user row/observation isolation, direct insert/anon select denial, final wellbeing revocations including existing-key retries. HTTP403 cho SQLSTATE28000 và authenticated42501, HTTP401 cho anonymous42501, HTTP400 cho22023, HTTP404/PGRST202 cho unexposed helper khớp [PostgREST error mapping](https://docs.postgrest.org/en/v13/references/errors.html).

Harness success chỉ ghi **`API_PASS_DATABASE_AND_LOG_READBACK_REQUIRED`**. Cần direct stored counts/state/payload/append-only history và bounded logs để nghiệm thu; missing logs không đồng nghĩa zero error. Gate/expiry phải còn đúng khi operator chạy. Phần kết quả bên dưới bổ sung evidence thực tế; không suy ra PASS chỉ từ source.

## Bounded run và final readback

Parent đã chạy **một lần**, start18:52:25.402Z/complete18:52:32.538Z, source hash đúng bảng dưới,10/10 groups PASS/41 requests/exit0. Receipt giữ trạng thái API PASS chờ readback; không tự nâng thành release authorization. Reviewer đối chiếu serialized request counts/status/codes với nguồn và bounded log receipt bằng local verifier **PASS exit0**:27 HTTP200,3 HTTP400,2 HTTP401,8 HTTP403,1 HTTP404; codes22023×3/28000×2/42501×8/PGRST202×1. Không có retry run hoặc fixture deletion trong evidence.

Direct SQL cuối chỉ chọn hai identity digests đã được gate xác nhận và run prefix `mcy-lw-9ebef4ed-cccd-4a19-a7e1-c585de11da0a`; không xuất raw UID/email hoặc dữ liệu ngoài run. Kết quả:

| Actor | Consent events | Check-ins | Observations | Optional consent events | Active staff/teacher |
| --- | ---: | ---: | ---: | ---: | --- |
| A | 8 | 1 | 1 | 0 | 0 / false |
| B | 4 | 1 | 0 | 0 | 0 / false |
| Total | **12** | **2** | **1** | **0** | |

Tất cả consent/check-in keys thuộc run này; check-in digests khớp hai ID đã ACK trong live receipt. Cả hai row đúng date12/10/timezoneAsia/Bangkok/energy2/standalone; A body uncertain, B none_now. Observation duy nhất thuộc đúng A và check-in của A, neck/uncertain/levelnull/note giả đúng nguồn. Không có observation thuộc actor khác hoặc row ngoài run trong hai actor này. Baseline gate0 từng loại nên delta đúng12/2/1; không xóa fixture hay append-only consent history để làm counts khớp.

Latest terms/privacy của cả hai là current granted; wellbeing_data current **revoked**. Active staff roles0 và teacher profilefalse vẫn đúng. Final direct Owner definitionMD5/OID/owner/search_path/ACL và AIoff/version1/model-unset không đổi; active learner transaction count0 tại snapshot18:57:58Z. Đây không phải cam kết mọi thời điểm sau đó đều không có transaction.

Parent bounded logs receipt cover18:51:25.402Z→18:53:40Z,41 observed HTTP requests/HTTP5xx0. PostgreSQL ERROR entries22023×3/28000×2/42501×8 khớp các intentional negative cases; không gọi đây là zero SQL errors. `unexpectedErrorStates` empty. Reviewer kiểm receipt và đối chiếu counts với live calls, **không tự truy vấn raw log messages**; kết luận giới hạn vào window/aggregates này, không phải continuous monitoring hoặc chứng minh mọi hoạt động ngoài window đều bình thường.

Final local verification sau run tiếp tục xác nhận45 approved pins, executor/harness hashes và hai frozen reports không đổi. Không rerun matrix để có thêm evidence, vì side-effect budget đã dùng đủ.

## Final source hashes và giới hạn

| Input | SHA256 |
| --- | --- |
| Executor final | `0823f5684472812e09800dd941e830d11f3b466a3b07ff43636445f6bc9ca482` |
| Live harness final | `eaf13785b86da79b56759ff8a19183a935d7a643142bc0e2565fcf5f0a556b5f` |
| Approved manifest — unchanged | `13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143` |
| Baseline receipt | `757a11693a28e463f34877b252454f57bbd1fafdbd72a47d26daa49777c57f4c` |
| Parent deployed readback | `a4448024d635ce5d1c26ac9664637aabd6bf83ed6d2ad1f3e0d933ae9184c0a5` |
| Parent actor gate | `9ea82b222bad582bf6fefcf4e15a04e495a04f74947c74223cd109b38f0aa626` |
| Parent live run receipt | `17d1e3c904e293d08657f59ff0dae1adf1f8046d642eddc36704cadd2146543f` |
| Parent final counts | `bfa67e81fd7aa063f96f01ee7300b966d6c7cc38c47cc7fbfda298ce4b8163d0` |
| Parent bounded logs | `a71542db1d4974bb25c4d6fe9074311ed8306a5eefee2cde52d4fc5deb3be0be` |
| Frozen R3 — unchanged | `a16c6e7c82d6192d02e35486a92de02f327f9d715b75e6e30c6cbbe4f91abc92` |
| Frozen operation review — unchanged | `302124d598610780c0cfc3298cc93a2c13620a710f2348c502d87fe87910b490` |

Final `node --check` executor và harness **PASS exit0**. Không broaden/rerun UI hoặc database rehearsal vì không đổi approved product/SQL source. Reviewer không tự thực thi live matrix; API evidence là run của parent được đọc cùng independent SQL readback. Live parallel concurrency, staging STOP/RESUME execution, native/authenticated-device acceptance và hosted inbox/locale presentation chưa được kiểm bởi lượt này; không suy ra từ SQL/API snapshot. Không mở Production, AI, các pending migration khác hay positive Owner-config-save đã bị automatic review từ chối.
