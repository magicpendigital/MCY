<!-- plan-template v1 -->
# Kế hoạch — W1 trang giảng viên: thanh bên, cột Duyệt / Trên app, thẻ Theo dõi (T1), sửa tự tải lại

Trạng thái: đã duyệt hướng (Owner 28/11: "Làm tiếp W1", Q2/Q3 ngày 28/11). Lập trước khi sửa code. Áp migration và deploy Edge cần Owner yêu cầu riêng.

## 1. Mục tiêu
Trang giảng viên dễ dùng hơn và không làm mất chữ đang gõ. Owner 28/11 báo ba việc:
- Bấm một bài thì phần cấu hình hiện tận dưới danh sách, trông như app lỗi.
- Chuyển sang tab khác rồi quay lại thì trang workspace tải lại, mất nội dung đang sửa.
- Bài MCY cũ chưa có cách chia sẻ cho giảng viên khác. Việc này cần Owner quyết, xem mục 12.

W1 theo bảng G và mục W1 trong [backlog](../backlog/workspace-review-2026-11-27.md):
- thanh bên: Bài video, Khóa học, Theo dõi; nhóm Khác chứa Kịch bản nháp;
- danh sách có cột Duyệt và Trên app, kèm ô lọc trạng thái;
- thẻ Theo dõi (T1): lịch sử duyệt, khóa đang chứa bài, phiên bản học viên đang thấy. Dữ liệu đến từ một hàm đọc mới, chỉ đọc mục của chính giảng viên.

## 2. Tiêu chí xong
- Chuyển tab trình duyệt rồi quay lại, hoặc làm mới phiên đăng nhập, không xóa form đang gõ, trên cả trang giảng viên lẫn trang Owner. Có Playwright chứng minh.
- Bấm một bài thì chi tiết và form hiện ngay đầu vùng làm việc, cạnh danh sách khi màn rộng, phía trên danh sách khi màn hẹp. Không còn nằm dưới cùng.
- Có thanh bên với các mục Bài video, Khóa học, Theo dõi, Khác › Kịch bản nháp. Mục đang mở được đánh dấu bằng `aria-current`.
- Danh sách có cột Duyệt và Trên app, cùng ô lọc Tất cả / Nháp / Chờ duyệt / Cần sửa / Đã duyệt.
- Khi máy chủ chưa có hàm đọc mới, cột Trên app ghi thật thà "Chưa rõ". Không bao giờ đoán là đang hiện.
- Có migration `mcy_content_tracking` với PGlite rehearsal: giảng viên chỉ thấy mục của mình, Owner thấy tất cả, người lạ bị từ chối, không lộ người duyệt và lời khai duyệt, ACL chỉ `service_role`.
- Có action Edge `read_tracking` kèm test handler.
- Các lệnh xanh: `check:quick`, `npm test`, `check:ios15`, Playwright cho teacher content, workspace và Owner.

## 3. Phạm vi sửa
- Staff: `src/staff/TeacherContentPanel.tsx`, `src/staff/teacher.tsx` (thanh bên, sửa effect), `src/staff/owner.tsx` (sửa effect), `src/staff/ContentHubPanel.tsx` (đưa chi tiết lên trên), `src/staff/owner.css`.
- Backend: `supabase/migrations/<mới>_teacher_content_tracking.sql`, `supabase/functions/_shared/contentWorkspace.ts`.
- Tests: `tests/teacher-content.spec.ts`, `tests/teacher-tracking-rehearsal.cjs` (mới), `tests/teacher-control-plane-rehearsal.cjs` (chain guard), `tests/content-workspace-handler.test.mjs`, `scripts/run-suite.mjs` (chỉ khi cần thêm test vào danh sách).
- Mức rủi ro cao nhất: R3, vì có RPC mới đọc dữ liệu private.
- Hiện trạng: commit `ffb56cd`, cây sạch. Hành vi phải giữ: luồng soạn, gửi bài và khóa của S1; luồng Owner duyệt và bật hiển thị.

