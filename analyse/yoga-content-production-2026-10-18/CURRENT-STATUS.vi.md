# Kho nội dung yoga — bàn giao ngày 20/10/2026

Phạm vi Owner đã chọn: sản xuất cho toàn bộ nhóm tư thế trong thư viện app hiện có, sau đó xây danh mục mở rộng tư thế và kỹ năng yoga. Kho dùng chung ở `content/yoga-library/`. Đây là bản nháp biên tập để duyệt và tích hợp theo phiên bản; chưa là nội dung được phép phát hành cho học viên.

## Kết quả sản xuất

Thư viện nguồn có 38 clip: 18 vận động nhẹ, 13 mục trong nhóm tư thế và 7 chuỗi. Gói hiện phủ cả 13 mục của nhóm tư thế, cộng bài nền tảng đứng tĩnh: **14 bài đọc, 70 bước**. Các clip vận động nhẹ/chuỗi còn lại giữ metadata nguồn; chưa được tách thành những tư thế mới.

| Hạng mục | Kết quả |
|---|---|
| Bài có đủ media nháp | 9 |
| Bài còn chờ xác định biến thể/đường vào và ra | 5 |
| Media có tệp thực | 55: 45 ảnh phong cách thực do AI tạo và 10 hình minh họa |
| Ảnh mới trong lượt sản xuất | 35, chia cho 7 bài, mỗi bài 5 ảnh riêng |
| Media chưa sản xuất | 25 slot của 5 bài, trạng thái `identity_blocked` |
| Danh mục mở rộng | 114 mục metadata: 68 nhóm tư thế, 3 biến thể, 28 kỹ năng, 10 kiến thức, 5 chủ đề local chờ định danh |

Năm bài chưa đủ ảnh là Quỳ gối ngả sau, Quạ thấp, Hoang dã cao, Đứng lên và Bánh xe thấp. Bản chữ của chúng mô tả những điểm có thể quan sát và phần còn thiếu; không được gọi là hướng dẫn thực hành hoàn chỉnh. Các bài mới còn lại cũng đang ở phạm vi đọc/quan sát, chờ chuyên gia chốt đường vào/ra và đối tượng. Danh mục 114 mục là nền để mở rộng, không phải 114 bài đã sản xuất hoặc tuyên bố bao phủ mọi truyền thống yoga.

- [Danh sách 14 bài và trạng thái từng bài](../../content/yoga-library/COVERAGE.vi.md)
- [Danh mục mở rộng 114 mục](../../content/yoga-library/expansion/README.vi.md)
- [Hợp đồng dữ liệu cho task UI/UX](../../content/yoga-library/INTEGRATION-HANDOFF.vi.md)
- [Snapshot manifest](../../content/yoga-library/manifest.json)

## Phiên bản và kiểm tra

Manifest có 168 tệp đầu vào, 44.303 byte, SHA-256:

`0fa137d5ea658fadfdb8a1ab97e5fd86550a03b82fbed972530b338e65d114b1`

Root chạy `run-library-checks.mjs --label=final-v1`: cả 5 lệnh exit0. Core 64/64 PASS; expansion 82 trường hợp, 81 PASS và 1 SKIP vì Windows từ chối tạo symlink trong fixture. Hai validator và kiểm bản đọc sinh từ JSON đều PASS. Root tạo manifest rồi chạy `verify-manifest.mjs`: exit0/PASS, đủ 168 đầu vào. Bằng chứng ở [final-v1-checks.json](final-v1-checks.json).

[QC độc lập cuối](FINAL-PACKAGE-QC.vi.md) đạt trong phạm vi gói nháp local, không còn P1/P2 cụ thể. Reviewer tự xác minh manifest và đủ nguồn/capture/liên kết. [Kiểm tra cuối của root](ROOT-FINAL-VERIFICATION.json) đọc lại 168 pin cùng 6 tệp bằng chứng, tất cả khớp; kết luận vẫn tách biệt với phê duyệt chuyên môn và phát hành.

Các failure trước vẫn được giữ nguyên: ledger từng có hai JSON nối nhau, README từng thiếu dòng Crow, và lần kiểm catalog đầu từ chối locator nguồn local quá rộng. Đã sửa dữ liệu và đối chiếu lại; không thay failure cũ thành PASS hoặc làm yếu checker.

## Phối hợp và phần còn lại

Task UI/UX `01a13665-dd93-76d1-bc45-1fd05b110bf6` đã đọc hợp đồng và góp ý mapping ID/revision/locale. Kho đã áp dụng các góp ý đó. Theo báo cáo của task được root đọc ngày 20/10, snapshot reader cục bộ bước 5.3 đã đọc 14 bài, kiểm trực tiếp 7 bài thay đổi và 28 câu “Chuyển ra”, giữ đúng nhãn media bị chặn. Đây là kiểm tra của task nhận, không phải lần kiểm browser do task sản xuất nội dung này tự thực hiện.

Hợp đồng chọn đúng `unitId + revision + locale`, giữ hash media và nguồn JSON chung; metadata mở rộng có schema riêng và không được đếm thành bài học. Manifest toàn gói được gửi riêng để task nhận ghi nhận phiên bản, không tự mở bước UI/UX tiếp theo.

Mọi bài và ảnh vẫn unpublished, ẩn với học viên và không đủ điều kiện AI gợi ý. Chuyên môn yoga, quyền sử dụng, biên tập và khả năng tiếp cận cần quyết định người thật cho đúng phiên bản. Kho chưa đồng bộ vào database/cloud hoặc phát hành trong app.

Muốn bổ sung/sửa sau snapshot này: tạo revision mới, đối chiếu các consumer và duyệt lại phần bị ảnh hưởng. Không sửa bytes đã bàn giao rồi giữ manifest/approval cũ. Có thể giữ nguyên snapshot riêng ở task nhận hoặc chưa nhập gói mới; không cần rollback dữ liệu học viên vì lượt này không ghi dữ liệu đó.
