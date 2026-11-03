# MCY — domain review và DNS, 09/10/2026

**Readback trong lượt implementation 10/10:** Vercel connector bị 403 với scope này; CLI đúng team/project đọc được cả hai GET, exit0 (worker cập nhật CLI có cảnh báo timeout/EPIPE, payload API vẫn nhận đủ). `misconfigured=false`, CNAME và nameservers giữ đúng giá trị, conflicts empty; domain `verified=true`, Preview branch không đổi. `curl HEAD` với TLS bình thường vẫn lỗi handshake và web fetch không truy cập được; HTTPS chưa xác minh, không kết luận certificate lỗi. Không đổi DNS/binding hoặc deploy local candidate mới. [Bản triển khai local](MCY_AI_FLOW_IMPLEMENTATION_2026-10-10.md).

## Readback sau Owner cấu hình — 10/10/2026

**DNS PASS:** public resolver `1.1.1.1` trả CNAME `f65143a73136a0ac.vercel-dns-017.com` (TTL 300). Vercel config `configuredBy=CNAME`, `misconfigured=false`, conflicts empty; nameservers vẫn `amber.ns.cloudflare.com` / `clint.ns.cloudflare.com`. Domain readback `verified=true`, `gitBranch=codex-mcy-p1-preview`, không redirect. Không sửa DNS/domain hoặc deploy trong lượt này.

**HTTPS CHƯA XÁC MINH:** Node/curl từ môi trường kiểm tra không hoàn tất TLS handshake; web fetch cũng không xác nhận được. Chưa đủ bằng chứng kết luận certificate sai hoặc TLS đã hoạt động. Giữ kiểm HTTPS hợp lệ và hành vi Preview/Auth redirect thực tế trong nghiệm thu. Latest Ready commit bên dưới là snapshot 09/10, không được liệt kê lại ngày 10/10. [Đánh giá AI/UX](MCY_AI_FLOW_UX_REASSESSMENT_2026-10-10.md) phân biệt cấu hình domain với readiness AI.

## Snapshot và hướng dẫn ngày 09/10 (lịch sử)

Owner chọn **“Dùng bản mới nhất để review”**. Vercel đã nhận `motchutyoga.magicpendigital.com` vào project MCY `prj_gTioLZWajGyQMkaPS1qapwoBOUnA`, team Magicpen's Projects `team_BGXDJYYYe7LSDoGDjWRBFlJH`, **Preview branch `codex-mcy-p1-preview`**. Readback `verified=true` chỉ chứng minh ownership, không phải DNS/TLS.

Latest Ready deployment trên branch khi kiểm tra: `dpl_6N2BWPT3yKTfWiKEow6ArVNUpfvo`, [mcy-r08il6elv-magicpens-projects.vercel.app](https://mcy-r08il6elv-magicpens-projects.vercel.app), commit `82458fc219a2231ccac279112dfc0db5447b0edd`. Branch binding theo deployment Ready mới tiếp theo. Local dirty changes chưa được deploy; không gọi domain này là bản source local đã được release. Existing Production từ `main`/`992ccd8...` và `mcy-six.vercel.app` không đổi.

## Bản ghi cần lưu tại Cloudflare

[Cloudflare Dashboard](https://dash.cloudflare.com/) → `magicpendigital.com` → DNS → Records → Add record:

| Trường | Giá trị |
|---|---|
| Type | `CNAME` |
| Name | `motchutyoga` |
| Target | `f65143a73136a0ac.vercel-dns-017.com` |
| TTL | `Auto` |
| Proxy status | **DNS only** (mây xám) |

Target trên là **rank-1 project-specific recommendation** Vercel trả về sau khi gắn domain. Không dùng snapshot trước khi gắn hoặc tự chọn A record. Không đổi nameservers, MX/email hoặc các host khác.

Nameservers live: `amber.ns.cloudflare.com`, `clint.ns.cloudflare.com`. Public resolver `1.1.1.1` và authoritative lookup chưa thấy subdomain; Vercel `misconfigured=true`, CNAME/A empty, conflicts empty. Local resolver từng trả A khác nên không dùng kết quả local đó làm bằng chứng authoritative. Chưa có Cloudflare write hoặc chứng nhận HTTPS thành công trong lượt này; không có connector Cloudflare usable.

Sau khi Owner lưu record: kiểm tra public/authoritative CNAME, Vercel config `misconfigured=false`, TLS hợp lệ và Preview branch binding. Giữ deployment protection hiện tại; không bypass hoặc tắt SSO để thử. SSL/DNS propagation chưa có ETA được cam kết.

[Vercel subdomain documentation](https://vercel.com/docs/domains/working-with-domains/add-a-domain) hướng dẫn thêm domain trước và dùng DNS recommendation của project. Domain là review staging theo lựa chọn hiện tại; promotion production cần một quyết định riêng.
