# Bàn giao mốc chuẩn bị web và Android — 21/10/2026

**Đã tạo bản web/APK để kiểm tra; chưa cập nhật bản đang chạy, chưa cài lên thiết bị và chưa mở test FULL cho người tham gia.** Đây là báo cáo mốc chuẩn bị và QC, không phải xác nhận phát hành hoàn tất. Root điều phối, kiểm tra trực tiếp và lập báo cáo; Agent thực hiện tích hợp/build/tài liệu, Agent khác QC độc lập.

Phạm vi đã nhận từ Owner: **toàn bộ nội dung đã chuẩn bị, thực hành và chức năng bằng tài khoản thật trên web/Android**. Teacher và Reviewer đã được Owner chỉ định; Owner báo các quyết định duyệt đã có. Nhóm giữ nguyên thông tin này, tự map phiên bản/hash; không yêu cầu Owner chọn lại phạm vi, người phụ trách hoặc tính hash. Việc nối hồ sơ duyệt thực với bản dữ liệu, kiểm quyền máy chủ và hoàn thiện buổi tập vẫn cần thực hiện.

## Kết quả đã có

| Hạng mục | Kết quả và giới hạn |
|---|---|
| Tích hợp nguồn | Managed worktree riêng tại `C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY`; 479 nguồn được pin. Tích hợp UX đã chấp nhận và các bảo vệ native/current actor/consent. Hai thay đổi nhận diện native chỉ đổi versionName và nhãn Pilot. Không sửa cơ chế Auth để né lỗi restore. |
| Web | Build thật PASS: runtime 28, TypeScript, kiểm catalog, Vite, scanner và 4 Sites fixtures. 61 tệp đóng gói, gồm 59 tệp client. [Receipt web](D:/Projects/MCY/analyse/pilot-release-2026-10-21/COMMON-WEB-v1.json) và [QC artifact](D:/Projects/MCY/analyse/pilot-release-2026-10-21/COMMON-WEB-ARTIFACT-QC-v1.vi.md). Chưa deploy. Cảnh báo chunk lớn hơn 500 kB được giữ lại, chưa có nghiệm thu hiệu năng. |
| Android | APK build/package PASS, **11.585.235 bytes**, package `com.nilaza.motchutyoga.mcydebug`, versionName `1.0-mcydebug-pilot20261021`, versionCode 1 có chủ ý. Nhãn `Một chút yoga (Pilot 21/10)` / `A Little Yoga (Pilot 21 Oct)`. Chữ ký khớp bản parallel trước. [Receipt native](D:/Projects/MCY/analyse/pilot-release-2026-10-21/COMMON-NATIVE-v1.json), [QC artifact](D:/Projects/MCY/analyse/pilot-release-2026-10-21/COMMON-NATIVE-ARTIFACT-QC-v1.vi.md). Chưa cài hoặc chạy thiết bị. |
| Callback đóng gói | Root dùng aapt2 đọc compiled AndroidManifest/resources, xác nhận `motchutyoga-mcydebug://auth/callback` và VIEW/DEFAULT/BROWSABLE. Đây là kiểm metadata, chưa phải resolver/Auth/restore trên thiết bị. [Root verification](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-APK-MANIFEST-VERIFICATION-v1.json). |
| Root kiểm giao diện | Root tự thao tác 8 màn trên đúng bytes web local: Welcome, Check-in, Khám phá, course trước Play, Home, Hành trình trống, Cá nhân, Privacy. Check-in giữ bản đồ cơ thể nổi bật và hai lựa chọn phụ gọn. Không login, Play, toggle hoặc Save. [Bằng chứng UI](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-GUEST-UI-VERIFICATION-v1.json); [6 kiểm HTTP/CSP](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-LOCAL-HTTP-VERIFICATION-v1.json). Chỉ viewport 1280×720; chưa là full responsive/accessibility acceptance. |
| Tài liệu vai trò | 6 tài liệu chi tiết đã có QC độc lập; 47 liên kết local hợp lệ. Root đọc đủ bản cuối và tự kiểm 106 pin occurrences của guides/form/dependencies. [QC tài liệu](D:/Projects/MCY/analyse/pilot-release-2026-10-21/FINAL-ROLE-DOC-QC-v1.vi.md), [Root verification](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-ROLE-GUIDES-VERIFICATION-v2.json). Tài liệu là bản nháp vận hành có điều kiện, chưa phát cho nhóm test. |

