# Đồng bộ phát hành đa nền tảng — quy trình bắt buộc

Áp dụng cho mọi thay đổi người dùng thấy được. Mục tiêu: **một commit duy nhất** là nguồn của bản web, bản Android cài trên điện thoại và bản trên Google Play, và luôn truy vết được commit nào đang ở đâu. Quy trình này không thay `docs/release/RELEASE_RUNBOOK.md` (cổng chứng cứ staging/production) hay `ANDROID_PLAY_RELEASE.md` (chi tiết Android); nó là thứ tự và các điều kiện dừng nối chúng lại.

Nguyên tắc cố định:

1. **Nguồn sự thật = commit đã chuyển vào Git** (HEAD của nhánh phát hành). Thay đổi chưa commit không bao giờ vào bản build. Mọi bản build Android đều từ *bản export sạch của HEAD* (`git archive`), không từ thư mục làm việc.
2. **Cùng một commit cho mọi nền tảng** trong một đợt phát hành. Nếu phải vá một nền tảng, tạo commit mới rồi phát hành lại cả ba (hoặc ghi rõ nền tảng nào chưa cập nhật trong sổ phát hành).
3. **`versionCode` tăng 1 cho mỗi lần tải lên Play** (Play từ chối trùng/giảm); `versionName` tăng khi người dùng thấy thay đổi (1.0.1, 1.1.0…). Giá trị cuối cùng nằm ở [sổ phát hành](RELEASE_LEDGER.md).
4. **Không phát hành khi cổng chưa xanh**; không bao giờ ép (`--force`, bỏ qua kiểm tra) để cho kịp.
5. **Mọi thao tác ghi ra ngoài** (push, tải lên Play, cài lên máy, áp migration, triển khai Edge) cần Owner yêu cầu rõ trong chính đợt đó. Một đợt cho phép không chuyển sang đợt sau.
6. Ghi **chứng cứ thật** (lệnh, mã thoát, mã băm, id triển khai). Điều chưa kiểm ghi là CHƯA CHẠY; điều Owner tự báo ghi là "Owner báo".

## Ma trận nền tảng

| Nền tảng | Nơi chạy | Cách cập nhật | Chứng cứ cần có |
|---|---|---|---|
| Web (`motchutyoga.magicpendigital.com`) | Vercel project `mcy`, nhánh Preview `main` (từ 2026-11-13; `codex-mcy-p1-preview` đã đóng băng) | `git push origin main`; Vercel tự build commit đó | id triển khai READY, commit SHA khớp HEAD, GET 200 và chuỗi mới có trong bundle |
| Android trên máy thử | gói `…mcydebug` (APK debug song song) | `adb install -r` APK build từ export sạch của HEAD | SHA-256 APK, `versionName`, `lastUpdateTime`; không gỡ/xóa dữ liệu/force-stop |
| Google Play | Thử nghiệm nội bộ (Internal testing) của app `com.magicpendigital.motchutyoga` | AAB ký bằng upload key, `scripts/play-release.ps1 -Build` | SHA-256 AAB, versionCode, trạng thái bản phát hành trên Console, cảnh báo của Play |
| Backend staging (Supabase) | `mcy-staging` | migration/Edge chỉ khi bản web/app mới **cần** và Owner đồng ý | ledger migration, readback; xem mục Thứ tự phụ thuộc |
| iOS | chưa phát hành | giai đoạn sau | — |

## Thứ tự phụ thuộc (đọc trước khi bắt đầu)

- **Backend trước, client sau**, nếu bản mới gọi RPC/Edge/cột mới. Client mới phải chịu được backend cũ (ẩn tính năng, không lỗi). Ví dụ đã áp dụng: màn "Xem trước nội dung" tự ẩn khi Edge chưa có action `read_reading_preview`.
- Không đưa nội dung chưa duyệt (chuyên môn/quyền) vào bundle học viên. Bản nháp chỉ qua máy chủ cho Owner/reviewer.
- Không phát hành tính năng AI/thực hành khi cổng AI còn đóng; kiểm bằng `aiCapability`.

## Các bước (mỗi bước là một cổng — dừng nếu đỏ)

**0. Mở đợt.** `node scripts/release-sync-status.mjs` (chỉ đọc): in HEAD, nhánh, trạng thái so với remote, thay đổi chưa commit, đợt gần nhất trong sổ và `versionCode` kế tiếp gợi ý. Xác nhận Owner đã yêu cầu những nền tảng nào.

**1. Đóng nguồn.** Commit theo nhóm (một ý một commit). Tệp dùng chung chứa việc dở của người khác: chỉ commit phần của mình (dựng từ `git show HEAD:…` + thay đổi, kiểm bằng export sạch). Không `git add -A` khi cây làm việc còn việc dở hoặc tệp riêng tư. Không đưa tệp lớn nhị phân vào lịch sử trước khi push (ảnh gốc ra thư mục lưu trữ ngoài repo; commit bản WebP).

**2. Kiểm chứng trên bản export sạch của HEAD** (thư mục tạm, `node_modules` nối bằng junction). **Cổng iOS 15 bắt buộc: `npm run check:ios15` phải xanh trên đúng commit sẽ phát hành, trước bước 3 (push), bước 4 (APK, AAB)**; đỏ thì dừng, không nới kiểm tra (xem [INC-001](../quality/KNOWN_INCIDENTS.md) và skill `mcy-ios-compat`). Ghi riêng "iPhone iOS 15 thật: CHƯA CHẠY" trong sổ nếu chưa kiểm. Các lệnh còn lại: `npx tsc --noEmit`, `npm run build` (gồm `check:runtime`), `npm run check:bundle-secrets`, `npm run test:sites`, các kiểm thử Node liên quan và Playwright (`MCY_PLAYWRIGHT_CHANNEL=msedge`; thêm `--timeout=90000` cho lần khởi động lạnh). Chạy toàn bộ Playwright khi đổi giao diện/luồng. Ghi kết quả.

