# Một chút nền tảng — phân tích UI/UX và phương án bổ sung

Ngày 16/10/2026 · **Đề xuất thiết kế, chưa tích hợp vào ứng dụng.**

Phạm vi: đọc source hiện tại trong `D:/Projects/MCY/src`, brand/design system và các handoff UX 14–16/10. Không chạy ứng dụng, không chụp ảnh mới, không thao tác thiết bị/dịch vụ, không đổi source ứng dụng. Đây là phân tích cấu trúc và hành vi từ mã, không phải kết quả kiểm thử thị giác, screen reader hay native. Các mức ưu tiên dưới đây phục vụ thiết kế, không phải severity của security scan.

Đã đối chiếu `skills/mcy-brand-ux/SKILL.md`, `skills/mcy-change-review/SKILL.md` và review matrix. Tài liệu này thuộc R0; một reader tương tác trong ứng dụng cần R1; resume lưu lâu dài cần R2; hướng dẫn tư thế và thay đổi consent/health data cần phạm vi R3 tương ứng. Các phân loại đó không biến bản xem trước thành nội dung đã được duyệt chuyên môn.

## 1. Kết luận thiết kế

Nên mở rộng **Khám phá** thành thư viện gồm hai định dạng dễ phân biệt: **Minh họa từng bước** và **Video hướng dẫn**. “Một chút nền tảng” là một series có mục tiêu học, gồm các bài có thể mở độc lập. Giữ bốn mục **Hôm nay · Hành trình · Khám phá · Cá nhân**. Chưa có lý do đủ mạnh để thêm một tab “Học”, một kho thành tích hoặc màn onboarding mới.

Luồng đọc nội dung có thể mở trực tiếp, không cần check-in, đăng nhập hay đồng ý AI. Người học tự quyết định có thử thực hành hay chỉ đọc. Bước cuối của bài không tự biến thành một buổi tập hoàn tất, một phản hồi cơ thể hoặc một bản ghi Hành trình.

Mục tiêu thiết kế: **đọc hiểu một phần nhỏ → biết chọn cách phù hợp → dễ xem lại → có đường trở về buổi tập đang theo**. Thứ tự bài là gợi ý học, không phải yêu cầu mở khóa.

## 2. Những gì ứng dụng đang có

