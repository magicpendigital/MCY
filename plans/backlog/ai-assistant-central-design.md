# Thiết kế bổ sung — Trợ lý AI là điểm nhấn trung tâm (đề xuất, chờ Owner duyệt)

Ngày 2026-11-15. Nguồn: yêu cầu của Owner "muốn trợ lý AI là một trong những điểm nhấn trung tâm của ứng dụng; nếu chưa có thì cần thiết kế bổ sung", sau khi Owner đồng ý hướng "xem bài trước, hỏi sau" ([kế hoạch lát 0](../active/2026-11-15-three-tap-guest-path.md)). Ngày 16/11 Owner đã quyết 4 trong 5 mục ở mục 6; tên và giọng điệu còn chờ Owner chọn (mục 7). Đây vẫn là **thiết kế, chưa phải lệnh làm**: mỗi lớp cần kế hoạch riêng được duyệt trước khi sửa code. Mọi cổng an toàn hiện có giữ nguyên.

## 1. Kết quả rà soát: có gì, thiếu gì

Trợ lý AI **đã có thiết kế và code, nhưng là một bộ chọn buổi tập ẩn, không phải trợ lý trung tâm.**

Đã có (đọc từ code HEAD `4b8e3c6`):
- Hợp đồng server `reviewed-practice-1` (`supabase/functions/_shared/practiceContract.ts`, `practiceAssistant.ts`): nhận ngữ cảnh kiểu enum (thời gian, năng lượng, ý định, trạng thái cơ thể, mã vùng, nhịp, mức hướng dẫn, sàn); AI chỉ trả **một mã buổi đã duyệt** hoặc `no_match`; không văn bản tự do, không tên/email/lịch sử gửi lên nhà cung cấp.
- Cổng: chỉ staging, nhóm thử tối đa 20 tài khoản, đồng ý AI theo phiên bản, hạn mức lượt, công tắc tắt, ZDR. **AI đang tắt.**
- Giao diện: `PracticeFlowScreen` (thẻ kế hoạch, mở đúng phiên bản bài, dừng, phản hồi); bộ kiểm an toàn 11 ca (`tests/practice-safety-suite.test.mjs`).
- Ghi nhớ nhịp giữa các buổi, có đồng ý riêng (`feedbackMemory.ts`).

Chưa có hoặc đang mâu thuẫn với "điểm nhấn trung tâm":

| # | Khoảng trống | Bằng chứng | Hệ quả |
|---|---|---|---|
| G1 | **Nội dung.** Danh mục buổi đã duyệt rỗng, và là loại bài khác (đọc hình + chữ + âm thanh), không phải 38 video YouTube người dùng thật sự xem | `reviewedPracticeCatalog = []`; `LessonSection` ở `practiceContract.ts` | AI hiện không thể gợi ý một clip nào |
| G2 | **Lối vào.** Chỉ một nút ở bước 2 của check-in, chỉ cho người đã đăng nhập, khi server báo sẵn sàng và trạng thái cơ thể là "ổn" | `CheckinFooter`, `aiPracticeOffered`, `PracticeCapabilityObserver` | Khách (đường chính) không bao giờ thấy; khi check-in thành tùy chọn, nút này gần như biến mất |
| G3 | **Cách tương tác.** Không hội thoại, không giọng nói, không tên, giọng điệu hay nhân vật; mã hội thoại cũ chỉ còn đọc | `index.previous.ts`; kế hoạch 08/11 mục P2 #4 | "Trợ lý" chưa có gì để người dùng gặp |
| G4 | **Vắng đúng lúc cần.** Khi mệt, khó chịu, chưa chắc, đau, server từ chối hoàn toàn | `eligibleSessions` | Người cần hỗ trợ nhất chỉ nhận "không"; chưa có đường nhẹ đã duyệt thay thế |
| G5 | **Vòng học.** Phản hồi sau tập chưa được dùng để chọn buổi kế tiếp; chưa có "vì sao gợi ý này" bằng dữ liệu của chính người dùng | `rememberedPace` tách rời bộ chọn | Mất giá trị của việc điền phản hồi |
| G6 | **Đo lường.** Không có mốc so sánh AI với quy tắc đơn giản | Roadmap Q4 chưa làm | Không biết AI có đáng chi phí và rủi ro |
| G7 | **Phạm vi phát hành.** 1.0 là "không AI"; Production chưa; khóa Edge còn kiểu cũ; nhóm ≤20 | `AGENTS.md`, [kế hoạch 15/11](../active/2026-11-14-roadmap-retention-loop.md) | Trợ lý trung tâm cần quyết định phạm vi mới |
| G8 | **Duyệt chuyên môn.** Chưa có người duyệt có tên; 38 clip chưa có hồ sơ quyền, caption, duyệt (đã duyệt: 0) | `PLAN.md` mục 3 | Nút thắt thật của cả AI lẫn gợi ý theo vùng |

