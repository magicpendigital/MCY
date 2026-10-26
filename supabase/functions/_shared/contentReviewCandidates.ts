import type { LessonSection } from "./practiceContract.ts";

export const preparationDraft = {
  id: "preparation-draft",
  scope: "learning_intro" as const,
  version: "e73a93ffb990887f22a2bd25a72b87ba29e8761eec86bbb9729c2d4328ee7f2b",
  status: "draft" as const,
  title: "Dành một khoảng cho buổi học",
  purpose: "Mẫu bài giảng bằng hình, text và audio để review cách học. Chưa là một buổi tập yoga đã duyệt.",
  sections: [
    { id: "welcome", title: "Bắt đầu vừa đủ", image: "/assets/practice/preparation-draft/room.png", audio: "/assets/practice/preparation-draft/welcome.wav", text: "Trước khi chọn một bài học, bạn có thể dành một chút thời gian xem mình đang có bao nhiêu phút. Không cần đặt mục tiêu hoàn thành cả khóa học hôm nay.\n\nBài mẫu này giúp bạn xem cách MCY trình bày nội dung. Hình minh họa không mô tả tư thế và audio không hướng dẫn động tác." },
    { id: "space", title: "Chọn không gian của bạn", image: "/assets/practice/preparation-draft/room.png", audio: "/assets/practice/preparation-draft/space.wav", text: "Chọn một nơi quen thuộc để xem nội dung, có thể đọc màn hình và nghe rõ nếu bạn dùng audio. Bạn có thể học bằng text nếu chưa tiện nghe.\n\nCác vật dụng trong hình chỉ minh họa không gian; chưa phải yêu cầu chuẩn bị cho một buổi tập cụ thể." },
    { id: "choice", title: "Bạn giữ quyền lựa chọn", image: "/assets/practice/preparation-draft/room.png", audio: "/assets/practice/preparation-draft/choice.wav", text: "Một kế hoạch học cần cho biết nội dung, thời lượng thật và nguồn duyệt. Bạn có thể xem lại lựa chọn, dừng hoặc bỏ qua phản hồi.\n\nKhông thay đổi, khó chịu hơn và chưa chắc đều là phản hồi hợp lệ. MCY không xem việc thiếu phản hồi là tiến bộ. Bài nháp này chưa được đưa vào gợi ý tập bằng AI." },
  ].map(section => ({ ...section, audioLocale: "en-US" as const })) satisfies LessonSection[],
};

// Owner review candidates are deliberately separate from the practice catalog.
export const contentReviewCandidates = [preparationDraft] as const;
