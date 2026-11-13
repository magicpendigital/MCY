<!-- plan-template v1 -->
# Kế hoạch — Tái cấu trúc repo và hợp nhất nhánh về `main`

Trạng thái: đã duyệt (2026-11-13, Owner chọn: giữ Preview, đóng băng nhánh cũ, lưu trữ rồi gỡ `analyse/`, giao mca tách tệp điểm nóng từng bước). Phần cục bộ đã làm; push chờ Owner làm 3 bước Vercel.

## 1. Mục tiêu
`main` chỉ có 2 commit khởi tạo (21/09); 118 commit thật nằm ở `codex-mcy-p1-preview`. Owner yêu cầu đưa mã thật về `main`, chuẩn hoá tên nhánh chính, không làm hỏng chức năng hay bản đã deploy, và tái cấu trúc repo theo quy trình mca để nhiều agent làm song song, kiểm nhanh, ít lỗi.

## 2. Tiêu chí xong
- `main` = toàn bộ lịch sử `codex-mcy-p1-preview` (fast-forward, không merge commit, không mất commit); `git rev-list --count main..codex-mcy-p1-preview` = 0.
- Sau khi push: `motchutyoga.magicpendigital.com` vẫn là Preview, build từ `main`, có biến Supabase; Production (`mcy-six.vercel.app`) không đổi.
- `npm run check:quick`, `npm run test:unit`, `npm run check:ios15` xanh; điểm `mca audit_parallel` tăng so với 7/20.
- `AGENTS.md` ≤ 20 KB, không mất quy tắc bền (chuyển nguyên văn sang `docs/`).

## 3. Phạm vi sửa
- Quy trình: `AGENTS.md`, `CLAUDE.md`, `PLAN.md`, `plans/`, `scripts/check-plan.mjs`, `scripts/run-suite.mjs`, `package.json` (scripts), `.github/workflows/quality.yml`, `tests/agents-size.test.mjs`, `docs/quality/TASK_LIFECYCLE.md`, skill `mcy-change-review`, `mcy-release-sync`, `docs/release/CROSS_PLATFORM_RELEASE.md`.
- Chuyển nguyên văn: `docs/product/PRODUCT_DECISIONS.md`, `docs/runtime/RUNTIME_CONTRACT.md`.
- Gọn kho: gỡ 4.176 tệp `analyse/` (giữ ở tag `archive/analyse-2026-11-13`), 23 script dùng một lần → `scripts/archive/`, 3 spec Playwright ghi ảnh vào `test-results/screenshots/`.
- Mức rủi ro cao nhất: R3 (đổi cổng kiểm CI, quy trình phát hành và nhánh deploy).
- Hiện trạng: commit `7a90a21`; checkout chính có 4 PNG trong `analyse/ux-ai-2026-10-10/` bị test ghi đè và `supabase/.temp/` chưa theo dõi — không đụng.

## 4. Cố ý không đụng
- Mã ứng dụng (`src/`), runtime bảo vệ, migration, nội dung `content/` (hash là phiên bản duyệt), các tệp `analyse/` mà `content/` còn trỏ tới.
- Tài liệu lịch sử nhắc `codex-mcy-p1-preview` (`analyse/`, `docs/status/`, INC-001 trong `KNOWN_INCIDENTS.md`): đúng tại thời điểm viết.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| Vercel project `mcy` | nhánh Preview `codex-mcy-p1-preview` → `main` | domain chính, biến Supabase Preview | `list_project_domains` (gitBranch), `filter_project_envs` (2 biến chỉ gắn nhánh cũ), Production branch hiện là `main` |
| Supabase Auth redirect | alias nhánh `mcy-git-main-…` mới | đăng nhập trên domain chính không đổi | allowlist có alias nhánh cũ (tài liệu 2026-10-11) |
| CI | 17 bước → `npm run test:unit`; `test:sites` giữ bước riêng sau build; thêm `check:plan` không chặn | cùng tập lệnh | so danh sách cũ/mới (review độc lập xác nhận) |
| Android/Play | không đổi | app đóng gói `dist/client`, không tải URL web | `capacitor.config.ts` không có `server.url` |
| Agent | AGENTS.md nhỏ hơn, PLAN.md đầu phiên | quy tắc bền giữ nguyên văn ở `docs/` | `tests/agents-size.test.mjs` kiểm mốc và liên kết |

