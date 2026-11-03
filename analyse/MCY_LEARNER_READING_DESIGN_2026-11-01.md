# Màn học bài cho học viên — thiết kế và phương án phát triển (2026-11-01)

Đề xuất, chưa phải phê duyệt triển khai. Chưa có mã, migration, Edge, bucket hay bản phát hành nào thay đổi trong bước này. Mockup: canvas "Màn học bài cho học viên" (Artifact, riêng tư).

Liên quan: [báo cáo UX bài giảng 2026-10-31](MCY_LESSON_UX_AND_INSTRUCTOR_PLAN_2026-10-31.md) đã nhận xét 14 bài đọc chủ yếu "nhận biết/đọc" chứ chưa dạy cách làm, và việc viết lại cần người có chuyên môn. Tài liệu này không thay phần đó: nó chỉ thêm màn đọc và đường xuất bản cho học viên. Màn Xem trước một-bước-một-màn đã làm ở Giai đoạn 0 là nền để dùng lại.

## 1. Trạng thái đã đọc lại (staging `mhumbczqrzutdnraafhs`, 2026-11-01)

- `private.mcy_content_review_states`: 14 bài `learning_reading` + 1 `learning_intro`, tất cả `approved`, ghi lúc 2026-10-31 17:47 UTC (Owner tự duyệt hàng loạt). Bản ghi duyệt không làm bài hiện cho ai.
- App học viên chưa có màn đọc: chỉ có `ReadingPreviewScreen` cho Owner/người được giao. Học viên không có route, API hay bucket công khai nào để lấy nội dung.
- Độ đầy đủ hình (đọc từ `content/yoga-library/units`): 9 bài đủ hình (5/5 bước có hình; 55 hình), 5 bài không có hình nào (`identity_blocked` ở cả 5 bước: kneeling-backbend, low-crow, low-wheel, stand-up, wild-thing-high). Không có bài "thiếu một phần": quyết định đủ/thiếu hình thực chất là 9 bài hiện và 5 bài chỉ chữ.

## 2. Quyết định của Owner (2026-11-01)

Người duyệt tự chọn, bằng cấu hình, bài thiếu hình có được hiện cho học viên hay không. Thiết kế: chính sách chung (mặc định **Chỉ hiện khi đủ hình**) + ghi đè riêng từng bài + công tắc **Hiện cho học viên** tách khỏi bản ghi duyệt.

## 3. Thiết kế màn học viên

Bảy bảng trong canvas: (1) Khám phá có mục "Bài đọc có hình", (2) tổng quan bài, (3) bước có hình, (4) bước chỉ chữ, (5) đọc xong, (6) người duyệt: chính sách hiển thị, (7) quy tắc và trạng thái lỗi.

Nguyên tắc:
- Lối vào ở tab **Khám phá**, dưới khoá học video; không thêm tab. Mỗi bài có nhãn CÓ HÌNH hoặc CHỈ CHỮ, bài chỉ chữ không bị coi là "hỏng".
- Một bước một màn, giữ tiến độ 5 đoạn và nút trước/sau đã có ở bản Xem trước. Chân trang đặc, có đệm lề, đúng quy tắc footer của FlowStack.
- Dấu hiệu dừng ở trên màn tổng quan, và nút "Dấu hiệu dừng" luôn ở thanh trên mỗi bước; nội dung nhẹ hơn nằm trong mục thu gọn.
- Bài chỉ chữ không có khung ảnh trống. Chữ thân bài lớn hơn (serif 19 px) để chữ tự đứng được.
- Hình do AI luôn gắn nhãn HÌNH AI + "Nhân vật hư cấu, chỉ để minh hoạ". Văn bản thay thế (`alt`) lấy từ dữ liệu có sẵn.
- "Đọc xong" nói rõ không ghi nhận một buổi tập, không điểm số, không chuỗi ngày. Lối nối sang check-in là liên kết phụ, không phải CTA chính.
- Trạng thái: đang tải, mất kết nối (Thử lại), hình lỗi (chữ vẫn đọc được, có Tải lại hình), bài bị gỡ khi đang đọc, danh sách trống. Học viên không bao giờ thấy số bài đang bị giữ lại.
- Chưa kiểm: TalkBack, cỡ chữ lớn, hai preset simulator, 390 px thật. Đó là việc của bước triển khai.