## 2. Nguyên tắc thiết kế (không nới cổng nào)

1. AI **chọn và giải thích**, không soạn động tác, không chẩn đoán, không nói về điều trị (giữ trong hợp đồng).
2. **Không nằm trên đường găng của ≤3 chạm.** Bấm là phát ngay bằng gợi ý theo quy tắc; AI tinh chỉnh bước kế tiếp trong nền, không bắt người dùng chờ.
3. **Trung thực về tên.** Chỉ ghi "AI" khi có mô hình thật; trước đó giao diện ghi "Gợi ý". Cùng một giao diện, sau này chỉ thay bước chọn (đúng với roadmap Q1).
4. Mọi gợi ý có lý do từ dữ liệu xác định, và nhãn "gợi ý theo vùng, chưa phải chỉ định". Không phần trăm cải thiện.
5. Không đưa văn bản tự do tới nhà cung cấp, trừ khi đã qua bộ hiểu ý định có từ vựng đóng và đã được duyệt (lớp 3).
6. Dữ liệu tối thiểu, đồng ý riêng và rút được; khách dùng được lớp 1 đầy đủ.

## 3. Thiết kế: "Trợ lý" gồm ba lớp (tên và giọng điệu để Owner chọn)

| Lớp | Là gì | Có LLM? | Điều kiện mở |
|---|---|---|---|
| **1. Gợi ý** | Bộ quy tắc chọn **chuỗi 3–5 clip** theo vùng, thời lượng, mức; giao diện chính là "khe trợ lý" ở Hôm nay | Không | Nằm trong lát 1; cần nhãn `areas` và nhóm clip Owner chốt |
| **2. Trợ lý chọn** | LLM chỉ **xếp hạng mã** trong danh mục đã duyệt, dùng ngữ cảnh enum và phản hồi đã đồng ý, để cá nhân hóa buổi kế tiếp | Có, sau cổng | Mọi cổng hiện có + danh mục video có siêu dữ liệu đã duyệt + đo so với lớp 1 |
| **3. Trợ lý hội thoại có từ vựng đóng** | Ô "Hôm nay bạn muốn gì?" (chip + câu ngắn hoặc giọng nói) được ánh xạ sang enum (vùng, thời gian, ý định); trả lời bằng **mẫu cố định + tên bài**; không lưu câu chữ, không ghi log; từ khóa đỏ dừng ngay ở màn an toàn | Có, bộ hiểu ý định | Bộ kiểm an toàn mở rộng, duyệt chuyên môn, chính sách dữ liệu cho văn bản nhập |

### Vị trí trong ứng dụng (khe trung tâm)

