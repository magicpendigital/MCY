# MCY — danh mục công việc triển khai tiếp

**QA tiếp theo13/10:** [Báo cáo mới](MCY_NATIVE_LEARNER_QA_2026-10-13.md) chốt nguồn cô lập29/29/isolation1/runtime28; khôi phục từ icon thật được Owner xác nhận và DOM/account precheck đối chiếu. Phép force-stop/ADB đã tái hiện trắng/stopped=true, giữ failed/uncertain và bị retire; không sửa app bằng suy đoán. [Gói native A/B](MCY_NATIVE_LEARNER_TRIAL_OPERATION_2026-10-13.md) chuẩn bị2profiles/2cosmetic Auth locale updates/4wellbeing events/2check-ins/0new observations, cần quyết định riêng vì cap12/2/1 trước đã dùng hết. Không có native staging write mới hoặc deploy/AI/Production; full account-switch/data và iOS acceptance còn mở.

**Checkpoint mới13/10:** [learner writer staging](MCY_LEARNER_WRITE_STAGING_ACCEPTANCE_2026-10-12.md) đã nghiệm thu, ledger21/4pending. [Native compatible update](MCY_NATIVE_LEARNER_IMPLEMENTATION_2026-10-13.md) đã build/cài parallel trên Air1, verified welcome/bytes và giữ app release/.debug; iOS sync chuẩn bị xong. Callback parallel thiếu trên Supabase đã sửa17→18, readback đạt; Owner xác nhận email mới đã về đúng app và đăng nhập, [USER_REPORTED_PASS](MCY_NATIVE_AUTH_USER_ACCEPTANCE_2026-10-13.json). Chưa là full Auth/check-in acceptance. Không mở AI/Production hoặc bốn migration còn lại. Bước tiếp theo là kiểm khôi phục phiên, đổi tài khoản, consent và lưu/readback check-in trên thiết bị, rồi các gói Teacher/consent-cap/AI-admission và catalog nội dung theo gates riêng. Các checkpoint10/10–08/10 dưới đây là lịch sử, không suy ra trạng thái live mới.

**Ứng dụng đã triển khai local 10/10:** [checkpoint](MCY_AI_FLOW_IMPLEMENTATION_2026-10-10.md) ghi contract chọn bài đã duyệt, capability/cohort, Plan/start/reader/stop/reflection, guards consent/account và Owner readback. Có [bài mẫu hình/text/audio](MCY_AI_LESSON_DRAFT_2026-10-10.md) để review; chưa là buổi tập đã duyệt. Việc tiếp theo là biên tập/review nội dung và audio VI, rehearsal/actor-live đúng RPC, kiểm provider/disable, rồi exact artifact staging rollout. AI live còn off/version1/model rỗng, Owner Edge v4 cũ, 19 applied/5 pending; bản local chưa lên domain. Các bảng ngày 08/10 và nhận định thiếu route/concept bên dưới là lịch sử, không thay cho checkpoint mới.

**Đánh giá lại 10/10:** [báo cáo AI/UX](MCY_AI_FLOW_UX_REASSESSMENT_2026-10-10.md) cập nhật nguồn và thứ tự A–E trước triển khai. DNS đã đúng, Vercel `misconfigured=false`, vẫn Preview; HTTPS chưa xác minh. Supabase có metadata key/hai flag, chưa kiểm giá trị; database AI off/version 1/model rỗng, AI function chưa deploy và Owner v4 còn Gateway cũ. Thiết kế nền/concept đã có nhưng thiếu vòng chọn buổi tập/Plan; ưu tiên contract + catalog duyệt + UI states, rồi backend/actor/reviewer/readiness và cohort staging. Lượt này chỉ cập nhật báo cáo; bảng 08/10 và các checkpoint dưới đây là lịch sử có ngày, không dùng để suy ra trạng thái live hiện tại.

