# MCY — bài giảng hình/text/audio để review

Ngày 10/10/2026. Owner đề xuất tận dụng serial miễn phí, hoặc thử nội dung AI tạo trước khi bổ sung bài giảng giảng viên. Đây là mẫu tương tác đã tạo **local**, chưa là khóa học/buổi tập được duyệt hoặc nội dung đã deploy.

## Serial hiện có đủ chưa?

Source `src/courses/freeCourses.ts` có **38 clip trong ba nhóm**, với metadata ghi từ 29/09:

| Nhóm | Clip | Tổng thời lượng clip | Khoảng thời lượng từng clip |
|---|---:|---:|---:|
| Một chút chuyển động nhẹ | 18 | 11:12 | 0:17–1:04 |
| Làm quen với các tư thế yoga | 13 | 9:14 | 0:24–0:54 |
| Chuỗi tư thế cơ bản | 7 | 2:23 | 0:18–0:22 |

**Có nguyên liệu để biên tập chương trình**, và app đã trình bày chúng thành nhóm bài để tự chọn. Tuy nhiên, số clip và tổng thời lượng không chứng minh một khóa học hoàn chỉnh: chưa có mục tiêu/đầu vào rõ, tiến trình được duyệt, hướng dẫn chuyển đoạn/nhịp tập, phạm vi phù hợp và kiểm phụ đề/audio toàn khóa. Thứ tự clip không tự là thứ tự sư phạm hoặc độ khó. Những con số trên là snapshot local, chưa kiểm lại playback/thời lượng live trong lượt này; không suy ra mọi clip phù hợp cho người mới hoặc cho vùng cơ thể cụ thể.

Phương án nội dung: giữ thư viện hiện có; người biên tập chọn các clip sau khi xem toàn bộ, bổ sung lời dẫn/chuẩn bị/chuyển đoạn/phản hồi và review thành từng buổi có id/version/duration thật. Các bài giảng AI hoặc giảng viên tương lai dùng cùng reader/contract; nguồn AI không bỏ qua review chuyên môn và quyền media.

## Mẫu đã tạo

`/?workspace=content-review&mode=web` mở **“Dành một khoảng cho buổi học”**, ba phần: Bắt đầu vừa đủ, Chọn không gian của bạn, Bạn giữ quyền lựa chọn. Đây là bài giới thiệu cách học/quyền lựa chọn, không hướng dẫn tư thế hoặc động tác. Reader cho đọc text, xem hình, chọn phần, bật audio chủ động; không autoplay, pause khi đổi phần/ẩn màn, không tạo completion giả.

- Text tiếng Việt do AI hỗ trợ soạn trong `src/practice/draftLesson.ts`.
- Một hình minh họa không gian, PNG 1536×1024, tạo bằng `image_gen.imagegen`, **text-to-image**, tại `public/assets/practice/preparation-draft/room.png`. Không có người, anatomy hoặc tư thế; đã nhìn kiểm hình và ảnh UI mobile/web.
- Ba WAV là **giọng tổng hợp tiếng Anh** Microsoft Zira Desktop qua Windows System.Speech local, không gọi TTS ngoài. Chưa có audio tiếng Việt; UI ghi rõ. Thời lượng audio đọc đo từ RIFF: 18,737s +17,776s +24,921s; không gọi tổng 61,434s này là thời lượng một buổi thực hành yoga.
- Không có expert/rights approval, không nằm trong `reviewedPracticeCatalog`, không mở AI inference. [Receipt media/text và hash](MCY_AI_LESSON_DRAFT_EVIDENCE_2026-10-10.json).

Để thành một bài tập thật: người phụ trách duyệt mục tiêu/phạm vi và nội dung thực hành, xác nhận media/quyền, chuẩn bị audio tiếng Việt và transcript, đo thời lượng thực hành, review khả năng tiếp cận rồi pin đúng phiên bản. [Quy trình content review](../docs/content-review/README.md).

## Prompt hình đã dùng

> Create one landscape 3:2 editorial illustration for the MCY Vietnamese yoga learning app, a draft lesson about preparing a quiet space before learning. Warm ivory canvas, muted forest green yoga mat rolled halfway on a tidy warm wooden floor, simple sturdy chair, soft daylight from a window with linen curtain, a small folded neutral towel. Calm believable home setting, spacious composition, gentle hand-painted watercolor/gouache texture, premium natural editorial aesthetic. No people, no yoga poses, no anatomy, no text, no letters, no logo, no interface, no diagram, no medical symbols. This illustration supports a content draft and must not imply a physical exercise instruction. Single cohesive image, no collage. The brand uses warm ivory #FFFCF7, forest #425D48, restrained terracotta #9A563E. Keep objects readable at phone size and leave the upper third quiet.

## Text đọc tiếng Anh dùng để tạo WAV

**welcome.wav:** Before choosing a lesson, take a moment to notice how much time you have today. You do not need to finish an entire course. This draft shows how the app can present a lesson using an illustration, written text, and audio. It does not teach a yoga pose.

**space.wav:** Choose a familiar place where you can see the lesson clearly. You can read the text if listening is not convenient. The chair, mat, and towel in the illustration are examples of a quiet learning space. They are not requirements for a specific practice.

**choice.wav:** A practice plan should show the content, its actual duration, and its reviewed source. You can change your selection, stop, or skip reflection. Unchanged, worse, and uncertain are all valid responses. Missing feedback does not mean improvement. This draft is not included in AI practice recommendations.
