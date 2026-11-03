# Audit UI/UX khóa học video miễn phí — 30/09/2026

## Phạm vi và kết luận

Review lại hành trình danh mục khóa học → chi tiết khóa → mở một bài YouTube trong ứng dụng, sau thay đổi UI cuối cùng. Local preview: `http://127.0.0.1:4177/?mode=web`; Chrome, viewport mobile 390×844 và desktop 1440×1000. Đây là browser desktop ở kích thước mobile, không phải iPhone/Android thật.

**Đánh giá:** giao diện hiện có ngôn ngữ thị giác nhất quán với design system và bố cục đáp ứng tốt hai kích thước đã thử. Course detail mobile đã xếp dọc, desktop có media/copy và danh sách bài hai cột; canvas desktop được giới hạn và căn giữa. Chưa đủ căn cứ để gọi trải nghiệm video production-ready: chất lượng phát trong iframe biến thiên giữa lần chụp và môi trường; accessibility, thiết bị thật, quyền media, captions và kiểm duyệt an toàn vẫn chưa hoàn tất.

## Kết quả theo bề mặt

| Bề mặt | Kết quả | Nhận xét |
|---|---|---|
| Danh mục mobile 390×844 | PASS về bố cục | Ba nhóm khóa học có thứ bậc rõ; card chạm được, không tràn ngang (`scrollWidth = 390`). Thanh điều hướng dưới có nền đục; nội dung dài tiếp tục cuộn được phía sau. Ảnh ở vị trí cuộn đầu cho thấy dòng ghi chú cuối gần thanh điều hướng, nên cần giữ kiểm tra vùng cuộn cuối trên máy thật. |
| Danh mục desktop 1440×1000 | PASS | Nội dung được giữ trong cột đọc có giới hạn, hai cột card cân đối; không bị kéo căng theo toàn chiều rộng cửa sổ. Khoảng trống rộng là có chủ đích, nhưng có thể dùng thêm để tăng kích thước chữ/card ở màn lớn nếu thử nghiệm cho thấy mật độ hiện tại quá thấp. |
| Chi tiết khóa mobile | PASS về responsive | Poster 16:9 trước khi phát giữ nút Play trọn vẹn; copy nằm dưới media. Danh sách bài tiếp tục xuống dưới và cuộn tự nhiên. |
| Chi tiết khóa desktop | PASS | Media nằm cạnh mô tả; danh sách bài hai cột, tên và thời lượng dễ quét. Không có tràn ngang. |
| Trợ giúp khi video lỗi | PASS trong UI/E2E | Thêm disclosure `Video gặp sự cố khi phát?`; panel retry/fallback mặc định đóng, có `aria-expanded`/`aria-controls`, vùng tương tác tối thiểu 44px và focus style. Retry giữ người học trong app; link mở nguồn YouTube là lựa chọn phụ, chỉ lộ khi người dùng mở trợ giúp. |
| Iframe YouTube thực | PARTIAL | Ảnh desktop hiện khung hình video và thời gian 0:02/0:43. Một ảnh mobile từ lần chụp trước hiện video thật; lần chụp mới nhất ở 390×844 vẫn spinner sau 20 giây. Iframe gắn vào trang không đồng nghĩa phát ổn định. Không suy rộng kết quả sang cả 38 video, âm thanh, WebView hoặc thiết bị thật. |

## Thay đổi vừa hoàn tất

- Thay recovery copy và hai hành động luôn hiện bằng một lối trợ giúp gọn; khi có lỗi, người học chủ động mở panel để tải lại trong app hoặc chọn sang YouTube.
- Đồng bộ trạng thái disclosure khi đổi bài/rời màn khóa, tránh panel cũ bật nhầm ở bài mới.
- Thêm E2E cho trạng thái đóng/mở, nội dung panel, URL fallback an toàn và retry đúng video mà không tạo iframe trùng.

## Rà soát nội dung và mức sẵn sàng

