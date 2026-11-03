# MCY — nghiệm thu triển khai staging, 11/10/2026

Đã triển khai workflow Owner duyệt nội dung lên staging và đưa bản web mới lên [motchutyoga.magicpendigital.com](https://motchutyoga.magicpendigital.com). Mở [workspace Owner](https://motchutyoga.magicpendigital.com/?workspace=owner), đăng nhập tài khoản có quyền Owner hiện hành rồi chọn **Duyệt nội dung**. Vercel vẫn bảo vệ Preview, nên trình duyệt có thể yêu cầu đăng nhập Vercel trước khi vào ứng dụng.

Owner là người duyệt ban đầu. Giao diện đã có chỉ định teacher theo đúng phiên bản nội dung, thời hạn 1–30 ngày và thu hồi quyền. Staging hiện chưa có teacher profile active, nên chưa có tài khoản teacher đủ điều kiện để chỉ định. Quyền hệ thống tự cấp vẫn là phần chưa triển khai.

## Bản đã triển khai

Supabase là `mcy-staging` (`mhumbczqrzutdnraafhs`), MagicpenDigital, Singapore, ACTIVE_HEALTHY. Official CLI 2.119.0 đã apply duy nhất `20261010113419_owner_content_review.sql` từ workdir 19 migration đã áp dụng cộng đúng candidate này. Không dùng `db push`. Ledger sau triển khai: **20 shared/aligned, 0 remote-only, 5 pending**.

SQL cuối có SHA256 `a206a63d3daa86747d8e3447193235ad88534775676a3582ac3ccd92472191c1`. Kiểm thử Docker tái hiện được lỗi candidate cũ: role Owner hết hạn trong lúc chờ khóa unchanged row nhưng đọc vẫn được cho phép. Bản sửa khóa verified Auth identity và kiểm lại thời gian sau role/profile locks; regression cuối đạt. [Receipt lỗi cũ](MCY_CONTENT_REVIEW_DOCKER_EXPIRY_REGRESSION_2026-10-11.json) được giữ riêng, không ghi đè bằng kết quả đạt.

Owner Edge **v5 ACTIVE**, `verify_jwt=true`, được triển khai riêng. Readback tám file runtime khớp chính xác source đã review; file thứ chín là import type-only bị loại khi bundle. API có đọc danh mục model OpenRouter để hiển thị readiness; không chạy inference. Function Owner cấu hình cũ vẫn giữ OID 19270, MD5 `5ad67fe52caf79bd07c51caa0c30db92`, owner/ACL/search_path.

Vercel Preview **READY**, deployment `dpl_5sy3BCxPvGg1ZXZzJVM8dKUJ2Waj`, từ Build Output API v3 prebuilt: 56 file, 8.201.479 byte, artifact SHA256 `e823d02822d6f935b875d357419024f054b7fe7683882d343d39c2536c1d2794`. Domain tự nhận deployment mới qua binding Preview branch `codex-mcy-p1-preview`. Không sửa DNS hay promote Production. HEAD vẫn là `82458fc219a2231ccac279112dfc0db5447b0edd` với working tree dirty; manifest file hashes mới là dấu vết của candidate đã đưa lên, không coi toàn bộ source đã commit tại HEAD đó.

## Kiểm tra và readback

| Phạm vi | Kết quả cuối | Ý nghĩa |
| --- | --- | --- |
| Docker PostgreSQL/PostgREST | PASS 11/11, exit 0,cleanup đạt | Upgrade schema, ACL, tranh chấp phiên bản/quota, expiry sau khóa và HTTP409/429 |
| PGlite + Owner/content/catalog | PASS 29/29, exit 0 | Replay sạch và contract/handler |
| R3 độc lập | PGlite 9/9 + Owner/content/catalog 20/20; không còn P1/P2 trong scope | Reviewer còn đối chiếu trực tiếp sáu body SQL đã deploy, owner/ACL/ledger |
| UI isolated | PASS 11/11, exit 0 | Owner/teacher, conflict/network/late-account, viewport iPhone/Pixel |
| API staging với phiên thật | PASS 14/14, exit 0 | Owner đọc được; actor khác/anonymous/direct RPC bị từ chối; stale revision409 không ghi |
| Runtime / bundle scanner | PASS 28/28 / PASS 21 text file | Runtime bảo toàn; scanner đạt trên bundle đã deploy |
| HTTPS và artifact hosted | PASS | TLS hợp lệ; chưa xác thực302 Vercel SSO, CLI xác thực200; HTML và hai JS khớp hash local |

Docker dùng PostgreSQL17.6.1.139/PostgREST14.13 cùng schema public/private xuất mới từ staging; hosted PostgreSQL là17.6.1.166. Fixture Auth và dữ liệu đều giả, mạng internal, không mở port/mount host. Đây là rehearsal app-schema và HTTP thực, chưa phải chứng nhận toàn bộ hosted Auth stack.

UI lần đầu 10/11 có một timeout 20s ở cold page.goto khi Docker/Vite cùng chạy. Chạy lại toàn bộ 11/11 đạt với timeout/assertions không đổi. Canonical build và full UI 103/103 của checkpoint10/10 được giữ là chứng cứ nguồn frontend/build không thay đổi; không báo đã chạy lại 103 test trong lượt này.

Readback sau smoke và [review độc lập](MCY_CONTENT_REVIEW_STAGING_TECHNICAL_REVIEW_2026-10-11.md) xác nhận ba bảng review private có RLS, không policy/USAGE/table privileges cho client hoặc service role; public RPC chỉ service EXECUTE, toàn bộ owner postgres và search_path rỗng. **Review states/events/assignments đều 0; audit 4; AI off/version 1/model unset.** Các probe live không tạo phiếu duyệt, chỉ định hay config save thành công.

Security advisor có 43 INFO RLS không policy, trong đó ba bảng mới cố ý deny-all; 5 WARN authenticated SECURITY DEFINER learner RPC và 1 WARN leaked-password protection disabled đã tồn tại trước. Không có WARN/ERROR mới cho review RPC. Chưa coi đây là chứng nhận an toàn toàn dự án, và không thêm policy/grant để xóa INFO.

Vercel CLI curl dùng cơ chế xác thực chính thức và tự tạo protection bypass credential; không in giá trị, không tắt bảo vệ deployment. Thử gắn in-app browser bị timeout, nên chưa có nghiệm thu trực quan trên browser hosted; UI local, asset hosted và backend thật được ghi riêng.

## Phần chưa mở và bước tiếp theo

**AI vẫn tắt.** Catalog buổi tập đã duyệt vẫn rỗng. Candidate duy nhất là bài giới thiệu không có hướng dẫn động tác, với audio mẫu tiếng Anh. Owner ghi nhận duyệt trong hệ thống không tự xác nhận chuyên môn/quyền media và không tự xuất bản thành buổi tập. Cần nội dung buổi tập hoàn chỉnh, người chịu trách nhiệm chuyên môn, bằng chứng quyền và nội dung/audio tiếng Việt đạt yêu cầu trước khi đưa vào catalog.

Năm migration dưới đây còn pending và cần gói triển khai/actor acceptance riêng:

- `20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql`: actor/consent-bound check-in.
- `20261002204228_teacher_control_plane_rpcs.sql`: teacher invitation/activation/draft API.
- `20261003031137_limit_my_consent_events.sql`: quota/idempotency của consent.
- `20261005004000_private_teacher_collaboration.sql`: hợp tác nội dung private.
- `20261009181735_ai_read_admission_state.sql`: admission state cho AI.

Preview này phục vụ review Owner và giao diện mới. Check-in sync theo RPC mới, teacher pilot/media và AI inference chưa được nghiệm thu mở cho học viên. Positive review/assignment được kiểm trong database/PostgREST fixture; chưa ghi thử approval/assignment trên dữ liệu thật, chưa có active teacher để thử giao quyền thật. Các role tạm dùng cho smoke hết hạn **11/10/2026 17:47 Bangkok**; phải xác minh lại role/phiên trước lần thử tiếp, không gia hạn ngầm.

Giới hạn native/iOS, qualified content/rights và protected Production release còn giữ nguyên. Automatic approval rejection trước đây với successful live Owner AI-config save vẫn còn hiệu lực; lượt này không lặp lại thao tác đó. [Receipt tổng hợp](MCY_CONTENT_REVIEW_STAGING_EVIDENCE_2026-10-11.json) tách rõ selective staging PASS khỏi full Production certification.

## Khôi phục khi cần

Previous Owner Edge v4 source/metadata đã lưu tại task temp. Nếu xuất hiện lỗi, redeploy đúng code trước đó với JWT bật, giữ Owner conflict repair PT409; không drop bảng/audit hoặc cấp lại role. Preview trước đó là `dpl_6N2BWPT3yKTfWiKEow6ArVNUpfvo`; có thể khôi phục domain review về deployment này. Không promote Production, không mở AI trong thao tác khôi phục.
