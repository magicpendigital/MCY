# Kế hoạch đồng bộ UX và nội dung — 17/10/2026

Kế hoạch hiện hành cho lượt 4.4; nối tiếp [kế hoạch 14/10](../ux-implementation-2026-10-14/PLAN.vi.md) và đề xuất trong [Một chút nền tảng](../foundation-series-2026-10-16/CONTENT-PROPOSAL.vi.md). Đây là đồng bộ kế hoạch local, không phải tích hợp source hay phê duyệt chuyên môn/phát hành. Nội dung chat “Đánh giá luồng hướng dẫn yoga” là ngữ cảnh đã được root đối chiếu; trạng thái chi tiết dựa trên các artifact local bên dưới.

## Trạng thái và điểm dừng

| Phần | Trạng thái thực tế | Tiếp theo |
|---|---|---|
| Các sửa lưu, nháp và Hành trình trước bước 4 | Có trong dòng candidate UX, chưa tích hợp root | Giữ regression và boundary đã duyệt |
| 4.1 Home | Owner đã duyệt trong dòng candidate | Bảo toàn khi làm 4.4 |
| 4.2 Check-in | Owner đã duyệt trong dòng candidate | Bảo toàn bố cục và hành vi đã duyệt |
| 4.3 Thời gian/energy, AI-off | Owner đã duyệt; candidate `.vercel/ux-step4-3-20261016` là baseline | Bảo toàn, không hứa lựa chọn cá nhân hóa vượt capability |
| 4.4 CourseDetail | Đang nhận việc/kiểm intake; chưa triển khai trong checkpoint này | Intake/control QC trước worker app; implementation → checks phù hợp → QC độc lập → root kiểm tay → bàn giao |
| 4.5 Reflection | Chờ lượt tiếp theo và quyết định của Owner sau bàn giao 4.4 | Dừng trước 4.5; chỉ kiểm regression nhánh phản hồi hiện có |
| 4.6 Profile và 4.7 responsive còn lại | Backlog riêng | Chốt intake từng phần |
| Bước 5 chuẩn hóa nội dung | Có inventory/proposal và hiện trạng quản trị; nội dung mới chưa được duyệt | Nguồn/quyền/chuyên môn, schema, versioning và đường quản trị thật |
| Bước 6 pilot text + hình | Hai bài mẫu có preview; chưa là pilot người học hay nội dung phát hành | Duyệt nội dung/media trước tích hợp; protocol định tính và kiến trúc reader riêng |

Root checkout có thay đổi từ các luồng khác; không lấy HEAD làm baseline và không chép đè root. Source đã duyệt của 4.3: `Prototype.tsx` SHA256 `4301656f5e45197b421a98d63d9da8898a699cbc608449ce51ce909bc0e84bee`; `prototype.css` SHA256 `4a4a251b4ab64b5ea6b94813f24175d36fdbe3161b0a23bd1d5841027a5067a1`; freeze theo checkpoint root `d29bf12d5f20992139094af4f8a4facb2ca6e9af37b4865a9e9151e33956cd2f`. Hai hash source đã đọc lại trong intake này; freeze là pin root cung cấp, không tuyên bố kiểm lại manifest toàn bộ.

## Phạm vi 4.4

Mục tiêu: người học nhận ra video đang chọn, thời lượng, loại nội dung và hành động Phát ở gần nhau. Tái dùng mô tả hiện có trung thực; model hiện chưa có mục tiêu học, prerequisite, reviewer hoặc quyền đã xác minh nên không tự bổ sung các khẳng định đó.

Candidate dự kiến `.vercel/ux-step4-4-20261017` kế thừa đúng 4.3; evidence trong thư mục này. Chỉ sửa phần trình bày `src/courses/CourseDetailScreen.tsx`, CSS course-detail có scope và test liên quan. Không đưa series/ảnh AI vào catalog, không tạo card có vẻ đã mở, không đổi Discover/Home để quảng bá nội dung chưa triển khai. Bất kỳ mở rộng sang route/data/shared state phải cập nhật intake và QC trước.

Giữ video dọc 9:16 nguyên khung, không thumbnail mới; giữ lazy import, nguồn/Google privacy và caption uncertainty trước khi tải YouTube. Hiện iframe chỉ được tạo sau Phát rõ ràng rồi dùng `autoplay=1`; invariant là không tự phát khi vào route/đổi bài, không phải `autoplay=0`. Giữ chọn bài thủ công, nút trước/sau, hủy player khi rời route, loading/timeout/reload/link gốc. Chỉ nút tự xác nhận đã thực hành mở cảm nhận; xem video không tự đánh dấu hoàn tất hay ghi Hành trình.

