# Rà soát source UX — 14/10/2026

Phạm vi: source learner hiện tại, chỉ đọc; không thay app, build, cloud, thiết bị hay dữ liệu. Đây là phân tích source để đối chiếu với ảnh/fixture mới của đợt audit. Riêng S12 đã trực tiếp xem hai ảnh mới `05-discover.jpg` và `11-notifications.jpg` do parent xuất ở cùng thư mục. Không chạy native; không sử dụng ảnh audit cũ để kết luận trạng thái hiện tại. Đã đọc hướng dẫn MCY, `skills/mcy-brand-ux/SKILL.md`, `skills/mcy-change-review/SKILL.md`, brand và design system. Các mức P dưới đây là ưu tiên UX đề xuất, không phải kết quả security review.

## Nền tảng tốt đã thấy trong source

- Welcome cho phép khách đi thẳng vào check-in; thư viện không ép đăng nhập. Có 4 mục điều hướng rõ ràng.
- Phân biệt không khó chịu / chưa rõ / bỏ qua / chưa chọn; body map có đường vào bằng danh sách chữ và lựa chọn bên trái/phải.
- Phản hồi không tự điền kết quả tích cực, cho phép như cũ / khó chịu hơn / chưa rõ / bỏ qua. Không giả lập hoàn thành video.
- Có trạng thái tải, lỗi và tải lại thư viện/player; chưa phát YouTube trước thao tác người dùng. Nội dung caption được ghi là chưa kiểm chứng chứ không khẳng định không có.
- Phiên bản học miễn phí hiện được gọi là nhóm video ở nhiều nơi. English bị giới hạn DEV là chủ ý; không coi thiếu bản dịch tài khoản trong production VI là regression.

## 12 điểm đáng chú ý

### S01 — P1 UX: thao tác “ghi lại” có thể xóa nháp nhưng không tạo bản ghi và không giải thích

**Bằng chứng source, cao:** `src/Prototype.tsx:405` trả null nếu khách/chưa có quyền wellbeing; caller `standalone` vẫn clear vùng/năng lượng tại 1414–1417 rồi chuyển Hành trình tại 1427. Link ở 1455 vẫn là “Chỉ ghi lại cảm nhận hôm nay, không chọn bài” (`src/i18n.ts:46`), không phụ thuộc quyền.

**Hệ quả:** người dùng có thể hiểu chuyển trang là đã lưu, sau đó gặp Hành trình trống. Đây là mismatch trạng thái/niềm tin, không chứng minh nguyên nhân incident native extra B.

**Điều kiện cần giữ rõ:** khách mặc định có `saveFeedbackConsent=false` (`Prototype:143`), nên không có local append. Nếu khách đã chủ động bật lựa chọn lưu trong phiên, nhánh1414 có local append; không mô tả mọi trường hợp `return null` là mất dữ liệu.

**Đề xuất:** dùng kết quả phân biệt `saved_account`, `saved_session`, `not_saved_permission`, `cancelled`; không clear nháp khi chưa ghi. Trước action nói rõ “Giữ trong phiên” hoặc “Lưu vào tài khoản”, và đường cấp quyền tùy chọn. Không tự bật consent.

**Cần kiểm:** fixture khách + quyền off + quyền on, nháp có dữ liệu; nội dung thông báo và zero writes. Không dùng trial native đã đóng.

### S02 — P1 UX: Hành trình có thể báo trống dù ngày hiện tại có bản ghi

**Bằng chứng source, cao:** `src/JourneyScreen.tsx:79` khởi tạo selectedId=null; lookup tại 98 yêu cầu đúng ID. Chỉ `chooseDay`106 hoặc thao tác chọn bản ghi mới gán ID. Heading137/empty148 phụ thuộc selected; carousel bản ghi138 chỉ hiện nếu ngày có >1 bản ghi.

**Hệ quả:** vào lần đầu ở ngày có một bản ghi, card có thể nói chưa ghi nhận trong khi timeline báo có bản ghi. Người dùng phải bấm lại ngày hoặc “Bản gần nhất”.

**Đề xuất:** chọn bản ghi mới nhất của ngày hiện tại sau hydrate, hoặc bản ghi vừa lưu; tách “đang tải”, “ngày trống” và “chưa chọn”. Giữ lựa chọn hiện tại khi dữ liệu cập nhật nếu bản ghi vẫn tồn tại.

**Cần kiểm:** fixture 0/1/2 bản ghi hôm nay, dữ liệu hydrate muộn, vừa lưu xong quay lại và ngày khác được chọn.

### S03 — P2: câu hỏi thời gian chưa tạo giá trị ở luồng đang mở

