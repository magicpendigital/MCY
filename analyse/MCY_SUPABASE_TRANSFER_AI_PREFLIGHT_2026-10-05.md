# MCY — preflight chuyển org và thử AI

Ngày 05/10/2026, Bangkok · Chỉ xác minh read-only và ghi quyết định; chưa transfer/deploy/enable

## Yêu cầu hiện tại và ranh giới

Owner yêu cầu chuyển project MCY sang MagicpenDigital rồi hoàn thiện/test trang cấu hình Owner và luồng AI thật trong frontend. Đây là yêu cầu staging review mới, supersede quyết định hoãn test live trước đó về ý định triển khai; không phải phê duyệt production, nạp credits, ngân sách không giới hạn hoặc bỏ consent/safety/actor/reviewer gates. Ngân sách OpenRouter vẫn do Owner cấu hình ở provider, không yêu cầu báo USD/chu kỳ qua chat/backend.

Đích chuyển là **project hiện có** `mcy-staging` (`mhumbczqrzutdnraafhs`), từ Nilaza (`drxbmvimiekeoeesgssp`, Free) sang MagicpenDigital (`rzbpjfrndhrtxagpgdre`, Pro). Không tạo/clone project MCY mới, không đổi vùng, không sao chép dữ liệu vào project Nilaza khác. Chuyển tổ chức không biến môi trường MCY staging thành production.

## Bằng chứng hiện tại

| Kiểm tra | Trạng thái | Quan sát và giới hạn |
|---|---|---|
| Source metadata connector | PASS | `mcy-staging`, ACTIVE_HEALTHY, Singapore `ap-southeast-1`, vẫn thuộc Nilaza Free. Health label không chứng minh CPU bình thường. |
| Org đích theo ID Owner cung cấp | PASS | Connector xác nhận MagicpenDigital Pro. `list_organizations` chỉ trả Nilaza, nên danh sách này không chứng minh org đích không tồn tại/không có quyền. |
| Dashboard org đích | PASS | Một project Nilaza Micro hiện có, ref `etfajmrwyywokgafzxsb`; không có MCY. Không thao tác project Nilaza này. |
| Quyền transfer | PASS preflight | Dashboard hiển thị cùng tài khoản đang dùng là Owner tại source và target, mỗi org có một member. MagicpenDigital xuất hiện trong lựa chọn transfer và nút transfer được phép sau chọn. Không ghi email thành viên vào hồ sơ. |
| Chi phí transfer | BLOCKED chờ Owner duyệt | Dialog chính thức báo **tăng USD10/tháng**, do org đích đã có active project. Không tự phát sinh thêm gói Pro USD25; usage/add-on vượt định mức chưa phải trần tổng hóa đơn. |
| Compute | CHƯA THAY ĐỔI | Dialog cho biết có thể nâng miễn phí lên Micro sau transfer; transfer không tự nâng compute. Không đổi compute, spend cap, backup plan hoặc restart. |
| CPU | Cảnh báo high CPU được xác nhận | Dashboard source có banner hiệu năng bị ảnh hưởng do CPU cao. **91%** là số Owner báo, chưa đọc được metric/timestamp trực tiếp; không ghi như số agent đo. |
| Activity lúc 09:20:49 Bangkok | PASS read-only | PID 928289 và 928984, authenticator, cùng fingerprint query `c706ea5842c340c9ddce627cb6bffa31`, query thuộc `mcy_ai_save_owner_config`, state `idle in transaction (aborted)`, không có blocker trong snapshot. Snapshot không đo CPU theo PID hoặc loại trừ mọi nguyên nhân khác. |
| Log 09:05–09:20 Bangkok | PASS aggregate | 45.025 lỗi từ PID 928289 + 44.962 từ PID 928984 = **89.987** lỗi SQLSTATE `40001` trong context đúng Owner save RPC, application `PostgREST 14.5`. Vòng lặp lỗi vẫn còn trong cửa sổ mới; không suy ra chỉ từ timeout client/CDP. |
| Deployed functions | PASS read-only | Chỉ `owner-control-plane` v1 ACTIVE, `verify_jwt=true`; inference chưa deployed. Adapter OpenRouter mới vẫn chỉ local. |
| Dừng backend | BLOCKED chờ Owner duyệt | Đã xin phép dừng riêng hai PID, chỉ nếu ngay trước action vẫn khớp query/log/connection identity; chưa cancel/terminate. Không restart project hoặc dừng session khác. |
| Key/cost controls OpenRouter | CHƯA XÁC NHẬN | Đã hỏi Owner trạng thái key/controls, không đọc/nhập key hoặc token. Không suy ra key thiếu chỉ vì chưa được xác minh. |
| AI live / frontend live review | BLOCKED | Không bật flag, không chọn paid model, không gửi prompt/provider request, không gọi stale-save probe. Còn containment, Owner save repair, migration/actor/consent/safety/reviewer/secret/kill-switch gates. |
| Local release-evidence checker tests | PASS 37/37, exit 0 | `node --test scripts/release-evidence.test.mjs`; fixture tổng hợp, không manifest/approval/deployment của project thật. |
| Runtime integrity | PASS 28 protected files, exit 0 | `npm run check:runtime`; không thay handler/runtime/lock hoặc build APK. |
| Whitespace check | PASS, exit 0 | `git diff --check`, chỉ cảnh báo LF/CRLF; dirty work khác giữ nguyên. |