**3. Web.** `git push origin <nhánh>` (không `--force`). Chờ triển khai READY (Vercel connector: `list_deployments`/`get_deployment`; hoặc trạng thái commit trên GitHub). Kiểm không cookie: trang chủ, `/privacy.html`, `/terms.html`, `/delete-account.html` trả 200 và bundle chứa chuỗi mới. Production/DNS/bảo vệ không đổi trừ khi Owner yêu cầu riêng.

**4. Android.** Ba lệnh, cùng một HEAD:
  1. AAB ký cho Play: `powershell -File scripts/play-release.ps1 -Build -VersionCode <N> -VersionName <x.y.z>` (đặt `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` công khai trong môi trường của tiến trình; mật khẩu khóa chỉ trong biến môi trường của tiến trình, không in, không ghi tệp).
  2. APK máy thử: từ export sạch của HEAD chạy `npm run android:parallel:build`, rồi `adb install -r` (một lần, không gỡ cài đặt, không xóa dữ liệu, không force-stop). Ghi SHA-256.
  3. Kiểm tra gói: khai báo của AAB (package, versionCode, targetSdk 36, `allowBackup=false`) và chữ ký khớp vân tay upload key đã ghi trong sổ.

**5. Google Play.** Tải AAB lên **Internal testing** → tạo bản phát hành (tên = versionName, ghi chú ngắn bằng tiếng Việt cho tester) → xem lại cảnh báo → phát hành. Không đẩy lên Closed/Production nếu Owner chưa yêu cầu. Chụp trạng thái cuối (đã phát hành/đang xem xét). Production/closed test cần quyết định riêng (điều kiện 12 tester × 14 ngày với tài khoản cá nhân).

**6. Ghi sổ và đối chiếu.** Thêm một dòng vào [RELEASE_LEDGER.md](RELEASE_LEDGER.md) (commit, web, APK, AAB, Play, người xác nhận, ghi chú), commit dòng đó. Chạy lại `node scripts/release-sync-status.mjs`: ba nền tảng phải chỉ cùng commit (hoặc ghi rõ ngoại lệ).

## Điều kiện dừng

Dừng và báo Owner (không tự sửa bằng cách bỏ qua) khi: HEAD khác nhánh remote ngoài ý muốn; kiểm thử đỏ; `versionCode` không lớn hơn bản trên Play; vân tay chữ ký khác upload key; Play báo lỗi chặn; bundle quét thấy bí mật; backend chưa sẵn sàng cho tính năng bắt buộc; cần ghi ra ngoài mà chưa được yêu cầu.

## Hoàn tác

- Web: triển khai lại commit trước (Vercel "Redeploy"/`request_rollback` khi Owner yêu cầu) hoặc `git revert` rồi push; không viết lại lịch sử đã push.
- Play: không xóa được bản đã tải lên; phát hành bản mới với versionCode cao hơn chứa bản sửa (hoặc dừng bản phát hành trên Console).
- Máy thử: cài lại APK của đợt trước bằng `adb install -r` (cho phép hạ cấp chỉ với bản debug cùng chữ ký bằng `-d` khi Owner đồng ý).

## Việc chưa có ở đây (ghi để không quên)

- CI: workflow `quality.yml` từng chỉ chạy với pull request và push lên `main`, nên **chưa bao giờ chạy** trên nhánh phát hành (`gh run list` trống, 2026-11-08). Đã sửa cho chạy trên mọi push và gọi `check:ios15`; **lần chạy xanh đầu tiên là 2026-11-08 (commit 716c3e7, 4 lần chạy: 3 lần đỏ vì một test nhạy với tốc độ máy chủ, đã sửa test và thời gian chờ trên CI)**. CI bắt buộc trên GitHub chưa được xác minh là đang bật (kho riêng không có Pro nên không có luật nhánh bảo vệ); script `release-sync-status.mjs` là kiểm tra thủ công chỉ đọc, không phải rào cản thực thi.
- iOS/TestFlight, closed/production track, App Links xác minh, bản đồ mapping/deobfuscation cho Play.

## Bài học đợt 5 (2026-11-04)

- Đẩy một lần hơn ~100 MB có thể bị GitHub trả HTTP 408 dù đã tăng `http.postBuffer`. Đẩy từng lát vào nhánh tạm (mỗi lát ≤ ~6 MB), rồi nối các commit thật lên lát cuối; xóa nhánh tạm sau đó. Đừng commit đầu ra sinh tự động lớn (`analyse/`).
- Khi chạy script dựng trong nền bằng PowerShell và chuyển hướng đầu ra, Gradle daemon giữ handle nên lệnh bọc có thể không bao giờ kết thúc; kiểm tra bằng tệp kết quả (`*.apk`, `*.aab`) thay vì chờ lệnh.
- Tiện ích Chrome có thể đổi tên giữa các phiên: hỏi Owner trình duyệt nào đang đăng nhập Play (tài khoản Tuyên Trịnh) trước khi tải AAB.
