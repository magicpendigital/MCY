# MCY — email theo nhận diện và ngôn ngữ, 11/10/2026

Owner báo đã đăng nhập thành công sau khi cấu hình Resend/Cloudflare và yêu cầu tùy biến email, sau đó tiếp tục kế hoạch. Xác nhận này là nghiệm thu do người dùng báo cho luồng đăng nhập trước thay đổi email; chưa phải nghiệm thu inbox VI/EN của bộ mới.

## Nội dung và hành vi

Đã biên soạn 13 kịch bản Việt/Anh trong [bộ template](../supabase/templates/README.md), theo tên/slogan chuẩn của MCY, câu chữ ngắn và CTA rõ ràng. Không đưa hồ sơ, vùng đau, transcript, role hoặc nội dung người dùng vào thư. Sáu thư xác thực giữ provider link/token nguyên trạng; thư mời nhắc quyền workspace được kiểm tra riêng. Thông báo bảo mật có hướng dẫn khi người nhận không thực hiện thay đổi.

Web Learner/Owner/Teacher có lựa chọn ngôn ngữ email. Callback chính xác mang locale để email cho tài khoản đã xác nhận dùng đúng lựa chọn hiện tại, sau đó lưu locale bằng token của tài khoản khởi tạo. Kết quả cập nhật locale thất bại không biến một callback hợp lệ thành đăng nhập thất bại. Không dùng metadata để cấp role. Native dùng locale đã lưu và giữ schemes cũ; chưa kiểm thử máy thật cho thay đổi này.

## Supabase đã lưu gì

Official CLI2.119.0 dùng config riêng tại `.vercel/mcy-auth-emails-20261011`, chỉ 13 subject và callback locales chính xác. Đợt đầu lưu 13 subject + tăng callback7→17; đợt cuối rút gọn 7 subject bảo mật để phù hợp giới hạn form Dashboard255 ký tự nguồn. [Apply cuối](MCY_AUTH_EMAIL_CONFIG_APPLY_2026-10-11.json) và [readback](MCY_AUTH_EMAIL_CONFIG_READBACK_2026-10-11.json) ghi zero declared diff, 18 trường không quản lý giữ nguyên hash. Không đổi SMTP/key, OTP8, notification switch, MFA, rate limit hoặc Site URL.

Sáu HTML Auth đã upload qua CLI; bảy HTML thông báo bảo mật đã lưu riêng trên Dashboard sau khi Owner đăng nhập lại. [Fresh hosted-body readback](MCY_AUTH_EMAIL_HOSTED_BODIES_2026-10-11.json) đối chiếu toàn bộ13 body bằng editor/clipboard sau tải lại, khớp SHA256 manifest. Bảy switch thông báo vẫn OFF; mỗi lần lưu body đều được kiểm lại declared diff0 và18unmanaged hashes. `bodyUploads`13 trong receipt CLI chỉ là tập **đầu vào đã kiểm hash**; việc lưu13body được xác nhận bằng receipt Dashboard riêng, không suy luận từ số đầu vào. Không bật tạm notification để ép CLI upload.

[Receipt hợp nhất](MCY_AUTH_EMAIL_IMPLEMENTATION_EVIDENCE_2026-10-11.json) xác minh13body, subject/config,64source hashes và Preview đúng cùng candidate. Không suy luận việc gửi thư thật từ config hay fixture renderer.

## Kiểm thử và giới hạn

Final UI **136/136 PASS**, canonical build **PASS** (runtime28, TypeScript, Vite601 modules), bundle scanner23, Sites4 và Playwright isolation1 PASS. Một full run trước đó135/136 phát hiện fixture consent DEV/noUID mất đường tiếp tục; bản cuối khôi phục chỉ nhánh DEV/query `review-screen=consent`, không mở fallback ghi dữ liệu cho production thiếu UID. Source production vẫn dùng captured identity/session epoch và route generation để từ chối phản hồi muộn.

[R3 độc lập](MCY_AUTH_LEARNER_FINAL_REVIEW_2026-10-11.md): final **34/34 PASS**, exit0, không còn P1/P2 trong source đã freeze. Bản reviewer trước đây và renderer78 đầu là evidence lịch sử. [Renderer cuối](MCY_AUTH_EMAIL_DOCKER_2026-10-11.json) lúc11:38:27Z đạt **78/78 PASS**, khớp manifest hiện tại `63012a11…`, metadata actor/role preservation và cleanup PASS; lần engine unavailable giữ riêng. Đây là common GoTrue subject/body renderer, không phải nghiệm thu13 trigger/inbox thật.

## Preview đã triển khai

[Deploy](MCY_AUTH_EMAIL_DEPLOYMENT_2026-10-11.json): `dpl_2zYC7QQJKMRLGsKgWPpWQqnPkaT4` READY, Preview branch `codex-mcy-p1-preview`, artifact58files SHA256 `3197f3ebf8805a04e97bc5350f2d18bbc96fa443ed71b2cd273a327a4d04c662`. [Hosted receipt](MCY_AUTH_EMAIL_HOSTED_2026-10-11.json) xác nhận domain `motchutyoga.magicpendigital.com` đúng deployment, HTTPS, protected SSO302/public và CLI authenticated200; HTML/callback, main, AuthCallback và Owner chunk khớp byte hash. Không promote Production, tắt protection hoặc đổi DNS. Hosted visual/email-link acceptance của locale mới chưa chạy.

Chưa gửi email thật tự động, chưa nghiệm thu inbox/link của email mới, chưa kiểm physical Android/iOS, chưa dịch đủ app English. Vite vẫn báo entry chunk khoảng555kB raw/171kB gzip; không có dependency/runtime-lock change.

## Cách dừng/khôi phục

Đối với web, giữ Preview cũ `dpl_HHpJXfSUdoiVyywUKCFeW6pDu1Tu` làm điểm quay lại, bảo vệ deployment giữ nguyên. Đối với email, dừng apply khi subject/hash/target/config drift. Subject/URL baseline được ghi trong preflight đầu và ignored rollback. Có backup đầy đủ7 notification body gốc trong ignored workdir, nhưng **không có backup đầy đủ6 Auth body trước upload đầu**, nên không tuyên bố rollback toàn bộ13body đã nghiệm thu. Không reset SMTP hoặc dùng template chứa key/token để khôi phục.

Automatic approval review từng từ chối Invite Save vì subject thực tế không khớp manifest; không lặp action đó. Đường CLI/hash/readback thay thế đã được thực hiện. Password-changed body Save ban đầu được tool cho phép nhưng provider từ chối subject nguồn>255. Sau đợt CLI rút gọn7 subject, toàn bộ7 body đã lưu thành công và được fresh readback. Đây là lỗi validation của Supabase, khác với automatic-review rejection. Không có authorization bypass.

## Bước kế tiếp

Đã hoàn thiện candidate lưu consent/check-in và kiểm thử lock/retry/cross-account, ghi riêng trong [báo cáo Learner writes](MCY_LEARNER_WRITES_IMPLEMENTATION_2026-10-11.md). Candidate database chưa apply, nên chưa nói check-in đã đồng bộ trên staging. AIoff, catalog0 và chưa có phê duyệt chuyên môn/rights cho buổi tập vẫn là gates độc lập; không bật AI hoặc Production trong scope này.