## 4. Cố ý không đụng
- Không đổi quyền sửa bài MCY, không chuyển đổi 38 bài, 3 khóa, 14 bài đọc. Việc đó cần Owner quyết (mục 12).
- Không đổi runtime bảo vệ và app học viên.
- Chưa làm T2 (đếm lượt xem). Chưa làm W2 (thẻ Giảng viên ở trang Owner).

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| `staff.html` › trang giảng viên | Bố cục và thanh bên | GV1; luồng S1 | Playwright teacher-content, teacher-workspace |
| `staff.html` › trang Owner | Effect phiên và vị trí chi tiết | Owner duyệt và bật | Playwright owner / content hub |
| Edge `owner-control-plane` | Thêm `read_tracking` | Các action cũ giữ nguyên | test handler |
| DB | Thêm 1 hàm đọc, không bảng mới | Hàm cũ giữ nguyên | rehearsal: ACL trước và sau |
| iOS 15 | Chỉ staff, không dùng `:has()` mới hay dvh | Bundle học viên | `check:ios15` |

## 6. Bảo mật
- Hàm `security definer`, `search_path=''`, EXECUTE chỉ `service_role`. Danh tính được kiểm lại bên trong hàm: chỉ Owner hoặc giảng viên còn hiệu lực. Giảng viên chỉ nhận mục do chính mình viết.
- Không trả reviewer_id, qualification, basis hay checklist cho giảng viên. Không trả dữ liệu học viên.
- Khóa chứa bài: giảng viên thấy khóa của chính mình, cộng khóa đang hiện công khai (tên đã công khai).

## 7. Hoàn tác
- Giao diện: revert commit. Hàm đọc chỉ thêm, gỡ bằng `drop function`. UI tự lùi về "Chưa rõ" nếu action không có.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Sửa effect phụ thuộc phiên (teacher, owner) và thêm test | agent | S |
| 2 | Thanh bên, chi tiết đặt cạnh hoặc trên danh sách, cột và ô lọc | agent | M |
| 3 | Migration, rehearsal, action Edge và test handler | agent | M |
| 4 | Thẻ Theo dõi đọc `read_tracking` | agent | S |
| 5 | Các cổng kiểm, merge vào main ở máy | agent | S |
| 6 | Áp migration và deploy Edge lên staging | agent, khi Owner yêu cầu | S |

## 9. Cách thử
1. Mở trang giảng viên, bấm "Soạn bài mới", gõ vài chữ. Chuyển sang tab khác vài phút rồi quay lại: chữ vẫn còn.
2. Bấm một bài trong danh sách: chi tiết hiện ngay bên phải, hoặc phía trên khi màn hẹp.
3. Dùng ô lọc "Chờ duyệt". Xem cột Duyệt và cột Trên app.
4. Sau khi áp migration: mở thẻ Theo dõi của một bài để xem lịch sử duyệt, khóa chứa bài, phiên bản học viên đang thấy.

## 10. Lệnh kiểm
- `npm run check:quick`
- `npm test`
- `npm run check:ios15`
- PGlite: `node --test tests/teacher-tracking-rehearsal.cjs tests/teacher-control-plane-rehearsal.cjs tests/teacher-course-group-rehearsal.cjs`
- `npx playwright test tests/teacher-content.spec.ts tests/teacher-workspace.spec.ts` (msedge)

## 11. Rủi ro còn lại
- Chưa thử trên Preview với GV1. Chưa thử iPhone iOS 15 thật (trang staff).
- Rehearsal PGlite không phải bằng chứng staging.

## 12. Cần duyệt
- Áp migration `teacher_content_tracking` và deploy Edge `owner-control-plane` lên mcy-staging.
- Push lên main.
- Chia sẻ bài MCY cho giảng viên khác (sửa hay chỉ xem lại) và chuyển 38 bài, 3 khóa, 14 bài đọc của MCY sang form chung. Việc này đụng quyết định đã chốt "giảng viên chỉ sửa bài của mình" và quy tắc phiên bản bất biến.

## Progress
- [x] 1 Sửa tự tải lại
- [x] 2 Bố cục
- [x] 3 Hàm đọc T1
- [x] 4 Thẻ Theo dõi
- [x] 5 Cổng kiểm, merge
- [x] 6 Áp staging (Owner 28/11: remote 20261128043923, Edge v18, đã push)