```
HÔM NAY (tab đầu = nơi trợ lý sống)
  Lời chào ngắn + [Tiếp tục: bài gần nhất]
  "Hôm nay bạn muốn gì?"  chip: Cổ & vai · Lưng · Hông & chân · Toàn thân  [nhập/giọng nói — lớp 3]
  → bấm = phát ngay chuỗi gợi ý, thẻ nhỏ "Vì sao: bạn chọn Cổ & vai, ~3 phút"
TRONG CHUỖI    "Bài tiếp?" 2 lựa chọn (nhẹ hơn · giữ nhịp), không chặn video
CUỐI CHUỖI     Phản hồi 1 chạm → "Mình gợi ý tiếp: …" (lớp 2 dùng phản hồi này)
HÀNH TRÌNH     "Trợ lý ghi nhận" = tóm tắt dữ liệu thật, không % cải thiện
NHẮC TẬP       (giai đoạn C) cùng giọng của trợ lý, cục bộ, không thu thêm dữ liệu
```

- **Khách:** lớp 1 đầy đủ, 3 chạm. **Tài khoản (mời sau buổi thứ 2–3):** thêm lớp 2, 3 và trí nhớ. Đây là lý do rõ ràng để tạo tài khoản ("để trợ lý nhớ nhịp của bạn"), giải quyết chính cái ngại điền form.
- **Trạng thái và lỗi:** đang chọn (không chặn phát) · không có bài khớp ("chưa có bài đúng vùng này; đây là bài nhẹ chung") · hết lượt trong ngày · mất mạng (lớp 1 vẫn chạy) · rút đồng ý giữa chừng · nút Dừng luôn có.
- **Đang đau, mệt, khó chịu, chưa chắc:** không xếp hạng bằng AI (giữ). Thay vì "không", hiện **chuỗi nhẹ nhất đã duyệt** + câu "dừng nếu đau tăng" + gợi ý gặp người hướng dẫn. Nội dung chuỗi này do người duyệt chuyên môn định; chưa định thì chỉ hiện câu dừng và thư viện (R3).
- **Nhân vật/avatar:** hoãn (Q7). Chỉ có tên và giọng văn bản.

## 4. Điều phải có trước khi AI thật là điểm nhấn

1. Siêu dữ liệu cho 38 clip (vùng, mức, năng lượng phù hợp, cờ "cho AI chọn", điều cần tránh) và **người duyệt chuyên môn có tên**; hồ sơ quyền, caption.
2. Đổi hợp đồng server từ "buổi đọc đã duyệt" sang "chuỗi clip đã duyệt" (đổi phiên bản hợp đồng, R3, kiểm thử an toàn chạy lại).
3. Hạn mức tiền trên OpenRouter, đồng ý AI được duyệt, chuyển khóa nền tảng trước Production, rà Data safety.
4. Đo lường tối thiểu có đồng ý (Q4) để so lớp 2 với lớp 1.

## 5. Lộ trình đề xuất

| Bước | Nội dung | Mức | Phụ thuộc |
|---|---|---|---|
| P0 | Lát 0 (đang làm): khách vào Hôm nay, ≤3 chạm | R1 | — |
| P1 | Lát 1: chip theo vùng + chuỗi clip tự chuyển = **lớp 1 và khe trợ lý** | R2–R3 | Owner chốt nhãn, nhóm clip; thử tự phát trên iOS 15/Android |
| P2 | Duyệt và gắn siêu dữ liệu 38 clip; đổi hợp đồng server | R3 | Người duyệt chuyên môn |
| P3 | Lớp 2 trên staging, nhóm ≤20, so với lớp 1 | R3 | P2 + hạn mức tiền + đồng ý |
| P4 | Lớp 3 (câu ngắn/giọng nói, từ vựng đóng) | R3 | Bộ kiểm an toàn mở rộng, chính sách dữ liệu |
| P5 | Trí nhớ + nhắc tập; thí nghiệm phương án C (feed dọc) song song, tách riêng | R2–R3 | Giai đoạn C của roadmap |

Phương án C (feed dọc kiểu Shorts) Owner đã đồng ý thử: làm thành một thí nghiệm có kế hoạch riêng, không chặn P1–P4. Nó dùng cùng danh mục clip, nên P2 là điều kiện chung.

## 6. Quyết định của Owner (2026-11-16)