APK chuẩn bị ở [app-parallel.apk](C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY/.vercel/pilot-artifacts/native-common-v1/app-parallel.apk), SHA-256 `e1b036765affce158e05d699239a4f0b36e8ce8bf317dd6b6bd7a0d142897da7`. Link dùng để review artifact, **chưa phải chỉ dẫn cài**. Candidate hiện là nguồn tích hợp chưa commit; chưa có release manifest cuối và không dùng snapshot để bỏ qua quy tắc Git sạch.

## Hồi quy và lỗi phát hiện

**QA v3b đạt 31/31 ca, exit 0, không retry tự động, không skip/flaky**, trong phạm vi ba suite fixture đã chọn. Ca delayed-client dùng chính module shared client của app, đi hết started → leave → release → settled và xác nhận không có writer sau khi rời màn hình. [Receipt cuối](D:/Projects/MCY/analyse/pilot-release-2026-10-21/CRITICAL-FIXTURES-v3b.json). Root trực tiếp đọc 31 kết quả và rehash sau QA: 479 nguồn/61 tệp web/APK giữ nguyên; [Root verification cuối](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-FINAL-VERIFICATION-v1.json).

[QC độc lập kết quả cuối](D:/Projects/MCY/analyse/pilot-release-2026-10-21/CRITICAL-FIXTURES-RESULT-QC-v3b.vi.md) đã đọc đủ 31 ca và tự đối chiếu 850 pin occurrences gồm source/control/browser/web archive cùng exact APK. Kết luận PASS chỉ cho fixture scope; P2 accessibility và các cổng participant/release vẫn giữ nguyên.

Proxy cuối forward 2.449 lượt HTTP loopback, 0 denial/CONNECT/upgrade/cap và unexpected 0. **Có 1 local transport error, nguyên nhân chưa xác định**, giữ nguyên trong evidence. CSP của môi trường QA chỉ cho connect tới fixture `.invalid` được route mock; không suy từ proxy 0 rằng Vite không có constructor/attempt bị CSP chặn. Đây là kiểm source graph với dữ liệu giả, không là exact compiled delivery, live actor/backend hoặc physical Android acceptance. Kiểm compiled guest UI/APK metadata của root là các bằng chứng riêng ở bảng trên.

Giữ nguyên các kết quả không đạt để truy vết:

- [QA v1](D:/Projects/MCY/analyse/pilot-release-2026-10-21/CRITICAL-FIXTURES-v1.json): 29/31 đạt; hai assertion dùng locator toàn DOM/copy Profile cũ; proxy chặn 220 CONNECT. Không lưu đích nên nguyên nhân CONNECT chưa biết. Không kết luận do app, Edge hay HMR.
- [QA v2](D:/Projects/MCY/analyse/pilot-release-2026-10-21/CRITICAL-FIXTURES-v2.json): 30/31 đạt, không skip/flaky; ca delayed-client cần nhập chính `/src/backend/supabase.ts` để chặn shared client, nhưng static fixture không phục vụ module đó. Chưa tới assertion hủy lưu. Proxy không có denial/CONNECT; có 1 local transport error chưa xác định nguyên nhân. [QC kết quả v2](D:/Projects/MCY/analyse/pilot-release-2026-10-21/CRITICAL-FIXTURES-RESULT-QC-v2.vi.md).
- Các bản sửa QA chỉ ở overlay cô lập: xác định duy nhất outer current screen và đúng actor, chuyển kiểm email xác minh sang Security đúng UI hiện tại. Không `.first()`, không bỏ kiểm số lần ghi, phân tách tài khoản, consent hoặc late-save; không sửa app để đạt test. Control mới đều có R3 và root GO trước invocation, không retry dưới GO cũ.

