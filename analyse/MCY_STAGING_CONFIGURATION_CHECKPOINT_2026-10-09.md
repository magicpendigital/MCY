# MCY — staging configuration checkpoint, 09/10/2026

**Latest actual operation:** Owner repair applied selectively, official ledger 19 applied/four pending; deployed PT409 readback and live role-bound HTTP PASS 17/17. Docker actual-schema concurrency/HTTP rehearsal PASS 8/8 and cleanup verified. Positive live save remains unexecuted after automatic approval review rejected its version/audit write side effect. Domain attached to the newest Ready Preview branch, DNS record still pending. [Acceptance](MCY_OWNER_REPAIR_ACCEPTANCE_2026-10-09.md), [DNS](MCY_DOMAIN_REVIEW_DNS_2026-10-09.md). Earlier snapshots below are historical, not current unapplied state.

## Kết quả

**Superseding update sau Owner login:** official CLI 2.119.0 migration list đã PASS, exit 0 qua authenticated session của CLI: 18 aligned, zero remote-only, five pending; [receipt](MCY_CLI_MIGRATION_LEDGER_2026-10-09.json). Agent R3 độc lập do Owner chọn đã hoàn tất, không phát hiện lỗi cần sửa và rerun PASS 33/33; [review](MCY_OWNER_REPAIR_INDEPENDENT_REVIEW_2026-10-09.md). Test SQL script hiện chạy cả minimal/full local-source baseline PASS 19/19. Các ghi chú thiếu CLI auth/full local replay/independent source review phía dưới là snapshot trước cập nhật này; Owner không cần login lại. Actual Supabase concurrency/HTTP actors và rollout controls vẫn mở; chưa apply/deploy/enable.

Owner xác nhận đã lưu key OpenRouter riêng cho MCY, hai flag đang `false`, project đã chuyển sang MagicpenDigital. Đây là xác nhận của người cấu hình; lượt này không đọc secret value hoặc gọi provider để kiểm tra key.

Fresh Supabase connector readback lúc khoảng 00:00–00:03 Bangkok xác nhận:

- `mcy-staging` / `mhumbczqrzutdnraafhs` thuộc `rzbpjfrndhrtxagpgdre`, Singapore `ap-southeast-1`, trạng thái `ACTIVE_HEALTHY`. Health label không chứng minh CPU, billing hoặc release readiness.
- Không có connection `authenticator` mang query Owner-save trong snapshot. Không chạy lại stale-save probe hoặc terminate session.
- Owner save RPC vẫn có definition MD5 `1591e77afdfc0dacb6b39200d7bbefc2`, business `40001` có, `PT409` chưa có; owner `postgres`, definer, empty pinned search_path, ACL `{postgres=X/postgres,service_role=X/postgres}`. `anon`/`authenticated` EXECUTE false; service_role true.
- Migration inventory còn 18 applied, qua `20261001043554`. Local có 23 file, năm candidate pending theo [forward-fix checkpoint](MCY_OWNER_CONFLICT_FORWARD_FIX_2026-10-08.md). Connector listing không thay thế official CLI comparison.
- Only relevant deployed function: `owner-control-plane`, **version 4**, JWT verification true. Retrieved deployed source còn `AI_GATEWAY_API_KEY`/Gateway adapter, chưa có OpenRouter implementation. Version 4 supersedes dated v1 inventory; không suy ra release history từ version counter. Không gọi function hoặc provider.

## Kiểm chứng thực chạy

| Check | Kết quả | Giới hạn |
|---|---|---|
| Selected offline handlers/contracts/AI batch | PASS **78/78**, exit 0 | 10 Node test files; synthetic fixtures, không đọc `.env.local`/real tokens |
| Owner conflict PGlite SQL rehearsal | PASS **15/15**, exit 0 | Existing PGlite runtime trong TEMP, minimal schema, deny-outbound; không phải multi-session/Supabase/PostgREST |
| Runtime integrity | PASS **28/28**, exit 0 | Không thay protected runtime |
| CLI `--version`, `login --help`, `migration list --help` | PASS | Existing official CLI **2.119.0**, telemetry disabled; không cài package mới |
| CLI official migration list | BLOCKED, command exit **1** | `AccessTokenRequiredError`; chưa có returned ledger |
| Secret/provider controls validity, live HTTP actors, independent review, full replay/concurrency, app build/UI/device | CHƯA CHẠY | Không coi config confirmation hoặc unit tests là evidence này |

