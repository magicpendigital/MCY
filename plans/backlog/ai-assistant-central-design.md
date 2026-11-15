# Thiết kế bổ sung — Trợ lý AI là điểm nhấn trung tâm (đề xuất, chờ Owner duyệt)

Ngày 2026-11-15. Nguồn: yêu cầu của Owner "muốn trợ lý AI là một trong những điểm nhấn trung tâm của ứng dụng; nếu chưa có thì cần thiết kế bổ sung", sau khi Owner đồng ý hướng "xem bài trước, hỏi sau" ([kế hoạch lát 0](../active/2026-11-15-three-tap-guest-path.md)). Đây là **đề xuất**, chưa phải quyết định và chưa phải lệnh làm. Mọi cổng an toàn hiện có giữ nguyên.

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

## 6. Cần Owner quyết

1. **Cập nhật quyết định cũ.** Hiện `AGENTS.md` ghi "chatbot độc lập không phải lối vào chính" và 1.0 "không AI". Đề xuất: cho phép **khe trợ lý ở trung tâm (lớp 1)** trong 1.x, còn AI thật chỉ sau các cổng ở mục 4. Chưa sửa `AGENTS.md` và `PRODUCT_DECISIONS.md` cho đến khi Owner xác nhận.
2. Tên và giọng điệu của trợ lý.
3. Có cho nhập câu tự do ở lớp 3 không (khác hẳn hợp đồng "không văn bản tự do" hiện nay)?
4. AI cho khách hay chỉ cho tài khoản? Đề xuất: chỉ tài khoản (chi phí, an toàn, đồng ý).
5. Người duyệt chuyên môn có tên, và ngân sách OpenRouter.
