# Kế hoạch triển khai: bài đọc có hình cho học viên (phương án C) — 2026-11-02

Kế hoạch, chưa phải phê duyệt triển khai. Nối tiếp [thiết kế và phân tích 2026-11-01](MCY_LEARNER_READING_DESIGN_2026-11-01.md). Owner chọn phương án C (bản chụp tĩnh trong bucket công khai) ngày 2026-11-02. Chưa có mã, migration, Edge hay bucket nào thay đổi.

## 1. Cách hoạt động

```
Người duyệt đổi công tắc / chính sách  ─►  owner-control-plane (action mới)
    1. đọc trạng thái duyệt + cấu hình hiển thị từ DB
    2. tính bài nào được hiện (xem §3)
    3. chép ảnh đã duyệt: reading-preview (riêng tư) ─► reading-published (công khai)
    4. ghi units/<id>/<version>.json  rồi cuối cùng mới ghi manifest.json
    5. xoá file không còn được manifest nhắc tới
Học viên / khách  ─►  GET manifest.json + units/…json + ảnh   (không đăng nhập, không gọi Edge)
```

Máy chủ là nơi quyết định; app chỉ đọc file. Thứ tự ghi "ảnh, rồi bài, rồi manifest" để học viên không bao giờ thấy manifest trỏ tới file chưa có.

## 2. Hạng mục

**Cơ sở dữ liệu (1 migration mới, chưa áp dụng):**
- Bảng `private.mcy_reading_publication(candidate_id, content_version, visible, text_only_allowed null, updated_by, updated_at)` và một dòng mặc định `default_text_only_allowed` (khởi tạo `false`). Không cấp quyền cho client; chỉ RPC dành cho `service_role`, mỗi lần đổi ghi `private.audit_events`.
- RPC: `mcy_reading_publication_read`, `mcy_reading_publication_set` (kiểm tra quyền người duyệt giống `mcy_content_review_save`).
- Bucket `reading-published`: công khai, chỉ `image/webp` và `application/json`, giới hạn 1 MB/file. Migration có guard giống migration bucket `reading-preview`.

**Edge `owner-control-plane` (action mới, cùng chỗ với Xem trước):**
- `read_reading_publication` (danh sách + trạng thái hiệu lực + lý do giữ lại), `set_reading_publication` (bật/tắt, chính sách chung của Owner, ghi đè từng bài), `sync_reading_publication` (dựng lại từ DB, chạy lại được nhiều lần).
- `save_content_review` thành công thì tự gọi đồng bộ, nên thu hồi/đổi yêu cầu sửa/rút lại bản duyệt gỡ bài khỏi manifest ngay.
- Mở rộng `OwnerControlPlaneClients.server.storage` (hiện chỉ có `createSignedUrls`) thêm `copy` giữa hai bucket, `upload`, `remove`. Đồng bộ chạy tối đa 2 vòng nếu trạng thái DB đổi giữa chừng.
- Người đổi công tắc từng bài: Owner hoặc người duyệt được giao cho bài đó. Chính sách chung: chỉ Owner.

**Bản chiếu cho học viên (whitelist, một hàm thuần có test):**
- Chỉ lấy các trường đã liệt kê ở mục 4 của tài liệu thiết kế.
- Chú thích hình tự dựng từ cờ `synthetic` (nhãn "Hình AI · nhân vật hư cấu"); phần mô tả giữ lại sau khi bỏ tiền tố "Ảnh AI nháp — " và hậu tố "Chưa duyệt chuyên môn/quyền." Nếu chuỗi không khớp mẫu thì bỏ mô tả, chỉ giữ `alt`. Không bao giờ để chữ "chưa duyệt" hay "nháp" lọt ra.
- **Khoá nội dung:** hàm từ chối bài nào có chuỗi nội bộ trong bất kỳ trường học viên nhìn thấy (`brief`, `progression`, `nguồn local`, `nháp`, `chưa duyệt`, `blocker`…) và trả lý do `content_needs_copy_pass`.

