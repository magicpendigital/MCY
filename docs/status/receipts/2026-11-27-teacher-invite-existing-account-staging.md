# Biên nhận: thư hướng dẫn cho tài khoản đã có, chặn tài khoản quản trị (mcy-staging, 27/11/2026)

Kế hoạch: [plans/active/2026-11-27-teacher-invite-existing-account.md](../../../plans/active/2026-11-27-teacher-invite-existing-account.md). Owner duyệt §12 theo khuyến nghị (27/11). Mã: commit `a33efd6` trên `claude/teacher-invite-existing-account`, gộp vào `main` cùng biên nhận này. Không có địa chỉ email nào của người thật trong tệp này.

## Kiểm trước khi áp (máy cục bộ)
| Lệnh | Kết quả |
|---|---|
| `npm run check:quick` | PASS |
| `npm test` | PASS (24 bước) |
| `node --test tests/teacher-control-plane.test.mjs` | PASS 24/24 |
| `node --test tests/teacher-control-plane-rehearsal.cjs` (PGlite) | PASS 10/10; 14 rehearsal khác cũng PASS |
| `npx playwright test tests/teacher-invite.spec.ts tests/teacher-workspace.spec.ts` (msedge) | PASS 13/13 |
| `npm run check:ios15` | PASS (chỉ kiểm tĩnh) |

## Thao tác ra ngoài theo thứ tự đã duyệt
| Bước | Kết quả |
|---|---|
| Owner nhập `RESEND_API_KEY` (key riêng cho luồng này) và `MCY_TEACHER_INVITE_FROM` | `supabase secrets list` (chỉ đọc tên): có mặt, cập nhật 07:17Z và 07:18Z. Agent không đọc giá trị. |
| Áp migration qua Management API (`database/migrations`, tên `teacher_invite_account_kind`) | PASS, HTTP 200. Version từ xa **`20261127072022`**; tệp cục bộ đổi tên từ `20261127120000` sang `20261127072022_teacher_invite_account_kind.sql`. Sổ migration: 33 dòng. |
| Đọc lại quyền thực tế | PASS: `mcy_teacher_invite_account_kind(uuid,text)` và `mcy_teacher_invite_mark_existing_account_emailed(uuid,uuid)` là `security definer`, `search_path=""`, ACL `{postgres=X, service_role=X}`; anon/authenticated không EXECUTE. Tám RPC cũ không đổi. |
| `supabase functions deploy teacher-control-plane --use-api` | PASS: **v4**, ACTIVE, `verify_jwt: true`, ezbr `60f5f9c3…3e3`. |
| Gọi khi chưa đăng nhập | PASS: POST không `Authorization` → 401. |
| Dữ liệu staging | Không sửa tay. 2 lời mời 27/11 để tự hết hạn 30/11. |

## Chưa chạy
- Owner mời thử một tài khoản học viên và một tài khoản mới; người nhận mở thư, đăng nhập trang giảng viên (cần Owner và người nhận).
- Thư thật đến hộp thư (Resend, domain đã xác minh): CHƯA CHẠY tới khi Owner thử.
- iPhone iOS 15 thật; TalkBack.

## Hoàn tác
Xoá `RESEND_API_KEY` hoặc `MCY_TEACHER_INVITE_FROM` → Edge quay về cách P0 (không gửi thư cho tài khoản đã có). Tắt `MCY_TEACHER_INVITES_ENABLED` → không mời được. Migration chỉ thêm 2 RPC; gỡ bằng một migration sửa tiếp theo.
