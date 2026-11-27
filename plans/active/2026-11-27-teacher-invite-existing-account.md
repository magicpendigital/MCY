<!-- plan-template v1 -->
# Kế hoạch — thư mời giảng viên cho tài khoản đã có

Trạng thái: Owner đã duyệt §12 theo khuyến nghị (27/11), đang làm. Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận (intake) theo [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md). Kiểm bằng `npm run check:plan plans/active/2026-11-27-teacher-invite-existing-account.md`. Khi xong, cập nhật `PLAN.md`. Thuộc P0 của [kế hoạch thử giảng viên](2026-11-26-teacher-pilot.md).

Quy ước riêng tư: kho mã công khai. Không ghi email của bất kỳ ai vào tệp nào; người được mời gọi là GV1 hoặc "người được mời".

## 1. Mục tiêu
Owner thử mời ngày 27/11 và không nhận được thư nào. Cả hai lời mời trên staging đều rơi vào nhánh "địa chỉ đã có tài khoản". Ở nhánh này Supabase Auth từ chối `inviteUserByEmail` (`email_exists`), nên hệ thống chỉ ghi lời mời mà không gửi thư (biên nhận: audit `teacher.invite.existing_account`, `email_sent: false`). Owner yêu cầu (27/11) hai việc:
- **(a)** Nếu người được mời đã có tài khoản **học viên thường**, vẫn gửi thư mời kèm hướng dẫn vào trang giảng viên. Lý do: người dùng không biết cách vào trang giảng viên, vì app học viên và trang giảng viên là hai chế độ khác nhau.
- **(b)** Owner đồng ý ghi lại gợi ý: ô mời cảnh báo khi email được mời thuộc tài khoản đang có vai Owner hoặc vai nhân sự khác. Lần thử 27/11 đã mời đúng một tài khoản như vậy.

Khi đọc mã còn thấy thêm một lỗi nhỏ, sửa chung trong việc này. Thư mời cho **người chưa có tài khoản** gọi `inviteUserByEmail(email)` mà không có `redirectTo`. Vì vậy người mới bấm link sẽ vào app học viên, không vào trang giảng viên. Mẫu `invite.html` đã nhận callback `…/auth/callback?workspace=teacher&email_locale=vi-VN` (có trong allowlist), chỉ cần truyền URL này vào.

## 2. Tiêu chí xong
- Mời một email đã có tài khoản học viên thường: người đó nhận thư "Lời mời giảng viên — Một chút yoga" (tiếng Việt, đúng nhận diện). Thư có các bước: đăng nhập bằng email này, đặt tên hiển thị ở Cá nhân, bấm nút mở `https://motchutyoga.magicpendigital.com/?workspace=teacher`, hạn 72 giờ. Ô mời báo "Đã gửi thư mời tới tài khoản đã có". Audit ghi `teacher.invite.delivered` kèm `existing_account: true`.
- Mời một email đang có vai Owner hoặc nhân sự khác: **không gửi thư**. Ô mời báo rõ đây là tài khoản quản trị và giải thích vì sao không nên dùng nó để thử vai giảng viên. Lời mời không được tạo, hoặc bị đóng ngay; audit ghi lý do.
- Mời một email chưa có tài khoản: thư mời của Auth dẫn thẳng tới trang giảng viên (`workspace=teacher`).
- Bấm mời lại cùng email: không gửi thư thứ hai (giữ idempotency hiện có). Giới hạn 3 lời mời mỗi giờ vẫn giữ.
- Thư không chứa mã đăng nhập hay link đăng nhập (không có token). Thư chỉ dẫn tới trang giảng viên, ở đó người được mời tự đăng nhập bằng liên kết xác minh gửi tới chính email của mình.
- Lệnh ở mục 10 chạy xanh. Có biên nhận staging, không có email.

