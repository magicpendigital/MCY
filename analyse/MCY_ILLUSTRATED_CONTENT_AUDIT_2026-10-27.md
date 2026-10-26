# Bài giảng có hình — rà soát cấu hình và vì sao chưa thấy trong bản test (27/10/2026)

Phạm vi: đọc mã và tệp trong repo, chạy kiểm thử cục bộ. Không deploy, không ghi cloud, không cài thiết bị, không ghi bản ghi duyệt nào thay Owner.

## 1. Nội dung có gì

`content/yoga-library/` (nguồn chung, ngày 18–20/10) gồm **14 bài đọc tiếng Việt, 70 bước, 55 ảnh nháp AI** (55 tệp PNG khác nhau, ~99,9 MiB, mỗi tệp tối đa ~2,5 MB) và 25 ô ảnh bị chặn (5 bài `identity_blocked`: kneeling-backbend, low-crow, low-wheel, stand-up, wild-thing-high). Có thêm `inventory.json` (38 clip nguồn), `expansion/catalog.json` (114 mục metadata) và `manifest.json` (snapshot kiểm hash).

Trạng thái khai báo trong chính nội dung: `learnerVisible:false`, `recommendationEligible:false`, `publishStatus:"unpublished"`, bốn mục duyệt (chuyên môn, quyền, biên tập, truy cập) đều `pending`, `practiceDurationSeconds:null` (bài đọc, không phải buổi tập).

## 2. Cấu hình trong ứng dụng

| Lớp | Hiện trạng | Hệ quả |
|---|---|---|
| Git | `content/yoga-library` **0 tệp được theo dõi**; `ReadingUnitPreview`, `ContentReviewPanel`, `readingUnitCandidates.ts`, migration `…171220_content_review_reading_scope.sql` đều *untracked*; `HEAD:src/staff/owner.tsx` không có tab "Duyệt nội dung" | Web Preview (build từ commit) và AAB Play (xuất sạch từ HEAD) **không chứa** nội dung này |
| Bundle học viên | Cố ý không import dữ liệu bài đọc (quy tắc "private draft"); kiểm lại hôm nay: grep văn bản bài trong `dist/client` = không có | Đúng thiết kế; học viên không thể thấy nội dung nháp |
| Đường xem trước (trước hôm nay) | Chỉ ở **không gian Owner trên web** `/?workspace=owner` → "Duyệt nội dung". Ảnh chỉ được *mô tả* (alt/caption/hash), không có điểm ảnh | APK/AAB Android không có tham số URL → **Owner không có đường mở trong bản test điện thoại** |
| Backend staging | Owner Edge v5 chưa có danh sách bài đọc; migration scope `learning_reading` chưa áp; chưa có kho ảnh | Ngay cả không gian Owner trên web cũng chỉ thấy bài giới thiệu cho đến khi triển khai |
| Phát hành cho học viên | Duyệt ≠ xuất bản. Chưa có "người xuất bản" và đường giao nội dung đã duyệt | Học viên sẽ không thấy gì dù Owner duyệt hết |

**Kết luận:** bài giảng có hình hiện *tồn tại ở mức nguồn nháp + công cụ duyệt chưa commit/chưa triển khai*, và cố ý không nằm trong ứng dụng học viên. Không phải lỗi hiển thị — chưa có đường hiển thị nào được commit, build hoặc triển khai.

## 3. Đã làm hôm nay (mã nguồn cục bộ, chưa commit, chưa triển khai)

Mục tiêu: để Owner (và người được giao) **đọc bài có hình ngay trong ứng dụng, kể cả trên điện thoại**, gắn nhãn đúng trạng thái.

