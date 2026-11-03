# Intake cập nhật web + Android cho nhóm test — 21/10/2026

**READY_FOR_INTAKE_QC; implementation BLOCKED_PENDING_INTAKE_QC_AND_ROOT_GO.** Task này mới ghi intake và BASELINE; chưa sửa nguồn, build, chạy test/server, dùng provider hoặc thiết bị. Áp dụng `skills/mcy-change-review/SKILL.md`, lifecycle, matrix và release runbook. Root điều phối, Agent triển khai, QC độc lập, root kiểm trực tiếp rồi báo cáo/dừng theo bước người dùng yêu cầu.

## Kết quả và quyết định

Yêu cầu mới nhất: **“Cập nhật dữ liệu và tính năng lên phiên bản web và app Android để các nhóm đối tượng tham gia test truy cập và bắt đầu tiến hành test theo kịch bản. Chuẩn bị tài liệu chi tiết để gửi cho từng vai trò tham gia test.”** Kết quả cuối cần có URL web và APK Android đúng cùng phiên bản/phạm vi, truy cập thực theo vai trò, dữ liệu đúng quyền và tài liệu thao tác ứng với bản đã giao. Chuẩn bị tài liệu không hoàn thành yêu cầu phát hành; local mock không được gọi là quyền Teacher/Reviewer thật.

Yêu cầu này cho phép chuẩn bị và cập nhật trong phạm vi đã duyệt. Chưa xác định được từ task này chính xác nội dung/đối tượng/mục đích/live-write caps hoặc quyết định đủ điều kiện phát hành artifact mới. Owner đã báo **có quyết định và sẽ cung cấp phạm vi**: `OWNER_REPORTED_DECISIONS_EXIST_DETAILS_PENDING`, không khẳng định ngoài đời chưa có phê duyệt. Root đã hỏi lựa chọn UX giả lập / đọc nội dung thật đã duyệt / thực hành thật và các chi tiết cần đối chiếu; không tự chọn thay. Quyết định mới khi tới phải cập nhật scope, pins và regression trước phần phụ thuộc.

Nghiệm thu cuối theo scope được chọn: exact source/build/config/content manifest; web protection verified cho Preview mới trước upload/alias; APK package/cert/hash/version rõ; expected/denied role cases; smoke trên URL và Android thực; tài liệu từng vai trò khớp khả năng và chỉ rõ phần chưa mở. Có independent R3 và root direct verification; không gọi PASS từ chỉ build hoặc fixture. Mốc bàn giao tiếp theo hiện chỉ là candidate cục bộ đã kiểm và packet review được; upload/install/phát cho người tham gia cần packet mới gắn bản/đích/phạm vi, không dùng approval 13–14/10.

## Baseline đã đọc và pin

BASELINE.json ghi HEAD, 35 tracked-dirty, các nguồn/config/test chính, 168 manifest inputs +71 canonical dependencies +255 candidate sources +59 client files và so với baseline 20/10. Đếm nhóm có giao nhau. HEAD riêng không đại diện root dirty. Không reset/stage/commit hay tích hợp root trong intake.

Root `src/Prototype.tsx` SHA `32c100fbcd7433f6db2c6c299556adb22633d5cd8ecd9da01ca5420515287482`; 4.7 v7 `21bc236ed266d0c575e90a5464221b1eed35a54e36b55cd3934aad3833a6444b`; 5.3 rebind `39cc4d8434d7c43055e70d5e50a6a1d5a02388cd8979c8c4006c433ca83c79b0`. Do đó không build root rồi gọi là latest UX. Candidate5.3 so root có các nguồn khác/vắng được liệt kê trong BASELINE, không sao chép toàn candidate đè root. Các evidence 4.7/5.3/6.1 là local scoped evidence; parent đã nhận các bước theo lịch sử hội thoại, không suy release/native acceptance từ đó.

Canonical manifest SHA `0fa137d5ea658fadfdb8a1ab97e5fd86550a03b82fbed972530b338e65d114b1`, 44.303 bytes: local_draft_only/unpublished, learnerVisible=false, recommendationEligible=false, human review pending và approvalRecords rỗng. 14 reading drafts/70 steps/55 PNG/25 blocked media +114 expansion metadata vẫn không thành 14 buổi thực hành. Actual `supabase/functions/_shared/reviewedPracticeCatalog.ts` rỗng ở root và candidate; không thêm canonical draft vào public/static catalog để giải quyết delivery.

