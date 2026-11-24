// Check-in and region editor texts, plus the body label tables (region, level, side). Data only: msg(), the label
// functions, overrides and the key type stay in src/i18n.ts.
import type { AppLocale } from "../i18n";

export const viCheckin = {
  "checkin.step1.title": "Hôm nay, cơ thể bạn cảm thấy thế nào?",
  "checkin.step1.lead": "Chạm vào vùng bạn thấy căng, mỏi hoặc khó chịu. Bạn cũng có thể chọn tên vùng bên dưới.",
  "checkin.step1.label": "Cảm nhận cơ thể",
  "checkin.scrollHint": "Chọn điểm trên hình hoặc nhóm vùng tay chân bên dưới",
  "checkin.orientation": "Toàn thân nhìn từ phía sau · trái/phải theo bạn",
  "checkin.chooseStyle": "Đổi hình minh họa",
  "checkin.regions": "Hoặc chọn một vùng",
  "checkin.group.trunk": "Thân mình",
  "checkin.group.arms": "Tay",
  "checkin.group.legs": "Chân",
  "checkin.tapToRecord": "Chạm để ghi",
  "checkin.notRecorded": "Chưa ghi",
  "checkin.noDiscomfort": "Bình thường",
  "checkin.unsure": "Chưa xác định",
  "checkin.skipBody": "Bỏ qua phần cảm nhận",
  "checkin.guest.find": "Tìm bài học ngắn",
  "checkin.step1.skip": "Bỏ qua ghi nhận cơ thể",
  "checkin.step2.account": "Lưu bằng tài khoản",
  "checkin.standalone": "Chỉ ghi lại cảm nhận hôm nay, không chọn bài",
  "checkin.disclaimer": "Bạn chỉ cần chia sẻ điều mình thấy. Đây không phải đánh giá sức khỏe.",
  "regionEditor.prompt": "Ngay lúc này, vùng này khiến bạn cảm thấy thế nào?",
  "regionEditor.side": "Bên nào?",
  "regionEditor.note": "Ghi chú riêng vùng này",
  "regionEditor.optional": "không bắt buộc",
  "regionEditor.save": "Lưu vùng này",
  "regionEditor.delete": "Xóa vùng này",
  "checkin.selectedNone": "Đã chọn: Bình thường. Bạn có thể đổi lại.",
  "checkin.selectedUnsure": "Đã chọn: Chưa xác định được vùng. Bạn có thể đổi lại.",
  "checkin.selectedSkipped": "Đã chọn: Bỏ qua phần cảm nhận. Bạn có thể đổi lại.",
  "checkin.tired": "Mệt",
  "checkin.uncomfortable": "Khó chịu",
  "checkin.selectedTired": "Đã chọn: Mệt. Bạn có thể đổi lại.",
  "checkin.selectedUncomfortable": "Đã chọn: Khó chịu. Bạn có thể đổi lại.",
  "checkin.guestSaveNote": "Chỉ lưu trên máy này, không gửi đi đâu. Bạn có thể xóa trong Hành trình.",
  "checkin.guestSaveSessionOnly": "Máy này đang chặn bộ nhớ, nên ghi nhận chỉ được giữ đến khi bạn đóng hoặc tải lại app. Không gửi đi đâu.",
} as const;

export const enCheckin: Record<keyof typeof viCheckin, string> = {
  "checkin.step1.title": "How does your body feel today?",
  "checkin.step1.lead": "Tap an area that feels tense or uncomfortable, or choose it from the list below.",
  "checkin.step1.label": "Body check-in",
  "checkin.scrollHint": "Choose a point or switch between body, arms and legs",
  "checkin.orientation": "Full body, viewed from behind · left/right are yours",
  "checkin.chooseStyle": "Change illustration",
  "checkin.regions": "Or choose an area",
  "checkin.group.trunk": "Torso",
  "checkin.group.arms": "Arms",
  "checkin.group.legs": "Legs",
  "checkin.tapToRecord": "Tap to add",
  "checkin.notRecorded": "Not recorded",
  "checkin.noDiscomfort": "Normal",
  "checkin.unsure": "Not sure",
  "checkin.skipBody": "Skip body check-in",
  "checkin.guest.find": "Find a short lesson",
  "checkin.step1.skip": "Skip body check-in",
  "checkin.step2.account": "Save with an account",
  "checkin.standalone": "Save today's check-in without choosing a session",
  "checkin.disclaimer": "Share only what you notice. This is not a health assessment.",
  "regionEditor.prompt": "How does this area feel right now?",
  "regionEditor.side": "Which side?",
  "regionEditor.note": "A note for this area",
  "regionEditor.optional": "optional",
  "regionEditor.save": "Save this area",
  "regionEditor.delete": "Remove this area",
  "checkin.selectedNone": "Normal selected. You can change this later.",
  "checkin.selectedUnsure": "Not sure selected. You can change this later.",
  "checkin.selectedSkipped": "Body check-in skipped. You can change this later.",
  "checkin.tired": "Tired",
  "checkin.uncomfortable": "Uncomfortable",
  "checkin.selectedTired": "Tired selected. You can change this later.",
  "checkin.selectedUncomfortable": "Uncomfortable selected. You can change this later.",
  "checkin.guestSaveNote": "Saved only on this device and never sent anywhere. You can delete it in Journey.",
  "checkin.guestSaveSessionOnly": "This device is blocking storage, so the entry is kept only until you close or reload the app. Nothing is sent anywhere.",
};

export const regionLabels: Record<AppLocale, Record<string, string>> = {
  "vi-VN": {
    neck: "Cổ", shoulder: "Vai", upper_back: "Lưng trên", lower_back: "Lưng dưới", glute: "Mông",
    upper_arm: "Bắp tay", elbow: "Khuỷu tay", forearm_wrist: "Cẳng tay · cổ tay",
    hand: "Bàn tay", knee: "Đầu gối", foot: "Bàn chân",
  },
  "en-US": {
    neck: "Neck", shoulder: "Shoulders", upper_back: "Upper back", lower_back: "Lower back", glute: "Glutes",
    upper_arm: "Upper arm", elbow: "Elbow", forearm_wrist: "Forearm · wrist",
    hand: "Hand", knee: "Knee", foot: "Foot",
  },
};

export const levelLabels: Record<AppLocale, Record<string, string>> = {
  "vi-VN": { "Không khó chịu": "Bình thường", "Nhẹ": "Hơi mỏi", "Vừa": "Mỏi khá nhiều", "Nhiều": "Đau nhức", "Chưa rõ": "Chưa rõ" },
  "en-US": { "Không khó chịu": "Normal", "Nhẹ": "Slightly tired", "Vừa": "Quite tired", "Nhiều": "Aching", "Chưa rõ": "Not sure" },
};

export const sideLabels: Record<AppLocale, Record<string, string>> = {
  "vi-VN": { unspecified: "Không rõ bên", left: "Trái", right: "Phải", both: "Hai bên" },
  "en-US": { unspecified: "Not sure", left: "Left", right: "Right", both: "Both sides" },
};