**P2 còn mở: accessibility của màn cũ trùng route ID.** FlowStack giữ entry trước trong DOM; entry trước có thể còn visible và outer container chưa có inert/aria-hidden theo unique entry. Inner boundary kiểm active theo route ID, nên khi trùng ID có thể cùng active. Keyboard/trình đọc màn hình có nguy cơ gặp nội dung hoặc control của entry cũ. DOM có hai heading cùng actor A đã được thấy; chưa có bằng chứng lộ dữ liệu tài khoản hoặc nghiệm thu screenreader/native. Sửa locator QA không sửa lỗi này. [Finding và tiêu chí sửa riêng](D:/Projects/MCY/analyse/pilot-release-2026-10-21/RETAINED-ROUTE-A11Y-FINDING-v1.vi.md). Full accessibility acceptance vẫn BLOCKED.

Lượt cài dependency offline đầu thất bại ENOTCACHED được giữ trong receipt D0; lượt registry chính thức có review riêng sau đó thành công. Các sự cố công cụ/môi trường này không được ghi thành app acceptance. Không lặp toàn bộ 142 checks lịch sử nếu không có thay đổi hoặc vấn đề mới cần chúng.

Điểm bổ sung cho nhận việc/QC của lần này: khi chọn server phục vụ regression, phải kiểm cả import URL phát sinh trong browser và yêu cầu dùng chung module instance, không chỉ static import closure. Review trước v2 đã bỏ sót điều kiện đó; v3b đã quét đủ ba suite/closure và ghi lại source Vite/React/CSP thực tế trước invocation. Không đổi app hoặc bỏ ca test để xử lý sai khác môi trường.

## Vì sao chưa thể giao URL/APK để bắt đầu FULL test

| Phần còn thiếu | Evidence hiện tại | Công việc phải hoàn tất |
|---|---|---|
| Đường truy cập web | [Readback project/team mới](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-HOSTING-PROJECT-READBACK.json): SSO null, password false, trusted IPs false; chưa chứng minh bảo vệ áp dụng cho Preview mới. Existing domain GET không cookie trả 200. | Chốt phương án/access roster phù hợp, kiểm quyền và chi phí thực nếu có, lập operation đúng artifact/target; xác minh bảo vệ trước upload. Chưa upload, alias, đổi protection/bypass hoặc promote Production. |
| Native restore | Checkpoint hiện hành HALTED/currentActorVerified=false do Recent/icon reopen trả về Đăng nhập; nguyên nhân chưa rõ. Build mới không đóng failure này. | Diagnostic chỉ đọc được review trước, sửa cơ chế khi có evidence; QA fixture và operation thiết bị mới. Không dùng shell-launch/force-stop/clear-data/relogin để lấy PASS. Old trial/cap 13–14/10 không được tái dùng. |
| Tài khoản/vai trò thật | [CLI metadata](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-BACKEND-PROJECT-CLI-READBACK-v2.json) xác nhận đúng `mcy-staging`, org MagicpenDigital, ACTIVE_HEALTHY. Chỉ metadata; chưa là current ledger/ACL/Auth/roles/assignments acceptance. | Read-only current-state intake có phạm vi; sau đó exact role/assignment/expiry/caps packet nếu còn thiếu. Người được Owner chỉ định không tự thành server role. Không tự grant hoặc gửi email. |
| Giao 14 bản đọc riêng cho reviewer thật | Reader 5.3 hiện dùng Owner local/fictional actor; ContentReviewPanel khác chỉ hỗ trợ intro/audio mẫu. Static web/APK không chạy desktop Node reader. | Private authenticated review transport, client adapter web/native, assignment/version/expiry và media access được server kiểm. Không chia sẻ lease Owner, mở CORS/localhost rộng hoặc nhét nháp private vào bundle. |
| Nội dung thực hành | Đã map cả pool: 14 reading units/70 steps/55 PNG nháp/25 blocked slots; 38 source clips trong 3 nhóm khóa; intro riêng với 4 assets; 114 expansion entities là metadata, không đóng góp lesson/media mới. `reviewedPracticeCatalog` hiện 0 session; 14 reading units có practiceDuration null. | Đối chiếu hồ sơ duyệt/quyền đã báo có với exact snapshot; hoàn thiện buổi tập/timing/transitions/media/audience và admission contract. Không tự biến bài đọc, clip hoặc metadata thành complete reviewed PracticeSession. Blocked media giữ chặn đến correction/review phù hợp. |
| Tổ chức lượt test | Moderator/custodian, nơi lưu và quyền xem notes, retention/rút notes, kênh hỗ trợ và roster còn chưa nối vào operation. | Owner/operator bổ sung facts vận hành còn thiếu trong phiếu đã map sẵn. Không hỏi lại scope/người Teacher/Reviewer/hash; không đưa dữ liệu sức khỏe thật vào bug report. |

