# Một chút yoga — kế hoạch UI/UX v2

Ngày 27/09/2026. Chỉ phân tích và cập nhật kế hoạch. Người dùng đồng ý hướng UX trước; các ý bổ sung cần được đánh giá, không tự động mở rộng phạm vi triển khai.

## Quyết định đề xuất

Giữ trọng tâm: check-in → trò chuyện ngắn → lựa chọn hôm nay → thực hành → phản hồi trung thực. Chuẩn bị nền tảng đa ngôn ngữ và đa định dạng; giới hạn nội dung ban đầu để kiểm soát chất lượng.

| Nội dung | Đề xuất |
|---|---|
| Slogan “Vạn chút an yên” | Đã sửa theo đính chính của người dùng; áp dụng UI/asset ở lần triển khai tới |
| Check-in hai bước, font/icon/footer | Giữ hướng người dùng đã đồng ý |
| Caption body map | Tách ngoài ảnh, tăng khoảng cách, kiểm cả ba minh họa |
| English UI | Nền i18n ngay; thiết kế VI/EN flow chính; phát hành EN sau kiểm duyệt |
| Video dọc/ngang | Hỗ trợ cả hai trong cùng player từ đầu |
| Kiến thức yoga | Pilot 5–8 bài phục vụ người mới, nằm trong Khám phá |
| Thiền thu sẵn | Pilot 3–5 audio sau UX cốt lõi, khi có nội dung/quyền/người duyệt |
| AI hướng dẫn thiền | Tách chọn nội dung có sẵn khỏi sinh hướng dẫn; hoãn sinh tự do |
| Mobile web không mockup | Nên làm mode riêng, giữ simulator review |

## 1. Slogan và nhận diện

“Vạn chút an yên” là slogan người dùng đính chính, rút từ “Một chút yoga, vạn chút an yên”. Bỏ phương án trung gian “Một chút an yên”. Tên và slogan giữ nhịp đối ứng một/vạn mà không lặp tên thương hiệu. Dùng hai cấp chữ rõ ràng; ưu tiên welcome, giới thiệu, splash thay vì lặp ở mọi header. Giữ logo Khoảng mở.

Chưa chốt slogan tiếng Anh. A Little Yoga vẫn là giả thuyết thương hiệu; đổi ngôn ngữ giao diện không tự động đổi brand name. Bản tiếng Anh của slogan cũ là tư liệu lịch sử, không phải copy mới đã duyệt.

## 2. Đa ngôn ngữ

Nên chuẩn bị bây giờ vì đang tái cấu trúc UI, nhưng chưa dịch cả kho nội dung. Thiết kế VI/EN song song cho welcome, check-in, trò chuyện mẫu, kế hoạch, player, reflection, auth/consent và trạng thái lỗi. Bản EN ban đầu dùng nội bộ để kiểm layout và thuật ngữ.

Tách ba lớp: ngôn ngữ giao diện; ngôn ngữ bài viết/bài học; ngôn ngữ audio và phụ đề. Video có tiêu đề English chưa phải video giảng tiếng Anh. Hiển thị rõ ví dụ “Audio: Tiếng Việt · Subtitles: English”.

Frontend: message keys và tệp dịch version cùng mã; dùng Intl cho ngày/số; tránh nối mảnh câu; enum lưu độc lập label. Chọn ngôn ngữ bằng tên “Tiếng Việt / English”, không dùng quốc kỳ. Thiết bị gợi ý lần đầu, lựa chọn chủ động được giữ lại và không cần đăng nhập. Cỡ chữ lớn/câu dài phải wrap. Dùng layout theo hướng văn bản để giảm chi phí RTL về sau, nhưng không tuyên bố đã hỗ trợ mọi ngôn ngữ. Không tự dịch ghi chú người dùng bằng AI.