5.3 có `?workspace=unit-review` → `UnitReviewWorkspace` → relative `/__mcy_review/v1` → Node server bind127.0.0.1 → canonical adapter; chỉ `owner_local_preview` đọc nguồn và `fictional_rehearsal` dùng author/reviewer giả. Cookie lease15phút/bootstrap5phút; đây không là Supabase participant role transport. Static Vite/Vercel artifact không tự chạy Node server; APK localhost cũng không thấy máy chủ desktop này. Không nới host/CORS/lease hoặc share Owner capability để biến thành participant service.

Web thực tế source config: Vercel `npm run build` → `dist/client`, callback rewrite `/auth/callback`→`/`. Local binding project `prj_gTioLZWajGyQMkaPS1qapwoBOUnA`, team `team_BGXDJYYYe7LSDoGDjWRBFlJH`; historical Preview branch `codex-mcy-p1-preview`, domain `motchutyoga.magicpendigital.com`. Root chịu trách nhiệm kiểm provider hiện tại; intake không kiểm live. Oct14 GET200/protection-off không phải access protection. `docs/release/release-profile.json` targets=[] và một số blockers là dated; không tự sửa profile để hợp thức hóa release hoặc coi chúng là trạng thái provider mới.

Android: `com.nilaza.motchutyoga.mcydebug`, callback `motchutyoga-mcydebug`, vcode1/vname1.0-mcydebug; installed checkpoint APK4b6620… vẫn HALTED/currentActorVerified=false do reopen về Đăng nhập; cause chưa biết. Không re-login/init/refresh/launch/rollback/install để lấy acceptance ở bước này. Old trial cap breach và lịch sử giữ nguyên; task mới chưa có allowance live health/Auth metadata/profile/role writes. `android:parallel:build` khác web build: temp Vite +tsc/runtime/scanner → Capacitor sync Android → Gradle assembleParallel, ghi native assets chung; cần isolated native tree và pin package resources/asset list/cert. Script `android:install:parallel` hiện tự `am start` sau `pm install -r`: **không được dùng nguyên script này** theo current native boundary. Packet mới phải có install-only reviewed path và owner manual icon route, không force-stop/shell-launch/uninstall/clear-data/connected instrumentation.

## Phạm vi triển khai cụ thể sau QC/root GO

Highest risk **R3** vì release/delivery/Auth/roles/health-content boundary, ngay cả khi edition chỉ thử UX. Intake/doc diff tự nó R0; không lấy R0 để giảm gate của deliverable. Không đổi migration/ACL/role/runtime lock/release checker để mở test nhanh. Nếu cần participant service thật, thiết kế/API/server gates phải được review R3 riêng trước chạy.

| Lựa chọn Owner đang chốt | Candidate tối thiểu có thể triển khai | Chưa được đánh đồng với |
|---|---|---|
| UX giả lập, dữ liệu hư cấu | Tích hợp UX đã nhận vào một git candidate riêng; tạo edition test cô lập với fixture rõ nhãn, giới hạn đường test và chặn network health writes trong kiến trúc/build phù hợp. Web+Android cùng scope; kiểm bundle không có canonical/private assets. Cần quyết định chấp nhận UX giả lập trước dùng nhánh này. | Teacher/Reviewer thật, live Auth/check-in, review chuyên môn hoặc thực hành |
| Đọc nội dung thật đã duyệt | Dùng exact IDs/revisions/hashes/purpose+review facts từ Owner; thêm participant read transport có auth server-side/assignment/expiry/revoke và deny-by-default; giữ Node Owner reader riêng. Không public bundle draft. | Chỉ thêm route frontend hoặc share local Owner lease là đã delivery |
| Thực hành thật/live role workflows | Cần complete approved sessions/media/rights/audience; exact role roster và operation caps; current server role/object/consent tests; native Auth restore resolved/accepted trước data trial. Là phần mở rộng R3 có intake riêng nếu cần schema/API. | 14 reading units, clip metadata, fixture_reviewed hoặc old A/B approvals |

