# 4.4 — bổ sung tác động trước sửa

Root xem trực tiếp early320/390/1440 và chấp thuận hướng bố cục. Root yêu cầu hai sửa copy đúng taxonomy: eyebrow chỉ gọi video miễn phí; cue chỉ thông báo video/danh sách bên dưới. Không đổi catalogue/i18n dùng chung.

Ảnh sớm cho thấy nút Phát ở trong viewport đầu nhưng media dọc ở dưới fold trên 320×568. Vì nút Phát đã chuyển ra ngoài poster, explicit Play cần đưa media vào vùng đọc; nếu không video có thể bắt đầu ngoài màn hình. Đây là hậu quả trình bày cần xử lý R1, không phải đổi provider/playback contract. Addendum này được ghi trước khi sửa handler.

Thêm duy nhất sau explicit Play: cuộn tức thời **MobileScroll hiện tại** đến media của section hiện tại. Không dùng smooth motion, không cuộn document/global route, không effect cuộn trên entry/selection/back. Giữ nguyên setter sequence và iframe guard/src; thêm label cao bằng nút khi player mở để kích thước/điểm bắt đầu media ổn định, không gọi đã xem/thực hành. Không thêm request/state/storage/write/capability mới.

Consumer bị tác động: viewport của CourseDetail, keyboard focus sau click, vị trí player/recovery. Kiểm tập trung mobile320/360/390/landscape, desktop, iPhone/Pixel và reduced-motion: entry/selection không iframe hay auto-scroll mới; nhấn Play tạo đúng một iframe, player trong vùng nhìn/đạt diện tích phù hợp, cùng kích thước và vị trí media trước/sau; selection/back tháo player, không tự phát lại; disclosure vẫn mở bằng Tab/Enter trước Phát; timeout/reload/fallback và reflection hiện có giữ nguyên. Root preview CSP chặn external frame, test route fixture nhận player để kiểm lifecycle. Nếu phải sửa contract/runtime/provider thì STOP/phân loại lại.

Đây là local UI được root GO trong scope đã giao. App QC độc lập/root final còn BLOCKED; không mở 4.5/native/live/deploy.

Lượt focused đầu 11/13 exit1 và lượt kế 12/13 exit1 được giữ riêng. Tab sau khi nút Phát bị thay bằng label có thể mất điểm tiếp tục ổn định trong English; final presentation đặt focus có tên lên chính khung video (tabIndex -1, preventScroll), chỉ khi player mở từ explicit Play, rồi Tab đi qua iframe đến recovery/navigation/reflection. Thêm scroll padding/margin 12 px trong CourseDetail để viền focus nằm trong vùng nhìn. Không thay runtime. Recovery test chờ trạng thái fixture frame-loaded sau reload trước khi kiểm continuation.

Root phát hiện nhánh metadata verified-but-no-VI không được ghi “chưa xác minh”. Summary cuối tách unverified / verified không liệt kê VI / verified có VI; hai fixture source-module kiểm những nhánh chưa có trong catalogue thực tế, không sửa catalogue. Đây là bảo toàn contract metadata cũ, không xác nhận phụ đề live.
