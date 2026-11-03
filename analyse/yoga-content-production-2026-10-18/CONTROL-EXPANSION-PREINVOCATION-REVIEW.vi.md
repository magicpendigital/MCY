# Review control expansion trước invocation — 2026-10-19

**GO cho invocation local của checker/fixtures ở đúng các pin dưới đây**, sau khi coordinator xác nhận worker dừng ghi. Không có P1/P2 cụ thể trong source đã đọc. Reviewer `/root/content_independent_qc` chỉ đọc source, không import checker mới hay chạy suite. GO này không xác nhận dữ liệu đã PASS suite, final manifest, chuyên môn yoga hoặc quyền.

| Tệp | SHA256 source đã review |
|---|---|
| expansion-contract.mjs | c24f6f5bf07fe697b5c211a6d8df0eedeadcb2115bedb870662797d0d51f09af |
| validate-expansion-catalog.mjs | 7c79f1121c67d78703abb74eb4c7024b06cd3527e9516aa65af5c3a5c6eeda05 |
| validate-expansion-catalog.test.mjs | 015c1139ea6e8ac05fde56b48401b211a2a5b00efd4f4f782ad868ed6948a8c0 |
| content/yoga-library/expansion/catalog.schema.json | 8a19e8ae10498faade1294db0b1e51015483451197b2d1740aca3d195eb55d23 |
| run-library-checks.mjs | b6955a82bcdbbbfc438c0f3d596b0d8cad3d40eab4a86887f663f0f307179644 |
| verify-manifest.mjs | c3aaba9adec6836c63d860e7cdfc69d076a874cd7762a0300e33dc592988a3b4 |

Tên tệp không có prefix trong bảng nằm ở `analyse/yoga-content-production-2026-10-18/`. Đã so sánh JSON thuần trong source schema với artifact schema: cùng shape, không execute generator. Mọi object contract đóng additionalProperties; không có cues/dose/benefits/difficulty/media/practiceDuration hoặc relation safe-for/prerequisite. Các cờ metadata-only, private/unpublished/pending và approvals rỗng là constant.

Checker kiểm source IDs/locator/reference/kind/prefix/locale/alias context; Sanskrit chỉ attested; local inventory có exact path+SHA, source URL null và record locator thật. HTTPS web không mang local pin hoặc credentials; checker không gọi network và không tuyên bố source truth. Schema JSON phải cùng contract source; scan mọi nhánh bounded keywords trước evaluator tránh nhánh anyOf chưa chọn che keyword lạ. Weakening đồng thời cả hai source files không bị coi là impossible; manifest/source-review pin là ranh giới cho thay đổi control.

Đã đọc các guard taxonomy domain/parent/cycle, variant đúng một family parent có nguồn web, known conflicts không tự resolve/fill Sanskrit, local topic không thành standard-asana relation. Crosswalk hiện có là policy rõ ràng: không map title tự động; path đúng canonical folder+revision, contained file/no symlink, tuple locale/revision/id và inventory exact/backlink. Metadata không cộng unit/media.

Fixtures dùng temp repo riêng và source giả ghi rõ fiction, không sửa canonical, không network/cloud/runtime. Negative cases bao gồm fields cấm, fake public/approved, duplicate/unknown refs, schema weakening/keyword lạ, nguồn local/web sai, false name attestation/Sanskrit, taxonomy cycles, variant chains, mapping local→asana/standing→stand-up/CowFace full pose, traversal/absolute/wrong-folder/missing/symlink file, drift selector/tuple. Case symlink có thể SKIP khi OS từ chối tạo link; phải báo đúng kết quả, không ghi như PASS nếu không thực sự exercised. Import checker được kiểm bằng subprocess riêng không output/không tạo file; CLI chỉ chạy khi module là argv target. Reviewer chưa chạy các fixture đó.

Runner gọi fixed Node scripts, label giới hạn, log riêng, dừng khi exit khác0/timeout/error. Core64 và expansion checker/fixtures tách nhau. Producer/verifier wiring đã đọc: revalidate core+render và expansion, hai summary riêng, canonical package walk có cả expansion/schema/README và chỉ loại đúng root manifest; private observation captures vẫn pin exact file/hash, không raw MOV. Verifier không ký manifest, không chứng minh identity/expertise/rights.

**Final producer pin còn chờ:** coordinator thêm research receipt vào toolFiles sau data STOP rồi gửi exact producer SHA để chốt bổ sung. P2 bảng README thiếu Crow/113 thay vì114 được báo riêng ở EXPANSION-README-INDEX-FAIL.json; cần sửa/re-pin trước final package. Hai điểm này không cản source-review GO của checker/fixtures, nhưng chưa có final-manifest verdict.

## Freeze v2 — bổ sung binding local locator

Đã đọc độc lập phần bổ sung sau source snapshot ở trên. **GO invocation local ở validator `a77f42072b8cba7388e6441d314adae1e95a873721be148baf9c92547d578f49` và tests `71e2723eaf3d5d0408977d789c45aa655f64519dffd294d700defa8ad4b0cb01`**. Hai pin này thay thế validator/tests trong bảng đầu cho invocation kế tiếp; contract/schema không đổi. Producer báo STOP freeze v2, chưa invocation.

Local assertion/entity source và conceptual name refs giờ phải dùng locator thuộc inventoryRefs của linked unit nếu entity có link; không thể mượn một record có thật nhưng không liên quan để mô tả local unit khác. Đã đọc hai negative fixtures chuyển source/name locator từ low-crow22 sang kneeling-backbend19; cả hai đòi reject ở guard mới. Phần thêm chỉ so sánh trong RAM, không có I/O mới. Không thấy P1/P2. Reviewer vẫn chưa execute checker/fixtures.
