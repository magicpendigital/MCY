# MCY · Đánh giá chiến lược nội dung AI

Ngày 14/10/2026, Asia/Bangkok. Phạm vi: đọc source/tài liệu hiện tại và nguồn chính thức trên web. Đây là tư vấn sản phẩm và quy trình nội dung, không phải thẩm định chuyên môn của một giáo viên yoga, không chứng nhận khóa học an toàn, không kiểm chứng lại trạng thái cloud. Không gọi AI inference, tạo media, chỉnh source, duyệt nội dung hay publish.

## Kết luận

**Nên dùng AI hỗ trợ xây dựng nội dung text và hình; nên tiến tới một khóa nhỏ có giáo viên chịu trách nhiệm nếu thử nghiệm chứng minh người học cần nó. Chưa nên dùng AI tự tạo và phát hành khóa hướng dẫn vận động hoàn chỉnh, hoặc tự sinh bài tập mới cho từng người từ check-in.**

Ý tưởng hợp hướng MCY ở năng lực biến kiến thức thành những phần nhỏ, dễ hiểu, bình tĩnh và dễ quay lại. Giá trị khác biệt cần bán vẫn là một lựa chọn phù hợp hôm nay, hướng dẫn dễ theo và mối quan hệ tin cậy với người chịu trách nhiệm nội dung. “Do AI tạo” là phương thức sản xuất, chưa phải lợi ích mà người học sẵn sàng trả tiền.

