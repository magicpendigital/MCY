# Kế hoạch triển khai UI/UX và nội dung AI — Một chút yoga

> **Kế hoạch tiếp nối 17/10/2026:** xem [kế hoạch đồng bộ 4.4 và nhánh nội dung](../ux-step4-4-2026-10-17/PLAN-CONSOLIDATED.vi.md) cùng [phiếu nhận việc/tác động/QC 4.4](../ux-step4-4-2026-10-17/TASK-INTAKE.vi.md). 4.1–4.3 đã được Owner duyệt trong candidate riêng, chưa tích hợp root; 4.4 đang intake, dừng trước 4.5. Nội dung bên dưới giữ làm kế hoạch lịch sử, không thay approval/receipt đã frozen.

Ngày 14/10/2026. Cơ sở: audit `analyse/ux-audit-2026-10-14/index.html` và yêu cầu Owner lập kế hoạch, cấu hình đội sub-agent, giao việc thực thi. Đây là kế hoạch có thực thi local; trạng thái thực tế sẽ ghi trong `EXECUTION.vi.md`.

**Cập nhật lúc bàn giao:** root AGENTS.md được luồng native riêng bổ sung checkpoint approved/install14 Oct trong khi đội UX chạy. Các câu “pending approval” bên dưới mô tả baseline đầu lượt, không còn là trạng thái native mới nhất. Candidate UX vẫn chưa được tích hợp và không nằm trong approval/APK của operation đó. Xem EXECUTION và root AGENTS hiện hành; không dùng bản AGENTS copy trong candidate để điều hành native.

## Kết quả cần đạt

Người học biết thao tác có lưu hay chưa, thấy đúng bản ghi của mình, đọc được tiếng Việt và hiểu bước tiếp theo. Nội dung phân biệt clip tham khảo, buổi thực hành và khóa học; AI hỗ trợ biên tập trong quy trình có người chịu trách nhiệm chuyên môn.

## Phạm vi và nền tảng giữ nguyên

- Tạo candidate riêng tại `.vercel/ux-implementation-20261014` từ mã nguồn hiện tại, không lấy HEAD cũ của Git. Workspace đang có nhiều thay đổi trước nhiệm vụ này.
- Giữ nguyên checkout app, APK và các packet native/web đã frozen. Candidate UI không được xem là artifact trong packet native đang chờ duyệt.
- Không đổi runtime được khóa, RPC, schema, payload, role, consent policy hoặc cấu hình AI. Không đọc `.env`, gọi staging, gửi email, cài app, upload, deploy hay sinh media trả phí.
- Native trial 13/10 vẫn FAIL, 0 live writes còn được phép. Packet 14/10 là operation riêng đang chờ exact approval. Web cần kiểm protection cho đúng Preview trước upload. Không dùng kết quả local để đóng các gate này.
- Nhóm sửa lưu/nhãn account có mức R3 do chạm trải nghiệm Auth/consent, dù hợp đồng backend giữ nguyên. Kiểm local và review độc lập trước tích hợp; live acceptance ghi CHƯA CHẠY.

## Đội agent và phân quyền

Tối đa root + 3 worker đồng thời. Hai worker audit cũ đã kết thúc và không còn trong danh sách agent hoạt động; không giả định có thể thay model của chúng.

| Vai trò / tên | Model, reasoning | Sở hữu | Đầu ra |
|---|---|---|---|
| Root / điều phối | Model của chat hiện tại | Plan, candidate, build/test tổng, evidence, quyết định ghép | Candidate kiểm chứng được và báo cáo trung thực |
| `ux_state` | gpt-6.1-sol / high | Candidate `src/Prototype.tsx`, test mới riêng | F01 + F11; giữ continuation/actor/consent guards |
| `ux_journey` | gpt-6.1-sol / medium | Candidate `src/JourneyScreen.tsx`, `src/prototype.css`, test riêng | F02 + phần F09; empty/hydration/selection rõ |
| `content_pilot` | gpt-6-luna / medium | Chỉ docs trong `analyse/ux-implementation-2026-10-14/content/` | Blueprint, template, checklist review, task cho giáo viên |
| `ux_review` — sau khi có slot | gpt-6.1-sol / high | Chỉ đọc candidate/diff/evidence; báo cáo riêng | Review độc lập nhánh lưu/account, P1/P2 và phạm vi chưa kiểm |

Root làm typography/copy sau khi worker giao file để tránh hai agent sửa cùng file. Không dùng model nhẹ để quyết định correctness của Auth/consent hay duyệt chuyên môn yoga. Không cần Astra cho các phạm vi đã bó hẹp; chỉ cân nhắc khi có lỗi khó chưa giải quyết và báo rõ lý do.

## Trình tự thực hiện

### Bước 0 — Chốt baseline và nơi làm việc (thực hiện ngay)

