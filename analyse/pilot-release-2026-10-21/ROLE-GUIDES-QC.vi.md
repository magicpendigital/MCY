# QC độc lập role guides — 21/10/2026

**PASS_DOCUMENT_DRAFT_SCOPE; không còn P1/P2 trong sáu bản nháp có điều kiện.** Chưa là handbook đã phát cho nhóm test, artifact binding hoặc pilot acceptance. Root final verification còn chờ. Reviewer `/root/pilot_release_qc` độc lập với Agent role-guides; không sửa sáu guides, không chạy app/test/build/server/provider/device.

Freeze đã kiểm: `ROLE-GUIDES-FREEZE-v2.json`, SHA-256 `07494bbd308fb55fb0b1721ad94c505a16cf64b7ddf6c81ac19088c431bc45d0`. Sáu guides, 21 dependencies và một checks receipt: **28 pins hash/bytes khớp**, PowerShell exit0. QC tự kiểm **24 file links**, 0 missing; anchor được đối chiếu với heading `Ghi lỗi tối thiểu`, chưa kiểm renderer trong app. v1 giữ nguyên là lịch sử trước chỉnh current hosting facts.

Đã đọc đủ ROLE-LEARNER, ROLE-TEACHER, ROLE-REVIEWER, ROLE-MODERATOR, ROLE-OWNER và DELIVERY-AND-REPORTING. Đối chiếu trực tiếp nhãn/permission với accepted 4.7 Prototype, 5.3 UnitReviewWorkspace/reviewModel/localReviewServer và root Teacher/Owner/ContentReviewPanel, cùng packet 6.1. Không lấy implementer walkthrough làm rerun độc lập.

| Walkthrough độc lập trên giấy/nguồn | Kết quả |
|---|---|
| Learner mở UX giả, gặp lời mời account hoặc nút lưu | PASS: yêu cầu mode/task trước, chỉ đọc các mục có thật; không tự login/check-in/consent/profile write. Không suy sample/history thành dữ liệu thật |
| Author giả sửa tiêu đề, reviewer cũ còn giữ bản trước | PASS: draft/review chỉ trên fixture theo phiên/version; conflict/nguồn đổi dừng đối chiếu. Không biến thành Teacher thật/canonical approval |
| Reviewer nhận 14 unit hoặc panel intro | PASS: canonical pending và workflow intro/audio riêng được tách; note/mô phỏng không là quyết định chuyên môn/quyền media. Real save cần operation/caps/assignment |
| Owner đọc local rồi hết lease hoặc participant cần lượt dài | PASS: bootstrap 5 phút, lease 15 phút, dừng; không share/gia hạn capability để làm participant service |
| Moderator gặp từ chối/missing feedback/tự kể dữ liệu nhạy cảm | PASS: bỏ qua/dừng không cần lý do, không chép sức khỏe, notes/custodian/retention phải chốt; không suy cải thiện hoặc đổi protocol |
| Sai artifact/actor, native về Đăng nhập, uncertain save | PASS: dừng/báo lỗi tối thiểu; không shell-launch/clear-data/re-login/resave/xóa history hoặc tự thêm budget |

Một correction đã yêu cầu trước verdict: ROLE-OWNER và DELIVERY v1 ghi current protection chưa xác minh. Root hiện có readback project/team đúng; v2 đã phản ánh SSO `null`, password/trusted IPs `false` theo receipt SHA `d9a1030ffb2e5a39c2f2d0f7f94a3658262d308fe8ec368758a426c5ce123730`. Protection cho Preview mới vẫn chưa được chứng minh, `BLOCKED_NO_UPLOAD_OR_ALIAS` giữ nguyên. Không coi GET200 cũ hay project readback là release clearance.

Các guides ghi rõ chưa có bản web/APK tích hợp được giao, role thật và scope còn pending; không tạo URL/account/assignment/approval giả. Owner đã báo quyết định có/details pending được giữ chính xác. Không có credential/contact/capability trong sáu tài liệu; hướng dẫn báo lỗi loại định danh, health data và callback/token khỏi báo cáo.

R0 documentation review đủ cho diff hiện tại; R3 source/control/live/release gates vẫn áp dụng cho triển khai. App/browser/API/device checks **BLOCKED/unrun** trong review này, không cần chạy lại chỉ để kiểm sáu tài liệu. Nếu candidate/nhãn/capability/artifact/scope đổi, Agent cập nhật phần ảnh hưởng, freeze mới rồi QC/root kiểm lại; không carry verdict này vào handbook phát hành mới một cách tự động.

Recovery là ngừng dùng sáu bản nháp, không hoàn nguyên dữ liệu hay cài APK cũ. Next: root tự đọc/kiểm pins rồi ghi kết quả; conditional guides có thể đưa trong hồ sơ chuẩn bị để Owner review. Chưa phân phối, mời người, thu notes, cấp role hoặc mở lượt test.