**Bằng chứng source, cao:** check-in hỏi 5/10/15 phút (`src/Prototype.tsx:1452`); nhánh AI chưa ready chỉ chuyển sang Discover1470–1472/1492. `src/courses/DiscoverScreen.tsx:7–10` không nhận thời gian/năng lượng; render cùng 3 nhóm tại74. Home1324/1329 mô tả tự chọn video. AI-ready là nhánh riêng; không dùng tài liệu cũ để khẳng định welcome mặc định vào library — welcome hiện đi check-in1028.

**Hệ quả:** người dùng trả lời nhưng thư viện không cho thấy câu trả lời có ích ra sao; lời hứa thương hiệu “một buổi phù hợp hôm nay” chưa thành trải nghiệm xuyên suốt.

**Đề xuất:** trong trạng thái AI off, đổi bước thành ghi nhận tùy chọn và rõ phạm vi, hoặc cung cấp bộ buổi đã được người duyệt biên tập theo 5/10/15 phút. Khi AI có thật, Home/CTA phải phản ánh capability và chỉ chọn nội dung duyệt, không phát sinh động tác tùy ý.

**Cần kiểm:** fixture capability ready/off/not_ready, điều hướng từ Home/Welcome và người dùng hiểu lợi ích check-in.

### S04 — P2: thu năng lượng nhưng không cho xem lại

**Bằng chứng source, cao:** 5 mức năng lượng1451; payload/row `energy_level`423; `snapshotFromDatabase`315–326 không chuyển năng lượng vào Snapshot. `JourneyScreen`139–145 chỉ hiển thị vùng/outcome/note/endedEarly; không năng lượng. Snapshot local standalone cũng không truyền năng lượng1414.

**Hệ quả:** người ghi năng lượng không thấy dữ liệu đó trong lịch sử; không thể kiểm tra lần nhập hay tự so sánh cảm nhận.

**Đề xuất:** thêm năng lượng vào view model, hiển thị mức bằng chữ trong card ngày và chi tiết. Không suy ra xu hướng khi thiếu dữ liệu. Nếu chưa định sử dụng, cân nhắc không hỏi ở bước bắt đầu.

**Cần kiểm:** mock bản ghi mỗi mức/null và sau reload; không cần live write.

### S05 — P2: Hành trình ưu tiên công cụ phân tích hơn nhu cầu quay lại

**Bằng chứng source, cao cho cấu trúc; tác động thị giác cần ảnh:** timeline133–135, snapshot trống136–149, compare150, 10 lựa chọn vùng152 đều render trước empty-state153 và CTA154, kể cả snapshots=[]; range7/30 chỉ quyết định strip ngày97, trend105 dùng toàn bộ snapshots.

**Hệ quả:** lần đầu có nhiều trạng thái trống/điều khiển vô dụng; “7 ngày/30 ngày” có thể được hiểu là lọc toàn màn hình nhưng trend không lọc cùng.

**Đề xuất:** 0 bản ghi dùng một empty state + CTA; có dữ liệu thì ưu tiên bản mới nhất, danh sách ngày ngắn, “Xem so sánh” tùy chọn. Áp dụng range thống nhất hoặc gắn nhãn phạm vi cho mỗi khối. Chọn vùng có dữ liệu đầu tiên thay vì mặc định cổ.

**Cần kiểm:** ảnh 0/1/30 bản ghi, 320×568 và 390×844; thao tác 7/30, keyboard/reader cho carousel. Không gọi đây là lỗi overflow khi chưa đo.

### S06 — P2: nhóm video chưa có đủ thông tin để tự chọn một buổi

**Bằng chứng source, cao:** FreeCourse chỉ title/description/lessons (`src/courses/freeCourses.ts:15–20`); lesson có title/duration/description, không level/equipment/prerequisite/objective/reviewed sequence. Mọi description dùng cùng câu28. Catalog74 chỉ tên/số lượng/source/status.

**Hệ quả:** người mới khó biết bài phù hợp kinh nghiệm nào, cần dụng cụ gì, chuẩn bị gì, bắt đầu/tiếp tục ở đâu. “Làm quen” gồm tên như Quạ thấp/Hoang dã cao/Bánh xe thấp (73,74,79); đây là vấn đề thiếu phân loại, không phải kết luận chuyên môn rằng các clip đã được xem hoặc không an toàn.

**Đề xuất:** metadata do người có chuyên môn duyệt: mục tiêu học, đối tượng, thời gian buổi thật, tư thế cơ bản cần biết, dụng cụ, phiên bản nhẹ, hướng dẫn dừng; 1 tuyến “Bắt đầu ở đây”. Tách clip động tác, buổi tập hoàn chỉnh và khóa học có giáo trình.

**Cần kiểm:** biên tập/chuyên môn và 5–7 người mới chọn nội dung; không suy chất lượng/rights từ filename.

