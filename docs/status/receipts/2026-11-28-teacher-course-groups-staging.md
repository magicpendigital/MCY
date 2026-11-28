# Biên nhận: S1 khóa miễn phí của giảng viên lên mcy-staging (28/11)

Owner yêu cầu 28/11: "Push và áp migration". Kế hoạch: [S1](../../../plans/active/2026-11-27-teacher-course-groups-s1.md). Skill `mcy-supabase-rollout`.

## Điều kiện trước khi áp (chỉ đọc)

- Dự án `mcy-staging` (`mhumbczqrzutdnraafhs`), `ACTIVE_HEALTHY`, Postgres 17.6.
- Danh sách migration trên staging khớp tệp ở máy tới `20261127072022`. Không có migration chỉ có trên staging. Ba tệp chỉ có ở máy (`20261003031137`, `20261005004000`, `20261009181735`) vẫn không áp, như trước.
- `public.mcy_content_save_version`: 1 hàm; dòng kiểm loại của giảng viên có 2 lần, dòng tính hash có 1 lần (đúng như chặn lệch cần).
- Quyền: `security definer`, `search_path=""`, chủ `postgres`, EXECUTE chỉ `service_role` (anon, authenticated: không).
- Số đếm: 55 mục nội dung, 55 phiên bản, 0 khóa của giảng viên.

## Áp

- `apply_migration` tên `teacher_course_groups`: thành công. Version từ xa **`20261128030007`** (tệp viết là `20261127150000`, đã đổi tên ở máy).
- Không deploy Edge (không cần: Edge `owner-control-plane` đã nhận `course_group`).

## Đọc lại sau khi áp

| Kiểm | Kết quả |
|---|---|
| Dòng kiểm loại mới (`video_lesson`, `course_group`) | 2 lần; dòng cũ: không còn |
| Khối kiểm `course_lessons_not_own` | 1 lần |
| `security definer`, `search_path=""`, chủ | không đổi |
| EXECUTE anon / authenticated / PUBLIC / service_role | không / không / không / có (không đổi) |
| Mục nội dung / phiên bản / khóa giảng viên | 55 / 55 / 0 (không đổi) |
| Migration mới nhất | `20261128030007 teacher_course_groups` |

## Không chạy

- Không gọi thử hàm lưu trên staging (sẽ ghi dữ liệu thật). Ứng xử được chứng minh bằng tập dượt PGlite (`tests/teacher-course-group-rehearsal.cjs`), không phải bằng staging.
- Chưa thử với GV1 trên Preview; chưa thử iPhone iOS 15 thật.
- Không duyệt, không bật hiển thị thay Owner.