**Ứng dụng học viên:**
- `src/library/readingLibraryApi.ts`: tải manifest và bài từ URL công khai của bucket (suy ra từ URL Supabase đã cấu hình), kiểm tra hình dạng dữ liệu chặt, cache trong phiên, lỗi mạng hiện trạng thái "Thử lại". 404/manifest rỗng thì ẩn mục "Bài đọc có hình", không báo lỗi.
- Màn: mục trong Khám phá, tổng quan, bước, đọc xong (theo canvas), route mới cạnh `ROUTES.readingPreview`, dùng lại `ReadingPreviewScreen` và `reading-preview.css` làm nền.
- "Tiếp tục từ bước đang đọc": mở rộng `src/courses/lessonMemory.ts`, khoá theo id bài + phiên bản, chỉ lưu trên máy.
- Màn cấu hình "Hiển thị cho học viên" (bảng 6): đặt trong Cá nhân → Xem trước nội dung, hiển thị trên cả Android. Bật công tắc có hộp xác nhận nói rõ ảnh và chữ sẽ công khai.
- Không dùng `readingUnitCandidates` trong client; build có kiểm tra bundle như hiện nay.

**Kiểm thử:**
- Handler Node (mới): quy tắc hiển thị (đủ ma trận ở bảng 7), thu hồi tự gỡ, đồng bộ lặp lại cho kết quả giống nhau, khoá nội dung, bản chiếu không lộ trường cấm.
- Rehearsal SQL cho migration: máy này thiếu `@electric-sql/pglite` nên **chưa chạy được ở đây**; cần cài dev dependency đó hoặc chạy ở máy có sẵn. Không tính là đã kiểm cho đến khi chạy.
- Playwright `reading-library.spec.ts` với fixture chặn URL bucket: có hình, chỉ chữ, mất mạng, hình lỗi, bài bị gỡ khi đang đọc, danh sách trống, tiếp tục từ bước đang đọc, 390 px và hai preset, kiểm tra không có chuỗi cấm trong DOM.
- Chạy lại `tsc`, `check:runtime`, build chuẩn, quét bundle, `learner-ux`, `reading-preview`.

## 3. Quy tắc hiệu lực (máy chủ)

Một bài chỉ vào manifest khi cả bốn điều kiện cùng đúng: có bản duyệt `approved` đúng `content_version` hiện hành; công tắc "Hiện cho học viên" bật; bài đủ hình, hoặc chỉ-chữ được phép (ghi đè riêng từng bài trước, rồi mới tới mặc định); và bản chiếu qua được khoá nội dung.

Hệ quả đã kiểm bằng dữ liệu thật khi viết mã (2026-11-02, hàm `projectUnit` chạy trên cả 14 bài): **7 bài đủ hình** qua được khoá nội dung (cobra, cobra-gentle, cow-face, downward-dog, foundation-cat-cow, foundation-standing, three-legged-dog) và có thể hiện sau khi bật. **2 bài có hình bị giữ lại** vì lời văn còn chữ nháp: high-lunge ("Bài nháp chưa chọn đường bước chân…" ở bước 2) và warrior-ii ("Bản nháp không dùng mũi tên…" ở bước 2). **5 bài chỉ chữ** đều mang câu "brief có điều kiện" ở mục Chuẩn bị (thêm "progression" ở low-crow, "nguồn local" ở low-crow và stand-up). Dù Owner cho phép chỉ chữ, 7 bài này chỉ hiện sau khi có người có chuyên môn biên tập lại câu chữ và Owner duyệt lại. Con số 9 bài ở tài liệu thiết kế là số bài đủ hình, chưa tính khoá nội dung.

Hai quy tắc phát sinh khi viết mã: (a) công tắc chỉ có hiệu lực nếu được bật **sau** lần duyệt gần nhất, nên duyệt lại hoặc rút bản duyệt sẽ ẩn bài cho đến khi bật lại; (b) chú thích hình sinh từ dữ liệu, riêng ba bài "foundation/..." đã là lời học viên nên được giữ nguyên.