### S07 — P2: tên và thứ tự nội dung thiếu ý nghĩa học tập

**Bằng chứng source, cao:** generic “Chuyển động nhẹ · bài17/18”61–62 và “Chuỗi tư thế cơ bản · bài32…38”90–96; catalog ghi 38 “BÀI HỌC”70; header route “Khóa học miễn phí” (`Prototype:694`). Clip17–64 giây từ metadata source, không phải buổi5/10/15phút.

**Hệ quả:** số thứ tự giúp quản lý kho nhưng không giúp quyết định; ngôn ngữ khóa học/bài học/nhóm video dùng chưa thống nhất, dễ kỳ vọng một lộ trình đầy đủ.

**Đề xuất:** dùng tên hành động/mục đích học thật; mô tả một câu riêng mỗi clip; nhóm theo tiến trình chuyên môn đã duyệt. Trước khi có giáo trình, ghi “Thư viện video ngắn”, không quảng bá là khóa học hoàn chỉnh. Không cần tăng số lượng nội dung để xử lý vấn đề này.

**Cần kiểm:** xác minh nội dung thật, duration, tên động tác và trình tự với người dạy.

### S08 — P2: chi tiết video có nhiều tầng thông tin trước khi học, thiếu phần hướng dẫn riêng

**Bằng chứng cấu trúc, cao; mức độ chiếm màn cần ảnh:** `CourseDetailScreen.tsx:97–114`: eyebrow, title, description, metadata, scroll hint, caption notice, provider/privacy note, 9:16 poster, sau đó mới tiêu đề/description của clip. Description chỉ câu chung. List18/13/7 video cuối trang140–145.

**Hệ quả giả thuyết:** đường “xem trước → hiểu → thực hành” dài trên màn hình ngắn; poster chữ chung chưa giúp phân biệt tư thế. Chưa có bước thiết lập/giải thích riêng cho clip ngắn.

**Đề xuất:** cụm đầu gọn “Tên bài · thời lượng · dụng cụ/độ khó” + play; notice cần thiết ngắn rõ trước kích hoạt, chi tiết provider/caption trong disclosure có nhãn. Thêm nội dung được duyệt “Trước khi bắt đầu / 2–4 điểm cần chú ý / lựa chọn nhẹ / khi nào dừng”. Giữ9:16 không crop và không dùng thumbnail chưa duyệt.

**Cần kiểm:** ảnh đầu trang/sau scroll, body text lớn, portrait/landscape, playback thuộc môi trường kiểm riêng.

### S09 — P2: onboarding có “Tiếp tục/Để sau” không khớp hành vi

**Bằng chứng source, cao:** `Prototype:1297` Tiếp tục luôn mở panel chuyển nháp, ngay cả không có nháp; `1298` Để sau ở account-return thông thường gọi complete, thực sự persistProfile1264. Mã A04 hiển thị trong eyebrow1291.

**Hệ quả:** người dùng không rõ đang bỏ qua bước, lưu thông tin hay chuyển check-in. Lựa chọn phụ có thể làm cùng hành động lưu mà tên gọi không thể hiện.

**Đề xuất:** một CTA “Hoàn tất hồ sơ”; nếu mọi trường tùy chọn thì “Bắt đầu với cài đặt mặc định”. Chỉ hỏi chuyển nháp khi có nháp và consent hiện hành. Bỏ mã màn hình A04 khỏi UI người học.

**Cần kiểm:** new account có/không nháp, quay từ profile và check-in, field edit, label và tác động; không chạy tài khoản live.

### S10 — P2: Hồ sơ quá nhiều mục chưa có giá trị thao tác

**Bằng chứng source, cao:** `Prototype:1591–1601`9 hàng tài khoản/hỗ trợ. Nhắc tập1595 nói “kênh, giờ và múi giờ”, bên trong1697 chưa có lịch nhắc; access1698 chủ yếu chưa có trả phí; sharing1695 chưa có lớp. Nút xuất/xóa1601 dẫn cùng Help, chưa có phương thức tiếp nhận; help1699 không có kênh liên hệ cụ thể.

**Hệ quả:** tăng số màn và cảm giác app chưa hoàn thiện; người cần trợ giúp dễ đi vào vòng các trang giải thích.

**Đề xuất:** tầng đầu Hồ sơ / Dữ liệu và quyền / Hỗ trợ. Tính năng chưa dùng được gọn trong một mục trạng thái, không quảng bá khả năng đặt giờ. Cần một kênh hỗ trợ thật trước mở rộng thu dữ liệu. Đây là đề xuất UX, không phê duyệt gửi liên hệ hay mở chức năng mới.

**Cần kiểm:** task tìm bật/tắt lưu, sửa tên, tìm hỗ trợ; rõ số thao tác và hiểu nhãn.