**Cập nhật triển khai 09/10:** riêng Owner conflict repair đã applied lên staging, ledger 19 applied/4 pending; deployed PT409 + HTTP role-bound PASS17/17, Docker schema/concurrency/HTTP PASS8/8. Positive live save chưa chạy do automatic approval review chặn side effect version/audit, đang chờ duyệt riêng. Domain đã gắn Preview mới nhất, còn Cloudflare CNAME/TLS. Xem [acceptance](MCY_OWNER_REPAIR_ACCEPTANCE_2026-10-09.md) và [DNS](MCY_DOMAIN_REVIEW_DNS_2026-10-09.md); các row lịch sử phía dưới về Owner chưa applied/CLI/Docker thiếu đã được supersede riêng, không đóng các AI/teacher/learner/release gate khác.

Ngày rà soát: **08/10/2026, Asia/Bangkok**. Phạm vi: source và cấu hình local, tài liệu bàn giao, kiểm thử offline chọn lọc. Đây là danh mục đề xuất thứ tự triển khai; không cấp quyền transfer, SQL live, deploy, mời giáo viên, bật AI, gửi dữ liệu hay phát hành production.

## Kết luận

MCY có nền prototype web/native, check-in, reflection, catalog video thật, Owner controls và source AI/teacher. Phần còn thiếu để đạt hướng sản phẩm là **một vòng học đáng tin cậy: check-in → hội thoại ngắn → kế hoạch thực hành có nội dung được duyệt → thực hành → phản hồi → lựa chọn tiếp theo**. Hiện chưa có đủ bằng chứng vận hành vòng này với dữ liệu và AI thật trên staging.

Ưu tiên mở đường staging an toàn, hoàn thiện vòng học chính, rồi mới mở pilot giáo viên và chuẩn bị production. Chuyển org, build thành công và mock UI xanh là các kết quả riêng; không kết quả nào tự đóng toàn bộ release gate.

## Căn cứ và trạng thái

**Cập nhật mới nhất 09/10 sau CLI login và review độc lập:** official CLI list PASS, exit 0, 18 aligned / 0 remote-only / 5 pending, với [receipt 23 local hashes](MCY_CLI_MIGRATION_LEDGER_2026-10-09.json). Agent R3 do Owner chọn [review exact Owner repair](MCY_OWNER_REPAIR_INDEPENDENT_REVIEW_2026-10-09.md) không có finding cần sửa, rerun PASS 33/33. Full **local-source** baseline replay đủ 18 migrations PASS 4/4; npm SQL script tổng 19/19. P0 04 hoàn tất timestamp ledger và inventory, không hoàn tất byte/schema compatibility của mọi candidate. P0 02 hoàn tất source review, live repair chưa apply. Ghi chú thiếu CLI auth/reviewer/full local replay phía dưới là lịch sử; actual Supabase concurrency/HTTP actors/recovery/target mapping vẫn mở. AI flags giữ false; không deploy/release.

**Cập nhật 09/10:** [receipt cấu hình staging](MCY_STAGING_CONFIGURATION_CHECKPOINT_2026-10-09.md) ghi xác nhận Owner đã lưu OpenRouter key, hai flag false; connector kiểm lại đúng org/ref/region, không có Owner-save connection ở snapshot, nhưng RPC vẫn business 40001. Deployed Owner function hiện version 4 và source vẫn Gateway cũ, chưa dùng key OpenRouter. Batch selected offline mới PASS 78/78, PGlite minimal-schema PASS 15/15, runtime PASS 28/28; official CLI list vẫn exit 1 vì thiếu auth. Không deploy/apply/enable; lịch sử kiểm thử và các gate dưới đây được giữ nguyên.

