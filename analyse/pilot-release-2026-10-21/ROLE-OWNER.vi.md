# Hướng dẫn Owner/điều phối phát hành thử

**BẢN NHÁP — common web/APK đã build chuẩn bị, chưa phát hành hoặc mở pilot.** [Root GO ban đầu](ROOT-COMMON-PREP-GO.json) mở chuẩn bị nguồn/docs; [GO build web](ROOT-COMMON-WEB-GO-v1.json) và [GO native](ROOT-COMMON-NATIVE-GO-v1.json) có phạm vi riêng. Exact artifacts, actual receipts và root guest UI/HTTP guard kiểm local có ở [delivery](DELIVERY-AND-REPORTING.vi.md#exact-artifacts-đã-build-chuẩn-bị). Chưa deploy/cài/live writes; guest-only UI không chứng minh device/backend acceptance.

## Chốt một lượt có thể chạy

1. Scope đã chốt: **FULL tài khoản thật, toàn bộ bài đã chuẩn bị, thực hành và chức năng**; Owner đã chỉ định Teacher và Reviewer. Trạng thái **OWNER_REPORTED_APPROVALS_EXIST_ALL_PREPARED_FULL_REAL_SCOPE**. Không hỏi chọn lại scope hoặc dùng giả thay real acceptance.
2. Nhóm tự [map pool/exact ID/revision/locale/SHA/assets](OWNER-DECISIONS-TO-COMPLETE.vi.md); Owner chỉ cần dẫn reviewer-authored evidence/quyền cụ thể, ngày/phần đã xem/giới hạn còn thiếu để đối chiếu các quyết định đã báo có. Không yêu cầu Owner tính hash. Người được Owner chỉ định chưa đồng nghĩa role server đã active; không đưa email riêng vào packet công khai.
3. Source tích hợp freeze v2 đã build common web/APK. Kiểm artifact QC → root trực tiếp kiểm → operation đúng target; chưa có bản hosted mới. Điền phần delivery còn thiếu theo evidence cuối, không dùng APK prepared như acceptance cài/restore.
4. Chỉ định moderator/custodian/kênh nhận lỗi/access/retention/rút notes. Reader Owner 15 phút không là môi trường participant 30–45 phút; chọn delivery đúng mục đích có quyền.
5. Với scope account thật đã chọn, cần actor/role/assignment được máy chủ xác minh, caps và stop/readback riêng. Chỉ định con người chưa là operation mời/grant/gia hạn/email; không dùng account chung.

## Đọc thử bằng Owner local, khi operation local cho phép

Mở đúng origin/bootstrap riêng do operation cấp; không đưa bootstrap/cookie vào chat hoặc chuyển cho participant. Kiểm banner **OWNER LOCAL · XEM NHÁP THẬT, CHƯA DUYỆT**. Chọn bản trong **Trong phạm vi phiên**, đối chiếu ID/revision/locale/SHA, đọc mục lục/nguồn và trạng thái từng media. **Ghi chú tạm theo phiên bản** chỉ giữ trong bộ nhớ, mất khi phiên kết thúc; nếu cần review record bền vững phải dùng quy trình được duyệt khác.

Kết quả mong đợi là đọc đúng snapshot và nhận biết blocked media, không thay hình, sửa canonical hoặc approve. Bootstrap tối đa 5 phút, lease mặc định 15 phút; hết hạn/thu hồi/nguồn thay đổi là điểm dừng, không tự gia hạn hoặc bỏ guard. **Tải lại phạm vi** đối chiếu lại phạm vi hiện có, không chứng minh cấp lại quyền.

## Panel quản trị hiện hữu khác reader

Nguồn root có workspace Owner với tab **Cấu hình AI** và **Duyệt nội dung**; chưa khẳng định hosted build mới có tab/reader tích hợp. Panel review hiện hữu xét intro/audio mẫu riêng, không tự chứa 14 canonical unit. Chỉ operation thật cho phép mới được ghi quyết định, chỉ định teacher hoặc thu hồi; người được chọn phải là teacher server xác minh đang active, assignment đúng version/thời hạn. Cấp role không tạo chuyên môn/quyền xuất bản hoặc quyền dữ liệu học viên.

Không bấm **Lưu cấu hình staging**, bật AI hay **Chỉ định teacher** để “kiểm tra nhanh” trong gói chuẩn bị. Positive live config-save còn gate riêng. Kết quả kỹ thuật không thay human expertise/rights/accessibility hoặc learner visibility.

## Hai cổng phát hành còn mở

| Cổng | Trạng thái / việc cần có trước delivery |
|---|---|
| Web | **BLOCKED_NO_UPLOAD_OR_ALIAS**. [Readback mới đúng project/team](ROOT-HOSTING-PROJECT-READBACK.json) quan sát `ssoProtectionMode=null`, password `false`, trusted IPs `false`; protection của Preview mới chưa được chứng minh. GET200 ngày 14/10 là lịch sử. Cần exact target/new artifact/protection trước upload, operation mới và hosted bytes/flow readback; không tự bật protection/bypass hoặc promote Production |
| Android | **HALTED/currentActorVerified=false** do restore failure. APK mới có thể là build preparation; installation/callback/session/device acceptance cần operation mới. Không force-stop/shell-launch/clear-data/relogin để tự đóng blocker |
| Backend project | [CLI readback v2](ROOT-BACKEND-PROJECT-CLI-READBACK-v2.json) xác nhận đúng staging/org `ACTIVE_HEALTHY`; chưa xác minh ledger/roles/ACL/Auth/data. Connector INVALID_ARGUMENT cũ là probe lịch sử, không là trạng thái hiện tại của project |
| Nội dung/participant | Owner báo approvals có, ALL prepared + practice + real accounts và người phụ trách đã chỉ định. Nhóm map exact snapshots; reviewer-authored evidence/quyền/buổi hoàn chỉnh còn cần đối chiếu, real Teacher/Reviewer/participant backend chưa được xác lập cho testgroup |

## Nhận kết quả và dừng

Đối chiếu freeze/claim/links của bộ guides, QC độc lập và root kiểm trực tiếp. Dùng [mẫu kết quả 6.1](../ux-step6-1-2026-10-20/PILOT-RESULTS.template.md) cho lượt đủ điều kiện; giữ observations khác diễn giải, participant khác attendance. Sai version/actor, vượt cap, dữ liệu người khác hoặc uncertain save thì ngừng phần liên quan, không retry/delete/allocate budget để đạt.

Báo cáo cuối nêu exact bản, task đã chạy, evidence type, phần chưa chạy và blocker. Dừng chờ review Owner ở ranh giới bước đã chốt; source rollback là bỏ dùng candidate/tài liệu mới, không hoàn nguyên dữ liệu hoặc cài APK cũ khi chưa operation riêng.