Nguồn định hướng: [brand, dòng 13–14](../../brand/BRAND_GUIDELINES.md#brand-core) hứa giúp tìm một buổi phù hợp hôm nay, theo nhịp riêng; [chiến lược, dòng 7–13](../business-plan/01_CHIEN_LUOC_THUONG_HIEU.md) đặt khóa học/thư viện/lớp giáo viên làm lớp hỗ trợ vòng check-in → kế hoạch → thực hành → phản hồi. AGENTS.md dòng 120–125 xác nhận vòng này. Không nên đưa người mới qua một danh mục khóa học dài trước khi có buổi đầu.

## Thực trạng nội dung đọc từ source

| Bằng chứng | Hàm ý |
|---|---|
| `supabase/functions/_shared/reviewedPracticeCatalog.ts:3–6`: catalog được duyệt vẫn là mảng rỗng có chủ đích. | Thiếu nội dung đủ điều kiện là nút thắt hiện tại; không thể giải quyết chỉ bằng bật model hay thêm hình đẹp. |
| `supabase/functions/_shared/contentReviewCandidates.ts:3–17`: chỉ có “Dành một khoảng cho buổi học”, trạng thái draft; 3 phần giới thiệu không hướng dẫn động tác, chung một ảnh phòng, audio en-US. | Đây là mẫu reader để duyệt cách học; không phải mẫu đã chứng minh việc dạy tư thế hoặc khóa thực hành bằng AI. Không gọi nó là buổi yoga được duyệt. |
| `src/courses/freeCourses.ts:3–12,22–32,38–104`: 38 clip thật được nhóm 3 mục, khoảng 17–64 giây; captions chưa được xác minh; metadata hiện chưa biểu diễn prerequisite, equipment, audience hoặc review chuyên môn. | Có nguyên liệu nhưng chưa đủ cơ sở kết luận có 3 khóa với tiến trình học. Thời lượng clip không phải thời lượng thực hành hoàn chỉnh. Cần phân biệt “clip minh họa”, “buổi tập” và “khóa học”. |
| `src/courses/freeCourses.ts:66–86`: nhóm “Làm quen với các tư thế yoga” có các tên như Quạ thấp, Hoang dã cao, Bánh xe thấp. | Tên nhóm dễ tạo kỳ vọng tất cả dành cho người mới. Chưa xem/thẩm định clip nên không kết luận tư thế cụ thể nguy hiểm; nên thêm mức kinh nghiệm, điều kiện trước khi tập và phạm vi do giáo viên xác nhận. |
| `docs/content-review/README.md:7–19,25–33`: đã có workflow Owner/giáo viên được giao, bằng chứng chuyên môn/quyền, hash phiên bản, thu hồi. | Tận dụng hệ này. Vai trò Owner hoặc checkbox approval không tự chứng minh có chuyên môn; technical checker chỉ xác minh tính khớp của hồ sơ. |
| `practiceContract.ts:1,71–75` và `practiceAssistant.ts:69–93`: AI chỉ xếp hạng nội dung đã duyệt bằng sở thích xác nhận; không sinh hướng dẫn, không gửi free text/history; trường hợp reported/uncertain không có ứng viên. | Hướng đề xuất phù hợp kiến trúc hiện có. Không biến ý tưởng sản xuất khóa học thành quyền mở rộng runtime để model tự soạn động tác hay đưa lời khuyên sức khỏe. |

Đây là quan sát source 14/10, không phải readback cloud hay xác nhận nội dung người dùng đang thấy trong APK.

## Phân biệt ba vai trò của AI

| Vai trò | Đánh giá | Cách dùng phù hợp |
|---|---|---|
| AI trong biên tập/sản xuất trước khi xuất bản | Phù hợp cao | Lập dàn bài từ nguồn giáo viên; diễn đạt tiếng Việt dễ hiểu; làm bản dịch nháp; tạo câu hỏi ôn tập, alt text, sơ đồ kiến thức, hình bìa/không gian. Người thật duyệt bản cuối. |
| AI chọn một buổi có sẵn | Phù hợp với giá trị cốt lõi | Chọn trong tập bài được duyệt, theo thời gian và sở thích đã xác nhận; nêu lý do có căn cứ; cho đổi hoặc tự chọn; có no-match trung thực. |
| AI tự tạo chuỗi động tác, điều chỉnh điều trị theo đau, hoặc phát hành khóa tự động | Không phù hợp giai đoạn hiện tại | Cần năng lực chuyên môn/kiểm định khác. Check-in tự báo cáo không phải chẩn đoán và không chứng minh người học đủ điều kiện. |

MCY cần giữ giọng giáo viên riêng. AI viết trơn tru nhưng chung chung có thể làm mất cách giải thích và sự tin cậy khiến học viên chọn MCY ngay từ đầu. Nên xây “ngân hàng cách nói” do người phụ trách viết/duyệt, rồi dùng AI mở rộng trong khuôn khổ ấy.

## Text + hình phù hợp tới đâu?

**Rất phù hợp cho học trước/sau buổi:** cách dùng app; chuẩn bị không gian; hiểu thuật ngữ; đọc kế hoạch; cách lựa chọn; nhắc điểm quan sát đã được duyệt; nhật ký trung tính; câu hỏi ôn tập. Có thể có khóa kiến thức hoàn chỉnh bằng text + hình nếu công bố đúng mục tiêu học và có thẩm định phù hợp.

**Có điều kiện cho thực hành vận động:** hình tĩnh thuận tiện nhìn kỹ vị trí, đọc chậm và tải nhẹ. Nhưng một ảnh đích không thể hiện đầy đủ cách vào/ra tư thế, chuyển trọng lượng, trình tự, tốc độ, phối hợp hướng dẫn và phương án thay thế. Người đang vận động khó liên tục đọc những đoạn dài. Vì vậy text + hình tốt như tài liệu tham chiếu; mức đủ để thay người hướng dẫn phải được thử trực tiếp theo đúng đối tượng và bài, không suy từ độ đẹp của ảnh.

NCCIH nêu yoga nhìn chung an toàn với người khỏe mạnh khi tập đúng dưới hướng dẫn có chuyên môn; học một mình không được giám sát gắn với rủi ro chấn thương tăng. Họ cũng khuyến nghị điều chỉnh theo nhu cầu riêng ở người mang thai, người cao tuổi hoặc có vấn đề sức khỏe. Đây là lý do sản phẩm cần xác định phạm vi và người chịu trách nhiệm, không chỉ thêm một disclaimer chung. [NCCIH, Yoga: Effectiveness and Safety](https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety).

**Khuyến nghị cho MCY:** reader hai chế độ rõ: “Tìm hiểu” để đọc/nhìn và “Thực hành” có hướng dẫn theo nhịp do giáo viên duyệt. Nếu một bài cần nhìn chuyển động, dùng clip giáo viên hoặc minh họa chuỗi đã kiểm thay vì buộc ảnh tĩnh gánh toàn bộ nhiệm vụ. Audio tiếng Việt có thể giảm việc nhìn màn hình nhưng cũng phải duyệt nội dung, phát âm và nhịp; không coi audio tự động là đủ.

## Ảnh AI: phạm vi và chuẩn duyệt

- Ảnh không gian, đồ dùng, bìa và khái niệm trừu tượng: thích hợp để thử trước; vẫn kiểm quyền sử dụng, thông điệp và alt text.
- Ảnh người/tư thế dùng để dạy: kiểm từng ảnh với giáo viên có năng lực phù hợp; kiểm khớp, điểm tựa, trái/phải, tải trọng, hướng nhìn, phối cảnh, dụng cụ và khớp với lời hướng dẫn. Nếu sửa bằng AI, duyệt lại ảnh cuối.
- Tránh người “hoàn hảo”, cơ thể quá dẻo hoặc hình thể duy nhất. Brand yêu cầu đa dạng cơ thể, tuổi và khả năng vận động (`brand/BRAND_GUIDELINES.md:91–95`).
- Nếu không thể kiểm đủ độ chính xác, dùng ảnh thật có quyền và do giáo viên thực hiện, hoặc sơ đồ được người có chuyên môn sửa trực tiếp. Không dùng nhãn “ảnh minh họa” để bù cho hình đang có tác dụng chỉ dẫn.
- Ghi “Hình minh họa có AI hỗ trợ” đúng chỗ và người chịu trách nhiệm duyệt. Không gắn ảnh AI với danh tính giảng viên thật hoặc chứng chỉ không tồn tại.

Đây là danh mục rủi ro và tiêu chí cần kiểm, không phải kết luận mọi ảnh AI đều sai. WHO cảnh báo mô hình đa phương thức có thể đưa thông tin sai, thiếu hoặc thiên lệch; người dùng và cả chuyên gia có thể bỏ qua lỗi vì quá tin tự động hóa. Từ đó, việc có một AI khác chấm ảnh không thay thế thẩm định của con người. [WHO, guidance on large multi-modal models, 18/01/2024](https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models).

## Thử nghiệm nên làm

Đề xuất này là kế hoạch mới, chưa phải lệnh xuất bản hay kích hoạt AI.

**Đợt đầu: một bài nhập môn và 3 buổi hoàn chỉnh do giáo viên xây dựng**, ở ba hoàn cảnh khác nhau đã xác nhận với người dùng. Ví dụ mục tiêu thiết kế: thời gian rất ngắn; không muốn xuống sàn; có thêm thời gian và muốn nhịp chậm. Có thể dự kiến 5/8/12 phút để lập kế hoạch sản xuất, nhưng thời lượng cuối phải đo khi chạy toàn buổi và metadata phải ghi đúng. Đây chưa phải chương trình tập hoặc khuyến nghị tư thế cho người dùng cụ thể.

Chọn một nhóm hẹp đã được giáo viên xác định đủ phạm vi, tránh hứa phục hồi/chữa đau hoặc mọi lứa tuổi. Kiểm nguồn hiện có trước: nếu clip phù hợp và đủ quyền, tái biên tập thành buổi có chuẩn bị, chuyển đoạn, thực hành, kết thúc. Không nối clip theo tên hoặc tổng số phút rồi gọi là buổi đã duyệt.

Quy trình:

1. Người phụ trách chốt audience, mục tiêu học, prerequisites, giới hạn và ý chính; lựa nguồn có quyền.
2. AI soạn bản nháp text, sơ đồ hoặc image brief từ nguồn đó; lưu nguồn và dấu vết AI hỗ trợ.
3. Giáo viên duyệt nội dung cả buổi, chuyển tiếp, phương án thay thế, nhịp, hướng dẫn dừng và từng hình/clip. Người biên tập kiểm tiếng Việt, quyền, alt text, captions/transcript và copy không hứa kết quả.
4. Xuất một phiên bản cố định. Ghi reviewer và cơ sở review thật, version/hash cho text/media; không sửa nóng dưới cùng approval.
5. Quan sát 5–8 người dùng thử hai lượt trong môi trường thử nghiệm được thống nhất; số lượng này phục vụ tìm lỗi định tính, không phải chứng minh hiệu quả y khoa.
6. Chỉ sau khi nội dung theo được và không còn sai sót quan trọng mới cân nhắc catalog/release/AI selection. Bất kỳ thử native/live mới nào cần operation mới; trial 13/10 đã đóng FAIL và còn 0 live writes được phép.

Đo câu hỏi thực tế: người học có biết bài dành cho ai và ai duyệt; có chọn được trong khoảng một phút; có hiểu cue không cần đoán; có tìm được pause/stop; có biết đọc xong chưa đồng nghĩa tập xong; khi không phù hợp có đổi/để sau; có muốn quay lại và vì sao. Ghi lỗi hiểu sai, số lần cần trợ giúp, thời gian biên tập + sửa ảnh + review + bảo trì mỗi bài. Chưa có số liệu để khẳng định AI rẻ hơn tổng chi phí của một buổi do người thật sản xuất.

Không dùng completion, streak hay phản hồi thiếu làm đại diện cho lợi ích sức khỏe. Điều này thống nhất với `README.md:13` và brand dòng 100–103, giữ “không thay đổi”, “khó chịu hơn”, “chưa rõ”, “bỏ qua”.

## Khi nào nâng thành khóa học?

Một khóa học cần mục tiêu đầu ra, đối tượng, prerequisites, trình tự tăng dần có lý do, bài ôn/lặp, tiêu chí tự đánh giá phù hợp và cách nhận trợ giúp. Một tập hợp bài viết đẹp có thể là thư viện kiến thức tốt nhưng chưa tự thành giáo trình.

Sau pilot có thể thử khóa ngắn 5–7 bài “Làm quen với cách tự tập cùng MCY”, hoặc một kỹ năng hẹp do giáo viên chọn. Tách rõ đường học có thứ tự khỏi buổi hôm nay: người học có thể tiếp tục khóa, lặp bài hoặc chọn buổi ngắn; không bắt hoàn thành từng ngày liên tục. Giao diện nên hiển thị lợi ích, thời lượng, dạng nội dung, thiết bị cần có, người biên soạn/duyệt và phạm vi hỗ trợ trước CTA.

Điều kiện mở rộng: nhu cầu học theo thứ tự thật; nội dung thử đã được người học hiểu và làm theo trong phạm vi; năng lực duyệt còn đủ; chất lượng không suy giảm khi tăng số bài. Mở rộng các khoảng trống phổ biến của catalog trước khi tạo hàng chục khóa để lấp giao diện.

## Ưu tiên đề xuất

1. P1 sản phẩm: định danh lại đơn vị nội dung (clip/buổi/khóa), bổ sung nguồn và metadata giúp lựa chọn.
2. P1 nội dung: hoàn thành vài buổi được duyệt thật, có bản text/hình dễ theo và media chuyển động khi cần.
3. P2 trải nghiệm: reader có xem trước, nhịp rõ, text ngắn, alt text/caption, dừng và phản hồi trung tính.
4. P2 AI: thử chất lượng chọn buổi trên cùng catalog so với tự chọn/bộ lọc; chỉ gọi AI là có ích khi giảm công sức hoặc tăng mức phù hợp theo bằng chứng.
5. Sau pilot: cân nhắc khóa nhỏ; số lượng nội dung và generation tự động không phải thước đo thành công.

Không thay đổi kết luận hiện tại của native trial, không giả định approval chuyên môn hoặc quyền media đã có. Các nguồn trên được đọc 14/10/2026; tài liệu business plan là định hướng/giả thuyết, các checkpoint cũ không dùng làm chứng cứ UI mới.