**Checkpoint bổ sung sau lượt lập danh mục:** read-only metadata đã xác nhận project hiện có ở MagicpenDigital, và [containment đúng hai backend](MCY_OWNER_RETRY_CONTAINMENT_2026-10-08.md) đã hoàn tất. [Bản sửa Owner conflict](MCY_OWNER_CONFLICT_FORWARD_FIX_2026-10-08.md) đã chuẩn bị local, cùng hai nhánh teacher PT409 và batch offline **69/69 PASS**; chưa apply/deploy hoặc thử stale-save live. CLI ledger còn bị chặn do chưa đăng nhập; inventory connector 18 applied, local 23 file / 5 pending. Ghi chú chưa containment/transfer và hai teacher 40001 trong bảng lịch sử dưới đây không còn là trạng thái mới nhất. P0 01/03 hoàn tất phần thao tác/readback đã ghi trong receipt, không bao gồm đo CPU/recovery/billing/QA; P0 02 hoàn tất phần local, live repair vẫn gated; P0 04/05/06 chưa được đóng. Không thay đổi các kết quả QA lịch sử hoặc suy ra quyền mở AI/teacher/release.

HEAD khi rà soát: `82458fc219a2231ccac279112dfc0db5447b0edd`; working tree có nhiều tracked/untracked changes từ trước. Danh mục bao gồm source chưa commit; không thể dùng HEAD riêng để tái tạo toàn bộ candidate. Lượt này chỉ thêm tài liệu này và giữ nguyên công việc đang có.

| Phần | Đã có bằng chứng | Còn thiếu / giới hạn |
|---|---|---|
| Learner web và simulator | Source responsive, iPhone/Pixel review, check-in/reflection, catalog 38 video | Authenticated learner write/consent/isolation chưa hoàn tất; reflection/run chưa sync tài khoản |
| Android/iOS | Android parallel package; checkpoint 03/10 ghi mở icon thật PASS 3/3; iOS project/sync đã chuẩn bị | Android force-stop/shell-launch trắng chưa có root cause; chưa đo first meaningful frame; iOS Xcode/device chưa có |
| Owner | Function v1 được ghi nhận deployed ngày 05/10, không inference | Owner save RPC `40001` gây retry loop trong bằng chứng 04–05/10; chưa có kết quả containment/forward repair |
| AI | Adapter OpenRouter và tests local; frontend có code gọi function | `src/Prototype.tsx:544` giữ `AI_INFERENCE_AVAILABLE_FOR_LEARNERS=false`; adapter mới chưa được ghi nhận deployed; reply text chưa chứng minh chọn bài/kế hoạch thực hành |
| Teacher drafts | Handler/UI và migration local; versioning, quota, invite contract | Chưa có bằng chứng deployed RPC/API/pilot; hai nhánh business-conflict `40001` còn trong migration |
| Teacher collaboration | Source mới có membership, review, enrollment, attendance và feedback; tích hợp teacher workspace | Migration/function/UI/tests còn untracked; chưa xác lập phạm vi rollout/quan hệ với luồng drafts cũ; không coi là tính năng đã vận hành |
| Môi trường | Quyết định chuyển đúng project `mhumbczqrzutdnraafhs` sang MagicpenDigital Pro | Preflight 05/10 còn chờ duyệt chi phí; org/ref hiện tại chưa kiểm trực tiếp trong lượt này |
| Release | Runbook, owner packet, checker local | `release-profile.json` có `targets: []`; remote CI/rules/deploy permissions/recovery chưa được chứng minh |

Cloud/account/device state trong bảng là **bằng chứng có ngày**, không phải kiểm tra live ngày 08/10. Không đọc `.env.local`, token, credential hay dữ liệu cá nhân để làm danh mục.

## Kiểm chứng thực chạy ngày 08/10

| Kiểm tra | Kết quả | Phạm vi |
|---|---|---|
| `node scripts/check-mobile-runtime.mjs` | **PASS 28/28** | Hash protected files; không phải device test |
| Node offline batch, 15 test files liệt kê dưới đây | **FAIL toàn batch: 124 PASS / 2 FAIL, exit 1** | AI/Owner/check-in/consent/teacher/collaboration/release fixture; không gọi staging/provider |
| Full Playwright, canonical build, Deno, SQL rehearsal, live actor/device/cloud | **CHƯA CHẠY** trong lượt này | Kết quả lịch sử không chuyển thành PASS mới |