### S11 — P2: “Đổi email có xác minh” thực chất dẫn luồng đăng nhập

**Bằng chứng source, cao:** `Prototype:1696` nút Đổi email đặt authMode=login/authReturnTo=security rồi push auth-email. `AuthEmailScreen:1053–1055` gọi `auth.signInWithOtp` với `shouldCreateUser=false` cho mode này, không phải update email của user hiện tại.

**Hệ quả:** người dùng có thể hiểu đang sửa email cùng tài khoản nhưng thực hiện đăng nhập tài khoản khác, dẫn dữ liệu trông mất hoặc bị tách.

**Đề xuất:** nếu ý định là switch thì nhãn “Đăng nhập bằng tài khoản khác”, cảnh báo rõ hành trình theo tài khoản. Chỉ dùng “Đổi email” khi có contract update email và xác minh đúng account. Không tự thêm backend từ audit này.

**Cần kiểm:** fixture switching và nội dung cảnh báo, không gửi email thật; giữ tách biệt với native trial đã đóng.

### S12 — P2: dấu tiếng Việt ở heading bị rời, và copy kỹ thuật làm yếu sự rõ ràng

**Đã xem ảnh mới:** `05-discover.jpg` hiển thị bất thường “bắ t đầ u”, `11-notifications.jpg` hiển thị “Nhắ c”. Source có đúng chuỗi, NFC precomposed U+1EAF/U+1EA7, không có khoảng trắng sau nguyên âm này. CSS cuối `prototype.css:547` đặt heading theo `--font-editorial`; `design-system/tokens.css:28` chọn Georgia trước Times New Roman. Kiểm tra read-only cmap bằng WPF `GlyphTypeface` trên font local `C:\Windows\Fonts\georgia.ttf` xác nhận thiếu U+1EAF, U+1EA7, U+1EC3, U+1ED9, U+1ECD; có ASCII a. `times.ttf` và `arial.ttf` có U+1EAF/U+1EA7. Roboto VI400/500/700 đã import (`Prototype:5–7`), nên không nên kết luận cả app thiếu Vietnamese font.

**Nguyên nhân khả dĩ, confidence cao nhưng chưa chốt browser font:** fallback/shaping trộn glyph giữa các font serif, không phải source chèn space. Cần browser platform-fonts/override đối chứng để khẳng định font thực dùng. Đây không giống một lỗi chỉ do JPEG vì méo/gap đi theo đúng glyph thiếu trong hai ảnh khác màn.

**Bằng chứng source, cao về copy; thị giác cần compute/ảnh:** profile1587 “Supabase Auth”; onboarding1299 “ghi server”; settings1697 “Backend”; nhiều policy IDs ở1689. CSS nền có10–12px cho nhiều helper/choices (`prototype.css:12,27–34,43,75,80`) nhưng phải kiểm cascade cuối file trước kết luận contrast/touch-size.

**Hệ quả:** thông tin hệ thống khó hiểu với người học; các chú thích quan trọng về ghi/lưu có nguy cơ được trình bày như footnote.

**Đề xuất:** dùng một font heading có đủ glyph Việt đã kiểm, giữ tinh thần serif nếu cần; thử đối chứng Times New Roman local hoặc một serif đủ Vietnamese được đóng gói/licensed trước quyết định brand. Copy đời thường: “Email đã xác minh”, “Lưu vào tài khoản”, “Tính năng nhắc tập chưa mở”. Nâng hướng dẫn cần ra quyết định lên body14–16px; policy source/version đặt trong chi tiết quyền, vẫn minh bạch. Không kết luận WCAG fail từ source một mình.

**Cần kiểm:** computed font/contrast/targets, zoom200%, Vietnamese glyphs, 320px, phone/desktop. Parent đang rà soát ảnh hiện tại.

## Liên hệ với ý tưởng AI text + hình ảnh

Source đã có tách `practice`/`LessonReader` và content-review; catalog được duyệt còn đóng theo checkpoint. Khoảng trống quan trọng hiện nay là biên tập “một buổi có mục tiêu và hướng dẫn đủ theo”, không phải thiếu thêm nhiều clip hoặc ảnh. Nội dung AI hỗ trợ có thể bổ sung lời giải thích, cấu trúc, bản dịch và hình minh họa, nhưng việc gọi thành khóa học cần mục tiêu học, tiến trình, prerequisite, nội dung từng buổi, cách tự kiểm hiểu và người chịu trách nhiệm chuyên môn. Không nên dùng AI-generated pose image làm nguồn chỉ dẫn duy nhất hay coi technical pass là duyệt chuyên môn/rights.

Không có test mới/live read/write/native acceptance trong ghi chú này. Các khuyến nghị là phương án để parent tổng hợp cùng ảnh mới và đánh giá chuyên môn bên ngoài.