Command batch:

```text
node --test tests/owner-control-plane.test.mjs tests/teacher-control-plane.test.mjs tests/teacher-migration-contract.test.mjs tests/owner-actor-matrix.test.mjs tests/owner-conflict-migration-contract.test.mjs tests/ai-gateway-models.test.mjs tests/ai-safety-boundaries.test.mjs tests/ai-assistant-handler.test.mjs tests/ai-current-turn-contract.test.mjs tests/client-bundle-openrouter-secret.test.mjs
node --test tests/owner-conflict-migration-rehearsal.cjs
npm.cmd run check:runtime
```

SQL fixture sử dụng `MCY_PGLITE_MODULE_PATH` trỏ tới engine đã cài `C:/Users/Admin/AppData/Local/Temp/mcy-pglite-runtime-20261003/node_modules/@electric-sql/pglite`; không auto-install.

CLI invocation trước khi disable telemetry thất bại ghi `.supabase/telemetry.json` do sandbox (`EPERM`). Retry với `SUPABASE_TELEMETRY_DISABLED=true`, `DO_NOT_TRACK=1` xác minh version/help được, sau đó official list dừng riêng tại auth blocker. Không đọc token store hoặc thay ACL để vượt lỗi. CLI executable có sẵn tại task-scoped cache:

```text
C:/Users/Admin/AppData/Local/Temp/mcy-rpc-fix-tools-442b31230cac41c8903f7b36b0e613d1/_npx/fcaf72be640e6e73/node_modules/@supabase/cli-windows-x64/bin/supabase.exe
```

## Tiếp tục

Trạng thái hiện tại theo [phiếu repair riêng](MCY_OWNER_REPAIR_REVIEW_PACKET_2026-10-09.md): CLI ledger và independent R3 source review hoàn tất; còn actual-schema/concurrency, operational lock/recovery, actor/live HTTP và reviewed target mapping. Docker daemon chưa có pipe hoạt động. Hướng dẫn login tiếp dưới đây đã superseded bởi authenticated official list; không yêu cầu Owner gửi token hoặc xác thực lại.

Owner cần xác thực CLI qua local interactive login hoặc token scope phù hợp do Owner tự quản tại máy. Không gửi token/API key/DB password qua chat. Connector OAuth và CLI authentication là hai đường độc lập; OAuth connector đang hoạt động không cung cấp credential cho CLI. `supabase login` chưa được chạy trong lượt này.

Sau khi có auth, agent chạy official `migration list --project-ref mhumbczqrzutdnraafhs --workdir D:/Projects/MCY --agent yes`, kiểm tra ledger/pending route. Không `db push` toàn bộ pending files. Tiếp đó hoàn tất independent R3 review và rehearsal/actor/HTTP prerequisites, rồi trình Owner candidate repair riêng để duyệt đúng artifact/target. Giữ stale-save probe bị chặn đến khi deployed PT409 được readback; key và hai false flags không tự cấp quyền apply/deploy/enable.

Chỉ thêm receipt này và superseding status trong danh mục công việc. Không mutation cloud, secret/key read, provider request, apply migration, deploy, AI enablement, role grant, invitation, restart, release-profile/allowlist change, commit hoặc push.

Official CLI docs đọc lại 09/10: [login](https://supabase.com/docs/reference/cli/supabase-login), [migration list](https://supabase.com/docs/reference/cli/supabase-migration-list). Actual installed CLI `--help` được dùng để xác minh command flags; docs không thay thế returned ledger/identity evidence.