## Đồng bộ Một chút nền tảng vào bước 5–6

[Content proposal](../foundation-series-2026-10-16/CONTENT-PROPOSAL.vi.md), [UX audit](../foundation-series-2026-10-16/UI-UX-AUDIT.vi.md), [photo handoff](../foundation-series-2026-10-16/PHOTO-ADMIN-HANDOFF.vi.md), [admin hiện trạng](../foundation-series-2026-10-16/CONTENT-ADMIN-CURRENT.vi.md) và [admin proposal](../foundation-series-2026-10-16/CONTENT-ADMIN-PROPOSAL.vi.md) là các nhánh chuẩn bị cần giữ đồng bộ.

Series dự kiến ba bài: “Đứng và nhận biết điểm tựa”, “Làm quen chuyển động Bò–Mèo”, “Nghỉ và kết thúc buổi tập”. Hai bài đầu có nội dung 5 khung và hai bộ phong cách mỗi bài; bài thứ ba còn concept. Bộ photo gồm 10 ảnh tổng hợp AI, màu olive/kem và ánh sáng tự nhiên, có alt/caption riêng; preview cho chọn Ảnh AI/Minh họa và giữ bước đang đọc. Đây là ảnh AI được ghi nhãn, không phải giáo viên thật hoặc bằng chứng tư thế đúng. Chưa có clinical/expert/rights approval; kiểm local/peer review không thay phê duyệt đó.

Luồng tương lai: Biết trước → 5 khung → Nhìn lại → Chọn tiếp. Giữ bốn tab; đặt nội dung đã đủ điều kiện trong Khám phá và cân nhắc hàng “Tìm hiểu trước khi tập” gọn trên Home. Đọc/vuốt ảnh/đến cuối không đồng nghĩa thực hành, hoàn tất hay tiến bộ sức khỏe; phản hồi hiểu bài tách dữ liệu cảm nhận cơ thể. Không tự phát bài kế tiếp, không tạo Journey progress, không bắt người chỉ đọc qua AI hoặc wellbeing consent.

Trước tích hợp cần task riêng cho loại nội dung/phiên bản, schema từng khung và asset alt/caption/rights, reader có nút trước/sau/mục lục/phóng to/focus, lưu vị trí đọc với privacy phù hợp, cùng workflow CMS và release. Không nhét draft private vào bundle hoặc gán scope sample để vượt gate. 38 video hiện tại tiếp tục là thư viện video; không tự suy thành khóa có prerequisite/progression hay beginner-safe.

Quản trị hướng tới Soạn → Gửi duyệt → chuyên gia yoga → biên tập/quyền → Publish. Tác giả khác reviewer; assignment gắn phiên bản, hạn và thu hồi; đổi nội dung/media làm mất hiệu lực approval cũ. Owner phân công qua trusted operations/Miu khi adapter đã được xây và kiểm; không tự cấp capability. Hiện có Owner content-review hẹp với evidence staging có ngày và private collaboration local riêng; upload, series schema, adapter và publish chưa thành pipeline vận hành. Admin preview chỉ giả lập trong bộ nhớ. Expiry/revocation và quyền publish cần quyết định rõ trước runtime.

Pilot chỉ tiến hành sau nội dung/media đủ điều kiện: protocol 5–8 người, hai vòng định tính, đo hiểu sai/cần trợ giúp/thời gian chọn và chi phí biên tập; không coi completion là hiệu quả sức khỏe. Khóa 5–7 bài và AI runtime chọn ID đã duyệt là quyết định/operation sau, không được mở từ 4.4.

## QC, bàn giao và giới hạn

Xem [TASK-INTAKE](TASK-INTAKE.vi.md) cho impact/test map. Chạy test bị ảnh hưởng, regression 4.1–4.3 và baseline checks phù hợp; không mặc định chạy toàn suite mỗi lượt. Chỉ mở rộng khi diff/failure/rủi ro còn lại có lý do cụ thể. QC độc lập đọc final hashes/diff/evidence trước bàn giao; root kiểm thao tác/pixels trên artifact cuối. Có thay đổi sau QC phải xác định lại checks/review cần lặp.

Rollback local bằng không tích hợp candidate 4.4, giữ nguyên 4.3. Không sửa evidence đã frozen. Không đọc `.env`, dùng session thật, gọi cloud, gửi email, sửa Auth/consent/role/RPC/schema, sinh media, cài native hoặc deploy. Native hiện HALTED/current actor chưa được xác minh lại; web BLOCKED_NO_UPLOAD_OR_ALIAS. PASS local không đóng các gate đó. Bàn giao báo rõ phần thay đổi, checks, QC, kiểm tay, residual risks và **STOP trước 4.5**.
