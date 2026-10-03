# Một chút yoga — kế hoạch bổ sung prototype tài khoản, giáo viên và owner v0.1

**Ngày:** 26/09/2026 · **Trạng thái:** kế hoạch thiết kế/kiểm chứng, chưa phải màn đã xây hoặc backend production.  
**Nguồn nội bộ:** `AGENTS.md`, `src/Prototype.tsx`, [blueprint v0.3](MCY_BLUEPRINT_2026-09-25.md), [kiến trúc nội dung](MCY_CONTENT_ARCHITECTURE_2026-09-25.md), [từ điển dữ liệu v0.2](business-plan/03_DU_LIEU_PHAN_QUYEN_TRACKING.md), [schema staging](../supabase/README.md).  
**Kết quả cần đạt:** khi duyệt prototype, mỗi nhiệm vụ quan trọng có màn/luồng, trạng thái, quyền, dữ liệu, thông điệp, API dự kiến, trường hợp lỗi và tiêu chí nghiệm thu truy vết được. Không thể bảo đảm tuyệt đối không phát sinh yêu cầu mới; bản này tạo cổng phát hiện thiếu sót trước khi khóa kiến trúc và lập trình.

**Cập nhật tình trạng 26/09:** mục 0 là ảnh chụp điểm xuất phát trước khi triển khai P1, không còn mô tả trạng thái hiện tại. Xem [kiểm tra sẵn sàng và kế hoạch tiếp theo](MCY_READINESS_AUDIT_2026-09-26.md) để biết phần đã nối Supabase staging, phần còn là fixture, lỗi UI và cổng nghiệm thu mới nhất.

## 0. Điểm xuất phát và nguyên tắc phạm vi

`src/Prototype.tsx` hiện có **10 route**: `welcome`, `home`, `checkin`, `dialogue`, `plan`, `practice`, `reflection`, `journey`, `discover`, `profile`. Chúng minh họa vòng học viên bằng trạng thái trong bộ nhớ. `profile` mới có thẻ mô tả quyền tương lai và nút reset demo; chưa có đăng ký, đăng nhập, đồng ý dữ liệu thực, tài khoản, quyền giáo viên, CMS, owner console, ticket, thanh toán hoặc lưu server. Nội dung tập và timer là minh họa, không phải bài phát hành.

Repo đã có **migration Supabase staging** cho phần lõi người học, media, buổi tập, editorial và review; README ghi chưa có seed người dùng/bài/media, chưa có Storage bucket/policy. Đây là nguồn schema hiện hữu để đối chiếu, **không** có nghĩa hệ thống đã phục vụ người dùng. Trong migration hiện tại có `profiles`, `user_consents`, `teachers` nhưng chưa có các miền `role_assignments`, `terms_acceptances`, `data_requests`, `teacher_assignments`, `share_grants`, support/audit/feature flags/commerce như tài liệu v0.2. `user_consents` hiện cho phép cập nhật bản ghi, trong khi kế hoạch dữ liệu mong lịch sử grant/withdraw dạng sự kiện; cần ADR/migration mới sau khi chốt UX, không sửa schema staging chỉ vì wireframe.

### Bề mặt cần thiết kế

| Bề mặt | Vai trò/ngữ cảnh | Điều hướng đề xuất | Quyết định thiết kế |
| --- | --- | --- | --- |
| **App học viên** | Guest và learner; mobile trước | Hôm nay · Hành trình · Khám phá · Cá nhân | Giữ vòng check-in → AI → plan → tập → phản hồi là trung tâm; đăng nhập đúng lúc cần lưu/đồng bộ/gửi AI, không chặn xem nội dung giới thiệu. |
| **Workspace giáo viên** | Teacher, editor/reviewer được phân công | Công việc · Nội dung · Học viên được giao (nếu bán hỗ trợ) · Hồ sơ | Prototype responsive web ưu tiên desktop/tablet cho brief, timeline, media và so sánh version; điện thoại chỉ cần xem việc và hành động đơn giản đã xác minh. |
| **Console owner/vận hành** | Owner/security admin; quyền support/finance/reviewer tách | Hàng đợi · Nội dung · Tài khoản/quyền · Sự cố · Yêu cầu dữ liệu · Cấu hình · Audit | Bảng điều khiển ưu tiên xử lý nhanh, có tìm kiếm/lọc và hàng đợi; hành động nhạy cảm luôn có phạm vi, lý do, xác nhận, kết quả và audit. |

Hai workspace nhân sự là **đầu ra prototype riêng** trên viewport web, dùng cùng hệ thị giác MCY nhưng mật độ thông tin phù hợp công việc. Không ép editor video hay bảng xử lý dữ liệu vào khung iPhone. Prototype app hiện tại chỉ sửa UI app-owned trong `src/Prototype.tsx` và `src/prototype.css`; phần workspace nên làm trong dự án/artefact tách biệt để giữ runtime được bảo vệ. Một nút/chế độ đổi vai trò phục vụ review chỉ dùng dữ liệu giả và không xuất hiện trong sản phẩm học viên.

### Quyết định platform P1 — xác nhận 2026-09-26

Phạm vi được người dùng cập nhật: giữ app web review trong khung mô phỏng iPhone / Pixel hiện có; đồng thời đóng gói app học viên native bằng Capacitor trong P1. Web triển khai trên Vercel; Android cài bản debug vào thiết bị đang kết nối; iOS chuẩn bị project, URL scheme và cấu hình backend để thử trên iPhone thật sau. Chưa tối ưu UI web rộng trong P1.

Backend P1 giới hạn ở Supabase Auth email, hồ sơ người học, consent ledger bất biến và check-in do người dùng chủ động đồng ý lưu. Bộ nội dung/buổi tập, hội thoại AI, phiên tập và phản hồi sau tập vẫn là fixture/local-only cho đến khi có seed nội dung đã duyệt cùng API/schema tương ứng. Client chỉ dùng publishable key; server-only key không đưa vào bundle. Không dùng backend staging như production.

## 1. Danh mục màn thiếu: đăng ký, đăng nhập và vào đúng vai trò

