# Biên nhận — áp migration giáo viên và deploy Edge `teacher-control-plane` lên `mcy-staging` (27/11/2026)

Kế hoạch: [plans/active/2026-11-26-teacher-pilot.md](../../../plans/active/2026-11-26-teacher-pilot.md), P0 bước 1, 4, 5. Owner duyệt quyết định 3 (a–d) ngày 26/11. Project `mcy-staging` (ref `mhumbczqrzutdnraafhs`, org MagicpenDigital). Không chạm project nào khác, không `supabase db push`, không `--force`. Biên nhận này không chứa email, khóa hay giá trị bí mật nào.

Công cụ: Supabase CLI 3.1.0 (đăng nhập sẵn trên máy Owner) cho danh sách migration, Edge, tên biến, deploy; Management API (`database/query` chế độ `read_only`, `database/migrations` cho lần áp duy nhất) với token của CLI đọc lúc chạy, không in, không ghi ra tệp. Nhánh `claude/teacher-p0-staging`, gốc `2255dfa`.

## Bước 1 — đọc staging (chỉ đọc), trước khi áp
| Kiểm | Kết quả |
|---|---|
| `supabase migration list --remote=mhumbczqrzutdnraafhs` | PASS: 31 migration đã áp, cao nhất `20261110175347`; `20261002204228` chưa áp; 4 tệp chỉ có ở local (`20261002204228`, `20261003031137`, `20261005004000`, `20261009181735`); không có migration chỉ có ở remote. Khớp chuỗi trong `tests/teacher-control-plane-rehearsal.cjs`. |
| Edge đang có | Chỉ `owner-control-plane` (ACTIVE, v12, `verify_jwt: true`). |
| `public.teachers` | 0 dòng (0 đang hoạt động). RLS bật. Quyền thực tế: anon `SELECT`, authenticated `SELECT` (policy `teachers_select_public_or_owner`: `active = true` hoặc chính chủ); service_role đủ quyền kể cả `TRUNCATE`; PUBLIC không có mục trong ACL. |
| `private.workspace_invites` | 0 dòng. RLS bật, ACL mặc định (chỉ chủ bảng); anon, authenticated, service_role không có quyền nào (kể cả `TRUNCATE`); anon/authenticated không có `USAGE` trên schema `private`. |
| `private.role_assignments` vai `teacher` | 2 dòng: 1 còn hiệu lực, 1 đã hết hạn; cả hai không có dòng `public.teachers` tương ứng, nên chưa ai được nhận là giáo viên. RPC nhận lời mời tái dùng dòng còn hiệu lực hoặc mở lại dòng cũ, không vướng. |
| Hàm `public.mcy_teacher_*` | Chưa có hàm nào. |
| Số đếm giữ nguyên (đối chiếu sau khi áp) | `mcy_content_versions` 55, `mcy_content_review_states` 15. |

## Bước 4 — áp migration
| Kiểm | Kết quả |
|---|---|
| Tập dượt PGlite trước khi áp: `npm run test:teacher-control-plane-rehearsal` (PGlite 0.3.x, `MCY_PGLITE_MODULE_PATH`) | PASS 7/7 |
| Áp đúng một migration `teacher_control_plane_rpcs` (Management API `database/migrations`) | PASS, HTTP 200. **Version remote `20261127031613`.** Ledger 32 dòng. |
| 8 RPC (`mcy_teacher_prepare_invite`, `_invite_mark_delivered`, `_invite_delivery_failed`, `_invite_mark_existing_account`, `_accept_own_invite`, `_list_own_drafts`, `_read_own_draft`, `_save_own_draft`) | PASS: cả 8 `security definer`, `search_path=""`, chủ `postgres`, ACL `{postgres=X, service_role=X}`; EXECUTE: anon false, authenticated false, service_role true; PUBLIC không có. |
| `private.workspace_invites` sau khi áp | PASS: có 4 cột mới (`idempotency_key`, `delivery_state`, `delivery_started_at`, `delivery_updated_at`); RLS bật; ACL vẫn mặc định; anon, authenticated, service_role không có quyền nào (kể cả `TRUNCATE`). |
| `public.teachers` ACL | Không đổi. |
| Số đếm | Không đổi: teachers 0, lời mời 0, vai teacher 2, `mcy_content_versions` 55, `mcy_content_review_states` 15. |
| Tệp local | Đổi tên thành `supabase/migrations/20261127031613_teacher_control_plane_rpcs.sql`; cập nhật `tests/teacher-control-plane-rehearsal.cjs`, `tests/teacher-migration-contract.test.mjs`, `tests/owner-conflict-migration-rehearsal.cjs`, `supabase/README.md`. Chạy lại: tập dượt 7/7, `teacher-migration-contract` + `teacher-control-plane` 22/22, `owner-conflict-migration-rehearsal` 15/15 PASS. |
| Gọi thử RPC bằng phiên Owner | CHƯA CHẠY (không có phiên Owner; agent không mời thay Owner). |

## Bước 5 — biến máy chủ và Edge
| Kiểm | Kết quả |
|---|---|
| Owner nhập 3 biến ở Dashboard | Owner xác nhận trong chat. `supabase secrets list` (chỉ đọc tên): `MCY_TEACHER_API_ENABLED`, `MCY_TEACHER_INVITES_ENABLED`, `MCY_TEACHER_INVITE_HASH_SECRET` có mặt. Agent không đọc giá trị. |
| `supabase functions deploy teacher-control-plane --project-ref mhumbczqrzutdnraafhs --use-api --yes` | PASS. **`teacher-control-plane` v1, ACTIVE, `verify_jwt: true`**, cập nhật 2026-11-27T04:24:07Z, ezbr_sha256 `49d94ab8…9d32`. Không tệp nào trong repo bị CLI sửa. |
| Gọi khi chưa đăng nhập | PASS: POST không có `Authorization` → 401; GET → 401; Bearer giả → 401 `UNAUTHORIZED_INVALID_JWT_FORMAT`. |
| `owner-control-plane` | Mã không đổi (ezbr `bb011b41…2778`, cập nhật 2026-11-10T17:45:23Z) nhưng số version báo 15 thay vì 12 lúc đầu phiên; khớp với 3 lần ghi biến của Owner. Không deploy lại. |
| `invite_teacher` | Không gọi (bước của Owner). |

## Chưa chạy
- Bước 6–8 (Owner mời GV1, GV1 nhận lời mời và soạn bài, Owner duyệt): Owner và GV1 tự làm trong phiên của họ.
- iPhone iOS 15 thật; TalkBack.
- Giới hạn đã biết, không sửa trong P0: giảng viên đã bị thu hồi quyền không mời lại được bằng cùng email.

## Hoàn tác
Tắt `MCY_TEACHER_API_ENABLED` hoặc `MCY_TEACHER_INVITES_ENABLED` ở Dashboard (Edge trả 404/503). Migration chỉ thêm RPC và cột; nếu cần gỡ thì viết migration sửa tiếp theo.