Nhánh có thể tiến ngay sau GO và không phụ thuộc quyết định còn thiếu: tạo **candidate nguồn riêng** với inventory/preimages, reconcile diff 4.7→5.3→root và app/web/native build paths; chuẩn bị edition switches theo scope được root chốt nhưng không bật public/live content; chuẩn bị packet/role guides với fields pending. Không build/test/app/server trước GO. Không tự bắt đầu route mới chỉ vì intake đề xuất.

Candidate file map dự kiến: `src/Prototype.tsx`, `src/prototype.css`, `src/i18n.ts`, `src/JourneyScreen.tsx`, `src/courses/CourseDetailScreen.tsx` và đúng dependent tests từ accepted candidates; review UI/contracts/server chỉ khi scope cần, tách source khỏi canonical content. Edition route/config/contract mới (tên chốt ở GO) phải có one-way closed default và không thay existing role contracts. `android/app/build.gradle`, parallel resources, Capacitor config, build/verification/install-only harness chỉ đổi khi cần identity/package-path; giữ release/.debug untouched. Không đưa `.env*`, node_modules, private contacts, local capability hoặc canonical drafts vào candidate/public. Không đọc credentials để dựng baseline.

Root phải chọn isolated managed worktree/reviewed git candidate phù hợp, đọc current attachments trước tạo; không dùng generic snapshot để bypass dirty Git checker, không commit/reset user work. Việc candidate cần commit/clean Git theo checker được giải quyết như bước riêng trong GO, không âm thầm chạy commit. Cũ `.vercel/*`, frozen manifests/APKs/receipts/root dirty phải pin và giữ nguyên.

Artifacts cụ thể dự kiến sau triển khai: scoped-source manifest + preservation/diff report; web client artifact/file list/hash và Android APK/cert/package/file inventory; bounded test results; independent R3; release packet mới mô tả exact Preview project/team/branch/domain và native device/package/artifact, target/caps/observation/stop; role guides. Đây là công việc tạo bản có thể review để tiến tới phát hành, không dừng ở tài liệu kế hoạch như kết quả cuối.

## Vai trò và bề mặt ảnh hưởng

| Entry → dependency → output | Bảo toàn/đổi cần kiểm | Evidence/gap |
|---|---|---|
| Learner guest/account → Prototype/backend → Home/check-in/Journey | Guest/skip/unsure/none_now khác nhau; preserve saved locale/display preferences/history, no missing-feedback improvement; no autosave/retry side effects | Existing learner-ux/device-acceptance/write-review fixtures; native reopen FAIL chưa được fixture thay thế |
| Teacher `?workspace=teacher` → teacher-control-plane/collaboration → assigned drafts/review | Email verified không role; deny self-elevation/cross-user/expired/revoked; không hứa invite/upload/publish khi chưa chứng minh | UI và server source tồn tại; positive live role/roster hiện tại UNKNOWN, old docs không live evidence |
| Reviewer/Owner → ContentReviewPanel → owner-control-plane | Exact revision/assignment/expiry; review không publish; AI giữ off, no positive Owner config save | Existing fixture coverage; canonical reading review khác static intro workflow; không tự grant/extend role |
| UnitReviewWorkspace → local Node adapter | Relative API/lease/focus/route invalidation và blocked media không bị bypass | 5.3 source-only contract tồn tại; hosted/native participant transport chưa có |
| Content manifest/approved facts → learner consumption | Exact reviewed bytes/purpose, no hidden draft publication or fake duration/eligibility | Owner decision details pending; catalog empty |
| Web build/native sync → packaged app | Same scoped feature/data versions, native callback, safeareas/keyboard/browser back, no secret/private source leaks; no shared-output overwrite | Web dist và parallel temp build khác commands; physical device unrun |
| Role guides → operator/participant task | Real capability vs fixture/blocked scope, exact URL/APK/login/download/stop/report path | Agent guides chuẩn bị brief riêng; không gửi invitation/email/chats, không lấy contacts |

## Mapped regression sau GO, chưa chạy