## 3. Phạm vi sửa
- `supabase/functions/_shared/teacherControlPlane.ts`, `supabase/functions/teacher-control-plane/index.ts`: phân nhánh tài khoản đã có; gửi thư qua API Resend (`fetch`, không thêm thư viện); truyền `redirectTo` cho người mới; status mới `sent_existing_account` và `existing_staff_account`. Vùng backend.
- `supabase/functions/_shared/teacherInviteEmail.ts` (mới): dựng HTML và chữ thường của thư, theo bảng màu và chữ trong `supabase/templates/` (nền ivory, chữ forest, nút terracotta, không tải ảnh hay font ngoài). Vùng backend.
- Migration mới (một tệp): RPC `public.mcy_teacher_invite_account_kind(p_actor_id uuid, p_email text)`. Hàm trả `none` / `learner` / `staff` (staff = có vai còn hiệu lực trong `owner, security_admin, content_editor, content_reviewer, support, finance, analyst, growth`). Hàm là `security definer`, `search_path` rỗng, Owner kiểm tra bên trong, chỉ `service_role` có EXECUTE, không lưu email. Nếu cần ghi audit cho trường hợp đóng lời mời vì tài khoản quản trị, thêm RPC `mcy_teacher_invite_refuse_staff_account` trong cùng migration. Vùng backend, skill `mcy-supabase-rollout`.
- `src/staff/TeacherInvitePanel.tsx`: hai câu báo mới. Vùng nhân sự, không đụng màn học viên.
- Test: `tests/teacher-control-plane.test.mjs` (handler với `rpc`, `auth` và `fetch` giả), `tests/teacher-control-plane-rehearsal.cjs` (RPC mới, quyền, người lạ), spec ô mời trong `tests/teacher-workspace.spec.ts` hoặc spec ô mời hiện có, `tests/teacher-migration-contract.test.mjs`.
- Mức rủi ro cao nhất: **R3** theo [review matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md), vì đụng lời mời, vai trò, migration staging, một nơi nhận bí mật mới và gửi email ra ngoài.
- Hiện trạng: commit `b3eace6` (`main`), nhánh `claude/teacher-invite-existing-account`, không có tệp đang dở của người khác. Hành vi phải giữ: luồng mời người mới, idempotency, giới hạn 3/giờ, chặn tự mời, nhận lời mời chỉ khi email đã xác minh khớp mã băm, Edge cần đăng nhập (401).

## 4. Cố ý không đụng
- 13 mẫu email Auth và cấu hình Auth (SMTP, allowlist, 7 công tắc thông báo): không sửa. Đã xét phương án gửi thư "đăng nhập bằng link" của Auth cho tài khoản đã có, nhưng không chọn: thư đó là thư đăng nhập chung chung, có mã chỉ sống ngắn hạn, và muốn thêm hướng dẫn giảng viên thì phải sửa mẫu Auth đang được quản lý bằng manifest/hash.
- Giới hạn đã biết (giảng viên đã bị thu hồi thì không mời lại được bằng cùng email): để nguyên, như P0.
- App học viên, `src/Prototype.tsx`, runtime bảo vệ: không đụng.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| Edge `teacher-control-plane` action `invite_teacher` | Nhánh tài khoản đã có: kiểm loại tài khoản, rồi gửi thư Resend hoặc từ chối | Owner. Giữ idempotency, `already_sent`, giới hạn 3/giờ, lỗi giao thư "chưa chắc" không tự thử lại | Test handler mới; tập dượt PGlite |
| Thư mời Auth cho người mới | Thêm `redirectTo` có `workspace=teacher` | Người được mời chưa có tài khoản | URL đã có trong allowlist và trong nhánh của `invite.html` |
| Schema staging | Thêm 1–2 RPC, không đổi bảng | Không bảng học viên nào đổi | Tập dượt; đọc lại quyền thực tế |
| Bí mật Edge | `RESEND_API_KEY` và địa chỉ gửi `MCY_TEACHER_INVITE_FROM` (Owner nhập) | Chỉ Edge này đọc | Không in giá trị; agent chỉ kiểm tên |
| Ô mời (`TeacherInvitePanel`) | 2 câu báo mới | Owner | Spec ô mời |
| iOS 15 | Chỉ đổi chữ trong vùng nhân sự | — | `check:ios15` |

