# Probe source: browser baseline so với app đóng

SOURCE ONLY, chờ independent QC/root invocation GO. Không đổi verdict [managed Chromium trước](MOCK-UI-EXECUTION-v4.json): 15 assertions PASS/process FAIL với81 CONNECT bị chặn. Không retry suite hoặc nới egress.

## Files riêng và pins

Tất cả bản diagnostic ở `diagnostic-source/`, ngoài candidate. Candidate runner/proxy/negative hiện nguyên byte `3f717c23…52c8f` / `a525750c…bcc9d` / `e63da85e…2619aa`. Có edit tạm runner/proxy trước khi root yêu cầu copies; đã restore và đối chiếu exact SHA trước khi thông báo được chạy regression; không invocation trong khoảng edit.

| Bản source | Bytes | SHA256 |
| --- | ---: | --- |
| [runner copy](diagnostic-source/unit-review-run.mjs) | 8173 | `12bb5db218780512bce7ea272b6403c9dabcdc8a8652d133d558c8f337957f00` |
| [proxy copy](diagnostic-source/unit-review-egress-guard.mjs) | 5600 | `f3072899263205ba212646d597e75eac4baecca93a3a36c12c4bf897068adb88` |
| [probe](diagnostic-source/unit-review-browser-diagnostic.mjs) | 6280 | `6cafe6fb7c34c4d8510de122aed9999b83c33c3db7ec92f73df1985d0052f313` |

[Static parse receipt](DIAGNOSTIC-SOURCE-PARSE.json): từng `node --check` exit0. Một lệnh hash ban đầu dùng wildcard với `-LiteralPath` bị lỗi; đã thay bằng enumeration và hash từng file. Không test/import/server/browser invocation.

## Thiết kế bounded

Runner copy chỉ chấp nhận `--project browser-baseline-diagnostic --channel chromium`, không list/project khác. Safe OS allowlist, fixed workspace browser cache, `.invalid` config, proxy4255 và output4MiB giữ nguyên. Timeout120s, cleanup owned child tree/deadline/listener checks sao chép từ runner đã duyệt. Không nhận arbitrary cache path hoặc browser executable. Output nằm riêng `diagnostic-results/`.

Probe launch đúng một managed Chromium headless, một context serviceWorkers blocked, tối đa3 page nối tiếp (đóng page trước khi tạo page sau). Proxy chỉ forward đúng HTTP127.0.0.1:4253; CSP/browser flags không nới. Dùng server `fictional_rehearsal`, privateRoot ignored riêng, kiểm bundle chứa fixture `.invalid` marker. Không đọc bootstrap file/capability, không mở actual canonical.

- A: `about:blank`, quan sát4s.
- B: exact local request được Playwright fulfill bằng HTML trung tính không script/resource, quan sát4s; không thêm server route.
- C: workspace hiện có; intercept toàn bộ review API trả503 để giữ closed state, đợi alert và xác nhận không có list/textbox, quan sát4s. Không account/lease giả được cấp.

Navigation/closed-state waits có deadline10s riêng;4s là cửa sổ quan sát sau khi page sẵn sàng. Exception chỉ ghi boolean executionError/cleanupError; không export exception message/stack, screenshot, trace hoặc DOM. Browser startup và cleanup có CONNECT bucket riêng.

## Dữ liệu được ghi

`page.on(request)` chỉ tăng `{sanitized category}:{resource type}` counts theo phase; không ghi URL/hash/path/query/header/body. Proxy copy thêm callback CONNECT optional mặc định off. Callback chỉ nhận object đã lọc từ server: category trong fixed suffix list `google.com`, `gvt1.com/gvt2.com`, `gstatic.com/googleapis.com`, `microsoft.com/bing.com`, `youtube.com/ytimg.com`, `supabase.co`, `.invalid`, hoặc127.0.0.1. Host khác chỉ category `unknown` cùng SHA256 hostname lowercase; không raw hostname. So suffix có boundary dấu chấm, không substring matching. Callback không nhận request/socket. Count bucket giới hạn64 keys rồi gộp overflow; không tăng phạm vi ghi log.

Counts phân theo thời điểm event, **không chứng minh nhân quả theo phase**: browser process background request có thể đến muộn. Chênh giữa page request counts và CONNECT counts là evidence để root phân tích, không tự quy81 CONNECT cho browser hay app.

Proxy deny counter, cap,403 và status `FAIL_UNEXPECTED_EGRESS_OR_CAP` giữ nguyên. Callback exception không thay deny handling. Probe có unexpected request vẫn exit1/FAIL; dù không có request bất ngờ, verdict chỉ diagnostic và không clear UI failure.

## Invocation đề xuất, chưa chạy

Từ repo root: `node analyse/ux-step5-3-2026-10-18/diagnostic-source/unit-review-run.mjs --project browser-baseline-diagnostic --channel chromium`. Chỉ sau QC/root GO, không chạy đồng thời với server/proxy4253/4255 của regression/Owner. Receipt gồm phase counters, counters-only proxy receipt và runner cleanup; không mở rộng diagnostic khi thiếu evidence mà chưa có GO mới.