Đề xuất cho pilot là một điểm vào email thống nhất với **mã một lần hoặc liên kết đăng nhập**, đồng thời màn đầu vẫn nói rõ “Tạo tài khoản” và “Đăng nhập”. Cần thử email delivery, mở link trên thiết bị khác, callback/deep link và ngôn ngữ với người dùng trước khi khóa phương thức. Supabase hỗ trợ cả OTP và magic link; cấu hình URL quay lại phải được allowlist. Không lấy role từ trường profile do client sửa. [Supabase passwordless](https://supabase.com/docs/guides/auth/auth-email-passwordless), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

| ID | Màn / thông điệp chính | Hành động, dữ liệu và trạng thái bắt buộc | Đợt |
| --- | --- | --- | --- |
| **A00** | Chào và lựa chọn “Thử tìm hiểu” / “Tạo tài khoản” / “Đăng nhập” | Guest chỉ xem public/mẫu, không lưu check-in nhạy cảm ở server; giữ nơi định đến khi cần auth. Nêu rõ AI mẫu và nội dung mẫu. | P1 |
| **A01** | Nhập email: “Dùng một email bạn có thể mở ngay” | Sửa email, validate, privacy note, gửi một lần; existing/new account không lộ thông tin nhạy cảm; rate limit và lỗi mạng. Không hỏi tên/điện thoại/DOB trước khi cần. | P1 |
| **A02** | Kiểm tra hộp thư / nhập mã | Đếm thời hạn, gửi lại có giới hạn, đổi email, dán/auto-fill mã, “không nhận được thư”; mở trên thiết bị khác và tab khác. | P1 |
| **A03** | Kết quả xác minh / callback | Thành công, mã sai/hết hạn/đã dùng, link sai môi trường, phiên bị thay thế, tài khoản bị khóa; đưa người dùng về đúng plan/check-in/trang đích nếu còn hợp lệ. | P1 |
| **A04** | Onboarding tối thiểu | Tên hiển thị tùy chọn, ngôn ngữ/múi giờ, mục tiêu/kinh nghiệm chỉ khi dùng, chọn hình body map như sở thích hiển thị; có “để sau”. Không suy giới hay sức khỏe từ hình. | P1 |
| **A05** | Quyền và điều khoản theo mục đích | Điều khoản bắt buộc tách khỏi đồng ý AI, lưu phản hồi, thông báo, marketing và chia sẻ giáo viên; mỗi mục có nội dung “dùng gì/ai xem/đổi ở đâu”; từ chối vẫn có đường thủ công/mẫu được công bố. | P1 |
| **A06** | Phạm vi hỗ trợ/readiness | Câu hỏi ngắn đã được duyệt và lý do hỏi; nhánh `unknown`, `within_scope`, `needs_review`, `stop_guidance` có tiếp theo rõ; không gọi đây là chẩn đoán. | P1 trước beta AI |
| **A07** | Chấp nhận lời mời giáo viên/nhân sự | Link mời gắn email/đơn vị/phạm vi, hết hạn/đã dùng/sai tài khoản; chỉ server cấp role. Teacher có thể dùng cùng account learner nhưng vào workspace bằng ngữ cảnh rõ. | P2 |
| **A08** | Xác minh tăng cường nhân sự | Enroll/challenge MFA, mất thiết bị và quy trình phục hồi có người kiểm; owner/nhân sự quyền cao phải đạt mức xác minh trước hành động nhạy cảm. MFA phải được kiểm ở API/database, không chỉ hiện màn. [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa). | P2/P3 |
| **A09** | Phiên hết hạn, đổi account, quyền bị rút | Giữ nháp local an toàn khi được phép; đăng nhập lại không tự gửi thay người khác; quay về màn hợp lệ, không cho role cũ tiếp tục thao tác từ tab mở sẵn. | P1–P3 |
| **A10** | Nhận quyền lớp cũ / lời mời học viên | Mã mời gắn enrollment thật và thời hạn; xác minh đúng account, đối soát trước cấp quyền; sai email/đã dùng/không khớp mở ticket, không bắt mua lại hay gộp account tự động. | P2 nếu chuyển lớp cũ |
| **A11** | Không còn truy cập email / account trùng | Đường hỗ trợ phục hồi danh tính có người xử lý, trạng thái và biên nhận; không cho owner gộp/xem dữ liệu hai tài khoản chỉ vì tên hoặc email tương tự. | P1/P2 |

**Hợp đồng điều hướng:** `return_to` chỉ chấp nhận route nội bộ allowlist, không URL tùy ý; sau login kiểm lại consent, entitlement, content availability và app version. Bản check-in nháp của guest chỉ chuyển vào tài khoản sau khi người dùng xác nhận, không merge theo email đoán. Staff invitation không dựa vào việc người dùng tự khai “tôi là giáo viên”.

## 2. Danh mục màn thiếu: tài khoản và trải nghiệm học viên

Các màn dưới mở rộng tab **Cá nhân** đang có. Nội dung trợ giúp/kiến thức theo [kiến trúc nội dung](MCY_CONTENT_ARCHITECTURE_2026-09-25.md), không hard-code mọi bài trong app. Các quyền mua/lớp được thể hiện như trạng thái tương lai trong prototype; không mô phỏng đã thanh toán thành công như sự kiện thật.

| ID | Màn / chức năng | Nội dung, hành động và trường hợp phải vẽ | Đợt |
| --- | --- | --- | --- |
| **L01** | Trung tâm tài khoản | Tên/email đã xác minh, trạng thái đăng nhập, quyền đang có, lối tới cài đặt, hỗ trợ, đăng xuất; guest thấy lợi ích đăng ký mà vẫn xem public. | P1 |
| **L02** | Sửa hồ sơ | Tên, locale, timezone, mục tiêu/kinh nghiệm tùy chọn, hình body map; lưu/hủy, chưa lưu, xung đột hai thiết bị, lỗi lưu. | P1 |
| **L03** | AI và điều được nhớ | Mỗi memory có nguồn, phạm vi, lần dùng gần nhất, sửa/xóa/tắt hỏi lại; rút AI consent và giải thích ảnh hưởng tới lựa chọn lần sau. Không biến một lần “khó chịu hơn” thành đặc điểm lâu dài. | P1 |
| **L04** | Trung tâm quyền riêng tư | Từng mục đích đồng ý, phiên bản chính sách, trạng thái cấp/rút, ai có thể xem gì; thay đổi có xác nhận, kết quả và độ trễ xử lý rõ. | P1 |
| **L05** | Chia sẻ với giáo viên | Chọn đúng giáo viên/khóa, loại dữ liệu và khoảng thời gian, xem trước phạm vi, cấp/rút; không tự chia toàn bộ check-in/chat. Lời nhắn đã gửi và dữ liệu người đã đọc có giải thích giới hạn thu hồi. | P2 nếu có hỗ trợ giáo viên |
| **L06** | Bảo mật tài khoản | Email đăng nhập, đổi email có xác minh, thiết bị/phiên đang mở, đăng xuất thiết bị khác, trạng thái MFA nếu bật; hành động nhạy cảm cần xác minh lại. | P1/P2 |
| **L07** | Nhắc tập / thông báo | Bật/tắt theo kênh, giờ/tuần, múi giờ và yên lặng; OS từ chối, email unsub, thông báo dịch vụ tách marketing. | P2; push native sau |
| **L08** | Nội dung/quyền đang có | Mẫu, khóa đã đăng ký, hạn xem/hỗ trợ, nguồn quyền, hết hạn; nếu chưa bán thì hiển thị trạng thái “chưa mở bán”, không bịa đơn. | P2 nếu offer mở |
| **L09** | Hướng dẫn và liên hệ | Help theo màn + tìm kiếm, bài hướng dẫn liên quan, gửi ticket có category và trạng thái; lỗi tập/media/quyền có đường báo riêng. | P1/P2 |
| **L10** | Xuất dữ liệu | Loại dữ liệu, xác minh lại, yêu cầu đang xử lý, file riêng có hạn, tải lỗi/hết hạn, biên nhận; không email file nhạy cảm như attachment công khai. | P1 trước dữ liệu thật |
| **L11** | Xóa tài khoản | Giải thích dữ liệu nào xóa/giữ theo chính sách đã rà, ảnh hưởng quyền còn hạn, xác minh lại, xác nhận cuối, trạng thái xử lý/biên nhận; đường hỗ trợ nếu lỗi. Nếu sau này phát hành iOS/Google Play với tạo tài khoản, phải rà yêu cầu xóa tài khoản của store. [Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app), [Google Play](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en). | P1 trước dữ liệu thật |
| **L12** | Trung tâm trạng thái yêu cầu | Danh sách yêu cầu xuất/xóa/sửa, ticket, thông báo hệ thống có thời điểm và kết quả; tránh người dùng phải đoán một lệnh có thành công không. | P1/P2 |
| **L13** | Bài viết/chuyên mục/giáo viên | Từ Khám phá vào trang chi tiết, tác giả/nguồn/ngày rà, link buổi tập đúng quyền; loading/empty/404/đã thu hồi và quay lại đúng chỗ. | P2 |
| **L14** | Kết thúc buổi/đồng bộ | Phân biệt tập đủ/không đủ/dừng sớm, lưu phản hồi hoặc bỏ qua, chờ sync/lỗi/retry; không báo hoàn thành chỉ vì timer mẫu chạy hết. | P1 |

## 3. Danh mục màn thiếu: workspace giáo viên

Giáo viên có thể là tác giả nội dung và, nếu bán gói hỗ trợ, người nhận nhiệm vụ học viên. Hai quyền này tách nhau. Nội dung phát hành là **phiên bản bất biến**, giáo viên sửa nháp mới; người tạo không tự duyệt chuyên môn hoặc tự publish. Mọi media/quyền/phụ đề/điều kiện chọn bài phải đi cùng đúng version.

| ID | Màn / việc cần làm | Hành động và trạng thái bắt buộc | Đợt |
| --- | --- | --- | --- |
| **T01** | Trang vào workspace / hồ sơ công khai | Vai trò hiện hành, lớp/nội dung thuộc mình, trạng thái xác minh, lỗi lời mời/quyền bị thu hồi; không hiện dashboard owner. | P2 |
| **T02** | Hàng đợi công việc | Nháp cần hoàn thiện, review trả về, media lỗi, quyền sắp hết; nếu bán hỗ trợ mới hiện feedback đến hạn. Bộ lọc và mốc thời gian rõ. | P2 |
| **T03** | Danh sách bài giảng | Tìm/lọc theo draft, submitted, changes requested, approved, published, suspended; owner, locale, version, ngày sửa; empty và quyền không đủ. | P2 |
| **T04** | Tạo brief buổi tập | Mục tiêu, bối cảnh, đối tượng/phạm vi, thời lượng, dụng cụ, cue dừng, tình huống loại trừ, quyền dự kiến; lưu nháp và tiếp tục sau. | P2 |
| **T05** | Chỉnh metadata | Tiêu đề, tóm tắt, mức/nhịp/cường độ, tư thế, không gian, dụng cụ, thời lượng đo từ media; field help và lỗi validation ngay tại trường. | P2 |
| **T06** | Kịch bản và timeline | Đoạn timecode, movement/cue/stop cue/biến thể; kiểm chồng, khoảng hở và ngoài duration; xem/sửa theo đoạn mà không cần nhập JSON. | P2 |
| **T07** | Tải media và trạng thái xử lý | Bản gốc, thumbnail, tài liệu, audio; tiến trình `uploading/scanning/processing/ready/failed`; retry, duplicate checksum, mất mạng, file sai định dạng/kích thước. | P2 |
| **T08** | Phụ đề, transcript, bản dịch | Track theo locale, sửa timecode, so sánh với video, alt text; caption AI chỉ là nháp. Bản dịch stale khi nguồn đổi; safety change chặn bản phụ thuộc. | P2 |
| **T09** | Điều kiện phù hợp và bài thay thế | Quy tắc `eligible/exclude/needs_review`, reason/policy version; phương án “nhẹ hơn/ngắn hơn” có duyệt. Marketing tag không được sửa điều kiện AI chọn bài. | P2 |
| **T10** | Media rights | Mỗi nhạc/giọng/ảnh/người/tài liệu có bằng chứng, kênh, thời hạn, lãnh thổ, quyền dịch/cắt; cảnh báo/chặn submit nếu thiếu. | P2 |
| **T11** | Xem trước như học viên | Trải nghiệm đúng media, phụ đề, tốc độ/khung nhìn và ngôn ngữ; bản review đóng dấu version. Preview không phải public URL. | P2 |
| **T12** | Gửi duyệt và xử lý nhận xét | Checklist thiếu gì, submit, nhận `changes_requested` theo trường/timecode, diff phiên bản, sửa nháp mới, tránh overwrite đồng thời; trạng thái “đã gửi” rõ. | P2 |
| **T13** | Lịch sử và trạng thái phát hành | Xem ai duyệt/xuất bản/tạm dừng, lý do và version live; giáo viên có thể đề nghị sửa/thu hồi, admin quyết định. Không xóa lịch sử tập. | P2 |
| **T14** | Học viên được giao / phản hồi (có điều kiện) | Chỉ hiện khi có assignment + quyền chia sẻ còn hiệu lực. Xem đúng phạm vi, soạn → preview người nhận/nguồn → gửi; rút quyền giữa lúc soạn chặn gửi. Không giả AI là lời giáo viên. | P3 nếu bán hỗ trợ |
| **T15** | Bài kiến thức/hướng dẫn (nếu được giao) | Editor dạng block có nguồn, tác giả, taxonomy, locale, ngày rà, ảnh/alt text và preview app/web; quyền tác giả bài giảng không tự cấp quyền SEO/help hoặc publish bài viết. | P2/P3 nếu giáo viên biên soạn editorial |

**Quy tắc nháp:** autosave có trạng thái “đã lưu/chưa lưu/lỗi”; khi phiên hết hạn giữ bản nháp local được mã hóa/phù hợp chính sách hoặc giải thích không thể giữ; mở hai tab dùng `revision/If-Match`, hiện diff và lựa chọn giải quyết xung đột. Publish/withdraw không nằm trong quyền tác giả mặc định.

## 4. Danh mục màn thiếu: owner và vận hành nhanh

Owner là **người chịu trách nhiệm cấu hình và quyết định**, không là tài khoản xem tự do mọi ghi nhận cơ thể. Founder có thể kiêm vai trò, nhưng console phải hiển thị đang làm việc với quyền nào; các hành động vẫn tách audit. Support/finance/editor/reviewer chỉ thấy module và trường đúng nhiệm vụ. Không có “sửa trực tiếp mọi ô database” trong UI.

| ID | Màn / tác vụ | Thiết kế thao tác nhanh và chốt an toàn | Đợt |
| --- | --- | --- | --- |
| **O01** | Tổng quan ngày / action queue | Số việc chờ theo mức ưu tiên: nội dung duyệt, media lỗi, quyền hết hạn, no-match, ticket, yêu cầu dữ liệu, job lỗi. Mỗi số mở bộ lọc tương ứng; số liệu tổng hợp có mẫu số/thời điểm. | P3 |
| **O02** | Tìm kiếm toàn cục | Tìm ID/email đã che phù hợp quyền, session/version, ticket, đơn; phân nhóm kết quả, bộ lọc, trạng thái không tìm thấy. Không tìm raw chat/body note cho người không được giao. | P3 |
| **O03** | Tài khoản và quyền | Hồ sơ tối thiểu, trạng thái, role assignment có scope/thời hạn, khóa/mở theo quy trình, phiên hiện hành; mời/thu hồi nhân sự có MFA/lý do. Không sửa role qua profile. | P3 |
| **O04** | Giáo viên và phân công | Xác minh hồ sơ, năng lực/khung review, owner nội dung, assignment học viên nếu có, vắng mặt/thay người; xem quyền chia sẻ trước khi chuyển. | P3 |
| **O05** | Hàng đợi duyệt nội dung | Chọn đúng version, checklist chuyên môn/biên tập/quyền/media/caption, reviewer độc lập, diff và nhận xét; approve không đồng nghĩa publish. | P3 |
| **O06** | Publish, lịch phát, thu hồi | Preview ảnh hưởng, version/locale/kênh, điều kiện còn thiếu, lý do; publish một lần, rollback con trỏ khi phù hợp, suspend khẩn cấp mọi locale/phụ thuộc; kế hoạch đã tạo được đánh dấu stale. | P3 |
| **O07** | Media và giấy phép | Lọc asset sắp hết hạn, video/caption lỗi, component thiếu quyền; owner xử lý thay thế/chặn phát và xem bài/khóa/plan bị ảnh hưởng. | P3 |
| **O08** | Nội dung help/kiến thức/SEO | Danh sách version, review, lịch rà lại, taxonomy/route/canonical, help placement theo app version, publish/unpublish; không để bài marketing vào tập AI chọn bài. | P3 |
| **O09** | Chất lượng AI / safety | Hàng đợi report, no-match theo mã lý do, lỗi policy, prompt/catalog version, chi phí và latency tổng hợp; case nhạy cảm chỉ người được giao mở, có đường tắt AI riêng. | P3 |
| **O10** | Feature flags và cấu hình | Thay flag theo cohort/platform/version, tác động và fallback; preview/dry run, lý do, version, thời hạn, xác nhận, audit; tắt bán mới khác tắt AI và khác thu hồi quyền. | P3 |
| **O11** | Ticket và sự cố | Phân loại, ưu tiên, người phụ trách, SLA, ghi chú nội bộ tách lời gửi học viên, phát hiện trùng; finance ticket không mở nhật ký tập. | P3 |
| **O12** | Yêu cầu xuất/xóa/sửa dữ liệu | Hàng đợi, trạng thái xác minh, thời hạn, phạm vi, job tiến độ, lỗi/ngoại lệ, biên nhận; hành động hàng loạt chỉ khi an toàn và được rà. | P3 |
| **O13** | Đơn/quyền/đối soát (khi bán) | Pending, payment xác minh, entitlement thiếu/thừa, refund có lý do, idempotent retry; không cấp quyền theo ảnh chuyển khoản hay URL `success=true`. | P4 có điều kiện |
| **O14** | Job center và lịch sử audit | Job `queued/running/partial/failed/done`, retry idempotent, affected count, trước/sau; audit tìm theo actor/object/request ID, không chứa token/raw note. | P3 |
| **O15** | Trung tâm cấu hình hệ thống | Policy/terms version, email/auth template, locale, content review checklist, notification, retention, hạn mức; thay đổi qua version/dry run chứ không sửa tùy ý trên production. | P3 |
| **O16** | Sự cố khẩn cấp / break-glass | Chọn loại sự cố, tạm dừng nội dung/AI, phạm vi ảnh hưởng, xác minh tăng cường, lý do, hết hạn quyền khẩn cấp, người rà sau; không là đường xem toàn bộ dữ liệu sức khỏe mặc định. | P3 |
| **O17** | Nhập/sửa dữ liệu có kiểm soát | Xem file mẫu/schema, validate và dry run, bản ghi khớp/trùng/lỗi, phạm vi thay đổi, người phê duyệt, job và rollback/đính chính. Dùng cho chuyển lớp/nội dung; không có ô SQL tự do hoặc sửa nhật ký người học không dấu vết. | P3; chỉ bật khi có nhu cầu chuyển dữ liệu |

**Mẫu thao tác owner nhanh:** từ badge việc chờ → danh sách đã lọc → chi tiết có dữ liệu tối thiểu → hành động với preview ảnh hưởng → xác minh/lý do nếu nhạy cảm → trạng thái job và audit. Cho lưu bộ lọc và xử lý lặp bằng bulk **chỉ** với hành động thuận nghịch/ít rủi ro; publish, thu hồi, cấp role, xóa dữ liệu, hoàn tiền cần quy trình riêng. Mọi bulk hiển thị số bản ghi đủ điều kiện, bị loại và lý do; không chạy im lặng một phần.

## 5. Sáu hành trình xuyên vai trò phải dựng tương tác

1. **Người mới:** guest xem giới thiệu → nhập check-in nháp → muốn gợi ý AI → đăng nhập → xác minh → đồng ý mục đích AI → xác nhận chuyển nháp → hội thoại → plan. Từ chối AI đi tới lựa chọn thủ công/mẫu, không vào chatbot giả.
2. **Người quay lại:** đăng nhập từ link/từ thiết bị khác → thấy plan còn hợp lệ hoặc thông báo stale → tập → phản hồi như cũ/khó chịu hơn/chưa rõ/bỏ qua → lần sau giải thích đúng điều được nhớ. Không biến thiếu phản hồi thành tiến bộ.
3. **Giáo viên soạn bài:** lời mời → MFA → brief → metadata/timeline → upload và caption → quyền → preview → submit → reviewer trả sửa → version mới → admin publish → app dùng đúng version. Thử media fail, thiếu giấy phép và hai tab sửa đồng thời.
4. **Owner thu hồi:** cảnh báo quyền media/safety → xem bài/locale/khóa/plan liên quan → chặn cấp playback/plan mới → quyết định buổi đang chạy theo policy → thông báo/giải pháp quyền lợi → audit; không xóa lịch sử đã tập.
5. **Học viên chia sẻ rồi rút:** cấp phạm vi cho đúng giáo viên/khóa → giáo viên đang soạn feedback → rút quyền → draft không gửi được, cache và request mới bị chặn; học viên thấy trạng thái rõ.
6. **Yêu cầu dữ liệu:** learner yêu cầu xuất/xóa → re-auth → owner thấy hàng đợi tối thiểu → job/ngoại lệ → biên nhận; lỗi và retry không tạo hai tác vụ phá dữ liệu.

## 6. Hợp đồng dữ liệu/quyền phải khóa cùng prototype

| Miền | Quyết định trước lập trình | Đối chiếu staging hiện tại |
| --- | --- | --- |
| **Identity** | Chọn email OTP hay magic link, chính sách auto-create, callback/deep link/return-to, nhập lời mời, khóa/khôi phục; `auth.users` do provider quản lý, profile không quyết định role. | Có `profiles`; chưa có UI/API auth hay staff invitations. |
| **Role/capability** | `role_assignments` có scope/thời hạn, actor cấp, revocation; ma trận action × resource × row; owner và teacher cùng account nhưng quyền theo request. | Chưa thấy `role_assignments` trong migrations; RLS hiện không đủ biểu diễn staff workflows. |
| **Consent/terms** | Điều khoản bắt buộc và từng mục đích tự nguyện tách; grant/withdraw append-only, phiên bản nội dung, tác động lên AI/cache/teacher share. | Có `user_consents` mutable; cần chốt chuyển sang sự kiện/đọc effective consent. |
| **Teacher share** | `teacher_assignments` + `share_grants` + enrollment/scope; kiểm mỗi lần đọc/gửi và khi rút. | Chưa có trong staging. |
| **Draft/version** | Published payload bất biến; edit draft có revision/If-Match, media processing, review gate, publication pointer và availability; API tạo/submit/review/publish/suspend có idempotency. | Staging có nhiều bảng nội dung/duyệt, nhưng chưa có server workflow/bucket/seed. Các policy UPDATE theo owner/author hiện chưa tự mã hóa điều kiện “chỉ sửa draft”; cần kiểm effective GRANT và khóa bất biến ở backend/DB trước dữ liệu thật. |
| **Data requests & support** | Request state machine, re-auth, export file riêng có hạn, deletion ledger, ticket và biên nhận; retention/ngoại lệ được rà. | Chưa có bảng/luồng trong staging. |
| **Security operations** | Session/device view, staff MFA và step-up, audit append-only, break-glass có hạn, policy check ở API và DB, negative tests A/B. | Chưa có role/audit/flag/incident tables hoặc staff API. |
| **Import/correction** | Mapping nguồn, de-dup bằng định danh đáng tin, validation, dry run, job idempotent, provenance `imported/corrected`, rollback/receipt và phân quyền phê duyệt. | Chưa có job/correction/import ledger; không tự merge lớp cũ theo email hoặc tên. |
| **Commerce nếu bật** | Product, order, payment, entitlement và refund tách; không dựng checkout thật khi offer chưa quyết định. | Chưa có miền commerce trong staging. |

Với Supabase, không dựa vào `user_metadata` do người dùng sửa để quyết định quyền; quyền phải ở nguồn server kiểm được và kiểm lại khi JWT/role cũ chưa được làm mới. RLS và GRANT đều cần đúng phạm vi, còn API dùng secret/service role phải tự kiểm quyền. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). Những bảng mới trong schema phơi bày không mặc nhiên có quyền Data API; migration phải khai báo exposure/GRANT/RLS có chủ đích theo cấu hình project. [Supabase changelog](https://supabase.com/changelog?types=breaking-change).

## 7. Trạng thái dùng chung phải có trong bộ prototype

Mọi màn có dữ liệu cần ít nhất `loading / empty / success / validation error / network error / permission denied / session expired / stale version / retry`. Ghi rõ tác vụ nào cho retry và tác vụ nào phải kiểm trạng thái server trước retry. Không dùng toast “thành công” khi job mới vào hàng đợi.

| Tình huống chéo | Kết quả thiết kế bắt buộc |
| --- | --- |
| Email/mã sai, hết hạn, mở sai thiết bị; callback về route cũ | Nêu nguyên nhân có thể xử lý và giữ context hợp lệ; không lộ account tồn tại. |
| Mất mạng trong check-in, draft giáo viên, upload, submit, publish | Hiện trạng thái lưu, khả năng tiếp tục/retry; không gửi hai lần vì double click hoặc reconnect. |
| Quyền giáo viên/owner bị rút khi tab đang mở | Route, API, preview, media và action đều bị từ chối từ request kế tiếp; không chỉ ẩn menu. |
| Consent/assignment/entitlement thay đổi giữa lúc xem và gửi | Server kiểm lại, chặn action; UI cho biết cần làm gì. |
| Bài bị thu hồi khi plan đang mở hoặc lúc tập | Không bắt đầu mới; hướng dẫn dừng/tiếp tục theo policy, chọn lại kế hoạch và giữ provenance cũ. |
| Hai thiết bị/hai tab sửa cùng bản | Revision conflict có diff; không im lặng ghi đè. |
| Data request, bulk job, payment callback đến lặp | Idempotent; trạng thái/receipt phản ánh một hiệu ứng. |
| App cũ hoặc bản dịch cũ | Help và content đúng version/locale, fallback được giải thích; safety change chặn bản dịch phụ thuộc. |

**Khả năng tiếp cận cần thử trên prototype:** điều hướng bằng bàn phím và screen reader, thứ tự focus sau sheet/route, nhãn lỗi gắn trường, contrast, vùng chạm, phóng chữ, chế độ ngang/ngắn, giảm chuyển động, nhập mã bằng dán/auto-fill, không hỏi lại cùng dữ liệu không cần thiết. WCAG 2.2 có tiêu chí về nhập lại dữ liệu và xác thực có thể tiếp cận; dùng làm checklist thiết kế, không tự tuyên bố đạt chuẩn từ mockup. [W3C WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).

## 8. Kế hoạch triển khai prototype theo cổng

| Chặng | Đầu ra cụ thể | Phụ thuộc | Cổng duyệt trước chặng sau |
| --- | --- | --- | --- |
| **P0 — hợp đồng thiết kế** | Sitemap ba bề mặt, ma trận role/capability, quyết định auth và guest, consent map, entity/state diagram, danh mục màn ID A/L/T/O và kịch bản test | Tài liệu hiện có và người quyết định sản phẩm/teacher/owner | Không còn màn critical thiếu owner, data source, action, empty/error hoặc đường quay lại; mọi giả định chưa chốt được gắn quyết định và người chịu trách nhiệm. |
| **P1 — app học viên** | Web trong simulator được deploy Vercel; native Capacitor Android cài trên thiết bị, iOS project được chuẩn bị. Nối Supabase email auth, profile, consent ledger và check-in; các buổi tập/AI/phản hồi sau tập và data request vẫn ghi nhãn mẫu hoặc local-only. | P0, staging schema/RLS, auth email delivery và redirect allowlist, Vercel env, Android SDK/JDK; Xcode cho build iOS sau | Guest/new/returning, OTP/magic-link callback trên web và native, consent grant/revoke và check-in có thể lưu/đọc/xóa đúng chủ; màn mẫu không bị hiểu là backend thật. `npm run check:runtime` và build nền tảng pass. |
| **P2 — workspace giáo viên** | Prototype web riêng responsive: invite/MFA mock, hàng đợi, editor brief/metadata/timeline/media/caption/rights/suitability, preview, submit/comment/version diff | P0 + kiến trúc nội dung và checklist review | Giáo viên hoàn tất một bài mẫu, nhận sửa và nộp lại; thấy rõ chưa được tự publish; thử lỗi media/quyền/concurrency. |
| **P3 — owner console** | Prototype web riêng: queues/search, role/teacher, review/publish/suspend, rights, editorial, AI incident/flags, support/data requests, job/audit/break-glass | P0 + P2 state machine; owner/reviewer kiểm quy trình | Owner xử lý publish và thu hồi có preview ảnh hưởng/lý do/audit; role A/B không vượt quyền; job partial/retry hiện đúng. |
| **P4 — nhánh thương mại/lớp** | Chỉ khi offer được duyệt: quyền mua, order trạng thái, reconciliation/refund; teacher assignment/feedback/live nếu bán | Quyết định offer/công suất/điều khoản và API contract | Trả tiền→quyền→nội dung, mất callback, refund và hết hạn được mô phỏng đúng; không dùng UI giả để ngầm cam kết gói. |
| **P5 — tổng duyệt và đóng gói code handoff** | Bộ walkthrough cho 6 hành trình, screen-state matrix, role test matrix, copy deck, design tokens, responsive specs, API/schema delta, ADR và backlog ticket có acceptance | P1–P4 theo phạm vi launch | Product, giáo viên, reviewer chuyên môn, tech/security và người vận hành ký vào phạm vi; các vấn đề severity cao được sửa và thử lại trước schema freeze/coding. |

**Cách thử:** nghiên cứu core với người mới hai lần dùng như blueprint; thêm giáo viên thực hiện T04–T12 và owner thực hiện O01/O05/O06/O12 bằng fixture giả. Ghi thời gian, chỗ hiểu sai và câu họ nói, không chỉ hỏi “có thích không”. Mỗi hành trình cần trạng thái thuận lợi và ít nhất một trạng thái lỗi/quyền bị rút. Prototype review có thể dùng nút chuyển persona chỉ trong môi trường review; đánh dấu dữ liệu giả trên mọi dashboard, không trình diễn thống kê như kết quả thật.

**Bộ component cần chuẩn hóa trước khi dựng nhiều màn:** app dùng `FlowStack`, `MobileScroll`, trường nhập gắn keyboard runtime và `BottomSheet` theo `AGENTS.md`; staff workspace dùng bảng có lọc/phân trang, status badge, panel chi tiết, form autosave, media uploader, timeline editor, diff viewer, reason confirmation, job progress và audit trail. Mỗi component có trạng thái focus, disabled, pending, error và text thay thế. Fixture review tối thiểu gồm guest, learner mới, learner quay lại, teacher tác giả, reviewer khác người, support, finance, owner; có cặp learner A/B và teacher A/B để thử không rò quyền.

## 9. Gói bàn giao bắt buộc trước khi lập trình

Mỗi screen/flow có một dòng trong **traceability matrix**: `requirement ID → persona → screen/state ID → CTA → input/output → source of truth → API command/query → database entity → permission predicate → telemetry allowlist → error/recovery → test case → owner`. Không chốt màn nếu còn cột rỗng cho thao tác quan trọng.

Tài liệu bàn giao gồm: sitemap và route/deep-link map; design file/prototype tương tác; copy ở đủ trạng thái; component/tokens; media/aspect/alt/caption spec; role/capability matrix; state machine auth/content/request/job; API contracts và idempotency/concurrency; schema delta/ADR; retention/consent matrix; analytics event registry; threat and accessibility review; danh sách quyết định hoãn và điều kiện bật; kết quả usability và lỗi còn mở. Phân loại `launch / conditional / later` để không biến mọi màn đề xuất thành scope bắt buộc của beta.

### Điều kiện chặn code production

1. Không có phương thức auth/callback/guest merge và quyền nhân sự được chốt bằng mock đã thử.
2. Không có quy tắc ai xem/sửa từng dữ liệu, hoặc chỉ “ẩn nút” thay vì server authorization.
3. Không có định nghĩa consent, xóa/xuất, trạng thái phiên và ứng xử khi rút quyền.
4. Không có review/publish/withdraw version, media rights, hoặc kế hoạch đang mở khi bài bị thu hồi.
5. Không có trạng thái lỗi/khôi phục cho upload, save, submit, data job và idempotent action.
6. Chưa kiểm người học lần hai, giáo viên soạn một bài, owner xử lý một sự cố trên prototype với dữ liệu giả.

**Ranh giới của bản kế hoạch gốc:** tài liệu ban đầu chỉ lập kế hoạch; sau đó người dùng đã mở rộng và ủy quyền triển khai P1 cho app học viên web/native, backend học viên giới hạn, Vercel, cài Android và chuẩn bị iOS. Tình trạng thực tế hiện tại được ghi dưới đây. P1 vẫn không bao gồm thanh toán, AI xử lý dữ liệu thật hay backend production.

## 10. Tình trạng triển khai P1 — 2026-09-26

- **Kiến trúc client:** giữ một app React/Vite dùng chung. Trên trình duyệt, app tiếp tục nằm trong simulator iPhone/Pixel để review; nhánh Capacitor dùng stage toàn màn hình, không vẽ thêm bezel điện thoại giả. Tối ưu UX web rộng được để lại giai đoạn sau theo quyết định của người dùng.
- **Backend:** migration `20260926064515_learner_app_backend.sql` đã áp dụng vào Supabase staging `mcy-staging`; auth email, profile, consent ledger và check-in đã được nối ở client. Nội dung, hội thoại AI, phiên tập, phản hồi và data request còn là mock/local-only như phạm vi P1. Staging chưa phải môi trường dữ liệu production.
- **Build web/runtime:** `npm run check:runtime` đạt với 28 tệp được bảo vệ; `npm run build` hoàn tất TypeScript, Vite và chuẩn bị output. Bundle JavaScript chính hiện khoảng 800 KB minify và Vite cảnh báo vượt ngưỡng 500 KB; có thể tách chunk ở đợt tối ưu sau.
- **Simulator landscape:** đã bỏ ngưỡng scale tối thiểu gây cắt khung; iPhone và Pixel 10 được xác minh ở browser 844×390, cả khung máy đều nằm trong stage và trang không tràn ngang/dọc. Chỉ làm mới hash `PhoneFrame.tsx`; `npm run check:runtime` và build sau thay đổi đều đạt. Ảnh trước/sau ở [báo cáo readiness](MCY_READINESS_AUDIT_2026-09-26.md).
- **Android:** Capacitor đã sync bundle; JDK 21 build debug APK thành công và cài trên Air1 Ultra (Android 13). Màn hình trắng được truy ra ở tầng Android WebView renderer: log có `process is bad` / `Failed to establish the service connection` trước khi trang `https://localhost/`, React hoặc Supabase chạy. APK cùng mã nguồn với package chẩn đoán khác mở bình thường; package chính cũng mở bình thường sau khi thay quy trình cập nhật. Quy trình debug hiện dùng `adb push` + `pm install -r`, không dừng app thủ công ngay trước/sau cập nhật, rồi kiểm trực tiếp trang và nội dung React qua WebView debugger (`npm run android:install:debug -- <serial>`). Ba lượt chạy liên tiếp với package chính và ba lượt với package chẩn đoán đều khởi tạo renderer; màn chào và check-in khách đã được xem trên điện thoại. Đã sửa lời gọi `Keyboard.setResizeMode` vốn chỉ hỗ trợ iOS và đặt status bar biểu tượng tối trên nền sáng. Sau khi sửa scale simulator, `cap sync`, `:app:packageDebug --offline` và cập nhật APK cùng đúng debug signature đều đạt; WebView mở `https://localhost/` và React hiển thị. `assembleDebug` toàn bộ còn chờ Android Maven cho task `extractDebugAnnotations`. Đây là xác nhận debug trên thiết bị này; chưa thay thế kiểm thử release/thiết bị khác hoặc luồng email thật.
- **iOS:** Capacitor đã sync app assets, plugin package, bundle ID `com.nilaza.motchutyoga` và URL scheme `motchutyoga://`. Xcode/macOS chưa có trong môi trường hiện tại nên chưa build, ký hay cài được; project sẵn sàng chuyển sang Mac để thử iPhone thật.
- **Vercel:** đã thêm `vercel.json` trỏ build về `dist/client` và rewrite callback `/auth/callback`. Chưa tạo deployment: Vercel trả về danh sách team rỗng, còn deployment connector báo `Tool deploy_to_vercel not found`; chưa có CLI/token hoặc project liên kết để gửi gói build. Cần khôi phục quyền triển khai Vercel hoặc liên kết project rồi mới phát hành preview.
- **Cấu hình cần hoàn tất sau khi có URL Vercel:** đặt `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` trong build environment; thêm origin Vercel và `motchutyoga://auth/callback` vào redirect allowlist Supabase. Nếu dùng OTP 6 số, email template cần có `{{ .Token }}`.

## 11. Cổng nghiệm thu sau kiểm tra sẵn sàng

Bước code nội bộ vừa hoàn tất là sửa clipping simulator landscape và xác minh lại hai preset. Ưu tiên kế tiếp là **nghiệm thu đăng ký/đăng nhập P1 bằng hai tài khoản thử trên web và Android**, gồm email template/redirect, khôi phục phiên, quyền consent và cô lập check-in A/B. Điều này đang chờ cấu hình Supabase Auth (OTP hay magic link và callback allowlist), quyền liên kết Vercel để tạo preview, cùng inbox thử do người dùng cung cấp; không gửi thư hoặc triển khai từ môi trường chưa có quyền/project. APK debug đã cài và mở trên điện thoại; cần chạy lại full `assembleDebug` khi Android Maven khả dụng. Workspace giáo viên và bộ gợi ý AI chỉ chuyển từ fixture sang dữ liệu thật sau khi có API quyền, nội dung đã duyệt và bộ đánh giá. Ma trận chi tiết, ảnh và các bước xử lý nằm ở [báo cáo kiểm tra ngày 26/09](MCY_READINESS_AUDIT_2026-09-26.md).

## 12. Cập nhật triển khai — 26/09/2026

### Email trên web và app native

- Người dùng đã tự thử trên local: email magic link được gửi tới inbox và luồng local hoàn tất thành công. Vì vậy chưa cần đổi nhà cung cấp auth hoặc chuyển bắt buộc sang OTP.
- Bản native không dùng `localhost` làm callback. `src/backend/supabase.ts` chọn `motchutyoga://auth/callback` trên Capacitor; deep-link listener đổi PKCE code/token thành session, và Android đã được gọi cold-start bằng URL scheme thành công. Còn phải allowlist scheme trong Supabase Auth và thử link email thật trên APK đã cài.
- UI auth đã nói rõ thư có thể chứa mã hoặc liên kết; CTA đổi thành “Gửi email xác minh”, và gửi lại thành công được thông báo bằng trạng thái thành công thay vì vùng lỗi.
- Khuyến nghị giữ magic link cho đợt kiểm tra kế tiếp vì email đã chạy. OTP vẫn được client xử lý khi thư chứa mã `{{ .Token }}`. Project Free được tạo ngày 25/09/2026; Supabase không cho project Free mới sửa template nếu còn dùng SMTP mặc định từ 03/06/2026. Muốn đổi email template sang OTP cần cấu hình SMTP riêng trước.

### Vercel — chưa thể deploy từ connector hiện tại

- Repo đã có `vercel.json`, build script `npm run build`, output `dist/client` và rewrite `/auth/callback` cho SPA.
- Tại lần kiểm tra này, Vercel connector trả `teams: []`; chưa tìm thấy `.vercel/project.json`, project, hoặc deployment. Lời gọi deploy trước đó trả lỗi `Tool deploy_to_vercel not found`; CLI Vercel cũng chưa cài.
- Cách ngắn nhất: đăng nhập đúng tài khoản/team trong Vercel, import GitHub repo `magicpendigital/MCY`, dùng root `.` và build/output đã khai báo, đặt `VITE_SUPABASE_URL` cùng `VITE_SUPABASE_PUBLISHABLE_KEY` cho Preview và Production, rồi tạo Preview. Không thêm service-role key. Sau khi có URL Preview, allowlist callback cụ thể `/auth/callback` trong Supabase; thêm `motchutyoga://auth/callback` cho APK/iOS.
- Vì connector không thấy team, không thể tự gắn project hoặc triển khai trong lượt này. Cần khôi phục quyền connector vào đúng Vercel account/team hoặc hoàn tất import project để có deployment URL.

### Teacher trial — phạm vi P1 mới được mở

- Người dùng đã mở rộng P1 để chuẩn bị cấp tài khoản thử cho giảng viên tải bản nháp bài học. Phạm vi khuyến nghị là staging, invite-only; API server cấp quyền và ghi audit; draft/version và media nằm riêng tư; giảng viên không được truy cập dữ liệu học viên; chưa có nút publish và bài chưa xuất hiện trong catalog.
- Hiện workspace ở `staff.html` vẫn là fixture. Staging đã có một tài khoản Auth đã xác minh với cả chín vai trò ứng dụng global và audit entry. Chưa có active teacher profile, teacher API, private media bucket hay roster giáo viên thử; chỉ phát hành lời mời sau khi nhận roster.
- Project Supabase staging đang ở Free plan: tối đa 50 MB/file và 1 GB storage. Đây chỉ phù hợp media mẫu/clip nén cho pilot; tải lên trên 6 MB nên dùng TUS resumable. Không tự đổi plan hoặc tạo chi phí. Video bài học đầy đủ cần quyết định ngân sách/storage trước.
- Cổng code tiếp theo: khóa policy tự tạo teacher ở bảng `public.teachers`; server-only invite/activation kiểm role; private bucket giới hạn MIME/path/size; API tạo và lưu draft/version; tải lên theo TUS với tiến độ và retry; checksum/scan hoặc giữ staged; yêu cầu quyền nội dung và metadata; cuối cùng nối workspace web. Review độc lập và learner publishing vẫn là cổng riêng.
- Trước khi mở invite/upload thật cần xác nhận: account email dùng làm owner ban đầu; email giáo viên thử nghiệm; loại file và dung lượng dự kiến; tuyên bố quyền sử dụng media và thời hạn lưu/xóa; reviewer phụ trách. Không có dữ liệu nào trong repo hiện cho phép tự suy ra các đầu vào này.

### Ưu tiên sau cập nhật

1. Khôi phục quyền Vercel đúng team/project và tạo Preview với hai biến Supabase public.
2. Thêm callback Vercel và scheme native vào allowlist Supabase; xác minh email magic link trên web Preview và APK cùng điện thoại.
3. Chốt owner + roster + giới hạn media, rồi triển khai teacher pilot server-side trên staging trước khi thay fixture UI.
4. Chỉ sau khi nội dung có quyền và review mới thiết kế pipeline publish/suitability/recommendation; AI thật vẫn ngoài phạm vi hiện tại.
