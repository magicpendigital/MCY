# Đối chiếu control cuối trước đóng gói — 2026-10-20

**GO cho root chạy kiểm tra local, rồi tạo và xác minh manifest nếu các kiểm tra đạt.** Reviewer `/root/final_content_qc` đã đọc lại producer, verifier, runner và expansion checker thực tế; không có P1/P2 cụ thể còn mở trong phạm vi source và pin đã kiểm. Không chạy test hoặc tạo manifest trong lần review này.

Đã đọc trực tiếp `CONTROL-EXPANSION-PREINVOCATION-REVIEW.vi.md`, `EXPANSION-CONTROL-EVIDENCE-QC.vi.md`, `EXPANSION-SEMANTIC-QC.vi.md`, `EXPANSION-REPAIR-READ-QC.json` và `CORE-READ-QC.vi.md`. Các kết quả audit trước được kế thừa theo byte không đổi, không trình bày như một lần tái thực hiện kiểm nguồn web hoặc xem ảnh.

| Control | SHA256 đã đối chiếu |
|---|---|
| create-manifest.mjs | 0a8d7c37d91623d8775916012218608c6d64eeabd21b858a9bf2ad1bdcfc4b00 |
| verify-manifest.mjs | c3aaba9adec6836c63d860e7cdfc69d076a874cd7762a0300e33dc592988a3b4 |
| run-library-checks.mjs | b6955a82bcdbbbfc438c0f3d596b0d8cad3d40eab4a86887f663f0f307179644 |
| expansion-contract.mjs | c24f6f5bf07fe697b5c211a6d8df0eedeadcb2115bedb870662797d0d51f09af |
| validate-expansion-catalog.mjs | a77f42072b8cba7388e6441d314adae1e95a873721be148baf9c92547d578f49 |
| validate-expansion-catalog.test.mjs | 71e2723eaf3d5d0408977d789c45aa655f64519dffd294d700defa8ad4b0cb01 |
| validate-library.mjs | cbe8ee17dfcf57e1800f265aa7d0cec0ab63c91cefeec46b87c423482f731541 |
| render-library.mjs | 71d4fd3cae116e66dd734e7698de1ee55f3c35a9023f6aa426f0f55a77da32c9 |
| validate-library.test.mjs | 53c8d39953a81eec2f652b236e18bc70deb08f33cab0847fe3204283172625a2 |

Các tệp trong bảng thuộc `analyse/yoga-content-production-2026-10-18/`. Producer bổ sung đúng receipt nghiên cứu expansion, control review, kết quả control, audit ngữ nghĩa/repair và các log thất bại/thành công lịch sử vào `toolFiles`. Đây là phần bổ sung đọc và pin bằng chứng; không có đường network, thực thi shell, import vào app hay ghi cloud. Bản producer trước `6fe355…b120` thiếu receipt nghiên cứu; điểm chờ này đã được giải quyết bởi bản `0a8d7c…4b00`.

Producer chạy core validator, render ở chế độ check và expansion validator trước ghi manifest. Canonical walk bao gồm catalog/schema/README expansion và chỉ loại đúng root `manifest.json`; dependency loop giữ nguồn, prompt và từng capture quan sát được tham chiếu. Verifier đối chiếu byte, toàn bộ canonical files và hai summary riêng. Đây là freeze byte, không chữ ký/phê duyệt người thật. Phạm vi kiểm dependency ngoài canonical cần được đối chiếu khi có manifest cuối; verifier không tự tái dựng mọi external dependency.

Runner giữ nguyên năm lệnh Node local cố định, log theo nhãn, dừng ở thất bại; fixture expansion dùng thư mục tạm và dữ liệu hư cấu. Kết quả 82 tests/81 PASS/1 SKIP trước đây chỉ là bằng chứng lịch sử. Lần chạy mới phải báo actual exit và actual SKIP, không mặc định kết quả từ lần cũ. Core regression thứ 64 chưa có kết quả final trong review này.

| Dữ liệu/nguồn | SHA256 hiện tại |
|---|---|
| expansion/catalog.json | 055317c193a4b66a8f52f5eed4faf7a390b76c0e5c79f4cd243d3e5ff4c60830 |
| expansion/catalog.schema.json | 8a19e8ae10498faade1294db0b1e51015483451197b2d1740aca3d195eb55d23 |
| expansion/README.vi.md | 03380421b36842e5c33b30ecab1d479ec4da53587d00b7b638b03b67e856e444 |
| EXPANSION-RESEARCH-SOURCES.json | 14a0f305a7baca2483cf9fe872cd4377b750eba328277ff6a3380e7e9a736584 |
| src/courses/freeCourses.ts | 92cfc2e572a9aa94abdce1843609634a536d80ee29eecb55d12d21ddfa9e5436 |
| supabase/functions/_shared/practiceContract.ts | e52debcc8dd088e249a3b90f049ddc59d786582dadc1f88f96e54caf24eb0e17 |
| supabase/functions/_shared/contentReviewCandidates.ts | 97b1cf85050861da17f21282a57f773f854e1d53a185cf7d5fdcbed93e680ffe |
| supabase/functions/_shared/reviewedPracticeCatalog.ts | 119d31e0aca5854d47c8bb0992b0aed68a9a24224fa76646053350c34d911f1e |

Ba đường dẫn `expansion/` thuộc `content/yoga-library/`; research receipt thuộc thư mục analyse trên. Các pin này khớp các review cuối đã nhận. P2 README thiếu Crow đã đóng bằng bản 114 dòng. Canonical CLI lần 1 thất bại vì local locator vẫn giữ trong log; sửa dữ liệu không làm yếu control, CLI lần 2 PASS giữ đúng phạm vi.

Điều kiện: root xác nhận worker đã STOP, dùng đúng bytes này, giữ log thất bại nếu có và không đóng gói khi kiểm tra chưa đạt. GO này chỉ cho thao tác local đã được giao, không mở scope app/native/cloud, không là chuyên môn yoga/quyền sử dụng/publication approval. Sau khi root tạo manifest cần đối chiếu độc lập manifest cụ thể và kết quả actual final run.
