# Review private capture MIME trước khi chạy

Ngày18/10/2026. Reviewer độc lập:`/root/content_independent_qc`; tác giả patch:`/root/content_contract_intake`. Đây là static source review bổ sung sau58/59fixtures FAIL của root, không tự chạy lại hoặc biến receipt cũ thành PASS.

**GO cho bounded local tests của patch hiện tại.** Không thấy P1/P2 ngăn invocation trong phạm vi sửa parser private screenshot. Reviewer chưa invoke validator/tests mới, không đổi capture/evidence/unit/media. Kết quả runtime mới vẫn **BLOCKED (unrun)** trong review này.

## Pins đã trực tiếp đọc

| Input | SHA256 |
|---|---|
|validate-library.mjs|`941cb1ef547a51d68eff978ded388ec44b5551e78aa3ab2b62f107f8c080a8c4`|
|validate-library.test.mjs|`448aa9474c28832431000ba5daa9e61eef509e5f25f4d61251f5b9e706e147b6`|
|CAPTURE-FORMAT-DIAGNOSTIC.vi.md|`790f88eb6ce434a9dad864c9e90fdc12d5ebdae10c3d876fae125a6bfa86fe1f`|

Producer/verifier không đổi so với[review capture trước](CONTROL-CAPTURE-PREINVOCATION-REVIEW.vi.md). Get-Content/Get-FileHash exit0. Root cung cấp failure58PASS/1FAIL exit1 của59fixtures; tác giả và reviewer không tự nhận đã chạy lượt đó. Lỗi thực là private captures lịch sử có extensionPNG nhưng bytesJPEG; không phải lý do sửa ảnh/hashes để qua gate.

## Đánh giá patch

`resolveObservationCapture`giữ exact evidence record/provenance pin, filename/SHA/timestamps visible, relative screenshot path, containment/realpath/no-symlink và captureSHA. Chỉ sau hash match mới sniff magic PNG/JPEG. Không đọc rawMOV hoặc mở định dạng bất kỳ từ extension. Historical `.png`path được bảo toàn; MIME trả về dựa trên bytes.

PNG vẫn kiểm chunks/bounds/CRC/IHDR/IDAT/IEND. JPEG kiểm SOI/EOI, marker/segment boundaries và lengths, SOF dimensions, SOS header và sự hiện diện của scan data/marker structure. Offset tiến có giới hạn hoặc reject; không thấy đường đọc/ghi ngoài capture file đã chứa trong phạm vi. Đây không là một decoder codec đầy đủ hoặc validator entropy; không suy structural PASS thành ảnh hiển thị đúng/tư thế đúng.

Media hình của canonical units vẫn chỉ nhận mimePNG và gọi PNG checker; patch không mở JPEG cho instructional media hoặc hạ các closed publication/human-review flags. Việc support JPEG private evidence giải quyết chẩn đoán MIME đã được giữ trong tài liệu, không che FAIL cũ.

Tests mới copy JPEG thật sang temp fixture với historical extensionPNG, kiểm MIME/dimensions/hash và thêm malformed marker length/truncatedJPEG/unknownformat. Hash capture và JSON pin được cập nhật trong negative fixtures để kiểm parser thay chỉ vướng digest. Các tests cũ capture path/SHA/visibility và PNG corruption vẫn giữ. Không có mutation ảnh lịch sử thật hoặc network/cloud/native.

## Điều kiện tiếp tục

Root đối chiếu pins rồi chạy và lưu riêng kết quả bổ sung/process exit. Nếu JPEG parser không nhận actual captures, giữ failure và sửa nguyên nhân; không rename/convert/overwrite evidence cũ. Final package vẫn cần kiểm capture entries đầy đủ, hash/pixels ảnh mới và final freeze độc lập. Review này không đóng chuyên môn yoga/quyền/accessibility/app integration/release.