## 4. Phương án giao nội dung đã duyệt cho học viên

| | A. Đóng gói trong app | B. Edge function đọc theo yêu cầu | C. Bản chụp tĩnh trong bucket công khai (khuyến nghị) |
|---|---|---|---|
| Cách làm | Sinh JSON vào bundle | Hàm mới trả danh sách/bài, ký URL hình | Khi Owner bấm Lưu, server ghi `manifest.json` và `units/<id>/<version>.json` + chép hình đã duyệt vào bucket công khai |
| Gỡ bài | Phải phát hành lại app | Ngay lập tức | Sau khi manifest được ghi lại (vài chục giây theo cache) |
| Chi phí/độ phức tạp | Thấp nhất | Cao: hàm mới, JWT/khách, giới hạn tần suất | Vừa: một action trong `owner-control-plane`, một bucket |
| Hợp với AGENTS | Vi phạm: không đưa registry sinh sẵn vào client | Tốt | Tốt |
| Dùng offline, CDN | Có | Không | Có (tên file theo mã băm, cache bất biến) |

Khuyến nghị C. Quy tắc hiển thị được tính ở máy chủ tại thời điểm Lưu và tính lại khi một bản duyệt bị thu hồi hoặc phiên bản đổi (cùng handler đã xử lý thu hồi). Nếu cần "gỡ tức thì tuyệt đối" thì chuyển sang B sau; mô hình dữ liệu dưới đây dùng được cho cả hai.

### Mô hình dữ liệu và quy tắc

- Bảng riêng, đặt ở `private`, không cấp quyền cho client: `mcy_reading_publication(candidate_id, content_version, visible boolean, text_only_allowed boolean null, updated_by, updated_at)` + một dòng cấu hình chung `default_text_only_allowed`.
- Bài hiện khi: có bản duyệt `approved` đúng `content_version` hiện hành, `visible = true`, và (mọi bước có hình hoặc `text_only_allowed` hiệu lực = true, ưu tiên giá trị riêng từng bài rồi mới tới mặc định).
- RPC chỉ cho service role; mỗi lần đổi ghi một dòng vào `private.audit_events`. Không đụng `mcy_content_review_states`.
- Bucket `reading-published` công khai, chỉ chứa hình của bài đang hiện, tên file là SHA-256. Bucket `reading-preview` vẫn riêng tư cho Owner.

### Bản chiếu dành cho học viên (whitelist)

Chỉ gửi: `title`, `intro`, `audience`, `preparation`, `prerequisites`, `learningObjectives`, `stopGuidance`, `steps[].{title, body, detail, alternative, stopCue}`, hình `{url, width, height, alt}` và nhãn. Không bao giờ gửi: `blockers`, `entry/exit`, `readTimeNote`, `productionStatus`, `provenance`, `rightsStatus`, `expertStatus`, mã băm nguồn, đường dẫn nội bộ.

### Phát hiện về nội dung, cần quyết định trước khi hiện cho học viên

1. Chú thích hình trong dữ liệu ghi "Ảnh AI nháp — … Chưa duyệt chuyên môn/quyền" và `disclosure` nói "Chưa duyệt". Sau khi Owner đã duyệt, câu này không còn đúng. Có hai cách: (a) bản chiếu tự dựng chú thích từ `synthetic: true` ("Hình AI · nhân vật hư cấu") và bỏ phần "chưa duyệt" (không đổi nội dung nên không phải duyệt lại, nhưng phụ thuộc cách xử lý chuỗi); (b) sửa dữ liệu, tức là phiên bản mới và duyệt lại 14 bài (hạn mức 20 lượt/24 giờ đủ cho một lần).
2. Có vài chỗ chữ nội bộ lọt vào phần học viên đọc: "brief có điều kiện" và "Chưa có ảnh AI…" ở mục Chuẩn bị của cả 5 bài chỉ chữ; "progression" ở đoạn mở đầu của low-crow; "nguồn local" ở mục tiêu của low-crow và bước 3 của stand-up. Nên biên tập lại các chỗ này cho học viên; cách này cũng cần duyệt lại.
3. Hình do AI tạo và chưa có chuyên gia yoga xem tư thế. Quy tắc của dự án yêu cầu xem chuyên môn trước khi hình AI về tư thế/giải phẫu tới học viên; bản duyệt của Owner là khai báo của chính Owner, tôi không đánh giá thay phần đó.