- Copy UI giải thích rõ video là từng bài để tự chọn và không tuyên bố app đã ghép buổi tập/đánh giá mức phù hợp sức khỏe.
- Các tên như `bài 17`, `bài 18`, `bài 32`… trong metadata hiện vẫn mang sắc thái nhãn kỹ thuật/chưa biên tập. Cần đối chiếu từng clip với tiêu đề và nội dung thật rồi chuẩn hóa trước khi mở rộng phân phối; không tự suy ra động tác từ ID hoặc thời lượng.
- Poster trước phát là thẻ thương hiệu chung, không phải ảnh đại diện của clip. Giữ như hiện tại cho tới khi có quyền thumbnail rõ ràng; sau đó bổ sung thumbnail đồng bộ và alt text phù hợp.
- Phần retry không thay thế cho thông báo lỗi tự phát hiện: cross-origin iframe không cho app biết chắc trạng thái media. Người dùng cần có đường trợ giúp dễ thấy khi video thực sự không chạy; E2E mô phỏng lỗi mạng đã xác nhận hành động retry/fallback.

## Bằng chứng và kiểm thử

Ảnh mới của lượt review nằm cùng thư mục:

- `01-course-catalog-mobile.png`
- `01-course-catalog-desktop.png`
- `02-course-detail-idle-mobile.png`
- `02-course-detail-idle-desktop.png`
- `03-course-playing-mobile.png` — lần mới nhất còn spinner, được giữ lại như bằng chứng giới hạn.
- `03-course-playing-desktop.png` — video đang phát, 0:02/0:43.
- `../run-02/03-course-playing-candidate.png` — capture mobile trước đó hiện khung hình video thật; chỉ dùng cùng với giới hạn nêu trên.

| Kiểm tra | Trạng thái | Bằng chứng/giới hạn |
|---|---|---|
| `npm run check:runtime` | PASS | 28 protected runtime files. |
| `npm run test:runtime -- --workers=1 --reporter=line` | PASS 33/33 | Edge/local Vite; có responsive detail và in-app retry/fallback. Không thay thế CI, WebKit, accessibility hoặc máy thật. |
| `npm run build` | PASS, có cảnh báo | Learner bundle 832.69 kB minified / 245.31 kB gzip; Vite cảnh báo chunk >500 kB. Cần tiếp tục chia tải/profiling, không nên bỏ qua cảnh báo trong kế hoạch scale-up. |
| `npm run check:bundle-secrets` | PASS | 8 client text assets được rà soát sau build. |
| `npm run test:sites` | PASS 4/4 | Đã xác nhận static asset, SPA fallback, API/write không rơi vào app shell và artifact Sites packaging. Không có nghĩa là đã deploy. |
| `git diff --check` | PASS | Chỉ có cảnh báo line-ending CRLF từ các file đã sửa khác. |
| Tràn ngang trong viewport đã thử | PASS | `scrollWidth` bằng chiều rộng viewport trên mobile/desktop. |
| YouTube playback mobile/desktop | PARTIAL | Desktop phát ở capture mới; mobile có một capture phát được và một capture mới nhất còn spinner sau 20 giây. |
| Keyboard thực, screen reader, axe/contrast | CHƯA CHẠY | Chỉ kiểm tra semantics/focus affordance và E2E tương tác. |
| Safari/iOS, Android WebView và hosted Preview | CHƯA CHẠY | Chưa chứng minh hành vi trên thiết bị hoặc môi trường phát hành. |

## Quyết định UX

Về thẩm mỹ, màn danh mục và khóa học đạt hướng thiết kế đã chọn; thay đổi progressive disclosure làm màn player yên hơn và ưu tiên ở lại trong app. Đây là cải thiện có ý nghĩa cho trải nghiệm hiện tại, nhưng không xóa các gate production về ổn định playback, accessibility, nội dung/thumbnail có quyền, tên bài được biên tập, hiệu năng bundle, Preview và kiểm thử thiết bị thật.
