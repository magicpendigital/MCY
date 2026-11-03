# Hướng dẫn học viên/người tham gia thử

**BẢN NHÁP — delivery và scope còn PENDING.** Trước khi mở, cần phiếu [delivery](DELIVERY-AND-REPORTING.vi.md) đã khớp bản thử và task điều phối giao. Tài liệu mô tả UX có trong accepted candidate 4.7; chưa xác nhận web hiện tại hoặc APK đã mang các thay đổi đó. Hai route mới **Tìm hiểu/Thực hành** của đề xuất 6.1 chưa được xây.

## Lượt UX trên dữ liệu giả, chỉ khi được chọn

Không cần cung cấp tên/email/tình trạng sức khỏe để đánh giá nhãn và điều hướng. Điều phối phải xác nhận mode dữ liệu giả trước; nếu không rõ, dừng trước mọi nút lưu.

| Bước | Thao tác | Kết quả mong đợi / điểm cần ghi |
|---|---|---|
| 1 | Mở đúng bản theo delivery; xem trạng thái khách/tài khoản và nhãn mode | Biết mình đang xem bản nào. Khách hoặc dữ liệu mẫu không chứng minh tài khoản thật |
| 2 | Từ thanh điều hướng, mở **Khám phá** | Xem danh mục tự chọn. Ghi điều bạn hiểu về loại nội dung; không mở playback hoặc làm động tác nếu task chỉ quan sát UX |
| 3 | Mở **Hành trình**; đọc trạng thái trống hoặc mẫu mà bản thử đã chỉ định | Phân biệt dữ liệu mẫu với ghi nhận cá nhân. Không suy mẫu là dữ liệu đã lưu; không suy không có ghi nhận là cải thiện |
| 4 | Mở **Cá nhân** → **Quyền riêng tư và đồng ý** | Tìm được các mục đích và cách thay đổi. Task đọc không yêu cầu bật/tắt hoặc tạo consent event |
| 5 | Trong **Cá nhân**, mở **AI và điều được nhớ**, rồi **Hướng dẫn và liên hệ** | Nhận biết trạng thái/phần chưa mở. Hướng dẫn/liên hệ hiện không là form gửi yêu cầu; không thử gửi dữ liệu vào nơi khác |
| 6 | Quay lại màn trước hoặc dừng theo lựa chọn | Nêu điểm khó hiểu, mong đợi tiếp theo và mức trợ giúp. Hoàn thành task không là kết quả sức khỏe |

Không dùng **Tạo tài khoản hoặc đăng nhập**, **Lưu thay đổi**, lưu check-in hay toggle consent trong lượt chỉ UX. Nếu task yêu cầu ghi giả, cần fixture/mode và payload được điều phối chỉ định riêng; chưa có chỉ dẫn ghi nào được cấp trong tài liệu này.

## Lượt đọc nội dung đã được phép, chỉ khi Owner chốt

Moderator đưa đúng artifact được phép theo ID/revision/locale/SHA và media hashes; không dùng nháp bất kỳ trong Owner reader. Thực hiện [T1–T5 của ma trận 6.1](../ux-step6-1-2026-10-20/ROUTE-TASK-MATRIX.vi.md): nói bạn hiểu mục đích gì, muốn biết gì trước khi đọc tiếp, sẽ bỏ qua/thoát ở đâu và nghĩ thông tin nào được lưu. Có thể bỏ từng câu hỏi hoặc dừng không cần lý do.

Đọc không tạo buổi tập, thời lượng thực hành hoặc bản ghi Hành trình. Nhánh P1/P2 chỉ xét khi exact buổi thực hành và purpose được duyệt; trong packet giấy chỉ nhận diện thông tin/điều khiển, không tập hoặc phát buổi thật. 14 unit đọc nháp không thay thế buổi hoàn chỉnh đã review.

## Account thật và Android

Scope account thật, quyền lưu, caps và bước Auth/backend **PENDING**, nên chưa làm các bước đó. Native còn HALTED vì khôi phục phiên chưa đạt; nếu bị đưa về Đăng nhập thì dừng tại đó, không đăng nhập lại để tiếp tục bài test. Không force-stop, cài lại hoặc xóa dữ liệu. Chờ operation mới và hướng dẫn gắn exact APK.

Báo lỗi theo [mẫu chung](DELIVERY-AND-REPORTING.vi.md#ghi-lỗi-tối-thiểu). Dừng ngay khi sai bản/actor, thấy dữ liệu người khác, lỗi quyền/nguồn hoặc thao tác lưu chưa rõ kết quả. Không nhập thông tin sức khỏe thật để tái hiện.
