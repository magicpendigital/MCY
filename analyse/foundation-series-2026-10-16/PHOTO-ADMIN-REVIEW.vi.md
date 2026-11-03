# Rà soát chéo bộ ảnh và bản mẫu quản trị

16/10/2026 · Phạm vi: `preview.html/js/css`, `photo-media.js`, `serve-preview.mjs`, `admin-preview.html/js/css` và `CONTENT-ADMIN-PROPOSAL.vi.md` trong thư mục bản xem trước. Người rà soát không soạn các file triển khai này hoặc tạo bộ ảnh. Chỉ rà soát source, logic mô phỏng và pixels ảnh; không gọi backend, cấp quyền hoặc kiểm live.

## Kết quả cuối

**Không còn P1/P2 được phát hiện trong phạm vi bản mẫu cục bộ.** Ba vấn đề có ảnh hưởng thực tới việc đánh giá thiết kế đã được gửi lại người triển khai và đã đóng qua đối chiếu source cuối:

| Vấn đề đã phát hiện | Cách đóng trong bản cuối |
|---|---|
| Thumbnail photo-draft mở nhầm hình vẽ r2 khi phóng to | Modal hiện dùng cùng đường dẫn photo với gallery hiện tại; mở từ lịch sử r2 thì dùng đúng bộ drawing. Tiêu đề phân biệt hai bộ. |
| Thu hồi/hết hạn assignment r3 khi tác giả đang sửa r4 không rút publication r3 tương ứng | Handler lấy `assignedRevision` làm bản bị tác động; so publication pointer với bản đó, giữ bản nháp hiện tại. UI nói rõ assignment đang thuộc revision nào. |
| Giao lại assignment của bản đang published xóa quyết định nhưng vẫn giữ bản hiển thị và mắc ở published | Lặp cùng người/bản/thời hạn là no-op. Thay thời hạn của assignment hiện tại đang hiển thị rút pointer, chuyển về submitted và cần duyệt/kiểm cuối lại. |

Các sửa bổ sung được kiểm cùng vòng: lưu snapshot giữ thật `body`/`rights` trong bộ nhớ thay vì chỉ ghi một dòng audit; publisher nhìn được căn cứ quyền tác giả cung cấp; bản đọc tham chiếu được ghi rõ là photo-draft r3 và chưa đồng bộ sửa r4 từ admin mock.

## Nội dung đã đối chiếu

- **Mười ảnh:** đã xem trực tiếp toàn bộ 5 ảnh Đứng và 5 ảnh Bò–Mèo. Nhân vật, trang phục và không gian nhất quán; các góc cận/toàn thân phù hợp ý đồ. Alt overlay mô tả áo olive, quần ngà, thảm sage, không dùng mô tả màu trang phục của bộ hình vẽ cũ. Đây là kiểm thị giác biên tập, không phải thẩm định yoga/giải phẫu hoặc quyền sử dụng thực tế.
- **Reader:** chọn bộ ảnh/hình ở công cụ người xem; step resolver và zoom vẫn dùng cùng media của bước hiện tại. Nội dung và vị trí đọc được giữ khi đổi bộ. CSS dùng `object-fit: contain`; không đổi bài đọc thành record thực hành.
- **Phiên bản:** đổi media được trình bày như photo-draft mới; không mang quyết định r2 sang r3. Sửa copy tạo revision mới, hủy readiness của bản đang sửa nhưng giữ publication cũ cho tới hành động phù hợp. Mô phỏng tách revision đang sửa và revision đang hiển thị.
- **Quyền:** tác giả, người duyệt yoga, publisher và Owner được mô tả với trách nhiệm khác nhau. Vai trò, chuyên môn và capability của các nhân vật đều là giả định được ghi rõ. Chuyển góc nhìn là công cụ review thiết kế; không phải đăng nhập hoặc tự nâng quyền.
- **Duyệt và phát hành:** yoga approval, editorial/rights check và publication là các quyết định riêng. Controls kiểm đúng revision/assignment trong mô phỏng; chỉ mô tả state cục bộ, không chứng minh enforcement server.
- **Đề xuất kiến trúc:** tài liệu phân biệt workflow A đã có bằng chứng staging hẹp với workflow B còn local candidate. `illustrated_lesson`, publisher capability, private media và adapter Miu đều được ghi là phần cần thiết kế/triển khai riêng. Không có khẳng định CMS của series đã hoạt động.
- **Phạm vi dữ liệu:** CSP chặn kết nối; state ở bộ nhớ. Server chỉ bind localhost, cho GET/HEAD, whitelist page/asset và kiểm đường dẫn trong thư mục preview. Không có upload hoặc action cloud trong bản mẫu.

## Kiểm và giới hạn

Syntax `node --check` của `preview.js`, `admin-preview.js`, `photo-media.js` và `serve-preview.mjs` không báo lỗi, command batch exit 0. Đã đọc đối chiếu các handler cuối với tình huống nguồn; không chạy fixture DOM hoặc browser qua terminal.

Browser QA, viewport, bàn phím, focus và thao tác end-to-end của bản cuối thuộc bằng chứng người triển khai. Rà soát này không tự chứng nhận những phần đó. Expiry được minh họa bằng ngày giả và nút thử; publisher grant là giả định. Bản mock chưa có chính sách runtime/retention/cache/offline hoặc enforcement thực cho các capability đó.

Ảnh, nội dung hướng dẫn, phân công thực và quyền phát hành vẫn cần review chuyên môn/quyền và operation riêng trước tích hợp hoặc learner exposure. Rủi ro cao nhất thuộc R3 về nội dung sức khỏe/quyền; kết quả peer review giao diện không thay các gate đó.