| # | Quyết định | Hệ quả |
|---|---|---|
| 1 | **Cho phép khe trợ lý ở trung tâm** (lớp 1 là gợi ý theo quy tắc) | Làm trong lát 1. AI thật vẫn chỉ sau các cổng ở mục 4. Giao diện chỉ ghi "AI" khi có mô hình thật. |
| 2 | **Có cho nhập tự do ở lớp 3** | Đồng ý về nguyên tắc. Mục 8 là ràng buộc **đề xuất**; cần kế hoạch R3 riêng, bộ kiểm an toàn mở rộng và Owner duyệt chính sách dữ liệu trước khi bật. |
| 3 | **AI chỉ cho tài khoản** | Khách chỉ dùng lớp 1 (chip, quy tắc). Khớp với việc mời tạo tài khoản sau buổi thứ 2–3. |
| 4 | **Ngân sách OpenRouter chỉ do Owner duyệt và quyết định** | Agent không đề xuất con số, không đặt hay đổi hạn mức/cổng chi tiêu; chỉ báo khi một bước cần chi phí. Giữ đúng quy tắc hiện có. |
| 5 | Tên và giọng điệu | Chờ Owner chọn từ phân tích ở mục 7. |

Còn mở: người duyệt chuyên môn có tên (G8), cũng là điều kiện cho mục 2 vì danh sách từ khóa dừng cần người có chuyên môn xem.

## 7. Tên và giọng điệu: phân tích và đề xuất (chờ Owner chọn)

Tiêu chí: hợp thương hiệu (Một chút yoga, "Vạn chút an yên", mẫu "Khoảng mở"); dễ gõ và dễ nói tiếng Việt; không giả làm người hay người hướng dẫn thật (giữ trung thực, không nhầm với giảng viên Huyền My); không đụng chức năng khác; đọc trơn trong câu giao diện. Việc kiểm nhãn hiệu chưa làm, cần Owner hoặc người phụ trách pháp lý.

| Phương án | Điểm mạnh | Điểm yếu | Nhận xét |
|---|---|---|---|
| **A. "Chút"** (Trợ lý Chút) | Lấy từ chính thương hiệu; ngắn, ấm, gọi được ("Chút ơi"); hợp slogan "Vạn chút an yên" | "chút" là từ rất thường gặp trong giao diện ("một chút", "hơi chút") nên dễ đọc nhầm; trung tính về giới | **Đề xuất.** Luôn viết kèm "Trợ lý Chút" ở lần đầu và trong nhãn; tránh dùng "chút" làm danh từ chung gần tên. |
| **B. "Nhịp"** (Trợ lý Nhịp) | Mô tả đúng việc (chọn nhịp tập), không giống người | Trùng khái niệm "nhịp tập" và "nhịp tuần" (roadmap Q6); kém ấm | Dự phòng nếu A gây nhầm. |
| **C. "An"** | Gợi "an yên" | Là tên người rất phổ biến, dễ bị coi là người thật hoặc gán giới; khó nghe trong giọng nói | Không đề xuất. |
| **D. Không đặt tên** ("Gợi ý của Một chút") | An toàn nhất về trung thực | Khó thành điểm nhấn trung tâm | Dùng cho lớp 1 nếu Owner muốn giữ tên tới khi có AI thật. |

Đề xuất: **A, "Chút"**. Khi lớp 1 chưa dùng AI, thẻ ghi rõ "Gợi ý theo vùng bạn chọn · chưa dùng AI"; khi lớp 2 bật, đổi thành "Gợi ý bởi AI · chỉ chọn trong bài đã duyệt". Chưa có hình đại diện (đã hoãn). Bản tiếng Anh để sau (Production chỉ tiếng Việt); không tự đặt tên Anh.

