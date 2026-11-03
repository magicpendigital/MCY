# Cấu hình và tiếp tục đội agent

Ngày 14/10/2026. Owner đã yêu cầu chọn model theo công việc. Công cụ sub-agent hiện hỗ trợ `model` và `reasoning_effort`; ba lệnh tạo đã được chấp nhận:

| Tên | Model yêu cầu | Reasoning | Phạm vi |
|---|---|---|---|
| ux_state | gpt-6.1-sol | high | Trạng thái lưu, nhãn onboarding/tài khoản, accessibility toggle |
| ux_journey | gpt-6.1-sol | medium | Chọn bản ghi, hydration, empty state |
| content_pilot | gpt-6-luna | medium | Inventory source + hồ sơ nội dung, không duyệt chuyên môn |
| ux_review | gpt-6.1-sol | high | Đợt sau, reviewer độc lập; ghi trạng thái thực tế trong EXECUTION |

Không cần Owner đổi cấu hình thủ công cho các agent đã tạo thành công. Đây là cấu hình được yêu cầu qua công cụ, không phải kết quả đo tốc độ/chi phí hay cam kết hạn mức. Model của root giữ nguyên.

## Vì sao phân công như vậy

Nhánh lưu có async continuation, actor, consent và retry cần suy luận sâu. Journey là React state/UI giới hạn trong hai file nên dùng mức vừa. Inventory/template là trích xuất và biên tập có schema rõ, phù hợp model nhẹ. Review auth/consent dùng model mạnh hơn và độc lập với tác giả; model không thay người thẩm định yoga.

## Nếu phải tiếp tục ở phiên khác hoặc công cụ không cho chọn model

1. Mở đúng workspace `D:\Projects\MCY`; đọc `PLAN.vi.md`, `EXECUTION.vi.md` và handoff tương ứng trước khi chạy.
2. Chọn model/reasoning theo bảng trên ở nơi ứng dụng cho cấu hình. Tên/khả dụng phụ thuộc host; nếu thiếu đúng model, dùng model coding tương đương với cùng phạm vi, ghi rõ model thay thế, không giả định đã đổi.
3. Mỗi lần chỉ chạy một task độc lập hoặc tối đa ba worker; không để hai agent sửa cùng file. Cả đội dùng candidate `.vercel/ux-implementation-20261014`, tuyệt đối không chuyển sang checkout gốc chỉ vì path tiện hơn.
4. Dùng brief bên dưới; yêu cầu đọc handoff rồi làm phần chưa xong, không rerun operation live, không tái tạo candidate đè thư mục hiện có.
5. Khi worker xong, ghi file đã sửa và command/exit status; root chạy suite tổng một lần rồi giao review trên đúng hash cuối.

### Brief tiếp tục ux_state

“Tiếp tục task trong STATE-HANDOFF.vi.md trên candidate riêng. Chỉ sửa src/Prototype.tsx và tests/ux-save-feedback.spec.ts. Giữ actor/session/route/consent guard và idempotent retry. Không coi null là save success; giữ draft khi chưa được phép lưu. Nhãn account/onboarding phản ánh đúng hành vi. Chỉ mock `.invalid`; không live writes. Chạy test tập trung, báo failure thật và handoff.”

### Brief tiếp tục ux_journey

“Tiếp tục JOURNEY-HANDOFF.vi.md. Chỉ sửa candidate src/JourneyScreen.tsx, CSS Journey và tests/ux-journey-selection.spec.ts. Default latest khi hydration sẵn sàng nhưng giữ user choice; account boundary reset; whole-history empty state rõ. Giữ sample và nhiều bản ghi/ngày. Không thay persistence. Báo tests và giới hạn.”

### Brief tiếp tục content_pilot

“Hoàn thiện docs trong content/. Trích inventory38 clip từ source, trường thiếu ghi chưa xác minh. Chuẩn bị template/pilot1intro+3sessions và protocol5–8 người/2 vòng. Không tự viết approval, không tạo hướng dẫn vận động từ suy đoán, không sinh ảnh/publish. Đánh dấu nội dung nháp và trách nhiệm giáo viên/editor.”

### Brief reviewer

“Đọc baseline.json, candidate diff, handoff và evidence cuối. Review độc lập F01/F02/F11/F13: guest/revoked/save/error/retry, async route/account, intentional date choice, empty state, truthful copy và protected-file boundary. Không sửa source trừ khi root giao follow-up. Trả findings có file/line/severity + điều kiện tái hiện; không P1/P2 chỉ khi đã kiểm scope, không tuyên bố release/clinical clearance.”

## Tiết kiệm hạn mức và khôi phục

- Snapshot đầu lượt còn71% cửa sổ7 ngày, không có giới hạn phụ khả dụng. Hạn mức dùng chung, có thể thay đổi từ chat khác.
- Không đoán số token/model hay hứa tiết kiệm phần trăm; không tự sử dụng reset credit.
- Giới hạn mỗi brief một outcome, checkpoint trước khi chuyển pha; không gửi toàn lịch sử dài nếu không cần.
- Không chạy lại toàn bộ suite sau một thay đổi tài liệu. Sau sửa behavior, chạy đúng regression liên quan rồi một lượt tổng ở bản cuối.
- Nếu bị rate limit: ghi việc đang dang dở, hash hiện tại, test cuối và lệnh tiếp tục. Không tự tạo lịch/automation hoặc mở task sidebar mới.