Batch gồm `tests/{ai-gateway-models,ai-safety-boundaries,ai-assistant-handler,ai-current-turn-contract,client-bundle-openrouter-secret,owner-control-plane,owner-actor-matrix,checkin-consent-migration,consent-event-limit-migration,teacher-control-plane,teacher-migration-contract,playwright-test-environment,teacher-collaboration,teacher-collaboration-test-proxy}.test.mjs` và `scripts/release-evidence.test.mjs`.

Hai failure: release fixture không thể `git init` vì sandbox từ chối ghi `.git/config` trong TEMP; proxy fixture không thể kết nối `127.0.0.1` (`EACCES`). Đây là failure tại bước thiết lập môi trường đã quan sát, chưa chứng minh lỗi nghiệp vụ; vẫn giữ trạng thái FAIL và cần rerun trong môi trường phù hợp. Không sửa checker/test hoặc nới bảo mật để tạo PASS.

Checkpoint OpenRouter 05/10 ghi full Edge UI **80 PASS / 1 FAIL** tại Carousel; rerun riêng 1/1 PASS chưa đóng kết quả full-suite FAIL. Build lịch sử PASS với entry 542.70 kB raw / 167.03 kB gzip và warning >500 kB; cần xác minh lại candidate cuối.

## Danh mục theo ưu tiên

P0 = chặn thử nghiệm staging hoặc có mốc thời gian gần. P1 = hoàn thiện giá trị MVP/pilot. P2 = mở rộng sau khi vòng chính ổn định. Các vai trò trong bảng là đề xuất trách nhiệm, chưa phải người đã được chỉ định. “Local ngay” cho biết có thể chuẩn bị trong repo, không phải yêu cầu thực thi của lượt lập danh mục.

### P0 — mở đường staging

| ID | Công việc / trạng thái | Phụ thuộc, trách nhiệm | Tiêu chí hoàn thành |
|---|---|---|---|
| 01 | Kiểm tra mới tình trạng retry loop Owner và chuẩn bị containment. **Cần read-only live; action chờ duyệt** | Operator + Owner | Có query/log/backend identity mới; nếu còn loop thì chỉ dừng connection khớp sau duyệt; quan sát lỗi/CPU sau action. Không dùng PID cũ hoặc chạy lại stale-save probe |
| 02 | Sửa business conflict Owner bằng forward migration; sửa hai nhánh teacher local. **Local chuẩn bị được; live gated** | 01 trước thao tác live; ledger 04; backend + reviewer | Owner chuyển business conflict sang non-retryable `PT409` trong migration mới; không viết lại applied history. Teacher candidate sửa trước deploy. Contract chống business `40001`, concurrent/PostgREST HTTP 409 có giới hạn, không đổi config/audit khi stale save và không sinh retry loop |
| 03 | Hoàn tất transfer project hiện có sang MagicpenDigital Pro. **Chờ chi phí/action approval** | Owner + operator; kiểm tra 01 trước vận hành | Refresh dialog/invoice, recovery và quyền; duyệt chi phí chính xác; transfer đúng ref/org, giữ staging/region; readback endpoint/Auth/functions/gates/ACL/billing. Báo giá +USD10/tháng ngày 05/10 chỉ là lịch sử; không tạo project QA trả phí thứ hai |
| 04 | Đối chiếu ledger chính thức và lập migration inventory đầy đủ. **Chưa hoàn tất** | Backend/operator | `supabase migration list` theo CLI help/current supported workflow; đối chiếu remote, full SHA-256 và compatibility. Local hiện có 22 file; remote lịch sử có 18. Ba candidate 02–03/10 và collaboration 05/10 đều phải xem xét; không suy ra migration 05/10 đã applied |
| 05 | Rehearsal schema và concurrency. **Local chuẩn bị được** | 02/04; backend + reviewer | Clean replay và upgrade schema đã xác minh với fixtures hư cấu, chặn outbound jobs/email/provider; multi-session quota/idempotency/conflict; grants/RLS/RPC/helper owners/search_path/views. PGlite tối giản không thay thế Supabase Auth/Storage/Edge parity |
| 06 | Hoàn tất actor matrix và learner check-in RPC. **Cần rollout/test được duyệt** | 02/04/05; backend + QA | Learner A/B, teacher, reviewer, Owner, outsider, revoked role/old token; success/readback và cross-user denial; current/stale/revoked consent, retry/idempotency. Client đang gọi actor-bound RPC mới, staging lịch sử chưa có. Deploy candidate chỉ sau gate; ghi từng PASS/FAIL |
| 07 | Quản lý fixture-role expiry gần nhất. **Cần readback; không tự gia hạn** | Operator + Owner, liên quan 06 | Đối chiếu ba grant tạm đến **11/10/2026 17:47:49.876 Bangkok**; lập lịch test trước hết hạn hoặc xin quyết định grant mới nếu cần. Chứng minh hết hạn/revocation được enforce; không kéo dài grant bằng retry |
| 08 | Rà soát API key migration và Data API exposure. **Local chuẩn bị được; cloud change gated** | Backend + security reviewer | Inventory cả **4** Edge adapters hiện có, gồm collaboration; kế hoạch key/JWT auth được test trước thay đổi. Rehearse explicit least-privilege grants cho bảng/RPC mới trước mốc 30/10; giữ control-plane private, không mở grants hàng loạt |
| 09 | Chuẩn hóa source candidate, QA và bằng chứng. **Local ngay** | Dev + QA; đi cùng mọi batch | Phân loại dirty/untracked theo tính năng, review snapshot/hash; full UI suite thoát exit 0, điều tra Carousel trong cùng điều kiện; rerun hai fixture bị sandbox chặn; build/secret scan/TypeScript/Deno relevant checks. Giữ managed Vite teardown và `.invalid` fixtures; không dùng token staging cho UI tests |

