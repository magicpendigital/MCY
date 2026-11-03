# Chromium workspace cache: source binding và dry-run

Trạng thái: chờ independent QC và root GO cho provision; **chưa download, install hoặc launch browser**. Không đổi package/lock/system dependencies/profile. Cache cố định ngoài candidate: `D:\Projects\MCY\.vercel\ux-step5-3-browser-tools`.

## Runner delta

`scripts/unit-review-run.mjs` trong candidate gán `PLAYWRIGHT_BROWSERS_PATH` từ `repoRoot` và literal `.vercel/ux-step5-3-browser-tools` sau OS allowlist. Không nhận arbitrary cache path từ môi trường cha. Receipt ghi `FIXED_WORKSPACE_TEST_CACHE_NO_INHERITED_PATH` cùng đường dẫn. `--channel chromium` đã có trong allowlist; Playwright channel này dùng Chromium đầy đủ, phù hợp `--no-shell`. Không thay config, proxy, CSP, cap, cleanup hoặc test assertions.

Runner cũ SHA `6924ae8fa1d04f8dbf13f629df1e1b458732ce702c9f50dcbf00d13c1fdb37bd` → mới **`3f717c23c24391317718a9cc6428499dd9acbb85aa6530e67d348fc232f52c8f`**, 8480 bytes. `node --check .vercel/ux-step5-3-20261018-v1/scripts/unit-review-run.mjs` exit0. Frontend/build unchanged; [transport reset delta](UI-TRANSPORT-RESET-SOURCE-DELTA.vi.md) giữ riêng lịch sử trước đó.

## Dry-run đã thực hiện

CLI installed Playwright **1.61.1**, lệnh child: `node D:\Projects\MCY\node_modules\playwright\cli.js install chromium --no-shell --dry-run`. Child chỉ nhận OS allowlist giống runner, cộng `PLAYWRIGHT_BROWSERS_PATH` cố định ở trên; không envfile, download host override, proxy kế thừa hoặc provider credentials. Timeout60s/output1MiB. Đã đọc source CLI: nhánh dry-run chỉ in registry metadata, không gọi registry.install. Exit0, stderr rỗng; cache chưa tồn tại cả trước/sau. Không thêm `--with-deps`.

Kết quả chính thức từ registry local:

| Artifact | Đích trong cache | Primary download URL |
| --- | --- | --- |
| Chrome for Testing149.0.7827.55 / chromium1228 | `chromium-1228` | `https://cdn.playwright.dev/builds/cft/149.0.7827.55/win64/chrome-win64.zip` |
| FFmpeg1011 | `ffmpeg-1011` | `https://cdn.playwright.dev/dbazure/download/playwright/builds/ffmpeg/1011/ffmpeg-win64.zip` |
| Winldd1007 | `winldd-1007` | `https://cdn.playwright.dev/dbazure/download/playwright/builds/winldd/1007/winldd-win64.zip` |

FFmpeg và Winldd cũng được CLI chọn; không diễn giải lệnh này là chỉ tải một ZIP Chromium. Các fallback chính thức cho hai helper nằm nguyên văn trong [stdout](chromium-provision-dry-run-v1/stdout.log). Không có headless-shell trong plan.

## Pins và evidence

| File | SHA256 |
| --- | --- |
| `node_modules/playwright/cli.js` | `5e79302a6aad7d835d92d5ae6b4244c91cf61b28e94d7917279090e6c231f7a1` |
| `node_modules/playwright/package.json` | `6b840268612656f0639fb7d68782e8353bdf11518589d30ddf66f283c2670ed5` |
| `node_modules/playwright-core/lib/coreBundle.js` | `6be5c2ea035554e9b184b1dbc7aa5e7f1fb428dd1b5c202022858dcfae9bee27` |
| `node_modules/playwright-core/browsers.json` | `ee39bc924bc3d1bd895626c2910f1292d109bbfeeb5abd113acb45e1951cc942` |
| [dry-run receipt](chromium-provision-dry-run-v1/receipt.json) | `0ee8c6a9d77d5039c0da4cca10336742d6d6ea2e11132e2836480852ad2349a8` |
| [dry-run stdout](chromium-provision-dry-run-v1/stdout.log) | `d35b2f3735b28a13d6a67f98ce0b5887fa3acf50ea18f5d0bcae038e26803ff6` |
| [dry-run stderr](chromium-provision-dry-run-v1/stderr.log) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

## Bước đề xuất, chưa được thực hiện

Sau QC/root GO riêng, provision một lần bằng cùng CLI/safe OS environment và cache cố định, args `install chromium --no-shell` (không `--with-deps`, không package manager). Giới hạn child300s/output4MiB; giữ stdout/stderr/exit và hash artifacts tải được, không tự retry khi fail/unknown. Không tự chạy suite trong bước provision. Sau khi root kiểm artifact và cấp invocation GO, mới dùng reviewed runner `--project egress-negative`, rồi suite `--project unit-review-ui --channel chromium` theo thứ tự root giao. Kết quả Edge/Chrome cũ vẫn FAIL; không suy rằng provision này sẽ giải thích hoặc loại bỏ 71 CONNECT.