## 6. Bảo mật
- Thư không có token và không có link đăng nhập, nên ai đọc trộm thư cũng không vào được tài khoản. Nhận lời mời vẫn cần phiên đã xác minh của chính email đó (mã băm khớp), cổng không lỏng hơn.
- Địa chỉ người nhận lấy từ ô Owner gõ, đã chuẩn hóa. Nội dung thư không chèn dữ liệu do người dùng gõ (không chèn tên). Không nhận HTML từ trình duyệt.
- RPC `account_kind` nhận email ở dạng thường chỉ để tra `auth.users`, không lưu, không ghi log email, chỉ trả về một trong ba giá trị. Owner được kiểm tra bên trong RPC. Người không phải Owner gọi Edge thì bị chặn trước đó (`owner_access_required`).
- Trả về cho trình duyệt chỉ `existing_staff_account`, không nói vai cụ thể. Owner vẫn biết được "email này có tài khoản hay không"; điều này đã đúng từ P0 (`existing_account`) và chỉ Owner thấy.
- Khóa Resend là bí mật mới, chỉ ở Edge Secrets, không vào mã, tài liệu hay chat. Owner tự tạo khóa, nên giới hạn quyền "Sending access" cho đúng domain gửi.
- Không thêm thư viện; gọi `https://api.resend.com/emails` bằng `fetch` có giới hạn thời gian (dùng `boundedRequest` sẵn có).

## 7. Hoàn tác
- Bỏ `RESEND_API_KEY` hoặc đặt `MCY_TEACHER_INVITES_ENABLED=false`. Khi thiếu khóa, nhánh tài khoản đã có quay về hành vi P0 (ghi lời mời, không gửi thư, ô mời nhắc Owner tự nhắn).
- Deploy lại Edge bản trước (`teacher-control-plane` v1, commit `b3eace6`).
- RPC mới chỉ thêm. Nếu cần gỡ thì viết migration sửa tiếp theo.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Owner duyệt kế hoạch và các mục ở §12 | Owner | S |
| 2 | Migration RPC + tập dượt PGlite (Owner, người lạ, learner/staff/none, quyền) | agent | M |
| 3 | Edge: nhánh tài khoản đã có, thư Resend, `redirectTo`; test handler | agent | M |
| 4 | Ô mời: 2 câu báo; spec | agent | S |
| 5 | Cổng kiểm R3; gộp `--no-ff` vào `main` | agent | S |
| 6 | Owner tạo khóa Resend (gửi được, chỉ domain gửi) và nhập `RESEND_API_KEY`, `MCY_TEACHER_INVITE_FROM` ở Edge Secrets | Owner | S |
| 7 | Áp migration lên `mcy-staging`, đọc lại quyền, đổi tên tệp theo version; deploy Edge; kiểm 401 | agent (sau khi Owner duyệt) | M |
| 8 | Owner mời một tài khoản học viên thử, nhận thư, làm theo hướng dẫn; biên nhận; push | Owner + agent | S |

## 9. Cách thử
1. Owner mời một email **đã có tài khoản học viên thường** (không phải tài khoản Owner). Kỳ vọng: ô mời báo đã gửi; hộp thư nhận "Lời mời giảng viên — Một chút yoga" (xem cả thư rác).
2. Người được mời bấm nút trong thư, bấm "Gửi liên kết xác minh" và mở thư xác minh, đặt tên hiển thị ở Cá nhân, mở lại trang giảng viên. Kỳ vọng: vào được trang giảng viên.
3. Owner bấm mời lại cùng email. Kỳ vọng: "đã gửi trước đó", không có thư thứ hai.
4. Owner mời email của tài khoản Owner khác. Kỳ vọng: không có thư; ô mời báo đây là tài khoản quản trị.
5. Owner mời một email chưa có tài khoản. Kỳ vọng: thư mời của Auth; bấm link thì vào trang giảng viên.
6. Agent gọi Edge khi chưa đăng nhập. Kỳ vọng: 401.
- Luôn ghi CHƯA CHẠY: iPhone iOS 15 thật, TalkBack.

