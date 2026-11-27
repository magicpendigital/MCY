<!-- plan-template v1 -->
# Kế hoạch — S0: trang giảng viên mở đúng chỗ soạn bài video

Trạng thái: đã duyệt (Owner 27/11: "Làm S0 ngay"); đã push lên `main` 27/11, chờ Owner/giảng viên thử. Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận (intake) theo [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md). Kiểm bằng `npm run check:plan plans/active/2026-11-27-teacher-authoring-s0.md`. Khi xong, cập nhật `PLAN.md`.

## 1. Mục tiêu
Owner 27/11: giảng viên thử đăng nhập được nhưng "chưa có mục cho phép nhập link youtube bài giảng". Ô YouTube đã có ở thẻ "Bài video của tôi", nhưng thẻ mở sẵn là kho "Soạn bài" cũ không có video và không xuất bản được. Lát S0 trong [rà soát use case](../backlog/teacher-content-use-cases-2026-11-27.md) §4 chỉ sửa giao diện trang giảng viên để giảng viên vào thẳng chỗ soạn bài video, dán được cả link và xem thử video trước khi lưu. Kèm theo: ô mời giảng viên nói trung thực khi máy chủ trả trạng thái lạ (lỗi thẻ cũ ngày 27/11).

## 2. Tiêu chí xong
- Mở trang giảng viên (đã đăng nhập) → thẻ "Bài video của tôi" được chọn sẵn; thẻ cũ đổi tên "Kịch bản nháp" và có một câu nói rõ chưa gửi duyệt, chưa xuất bản.
- Ô "Link hoặc mã video YouTube" nhận link `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`, `/embed/…`, `/live/…` hoặc mã 11 ký tự; lưu đi đúng mã 11 ký tự; link sai báo lỗi tại chỗ, không gọi máy chủ.
- Nút "Xem thử video" chỉ nạp trình phát `youtube-nocookie.com` khi bấm (giống ứng dụng học viên, không tải YouTube trước khi bấm).
- Hướng dẫn 3 bước ở đầu thẻ.
- Tài khoản chưa có lời mời vẫn thấy "Chưa có lời mời giáo viên." ở thẻ mở sẵn; lời mời vẫn được nhận tự động khi vào trang (không đổi luồng `accept_invite`).
- Ô mời: trạng thái 200 lạ → thông báo trung lập "máy chủ đã trả lời nhưng trang này là bản cũ, hãy tải lại trang", không báo "chưa gửi được".
- `npm run check:quick`, `npm test`, `npm run check:ios15` và các spec giảng viên/mời PASS.

## 3. Phạm vi sửa
- `src/staff/teacher.tsx`, `src/staff/TeacherContentPanel.tsx`, `src/staff/TeacherInvitePanel.tsx`, mới `src/staff/youtubeInput.ts`; test `tests/teacher-content.spec.ts`, `tests/teacher-workspace.spec.ts`, `tests/teacher-invite.spec.ts`; `PLAN.md`. Vùng Staff + Tests.
- Mức rủi ro cao nhất: R1 theo [review matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md), vì chỉ đổi giao diện nhân sự; không đổi dữ liệu, Edge, migration, quyền.
- Hiện trạng: commit `054ea8b` (main), nhánh `claude/teacher-s0-authoring-ux`; không có tệp dở của người khác.

## 4. Cố ý không đụng
- Edge `owner-control-plane`, `contentWorkspaceContract.ts` (máy chủ vẫn chỉ nhận mã 11 ký tự; tách mã làm ở trình duyệt).
- Kho "Kịch bản nháp" giữ nguyên chức năng (quyết định §5 Q2 của bản rà soát còn chờ).
- Ứng dụng học viên, runtime bảo vệ.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| `staff.html?workspace=teacher` | Thẻ mặc định, tên thẻ, hướng dẫn | Giảng viên; nhận lời mời tự động vẫn chạy ở effect phiên (không phụ thuộc thẻ) | `teacher-workspace.spec.ts` |
| Thẻ "Bài video của tôi" khi lời mời chưa được nhận | Chờ xác minh quyền xong mới gọi `list_content` | Giảng viên mới: tránh lỗi "chưa có quyền" do gọi trước khi nhận lời mời | spec mới |
| Trình phát YouTube trong trang nhân sự | Nạp khi bấm | Quyền riêng tư giống ứng dụng học viên | spec chặn `youtube-nocookie` |
| Ô mời của Owner | Trạng thái lạ | Owner | `teacher-invite.spec.ts` |
| iOS 15 | Mã TS mới (URL, regex không lookbehind) | Trang nhân sự cùng bundle | `check:ios15` |

## 6. Bảo mật
- Link dán vào là đầu vào không tin cậy: chỉ lấy mã khớp `[A-Za-z0-9_-]{11}` từ host YouTube đã biết; iframe chỉ dựng từ mã đã kiểm, luôn trên `youtube-nocookie.com`. Không bí mật, không thao tác ra ngoài, không thư viện mới.

## 7. Hoàn tác
- Revert commit của nhánh; không có dữ liệu hay cấu hình nào cần gỡ.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Tách mã YouTube + xem thử + hướng dẫn trong `TeacherContentPanel` | agent | S |
| 2 | Thẻ mặc định, tên thẻ, chờ xác minh quyền trong `teacher.tsx` | agent | S |
| 3 | Trạng thái lạ ở ô mời | agent | S |
| 4 | Test + cổng | agent | S |
| 5 | PLAN, commit, gộp vào main ở máy | agent | S |

## 9. Cách thử
1. Sau khi Owner cho push, mở trang giảng viên bằng tài khoản giảng viên: thẻ "Bài video của tôi" được chọn sẵn.
2. Bấm "Soạn bài mới", dán link YouTube của video trên kênh mình, bấm "Xem thử video": video hiện ra.
3. Điền tóm tắt, thời lượng, bấm "Lưu và gửi duyệt"; Owner thấy bài ở mục Nội dung.

## 10. Lệnh kiểm
- `npm run check:quick`, `npm test`, `npm run check:ios15`
- `npx playwright test tests/teacher-content.spec.ts tests/teacher-workspace.spec.ts tests/teacher-invite.spec.ts` (msedge)

## 11. Rủi ro còn lại
- Chưa thử trên staging với tài khoản giảng viên thật tới khi Owner cho push; iPhone iOS 15 thật CHƯA CHẠY.

## 12. Cần duyệt
- Push lên `main` (Preview) để giảng viên dùng: chờ Owner yêu cầu.

## Progress
- [x] 1–3 mã
- [x] 4 test và cổng: `check:quick`, `npm test`, `check:ios15` (tĩnh) PASS; Playwright msedge 21/21 PASS (3 spec giảng viên/mời)
- [x] 5 PLAN, commit, gộp vào `main` ở máy
- [x] Owner cho push (27/11): `check:ios15` PASS, đã lên `origin/main` (`bf64cab`)
- [ ] Owner/giảng viên thử trên Preview