## 7. Trạng thái mã (2026-11-02, cây làm việc, chưa commit, chưa áp dụng lên cloud)

Đã viết: migration `20261102090000_reading_publication.sql`; `supabase/functions/_shared/readingPublication.ts` (quy tắc, bản chiếu, khoá nội dung, đồng bộ bucket) và ba action trong `contentReview.ts`; `src/library/` (API học viên, màn đọc, màn cấu hình, CSS); mục "Bài đọc có hình" trong Khám phá; mục "Hiển thị cho học viên" trong Cá nhân → Dành cho biên tập. Kiểm thử: `tests/reading-publication.test.mjs` 11/11, handler cũ 22/22 và `content-review` 11/11 vẫn pass, `reading-library.spec.ts` 8/8, `reading-publish.spec.ts` 3/3, tsc, `check:runtime` 28, build chuẩn, quét bundle 38 tệp, Sites 4/4; bundle không chứa chữ của bài. **Chưa chạy:** rehearsal SQL cho migration (thiếu `@electric-sql/pglite`), kiểm tra trên bucket/Edge thật, TalkBack, thiết bị thật. **Chưa làm:** dòng quyền riêng tư trong `public/privacy.html` và câu trả lời Data safety.

## 4. Thứ tự và cổng cần Owner yêu cầu

1. **Mã cục bộ** (không đụng cloud): migration, handler, client, màn hình, test. Để chưa commit cho đến khi Owner xem.
2. **Áp migration** lên `mcy-staging` qua connector (cần Owner yêu cầu trong lượt đó; đọc lại ledger và định nghĩa trước/sau).
3. **Triển khai Edge** `owner-control-plane` bản mới từ cây làm việc, kiểm tra test handler trước.
4. **Phát hành client** theo `mcy-release-sync` (versionCode 5): web, APK lên điện thoại, AAB lên Internal testing. Client chịu được việc backend chưa có manifest (ẩn mục), nên thứ tự 3→4 không gây lỗi.
5. **Owner tự bật** từng bài trên điện thoại sau khi xem. Mặc định mọi công tắc tắt; chưa bật thì học viên không thấy gì.

## 5. Rủi ro và giới hạn

- Bucket công khai nghĩa là ảnh AI và chữ ai cũng đọc được khi có đường dẫn. Đây là bước biến bản nháp đã duyệt thành nội dung công khai, nên công tắc mặc định tắt và có hộp xác nhận. Việc chuyên gia yoga xem tư thế vẫn là quyết định của Owner, không do kỹ thuật thay.
- Gỡ bài có độ trễ: manifest và bài cache tối đa vài phút, ảnh theo mã băm có thể còn trong CDN đến hết hạn (đặt 1 ngày). Không phải xoá tức thì tuyệt đối; nếu cần, quay lại phương án B.
- Hai lần đồng bộ chạy cùng lúc có thể ghi chồng; vòng kiểm tra lại cuối cùng giảm rủi ro, không loại bỏ hoàn toàn. Đồng bộ là hàm thuần của DB nên chạy lại sẽ sửa.
- Cập nhật chính sách quyền riêng tư: học viên và khách tải file từ Supabase Storage (địa chỉ IP nằm trong nhật ký của nhà cung cấp); cần một dòng ở `public/privacy.html` và kiểm tra lại câu trả lời Data safety trước khi phát hành.
- Chưa kiểm TalkBack, cỡ chữ lớn, thiết bị thật và iOS cho các màn mới; tính đến khi có bằng chứng.

## 6. Việc cần Owner quyết định riêng, không chặn bước 1

- Có chuyên gia yoga xem hình AI trước khi bật công khai không (tôi giả định "có, rồi mới bật").
- Biên tập lại 5 bài chỉ chữ: ai viết, theo mẫu Làm · Cảm nhận · Tránh trong báo cáo 2026-10-31.
- Ai được đổi công tắc từng bài ngoài Owner (giả định: người duyệt được giao cho bài đó).