55 PNG canonical private không được đưa vào common bundle. Intro ảnh phòng và 3 audio mẫu tiếng Anh **đã có trong artifact chung**, nên không tuyên bố bundle hoàn toàn không chứa draft assets. Intro chỉ là learning_intro, chưa là buổi thực hành hoàn chỉnh.

Chặn upload xuất phát từ [AGENTS.md:17](D:/Projects/MCY/AGENTS.md:17): **“unknown/default-null/current200 means no upload/alias”**. Quy trình [release runbook](D:/Projects/MCY/docs/release/RELEASE_RUNBOOK.md) yêu cầu **“Approve only an exact candidate, target and manifest hash.”** Đây là giới hạn cụ thể đang áp dụng; báo cáo này không tự cấp quyền phát hành, thay protection hoặc cài thiết bị.

## Tài liệu chi tiết theo vai trò

| Tài liệu | Nội dung |
|---|---|
| [Học viên](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROLE-LEARNER.vi.md) | Luồng UI hiện có, mục tiêu quan sát, nhánh thực hành và account/native pending, điều kiện dừng. |
| [Teacher](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROLE-TEACHER.vi.md) | Workspace/draft thật theo điều kiện role, timing/version conflict, phân biệt rehearsal. |
| [Reviewer](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROLE-REVIEWER.vi.md) | Đối chiếu phiên bản/media, căn cứ review/quyền, kết quả review riêng với publish. |
| [Moderator/người ghi chú](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROLE-MODERATOR.vi.md) | Trước/trong/sau lượt, task, expected result, mức trợ giúp, notes và quyền dừng. |
| [Owner/điều phối](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROLE-OWNER.vi.md) | Phạm vi, delivery/roles/caps, release/native gates và đọc kết quả. |
| [Mở bản thử và báo lỗi](D:/Projects/MCY/analyse/pilot-release-2026-10-21/DELIVERY-AND-REPORTING.vi.md) | Exact web/APK, phiếu delivery, kiểm đúng actor/bản, mẫu lỗi tối thiểu. |
| [Phiếu nối hồ sơ duyệt và facts vận hành](D:/Projects/MCY/analyse/pilot-release-2026-10-21/OWNER-DECISIONS-TO-COMPLETE.vi.md) | Pool/ID/revision/hash nhóm đã tính sẵn; chỉ bổ sung căn cứ có thật và facts còn thiếu. |

Các tài liệu chưa được gửi hoặc dùng để mời người test. Sau từng operation đạt nghiệm thu, Agent cập nhật URL/version/steps thực tế, QC độc lập và root kiểm lại trước phát.

## Điều phối bước kế tiếp

Đội hiện dùng `gpt-6.1-sol`: lead tích hợp/build **high**, QC độc lập **high**, tài liệu vai trò **medium**. Root giữ vai trò điều phối/kiểm tra. Dùng lại Agent và evidence phù hợp, không tạo nhiều Agent chạy trùng hoặc tự chạy batch không giới hạn. Không cần Owner cấu hình model thủ công cho đội này.