1. Đọc hướng dẫn dự án, audit và source; kiểm tra trạng thái đội và hạn mức.
2. Copy source/config/public/test cần thiết vào candidate, không copy `.env`, credentials, `.git`, native build hay account state.
3. Lập SHA256 baseline; giữ riêng ảnh/evidence audit cũ. Kiểm runtime 28 file trước preview.
4. Giao task không trùng file; mỗi worker nêu files, tests, limitations và không được tự deploy.

Nghiệm thu: candidate đúng source hiện tại; root files/pending packet không đổi; không live request.

### Bước 1 — Sửa tín hiệu lưu và nhãn thao tác (F01, F11; thực thi đợt đầu)

1. Tách trạng thái đã lưu tài khoản, chỉ giữ trong phiên, chưa lưu và continuation bị hủy theo dữ liệu thực có. Không coi `null` từ persistence là thành công.
2. Khi chưa được phép lưu, giữ draft và thông báo rõ trong màn check-in; không tự bật đồng ý, không tự đăng nhập, không chuyển Hành trình rỗng như đã lưu.
3. Giữ retry cùng key/payload khi kết quả chưa rõ; giữ guard trước/sau chuẩn bị client, session generation và route invalidation.
4. Đổi nhãn “Đổi email” thành hành động đăng nhập tài khoản khác nếu backend hiện làm việc đó. Nhánh hoàn tất onboarding có ghi profile không được ghi “Để sau”.
5. Test guest, signed-in revoked, success, error/uncertain retry, leave-route/delayed-client và actor switch bằng fixture giả.

Nghiệm thu: không clear draft/navigate khi chưa lưu; không thêm write ngoài thao tác rõ ràng; old late-save protections còn nguyên; copy khớp hành vi. Không suy đây là nguyên nhân sự cố native extra B.

### Bước 2 — Hành trình phản ánh dữ liệu thực (F02, phần F09; thực thi đợt đầu)

1. Chọn bản ghi mới nhất khi dữ liệu đầu tiên đã sẵn sàng; không thay lựa chọn chủ động của người dùng khi dữ liệu cập nhật.
2. Tách đang tải, chưa có dữ liệu, ngày trống và bản ghi được chọn. Không mô tả ngày có một bản ghi là không có.
3. Khi toàn bộ lịch sử trống, ưu tiên thông báo + CTA; bỏ các đồ thị/so sánh rỗng không giúp ra quyết định.
4. Giữ nhiều bản ghi/ngày, sample có nhãn, so sánh cùng loại, bỏ qua/không thay đổi/khó chịu hơn/chưa rõ.
5. Test 0/1/2 bản ghi, khác ngày, hydration trễ, user selection, account reset và dữ liệu mẫu.

Nghiệm thu: có bản ghi thì thấy được ngay; không trộn tài khoản hay suy diễn cải thiện; empty state có bước tiếp theo.

### Bước 3 — Khả năng đọc và thao tác (F12, phần F13; sau bước 1–2)

1. Kiểm font đã bundle và glyph tiếng Việt. Thử font serif có đủ glyph; chỉ chốt thay token nếu có nguồn/license và bằng chứng render. Không thêm download font runtime.
2. Tăng chữ mang thông tin quyết định lên 14–16px; target chính khoảng 44–48px theo design system, giữ inset/safe area.
3. Đặt tên accessible cho toggle gồm mục đích và trạng thái; thay copy hệ thống bằng ngôn ngữ người học ở những màn bị ảnh hưởng.
4. Kiểm 360×640, 390×844, desktop, iPhone/Pixel, reflow/text lớn/focus. Không tuyên bố physical-native hoặc WCAG đầy đủ từ screenshot.

Nghiệm thu: dấu tiếng Việt liền mạch, nút không che nội dung, toggle phân biệt được bằng screen reader.

### Bước 4 — Tổ chức luồng chính (F03–F05, F07–F10, F14; đợt tiếp theo sau candidate đầu)

1. Home ưu tiên bắt đầu/tiếp tục check-in và lựa chọn thủ công đúng capability; bớt phần giới thiệu lặp.
2. Check-in cho chọn trạng thái nhanh trước, mở vùng chi tiết khi cần; giữ text list và xác nhận trước xóa vùng.
3. Khi AI tắt, nêu thời gian/energy được dùng ở đâu; không hứa cá nhân hóa nếu chưa có logic/candidate phù hợp.
4. Course detail đặt mục tiêu, loại nội dung, play và thông tin cần quyết định gần nhau; chi tiết nguồn/privacy vẫn truy cập được. Giữ 9:16 không crop người, không thêm thumbnail chưa duyệt.
5. Reflection không có baseline hỏi cảm nhận chung trước; có baseline mới so sánh; CTA hiện có sau player được tái sử dụng.
6. Profile ưu tiên các chức năng đang dùng; nhắc tập/gói/lớp/support chưa có không trình bày như đã hoạt động. Không tự tạo email support.
7. Kiểm thu hẹp/landscape, welcome crop và desktop hierarchy trên đúng runtime.

