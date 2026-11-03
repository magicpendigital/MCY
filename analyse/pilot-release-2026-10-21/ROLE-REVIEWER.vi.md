# Hướng dẫn Reviewer/chuyên gia

**BẢN NHÁP — Owner đã chỉ định Reviewer và chọn scope FULL tài khoản thật/toàn bộ bài chuẩn bị/thực hành/chức năng.** Trạng thái **OWNER_REPORTED_APPROVALS_EXIST_ALL_PREPARED_FULL_REAL_SCOPE**. Nhóm tự [map exact versions/hashes](OWNER-DECISIONS-TO-COMPLETE.vi.md); còn cần nối reviewer-authored evidence/quyền cụ thể và server access với snapshot. Role tài khoản không chứng nhận chuyên môn/quyền media; hướng dẫn này không viết thay quyết định.

Common web/APK đã build chuẩn bị, được bind ở [delivery](DELIVERY-AND-REPORTING.vi.md#exact-artifacts-đã-build-chuẩn-bị). Chưa deploy/cài hoặc xác minh real Reviewer/assignment trên artifact; project staging `ACTIVE_HEALTHY` không chứng minh quyền duyệt hay backend review canonical sẵn sàng.

## Rehearsal reviewer giả hiện hữu — không là nghiệm thu FULL

Chỉ dùng khi có operation rehearsal riêng cho mode `fictional_rehearsal`, actor `fictional-reviewer`; không giao nhánh này thay scope real accounts đã chọn. Kiểm banner **MÔ PHỎNG · DỮ LIỆU TRUNG TÍNH GIẢ**; không dùng Owner local để giả làm reviewer thật.

1. Chọn bản giả trong **Trong phạm vi phiên**; kiểm ID/revision/locale/SHA và trạng thái **Chưa duyệt** hoặc trạng thái mô phỏng hiện có.
2. Mở mục lục, phần **Đối tượng, chuẩn bị và nguồn đối chiếu**, media/status. Ghi vị trí lỗi bằng mục/nhãn; không chép dữ liệu riêng hoặc tự thêm hướng dẫn vận động.
3. Nếu task yêu cầu notes giả, dùng **Giữ ghi chú tạm trong phiên local**. Kết quả chỉ trong bộ nhớ theo phiên/version.
4. Theo quyết định test được giao, bấm một lần **Mô phỏng yêu cầu chỉnh sửa** hoặc **Mô phỏng ghi kết quả thử**. Mong đợi nhãn **Mô phỏng: cần chỉnh sửa** hoặc **Mô phỏng: đã ghi kết quả thử**. Không có approved/publish/canonical approval thật từ các nút này.
5. Kết thúc theo task. Gặp hết hạn, thu hồi, nguồn đổi hoặc chưa rõ kết quả thì dừng; không refresh/gửi lại để cố lấy trạng thái mong muốn.

## Đối chiếu nháp thật trong Owner local

Chỉ Owner nội bộ được operation cho phép dùng mode này, không cấp cho reviewer ngoài bằng cách chia sẻ capability. Nhãn **OWNER LOCAL · XEM NHÁP THẬT, CHƯA DUYỆT** cho phép đọc exact snapshot và ghi chú tạm; không xác minh tài khoản/chuyên môn reviewer, không sửa canonical hay ghi approval. Hết lease phải dừng, không tự gia hạn cho lượt participant.

## Review thật — tách hai hợp đồng

**14 canonical unit:** cần exact ID/revision/locale/path/SHA, từng asset hash, mục đích đọc/thực hành, phần đã xem, qualification/independence và căn cứ rights/accessibility theo hồ sơ sẵn có. Không tự sửa `approvalRecords` hoặc chuyển pending thành approved trong packet. 55 ảnh hiện diện và 25 slot chặn chưa chứng minh chuyên môn/quyền sử dụng.

**Panel Duyệt nội dung hiện hữu:** `ContentReviewPanel` nguồn root hiện xét bài giới thiệu/audio mẫu riêng, không là reader 14 unit. Chỉ sau operation thật xác nhận role/assignment/backend/write cap mới được mở tab **Duyệt nội dung được giao** (Teacher) hoặc **Duyệt nội dung** (Owner):

| Bước khi được phép | Kết quả phải kiểm |
|---|---|
| Chọn **Nội dung**, kiểm version và revision được giao còn hạn | Không tự chọn bản mới nhất hoặc nội dung khác |
| Đọc toàn bộ bản/asset theo phạm vi được giao | Thiếu media/evidence thì giữ phần ấy pending; không tick để đủ form |
| Điền **Chuyên môn và phạm vi của người duyệt**, **Căn cứ và nhận xét chuyên môn**, **Căn cứ quyền sử dụng nội dung và media** bằng facts thật | Các checkbox là khai báo cần evidence, không là bằng chuyên môn |
| Chọn **Cần chỉnh sửa/Duyệt phiên bản này/Rút kết quả duyệt** và **Ghi kết quả duyệt** một lần theo operation | Chỉ exact version, không mở publish, AI hoặc công nhận buổi thực hành từ intro |

Thao tác cuối là live write, hiện chưa được hướng dẫn thực hiện cho testgroup. Lỗi access/assignment/version hoặc kết quả chưa rõ: dừng, báo [mẫu chung](DELIVERY-AND-REPORTING.vi.md#ghi-lỗi-tối-thiểu), không tự cấp quyền hoặc ghi lại.
