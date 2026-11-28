<!-- plan-template v1 -->
# Kế hoạch — Mời giảng viên góp ý bài MCY (phương án A) và chuẩn hoá bài video MCY cũ

Trạng thái: đã duyệt hướng (Owner 28/11: "2. Đồng ý đề xuất. 3. Đồng ý theo đề xuất."). Ghi chú: migration và phần lớn code được viết trước khi có file kế hoạch này; đó là lỗi quy trình, đã ghi trong báo cáo. Áp migration, deploy Edge và push cần Owner yêu cầu riêng.

## 1. Mục tiêu
- (A) Owner mời một giảng viên đang hoạt động xem và góp ý một bài video hoặc khóa học MCY. Giảng viên chỉ xem và góp ý. Họ không sửa, không duyệt, và không làm thay đổi kết quả duyệt của Owner. Quy tắc đã chốt "giảng viên chỉ sửa bài của mình" giữ nguyên.
- (B) Bài video MCY cũ được đưa về form chung (mục tìm bài và thẻ) bằng cách tạo phiên bản mới. Phiên bản cũ không bị ghi đè. Owner duyệt từng phiên bản mới như thường.

## 2. Tiêu chí xong
- Có migration với các bảng private `mcy_content_shares`, `mcy_content_share_events`, `mcy_content_share_notes`. RLS bật, mọi quyền bị thu hồi.
- Có các RPC `share_set`, `share_read`, `shared_list`, `share_note`, `legacy_lessons`. Tất cả là definer, `search_path=''`, EXECUTE chỉ cho `service_role`, và kiểm lại danh tính bên trong.
- PGlite rehearsal chứng minh:
  - quyết định duyệt của Owner không đổi;
  - giảng viên không lưu bài và không duyệt được;
  - không tạo dòng nào trong reviewer_assignments;
  - góp ý trên phiên bản cũ bị từ chối (PT409);
  - lời mời bị thu hồi hoặc hết hạn thì bài ẩn khỏi giảng viên;
  - hash phiên bản cũ không đổi.
- Edge có 5 action mới, kèm test handler.
- Owner hub có mục "Mời giảng viên góp ý" trong chi tiết bài MCY, và màn "Chuẩn hoá bài cũ" (vùng gợi ý từ tên bài được ghi rõ là gợi ý, lưu từng bài, dừng ở lần từ chối đầu tiên).
- Trang giảng viên, mục "Duyệt nội dung được giao", có danh sách "Bài MCY được mời góp ý".
- Máy chủ cũ chưa có các action này thì không hiện lỗi và không hiện mục chia sẻ.
- Các lệnh `check:quick`, `npm test`, `check:ios15`, rehearsal và Playwright đều xanh.

## 3. Phạm vi sửa
- Backend: `supabase/migrations/20261128150000_content_review_shares.sql` (số phiên bản tạm), `supabase/functions/_shared/contentWorkspace.ts`.
- Staff: `src/staff/ContentSharing.tsx` (mới), `src/staff/TeacherSharedPanel.tsx` (mới), `src/staff/ContentHubPanel.tsx`, `src/staff/teacher.tsx`, `src/staff/owner.css`.
- Tests:
  - `tests/content-share-rehearsal.cjs` (mới);
  - `tests/teacher-control-plane-rehearsal.cjs` (chuỗi migration);
  - `tests/content-workspace-handler.test.mjs`;
  - `tests/teacher-content.spec.ts`;
  - `package.json` (script rehearsal).
- Mức rủi ro: R3 (bảng private mới và RPC mới).
- Hiện trạng: `df7679f` trên origin/main.

## 4. Cố ý không đụng
- Không cấp quyền sửa bài MCY cho giảng viên. Không dùng `mcy_content_reviewer_assign`, vì hàm đó cấp quyền quyết định và đặt lại quyết định của Owner.
- Không chuyển 14 bài đọc. Bài đọc là loại riêng, có công tắc riêng cho từng bài, và không có trường mục tìm bài hay thẻ.
- 3 khóa MCY đã đúng form chung (tóm tắt, danh sách bài, lưu ý), nên không cần phiên bản mới.
- Agent không tự ghi phiên bản mới thay Owner. Owner tự bấm trong hub bằng phiên của mình.
- Không đổi app học viên và runtime bảo vệ.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| Trang Owner › Nội dung | Mục mời góp ý, màn chuẩn hoá | Duyệt và bật hiển thị giữ nguyên | Playwright teacher-content, content-hub |
| Trang giảng viên › Duyệt nội dung được giao | Danh sách bài được mời | Phiếu duyệt được giao cũ | Playwright teacher-content |
| Edge `owner-control-plane` | 5 action mới | Action cũ giữ nguyên | test handler |
| DB | 3 bảng private, 5 RPC, 1 helper | Snapshot công khai chọn bản đang bật theo (item, hash), nên phiên bản mới chờ duyệt không làm ẩn bản cũ | rehearsal (ACL trước và sau) |
| iOS 15 | Chỉ staff, không dùng `:has()` mới hay dvh | Bundle học viên | `check:ios15` |