Log query đầu dùng cột `body` bị backend error. Sau đó query key top-level trả 0, nhưng không dùng 0 làm chứng cứ hết lỗi: `mapKeys(log_attributes)` chỉ ra các key `parsed.*`; query aggregate đúng `parsed.sql_state_code`, `parsed.context` và `parsed.process_id` cho 89.987 lỗi nêu trên. Không lưu log body, query parameters, prompt, Auth UUID, email hoặc credential.

Browser in-app không attach; Chrome tab Owner mở org đích đã dùng được. Một mouse-command timeout xảy ra khi mở Team, nhưng trạng thái mới chứng minh navigation đã hoàn tất, không lặp click. Đây là lỗi điều khiển browser, không root cause CPU/database. Ảnh [preflight transfer](MCY_TRANSFER_PREFLIGHT_2026-10-05.jpg) ghi đúng project/org và cảnh báo phí; chưa bấm Transfer Project.

## Trình tự tiếp tục, không phải bằng chứng đã hoàn thành

1. Sau duyệt containment, kiểm lại PID + backend start + query fingerprint + RPC context/log ngay trước lệnh; terminate chỉ connection còn khớp. Kiểm kết quả và quan sát lỗi mới/CPU; không chạy lại stale-save hoặc broadly restart.
2. Sau duyệt USD10/tháng, transfer đúng project sang MagicpenDigital bằng Dashboard. Verify org/ref/region/project URL, function versions/gates và quyền sau transfer. Không dùng hành động này để tự nâng compute, tắt spend cap hoặc clear release gates.
3. Chuẩn bị forward fix Owner business-conflict `40001 → PT409`, không rewrite migration đã apply; reconcile official ledger và compatibility/review/actor tests trước apply. Kiểm non-retryable 409 + config/audit không đổi + lỗi lặp không quay lại. Hai branch teacher local có cùng lỗi phải sửa/retest trước teacher deployment.
4. Xác minh secret presence mà không đọc value, Owner-managed OpenRouter controls, reviewed consent/privacy/safety, independent reviewer và abuse/role tests. Sau candidate/target approval mới deploy đúng OpenRouter Owner/inference adapters, mở staging gates; test bật/tắt, catalogue/prompt/configuration, learner consent/revocation, safe fallback, quota và frontend bằng tài khoản test/dữ liệu hư cấu. Không phát hành production hoặc mời giáo viên từ kế hoạch này.

Theo `mcy-change-review` và Supabase skill, requested transfer/live-AI scope là R3. Lượt preflight này chỉ đổi hồ sơ/quyết định local và tạo screenshot, không thay handler/schema/runtime hoặc chứng minh runtime/actor/provider PASS mới. HEAD `82458fc219a2231ccac279112dfc0db5447b0edd`, dirty work trước đó giữ nguyên. Không đọc secret file, reset, commit, push, apply migration hoặc deploy.

## Đồng bộ hướng dẫn và kiểm soát

Yêu cầu chuyển staging sang MagicpenDigital supersede chỉ dẫn runbook cũ rằng staging luôn ở Nilaza Free. Metadata hiện vẫn ở source; không ghi transfer đã xong. Release profile vẫn có allowlist rỗng và org staging cũ; cần control review + test exact target mapping trước mọi release candidate sau transfer, không tự allowlist hoặc xóa blocker chỉ vì Owner đã yêu cầu di chuyển. Các pending migration và full actor/reviewer/recovery gates vẫn giữ.

## Nguồn chính thức đối chiếu 05/10/2026

- [Project Transfers](https://supabase.com/docs/guides/platform/project-transfer): điều kiện Owner/member, usage billing về org đích sau transfer, khác biệt quyền/plan; không chuyển region.
- [SQLSTATE 40001 và infinite retries](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b): PostgREST 14 affected; sửa business exception sang non-retryable code và dừng backend đang lặp riêng biệt. Không chọn restart rộng được nêu trong tài liệu vì vượt containment scope MCY.

## Bàn giao hiện tại

Chờ Owner duyệt riêng phí transfer và containment, cùng xác nhận secret/cost-controls OpenRouter. Các câu hỏi đã được gửi, không lặp hỏi hạn mức AI. Hộp thoại đúng đích MagicpenDigital được giữ mở, chưa submit. Khi có trả lời, revalidate ngay trước action thay vì dùng PID/role/quota/billing snapshot cũ.
