# Brief tài liệu theo vai trò — 21/10/2026

Trạng thái: **DISCOVERY ONLY / CHỜ INTAKE QC VÀ ROOT GO**. Brief này chuẩn bị phạm vi tài liệu; chưa là hướng dẫn mở pilot, cấp quyền, phát hành web hoặc cài Android. Không sửa mã, canonical, build, dữ liệu, provider hoặc thiết bị. Giữ nguyên baseline root đang chỉnh; đầu việc tài liệu thuộc Agent role-guides, QC độc lập và root kiểm cuối thuộc điều phối.

## Căn cứ và điều phải giữ

- [Lifecycle](../../docs/quality/TASK_LIFECYCLE.md), [skill MCY](../../skills/mcy-change-review/SKILL.md), [AGENTS](../../AGENTS.md): intake → QC → root GO trước triển khai; freeze → QC độc lập → root trực tiếp kiểm → dừng theo bước.
- [Bàn giao 6.1](../ux-step6-1-2026-10-20/ROOT-REPORT.vi.md) và bốn tài liệu vận hành đã đọc: [readiness](../ux-step6-1-2026-10-20/PILOT-READINESS.vi.md), [task matrix](../ux-step6-1-2026-10-20/ROUTE-TASK-MATRIX.vi.md), [moderator](../ux-step6-1-2026-10-20/MODERATOR-PACKET.vi.md), [results](../ux-step6-1-2026-10-20/PILOT-RESULTS.template.md). Giữ nguyên protocol và bảng rỗng, dùng liên kết thay chép lại thành protocol mới.
- Owner đã báo có quyết định và sẽ cung cấp phạm vi: **OWNER_REPORTED_DECISIONS_EXIST_DETAILS_PENDING**; chưa nhận exact ID/revision/locale/hash/purpose/decision evidence. Không kết luận chưa ai duyệt hoặc tự tạo approval.
- Manifest canonical SHA-256 `0fa137d5ea658fadfdb8a1ab97e5fd86550a03b82fbed972530b338e65d114b1` kiểm trực tiếp 21/10: 14 unit đọc nháp, 55 PNG hiện diện, 25 slot bị chặn theo 6.1; human review pending. 114 mục metadata không là 114 bài đã soạn hoặc được duyệt.
- Native vẫn HALTED/currentActorVerified=false, phiên khôi phục chưa đạt; web **BLOCKED_NO_UPLOAD_OR_ALIAS**. Không có URL/APK mới đủ điều kiện bàn giao trong brief này. Danh sách email được đề cử không là role/assignment; không đọc hoặc xuất private contacts, không gửi thư.

## Ma trận năng lực đã thấy trong nguồn

Đây là kiểm nguồn cục bộ, không phải chạy app, quan sát hosted UI, actor live hoặc kiểm thiết bị mới.