**Giọng điệu** (đề xuất, mọi câu dưới đây là bản nháp cần Owner đọc và kiểm dấu tiếng Việt):
- Xưng "mình", gọi "bạn" (đã dùng ở màn "Phạm vi hỗ trợ"). Câu ngắn, tối đa hai câu mỗi lần, bình tĩnh, không dấu chấm than, không biểu tượng cảm xúc.
- Mời, không ra lệnh: "bạn có thể thử", không "hãy phải". Không hứa kết quả cơ thể, không từ "chữa", "giảm đau", "cải thiện". Không so sánh, không nhắc nợ hay tạo cảm giác có lỗi khi bỏ buổi.
- Nói thật về giới hạn: không có cảm xúc hay trải nghiệm riêng; nói rõ khi chưa có bài khớp; không thay người hướng dẫn.
- Câu an toàn (đau, dừng, từ khóa đỏ) là **mẫu cố định**, không do mô hình sinh ra.

| Trạng thái | Câu mẫu (nháp) |
|---|---|
| Chào | "Chào bạn. Hôm nay bạn muốn tập gì?" |
| Gợi ý | "Mình chọn 3 bài ngắn cho vùng cổ và vai, khoảng 3 phút. Bạn có thể dừng bất cứ lúc nào." |
| Lý do | "Vì bạn chọn cổ và vai." |
| Chưa có bài khớp | "Mình chưa có bài khớp với lựa chọn này. Đây là vài bài nhẹ nhàng chung." |
| Sau phản hồi | "Cảm ơn bạn đã ghi lại. Mình sẽ nhớ nhịp này nếu bạn cho phép." |
| Đau hoặc khó chịu | "Nếu bạn đang đau hoặc khó chịu, hãy dừng lại và nghỉ. Mình không thay được người hướng dẫn." |
| Hết lượt trong ngày | "Hôm nay mình hết lượt gợi ý. Bạn vẫn tự chọn bài được." |
| Nhãn AI | "Gợi ý bởi AI · chỉ chọn trong bài đã được duyệt" |

## 8. Nhập tự do ở lớp 3: ràng buộc đề xuất (chưa được duyệt)

Quyết định của Owner mở đường, nhưng hợp đồng hiện nay cố ý **không** nhận văn bản tự do. Đề xuất đi theo hai bước để dữ liệu rời máy ít nhất:

1. **Bước 3a, không nhà cung cấp.** Bộ hiểu ý định chạy trên máy: chuẩn hóa chữ (bỏ hoa thường, so khớp không dấu), bảng đồng nghĩa cho vùng, thời gian và ý định ("mỏi vai", "5 phút", "thư giãn"), tối đa khoảng 120 ký tự (con số để thử). Không hiểu thì hỏi lại bằng chip, không đoán. Danh sách từ khóa dừng ("đau dữ dội", "tê", "chóng mặt", "khó thở", "chấn thương", "thai", "mới phẫu thuật"…) do **người có chuyên môn** duyệt; khớp thì hiện câu dừng cố định và dừng hẳn, không gọi nhà cung cấp, không lưu.
2. **Bước 3b, chỉ khi 3a chưa đủ.** Bộ phân loại bằng mô hình ánh xạ câu sang enum; chỉ gửi đúng câu đó (không danh tính, lịch sử), ZDR, kết quả ép về enum bằng JSON Schema, vứt câu ngay sau khi xử lý, không ghi log, có giới hạn tần suất. Chống chèn lệnh: đầu ra không thể ra ngoài enum.

Chung: câu nhập không vào Hành trình, không thành bản ghi quan sát; chỉ enum suy ra mới dùng, và là "ý định tập", không phải "vùng khó chịu". Lời đồng ý AI cần chữ mới nói rõ có gửi câu nhập (đổi phiên bản đồng ý, mọi người được hỏi lại; chữ do Owner duyệt, không phải phê duyệt pháp lý). Mở rộng `tests/practice-safety-suite.test.mjs`: chèn lệnh, hỏi chẩn đoán hoặc điều trị ("bị thoát vị đĩa đệm nên tập gì"), trẻ em, nội dung tự hại, ngôn ngữ lẫn. Chỉ tài khoản dùng 3b (quyết định 3). Khách có dùng bộ 3a hay chỉ chip: đề xuất chỉ chip ở bước đầu cho đơn giản.
