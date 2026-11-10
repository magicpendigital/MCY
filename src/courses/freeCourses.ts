// Ids of the bundled groups are gentle, poses and sequences; groups published from the content store use their own ids.
export type FreeCourseId = string;

export type CourseLesson = {
  id: string;
  youtubeId: string;
  title: string;
  duration: string;
  description: string;
  visibility: "private" | "unlisted" | "public";
  orientation: "portrait" | "landscape";
  channelCaptionsVerified: boolean;
  channelCaptionLanguages: string[];
  /** Author label decided by the server at publish time (teacher name or the Editor's choice label); absent for bundled content. */
  byline?: string | null;
  /** Browse areas set by the author (ids of LessonArea). When absent the finder falls back to the title rules (bundled lessons). */
  areas?: readonly string[];
};

/** Benefits and cautions shown under a course. `reviewed: false` means a draft that a qualified person has not approved yet; the screen says so. */
export type CourseGuidance = { reviewed: boolean; benefits: string[]; cautions: string[] };

export type FreeCourse = {
  id: FreeCourseId;
  title: string;
  description: string;
  guidance?: CourseGuidance;
  lessons: CourseLesson[];
};

function youtubeLesson(id: string, youtubeId: string, title: string, duration: string, orientation: CourseLesson["orientation"] = "portrait"): CourseLesson {
  return {
    id,
    youtubeId,
    title,
    duration,
    description: "Video hướng dẫn yoga từ kênh Một chút yoga. Bạn tự chọn biên độ phù hợp và dừng lại nếu thấy đau tăng hoặc không an toàn.",
    visibility: "unlisted",
    orientation,
    channelCaptionsVerified: false,
    channelCaptionLanguages: [],
  };
}

