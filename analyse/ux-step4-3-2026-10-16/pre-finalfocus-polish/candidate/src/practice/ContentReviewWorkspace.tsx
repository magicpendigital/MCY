import { preparationDraft } from "./draftLesson";
import { LessonReader } from "./LessonReader";
export default function ContentReviewWorkspace() {
  return <div className="mcy-content-review"><header><strong>Một chút yoga · nội dung mẫu</strong><a href="/">Mở ứng dụng học viên</a></header><main>
    <span className="mcy-tag">BẢN NHÁP · AI HỖ TRỢ SOẠN</span><h1>{preparationDraft.title}</h1><p className="mcy-lead">{preparationDraft.purpose}</p>
    <div className="mcy-review-notice" role="note"><strong>Review trước khi dùng trong gợi ý thật.</strong><p>Text và hình được AI hỗ trợ tạo. Audio mẫu tiếng Anh dùng giọng đọc tổng hợp trên máy; chưa có audio tiếng Việt. Nội dung thực hành, thời lượng, khả năng tiếp cận, quyền media và phạm vi phù hợp còn cần người phụ trách duyệt. Trang này không xác nhận hoàn thành buổi tập.</p></div>
    <LessonReader sections={preparationDraft.sections} active draft />
  </main></div>;
}