- **Cá nhân → "Dành cho biên tập → Xem trước nội dung"** — chỉ hiện khi máy chủ xác nhận tài khoản có bài đọc được giao (Owner hoặc reviewer). Học viên thường, khách, hoặc backend chưa có tính năng: không thấy gì (một lần thăm dò mỗi tài khoản mỗi phiên).
- Danh sách 14 bài với nhãn **PREVIEW · CHƯA DUYỆT** hoặc **ĐÃ DUYỆT · CHƯA XUẤT BẢN**; trình đọc theo bước: dấu hiệu dừng đặt lên đầu, chuẩn bị, từng bước kèm ảnh (alt, chú thích, công bố "ảnh AI"), điểm còn chặn ở cuối. Ô ảnh chưa sản xuất/bị chặn hiển thị đúng lý do, không dùng ảnh khác thay.
- Máy chủ: action mới `read_reading_preview` trong `owner-control-plane` (cùng kiểm danh tính, quyền Owner/được giao và đúng phiên bản như luồng duyệt). Không `candidateId` → danh sách nhẹ; có `candidateId` → nội dung một bài + **URL ký 15 phút** cho ảnh từ bucket riêng `reading-preview` (tên tệp = SHA-256). Thiếu ảnh/kho → bỏ qua, không lỗi.
- Migration `20261027090000_reading_preview_bucket.sql`: bucket riêng, không policy → chỉ service role truy cập. Script `scripts/upload-reading-preview-media.mjs`: mặc định **dry run** (đã chạy: 55 ảnh duy nhất, hash khớp JSON); `--apply` cần Owner đồng ý và khóa server trong môi trường.
- Kiểm thử: handler 11/11 (3 ca mới), Playwright `tests/reading-preview.spec.ts` 4/4, build chuẩn PASS (runtime 28, bundle secret scan 29 tệp, Sites 4/4), `check:reading-candidates` vẫn khớp (14 bài). Hai fixture nghiêm ngặt (`account-deletion`, `learner-write-review`) được thêm 1 dòng trả 403 cho lần thăm dò.

## 4. Để thấy trong bản test — các bước cần Owner đồng ý (chưa làm)

1. Commit nhóm thay đổi nội dung/duyệt (nay đang untracked) theo từng nhóm, để các bản build lấy được.
2. Áp migration `20261023171220_content_review_reading_scope.sql` và `20261027090000_reading_preview_bucket.sql` lên `mcy-staging` (ghi cloud; mục tiêu/ledger xác nhận lại trước khi áp).
3. Chạy `node scripts/upload-reading-preview-media.mjs --apply` (ghi ~100 MB vào bucket riêng; cần khóa server do Owner đặt vào môi trường, không vào chat).
4. Triển khai lại Edge `owner-control-plane` (bản mới có `read_reading_preview` và danh sách bài đọc).
5. Build web + AAB mới (versionCode 3) từ commit sạch; Owner cài qua Internal testing và đăng nhập bằng tài khoản Owner.
6. Owner đọc, rồi tự quyết định duyệt qua `?workspace=owner` (khai báo chuyên môn/quyền do chính Owner nhập).

## 5. Việc kế tiếp cần Owner quyết

- **Hiển thị cho học viên sau khi duyệt?** Hiện duyệt chỉ ghi quyết định. Muốn học viên thấy bài đã duyệt cần: (a) cờ/bước *xuất bản* riêng (khuyến nghị tách người duyệt và người xuất bản), (b) đường giao nội dung đã duyệt + ảnh đã tối ưu (WebP, ~100–150 kB/ảnh thay cho PNG 2 MB), (c) chỗ đặt trong Khám phá. Phạm vi 1.0 đã chọn "không bài thực hành mới"; bài đọc không phải buổi tập, nhưng đây vẫn là quyết định nội dung — chưa làm.
- 25 ô ảnh bị chặn cần quyết định chuyên môn (biến thể đúng) trước khi sản xuất.

## 6. Giới hạn

Ảnh trong thử nghiệm là PNG 1×1 giả; chưa kiểm hiệu năng tải ảnh ~2 MB trên điện thoại. Không có bằng chứng thiết bị thật/TalkBack. Nội dung vẫn là bản nháp AI chưa duyệt chuyên môn/quyền; các kiểm thử kỹ thuật không thay thế việc duyệt đó.

## 7. Cập nhật: ảnh đã tối ưu (27/10)

55 ảnh PNG (99,9 MiB) → WebP 1280 px q80 (**1,9 MiB**, −98%); `room.png` của bài giới thiệu 2,4 MB → 93 kB. PNG gốc lưu ở `D:ProjectsMCY-archive` (có `ARCHIVE-MANIFEST.json`) và bị gỡ khỏi cây repo; vẫn còn trong lịch sử Git. Bucket/upload/ký URL dùng `<sha256>.webp`. Phiên bản (hash) của 14 bài đọc và của bài giới thiệu thay đổi vì nội dung ảnh đổi — chưa có bản ghi duyệt nào nên không mất kết quả duyệt.