## 5. Tính năng cho tài khoản học viên

Phạm vi phát hành 1.0: dùng như khách, tài khoản là tuỳ chọn, không AI. Vì vậy:

| Hạng mục | Khuyến nghị | Ghi chú |
|---|---|---|
| Xem bài đọc | Khách và học viên đều xem được | Nội dung công khai theo phương án C, không cần đăng nhập |
| "Tiếp tục từ bước đang đọc" | Làm, lưu cục bộ trên máy (khoá theo bài + phiên bản) | Không cần backend, không đụng consent; mất khi xoá dữ liệu app |
| Đánh dấu "đã đọc" | Chỉ cục bộ, không đếm, không chuỗi ngày | Đồng bộ tài khoản để giai đoạn sau |
| Đồng bộ tiến độ đọc theo tài khoản | Hoãn | Cần bảng riêng có RLS, cascade khi xoá tài khoản (`delete_my_account`), copy consent và ghi vào trang chính sách; không dùng khi chưa quyết |
| Nối với check-in | Liên kết phụ ở màn "Đọc xong" | Không tự gợi ý bài theo check-in; không có AI chọn bài (ngoài phạm vi 1.0) |
| Gợi ý "bài tiếp theo" | Theo thứ tự biên tập, không theo sức khoẻ | Thứ tự do Owner đặt khi cần |
| Đọc offline | Hoãn | Tên file theo mã băm cho phép làm sau |
| Tìm kiếm/lọc | Hoãn | 14 bài chưa cần; chip "Tất cả/Có hình/Chỉ chữ" là phương án nhỏ nếu danh sách dài |
| English | Không | Production vẫn chỉ tiếng Việt |

## 6. Kế hoạch đề xuất (một đợt phát hành mới, versionCode 5)

1. Chốt 4 quyết định ở mục 7 (không cần mã).
2. Backend trước: migration bảng publication (+ rehearsal PGlite), bucket `reading-published`, action `publish_reading`/`read_reading_settings` trong `owner-control-plane`, sửa để thu hồi bản duyệt tự gỡ bài. Test handler, quyền, thu hồi, chính sách đủ/thiếu hình.
3. Client: màn Khám phá + 4 màn đọc theo canvas, màn cấu hình trong "Duyệt nội dung", tiếp tục cục bộ. Playwright cho luồng đọc (có hình, chỉ chữ, lỗi mạng, bài bị gỡ), kiểm tra tiếng Việt, 390 px, hai preset.
4. Phát hành đồng bộ theo `mcy-release-sync`: một HEAD cho web (push → Vercel), APK cài lên điện thoại thử, AAB lên Internal testing. Thứ tự: backend, rồi client.
5. Owner bật công tắc từng bài sau khi xem trên điện thoại.

Kích cỡ ước lượng: backend M, client L, kiểm thử/phát hành M. Mỗi bước backend, cài đặt, đẩy lên cần yêu cầu riêng của Owner theo quy tắc hiện hành.

## 7. Cần Owner quyết định

1. Giao nội dung: phương án C (khuyến nghị) hay B?
2. Chú thích hình/chữ nội bộ: dùng bản chiếu tự xử lý ngay (không duyệt lại) hay biên tập dữ liệu rồi duyệt lại?
3. Hình AI: đã có chuyên gia yoga xem tư thế chưa, hay chỉ hiện các bài sau khi xem?
4. Khách có xem được không, hay chỉ học viên đăng nhập?
