# Review bổ sung control capture trước khi chạy

Ngày18/10/2026. Reviewer độc lập:`/root/content_independent_qc`. Phạm vi: patch của`/root/content_contract_intake`đóng băng bytes private screenshot đã dùng trong observations và thêm script sync backlinks vào manifest tools. Tài liệu này bổ sung[review control trước](CONTROL-PREINVOCATION-REVIEW.vi.md), không thay kết quả chưa chạy hoặc tự duyệt package/media/yoga.

**GO cho root điều phối chạy bounded local tests với đúng source pins dưới đây.** Static review không thấy P1/P2 ngăn invocation. Reviewer chỉ đọc source/hash, không chạy control/tests/manifest mới và không sửa implementation. Các tests mới vẫn **BLOCKED (unrun)** cho đến khi process thực sự thoát thành công. Root báo global14unit hiện PASS là evidence khác, không thay tests mới.

## Exact source pins

| File trong thư mục task | SHA256 |
|---|---|
|validate-library.mjs|`244c5e8e6721f20706aa32e059059d0419fafd4ab4d061e53ef109945e5f2de0`|
|validate-library.test.mjs|`d40142f774658f07449640ad340f7ba0cefe924ea3a94ae11cc3aaa29552ce42`|
|create-manifest.mjs|`abf6ca7e765fd90509a0f7c6d391375c0ba94158bd32898e61edbe4a36b7ce1d`|
|verify-manifest.mjs(unchanged)|`18db7573d3566649a2cb535ae4dbd2872acc4325c7f53a58f559f9fd77e72e43`|
|sync-inventory-backlinks.mjs(unchanged helper được pin thêm)|`fdd8eed642bd4a48cc58ead2c1a5735cb97c59a061bda7342c6472d16ca791a3`|

Get-Content/Get-FileHash exit0; đối chiếu full pins với thông báo implementer. Đã đọc phần resolver mới, caller producer, imports/CLI guards, tests mới và preserved schema/media/source checks. Chưa có final manifest để nhận completeness của inputs cuối.

## Đánh giá source

-`resolveObservationEvidence`được export/đổi tên từ logic đã review; vẫn yêu cầu exact provenance pin của JSON, source filename/SHA và visible timestamps đúng capture. `validateUnit`vẫn gọi lớp kiểm này, không bỏ các negative cũ.
-`resolveObservationCapture`lấy đúng record đã resolve; bắt buộc capturePath/captureSHA, chuẩn hoá dấu phân cách Windows trước safeRelative, chỉ chấp nhận extensionPNG. File được resolve tương đối với thư mục evidence JSON, đi qua containment/realpath và kiểm từng phần symlink; sau đó đối chiếu captureSHA và structuralPNG/CRC. Không đọc/copy raw MOV từ sourcePath bên ngoài repo.
-Producer chỉ thêm exact capture của observations thực sự được unit dùng vào dependencyFiles; JSON evidence vẫn được pin riêng. Duplicate capture giữa các observations được Set loại ở input list. Sync helper chỉ được đọc/hash trong producer, không import/chạy top-level write.
-Sync helper được đọc riêng: chỉ xây lại contentUnitIds dựa trên exact course/lesson/YouTube triple, giữ source fields trước/sau, ghi đúng inventory local. Script không là quyền publish hoặc alias writer vào runtime. Validator canonical vẫn là kiểm riêng sau sync.
-Không có hash cycle: captures không nhúng manifest; units pin evidence JSON; manifest pin units/JSON/captures/tools; chính root manifest vẫn được loại exact path. Không đưa QC verdict hoặc manifest hash ngược vào unit/source evidence.

## Tests được thêm và giới hạn

Tests mới kiểm Windows separator positive, capture bytes/SHA, drift dù JSON pin còn đúng, parent traversal/absolute Windows/absolute POSIX/rawMOV path, thiếu screenshotSHA và hai capture initial/supplement thực của low-wheel. Các fixtures chỉ ghi vào temp prefix riêng và cleanup root vừa tạo; không mutation canonical data hoặc source capture thật. Test actual low-wheel chỉ đọc observations/captures hiện tại.

PNG check vẫn là cấu trúc/chunks/CRC, không full zlib/pixel decode, không chứng minh ảnh có tư thế đúng. Private screenshot có hash không chứng minh đã xem trọn video/audio hoặc tải lực. Không suy exact MOV↔YouTube binding từ capture.

Verifier hiện kiểm hash/size của dependencies có trong input list và coverage mọi file canonical package. Nó không tự chứng minh tập external evidence dependencies đầy đủ nếu một manifest bị sửa tay; manifest không là chữ ký hoặc authority boundary. Vì vậy **final QC/root phải trực tiếp đối chiếu mọi observation dùng với capture entry có trong manifest thực**, gồm initial/supplement riêng của low-wheel. Đây là giới hạn kiểm cần ghi rõ, không phải runtime clearance cho data đang mutable.

## Tiếp theo

Root kiểm pins chưa drift rồi chạy tests/validator/render-check đã chọn, giữ lỗi và exact process results. Chỉ freeze sau khi media workers dừng và metadata cuối được chọn. Thay source/test sau review cần pins mới và review phần ảnh hưởng. Final independent QC/root verification, chuyên gia yoga/quyền/accessibility/CMS/app integration/release vẫn là các gate riêng còn chờ.