### P1 — AI và vòng học chính

| ID | Công việc / trạng thái | Phụ thuộc, trách nhiệm | Tiêu chí hoàn thành |
|---|---|---|---|
| 10 | Hoàn thiện privacy/consent và review chuyên môn cho AI. **Chưa đạt** | Owner + privacy/security/health reviewer | Notice đúng current-turn payload, provider routing/retention, quyền rút consent; không coi caller `source/channel` là bằng chứng đã xem UI. Safety rubric: no-match, prompt injection, dữ liệu nhận dạng, dấu hiệu cần dừng, phản hồi xấu/không chắc, không chẩn đoán hoặc cam kết hiệu quả |
| 11 | Kết nối Owner controls OpenRouter trên staging. **Source có; rollout gated** | 01–06, 10; backend/operator + Owner | Key MCY riêng chỉ trong server secrets; Owner tự quản monetary limits tại OpenRouter. Không hỏi lại USD/reset hoặc thêm budget engine. Test active Owner/non-owner/revoked, catalogue theo key, save/version conflict, provider compatibility; key-present không được trình bày là kết nối thành công |
| 12 | Hoàn thiện AI chọn bài → kế hoạch hôm nay. **Khoảng trống sản phẩm cần thiết kế/triển khai** | 10/11 và nội dung duyệt 16; product + backend + expert | Contract có lesson/version được duyệt và lý do lựa chọn có giới hạn; không chỉ reply text. Retrieval dùng nội dung được expert duyệt, match/no-match rõ, không tự sinh chỉ dẫn vận động chưa kiểm chứng. Người học xem, đổi hoặc tự chọn và biết hành động hôm nay |
| 13 | Thử nghiệm AI frontend thật có giới hạn trên staging. **Đang đóng** | 06, 10–12, candidate QA 09; QA + reviewer + operator | Rollout riêng được duyệt; giải quyết frontend constant `false` qua gate được review, đồng thời giữ server auth/consent/request/token/usage/kill switch. Test key thiếu, flags đóng, model không phù hợp, timeout/provider denial, revoked consent, usage finalize fail và fallback. Thử tắt ngay khi đang dùng; dữ liệu hư cấu trước limited users |
| 14 | Thiết kế sync plan/run/reflection/Journey và tác động consent. **Gated scope; hiện session-only** | Product + backend + privacy reviewer; sau 06 | Chốt purpose/version và API được duyệt trước persistence; ownership, append/version/idempotency, multi-device/offline/error/retry/delete behavior. Giữ self-report, bỏ qua/như cũ/xấu hơn/chưa rõ; không biến missing data thành improvement hoặc video Play thành completion |
| 15 | Kiểm thử usability vòng học và khả năng tiếp cận. **Chưa đủ** | 12/13; UX + QA + learners | Check-in → choice → plan → practice → reflection → next choice trên iPhone/Pixel review, mobile web, short portrait/landscape, desktop; keyboard/safe-area/large text/focus/screen reader. Thu kết quả hiểu bài cần làm và bước tiếp; không chỉ screenshot đẹp hoặc demo statistics |

