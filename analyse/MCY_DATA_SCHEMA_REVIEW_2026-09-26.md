# MCY — rà soát và cập nhật cấu trúc dữ liệu

Ngày: 26/09/2026  
Database: Supabase `mcy-staging` (`mhumbczqrzutdnraafhs`)  
Migration đã áp dụng: `operational_controls`

## 1. Kết luận rà soát

Schema hiện tại đã mô hình hóa tốt vòng lặp chính của học viên:

`checkins → daily_dialogues → practice_plans → practice_runs → practice_reflections`.

Phần nội dung cũng đã tách đúng các lớp `session_versions`, `session_segments`, `media_assets`, `courses`, `editorial_versions`, `editorial_publications`, taxonomy và review/publication events. Các bảng dữ liệu học viên đã bật RLS và có khóa ghép `id + user_id` ở những quan hệ quan trọng.

Các thiếu hụt ảnh hưởng trực tiếp tới prototype tài khoản, teacher workspace và owner console là:

1. Chưa có role assignment theo phạm vi; không nên suy luận quyền từ email hoặc metadata của user.
2. Chưa có quan hệ teacher–learner và cơ chế cấp quyền chia sẻ theo thời gian/trường dữ liệu.
3. `user_consents` hiện phù hợp cho compatibility nhưng chưa phải nhật ký append-only để chứng minh lịch sử đồng ý/rút lại.
4. Chưa có data request (export/delete/correct), support ticket, audit event và idempotency ledger.
5. Chưa có feature flag, device/notification preference và workspace invite cho owner mode.
6. Nội dung JSON chưa có registry/schema và validation run để chặn publish khi block lỗi.
7. Các thay đổi bất biến cho public content và teacher activation cần một migration riêng có test API; không nên gộp cùng control plane.

## 2. Phần đã cập nhật vào database

Migration mới chỉ bổ sung bảng trong schema `private`; không sửa/xóa bảng, dữ liệu hay RLS policy public hiện hữu.

| Nhóm | Bảng | Vai trò |
|---|---|---|
| Quyền và chia sẻ | `role_assignments` | Vai trò owner, security admin, content editor/reviewer, teacher, support, finance, analyst, growth; có `scope_type`, `scope_id`, thời hạn và người giao. |
| Quyền và chia sẻ | `teacher_assignments` | Quan hệ teacher–learner theo phạm vi `checkins`, `plans`, `runs`, `reflections`, `course` hoặc toàn bộ lịch sử. |
| Quyền và chia sẻ | `share_grants` | Quyền được learner cấp cho teacher/support, có `fields[]`, thời hạn, trạng thái và liên kết consent. |
| Đồng ý | `consent_events` | Sự kiện grant/revoke theo purpose và policy version, hỗ trợ idempotency. |
| Quyền riêng tư | `data_requests`, `data_request_events` | State machine cho export, delete, correct và lịch sử chuyển trạng thái. |
| Hỗ trợ | `support_tickets`, `support_messages` | Ticket, mức ưu tiên, phân công và nội dung user/internal. |
| Audit | `audit_events` | Actor, hành động, object, outcome, request id và metadata đã redacted. |
| Vận hành | `feature_flags`, `feature_flag_events` | Bật/tắt, rollout phần trăm, targeting và lịch sử thay đổi cho owner console. |
| Vận hành | `job_runs` | Hàng đợi/idempotency cho export, media processing, notification và AI jobs. Unique `(job_type, idempotency_key)` chống chạy lặp side effect. |
| Nội dung | `content_schema_registry`, `content_validation_runs` | Registry schema cho session/editorial và kết quả kiểm tra trước review/publish. |
| Tài khoản | `notification_preferences`, `user_devices`, `push_endpoints` | Cài đặt thông báo, thiết bị và token push được lưu dạng ciphertext + hash dedupe. |
| Owner access | `workspace_invites` | Invite theo vai trò/phạm vi; chỉ lưu hash email và hash token. |

Tổng cộng: **18 bảng mới**, đều ở `private` và đều đã bật RLS deny-by-default.

## 3. Quan hệ dữ liệu chính

```text
auth.users
  ├─ role_assignments
  ├─ teacher_assignments ──┐
  ├─ share_grants           ├─ quyền đọc projection do server tạo
  ├─ consent_events ───────┘
  ├─ data_requests → data_request_events
  ├─ support_tickets → support_messages
  ├─ audit_events
  ├─ notification_preferences
  ├─ user_devices → push_endpoints
  └─ workspace_invites

content_schema_registry → content_validation_runs
feature_flags → feature_flag_events (liên kết logic bằng flag_key)
job_runs → aggregate_type + aggregate_id (liên kết logic để dùng chung cho nhiều loại job)
```