## 6. Bảo mật
- Chỉ Owner tạo hoặc thu hồi lời mời, và chỉ cho bài MCY loại video_lesson hoặc course_group. Người được mời phải là giảng viên đang hoạt động, đã xác minh email, không phải Owner. Lời mời có hạn 1–30 ngày.
- Mọi lần mời và thu hồi đều ghi nhật ký. Giới hạn 100 lần mỗi 24 giờ cho lời mời, 50 lần mỗi 24 giờ cho góp ý.
- Giảng viên chỉ thấy bài đang được mời và góp ý của chính mình. Họ không thấy lời khai duyệt và không thấy dữ liệu học viên.
- Góp ý chỉ nhận trên phiên bản mới nhất.

## 7. Hoàn tác
- UI: revert commit. Migration chỉ thêm đối tượng mới, gỡ bằng `drop function` và `drop table`. UI tự ẩn mục chia sẻ khi action không có.
- Phiên bản mới do chuẩn hoá không thay thế bản cũ. Bản đang hiện cho học viên vẫn hiện đến khi Owner duyệt và bật bản mới.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Migration và PGlite rehearsal | agent | M |
| 2 | Action Edge và test handler | agent | S |
| 3 | UI Owner (mời góp ý, chuẩn hoá) và UI giảng viên | agent | M |
| 4 | Playwright, các cổng kiểm, merge vào main ở máy | agent | S |
| 5 | Áp migration, deploy Edge, push | agent, khi Owner yêu cầu | S |
| 6 | Bấm chuẩn hoá và duyệt từng bài | Owner | M |

## 9. Cách thử
1. Trang Owner › Nội dung, mở một bài video MCY. Ở mục "Mời giảng viên góp ý", chọn giảng viên và thời hạn, rồi bấm "Mời góp ý".
2. Đăng nhập bằng giảng viên, mở "Duyệt nội dung được giao", đọc bài và gửi góp ý.
3. Quay lại bài đó ở trang Owner: góp ý hiện trong mục mời. Bấm "Thu hồi" thì giảng viên không còn thấy bài.
4. Bấm "Chuẩn hoá bài cũ", xem lại vùng gợi ý và thẻ của từng bài, chọn bài, bấm "Lưu và gửi duyệt" rồi xác nhận. Sau đó duyệt từng bài như thường và bật bản mới.

## 10. Lệnh kiểm
- `npm run check:quick`
- `npm test`
- `npm run check:ios15`
- PGlite: `node --test tests/content-share-rehearsal.cjs tests/teacher-control-plane-rehearsal.cjs tests/teacher-tracking-rehearsal.cjs tests/teacher-course-group-rehearsal.cjs`
- `npx playwright test tests/teacher-content.spec.ts tests/teacher-workspace.spec.ts tests/content-review.spec.ts tests/content-hub.spec.ts` (msedge)

## 11. Rủi ro còn lại
- Chưa áp lên staging. Rehearsal PGlite không phải bằng chứng staging.
- Vùng gợi ý đoán từ tên bài có thể sai, nên Owner phải xem lại từng bài.
- Chưa thử trên Preview với GV1. Chưa thử iPhone iOS 15 thật (trang staff).

## 12. Cần duyệt
- Áp migration `content_review_shares` và deploy Edge `owner-control-plane` lên mcy-staging.
- Push lên main.

## Progress
- [x] 1 Migration, rehearsal
- [x] 2 Edge, test handler
- [x] 3 UI Owner và giảng viên
- [ ] 4 Cổng kiểm, merge
- [ ] 5 Áp staging (chờ Owner)
- [ ] 6 Owner chuẩn hoá và duyệt