### P1 — nội dung và giáo viên

| ID | Công việc / trạng thái | Phụ thuộc, trách nhiệm | Tiêu chí hoàn thành |
|---|---|---|---|
| 16 | Duyệt catalog 38 lesson, quyền sử dụng, caption và an toàn. **Chưa đóng** | Owner + instructor + independent expert | Hồ sơ từng ID/version: rights/likeness/music, thứ tự/mục tiêu/phù hợp, audio/caption language, caption được human duyệt; gỡ lesson không đạt. Dùng display name từ registered active profile khi attribution gate đạt; không hard-code tên. Không đổi YouTube visibility/metadata nếu chưa có confirmation tương ứng |
| 17 | Hoàn tất teacher invite/private-draft pilot. **Local có; live chưa được chứng minh** | 02/04–06/16; Owner + backend + reviewer | Roster riêng, independent reviewer, rights/privacy/retention, SMTP/recipient/callback; owner-only invitation, verified acceptance, uncertain-delivery reconciliation, own/cross-teacher CRUD/version/quota/revocation. Chỉ mở hai teacher gates sau test; draft không xuất hiện learner catalog |
| 18 | Review và quyết định đường teacher collaboration. **Candidate mới; cần scope decision** | Product/Owner + backend + independent reviewer | Đối chiếu membership riêng với application roles/teacher drafts để tránh hai nguồn quyền hoặc nội dung không đồng bộ; xác định đường chuẩn, giữ fallback có lý do. Review migration 05/10, approval phiên bản, assigned reviewer, enrollment/attendance/feedback access và revoke/account-switch. Đưa handler/UI/rehearsal/proxy tests vào quality workflow phù hợp. Không coi expert approval là learner publication; source không có action publish/SMTP/AI generation |
| 19 | Xây private media upload pipeline cho pilot. **Chưa triển khai đầy đủ** | 17 và rights/roster/media approval; backend + security/content reviewers | Bucket private, content-sniff type/size, quarantine/security scan, ownership, signed URL TTL; kiểm role tại issue/finalize/read và revoke giữa bước; audit/retention/takedown. Review quota/file limits hiện tại trước upload; không upload nguồn MOV chỉ từ yêu cầu lập danh mục |

### P1 — thiết bị, hosting và vận hành