Nghiệm thu: đi từ Home tới nội dung trong các bước dễ hiểu, không tạo năng lực giả; các trạng thái guest/signed-in/AI-off đều có đường hợp lệ. Đây là backlog có phụ thuộc, không ghi đã triển khai khi mới có kế hoạch.

### Bước 5 — Chuẩn hóa nội dung (F06; bắt đầu bằng hồ sơ ngay)

1. Lập inventory38 clip hiện có: ID/nguồn/thời lượng/rights/caption/reviewer thực có; trường thiếu ghi chưa xác minh.
2. Định nghĩa clip tham khảo, buổi tập có mở–thân–kết, khóa có mục tiêu/trình tự/tiêu chí học. Không tự gán beginner-safe từ tên.
3. Chuẩn bị schema biên tập cho audience, prerequisite, dụng cụ, mục tiêu, text, media, phương án thay thế, nguồn/reviewer/version/rights.
4. Giáo viên chọn và thẩm định một bài nhập môn + 3 buổi hoàn chỉnh; AI chỉ draft từ brief được giáo viên xác nhận. Thời lượng dự kiến phải đo lại toàn buổi.
5. Reviewer con người kiểm từng cue/hình/transition; editor kiểm VI, accessibility, quyền và minh bạch AI. Không tạo approval JSON thật từ model.

Nghiệm thu đợt này: bộ hồ sơ sẵn giao người phụ trách; chưa phải nội dung được phép đưa vào catalog. Catalog được duyệt tiếp tục đóng khi chưa đủ evidence.

### Bước 6 — Pilot text + hình, rồi mới quyết định khóa học

1. Tách “Tìm hiểu” và “Thực hành”; đoạn text ngắn, hình có chú giải; chuyển động khó diễn tả cần media phù hợp đã duyệt.
2. Chuẩn bị protocol 5–8 người, hai vòng định tính; hỏi hiểu mục tiêu, theo cue, dừng/đổi, nhận biết ai duyệt và nơi lưu phản hồi.
3. Đo lỗi hiểu sai, cần trợ giúp, thời gian chọn, lý do quay lại và giờ biên tập/sửa/review mỗi bài. Không lấy completion làm hiệu quả sức khỏe.
4. Nếu nội dung và nhu cầu học theo thứ tự được xác nhận, thiết kế khóa5–7 bài với prerequisite, progression, ôn tập và trợ giúp; vẫn hỗ trợ lựa chọn buổi hôm nay.
5. AI runtime chỉ chọn ID đã duyệt; mở capability/inference là operation riêng có consent, privacy, spend controls và kill switch.

### Bước 7 — Kiểm chứng, review và bàn giao

1. Worker chỉ chạy checks tập trung; root chạy build/runtime/catalog/scanner/Sites và toàn UI suite sau cùng, môi trường giả `.invalid`.
2. Reviewer độc lập đọc diff và guards; P1/P2 được sửa + kiểm lại phạm vi liên quan. Không sửa checker hoặc lock để lấy PASS.
3. Root kiểm screenshots mới trên candidate, tên nhãn/focus/touch/reflow; lưu evidence gắn hash. Local pass không thay physical test.
4. Xuất manifest candidate và patch so với snapshot baseline, báo rõ phần hoàn thành/chưa làm/blocker.
5. Tích hợp về checkout/native build/rollout cần packet mới gắn đúng source/artifact; không reuse native packet cũ. Release chỉ theo gate đã có.

## Quản lý hạn mức

Snapshot đầu lượt: 29% đã dùng trong cửa sổ7 ngày, 71% còn lại, cửa sổ phụ không có dữ liệu. Không phải cam kết đủ token hoặc ngân sách riêng của nhiệm vụ.

- Chỉ ba worker đồng thời, brief ngắn và `fork_turns:none` khi cần chọn model; agent đọc đúng file cần thiết.
- Không để mỗi agent chạy toàn suite, browse lại audit hoặc tạo thêm sub-agent. Root điều phối build/review một lần cho bản cuối.
- Mỗi task có một checkpoint file; nếu hết hạn mức có thể tiếp tục từ diff/evidence mà không lặp live action.
- Không tự dùng reset credit, mua credit, bật AI trong app, đổi model toàn chat hoặc tạo automation.
- Nếu runtime từ chối model được chỉ định: dừng task đó, ghi lỗi thực tế và cung cấp brief/model/reasoning để Owner cấu hình. Không giả vờ model đã đổi. Hướng dẫn chi tiết nằm trong `AGENT_CONFIGURATION.vi.md`.

## Rollback và quyết định còn cần con người

Candidate riêng nên rollback local bằng việc không tích hợp; không đụng dữ liệu hay APK hiện tại. Nội dung cần người phụ trách có chuyên môn và bằng chứng quyền thật. Việc chọn người, duyệt chuyên môn/rights, thử native/live hoặc phát hành chỉ được chốt trên bộ hồ sơ cụ thể đã chuẩn bị, không yêu cầu Owner phê duyệt chung một danh sách trừu tượng.
