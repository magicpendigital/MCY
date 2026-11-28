# Biên nhận: mời giảng viên góp ý bài MCY và chuẩn hoá bài cũ lên mcy-staging (28/11)

Owner yêu cầu 28/11: "Áp, deploy và push". Kế hoạch: [mời góp ý và chuẩn hoá](../../../plans/active/2026-11-28-mcy-content-share-and-standardise.md). Skill `mcy-supabase-rollout`.

## Điều kiện trước khi áp (chỉ đọc)

- Dự án `mcy-staging` (`mhumbczqrzutdnraafhs`), `ACTIVE_HEALTHY`.
- Migration trên staging khớp tệp ở máy tới `20261128043923`; không có migration chỉ có trên staging.
- Ba bảng `private.mcy_content_share*` và năm RPC mới chưa tồn tại.
- Số đếm: 55 mục, 55 phiên bản, 15 trạng thái duyệt, 19 sự kiện duyệt, 55 sự kiện nội dung; 38 bài video MCY chưa có mục tìm bài.

## Áp

- `apply_migration` tên `content_review_shares`: thành công. Version từ xa **`20261128053426`** (tệp viết là `20261128150000`, đã đổi tên ở máy; rehearsal PGlite chạy lại đạt 20/20).

## Đọc lại sau khi áp

| Kiểm | Kết quả |
|---|---|
| 3 bảng mới: chủ, RLS | `postgres`, bật |
| Quyền bảng anon / authenticated / service_role | không / không / không |
| 5 RPC public: `security definer`, `search_path=""`, chủ | có, `""`, `postgres` |
| EXECUTE 5 RPC anon / authenticated / service_role | không / không / có |
| Helper `private.mcy_content_is_teacher`: EXECUTE cả ba vai | không |
| Mục / phiên bản / trạng thái duyệt / sự kiện duyệt / sự kiện nội dung | 55 / 55 / 15 / 19 / 55 (không đổi) |
| Lời mời / phân công duyệt | 0 / 4 (không tạo phân công mới) |
| Gọi chỉ đọc `mcy_content_legacy_lessons` với tư cách Owner | 38 bài |

## Edge

- `npx supabase functions deploy owner-control-plane --project-ref mhumbczqrzutdnraafhs --use-api --yes`: thành công.
- `list_edge_functions`: `owner-control-plane` version 19, ACTIVE, `verify_jwt: true`.
- Gọi `legacy_lessons` không có đăng nhập: 401.
- `supabase/.temp` không có thay đổi cần hoàn lại.

## Không chạy

- Chưa mời GV1 thật, chưa gọi với tư cách giảng viên trên staging, chưa thử trên Preview, chưa thử iPhone iOS 15 thật.
- Không ghi lời mời, góp ý hay phiên bản mới; không duyệt, không bật hiển thị thay Owner.
