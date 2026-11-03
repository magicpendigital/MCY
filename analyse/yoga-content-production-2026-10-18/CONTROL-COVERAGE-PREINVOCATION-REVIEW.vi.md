# Review control coverage trước khi chạy

18/10/2026. Reviewer độc lập:`/root/content_independent_qc`. **GO static cho bounded local suite** của ba pins dưới đây; reviewer chưa chạy các source mới. Đây là bổ sung sau review JPEG/capture, không nhận package hoặc tests unrun thành PASS.

| Source | SHA256 |
|---|---|
|validate-library.mjs|`cbe8ee17dfcf57e1800f265aa7d0cec0ab63c91cefeec46b87c423482f731541`|
|render-library.mjs|`71d4fd3cae116e66dd734e7698de1ee55f3c35a9023f6aa426f0f55a77da32c9`|
|validate-library.test.mjs|`53c8d39953a81eec2f652b236e18bc70deb08f33cab0847fe3204283172625a2`|

Đã trực tiếp đọc source renderer, validator summary và regression mới; Get-Content/Get-FileHash exit0. Coverage tên bài/link là presentation sinh từ JSON; JSON vẫn canonical. Map key đã sửa từ id sang tuple id/revision/locale, nên hai revision cùng stableID không lấy nhầm link của revision cuối. Validator summary thêm locale để lookup tuple đúng; schema vẫn vi-VN const, không tự mở ngôn ngữ mới.

Regression tạo r1 và r2 thật của cùng fixture unit, render và render-check trong temp root riêng; assert hai title/link riêng và summary revision/locale. Helper renderer nhận root/repo options để không ghi canonical từ fixture; default CLI vẫn libraryRoot cũ. Không có app/runtime/Auth/network/cloud change. Các controls pending/publish/source/media trước vẫn giữ.

Chưa phát hiện P1/P2 ngăn invocation. Root cần giữ pins, chạy suite/process exit và render final sau khi workers dừng. Validator summary thay đổi làm manifest.validation cũ cần freeze mới, không reuse silently. Final QC vẫn đối chiếu14selectors với exact JSON/revision/locale, generated links và sourceRefs.lessonId→inventory.records[].id; contentUnitIds không chọn revision/locale. Expert/rights/release vẫn pending.
