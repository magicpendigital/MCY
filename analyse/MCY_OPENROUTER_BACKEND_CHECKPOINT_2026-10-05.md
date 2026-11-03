# MCY — checkpoint backend OpenRouter

Ngày 05/10/2026 · Phạm vi: source local và kiểm thử offline · Risk tier R3

## Kết quả và quyết định Owner

Backend Supabase local đã chuyển từ Vercel AI Gateway sang OpenRouter. **Chưa deploy, chưa xác nhận kết nối live, inference vẫn giữ tắt.** Owner tự tạo key MCY riêng mới và cấu hình ngân sách trực tiếp trên OpenRouter. Không yêu cầu Owner gửi hạn mức USD/chu kỳ reset qua chat, không thêm bộ quản lý ngân sách tiền vào backend hoặc trang Owner.

Backend vẫn giữ giới hạn lượt/token, usage metadata, xác thực, consent và kill switch. Đây là kiểm soát lạm dụng/an toàn, không thay thế ngân sách do OpenRouter quản lý. `MCY_AI_SPEND_CONTROL_APPROVED` hiện có là xác nhận vận hành sau khi Owner quản lý kiểm soát bên ngoài; flag không lưu/kiểm chứng hạn mức tiền và không tự chứng minh provider đã áp dụng ngân sách.

Trong lượt này không đọc credential/token thật, tạo/cấu hình key, nạp credits, chọn model live, gọi provider, sửa staging/DB/JWT/ACL, terminate PID, commit, push hay deploy. Không kiểm tra tài khoản/key policy ngoài hệ thống; không suy ra tài khoản Owner chưa có key. Working tree đã có nhiều thay đổi chưa commit trước lượt này; chúng được giữ nguyên, không coi toàn bộ diff là công việc OpenRouter.

## Source đã điều chỉnh

- `_shared/openRouter.ts`: catalogue có xác thực theo key `/api/v1/models/user`, lọc text và các parameter bắt buộc; kiểm tra ID/pricing, bỏ router aliases và bản ghi lỗi/trùng. JSON đọc có giới hạn byte và thời gian, lỗi trả về được làm sạch.
- `_shared/aiAssistant.ts`, `aiGates.ts`, `mcy-ai-assistant/index.ts`: chỉ đọc `OPENROUTER_API_KEY`, gọi endpoint HTTPS cố định `/api/v1/chat/completions`; strict JSON schema `{ reply }`, không streaming, không tự retry. Reject redirect và lỗi provider, giữ nguyên actor/consent/admission/usage checks.
- `_shared/ownerControlPlane.ts`, `owner-control-plane/index.ts`: catalogue dùng OpenRouter; trả `provider: openrouter` và `providerKeyConfigured` cho Owner đã được server xác thực, không trả key. `gatewayKeyConfigured: false` giữ tương thích client cũ, không ám chỉ key OpenRouter là key Gateway.
- `src/staff/owner.tsx`: nhãn provider/khóa và xác nhận vận hành thay vì nhập ngân sách; chỉ nhận catalogue/enable gate nếu server xác nhận provider OpenRouter. Response Gateway cũ không được hiển thị như kết nối mới. Các thay đổi request isolation có sẵn trước lượt này được bảo toàn.
- `_shared/aiGateway.ts` và `test:ai-gateway`: compatibility aliases gọi implementation/test OpenRouter; không còn URL Gateway trong adapter active, không fallback tới key Gateway. Tệp lịch sử `index.previous.ts` không phải adapter active và không được chỉnh.
- `scripts/check-client-bundle-secrets.mjs`, `playwright-test-environment.mjs`: thêm kiểm tra mẫu secret OpenRouter và loại key server khỏi fixture UI. Fixture vẫn dùng backend `.invalid`, key hư cấu và managed server teardown, không `.env.local`/staging.
- AI/catalogue/Owner/actor-runner/UI tests được cập nhật; thêm `tests/client-bundle-openrouter-secret.test.mjs` dùng canary hư cấu và temp directory có cleanup giới hạn chính xác. Không thêm dependency.
- `AGENTS.md`, `supabase/README.md` và implementation plan cập nhật quyết định mới, phân biệt source local với hệ thống đã deploy. Các mô tả Gateway/ngân sách có ngày cũ là lịch sử đã được supersede.

## Bằng chứng thực chạy

| Kiểm tra | Kết quả | Giới hạn bằng chứng |
|---|---|---|
| `npm run test:ai-openrouter` | PASS 24/24 | Mock provider/auth/RPC; có legacy-key denial, consent/quota, strict request, lỗi HTTP không retry, response bound/timeout và canary secret scanner. |
| `npm run test:owner-control-plane` | PASS 9/9 | Handler offline; không phải live Owner RPC. |
| `npm run test:owner-actor-matrix-offline` | PASS 19/19 | Vai trò/HTTP hư cấu, không đọc token hoặc gọi staging. |
| `npm run test:playwright-environment` | PASS 1/1 | Canaries chứng minh fixture chặn staging/key đã biết, không phải RLS/auth evidence. |
| Focused Edge Playwright, grep `owner\|Owner\|OpenRouter` | PASS 12/12, exit 0 | Fixture `.invalid`; bao gồm legacy provider, key có nhưng gate đóng và account-switch isolation. |
| Full `npm run test:runtime`, Edge | FAIL, exit 1: 80 PASS / 1 FAIL | `tests/mobile-runtime.spec.ts:82`: quán tính Carousel không tăng `scrollLeft` sau release (expected >60, observed 60, timeout 2 s). Không sửa runtime/test này trong lượt chuyển provider; chưa xác định nguyên nhân. |
| Rerun riêng ca Carousel, Edge, 1 worker | PASS 1/1, exit 0 | Một lần chạy lại có giới hạn, không thay source/test. Không suy ra root cause hoặc chuyển kết quả full suite thành PASS. |
| Shared-handler TypeScript | PASS | `tsc --ignoreConfig --noEmit --strict ...` trên OpenRouter/AI/Owner shared source; không phải Deno adapter runtime. |
| `npm run build` | PASS, exit 0 | Runtime integrity 28 protected files, TypeScript, Vite 584 modules và Sites preparation. Learner entry 542.70 kB raw / 167.03 kB gzip; cảnh báo >500 kB còn mở. |
| `npm run check:bundle-secrets` | PASS, 15 text files | Build mới; chỉ các mẫu scanner đã biết, không chứng minh mọi secret đều vắng mặt. |
| `npm run test:sites` | PASS 4/4 | Local build adapter, không hosted deployment. |
| `node --test scripts/release-evidence.test.mjs` | PASS 37/37 | Test checker trên fixture tổng hợp; không tạo manifest/approval hoặc cấp quyền release cho source này. |
| `git diff --check` | PASS | Có cảnh báo LF/CRLF, không đổi runtime lock hoặc Windows ACL. |

