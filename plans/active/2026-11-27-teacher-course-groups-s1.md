<!-- plan-template v1 -->
# Kế hoạch — S1: giảng viên đề xuất khóa miễn phí từ bài video của mình

Trạng thái: đã duyệt (Owner 27/11: "GV tự tạo khóa miễn phí: có, GV đề xuất, Owner duyệt như bài" và "Sau khi push triển khai bước tiếp theo"). Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận (intake) theo [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md). Kiểm bằng `npm run check:plan plans/active/2026-11-27-teacher-course-groups-s1.md`. Khi xong, cập nhật `PLAN.md`.

## 1. Mục tiêu
Lát S1 trong [rà soát use case](../backlog/teacher-content-use-cases-2026-11-27.md) §4. Khi rà soát tìm ra một chỗ chặn: ảnh chụp công khai (`buildManifest`) chỉ đưa ra những bài video **nằm trong một khóa (`course_group`) đã duyệt và đang hiện**. Bài của giảng viên dù Owner đã duyệt vẫn không tới học viên nếu Owner không tự gom vào khóa. Hiện máy chủ chỉ cho giảng viên lưu `video_lesson`. S1 cho giảng viên tạo "khóa miễn phí" gồm các bài video **của chính mình**, gửi Owner duyệt như một bài. Owner duyệt, yêu cầu sửa và bật hiển thị bằng màn Nội dung sẵn có.

## 2. Tiêu chí xong
- Ở thẻ "Bài video của tôi" có mục "Khóa miễn phí của tôi" với nút "Tạo khóa mới". Form 3 bước theo bảng G của canvas (Owner duyệt 28/11): (1) tên khóa, mô tả; (2) chọn bài video của chính giảng viên, mỗi bài kèm trạng thái, sắp thứ tự (Lên/Xuống), dòng "x/y bài đã được Owner duyệt"; (3) xem trước như học viên thấy, bài chưa duyệt ghi "chưa hiện". Chi tiết bài có lối tắt "Tạo khóa với bài này". Lưu nháp, Lưu và gửi duyệt, Sửa (phiên bản mới) hoạt động như với bài.
- Chưa có bài video nào thì không tạo được khóa; trang nói rõ vì sao.
- Máy chủ (SQL) nhận `course_group` của giảng viên chỉ khi:
  - mọi `lessonIds` là bài `video_lesson` do chính giảng viên đó soạn;
  - có ít nhất 1 bài;
  - không có `guidance` (lợi ích/lưu ý sức khỏe là lời MCY duyệt; giảng viên không tự gắn "đã duyệt").
  Ngoài các trường hợp đó, máy chủ từ chối với `22023` (Edge trả `invalid_content`). Giảng viên vẫn không lưu được `screen_text` hay `reading_unit`.
- Owner không sửa khóa của giảng viên (luật cũ `teacher_content_is_reviewed_not_edited` giữ nguyên). Owner duyệt khóa ở màn Nội dung như bài.
- Tập dượt PGlite trên đúng chuỗi migration của staging cộng migration mới:
  - ứng xử như trên;
  - quyền hiệu lực của mọi bảng và hàm không đổi;
  - khóa đã duyệt và bật thì ra ảnh chụp với tên giảng viên.
- `npm run check:quick`, `npm test`, `npm run check:ios15`, spec giảng viên PASS.

## 3. Phạm vi sửa
- Mới `supabase/migrations/<version>_teacher_course_groups.sql`: vá tại chỗ `public.mcy_content_save_version`, có chặn lệch (drift guard) giống `20261108162119_content_display.sql` §5. Mới `tests/teacher-course-group-rehearsal.cjs` + script `test:teacher-course-group-rehearsal`.
- `src/staff/TeacherContentPanel.tsx` (mục khóa, bước 4 trong hướng dẫn); `tests/teacher-content.spec.ts`; `PLAN.md`; bản rà soát use case.
- Mức rủi ro cao nhất: **R3** theo [review matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md), vì đổi hàm `security definer` quyết định ai được ghi nội dung (vai trò, quyền ghi).
- Hiện trạng: lập khi `main` = `origin/main` = `bf64cab`; làm tiếp 28/11 trên `main` = `origin/main` = `e018b11` (đã có W0). Không có tệp dở của người khác. Hành vi phải giữ: luồng bài video của giảng viên, luồng Owner soạn/duyệt khóa MCY, ảnh chụp công khai.

