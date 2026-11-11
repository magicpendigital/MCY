# Workspace nội dung, nhãn tác giả và trợ lý AI: phân tích, thiết kế và kế hoạch — 2026-11-08

Tài liệu đi kèm canvas thiết kế **MCY – Thiết kế lại bài giảng & Giảng viên** (các bảng E0–E8 và G1–G6, https://claude.ai/artifact/EiRTkMXwoqc4qZr2C1G61Y). Đây là **đề xuất, chưa phải phê duyệt**. Không có thay đổi nào lên cloud, điện thoại hay Play trong lượt này.

## 1. Kiểm tra lại bài đọc đã bật

- Máy chủ đang công bố **6 bài** (manifest tạo 2026-11-04 04:52 UTC): Rắn hổ mang (2 bản), Đầu bò, Chó úp mặt, Bò–Mèo, Đứng và nhận biết điểm tựa.
- Kiểm tra bằng tải trực tiếp từ bucket công khai: cả 6 tệp bài trả 200, mọi hình tải được, **không còn chữ nội bộ** (nháp, brief, nguồn local…). Khách (chưa đăng nhập) thấy mục “Bài đọc có hình” và mở được bài có hình ở bước 1.
- **Chó ba chân** đủ điều kiện nhưng chưa được bật; Chiến binh II, Trường tấn cao vẫn bị giữ vì còn chữ “Bài nháp”; 5 bài chỉ chữ vẫn tắt.
- Chưa có kiểm tra trên điện thoại thật (TalkBack, cỡ chữ lớn).

## 2. Hai vấn đề Owner nêu

**a. Bài đọc lấn át video.** Trong bản 1.0.3, mục “Bài đọc có hình” nằm đầu Khám phá, trên cả các nhóm video, với tiêu đề lớn và 3 dòng. Đã sửa trong mã (commit `083673d`, chưa đẩy, chưa phát hành): mục chuyển xuống **dưới** nhóm video, nhãn “ĐỌC THÊM”, tiêu đề nhỏ, tối đa 2 dòng, có đường kẻ ngăn. Thiết kế tương ứng: bảng E6, E7, E8.

**b. Màn bắt đầu bị đổi chữ mà Owner không biết.** Nguyên nhân tìm được: commit `2874cf0` (2026-10-27, phát hành ở đợt 3, 1.0.1) thay ba dòng lợi ích đã chốt ngày 2026-10-23 (`ac7b6aa`) bằng “38 bài học ngắn, xem miễn phí / Ghi lại cơ thể hôm nay, riêng tư / Không cần tài khoản”. Đó là quyết định của agent, không có xác nhận của Owner, và ghi chú đợt 3 chỉ nói “luồng khách rút gọn”. Cùng commit đó còn bỏ bước năng lượng/thời gian cho khách. Đã làm: khôi phục đúng ba dòng đã chốt (vi và en) và sửa test; **chưa đảo** việc bỏ bước năng lượng/thời gian của khách vì chưa rõ Owner muốn gì (xem mục 7).
Biện pháp lâu dài: văn bản màn hình trở thành nội dung có phiên bản, dòng “đã chốt” không đổi được nếu Owner chưa xác nhận, có nhật ký thay đổi (bảng E5).

## 3. Rà soát logic trợ lý AI (đối chiếu mã HEAD)

Luồng: check-in bước 2 → năng lực (server) → đồng ý AI → lọc cứng → mô hình chỉ trả mã buổi → kiểm tra đầu ra → thẻ kế hoạch → bắt đầu → ghi cảm nhận. Mọi cổng mặc định **đóng**, danh mục buổi đã duyệt **rỗng**, nên học viên hôm nay không thấy nút AI và mọi lần chọn sẽ ra “không khớp”. Trạng thái deploy live của hàm và migration admission **chưa xác minh**.

| # | Mức | Phát hiện | Tình trạng |
|---|---|---|---|
| 1 | P1 | Mô hình không có tín hiệu để xếp hạng: ứng viên chỉ có nhịp, cách hướng dẫn, chạm sàn, mà cả ba đã lọc cứng; năng lượng và ý định gửi đi nhưng không có trường để khớp. Tốn lượt mà không tăng chất lượng | Cần thiết kế dữ liệu danh mục và quy tắc “1 ứng viên thì không gọi mô hình” |
| 2 | P1 | Danh sách vùng cơ thể ở server thiếu `glute` → chọn Mông thì server trả 400 | **Đã sửa** + test (`practiceContract.ts`, `practice-assistant.test.mjs`); chưa triển khai Edge |
| 3 | P2 | Nút AI hiện cả khi trạng thái mệt, khó chịu, đau, chưa chắc, dù server từ chối hoàn toàn; thông báo “không khớp” chỉ giải thích 2 trong 4 trường hợp | Chưa sửa |
| 4 | P2 | Công tắc đồng ý AI hiện cả khi AI chưa tồn tại; chữ “trao đổi ngắn”, “mã vùng” nói quá so với thực tế (không có chat) | Chưa sửa |
| 5 | P2 | Song ngữ chưa đủ; session phải khớp ngôn ngữ nhưng capability không xét ngôn ngữ | Chưa sửa |
| 6 | P2 | So tên mô hình bằng “bằng nhau” dễ báo lỗi sau khi đã tốn token; dòng “đang xử lý” bị treo vẫn tính lượt 24 giờ | Chưa sửa |
| 7 | P2 | Đồng ý AI không gồm “dữ liệu sức khỏe” dù trợ lý xử lý trạng thái cơ thể | Cần Owner quyết |
| 8 | P3 | “Bắt đầu” không gắn với lựa chọn của AI; đồng hồ máy chậm làm thẻ bị từ chối; cờ “dừng” ở server là nhánh chết; mã cũ (handler `reply`, `dialogue.*`, prompt chỉ đọc) còn sót | Dọn khi làm |

Điểm tốt đã xác nhận: dữ liệu gửi mô hình tối thiểu (không tên, email, ghi chú, lịch sử), quota và kill switch được đọc lại trước và sau khi gọi, kết quả đến muộn bị bỏ, tiền do Owner quản trên OpenRouter.

## 4. Mô hình workspace nội dung (bảng E0–E5)

**Hiện trạng** (từ rà soát mã): chỉ có **bài đọc** (công tắc hiển thị) và **cấu hình AI** sửa được không cần phát hành. Mọi thứ khác nằm trong mã: 38 video và 3 nhóm khóa (`freeCourses.ts`), thẻ bài (suy từ tiêu đề bằng regex), lợi ích/lưu ý, toàn bộ chữ màn hình (`i18n.ts` và chữ trong `Prototype.tsx`), văn bản đồng ý. Giảng viên có hai hệ thống nháp song song (bảng `sessions` cũ và “collaboration”), cả hai **không có đường xuất bản** và học viên không đọc được. Owner **không đọc được** nội dung giảng viên. Không màn học viên nào hiện tên tác giả; không có khái niệm “Editor choice / MCY biên soạn”.

**Đích:**
1. Một bảng nội dung chung có phiên bản bất biến: `loại` (bài video, nhóm khóa, bài đọc, lời hướng dẫn, văn bản màn hình), `tác giả` (giảng viên hoặc MCY), payload JSON kiểm tra chặt, băm nội dung.
2. Một dòng chảy: soạn → gửi duyệt → Owner đánh giá (tự khai chuyên môn, bản quyền, 8 mục) → công tắc hiển thị + vị trí + nhãn → ảnh chụp công khai cho app (giống bài đọc hôm nay), app có bản dự phòng đóng gói sẵn.
3. Giảng viên chỉ thấy và sửa nội dung của mình; sửa nội dung đang hiển thị thì bản cũ vẫn chạy tới khi Owner duyệt bản mới.
4. Owner thấy tất cả (của mình, của giảng viên, hệ thống) ở một danh sách; soạn được nội dung MCY (nhãn “Lựa chọn của biên tập · MCY biên soạn”).
5. Nhãn tác giả lấy từ hồ sơ giảng viên **đã kích hoạt và đồng ý hiển thị**, chụp vào dữ liệu công khai lúc xuất bản, không đọc trực tiếp lúc chạy. Không ghi tên khi chưa đủ điều kiện.

**Phần giữ là mã, không đưa vào workspace** (lý do): danh mục vùng cơ thể (ràng buộc CHECK + allow-list SQL + regex Edge cùng phụ thuộc); phiên bản văn bản đồng ý (nằm cứng trong SQL); trang pháp lý tĩnh. Mỗi thứ cần migration hoặc quy trình pháp lý riêng.

**Ràng buộc phải giữ:** Owner tự gõ khai báo cho từng nội dung kể cả nội dung của mình (không ai duyệt thay); ghi bằng RPC service-role, không ghi trực tiếp từ client; không đưa bản nháp riêng tư vào bundle client; bộ lọc chữ nội bộ vẫn chạy khi xuất bản; giới hạn thao tác theo 24 giờ và nhật ký kiểm toán; Edge hiện khóa cứng vào URL staging.

## 5. Kế hoạch phát triển (đề xuất, theo thứ tự)

Ký hiệu cỡ việc: S nhỏ (vài giờ), M vừa (1–3 ngày làm việc), L lớn (hơn 3 ngày). Mỗi giai đoạn xong phải có bằng chứng kiểm thử, không tự phát hành.

**Giai đoạn 0: dọn ngay (S, trong mã, không đụng cloud)**
- Đã làm: video lên đầu Khám phá, khôi phục chữ màn bắt đầu, sửa vùng Mông trong hợp đồng AI. Cần: Owner quyết mục 7.1 (bước năng lượng của khách); phát hành đợt 6 khi Owner yêu cầu.
- Ẩn nút AI theo trạng thái cơ thể và cải thiện thông báo “không khớp” (P2 #3); ẩn công tắc đồng ý AI khi AI chưa có (P2 #4).

**Giai đoạn 1: nền nội dung có phiên bản (M–L)**
- Migration bảng nội dung, phiên bản, trạng thái; Edge action `save/read/list/submit`, `owner_list`, `owner_review` (dùng lại mô hình khai báo hiện có); rehearsal SQL (PGlite) trước khi áp lên staging.
- Nhập 14 bài đọc và 3 nhóm khóa/38 video vào bảng (trạng thái “đã duyệt theo bản hiện tại”, Owner xác nhận từng nhóm, không tự duyệt thay).
- Hợp nhất hai hệ thống nháp của giảng viên về một.

**Giai đoạn 2: workspace Owner (M–L)** — bảng E0, E1, E2, E5. Tổng quan, hàng chờ, màn đánh giá có “xem như học viên”, cấu hình hiển thị (thứ tự khu, chính sách chung, Lựa chọn của biên tập), nhật ký thay đổi, khóa dòng đã chốt.

**Giai đoạn 3: workspace giảng viên và nhãn tác giả (M–L)** — bảng E3, E4, E7. Soạn/sửa, trạng thái, nhận xét từ Owner, đồng ý hiển thị tên; ảnh chụp công khai kèm `author`; app đọc và hiện nhãn. Cần: có ít nhất một hồ sơ giảng viên đã kích hoạt (hiện chưa có).

**Giai đoạn 4: video và chữ màn hình cấu hình được (M)** — app đọc ảnh chụp, có bản dự phòng đóng gói; chuyển chữ màn hình sang bảng có khóa “đã chốt”; thẻ bài (vùng, mức, thời lượng) thành trường rõ ràng thay cho regex.

**Giai đoạn 5: trợ lý AI dùng được (L)** — bảng G1–G6.
1. Siêu dữ liệu danh mục: thời lượng, nhịp, năng lượng phù hợp, vùng tập trung, chống chỉ định đã khai, cờ “cho AI chọn” (gắn với duyệt chuyên môn).
2. Quy tắc chọn: lọc cứng → 1 ứng viên thì chọn luôn → nhiều ứng viên thì xếp hạng bằng mô hình với tín hiệu thật; lời giải thích là mẫu cố định đã duyệt.
3. Bộ kiểm tra an toàn chạy tự động (ca đau/mệt, không khớp, vùng Mông, tiếng Anh) làm điều kiện bật.
4. Sửa P1/P2 còn lại; chuyển nhóm thử nghiệm từ biến môi trường vào workspace; hiện lượt dùng, token, cảnh báo 80%.
5. Thử thật có kiểm soát trên staging với nhóm ≤ 20 người; đo tỷ lệ chọn được/không khớp.
- Điều kiện mở: có ≥ 5 buổi được chuyên gia và bản quyền duyệt, đã đặt hạn mức tiền trên OpenRouter, văn bản đồng ý AI được duyệt. **Kỹ thuật không thay được chuyên gia yoga.**

**Giai đoạn 6: sau thử nghiệm (L)** — ghi nhớ giữa các buổi (cần thiết kế đồng ý và xóa dữ liệu riêng), hội thoại ngắn nếu còn cần, mở production (sửa khóa cứng staging, rà Data safety).

## 6. Rủi ro
- Nhập nội dung hiện có vào dòng duyệt mà không có chuyên gia: dễ biến thành “duyệt cho xong”. Giữ nguyên nguyên tắc khai báo của chính Owner.
- Hai hệ thống duyệt (collaboration và content-review) hiện không liên kết: nếu không hợp nhất sẽ có hai nguồn sự thật.
- Phạm vi lớn; nên cắt theo giai đoạn và phát hành từng phần, mỗi lần theo quy trình `mcy-release-sync`.
- Thiết kế canvas chưa được xem lại bằng mắt trên mọi khung hình; mô phỏng dùng dữ liệu minh họa, tên giảng viên để trong ngoặc vuông.

## 7. Việc cần Owner quyết
1. **Bước năng lượng/thời gian cho khách** (bỏ ở 2874cf0): giữ như hiện tại hay trả lại?
2. Cho phép Owner **tự duyệt nội dung do chính mình soạn** (nhãn “MCY biên soạn”) hay cần người thứ hai?
3. Đồng ý AI có cần thêm đồng ý “dữ liệu sức khỏe” không?
4. Bật thêm **Chó ba chân** (đủ điều kiện) và khi nào nhờ chuyên gia xem hình.
5. Ai là giảng viên đầu tiên được kích hoạt hồ sơ để dựng nhãn tác giả (tên lấy từ tài khoản, không ghi cứng).
6. Thứ tự ưu tiên giữa giai đoạn 1–4 (nội dung) và giai đoạn 5 (AI). Đề xuất: 0 → 1 → 2 → 5 (song song phần dữ liệu danh mục) → 3 → 4.

## 8. Quyết định của Owner (2026-11-08, sau khi đọc kế hoạch)
1. **Bước năng lượng/thời gian cho khách:** giữ như hiện tại (đã bỏ ở 2874cf0). Không đảo lại.
2. **Owner được tự duyệt nội dung do chính mình soạn** (hiển thị “MCY biên soạn”). Mỗi lần vẫn ghi nhật ký: ai duyệt, lúc nào, phiên bản nào.
3. **Quy tắc duyệt là cấu hình trong workspace**, không cố định trong mã: do người có quyền duyệt (và, khi được bật, trợ lý AI hỗ trợ) quyết định ai duyệt loại nội dung nào, cần mấy người, bước nào AI được gợi ý. Cần thiết kế màn “Quy tắc duyệt” vào giai đoạn 2. Vẫn giữ nguyên: AI chỉ gợi ý, không tự bấm duyệt thay người; các cổng an toàn của trợ lý (danh mục đã duyệt chuyên môn và bản quyền) không bị cấu hình này gỡ bỏ. Ghi chú rủi ro: Owner tự duyệt chưa thay được duyệt chuyên môn yoga hoặc y tế cho nội dung có hướng dẫn động tác.
4. **Giảng viên đầu tiên:** Huyền My (địa chỉ email do Owner cung cấp trong chat, không ghi vào tài liệu theo quy tắc của dự án). Tên hiển thị lấy từ hồ sơ tài khoản sau khi kích hoạt. Mời và kích hoạt vẫn cần yêu cầu riêng của Owner và các cổng (hồ sơ giảng viên, quyền, SMTP) đạt.
5. **Ưu tiên nội dung trước AI:** thứ tự 0 → 1 → 2 → 3 → 4, giai đoạn 5 (AI) làm sau; chỉ phần dữ liệu danh mục AI làm song song khi nội dung đã có bản duyệt.
6. **Phát hành đợt 6** gồm các sửa trong mã đã cam kết cục bộ (083673d, d042132).
7. Việc còn mở: bật Chó ba chân và nhờ chuyên gia xem hình; đồng ý AI có cần thêm “dữ liệu sức khỏe” (mục 3 cũ) chưa được trả lời.

## 9. Quyết định bổ sung của Owner (2026-11-08, sau đợt 6)
- **Chưa cần thêm đồng ý “dữ liệu sức khỏe” cho trợ lý AI.** Chỉ khi có tính năng kết nối thiết bị theo dõi sức khỏe (vòng đeo tay, đồng hồ thông minh) mới cần đồng ý riêng loại dữ liệu này. Mục 7.3 đóng lại; đồng ý AI hiện có giữ nguyên.
- Yêu cầu: **triển khai giai đoạn tiếp theo (giai đoạn 1: nền nội dung có phiên bản)**. Phạm vi làm trong mã cục bộ và kiểm thử; áp migration, triển khai Edge và phát hành app vẫn cần yêu cầu riêng của Owner.

## 10. Rà soát kế hoạch theo dữ liệu mới nhất (2026-11-11)

**Dữ liệu mới từ 8/11:**
- **iPhone iOS 15 thật (Owner báo 11/11, bản iOS phụ chưa biết):** lỗi hiển thị lúc mở app đã hết; còn lỗi **bấm vào ô ghi chú thì màn hình phóng to**. Đây là lần kiểm tra thiết bị thật đầu tiên có kết quả; ghi là “Owner báo”, chưa phải một lượt kiểm đủ sáu màn. Điều tra và sửa ở INC-005 (`docs/quality/KNOWN_INCIDENTS.md`): hai ô ghi chú đã 16px nên không giải thích được lỗi; tìm thấy các ô nhập khác dưới 16px (đăng nhập, mã xác minh, select, workspace) và đã nâng lên; thêm lớp bảo vệ iOS và bảng số đo `?debug=viewport`. Nguyên nhân thật của ô ghi chú **chưa chứng minh**.
- **Đợt 8 (1.0.6) đã phát hành** trên web, máy thử và Play Internal testing (commit `aef1f47`). Web Preview hiện **đi trước** Play và máy thử vì các commit phát triển sau đó đã được đẩy.
- **Staging:** migration tới `20261110175347` (ảnh chụp công khai có thể kèm chữ màn hình), Edge `owner-control-plane` v12. `manifest.json` vẫn chưa được ghi; chưa có chữ màn hình hay hồ sơ giảng viên nào được tạo.
- **CI:** lần đầu toàn bộ Playwright chạy trên CI qua một lần đẩy (216 đạt, 1 lỗi do test mới của chính ta, đã sửa); CI xanh ở `9216a24`. Chưa có lần chạy toàn bộ sạch trên máy.
- **Công cụ:** connector Supabase từng bị tắt ở cài đặt công cụ và chặn việc áp migration vài giờ; không dùng đường vòng. Bài học: kiểm tra quyền công cụ **trước** khi hứa áp migration.

**Trạng thái từng giai đoạn:**

| Giai đoạn | Trạng thái | Còn lại / bị chặn bởi |
|---|---|---|
| 0 Dọn ngay | Gần xong: video lên đầu, chữ màn bắt đầu, vùng Mông, ẩn nút AI khi trạng thái bị từ chối (mã đã đẩy, chưa vào bản) | P2 #5 (ngôn ngữ trong capability), #6 (so tên mô hình, dòng “đang xử lý” treo), #8 (mã cũ) |
| 1 Nền nội dung | Xong, đã áp staging | Nhập danh mục (`import_catalog`) chỉ chạy trong phiên của Owner |
| 2 Workspace Owner | Xong, đã áp staging | Owner dùng thật: bật hiển thị để ghi `manifest.json` |
| 3 Giảng viên + nhãn tác giả | Mã và staging xong | **Chưa có hồ sơ giảng viên kích hoạt** (Huyền My): cần Owner mời và kích hoạt |
| 4 Video và chữ màn hình | **Xong về mã và staging** (vùng bài do tác giả chọn đã phát hành; chữ màn hình 4 khóa, còn lại khóa “đã chốt”) | Chữ màn hình chưa vào Play/máy thử (đợt 9); **hai quyết định mở:** thẻ “mức” (cần thang do chuyên gia xác nhận) và nhãn “HÌNH AI” (luôn hiện, không cho ẩn) |
| 5 Trợ lý AI | Có một phần mã: một ứng viên thì chọn luôn, tín hiệu tùy chọn, bộ kiểm tra an toàn 11 ca, ẩn nút AI; **AI vẫn tắt** | ≥ 5 buổi được chuyên gia và bản quyền duyệt; hạn mức tiền trên OpenRouter do Owner đặt; duyệt văn bản đồng ý AI; nhóm thử trong workspace; hiện lượt dùng và cảnh báo 80%; thử có kiểm soát |
| 6 Sau thử nghiệm | Chưa bắt đầu | Phụ thuộc giai đoạn 5 |

**Thứ tự ưu tiên đề xuất (thay mục 7.6 cũ):**
1. **Vòng kiểm tra iOS 15 (chặn chất lượng):** phát hành đợt 9 mang các sửa INC-005 (và chữ màn hình), rồi Owner đo trên iPhone: ghi bản iOS, mở `?debug=viewport`, bấm ô ghi chú vùng, ô cảm nhận, ô email, gửi ảnh chụp bảng số đo. Nếu vẫn phóng to, số đo quyết định bước tiếp (cuộn vùng `overflow:hidden` hay hình học `visualViewport`); sửa nguyên nhân thứ hai nằm ở runtime được bảo vệ (`src/mobile`): **Owner đã cho phép có điều kiện (11/11)**, chỉ làm khi số đo chỉ ra nguyên nhân ở đó.
2. **Việc chỉ Owner làm được (phiên của Owner):** bật hiển thị/ghi `manifest.json` để app đọc nội dung từ kho; mời và kích hoạt hồ sơ giảng viên đầu tiên; quyết định Chó ba chân và chuyên gia xem ảnh AI; hai quyết định mở của giai đoạn 4.
3. **Đường găng cho AI là nội dung, không phải mã:** tìm chuyên gia duyệt ≥ 5 buổi; đặt hạn mức OpenRouter; duyệt văn bản đồng ý AI. Mã AI đã sẵn từng phần và không nên làm thêm tính năng cho tới khi có danh mục duyệt (tránh xây trên giả định).
4. **Làm song song, không cần cổng ngoài:** sửa nốt P2 #5, #6, #8 của trợ lý; nhóm thử đưa vào workspace; hiện lượt dùng và cảnh báo 80%.
5. **Quy trình:** mỗi đợt phát hành phải ghi rõ “web đi trước” nếu đẩy trước khi phát hành Android; không đẩy mã giai đoạn mới khi chưa cần.

**Rủi ro cập nhật:**
- Lỗi phóng to là lỗi quay lại lần thứ hai (INC-005): không sửa riêng từng ô nữa mà dùng kiểm tra tự động; nhưng không có WebKit/iOS trong môi trường kiểm thử nên bằng chứng cuối cùng chỉ đến từ thiết bị thật.
- Web đi trước Play: người thử trên Play chưa thấy các sửa mới; đợt 9 xử lý.
- Kế hoạch giai đoạn 5 phụ thuộc người (chuyên gia) và tiền (OpenRouter), không phụ thuộc mã.