| Vai trò/bề mặt | Có trong nguồn / evidence | Giới hạn phải ghi trong handbook |
|---|---|---|
| Learner | Candidate UX được chấp nhận ở `.vercel/ux-step4-7-20261018-v7`: điều hướng học viên, Khám phá, Hành trình, Cá nhân/quyền riêng tư, dữ liệu mẫu phục vụ UX; một số luồng có hợp đồng backend cũ riêng | Candidate chưa đồng nghĩa web/Android đã phát hành. UI hai đường Tìm hiểu/Thực hành của 6.1 chưa xây. Không biến unit đọc thành buổi tập; không mở live check-in/profile/consent từ tài liệu này |
| Teacher thật | Root `src/staff/teacher.tsx`: đăng nhập email, server kiểm quyền; nhãn Soạn bài / Duyệt nội dung được giao, draft editor với save/version-conflict handling | Có UI không chứng minh backend mời/kích hoạt/soạn bài thật đã triển khai cho testgroup. Không tự đăng ký/nâng quyền; chưa upload media hoặc publish. Không hứa có tài khoản Teacher từ email đề cử |
| Reviewer thật | Root `ContentReviewPanel.tsx` được Owner/Teacher mở qua tab duyệt; review/assignment phải theo quyền máy chủ và exact version | Không suy role chuyên môn, quyền trên 14 canonical unit, hay approval thật từ giao diện. Positive real reviewer workflow chưa có evidence của testgroup |
| Owner quản trị hiện hữu | Root `src/staff/owner.tsx`: `?workspace=owner`, đăng nhập email, tab Cấu hình AI / Duyệt nội dung; mỗi thao tác kiểm server | Không tự dùng lại Owner session, cấp role, bấm Lưu cấu hình staging, bật AI, publish hoặc mở invitation. Positive live config-save gate riêng vẫn còn |
| Owner reader 5.3 | `.vercel/ux-step5-3-rebind-20261019-v1`: `?workspace=unit-review`, Owner local list/read/asset/note đúng snapshot; bootstrap tối đa 5 phút, lease mặc định 15 phút | Đây là Owner nội bộ trên máy local, không xác minh Teacher/Reviewer thật; không là participant backend hoặc phiên 30–45 phút. Note chỉ trong bộ nhớ theo phiên/version; không sửa canonical hoặc lưu quyết định thật |
| Author giả 5.3 | Server `fictional_rehearsal`, actor `fictional-author`: list/read/asset/note/draft trên fixture f1 | Thử đổi tiêu đề và xung đột trong bộ nhớ; không soạn unit thật hoặc cấp Teacher |
| Reviewer giả 5.3 | Actor `fictional-reviewer`: list/read/asset/note/review trên fixture f1 | Hai nút mô phỏng yêu cầu sửa/ghi kết quả; không là thẩm định, phê duyệt hoặc xuất bản |
| Moderator/người ghi chú | Bốn tài liệu 6.1 có task và mẫu trống | Chưa là role app hoặc quyền đọc dữ liệu học viên; người phụ trách, nơi lưu/access/retention/rút lại chưa chốt |

Nguồn đọc trực tiếp cho reader: `UnitReviewWorkspace.tsx`, `reviewModel.mjs`, `localReviewServer.mjs` trong candidate 5.3. Owner có quyền `list/read/asset/note`; author giả thêm `draft`, reviewer giả thêm `review`. Không có thao tác canonical approval trong reader.

## Điều hướng chỉ được ghi sau khi khớp artifact

Reader 5.3 có nhãn thật: **Đọc và đối chiếu bản nháp** → **Trong phạm vi phiên** → chọn bản → đối chiếu **ID / bản / ngôn ngữ**, **SHA-256 nguồn**, **Review** → **Đối tượng, chuẩn bị và nguồn đối chiếu** → mục lục → **Mục trước/Mục tiếp** → **Về ứng dụng**. Media thiếu/bị chặn giữ thông báo, không thay ảnh. **Giữ ghi chú tạm trong phiên local** không lưu bền vững. Lỗi kết quả thao tác chưa rõ phải dừng gửi lại và đối chiếu; hết hạn/thu hồi/đổi nguồn xóa nội dung trên UI.

Các nhãn Teacher/Owner ở bảng trên là nguồn root hiện hữu, không được ghép với candidate reader thành một bộ app đã phát hành. URL điều hướng tương đối chỉ là mô tả mã nguồn; chưa tạo link test được phép truy cập.

## Bộ tài liệu đề xuất sau GO