Canonical build và Playwright mặc định ban đầu gặp Windows sandbox `EPERM` ở `.vite-temp`. Build đã chạy lại PASS với quyền ghi workspace phù hợp. Playwright chạy lại bằng Edge, Vite config loader `runner` và quyền ghi local; không dùng server unmanaged hoặc thay đổi bảo mật Supabase. Full Edge suite kết thúc exit 1 sau 3 phút, 80/81 ca PASS; chỉ ca Carousel fail. Ca đó chạy riêng một lần PASS, exit 0 sau 47.9 s; nguyên nhân chưa được chứng minh và full suite vẫn ghi FAIL. Một lượt actor-runner offline chạy trong khi test contract đang được chỉnh bị 2 assertions fail; chạy lại sau khi hoàn tất source cho kết quả 19/19, exit 0. Không lấy kết quả bị lỗi/hang làm PASS.

## Focused threat review và gate chưa đạt

- Secret chỉ được adapter backend đọc; endpoint cố định, không follow redirect, không trả key/body lỗi provider cho client. Scanner/fixture có canary nhưng không phải chứng nhận secret-free toàn hệ thống.
- Giữ đúng staging project, cả hai flag server, key hiện diện và cấu hình Owner enabled; verified JWT/active role, current consent và server usage admission vẫn cần thiết. Key hiện diện là cấu hình, **không phải** bằng chứng key hợp lệ hoặc kết nối thành công. UI không coi response Gateway cũ là OpenRouter.
- Routing bắt buộc `require_parameters: true`, `data_collection: deny`, `zdr: true`, `allow_fallbacks: false`; thiếu endpoint tương thích thì fail closed, không tự hạ privacy/output requirements. Catalogue metadata không tự chứng minh có endpoint ZDR khả dụng cho request thật.
- Chỉ current-turn input, không serialize hội thoại cũ; không log prompt/message/output/raw check-in. Identifier/medical-pattern checks là heuristic, không chứng minh đã loại mọi PII, prompt injection hay nội dung y khoa nguy hiểm. Privacy notice/affirmative consent UX/safety chuyên môn và reviewer độc lập vẫn cần.
- Strict schema đi kèm runtime output validation; giới hạn output token và body/timeouts, lỗi HTTP không retry. Provider-error tests không chứng minh ngân sách được enforce, metering đầy đủ cho mọi lỗi hoặc live kill switch hoạt động.
- Không sửa/applied migration, grants, Supabase JWT verification hoặc legacy Supabase server-key integration trong lượt này. Owner business-conflict `40001`/PostgREST retry-loop vẫn là blocker đã ghi ở [checkpoint Owner](MCY_OWNER_ACTOR_CHECKPOINT_2026-10-04.md); không chạy lại stale-save probe hoặc dừng backend bằng PID cũ.
- **CHƯA CHẠY:** Deno adapters, Supabase local-stack integration/effective privileges, role-bound staging/consent/abuse tests cho adapter mới, provider live catalogue/inference/limits, Owner account-key/data policy inspection, live kill-switch/restore rehearsal, physical Android/iOS và accessibility chuyên sâu. Full UI tests không thay thế các kiểm tra này.
- **CHƯA ĐẠT:** independent security/privacy/safety review, release-candidate evidence/approval và coordinated staging rollout. Source đổi provider là R3 theo `mcy-change-review`; không expose learner inference khi các gate này còn mở. Không có deployment mới trong lượt này để coi là đã rollback-tested.

## Bước tiếp theo

Owner chuẩn bị key MCY mới, tự cấu hình hạn mức trong OpenRouter, rồi lưu key ở **Supabase staging → Edge Functions → Secrets**, tên `OPENROUTER_API_KEY`; không gửi qua chat, không đặt trong biến `VITE_*`, client hoặc APK. Không mở hai flag AI chỉ vì đã lưu key. Sau khi đủ gate và có phê duyệt riêng, thực hiện rollout staging có kiểm thử role/consent/kill switch bằng dữ liệu hư cấu; source local này chưa phải bản đã kết nối live.

## Tài liệu đối chiếu ngày 05/10/2026

- [OpenRouter catalogue theo key](https://openrouter.ai/docs/api/api-reference/models/list-models-filtered-by-user-provider-preferences-privacy-settings-and-guardrails), [model schema](https://openrouter.ai/docs/guides/overview/models).
- [Structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs), [provider selection/privacy routing](https://openrouter.ai/docs/guides/routing/provider-selection).
- [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets). Đây là tài liệu platform, không phải bằng chứng tài khoản staging/key đã được cấu hình.