## 6. Bảo mật
- Không đọc/chép giá trị biến môi trường (Vercel trả mã hoá; Owner tự nhập trên dashboard). Không thêm thư viện. Không đụng dữ liệu staging.

## 7. Hoàn tác
- Nhánh: `main` cũ là `992ccd8`; `codex-mcy-p1-preview` giữ nguyên trên remote. Vercel: đặt lại domain về nhánh cũ.
- `analyse/`: `git checkout archive/analyse-2026-11-13 -- analyse/<path>`. Quy trình: revert commit tái cấu trúc.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Fast-forward `main` cục bộ, sửa tài liệu trỏ nhánh | Claude | S |
| 2 | Quy trình mca + vòng kiểm nhanh + gọn kho, commit trên nhánh `claude/mca-plugin-repo-restructure-a79255` | Claude | M |
| 3 | Review chéo độc lập (Codex qua mca) | mca | S |
| 4 | Vercel → Settings → Environments → Production: đổi Branch Tracking sang `production` (nhánh chưa có); Domains: sửa `motchutyoga.magicpendigital.com` Git Branch = `main`; Environment Variables: thêm `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` cho Preview, nhánh `main` (cùng giá trị nhánh cũ) | Owner | S |
| 5 | Fast-forward `main` tới commit bước 2, push `main` + tag lưu trữ; kiểm deploy READY và domain trả bản mới | Claude, khi Owner bảo | S |
| 6 | Chuyển checkout chính `D:/Projects/MCY` sang `main`: giữ riêng việc dở (4 PNG `analyse/ux-ai-2026-10-10/` do test ghi, `supabase/.temp/`), `git switch main`, rồi chuẩn hoá xuống dòng một lần: `git ls-files --eol` lấy các tệp `w/crlf` có `attr/text eol=lf`, xoá và `git checkout --` lại (chỉ các tệp không có thay đổi thật) | Claude, khi Owner bảo | S |
| 7 | Tách tệp điểm nóng — kế hoạch riêng `plans/backlog/split-hot-files.md` | mca | L |

## 9. Cách thử
1. Mở `PLAN.md`: thấy ngay đang ở đâu, chờ gì.
2. Chạy `npm run check:quick` (vài giây) và `npm run test:unit`.
3. Sau bước 5: mở `motchutyoga.magicpendigital.com`, đăng nhập, thấy bản mới nhất; Vercel ghi deployment Preview nhánh `main`.

## 10. Lệnh kiểm
- `npm run check:quick`, `npm run test:unit`, `npm run check:ios15`, Playwright cho 3 spec đổi đường dẫn ảnh, `mca audit_parallel`.

## 11. Rủi ro còn lại
- Push `main` trước khi Owner đổi Production Branch sẽ tạo deployment Production thiếu biến Supabase trên `mcy-six.vercel.app` — vì vậy bước 5 chỉ chạy sau bước 4.
- Lịch sử git vẫn chứa 378 MB `analyse/` (gỡ khỏi cây không làm nhẹ bản clone đầy đủ; muốn nhẹ hẳn phải viết lại lịch sử — không làm).
- `check:plan` chặn ở máy (`npm test`, `check:quick`) nhưng trong CI chỉ cảnh báo (`continue-on-error`), để `PLAN.md` cũ không chặn bản vá khẩn.
- Checkout Windows cũ (`core.autocrlf=true`) còn tệp CRLF; sau khi sang `main` có thể hiện "đã sửa" giả. Bước 6 làm lại một lần (xem dưới).
- Tag `archive/analyse-2026-11-13` mới có ở máy này; phải push cùng `main` ở bước 5, nếu không các liên kết lịch sử trong `docs/status/` không khôi phục được ở máy khác.

## 12. Cần duyệt
- Bước 4 (Owner tự làm trên Vercel) và lệnh push `main` + tag ở bước 5.
- Thêm alias `mcy-git-main-…` vào Supabase Auth redirect allowlist nếu cần.

## Progress
- [x] 1 Fast-forward cục bộ và sửa tài liệu
- [x] 2 Quy trình + kiểm nhanh + gọn kho (commit `fc547b8`, `3dd4b4d`, sửa sau review)
- [x] 3 Review chéo (subagent độc lập: 2 lỗi chính đã sửa — cảnh báo push `main` trước khi đổi Vercel, khôi phục nguyên văn mục Release evidence; job mca Codex đang chờ worker)
- [ ] 4 Owner đổi Vercel
- [ ] 5 Push `main`
- [ ] 6 Checkout chính sang `main`