| ID | Công việc / trạng thái | Phụ thuộc, trách nhiệm | Tiêu chí hoàn thành |
|---|---|---|---|
| 20 | Đo và xử lý Android startup trên đúng APK. **Chưa đóng** | Native dev + QA; giữ checkpoint 03/10 | Đo first meaningful frame/splash → welcome; bổ sung reboot/process recreation/background. Không yêu cầu làm lại bộ Launcher 3/3 đã xong chỉ để lặp evidence. Root cause force-stop/shell-launch cần trace mới trước chọn patch; giữ package IDs và không uninstall app/dữ liệu cũ |
| 21 | Auth và YouTube playback trên Android/iOS thật. **Chưa đủ** | 06/16/20; native dev + QA | Callback allowlist đúng variant, sign-in/restore/sign-out/account-switch/revoke và learner write. Verify WebView/WKWebView API-client identity, playback/failure/retry, caption/fullscreen/network/reduced motion. Một screenshot DOM hoặc `youtube-nocookie` không tự chứng minh native privacy/playback |
| 22 | Hoàn tất iOS build và kiểm thử thật. **Project có; device chưa xác minh** | Mac/Xcode/signing + QA; 21 | Build trên Xcode, cấu hình ID/scheme/PKCE, safe areas/keyboard/focus zoom trên iPhone Safari và native; local Windows `ios:sync` chỉ là chuẩn bị |
| 23 | Deploy web staging candidate và smoke hosted. **Gated** | 03–06/09; nội dung/AI gates theo scope | Exact reviewed artifact/env mapping, secret scan; Vercel Preview → Auth/check-in/roles/courses/AI-off fallback; chỉ thử AI nếu 13 đạt. Không tự promote Production. Recheck deployed commit/function version khác với local |
| 24 | Hoàn thiện hỗ trợ, data requests và vận hành pilot. **Workflow mới cần chốt scope** | Product/Owner + privacy/operations | Kênh hỗ trợ có người xử lý; export/delete/revoke/retention/audit/response plan trước nhận users thật. UI chỉ nói xử lý server khi có API thực; định nghĩa incident/kill-switch owner, privacy-safe errors, quota/latency/provider failures và stop thresholds |
| 25 | Chuẩn bị production acceptance và enforced release path. **Chưa đạt** | Các gate thuộc candidate; Owner + reviewer + operator | Remote CI/check/rules/deploy/DB permissions đã xác minh; exact target allowlist, manifest source/migration/build/config/test hashes, owner packet và approval. Backup coverage DB/Storage/Auth/config/jobs, restore rehearsal, old-client compatibility; nếu promote cùng project: fixture cleanup được duyệt, giữ audit và chuyển QA sang local synthetic. Không dùng checker PASS để tự cấp quyền release |

### P2 — sau khi vòng chính ổn định

| ID | Công việc | Điều kiện / kết quả mong muốn |
|---|---|---|
| 26 | Đo hiệu năng rồi tối ưu initial load/bundle | Native frame timeline, web LCP/INP và mạng yếu trên candidate; split/refactor có số đo và regression, không tăng warning threshold để che vấn đề |
| 27 | Chuẩn hóa app-owned components/tokens/CSS | Giảm override và duplication có kiểm chứng; giữ runtime protected, brand masters, safe areas/keyboard; không mở rộng thành redesign desktop toàn bộ ngoài scope |
| 28 | Nội dung mở rộng và tiếng Anh đầy đủ | Knowledge illustration/meditation/portrait-landscape lessons cần chuyên môn/rights riêng. English phải dịch/biên tập/test account/consent/support/knowledge đầy đủ trước public; production vẫn VI-only |
| 29 | Notifications và luồng human-led classes | Chốt nhu cầu, opt-in, role/share boundaries, APIs và audit trước xây; payments vẫn ngoài phạm vi được duyệt |

## Thứ tự triển khai đề xuất

1. **Batch A — unblock:** 01–09. Chuẩn bị patch/tests/docs local, xác minh cloud read-only; action live tách theo approval. Hai track containment/repair và transfer/recovery có thể chuẩn bị độc lập; transfer không chữa retry loop hoặc thay thế ledger/actor gates.
2. **Batch B — core learner + AI:** 10–16. Nội dung và privacy/expert review có thể chuẩn bị trong khi A đang chờ. Thử Owner controls trước, sau đó AI learner với synthetic data và kill switch; hoàn tất choice/plan thay vì dừng ở chatbot.
3. **Batch C — teacher pilot:** 17–19 sau scope review; giữ invite-only/private và chưa publish learner. Collaboration candidate phải chọn đường tích hợp trước deploy.
4. **Batch D — acceptance:** 20–25. Device/performance/usability có thể chuẩn bị sớm; hosted rollout và production phụ thuộc candidate/gates. 26–29 ưu tiên lại sau kết quả pilot.

