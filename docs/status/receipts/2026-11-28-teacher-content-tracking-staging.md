# Biên nhận: W1 / T1 "Theo dõi" lên mcy-staging (28/11)

Owner yêu cầu 28/11: "Áp, deploy và push". Kế hoạch: [W1](../../../plans/active/2026-11-28-teacher-workspace-w1.md). Skill `mcy-supabase-rollout`.

## Điều kiện trước khi áp (chỉ đọc)

- Dự án `mcy-staging` (`mhumbczqrzutdnraafhs`), `ACTIVE_HEALTHY`, Postgres 17.6.
- Danh sách migration trên staging khớp tệp ở máy tới `20261128030007`. Không có migration chỉ có trên staging. Ba tệp chỉ có ở máy (`20261003031137`, `20261005004000`, `20261009181735`) vẫn không áp, như trước.
- `public.mcy_content_tracking` chưa tồn tại.
- Số đếm: 55 mục nội dung, 55 phiên bản, 55 sự kiện nội dung, 19 sự kiện duyệt.

## Áp

- `apply_migration` tên `teacher_content_tracking`: thành công. Version từ xa **`20261128043923`** (tệp viết là `20261128120000`, đã đổi tên ở máy; tập dượt PGlite chạy lại đạt 13/13).

## Đọc lại sau khi áp

| Kiểm | Kết quả |
|---|---|
| `security definer`, `search_path=""`, chủ | có, `""`, `postgres` |
| EXECUTE anon / authenticated / PUBLIC / service_role | không / không / không / có (ACL `{postgres=X/postgres,service_role=X/postgres}`) |
| Mục / phiên bản / sự kiện / sự kiện duyệt | 55 / 55 / 55 / 19 (không đổi) |
| Migration mới nhất | `20261128043923 teacher_content_tracking` |
| Một lần gọi chỉ đọc với tư cách Owner | vai `owner`, 41 mục (38 bài video + 3 khóa), 0 mục đang hiện trên app |

## Edge

- `npx supabase functions deploy owner-control-plane --project-ref mhumbczqrzutdnraafhs --use-api --yes`: thành công.
- `list_edge_functions`: `owner-control-plane` version 18, ACTIVE, `verify_jwt: true`.
- Gọi `read_tracking` không có đăng nhập: 401.
- Đã hoàn lại `supabase/.temp/cli-latest` do CLI sửa.

## Không chạy

- Chưa gọi với tư cách giảng viên trên staging; chưa thử trên Preview với GV1; chưa thử iPhone iOS 15 thật.
- Không ghi dữ liệu, không duyệt, không bật hiển thị thay Owner.