// The IDs are taken from the user's YouTube Studio channel on 2026-09-29.
// All 38 clips were normalized and saved as unlisted on 2026-09-29. They remain
// discoverable through the app while staying out of YouTube's public search and feed.
export const FREE_COURSES: FreeCourse[] = [
  {
    id: "gentle",
    title: "Một chút chuyển động nhẹ",
    description: "Các bài thực hành ngắn để làm quen với nhịp tập của riêng bạn.",
    guidance: { reviewed: false, benefits: ["Dành vài phút chú ý tới hơi thở và cảm giác của cơ thể.","Làm quen với chuyển động nhẹ ở cổ, vai, lưng và chân sau thời gian ngồi lâu.","Mỗi bài rất ngắn: bạn tự chọn bài và dừng khi muốn.","Nhiều người thấy cơ thể nhẹ nhõm hơn sau khi vận động nhẹ; kết quả khác nhau theo từng người."], cautions: ["Không tập khi đang đau cấp tính, chấn thương mới, sốt, chóng mặt hoặc thấy không khỏe.","Hãy hỏi ý kiến bác sĩ hoặc người có chuyên môn trước khi tập nếu bạn có bệnh tim mạch, huyết áp bất thường, loãng xương, bệnh cột sống hoặc khớp, đang mang thai hoặc mới phẫu thuật.","Dừng ngay nếu đau tăng, tê, choáng hoặc khó thở; không cố vượt qua cơn đau.","Video không thay thế khám bệnh hay hướng dẫn trực tiếp của người có chuyên môn."] },
    lessons: [
      youtubeLesson("01", "yKm7aOAWn-k", "01 · Thư giãn nhẹ", "0:43"),
      youtubeLesson("02", "mjxV5BTR5jA", "02 · Kéo giãn gân kheo nhẹ", "1:04"),
      youtubeLesson("03", "8KKUtPicnX0", "03 · Chuyển động toàn thân", "0:53"),
      youtubeLesson("04", "lJkD5OsUs4E", "04 · Chuyển động lưng dưới", "0:36"),
      youtubeLesson("05", "XPk59lYaNzU", "05 · Chuyển động lưng dưới · bài ngắn", "1:00"),
      youtubeLesson("06", "BSiC_g5FmRI", "06 · Chuyển động cổ và lưng trên", "0:17"),
      youtubeLesson("07", "I5pwMv2jYT4", "07 · Chuyển động cổ và lưng trên · bài ngắn", "0:20"),
      youtubeLesson("08", "OJEzzRobrWQ", "08 · Nhón gót đứng · bài thực hành chân", "0:37"),
      youtubeLesson("09", "Ie55V8b4sD4", "09 · Giãn cơ nhẹ", "0:45"),
      youtubeLesson("10", "GQrO8VFJhss", "10 · Chuyển động nhẹ toàn thân", "0:34"),
      youtubeLesson("11", "uLVYaURNcsM", "11 · Chuyển động vùng cổ", "0:22"),
      youtubeLesson("12", "Gc8zn8NcCVk", "12 · Chuyển động hông và chân", "0:25"),
      youtubeLesson("13", "CVjhYYhpn3o", "13 · Chuyển động nhẹ toàn thân", "0:30"),
      youtubeLesson("14", "_DttB5pLYjk", "14 · Mở vai khi nằm nghiêng", "0:58"),
      youtubeLesson("15", "-o-0h5H0_2I", "15 · Chuyển động cột sống", "0:50"),
      youtubeLesson("16", "NxSbVNT_D-Y", "16 · Lăn lưng với vòng", "0:28"),
      youtubeLesson("17", "67PlLgpEpnU", "17 · Chuyển động nhẹ · bài 17", "0:23"),
      youtubeLesson("18", "DLnOXS8BgJw", "18 · Chuyển động nhẹ · bài 18", "0:27"),
    ],
  },
  {
    id: "poses",
    title: "Làm quen với các tư thế yoga",
    description: "Một thư viện nhỏ các tư thế đơn để bạn học từng bước, không cần vội.",
    guidance: { reviewed: false, benefits: ["Làm quen tên gọi và hình dáng của từng tư thế đơn qua video ngắn.","Quan sát cách đặt tay, chân và thân mà không cần theo cả một buổi tập.","Tập chọn biên độ phù hợp với mình: bạn có thể dừng ở mức thấp hơn video minh hoạ."], cautions: ["Các tư thế ngả sau, chống tay, quỳ gối hoặc đầu thấp hơn tim có thể không phù hợp khi đau cổ, cổ tay, lưng, gối, hoặc khi huyết áp, mắt hay tai trong có vấn đề; hãy hỏi người có chuyên môn.","Không tập khi đang đau cấp tính, chấn thương mới, sốt, chóng mặt hoặc thấy không khỏe.","Hãy hỏi ý kiến bác sĩ hoặc người có chuyên môn trước khi tập nếu bạn có bệnh tim mạch, huyết áp bất thường, loãng xương, bệnh cột sống hoặc khớp, đang mang thai hoặc mới phẫu thuật.","Dừng ngay nếu đau tăng, tê, choáng hoặc khó thở; không cố vượt qua cơn đau.","Video không thay thế khám bệnh hay hướng dẫn trực tiếp của người có chuyên môn."] },
    lessons: [
      youtubeLesson("19", "McOZ1FW5jBM", "Quỳ gối ngả sau", "0:24"),
      youtubeLesson("20", "54IPJkU7f_o", "Rắn hổ mang · phiên bản nhẹ", "0:35"),
      youtubeLesson("21", "KtMlgK2cjsU", "Rắn hổ mang", "0:49"),
      youtubeLesson("22", "0fs1LCnK3-U", "Quạ thấp", "0:39"),
      youtubeLesson("23", "p3sKiK8szF8", "Hoang dã cao", "0:53"),
      youtubeLesson("24", "DOmYgUoQyZI", "Đứng lên, giữ lưng thẳng", "0:38"),
      youtubeLesson("25", "CwhLdstN0dc", "Chó úp mặt · biến thể V ngược", "0:53"),
      youtubeLesson("26", "oFWjSKxXvKY", "Trường tấn cao", "0:46"),
      youtubeLesson("27", "rWl5ySBsrG0", "Bò mèo", "0:35"),
      youtubeLesson("28", "6Y-eWBnD8r8", "Bánh xe thấp", "0:54"),
      youtubeLesson("29", "wnenFwBE5oY", "Đầu bò", "0:48"),
      youtubeLesson("30", "wYiSFpP7vjs", "Chó ba chân", "0:33"),
      youtubeLesson("31", "gkiWrw9hREU", "Chiến binh II", "0:47"),
    ],
  },
  {
    id: "sequences",
    title: "Chuỗi tư thế cơ bản",
    description: "Một chuỗi ngắn các tư thế cơ bản để bạn theo dõi từng bước và làm quen với nhịp chuyển động.",
    guidance: { reviewed: false, benefits: ["Thấy cách nối vài tư thế cơ bản thành một chuỗi ngắn.","Luyện nhịp chuyển tiếp chậm và đều giữa các tư thế.","Có thể xem từng bước rồi tập theo nhịp của bạn, không cần theo kịp video."], cautions: ["Chuỗi cần giữ thăng bằng và đổi tư thế liên tục; không nên tập khi mệt, thiếu ngủ, choáng hoặc chưa quen các tư thế đơn.","Không tập khi đang đau cấp tính, chấn thương mới, sốt, chóng mặt hoặc thấy không khỏe.","Hãy hỏi ý kiến bác sĩ hoặc người có chuyên môn trước khi tập nếu bạn có bệnh tim mạch, huyết áp bất thường, loãng xương, bệnh cột sống hoặc khớp, đang mang thai hoặc mới phẫu thuật.","Dừng ngay nếu đau tăng, tê, choáng hoặc khó thở; không cố vượt qua cơn đau.","Video không thay thế khám bệnh hay hướng dẫn trực tiếp của người có chuyên môn."] },
    lessons: [
      youtubeLesson("32", "6DwXHdN_ccg", "Chuỗi tư thế cơ bản · bài 32", "0:22"),
      youtubeLesson("33", "f7UfRc4TKdM", "Chuỗi tư thế cơ bản · bài 33", "0:21"),
      youtubeLesson("34", "ZV-eHhsNlgo", "Chuỗi tư thế cơ bản · bài 34", "0:21"),
      youtubeLesson("35", "npBdMvsuIto", "Chuỗi tư thế cơ bản · bài 35", "0:19"),
      youtubeLesson("36", "jgQLZsoIDKc", "Chuỗi tư thế cơ bản · bài 36", "0:21"),
      youtubeLesson("37", "rSOEcU1xGYA", "Chuỗi tư thế cơ bản · bài 37", "0:21"),
      youtubeLesson("38", "AfMciZa5npw", "Chuỗi tư thế cơ bản · bài 38", "0:18"),
    ],
  },
];
