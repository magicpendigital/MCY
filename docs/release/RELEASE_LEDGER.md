# Sổ phát hành đa nền tảng

Mỗi dòng = một đợt phát hành. Thêm dòng mới ở cuối mỗi đợt (xem [CROSS_PLATFORM_RELEASE.md](CROSS_PLATFORM_RELEASE.md)). `scripts/release-sync-status.mjs` đọc bảng này để gợi ý `versionCode` kế tiếp, nên **giữ đúng định dạng**: cột đầu là số `versionCode`, các giá trị rỗng ghi `—`.

| versionCode | versionName | Ngày | Commit (nguồn) | Web (Preview) | APK máy thử | AAB / Play | Ghi chú |
|---|---|---|---|---|---|---|---|
| 1 | 1.0.0 | 2026-10-25 | 8e8afa5 | cf8fd52 trên miền review (23/10) | `.mcydebug` từ 8febda9 (Owner báo chạy ổn) | `mcy-8e8afa5-v1.aab` · SHA-256 FA13D9EF…EF919 · Internal testing, đã phát hành | Bản đầu lên Play; chưa có tester |
| 2 | 1.0.0 | 2026-10-26 | 360115a | — (ghi nhận trước đợt đồng bộ) | — | `mcy-360115a-v2.aab` · 5,302,152 byte · SHA-256 B189C68B…691204 · Internal testing, đã phát hành | Thêm đăng nhập email + mật khẩu |
| 3 | 1.0.1 | 2026-10-28 | 2a0cce6 | `dpl_AzeQjDWSnweqztRyE8Tou3z8Pz6B` READY (alias motchutyoga.magicpendigital.com); bundle live có chuỗi mới | `mcy-parallel-2a0cce6.apk` · 6,528,186 byte · SHA-256 1e36a50b…fed93 · đã cài 28/10 09:38 (`adb install -r` Success; chưa mở thử) | `mcy-2a0cce6-v3.aab` · 5,323,696 byte · SHA-256 3EB4477D…DDB9C · Internal testing, đã phát hành 28/10 01:15 (Play: 1 cảnh báo thiếu tệp giải mã, không chặn) | Tìm nhanh, luồng khách rút gọn, Hành trình mới, ảnh WebP; bản native không chứa media nháp (−2 MB). Lịch sử cục bộ đã viết lại trước khi push để không đưa 100 MB PNG lên remote |

Vân tay chứng chỉ upload key (không đổi): SHA-256 `5B:4B:1D:C4:8B:21:04:29:21:08:2F:DC:6A:0F:B2:DE:1E:2B:06:66:2F:F0:6A:16:CB:15:51:2B:01:AA:0C:74`.
