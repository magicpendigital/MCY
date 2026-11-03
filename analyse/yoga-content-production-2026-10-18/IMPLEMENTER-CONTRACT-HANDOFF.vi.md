# Handoff implementer — schema, inventory và import foundation

18/10/2026 · `/root/content_contract_intake`. Root GO sau TASK-INTAKE + INTAKE-QC đã đọc. Canonical **`content/yoga-library/`** supersede đường đề xuất cũ trong CONTRACT-INTAKE; công cụ/evidence giữ tại thư mục analyse này. Không sửa source ứng dụng, candidate UX, dữ liệu16/10, cloud hoặc AGENTS.

## Phần đã triển khai

- `contract.jsonschema`: draft contract riêng, không thay runtime `CourseLesson`, `PracticeSession` hay Owner content-review registry.
- `inventory.json`:38 source records giữ nguyên canonicalfields/ID01–38/YouTubeID/title/group/duration/captions/visibility; source hash pin đúng catalog đã đối chiếu UX4.4–4.7. Crosswalk contentUnitIds được phép cập nhật khi root thêm unit có thật; validator yêu cầu đối xứng sourceRefs ↔ inventory.
- `units/foundation-standing/r3.json` và `units/foundation-cat-cow/r3.json`: stable IDs `mcy.foundation.standing`, `mcy.foundation.cat-cow`; legacyaliases giữ ID/version cũ. Import nguyên lời/step/alts/captions từ JSON16/10 và photo overlay; raw legacyPayload giữ để đối chiếu toàn bộ source. Mỗi bài có10 mediarefs:5 photoAI +5illustration, copy PNG nguyên bytes và có hashes/dimensions/provenance. Không sửa ảnh/source gốc.
- Tất cả draft cố định learnerVisible=false, recommendationEligible=false, publishStatus=unpublished; bốn review human đều pending và approvalRecords rỗng. Số bước có thể khác5 cho nội dung khác; media chưa tạo phải nullpath/hash/mime/dimensions và brief+blocker thật. Không thay ảnh sai làm placeholder.
- `UNIT-TEMPLATE.json` để writer đối chiếu fields; **không là unit xuất bản**. Schema/generator được đối chiếu nên thay declarative schema để nới gate sẽ bị reject. Parser source pin SHA known, cần review lại nếu canonicalsource đổi.

## Công cụ và giới hạn

| Script | Tác dụng / giới hạn |
|---|---|
|`build-library.mjs`|Sinh schema/template, inventory và hai import foundation; chỉ rebuild khi root muốn reset các file import đó. Không chạy sau worker tự chỉnh import mà chưa thống nhất. Giữ crosswalk đã thêm.|
|`validate-library.mjs`|Kiểm schema/closedflags,38mapping, IDs/order/refs/backlinks, source/evidence tồn tại, paths/symlinks, PNG signature/IHDR/IEND/dimensions/SHA, provenance và exact importedcopy. Không decode mọi pixel, không xác minh chuyên môn/quyền hoặc reviewidentity.|
|`validate-library.test.mjs`|Fictional packages trong OS temp; positive closedstate và negative mutations. Không liveactors/network.|
|`render-library.mjs`|Sinh Markdown/readable và COVERAGE từ JSON, hoặc `--check` để reject renderdrift. Không có nguồn copy cạnh tranh.|
|`run-library-checks.mjs`|Spawn process có exitcode/log/check record; `--render` ghi readable mới, mặc định check; `--label=` giữ lần chạy riêng.|
|`create-manifest.mjs --write`|Sau root chốt finalbytes: validate+rendercheck rồi ghi manifest gồm exact content/tools/sharedsource/provenance inputs. Không selfhash. **Chưa chạy finalfreeze bởi implementer.**|
|`verify-manifest.mjs`|Đọc lại hashes/size/coverage/closedstate và phát hiện file package mới chưa freeze. Consistency không là signature, người thật hay releasepermission.|

Initial check: validator2units/20presentmedia/38records exit0; negative27/27 exit0. `INITIAL-VALIDATION-RESULTS.json` giữ lần đầu; `initial-supplement-checks.json`/logs giữ lần có canonicalsource guard + render. Sau bổ sung schemaidentity/provenancepair controls, kết quả mới được ghi riêng, không mang PASS cũ sang bytes mới. Root cần chạy lại package toàn bộ khi content worker đã thêm units/backlinks, freeze final và yêu cầu independentQC control/data, rồi tự verify.

Trong scope này không sinh thêm body tư thế mới. Tính đúng lời/ảnh vẫn cần chuyên gia yoga thật và rights/accessibility review trước người học. Nullmedia/brief_blocked không đếm thành ảnh hoặc bài hoàn tất. Không có adapter CMS/reader, Auth/role grant, runtime AI, build/app/native/live/release được thực hiện. Rollback là không consume kho draft; không sửa lịch sử/triển khai đang có.
