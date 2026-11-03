# Review control trước khi chạy —18/10/2026

Reviewer:`/root/content_independent_qc`, độc lập với tác giả patch`/root/content_contract_intake`và root điều phối. Phạm vi là source review của control/test local để khắc phục ba P2 trong[interim QC](EDITORIAL-DATA-INTERIM-QC.vi.md). Không là duyệt yoga/quyền, không là final package QC, không cho phép cloud/native/app integration.

**Verdict: GO cho root điều phối chạy các kiểm local/fixture trong phạm vi đã chọn.** Đã trực tiếp đọc bốn script dưới đây và phần phụ thuộc liên quan. Không phát hiện P1/P2 còn lại ngăn invocation của các kiểm đó. Chưa chạy validator, negative tests, render hoặc manifest producer mới trong lượt review này; kết quả runtime hiện **BLOCKED (unrun)**, phải được ghi sau process exit. Không dùng static GO thay test PASS.

## Exact source pins đã đọc

| File trong thư mục task | SHA256 |
|---|---|
|validate-library.mjs|`dd3dcf4478e06c6f9dc23ad0d6ea7d8d4e75effb6ddd78d98d8a1f01a45eac98`|
|validate-library.test.mjs|`5268d703ba37ec0e9b03efcf7e1d002c0753012b6b233854388fe33d9a6f9432`|
|create-manifest.mjs|`7a96a0d9f5f7a066c46035c19a7a4f2d1c4902b99528c9319675eb3027d5f7f4`|
|verify-manifest.mjs|`18db7573d3566649a2cb535ae4dbd2872acc4325c7f53a58f559f9fd77e72e43`|

Phụ thuộc đã đối chiếu khi review: library-contract`c2ef86779d84024ae7267def4893b09a23c07daea232d504b3420be0c814562d`; build-library`71be3b20a5350de321053e226f6ff7073f6039a2741dfe749cd5eb89c1e2ab64`; render-library`1420ca253f275e0d1a04efa88512da4ee0c84bb9e89ee3d10409e6ce1886cec8`. CLI guards không gọi build/render/manifest khi import bởi test. Đây là pins cho review control; final manifest vẫn cần đóng toàn inputs/data/media khác.

## Disposition ba P2 của control

| Finding | Source đã sửa / cách đánh giá độc lập | Trạng thái trước invocation |
|---|---|---|
|Observation có thể tự khai source/timestamp sai|`visibleObservationTimes`yêu cầu một provenance pin exact cho evidence JSON, kiểm hash/schema, match duy nhất filename+sourceSHA, phân biệt initial/supplement, đối chiếu visible columns với actualTime; supplemental list phải khớp visible columns. Timestamp unit chỉ được là subset của visible trong đúng evidence. Không cross-capture fallback.|**PASS source review.** Tests mới cần chứng minh runtime reject SHA0, Invented.mov,99999, black-only và evidence drift.|
|Present AI media được xoá provenance|`draft_present`bắt buộc nonblank tool/date/promptRef/sourcePath/sourceSHA, date parse được; source file/hash và prompt file vẫn kiểm bằng containedFile. Unproduced giữ null được. Fixture positive nay dùng provenance thật của ảnh foundation thay tạo provenance rỗng.|**PASS source review.** Không hạ expected reject để giữ fixture cũ; có negative từng trường và reproduction xoá toàn bộ.|
|Nested manifest bị bỏ freeze|`packageArtifactFiles`chỉ loại exact resolved root manifest. Producer và verifier dùng chung hàm; test kiểm nested manifest có trong tập, root manifest không có, và omission bị verifier reject.|**PASS source review.** Cần process test exit0; current package còn mutable nên chưa nhận manifest cuối.|

PNG parser còn được tăng cường kiểm chunk bounds/type/CRC, IHDR/IEND và ít nhất một IDAT. Các negative mới giữ hash file đã mutate để chứng minh không chỉ reject vì digest mismatch. Đây là structural integrity, **không phải full zlib/pixel decode hoặc chứng minh giải phẫu**. Root/media QC phải xem pixels thật và ghi giới hạn này; không có lý do sửa schema/media gate để chấp nhận ảnh hỏng.

## Review tests và side effects

- Các tests cũ vẫn giữ phủ duplicate/order, reference mapping, path traversal/absolute path, missing asset/hash/dimension drift, published/learner/recommendation flags, fake approval, expert approved, read-time/practice confusion và schema weakening.
- Tests mới có positive fictional initial/supplement observation, kể cả visible frame readyState1; điều này bảo toàn nguyên tắc pixels review là evidence, không coi readiness/timestamp riêng là đã thấy. Negative black/unknown schema/hash drift kiểm đúng lớp defect.
- Fixtures dùng`mkdtemp`với prefix riêng trong OS temp; mutation chỉ RAM hoặc temp fixture. Cleanup dùng đúng root vừa tạo, không có đường xoá/source mutation tùy ý. Source unit chỉ được đọc để tạo clone/provenance fixture. Không có network/Auth/backend/native, grant/email/inference/deploy trong bốn script.
- Producer manifest chỉ ghi root manifest khi root gọi CLI`--write`hoặc hàm write=true; review GO không tự chốt thời điểm freeze. Render/build vẫn có khả năng ghi canonical files khi root gọi trực tiếp, vì vậy chỉ root điều phối sau khi workers dừng và chọn final bytes.

## Limits và việc tiếp theo

Root đã sửa low-wheel copy và tách observations initial/supplement trong data. Tôi chỉ xem phần tách mới để hiểu compatibility, không dùng review control này nhận final copy/media của12unit hoặc55ảnh. Seven unit media/alt/caption/blockers và inventory backlinks vẫn đang thay đổi.

Root cần kiểm pins chưa drift, chạy bounded tests/validator/render-check, ghi exact command/exit/results, giữ failures nếu có. Nếu sửa source/test/dependency sau đây, phát hành freeze mới và review lại phần ảnh hưởng. Sau khi35ảnh mới và dữ liệu cuối ổn định, final independent QC vẫn cần chạy/đối chiếu artifact thực; root final verification và đồng bộ UX là bước riêng. Human expert/rights/accessibility/release gates tiếp tục **BLOCKED**.