Các bảng quan hệ và trạng thái được chuẩn hóa; JSONB chỉ dùng cho metadata, targeting, quiet hours, redacted context, schema và validation errors. Điều này giữ truy vấn lọc/phân quyền ở cột có index, không biến database thành một document store khó kiểm soát.

## 4. Tối ưu truy cập và hiệu năng

- Lookup role theo `(user_id, status, starts_at)`.
- Lookup teacher theo cả chiều teacher và learner để phục vụ teacher workspace và learner settings.
- Share grant có index recipient/learner + expiry để kiểm tra quyền nhanh và không quét lịch sử.
- Data request có index `(user_id, status, requested_at)`; job queue có partial index chỉ trên `status = 'queued'`.
- Audit có index theo target và actor; không index toàn bộ JSON metadata.
- Validation lấy bản kiểm tra mới nhất theo `(content_kind, content_version_id, checked_at desc)`.
- Push token không dùng plaintext làm khóa; hash phục vụ dedupe, ciphertext phục vụ gửi notification và phải giải mã ở server bằng KMS.
- Không tạo index dư thừa trên các bảng chưa có workload; các index hiện có của schema lõi được giữ nguyên để không làm tăng write cost ngoài nhu cầu.

## 5. Biên bảo mật đã kiểm chứng

- Schema `private` không có quyền `USAGE` cho `anon` hoặc `authenticated`; client không thể gọi trực tiếp các bảng mới.
- 18/18 bảng mới có `relrowsecurity = true`.
- Migration không chạm dữ liệu public; staging hiện có 0 auth user, 0 profile, 0 session, 0 editorial version và 0 role assignment.
- Sau migration `operational_fk_indexes`, Supabase performance advisor không còn finding `unindexed_foreign_keys`; chỉ còn thông báo `unused_index` do staging chưa có workload thật.
- Security advisor còn finding `rls_enabled_no_policy` ở các bảng private và bảng privileged hiện hữu. Đây là trạng thái deny-by-default có chủ ý; các policy client sẽ chỉ được thêm cho projection/RPC đã kiểm thử, không mở nguyên bảng.
- Client chỉ dùng publishable key; service role chỉ được dùng trong server/API.
- Server phải trả về projection đã được lọc theo `share_grants.fields`, không cấp quyền đọc nguyên bảng health history cho teacher.

## 6. Phần hardening cần tách thành gate tiếp theo

Migration đầu tiên đã thử gộp các thay đổi sau nhưng bị safety review từ chối vì blast radius lớn. Thiết kế vẫn giữ lại, nhưng chỉ nên áp dụng sau khi API contract tests hoàn tất:

1. Trigger chặn teacher tự bật `teachers.active`; chỉ owner/security admin được thay đổi.
2. RLS insert/update session chỉ cho teacher đang active; editorial author phải có role/content scope.
3. Published `session_versions` và `editorial_versions` bất biến; chỉnh sửa tạo version mới, publication chỉ trỏ sang version mới.
4. `revision_no` và `content_hash` cho optimistic concurrency trên màn hình editor.
5. Consent/audit/support message append-only; correction tạo event mới.
6. Helper `security definer` trong schema private cho role/share check, có `search_path` cố định và không expose thành RPC.
7. Policy/API test cho các trường hợp: learner chỉ đọc dữ liệu của mình; teacher không có grant không đọc được; grant hết hạn bị từ chối; revoke có hiệu lực ngay; owner console không trở thành đường tắt đọc raw health data.

Acceptance gate của migration hardening:

- test policy với anon, authenticated learner, teacher, reviewer, owner và service role;
- test published version update/delete bị từ chối;
- test stale `revision_no` trả conflict;
- test data export/delete chạy idempotent qua `job_runs`;
- chạy Supabase security/performance advisors và review query plan cho 5 truy vấn hot path.

## 7. Trình tự triển khai backend

1. Tạo server/API boundary, giữ private schema ngoài Data API.
2. Viết repository/service cho role, share grant, consent, audit và data request; mọi mutation nhận `request_id` và idempotency key.
3. Xây teacher content API: draft → submit → review → publish; validation chạy trước submit/publish.
4. Xây owner console API: role assignment, feature flag, invite, job monitor, support và audit viewer có mask dữ liệu.
5. Sau khi các contract tests đạt, áp dụng migration hardening riêng; sau đó mới seed taxonomy và một sample session đã review.