BCP 47 tương thích `vi-VN` hiện tại; dùng `en` hoặc vùng cụ thể khi thật sự cần. Tham khảo [W3C language tags](https://www.w3.org/International/questions/qa-choosing-language-tags) và [Internationalization Quick Tips](https://www.w3.org/International/quicktips/).

**Đã có trong migration repository:** profiles.locale; session_versions, course_versions, editorial_versions có locale; source_version_id; caption_tracks.locale; session/editorial publications theo locale; region_code của check-in độc lập ngôn ngữ. Đây là kiểm tra source, không phải xác nhận live DB ở lượt này. Không cần database riêng hoặc cột title_vi/title_en/title_fr.

**Cần bổ sung/kiểm chứng:** API lưu và đọc lại locale; ngôn ngữ audio gốc và nhiều track; ưu tiên ngôn ngữ nội dung khi khác UI; bản dịch liên kết đúng source version và đánh dấu stale khi nguồn đổi; alt text/taxonomy/body blocks bản địa hóa; reviewer và trạng thái duyệt theo locale. UI strings ở code, học liệu và bản dịch ở DB.

Không âm thầm fallback nội dung hướng dẫn sang ngôn ngữ khác: báo thiếu bản dịch và cho chọn bản gốc. Nội dung bị rút không được quay lại qua fallback. Lịch sử tập tham chiếu đúng version đã dùng. Consent phải giữ đúng policy version/ngôn ngữ đã trình bày khi hoàn thiện phần này; không dùng bản dịch máy tức thời cho consent/hướng dẫn quan trọng.

## 3. Video thực tế và thiết kế player

So sánh phương án lưu trữ/phát video: [VIDEO_HOSTING_REVIEW.md](D:/Projects/MCY/analyse/uiux-audit-2026-09-26/VIDEO_HOSTING_REVIEW.md). Khuyến nghị: thử ít clip private trên staging; cân nhắc managed video cho học liệu cốt lõi; YouTube dành cho nội dung công khai miễn phí. Chưa chốt mua dịch vụ hoặc upload.

Đã đọc metadata trong `D:\nilaza\documents`. [Danh mục CSV](D:/Projects/MCY/analyse/uiux-audit-2026-09-26/media-inventory-2026-09-27.csv).

- 38 MOV: 18 “Trị liệu”, 13 “Tư thế lẻ”, 7 “Tổng hợp tư thế cơ bản”.
- 37 file 1080×1920 và một file 1080×1918; tất cả dọc, không có mẫu ngang.
- 16,835–63,461 giây/file; cộng thời lượng các file khoảng 22 phút 29 giây, không đồng nghĩa một buổi tập liên tục.
- Tổng 551.262.056 byte, khoảng 551 MB thập phân / 526 MiB; lớn nhất khoảng 48 MB thập phân, chưa vượt 50 MB.
- Chưa xem/nghe toàn bộ, kiểm codec, quyền, phụ đề hay chất lượng chuyên môn. Không suy ra hiệu quả từ tên file.

Độ dài gợi ý đây là nguồn clip hướng dẫn/học liệu ngắn. Chưa coi mỗi clip là một buổi hoàn chỉnh. Muốn ghép buổi cần giảng viên duyệt thứ tự, chuyển động giữa clip, thời gian giữ/lặp, nhịp thở và điểm dừng. Không để AI tự ghép dựa trên tên file.

| Tình huống | Video dọc | Video ngang |
|---|---|---|
| Trang giới thiệu | Poster giới hạn chiều cao, thông tin ở ngoài | Poster đúng tỷ lệ, cùng anatomy bài học |
| Thực hành điện thoại dọc | Khung lớn; controls/phụ đề tránh che tay chân | Giữ nguyên hình; nút fullscreen và tùy chọn xoay |
| Điện thoại ngang/web rộng | Video giữa hoặc một cột, nội dung ở bên | Vùng phát rộng, thông tin phụ gọn |

Playback luôn giữ trọn người và dụng cụ; không dùng cover để crop. Poster có thể crop được duyệt riêng. Tỷ lệ lấy từ kích thước hiển thị sau rotation, không ép mọi nguồn vào 9:16/16:9. Không buộc người dùng xoay máy. Player dọc không phải feed vuốt: không vô tình chuyển bài khi vuốt, không autoplay âm thanh.

Controls: play/pause, tua lại đoạn ngắn, tiến độ thật, phụ đề/transcript, trạng thái tải/lỗi. Kiểm khả năng xem khi máy đặt trên sàn. Tham khảo [web.dev Audio and video](https://web.dev/learn/html/audio-video).

Pipeline đề xuất: giữ gốc → probe/scan → bản phát tương thích (dự kiến MP4 H.264/AAC, phải kiểm codec nguồn) → poster/phụ đề → review. Chưa cần HLS phức tạp cho cả kho; quyết định sau khi đo độ dài, chất lượng và mạng. Không nhúng kho video vào bundle web/native.

Schema đã có media_assets với kích thước/thời lượng/bytes/MIME, media_renditions, caption_tracks và asset rights. Cần chuẩn hóa rotation/display aspect, audio language/track selection và clip tái sử dụng: session_segments hiện mô hình mốc thời gian, chưa mặc nhiên giải quyết session gồm nhiều file nguồn.

Staging dự án đang giới hạn Free 1 GB theo hồ sơ hiện có; [Supabase xác nhận trần Free 50 MB/file](https://supabase.com/docs/guides/storage/uploads/file-limits). Bộ gốc có thể vừa giới hạn danh nghĩa khi còn quota, nhưng rendition/poster và nội dung mới tăng dung lượng. Thử vài clip sau gate trial; không upload/nâng gói trong lượt phân tích. Metadata không thay thế kiểm tra content/quyền/scanning.

## 4. Caption body map

Đặt caption ngoài bounding box ảnh, cách hình 12–16 px và cách nút đổi minh họa 8–12 px. Đề xuất “Nhìn từ phía sau”, dòng phụ “Trái/phải theo cơ thể bạn”. Chữ thường 12–13 px, đủ tương phản, cho wrap khi phóng chữ. Kiểm neutral/feminine/masculine; giữ marker đúng vị trí. Không tạo khoảng trống bằng cắt vùng giải phẫu cần chọn hoặc margin âm.

## 5. Kiến thức yoga và học qua tranh

Nên có trong Khám phá, phục vụ thực hành: bắt đầu, dụng cụ, cách đọc hướng dẫn, tư thế, phiên bản dễ hơn, nguồn gốc yoga. Pilot 5–8 bài, có nguồn, tác giả, người duyệt, ngày cập nhật; hình có chú thích/alt text; liên kết clip phù hợp. Nội dung lịch sử cần nguồn và bối cảnh; nội dung động tác cần duyệt chuyên môn. Nhãn như “Trị liệu”, “Trẻ hoá”, “Nội tiết tố” trong tên file chưa phải nhãn phát hành được duyệt.

Học qua tranh là định dạng của Kiến thức, chưa cần một tab riêng. Dùng chuỗi hình theo bước kèm diễn giải và clip để đối chiếu. AI hỗ trợ tranh chủ đề/bản nháp; hình tư thế phải được kiểm tay chân, trục cơ thể, bên trái/phải và thứ tự bước. Không lấy tranh AI chưa duyệt làm hướng dẫn duy nhất. Lưu nguồn, quyền, AI-assisted và reviewer. Chưa tạo ảnh/gửi video cho AI ở lượt này.

## 6. Thiền

| Mức | Phương án |
|---|---|
| Audio thu sẵn | Pilot 3–5 audio khi có giảng viên/quyền/người duyệt |
| Trợ lý chọn audio đã duyệt | Hợp với gợi ý hôm nay; ban đầu có thể dùng bộ lọc/quy tắc minh bạch |
| AI sinh lời/giọng, đối thoại trực tiếp | Hoãn; cần gate riêng về chất lượng, dữ liệu, chi phí, độ trễ và phiên gián đoạn |

TTS đọc script đã duyệt khác AI tự sáng tác. Audio thử có thể về làm quen, chú ý hiện tại, nghỉ giữa ngày, thư giãn; đây là đề xuất, chưa có tài nguyên audio được xác nhận.

Player có pause/dừng, tiến độ, tua, transcript, xử lý cuộc gọi/đổi app. Background audio và khóa màn hình cần test native session/browser; không hứa chạy nền ổn định trước kiểm thử. Không ép người muốn thiền đi qua body-map: hỏi mục tiêu/thời gian ngắn, body check-in tùy chọn. Reflection vẫn chấp nhận như cũ, khó chịu hơn, chưa rõ và bỏ qua.

Tham khảo tổ chức nội dung: Headspace có [thiền](https://www.headspace.com/content/categories/meditation) và [bài viết](https://www.headspace.com/articles); Down Dog đưa thiền/thở vào lựa chọn loại buổi ([FAQ](https://www.downdogapp.com/faq)). Không lấy các ví dụ này làm bằng chứng MCY cần cùng quy mô hoặc có cùng hiệu quả.

## 7. Điều hướng tổng thể

Giữ Hôm nay — Hành trình — Khám phá — Hồ sơ. Trong Khám phá: Tập yoga — Thiền — Kiến thức khi có nội dung thật; Học qua tranh thuộc Kiến thức, khóa học thuộc Tập yoga. Hôm nay ưu tiên một lựa chọn có lý do; có thể đổi loại thực hành khi thiền sẵn sàng. Không thêm bottom tab cho từng loại nội dung và không bắt check-in để đọc bài.

## 8. Mobile web không khung

Nên có ba mode: simulator review; web app thật; native Capacitor. Hiện native đã có nhánh bỏ frame, còn web mobile vẫn dùng simulator. Ẩn bezel bằng CSS là chưa đủ: còn scale/kích thước cố định, status bar, home indicator và bàn phím mô phỏng.

Web thật dùng viewport/bàn phím/safe-area thật, không fake status/camera/home indicator. Web hẹp mặc định mode app, có đường dẫn/chế độ review tường minh để giữ iPhone/Pixel picker. Tách presentation mode khỏi native capabilities; không giả native để gọi plugin Capacitor trên web. Không dựa riêng user-agent. Full viewport browser không đồng nghĩa fullscreen OS.

Kiểm thanh địa chỉ co/giãn, visualViewport, input focus, rotation, sheet và footer. Giữ web rộng trong giai đoạn tối ưu riêng. Đây là thay đổi runtime đề xuất cho lần triển khai được yêu cầu sau; không sửa protected files hoặc hash lúc lập kế hoạch. Khi triển khai phải kiểm simulator/web/native trước khi cập nhật hash ảnh hưởng.

## 9. Kế hoạch cập nhật

1. **Đặc tả và mockup:** slogan mới; hai bước check-in/skip/account; brand/font/footer/caption; VI/EN flow chính; player dọc/ngang; web mobile thật; chữ lớn/lỗi/thiếu bản dịch. Gate tài khoản và consent phải được thể hiện rõ trong đặc tả, không suy từ đồng ý UX để tự bỏ gate.
2. **Nền tảng lần triển khai tới:** sửa UI dùng chung, message keys/locales, flow, web mode, player. Chỉ lập migration bổ sung sau đối chiếu schema/API; không tạo lớp dịch trùng hệ version có sẵn. Learner backend giữ phạm vi hiện tại, media trial private staging.
3. **Pilot nội dung:** review vài clip; xác nhận teacher roster, quyền, privacy statement, nội dung và phụ đề. Chuẩn bị bộ kiến thức/audio nhỏ. Learner-visible publication vẫn cần reviewer và gate riêng; private draft không tự thành nội dung học viên.
4. **Mở rộng:** phát hành EN sau kiểm duyệt flow/nội dung cốt lõi; mở khóa học khi curriculum sẵn sàng; AI inference và thiền sinh động theo gate riêng. Không tự tạo production/nâng storage.

Tiêu chí nghiệm thu: VI/EN không tràn/cắt dấu; đổi ngôn ngữ không mất nháp; nội dung khác ngôn ngữ có nhãn; bản dịch đúng version; video không crop người; caption tách khỏi hình; footer không lộ chữ; web mobile không chrome/keyboard giả; iPhone/Pixel review hoạt động; quyền nội dung không thay đổi theo locale/format; reflection giữ mọi kết quả trung thực.

Pilot đo khả năng hiểu bước tiếp, chọn ngôn ngữ/định dạng, xem rõ giảng viên, phân biệt clip ngắn với buổi hoàn chỉnh, quay lại sửa. Không suy diễn an yên/cải thiện từ lượt xem/nghe hoặc hoàn thành.
