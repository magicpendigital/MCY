# Bổ sung đúng một fixture endpoint cho mapped regressions

Source only, chưa collection/browser. Hai teacher cases cũ không mock `teacher-collaboration`, dù TeacherCollaborationPanel gọi `workspace` khi mount/account đổi. Đây là gap xác định từ source; chưa chứng minh3 CONNECT lịch sử xuất phát từ gap này.

Giữ nguyên candidate/original tests/assertions/base config. Dedicated config tái dùng base fixtures/use/CSP bypass của regression/deny proxy/globalSetup/grep12, chia2 project rõ ràng:10 case từ4 spec gốc và2 case teacher qua overlay import nguyên spec gốc. Direct original teacher spec bị loại khỏi project thứ nhất để không double count. Không quét repo hoặc đưa thêm test title vào tập chọn.

Overlay chỉ hoạt động với2 exact title. Exact `.invalid/functions/v1/teacher-collaboration` nhận POST với body đúng `{action:'workspace',payload:{}}`, không key thừa; response503 `collaboration_unavailable`. Method/action/payload khác bị abort và làm afterEach FAIL. Mỗi case phải tiêu thụ>=1 fixture request; evidence chỉ caseid/count/booleans, không body/header/token. Không catchall/Auth mock hoặc thay app/guard.

Runner copy chỉ route project/config paths sang2 project đã biết. Safe environment/fixed cache/default headless shell/timeout-output cap/cleanup giữ nguyên. Tổng12:11 browser cùng assertions (2 có setup overlay)+1 equivalent Node catalog case. Không gọi toàn bộ execution setup là unchanged.

Sau QC/source GO: collection launch-free phải đúng12 (10+2), không extras. Sau root đọc evidence và cấp browser GO riêng mới chạy một lượt.15 UI clean và mapped12 process FAIL trước đó giữ nguyên. Current canonical rebind vẫn BLOCKED7/71; fixture suite không đọc canonical positive.
