export type HelpArticleId = "body-map" | "pause-video" | "journey-record" | "ai-scope";
export const HELP_ARTICLES: Array<{ id: HelpArticleId; title: string; detail: string; lead: string; paragraphs: string[] }> = [
  {
    id: "body-map",
    title: "Cách ghi nhận từng vùng cơ thể",
    detail: "Chọn vùng, bên và mức bạn muốn ghi",
    lead: "Check-in ghi lại điều bạn tự cảm nhận ở thời điểm hiện tại.",
    paragraphs: [
      "Chạm vào vùng trên hình hoặc chọn tên vùng trong danh sách để mở phần ghi nhận. Với vùng có hai bên, bạn có thể chọn trái, phải hoặc cả hai; mỗi bên được lưu riêng nếu cảm nhận khác nhau.",
      "Chọn mức phù hợp và thêm ghi chú nếu muốn. “Bình thường”, “Chưa rõ” và “Bỏ qua” là các lựa chọn riêng; vùng chưa chọn không được hiểu thành một phản hồi.",
    ],
  },
  {
    id: "pause-video",
    title: "Nếu muốn dừng giữa buổi",
    detail: "Bạn có thể dừng video bất cứ lúc nào",
    lead: "Bạn tự quyết định có tiếp tục hay không.",
    paragraphs: [
      "Dùng nút tạm dừng trong trình phát video, hoặc quay lại để chọn bài khác. MCY không xác nhận bạn đã xem hết video.",
      "Nếu một chuyển động không phù hợp với bạn, hãy dừng lại. Phản hồi sau buổi là tùy chọn và có thể ghi “không thay đổi”, “khó chịu hơn”, “chưa rõ” hoặc bỏ qua.",
    ],
  },
  {
    id: "journey-record",
    title: "Cách xem và xóa một bản ghi",
    detail: "Mở Hành trình để xem hoặc quản lý bản ghi",
    lead: "Hành trình chỉ hiển thị những gì bạn đã ghi nhận và cho phép lưu.",
    paragraphs: [
      "Mở Hành trình, chọn một ngày rồi chọn bản ghi cần xem. Bạn có thể xem các vùng đã ghi, bên cơ thể, mức tự chọn và ghi chú nếu có.",
      "Để xóa, mở bản ghi và chọn xóa; ứng dụng sẽ yêu cầu xác nhận trước khi gửi thao tác. Nếu dịch vụ chưa xác nhận, ứng dụng sẽ báo lỗi để bạn biết bản ghi chưa được xóa.",
    ],
  },
  {
    id: "ai-scope",
    title: "AI dùng check-in trong phạm vi nào?",
    detail: "Tìm hiểu trạng thái AI và quyền riêng tư",
    lead: "Trạng thái AI được máy chủ xác nhận trước khi gửi lựa chọn.",
    paragraphs: [
      "Khi trợ lý chưa sẵn sàng cho phiên của bạn, ứng dụng không gửi yêu cầu chọn buổi tới mô hình. Bạn vẫn có thể tự chọn các bài học video miễn phí.",
      "Khi trợ lý sẵn sàng, xử lý AI cần sự đồng ý riêng và chỉ nhận lựa chọn đã xác nhận trong lượt hiện tại. Hội thoại trước đó, tên, email, ghi chú tự do và feedback lịch sử không được gửi. Mô hình chỉ chọn nội dung đã duyệt, không tự tạo động tác hoặc chẩn đoán.",
    ],
  },
];