| Tệp đề xuất | Nội dung phải hoàn thành | Kiểm tra phù hợp |
|---|---|---|
| `ROLE-LEARNER.vi.md` | Mục tiêu lượt test, cách mở đúng bản web/Android theo delivery thật; phân biệt dữ liệu giả với dữ liệu thật; từng task/expected result/thoát/báo lỗi | Chỉ task trong scope Owner chọn; chưa hướng dẫn lưu thật hoặc vận động |
| `ROLE-TEACHER.vi.md` | Setup quyền được xác minh; xem phạm vi, soạn/sửa/lưu/version conflict chỉ khi backend thật đủ evidence; nhánh rehearsal tách rõ | Không biến fixture thành role thật, không hứa upload/publish |
| `ROLE-REVIEWER.vi.md` | Đối chiếu exact version/assets, phần được giao, ghi finding/phần chưa rõ; phân biệt ghi chú, mô phỏng và quyết định con người | Không tạo đánh giá chuyên môn/rights thay người thật |
| `ROLE-MODERATOR.vi.md` | Checklist mở lượt, liên kết T1–T5/P1–P2 của 6.1, trợ giúp/dừng, bàn giao notes theo custodian thật | Không lặp protocol, không thêm thu sức khỏe/định danh |
| `ROLE-OWNER.vi.md` | Khớp artifacts/approval/scope/roster, xác nhận delivery và rollback/stop, đọc báo cáo; các điểm quyết định còn pending | Không cung cấp mật khẩu/token, tự cấp quyền hoặc bỏ release gate |
| `DELIVERY-AND-REPORTING.vi.md` | Entry point cho từng nhóm; bảng web URL/artifact hash, APK filename/hash/package/version/device, quyền/thời hạn, người hỗ trợ và kênh nhận lỗi; cùng mẫu lỗi tối thiểu | Các giá trị chưa thật sự có giữ **PENDING**, không link giả hoặc installer chưa kiểm |

Mỗi handbook cần ngắn nhưng đủ thao tác: trước khi bắt đầu → bước → kết quả mong đợi → điều kết quả không chứng minh → dừng/báo lỗi. Giữ các đường dẫn artifact thật riêng từng môi trường. Android phải bind exact APK/package/version/hash và acceptance thiết bị; không dùng force-stop/shell-launch/reinstall/clear-data làm bước user QA khi native đang HALTED.

Mẫu lỗi chung dự kiến: nền tảng + artifact/version không chứa capability; task/bước; mong đợi; quan sát; lỗi an toàn trên màn hình; thời điểm tương đối; đã dừng hay chưa. Không tên/email/account ID, token, link chứa mã, dữ liệu sức khỏe hoặc ảnh có định danh. Không mặc định screenshot/recording; chỉ nhận bằng chứng đã được scope cho phép và che thông tin.

## Dữ kiện còn chờ để chuyển sang viết handbook và release

1. Root nhận scope test thực tế: chỉ UX giả, đọc artifact đã được duyệt hay luồng account thật; các nền tảng/vai trò/nội dung được phép. Không tự chọn thay Owner.
2. Exact human decision evidence cho nội dung/purpose/đối tượng/rights/accessibility; nominees nào đã được phân công thật và phạm vi reviewer. Không cần xuất thông tin liên hệ vào tài liệu.
3. Artifact được chọn và chứng cứ web protection/hosted bytes; Android build/install/session acceptance mới nếu scope cần. Candidate chấp nhận cục bộ không đóng hai release gate.
4. Có hay chưa server-owned grants/assignments và contract/backend cho real Teacher/Reviewer/test accounts; caps/stop/readback nếu có cloud writes. Brief không mở migration/grant/email.
5. Moderator/custodian, kênh hỗ trợ, cách lưu/access/retention/rút lại notes; delivery hợp lệ cho thời lượng lượt. Không chia sẻ/gia hạn capability Owner để lấp chỗ trống.

Tài liệu là R0 về mặt không đổi hành vi; các tuyên bố quyền/release phải qua QC về sự thật và giới hạn. Kiểm hậu GO dự kiến: đối chiếu từng nhãn và claim với artifact, liên kết tồn tại, không credential/contact, placeholder không giả readiness, forward walkthrough từng role/denied/expired/mismatch/uncertain path. Build/app/API/device checks **BLOCKED / chưa chạy trong nhánh tài liệu**; chỉ chọn thêm khi root chốt scope triển khai. Rollback của brief/handbook là bỏ dùng tệp mới; không đụng dữ liệu hay packet cũ.

**STOP sau brief. Chỉ viết bộ handbook sau intake QC và root GO; chưa chạy pilot, gửi thư, export/share draft hoặc phát hành.**
