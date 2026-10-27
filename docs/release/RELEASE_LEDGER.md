# Sổ phát hành đa nền tảng

Mỗi dòng = một đợt phát hành. Thêm dòng mới ở cuối mỗi đợt (xem [CROSS_PLATFORM_RELEASE.md](CROSS_PLATFORM_RELEASE.md)). `scripts/release-sync-status.mjs` đọc bảng này để gợi ý `versionCode` kế tiếp, nên **giữ đúng định dạng**: cột đầu là số `versionCode`, các giá trị rỗng ghi `—`.

| versionCode | versionName | Ngày | Commit (nguồn) | Web (Preview) | APK máy thử | AAB / Play | Ghi chú |
|---|---|---|---|---|---|---|---|
| 1 | 1.0.0 | 2026-10-25 | 8e8afa5 | cf8fd52 trên miền review (23/10) | `.mcydebug` từ 8febda9 (Owner báo chạy ổn) | `mcy-8e8afa5-v1.aab` · SHA-256 FA13D9EF…EF919 · Internal testing, đã phát hành | Bản đầu lên Play; chưa có tester |
| 2 | 1.0.0 | 2026-10-26 | 360115a | — (ghi nhận trước đợt đồng bộ) | — | `mcy-360115a-v2.aab` · 5,302,152 byte · SHA-256 B189C68B…691204 · Internal testing, đã phát hành | Thêm đăng nhập email + mật khẩu |

Vân tay chứng chỉ upload key (không đổi): SHA-256 `5B:4B:1D:C4:8B:21:04:29:21:08:2F:DC:6A:0F:B2:DE:1E:2B:06:66:2F:F0:6A:16:CB:15:51:2B:01:AA:0C:74`.