| Impact/preserved behavior | Check/action dự kiến | Expected/evidence |
|---|---|---|
| Baseline + candidate integration | Compare scoped preimages/current pins và dependent inventory; tsc; `npm run check:runtime`, `npm run build`, `npm run check:bundle-secrets`, `npm run test:sites`, `npm run check:practice-catalog` | exit0; protected runtime unchanged, empty/unapproved catalog không bị mở; new source freeze |
| Learner layout/navigation/locales | Candidate `tests/ux-responsive.spec.ts`, affected ux-home/checkin/profile/journey/reflection/save-feedback/course cases + selected `learner-ux.spec.ts`; inspect candidate testMatch/current config first | VI320/short/landscape/desktop/iPhone/Pixel, keyboard/focus/larger text, EN partial disclosed; test exact changed branches not full unrelated suite |
| No accidental data writes/late saves | `tests/learner-write-review.spec.ts`, `tests/learner-device-acceptance.spec.ts`; add edition negative network test if UX mode | No POST on hydration/reload/Journey/route-account/consent switches; frozen retry contract preserved; fixture evidence only |
| Auth + staff consumers | `tests/auth-callback.spec.ts`, `content-review.spec.ts`, `staff-request-isolation.spec.ts`; `teacher-collaboration.spec.ts` using own proxy config if affected | Deny wrong actor/expired/revoked/cross-object, stale responses cleared; no mail/live saves during fixtures |
| Participant content transport nếu được chọn | Unit contract/server tests plus new real API matrix anon/A/B/teacher/reviewer/Owner/expired/revoked; exact-content scope/cache/asset sniff/oldURL TTL | Independent R3 of control itself before invocation; private draft inaccessible; live positive cases require exact permitted operation |
| Android package/API parity | Isolated `android:parallel:build` after script/path review; APK metadata/cert/hash/public-byte scanner; compare root old APK/native files before/after | Source artifacts only first; no install implied; no release/.debug changes; catalog rule parity addressed because parallel helper currently omits web prebuild catalog check |
| Actual access delivery | Fresh protection readback before upload + anon denied smoke; exact new manifest approval then scoped Preview upload/alias; distinct install-only procedure then user icon/start/reopen | Current session/actor + unchanged SQL under reviewed diagnostics where needed; no shell-launch; native HALTED cannot be marked fixed from install/build |
| Guides/docs | File/link/claim and role-task walkthrough; version/delivery placeholders stay explicit until actual acceptance | Guides agree with runtime, no inferred roles/review/approval; no send without user instruction |

All checks above **BLOCKED/unrun** at intake, not PASS/FAIL app results. Historical local passes reused only after exact input/environment comparison. Missing expert/rights/role/physical-native/protected-web evidence blocks that release scope; no unrelated suites by default. Provider checks owned by root do not authorize writes by this Agent.

## Ownership, effects, stop and recovery

Agent intake owns only `TASK-INTAKE.vi.md` + `BASELINE.json` in this new folder. Role-guide Agent owns its brief, QC owns independent review, root owns coordination/final direct verification. Future source/native/test file ownership resolved in GO; no overlapping edits. Source/content/control changes require new freeze and affected QC/test rerun.

Current allowed effects: read-only local discovery + two new evidence files. **0** cloud/Auth/health/profile/metadata/role/migration/AI/email/deploy/install/device actions; no new paid resource. Intended target remains staging-only; exact target/current config, participant count/roles, data caps/cost/observation interval/support owner/retention/access/withdraw handling are fields to bind before external execution. Exact human evidence received later may resolve these; do not fabricate values or claim withdrawn approvals.

Stop if source drift, unknown ownership, secret/private asset inclusion, target/protection mismatch, wrong app/actor, onboarding/consent/draft/error unexpected, excess/uncertain writes, missing role/content facts or request expands to real practice. Local rollback: stop using new candidate/artifact; preserve all root source/history/frozen packets. Hosted recovery must be exact compatible artifact/alias stop plan reviewed before release. Native recovery cannot promise downgrade/data restore: no uninstall/clear-data or automatic rollback; retain installed old session/history and stop for separate plan. No DB rollback/deletion of prior extra B row.

**Next:** QC reviews these exact two files; root verifies pins and chooses concrete candidate integration scope. Wait GO. After candidate QC/root check, report and stop at the user's review boundary; do not turn a local result into deployed pilot acceptance.