## 4. Cố ý không đụng
- Edge `owner-control-plane`: đã nhận `course_group` (`authorableKinds`) và kiểm dạng payload. Lỗi mới dùng mã `22023` nên Edge trả `invalid_content` sẵn có. **Không cần deploy Edge.**
- `buildManifest` và hàm ảnh chụp: khóa giảng viên đi qua đúng đường của khóa MCY, kèm tên giảng viên theo chính sách `show_teacher_names`.
- Màn Nội dung của Owner (`ContentHubPanel.tsx`): đã hiện, duyệt, ghi chú và bật hiển thị mọi loại nội dung của giảng viên.
- Khóa trả phí, tiến độ học viên trên tài khoản, "bài tiếp theo" (P1/P2, F); ảnh bìa khóa (S3).
- Khác bản rà soát: bản rà soát viết "từ bài đã duyệt". Ở đây giảng viên chọn được cả bài chưa duyệt, để soạn khóa trong lúc chờ. Học viên vẫn chỉ thấy bài đã duyệt và đang hiện (ảnh chụp lọc). Trang ghi rõ trạng thái từng bài.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| RPC `mcy_content_save_version` | Giảng viên lưu được `course_group` (có kiểm sở hữu bài, cấm `guidance`) | Owner lưu khóa MCY; giảng viên lưu bài video; khóa cũ của Owner có thể chứa bài giảng viên | Tập dượt PGlite: ca được nhận, ca bị từ chối, Owner không đổi |
| Quyền hiệu lực (ACL, RLS, `security definer`, `search_path`) | Không đổi (`create or replace` giữ ACL) | Mọi vai trò | Tập dượt so sánh ảnh chụp ACL trước và sau |
| Ảnh chụp công khai `content-published/manifest.json` | Có thể thêm khóa của giảng viên sau khi Owner duyệt và bật | Học viên (Khám phá) | Tập dượt gọi `mcy_content_snapshot` + `buildManifest` |
| Trang giảng viên (`TeacherContentPanel`) | Mục khóa mới, bước 4 trong hướng dẫn | Giảng viên | `teacher-content.spec.ts` |
| Màn Nội dung của Owner | Có thêm mục "Nhóm khóa" do giảng viên soạn | Owner | Mã sẵn có xử lý theo `author_kind`; không đổi |
| iOS 15 | Mã TSX mới | Bundle nhân sự | `check:ios15` |

## 6. Bảo mật
- Quyền ghi được kiểm ở SQL (lớp cuối):
  - sở hữu từng bài theo `author_id = p_actor_id` và `author_kind = 'teacher'`;
  - kiểm lại vai trò sau khi chờ khóa (advisory lock) như cũ;
  - không đọc dữ liệu học viên.
- Không có bảng mới. Không đổi grant. Không có bí mật, thư viện mới hay thao tác ra ngoài trong lúc làm.
- Giảng viên không thể chèn bài của người khác hay bài MCY vào khóa của mình. Họ cũng không tự gắn nhãn "đã duyệt" (`guidance.reviewed`).

## 7. Hoàn tác
- Trước khi áp: revert commit. Sau khi áp lên staging: một migration mới đưa hai dòng kiểm loại về `p_kind <> 'video_lesson'` và bỏ khối kiểm khóa. Khóa giảng viên đã lưu vẫn ở kho (phiên bản bất biến). Owner tắt hiển thị bằng công tắc sẵn có.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Migration vá tại chỗ + tập dượt PGlite (quyền, sở hữu, ảnh chụp, ACL) | agent | M |
| 2 | Mục "Khóa miễn phí của tôi" trong `TeacherContentPanel` | agent | M |
| 3 | Spec Playwright + cổng | agent | S |
| 4 | PLAN, commit, gộp vào `main` ở máy | agent | S |
| 5 | Áp migration lên `mcy-staging` (skill `mcy-supabase-rollout`), đổi tên tệp theo version từ xa, biên nhận | agent, **chỉ khi Owner yêu cầu** | S |

## 9. Cách thử
1. Sau khi Owner cho push và áp migration: giảng viên mở trang giảng viên, có ít nhất một bài video.
2. Ở mục "Khóa miễn phí của tôi" bấm "Tạo khóa mới", đặt tên, mô tả, chọn bài, sắp thứ tự, bấm "Lưu và gửi duyệt".
3. Owner mở Nội dung, lọc "Do giảng viên soạn", thấy "Nhóm khóa" của giảng viên. Owner duyệt từng bài và khóa, rồi bật hiển thị.
4. Học viên thấy khóa ở Khám phá với tên giảng viên (nếu chính sách hiện tên đang bật).

## 10. Lệnh kiểm
- `npm run check:quick`, `npm test`, `npm run check:ios15`
- `MCY_PGLITE_MODULE_PATH=… node --test tests/teacher-course-group-rehearsal.cjs tests/content-foundation-rehearsal.cjs tests/content-publication-rehearsal.cjs tests/teacher-control-plane-rehearsal.cjs`
- `npx playwright test tests/teacher-content.spec.ts tests/teacher-workspace.spec.ts` (msedge)

## 11. Rủi ro còn lại
- PGlite không phải Postgres của Supabase. Áp lên staging phải đọc lại hàm và quyền (skill `mcy-supabase-rollout`). Thử thật với GV1 và iPhone iOS 15 thật: CHƯA CHẠY.
- Sau khi push mà chưa áp migration: nút tạo khóa sẽ bị máy chủ từ chối (`content_kind_not_allowed`). Trang hiện câu giải thích, không mất dữ liệu.

## 12. Cần duyệt
- Push lên `main` (Preview): chờ Owner yêu cầu.
- Áp migration lên `mcy-staging`: chờ Owner yêu cầu. Không deploy Edge (không cần).

## Progress
- [x] 1 migration + tập dượt (PGlite 24/24 cùng ba bản tập dượt kề; bản `teacher-control-plane` ghi S1 là "chưa lên staging")
- [x] 2 giao diện (form 3 bước, x/y, lối tắt; 28/11)
- [x] 3 test và cổng (`teacher-content.spec.ts` 10/10, `check:quick`, `npm test`, `check:ios15` PASS)
- [x] 4 PLAN, commit, gộp vào `main` ở máy (28/11)
- [x] 5 áp lên staging (Owner 28/11; version `20261128030007`; [biên nhận](../../docs/status/receipts/2026-11-28-teacher-course-groups-staging.md))
- [ ] 6 Owner/GV1 thử trên Preview