| Thứ tự | Phạm vi giao Agent | Đầu ra và điều kiện chuyển tiếp |
|---|---|---|
| 1 — đề xuất mốc tiếp theo | Đóng P2 retained route: intake tác động/focus/back/gesture, patch theo unique entry và meaningful tests. Lead high; QC high độc lập. | Source diff + keyboard/accessibility evidence + account-switch/back regression; root trực tiếp kiểm, báo cáo và dừng chờ Owner trước phần kế. Chưa triển khai patch trong mốc chuẩn bị này. |
| 2 | Current-state backend/role intake và thiết kế private authenticated review delivery. | Contract/target/role/assignment/media/expiry/deny matrix, selective server rollout/disable; R3 trước hành vi mới. Sau đó mới triển khai adapter/handler/storage cần thiết và kiểm allowed/denied actors. |
| 3 | Nối hồ sơ duyệt đã có, toàn pool và complete PracticeSession. | Không viết thay chuyên môn/quyền; phiên bản/session/media mapping chính xác, phần chưa đủ giữ blocked. Human content review và QC kỹ thuật riêng. |
| 4 | Diagnostic/fix/QA native restoration và tương thích API. | Review diagnostic trước invocation; source evidence trước fix; exact APK/device packet mới, Owner dùng icon thật; current actor/restore/readback trước data writes. Không tái dùng trial cũ. |
| 5 | Release và pilot thật có kiểm soát. | Clean candidate; manifests riêng web/native/server/data; đúng protection/access/caps/stop, QC độc lập và root kiểm; trình exact human release decision rồi mới deploy/install. Smoke/observe thực tế và cập nhật bộ guides trước giao nhóm. |

Kế hoạch đầy đủ và các thay đổi chức năng cần làm có trong [FULL-SCOPE-ROLLOUT-DELTA](D:/Projects/MCY/analyse/pilot-release-2026-10-21/FULL-SCOPE-ROLLOUT-DELTA.vi.md). P2 mới là bổ sung trước bước delivery trong kế hoạch đó. Những dòng trên là đề xuất phạm vi tiếp theo, chưa là GO triển khai hành vi mới hoặc phát hành.

## Bảo toàn và tác động thực tế

Root trực tiếp đối chiếu 620 baseline pin occurrences/540 đường dẫn duy nhất: bytes/hash giữ nguyên. 35 tệp tracked đang dirty của checkout chính không đổi; 6 APK/metadata cũ giữ nguyên bytes/hash/timestamps. Canonical content, history/failure cũ và các manifest frozen giữ nguyên. [Root preservation](D:/Projects/MCY/analyse/pilot-release-2026-10-21/ROOT-PRESERVATION-VERIFICATION-v1.json). Managedtree build và evidence mới tách khỏi các artifact cũ.

Không deploy/alias/đổi protection, không cài/launch/force-stop/clear-data thiết bị, không migration/role/assignment/Auth-metadata/consent/check-in/observation write, không email/invite hoặc AI inference trong mốc này. Có tải dependency npm đã review để build local và các đọc metadata project; không mô tả chúng là không có network. AI không được bật ở bước này; config AI/ledger/counts tháng 14/10 không được trình bày như readback mới ngày 21/10.

Viewer/HTTP server phục vụ root đã đóng; tab tạm root đã đóng, không thay tab của Owner. Root trực tiếp xác nhận cả 7 cổng local dùng cho viewer/QA (4288, 4290–4295) đều CLOSED sau QA cuối; các child invocation kết thúc bình thường theo receipt. Giữ managed worktree vì web/APK archives đang là ignored files cần cho review và bước tiếp theo; chưa archive/xóa chúng. Chưa có thử nghiệm với người thật, nội dung thực hành, physical Android hoặc Production acceptance. Root dừng tại mốc báo cáo để Owner phản hồi theo nhịp đã yêu cầu.