| Bề mặt | Bằng chứng source hiện tại | Ý nghĩa với tính năng mới |
|---|---|---|
| Bốn mục điều hướng | [Prototype.tsx:673](../../src/Prototype.tsx#L673), [Prototype.tsx:1763](../../src/Prototype.tsx#L1763) | Dùng lại cấu trúc này; reader là màn con với nút quay lại. |
| Hôm nay | [Prototype.tsx:1324](../../src/Prototype.tsx#L1324): lời dẫn và ba bước đều nói về video; CTA chính bắt đầu check-in. | Copy phải bao quát định dạng mới; giữ check-in là một đường vào, cho đường học trực tiếp dễ thấy. |
| Khám phá | [DiscoverScreen.tsx:68](../../src/courses/DiscoverScreen.tsx#L68): mô tả “nhóm video”; [dòng 74](../../src/courses/DiscoverScreen.tsx#L74) mọi card mang số lượng và nhãn YouTube. | Không thêm series minh họa vào card YouTube hiện tại mà không sửa taxonomy/metadata. |
| Chi tiết nhóm video | [CourseDetailScreen.tsx:96](../../src/courses/CourseDetailScreen.tsx#L96): giới thiệu nhóm, metadata, thông báo, player bài đang chọn, điều hướng bài và danh sách toàn nhóm cùng một màn. | Có thể giữ cho video. Series minh họa cần tách tổng quan series, tổng quan bài và bước đọc để người học hiểu mình đang ở cấp nào. |
| Reader có sẵn | [LessonReader.tsx:18](../../src/practice/LessonReader.tsx#L18): ảnh, nút phần đánh số, tiêu đề/nội dung và audio tùy chọn. Audio do người dùng bật và được pause khi rời/ẩn màn. | Là điểm xuất phát tốt cho thành phần hiển thị; cần thêm mô tả ảnh riêng, điều hướng trước/sau, phóng to và trạng thái trở lại. |
| Buổi học chọn bằng AI | [PracticeFlowScreen.tsx:38](../../src/practice/PracticeFlowScreen.tsx#L38): select/start cần actor, consent, active; [dòng 47](../../src/practice/PracticeFlowScreen.tsx#L47) gọi endpoint AI. | Không dùng nhánh này làm cổng bắt buộc cho series biên tập cố định. Đọc minh họa không tự phát sinh AI request. |
| Phản hồi | [CourseDetailScreen.tsx:139](../../src/courses/CourseDetailScreen.tsx#L139) và [PracticeFlowScreen.tsx:90](../../src/practice/PracticeFlowScreen.tsx#L90) yêu cầu tự xác nhận đã thực hành, không tự xác nhận hoàn tất. | Giữ sự trung thực này khi bổ sung minh họa. |
| Hành trình | [JourneyScreen.tsx:93](../../src/JourneyScreen.tsx#L93) tổng hợp check-in từ tài khoản và lịch sử trong phiên; [Prototype.tsx:1554](../../src/Prototype.tsx#L1554) tạo snapshot sau tập. | Không đưa “đã đọc bước 4” vào cùng mô hình snapshot cơ thể. |

**Cần phân biệt source với candidate mới:** bản cải tiến UX 14/10 và revision thị giác check-in 16/10 đang ở thư mục `.vercel` riêng; [handoff 16/10](../ux-step4-2-visual-2026-10-16/HANDOFF.vi.md) ghi chưa tích hợp root. Báo cáo này không coi các sửa lỗi Journey, nháp hoặc bố cục check-in ở candidate là hành vi đang có trong root. Khi triển khai tính năng mới cần chốt một baseline tích hợp chung, tránh làm lại hoặc ghi đè công việc đó. Các test được ghi trong handoff thuộc candidate cũ, không chứng minh tính năng minh họa mới.

## 3. Các vấn đề cần giải quyết theo ưu tiên

### Ưu tiên 1 — Làm rõ “đọc”, “thử” và “tập”

**Nguồn:** `CourseDetailScreen.tsx:139`, `Prototype.tsx:708`, `Prototype.tsx:1549`.

Một bộ hình có thể được đọc mà người dùng không thực hành. Nếu nút “Tiếp” ở bước cuối dẫn thẳng tới cảm nhận cơ thể, ứng dụng đang mặc định một hành động chưa xảy ra. Nếu dùng “Hoàn thành”, người mới có thể hiểu đã làm đúng tư thế.

**Thiết kế bản mẫu:** sau bước cuối hiện “Bạn đã đến cuối phần đọc” với hành động chính **“Về danh sách bài”**, hành động phụ **“Xem lại từ đầu”** và phản hồi tùy chọn về cách hiểu. Có thể xem thêm bài kế tiếp bằng lựa chọn rõ ràng, không tự mở bài. Reader chỉ hiển thị **“Bước 2/5”**; không dùng vòng tiến độ tập luyện hay “40% thành thạo”. Khi mở từ kế hoạch minh họa, hành động chính là **“Trở về buổi đang xem”**. Vì mục lục cho nhảy bước, không tuyên bố người học đã xem hết mọi khung.

**Giai đoạn thực hành tương lai, sau duyệt chuyên môn:** khi có phiên bản hướng dẫn thực hành hoàn chỉnh, mới cân nhắc hành động “Tôi đã thử · ghi cảm nhận” nối vào contract dữ liệu hiện có. Bản xem trước hiện tại không có hành động hoặc dữ liệu này.

**Kết quả phải giữ:** không có hoạt động sức khỏe, phút tập hay chuỗi ngày được tạo khi chỉ mở bài, chuyển bước, đóng màn hoặc khôi phục vị trí đọc.

### Ưu tiên 1 — Đọc nội dung không đi qua cổng AI/health consent

**Nguồn:** `PracticeFlowScreen.tsx:37–48`; `Prototype.tsx:724`, `Prototype.tsx:1169`, `Prototype.tsx:1682`.

Luồng hiện tại có reader nhưng reader nằm trong nhánh kế hoạch AI. Việc tái sử dụng toàn luồng sẽ khiến người chỉ muốn đọc phải xác nhận thêm quyền và thông tin không phục vụ trực tiếp tác vụ.

**Thiết kế:** catalog đã biên tập → bài minh họa → reader hoạt động độc lập với AI và wellbeing. Quyền wellbeing Tắt không chặn xem nội dung. Không dùng việc mở series để xin thêm quyền hoặc tự bật ghi nhớ. Giai đoạn thực hành đã được duyệt trong tương lai mới có nhánh chủ động ghi cảm nhận với trạng thái lưu rõ ràng; bản mẫu hiện tại chỉ có phản hồi cách hiểu trong phiên.

### Ưu tiên 1 — Đổi kiến trúc Khám phá theo loại nội dung

**Nguồn:** `DiscoverScreen.tsx:68–80`, `freeCourses.ts:15–20`.

Trang hiện tại coi mọi nội dung là video. Series mới cần trả lời được: tôi sẽ hiểu điều gì, cần chuẩn bị gì, đọc hay tập, mất bao lâu, bắt đầu ở đâu.

**Thiết kế:** đầu trang “Học theo cách hợp với bạn”; hai lựa chọn định dạng **Minh họa từng bước / Video hướng dẫn**; một card nổi bật “Một chút nền tảng”, ba bài đầu và mục video hiện có phía sau. Mỗi card dùng tên/mục tiêu/định dạng, không lấy số lượng làm điểm nổi bật nhất. Với chỉ ba bài mẫu chưa cần search hoặc nhiều bộ lọc. Sau này chỉ thêm bộ lọc khi số bài và nghiên cứu tìm kiếm cho thấy cần.

**Đặc biệt:** giữ “Miễn phí” là metadata quyền truy cập, “Minh họa” là định dạng, “Bài học” là đơn vị nội dung và “Series” là nhóm có mục tiêu. Không gộp chúng thành các taxonomy cạnh tranh ở thanh điều hướng.

### Ưu tiên 1 — Reader phải thao tác được khi không vuốt


**Nguồn:** `LessonReader.tsx:6`, `LessonReader.tsx:18–21`; `practice.css:16–24`, `practice.css:33`.

Reader hiện có các nút phần nên không lệ thuộc vuốt, nhưng chưa có cặp Trước/Tiếp rõ ràng. Dưới 380 px các nút phần thành từng hàng đầy chiều rộng; với nhiều bước, danh sách có thể đẩy nội dung hướng dẫn xuống sâu. Đây là rủi ro cấu trúc, chưa phải overflow đã đo.

**Thiết kế:** header ngắn có tên bài và **“Các bước”** mở danh sách; nội dung gồm **“Bước 2/5 · tên bước” → hình → một hướng dẫn chính → tùy chọn/điểm cần chú ý**. Footer **“Bước trước” / “Bước tiếp”** bằng nút thật. Vuốt là bổ sung nếu sau này có, không thay đường nút. Mục lục vẫn cho nhảy trực tiếp tới bước đã biết; không khóa bước sau.

Không tự chuyển sau thời gian cố định hoặc khi audio kết thúc. Khi chuyển bước, dừng audio cũ; công bố tên và số bước bằng trạng thái đọc hỗ trợ ngắn, tránh đọc lại toàn trang. Phím Tab/Enter/Space hoạt động; không chiếm phím mũi tên khi focus ở audio hoặc điều khiển riêng.

### Ưu tiên 1 — Hình phải truyền tải thông tin ngoài hình dáng

**Nguồn:** `LessonReader.tsx:18` dùng `alt={section.title}`; `practiceContract.ts:15` chưa có `imageAlt`/caption/mô tả dài.

Tiêu đề thường không mô tả quan hệ chân–tay, điểm tựa hoặc hướng chuyển động. Một hình đẹp và một tên tư thế không đủ để tái tạo nội dung cho người dùng screen reader hoặc người chưa nhìn rõ hình.

**Thiết kế:** mỗi hình cần alt riêng do biên tập; một đoạn mô tả bằng chữ tương đương điều cần quan sát; nhãn “Xem hình lớn” bằng nút có tên rõ. Hướng/trái/phải và khác biệt giữa hai lựa chọn phải có chữ, không chỉ mũi tên/màu. Hình nguyên vẹn dùng `contain`, không crop đầu/chân/điểm tựa. Không đặt hướng dẫn bắt buộc thành chữ nhỏ trong ảnh. Phóng to có đóng bằng nút/Escape, focus trap và trả focus về nút mở.

### Ưu tiên 2 — Hôm nay có lối học ngắn mà không lấn mục tiêu chính

**Nguồn:** `Prototype.tsx:1322–1330`.

Giữ một CTA chính cho việc bắt đầu hôm nay. Thêm một hàng gọn phía dưới: **“Muốn xem kỹ một động tác? Một chút nền tảng →”**. Nếu có trạng thái đọc còn dở trong phạm vi đã chọn, đổi hàng này thành **“Đọc tiếp · Bài 1, bước 2/5”**. Không xếp thêm ba hero cạnh tranh với check-in, không bật popup giới thiệu series mỗi lần mở ứng dụng.

Lời dẫn Hôm nay đổi từ “bài học video” sang “bài học” có định dạng cụ thể ở card. Khi check-in đưa đến thư viện, không mô tả các bài này được chọn theo tình trạng cơ thể nếu chưa có contract được duyệt thực sự làm điều đó.

### Ưu tiên 2 — Quay lại đúng ngữ cảnh và nói rõ phạm vi nhớ

**Nguồn:** `Prototype.tsx:758–767` mở nhóm bằng bài đầu; `LessonReader.tsx:6` khởi tạo index=0 trong local component; không có contract resume bài đọc trong các file đã rà soát.

**Thiết kế:** lưu đường xuất phát: Khám phá/series/bài đang tập. Quay lại reader → tổng quan bài; tổng quan bài → danh sách series tại vị trí cũ. Nếu mở giải thích từ buổi tập, trở về đúng bài và trạng thái đã dừng; không tự phát audio khi trở về. Không để “Trước” trong các bước bị hiểu là nút Back của ứng dụng.

**MVP xem trước:** nhớ vị trí trong phiên, có nhãn “Đang đọc trong phiên này”. **Phương án sau:** ghi nhớ trên thiết bị là tùy chọn, chứa ID bài/phiên bản/ID bước, không chứa sức khỏe; có “Xóa vị trí đã nhớ”. Cần namespace theo actor/khách, reset/hide khi đổi tài khoản và xử lý phiên bản bài thay đổi. Không hứa đồng bộ tài khoản hoặc tiếp tục sau cài lại trước khi cơ chế đó được xây và kiểm chứng.

### Ưu tiên 2 — Hành trình giữ nghĩa dữ liệu trung thực

**Nguồn:** `JourneyScreen.tsx:93–105`, `Prototype.tsx:1554–1556`, `Prototype.tsx:1682`.

**MVP:** Hành trình vẫn dành cho cảm nhận đã chủ động ghi; bản mẫu hiển thị rõ không có dữ liệu thực hành. Nội dung đang đọc đặt ở Khám phá/Hôm nay. Phản hồi sau tập trong source hiện là lịch sử trong phiên; UI mới không được hứa tự đồng bộ lên tài khoản. Ở giai đoạn thực hành tương lai đã duyệt, record tự nguyện mới có thể mang tên bài và phiên bản nội dung theo contract được duyệt; không có nhánh đó trong bản xem trước này.

**Mở rộng sau nếu cần:** tách “Nội dung đã mở” khỏi “Cảm nhận đã ghi” trong một khu vực phụ rõ tên; không cộng hai loại vào cùng biểu đồ cơ thể hoặc chỉ số “tiến bộ”. Không mặc định rằng lặp lại bài là kém tiến bộ, bỏ qua là thất bại hoặc không có phản hồi là dễ chịu hơn.

## 4. Cấu trúc màn hình đề xuất

| Thứ tự | Màn hình / câu hỏi cần trả lời | Nội dung tối thiểu | Hành động chính và đường trở lại |
|---|---|---|---|
| 1 | Hôm nay — Tôi muốn bắt đầu thế nào? | Luồng hôm nay hiện có; một lối tới nền tảng/đọc tiếp. | Bắt đầu hôm nay; lối phụ “Xem minh họa từng bước”. |
| 2 | Khám phá — Tôi muốn học bằng gì? | Định dạng, card series, nhóm video, hướng dẫn chọn bài. | “Xem series”. Giữ nav bốn mục. |
| 3 | Series — Tôi sẽ học được gì? | Một lời hứa học; 3 bài mẫu; **5 khung và thời gian đọc ước tính**; thứ tự tùy chọn; thông tin biên tập. Không có thời lượng thực hành trong bản mẫu. | “Mở bài đầu” hoặc “Đọc tiếp”; từng bài luôn mở được. |
| 4 | Tổng quan bài — Tôi cần biết gì trước khi bắt đầu? | Mục tiêu; 4–6 bước; chuẩn bị; lựa chọn điều chỉnh và phạm vi do người có chuyên môn duyệt; hình tổng quan; thông tin nguồn. | “Xem từng bước”. Back về series; không tự ghi buổi tập. |
| 5 | Reader — Bước này cần hiểu điều gì? | Số bước/tên; hình; một ý chính; điểm quan sát; lựa chọn phù hợp; xem hình lớn; audio nếu có. | Bước tiếp. Bước trước, mục lục và dừng xem luôn có đường rõ. |
| 6 | Kết thúc phần đọc — Tôi muốn làm gì tiếp? | “Bạn đã đến cuối phần đọc”; không tuyên bố đã xem hết mọi khung hoặc hoàn thành tập. | Về danh sách bài, xem lại hoặc tự chọn bài kế. |
| 7 | Nhìn lại cách hiểu — Phần nào chưa rõ? | Phản hồi nội dung tùy chọn, chỉ giữ trong phiên; không hỏi cảm nhận cơ thể. | Chọn mức hiểu hoặc không trả lời, rồi về danh sách bài/ngữ cảnh xuất phát. |

Trong buổi tập: đặt **“Xem kỹ bước này”** cạnh mục liên quan. Mở trang giải thích có ngữ cảnh và **“Trở về buổi đang tập”**. Không tự dừng một động tác ở thời điểm nguy hiểm bằng việc điều hướng bất ngờ; việc mở giải thích luôn do người dùng chọn. Phiên bản đầu không cần chạy timer khi đang đọc.

## 5. Điều chỉnh ngôn ngữ và thiết kế thị giác

| Hiện tại / nguy cơ | Đề xuất |
|---|---|
| “Học ngay” dùng chung cho video và bài đọc | “Xem từng bước” cho minh họa; “Phát video” cho video. |
| “Đã hoàn thành 2/3 bài” sau khi vuốt hết | “Đang đọc bài 2” hoặc “Bạn đã mở 2 bài”, nếu thật sự có dữ liệu tương ứng. MVP ưu tiên chỉ vị trí bài đang đọc. |
| “Tiếp tục luyện tập” khi mới xem hình | “Đọc tiếp”. Chỉ dùng “tiếp tục buổi tập” khi có phiên tập tương ứng. |
| Huy hiệu “Đã duyệt” trong bản mẫu chưa có reviewer | “Bản mẫu nội dung · chờ duyệt chuyên môn”. Bản phát hành chỉ hiển thị thông tin review thật. |
| Thời lượng chung “5 phút” | “Đọc khoảng 3 phút”; thực hành ghi riêng nếu có mục tiêu và trình tự được duyệt. |
| Chọn chỉ bằng tên tư thế | Tên dễ hiểu + mục tiêu nhỏ + chuẩn bị. Tên truyền thống là thông tin hỗ trợ, không thay mô tả. |

Giữ canvas ivory, chữ forest, action terracotta và surface sage của hệ hiện tại. Dùng hình để làm rõ bước; tránh nhiều khung trang trí và sự kiện ăn mừng sau mỗi bước. Thẻ series cần nhận diện “Minh họa từng bước” bằng chữ và biểu tượng, không chỉ màu. Để nhân vật, phục trang, tỷ lệ và góc máy nhất quán xuyên bài; các cơ thể/phương án khác nhau được thể hiện tôn trọng, không dùng “chuẩn đẹp” hoặc “nâng cao” làm mặc định.

Tiêu đề tiếng Việt cần kiểm glyph trước khi chốt. [Source audit 14/10](../ux-audit-2026-10-14/source-ux-notes.md) đã ghi nhận nguy cơ fallback Georgia trong ảnh đợt đó; tài liệu này không xác minh lại rendered font. Preview mới nên dùng font có glyph Việt đã đóng gói/kiểm thực tế, không sao chép nguyên lỗi serif từ ảnh cũ. Không tự đổi brand master trong phạm vi bản xem trước.

## 6. Mobile, desktop và khả năng tiếp cận

- **Mobile 320 px và màn thấp:** một cột; tên bài xuống dòng; hình co theo chiều rộng và giữ toàn thân/điểm tựa; nội dung dài cuộn bình thường. Mục lục nằm trong disclosure/sheet thay vì xếp năm nút dài trước nội dung. Footer nền đặc, inset, có khoảng bù phía dưới để không che đoạn cuối. Ở chữ lớn/landscape, cho footer reflow hoặc chuyển thành block trong luồng nếu cần; không giảm cỡ chữ để ép vừa.
- **390–430 px:** hình đủ lớn để thấy điểm cần quan sát, thường chiếm khoảng 1/3–1/2 vùng nội dung đầu, không khóa height theo một thiết bị. Nội dung vẫn đọc được trước khi chạm Next.
- **Desktop:** giới hạn chiều dài dòng; có thể chia hình và lời hướng dẫn thành hai cột, mục lục bên cạnh. Thứ tự DOM vẫn tiêu đề → hình/mô tả → hướng dẫn → hành động. Bản trong simulator dùng chính runtime hiện tại; desktop review không chứng minh native.
- **Text:** nội dung hướng dẫn chính khoảng 16 px, line-height thoáng; zoom và text 200% không bị truncate hoặc cuộn ngang toàn trang. Không để lưu ý quyết định an toàn ở footnote 11–12 px.
- **Tương tác:** target theo design system tối thiểu khoảng 48 CSS px cho controls mới; focus rõ, thứ tự bàn phím logic; cả Previous/Next và mục lục thao tác được không cần vuốt. Selected step có chữ/trạng thái hỗ trợ, không chỉ màu.
- **Ảnh:** alt riêng và mô tả bằng chữ cho quan hệ vị trí/chuyển động quan trọng. Nút phóng to không cản browser pinch zoom. Hình lỗi vẫn còn hướng dẫn bằng chữ, thông báo và nút tải lại thủ công.
- **Âm thanh:** không autoplay; ghi rõ ngôn ngữ; transcript có nội dung tương đương; pause khi chuyển bước/rời màn/ẩn ứng dụng. Mất audio vẫn đọc được toàn bộ phần cần hiểu. Bản mẫu không giả nút âm thanh hoạt động nếu chưa có audio.
- **Chuyển động:** không tự tiến bước, không loop minh họa liên tục; giữ thông tin khi reduced motion bật. Nếu sau này dùng clip chuyển tiếp, cần nút Play/Pause và nội dung tĩnh tương đương.

Các mục trên là tiêu chí thiết kế/kiểm chứng đề xuất dựa vào [design system](../../design-system/DESIGN_SYSTEM.md), chưa phải tuyên bố đạt WCAG hay test thiết bị.

## 7. Trạng thái và dữ liệu cần định nghĩa trước khi triển khai

| Tình huống | Hành vi mong muốn |
|---|---|
| Khách / đã đăng nhập / wellbeing Tắt | Cùng đọc được nội dung được phép phát hành; không tự ghi dữ liệu sức khỏe. |
| Chuyển bước | Chỉ thay bước đọc; pause audio; không RPC check-in/consent/AI. |
| Rời giữa bài | Quay lại được; phạm vi nhớ hiện rõ. Không báo “bỏ buổi” hay hoàn thành. |
| Đổi tài khoản | Không hiện vị trí đọc/ghi chú riêng của actor trước; không chuyển nháp cảm nhận tự động. |
| Ảnh lỗi | Giữ text, tên/số bước và navigation; báo lỗi có retry thủ công; không thay ảnh bằng pose khác. |
| Nội dung đổi phiên bản | Mở bản hiện hành từ tổng quan; không tiếp tục âm thầm từ index cũ nếu cấu trúc bước thay đổi. |
| Bài chưa duyệt / bị rút | Không lọt catalog learner; bản review có nhãn riêng. Không coi loading/error là nội dung đã duyệt. |
| Offline | Chỉ hứa offline cho bài/asset đã thực sự được đóng gói hoặc cache và kiểm. Nếu chưa có, nói rõ chưa tải được; không giả hình cũ là bản hiện hành. |
| Giai đoạn thực hành tương lai: người dùng chọn ghi cảm nhận | Chỉ sau khi nội dung thực hành đã được duyệt; dùng đúng consent/actor/continuation hiện tại, công bố kết quả lưu chính xác, giữ nháp khi chưa rõ. Không tự mở lại trial live. Bản mẫu hiện tại không có nhánh này. |

Content contract đề xuất có `seriesId`, `lessonId`, `version`, `format`, `objective`, `preparation`, `estimatedReadMinutes`, `reviewStatus`, `steps[]`. Mỗi bước có ID ổn định, title, hình, alt, mô tả/điểm quan sát, lựa chọn điều chỉnh đã duyệt và audio tùy chọn. Quyền ảnh, nguồn và bằng chứng review thuộc metadata biên tập; không hiển thị raw hash hoặc thuật ngữ backend trong tác vụ đọc. Không cần sửa DB chỉ để dựng bản xem trước.

## 8. Phạm vi MVP và kiểm chứng

**Bản xem trước hiện được yêu cầu:** ba bài mẫu; Khám phá; series; tổng quan bài; reader; kết thúc đọc; đường quay lại/đọc tiếp trong phiên; phản hồi tùy chọn về cách hiểu nội dung. Ghi nhãn bản thiết kế và nội dung chưa duyệt. Không hỏi cảm nhận sức khỏe, không hứa đồng bộ hay phát audio thật nếu chưa có. Đây là đủ để người dùng đánh giá cấu trúc, mật độ, tone và thứ tự hành động.

**Chưa cần trong MVP:** tab mới, điểm thành thạo, streak, khóa bài, gamification, nhắc tập, AI tạo tư thế, gợi ý bài dựa trên vùng đau, thanh toán, công cụ authoring đầy đủ hoặc backend progress mới.

**Khi xây trong app, kiểm các hành vi có ý nghĩa:**

1. Khách đi Khám phá → series → bài → bước cuối → về danh sách; không yêu cầu login/health/AI và không tạo request ghi.
2. Chuyển Trước/Tiếp/mục lục giữ đúng ảnh–text–số bước; thay bài/phiên bản reset đúng; audio cũ dừng.
3. Mở giải thích từ buổi tập rồi Back trả đúng ngữ cảnh, không auto play hoặc mất dữ liệu chưa lưu.
4. Đến cuối phần đọc hoặc nhảy thẳng đến khung cuối không tạo Hành trình; không có CTA ghi sức khỏe trong draft. Phản hồi cách hiểu có thể bỏ qua và không sinh kết quả tích cực mặc định.
5. Quyền Tắt, mất mạng, dữ liệu lưu chưa xác nhận, đổi actor đều có trạng thái đúng; các nhánh đọc không gọi writer.
6. 320×568, màn 390 px, landscape, iPhone/Pixel review, chữ lớn/zoom, keyboard và screen reader; xem trực tiếp ảnh chữ Việt, ảnh tư thế và footer, không chỉ kiểm DOM.

**Thử hiểu với người học:** giao tác vụ “tìm một bài để chỉ đọc”, “xem kỹ bước 3”, “quay về buổi đang tập”, “dừng mà không ghi cảm nhận”. Quan sát họ phân biệt được đọc và thực hành không; có biết bước kế tiếp và cách xem lại không; phải nhìn/chạm màn hình bao nhiêu khi muốn thử. Ghi nhận lỗi và lời giải thích của họ, không dùng số trang đã vuốt làm bằng chứng hiểu hay tập đúng.

Kỹ thuật có thể kiểm navigation, semantics, state và request. Người có chuyên môn phải kiểm nội dung, hình, chuyển tiếp, phạm vi và các lựa chọn điều chỉnh. Trạng thái native HALTED và web BLOCKED hiện tại vẫn thuộc các operation riêng; tài liệu này không thay đổi chúng.