## 10. Lệnh kiểm
- `npm run check:quick`; `npm run check:plan plans/active/2026-11-27-teacher-invite-existing-account.md`.
- R3: `npm test`; `node --test tests/teacher-control-plane.test.mjs tests/teacher-migration-contract.test.mjs`; `npm run test:teacher-control-plane-rehearsal` (PGlite); Playwright `teacher-workspace` và spec ô mời; `npm run check:ios15` trước push; đọc lại quyền thực tế trên staging (anon, authenticated, service_role, PUBLIC).

## 11. Rủi ro còn lại
- Thư gửi từ API Resend đi đường khác với thư Auth (SMTP). Domain gửi phải đã xác minh trên Resend, nếu không thư bị từ chối hoặc vào thư rác. Chỉ thử thật mới biết.
- Resend trả lỗi hoặc hết thời gian chờ thì không chứng minh được là thư chưa đi. Giữ quy tắc P0: lời mời chuyển "chưa chắc", không tự gửi lại; Owner tạo lời mời mới bằng một lần bấm mới.
- "Tài khoản thường" xác định theo vai trong `private.role_assignments`. Tài khoản giữ vai `teacher` mà không có vai nhân sự khác vẫn tính là thường.
- Lời mời đã tạo hôm 27/11 cho hai địa chỉ đã có tài khoản vẫn còn hạn tới 30/11 và đã ở trạng thái "đã xử lý". Mời lại cùng địa chỉ trước 30/11 sẽ chỉ báo "đã gửi trước đó", không gửi thư mới.

## 12. Cần duyệt
1. **Cách gửi thư cho tài khoản đã có.** Khuyên: thư riêng qua API Resend (thư hướng dẫn, không có mã đăng nhập). Cần Owner tạo một khóa API Resend và nhập 2 biến. Phương án khác: dùng thư "đăng nhập bằng link" sẵn có của Auth và dẫn thẳng tới trang giảng viên; không cần khóa mới, nhưng thư không giải thích gì về vai giảng viên, và muốn thêm hướng dẫn thì phải sửa mẫu Auth.
2. **Tài khoản Owner hoặc nhân sự:** khuyên **chặn** (không tạo lời mời, báo rõ). Phương án khác: vẫn gửi thư nhưng cảnh báo Owner.
3. **Sửa luôn `redirectTo` cho người mới** (thư Auth dẫn tới trang giảng viên): khuyên **có**.
4. **Thao tác ra ngoài**, theo thứ tự: (a) Owner nhập `RESEND_API_KEY` và `MCY_TEACHER_INVITE_FROM` (địa chỉ gửi trên domain đã xác minh ở Resend, ví dụ dạng `no-reply@<domain gửi>`); (b) áp một migration lên `mcy-staging`; (c) deploy Edge `teacher-control-plane`; (d) push lên `main`. Khuyên: đồng ý cả bốn.
5. **Hai lời mời đã tạo 27/11** (còn hạn tới 30/11): khuyên để nguyên cho hết hạn; muốn thử lại ngay thì dùng địa chỉ khác. Agent không sửa dữ liệu staging bằng tay.

## Progress
- [x] Đọc staging 27/11: 2 lời mời, cả hai `existing_account`, không gửi thư (đúng thiết kế P0)
- [x] Lập kế hoạch (27/11)
- [x] Owner duyệt §12 theo khuyến nghị (27/11): thư riêng qua Resend, chặn tài khoản Owner/nhân sự, sửa `redirectTo`, thứ tự bí mật → migration → Edge → push; để 2 lời mời 27/11 tự hết hạn
- [ ] Bước 2–5 (mã + test + gộp)
- [ ] Bước 6–8 (bí mật, staging, thử thật, biên nhận)