Việc có thể chuẩn bị ngay trong repository: migration conflict patch theo workflow, thêm forbidden `40001` contract, inventory/compatibility review, tests fixture/CI coverage, thiết kế structured selection/plan, privacy/content review packet và kế hoạch device measurements. Yêu cầu hiện tại chỉ lập danh mục; chưa thực thi các hạng mục đó.

Owner cần quyết định ở đúng bước: containment nếu loop còn tồn tại; exact transfer quote; độc lập reviewer; phạm vi collaboration và learner sync; limited staging AI rollout sau gates; cuối cùng exact production artifact/target. Không yêu cầu lại monetary limits OpenRouter hoặc mặc định cấp thêm paid QA project.

## Khoảng trống tài liệu cần xử lý trong các batch

- Runbook/profile vẫn mô tả **ba** pending migrations theo snapshot 03/10; source nay có thêm collaboration candidate. Cập nhật inventory sau xác minh ledger, không tự xóa blocker/điền targets.
- `supabase/README.md` còn ghi **ba** Edge adapters ở mục key migration; source/config nay có bốn. Đối chiếu cả collaboration khi migration keys.
- Hồ sơ caption 01/10 có ghi Studio inventory 38/38, nhưng checkpoint/source 03/10 lại giữ 38 lesson chưa xác minh. Đối chiếu receipt và từng lesson; giữ trạng thái chưa xác minh trên UI cho đến khi giải quyết mâu thuẫn, không tự suy luận track không tồn tại.
- AGENTS và plan có các đoạn lặp/superseding lâu ngày. Gom bằng chứng theo ngày/source, giữ rõ quyết định hiện hành; không dùng việc dọn docs để đổi quyền hoặc scope.
- Có test collaboration ngoài npm scripts/quality baseline, config riêng match mọi `*.spec.ts`, trong khi main workflow chưa chạy collaboration handler/proxy/rehearsal/release-checker/actor-helper isolation suites. Xác lập suite chủ đích và fixture isolation trước mở rộng CI; local workflow không chứng minh remote enforcement.

## Nguồn

Repository: [AGENTS](../AGENTS.md), [implementation plan](MCY_IMPLEMENTATION_PLAN_2026-09-27.md), [OpenRouter checkpoint](MCY_OPENROUTER_BACKEND_CHECKPOINT_2026-10-05.md), [Owner checkpoint](MCY_OWNER_ACTOR_CHECKPOINT_2026-10-04.md), [role grants](MCY_STAGING_ACTOR_ROLE_GRANT_2026-10-04.md), [transfer preflight](MCY_SUPABASE_TRANSFER_AI_PREFLIGHT_2026-10-05.md), [Android checkpoint](MCY_ANDROID_WHITE_SCREEN_CHECKPOINT_2026-10-03.md), [release runbook](../docs/release/RELEASE_RUNBOOK.md), [release profile](../docs/release/release-profile.json), [rights evidence](MCY_FREE_CONTENT_RIGHTS_EVIDENCE_2026-09-30.md).

Official docs đọc lại 08/10: Supabase xác nhận custom business `40001` có thể gây infinite RPC retries và đề xuất `PT409`: [troubleshooting](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b). Key legacy được deprecate cuối 2026; new-key Edge auth cần phương án tích hợp được kiểm chứng: [key migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys). Data API explicit grants cho bảng public mới có mốc 30/10/2026: [changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically). Transfer cần xác minh prerequisites và quyền thực tế: [project transfer](https://supabase.com/docs/guides/platform/project-transfer).

Changelog mới 06/10 có scoped PATs: cân nhắc integration/operator identity least privilege tại 25, không tạo/rotate token trong rà soát. Changelog 05/10 deprecates framework adapters của `@supabase/server`, không deprecate `withSupabase`; source MCY hiện chưa dùng các adapters đó, không phát sinh upgrade tự động: [changelog](https://supabase.com/changelog). Fetch bản `.md` không được web tool hỗ trợ content type; đã đọc HTML thay thế. Docs platform không chứng minh tài khoản, deploy hay giá transfer hiện tại.
