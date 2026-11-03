# MCY — review R3 độc lập Owner conflict repair, 09/10/2026

Reviewer: agent `owner_repair_review`, được Owner chọn qua trả lời “Giao agent riêng review”. Agent thực hiện read-only review, không sửa file, đọc credential, mutate cloud, chạy stale-save RPC hoặc deploy. Root ghi lại kết quả dưới đây; đây không phải human deployment approval.

## Kết luận và phạm vi

**Không phát hiện lỗi correctness/security cần sửa trong phạm vi đã review.** Artifact SQL duy nhất: `supabase/migrations/20261007174155_fix_owner_config_conflict_sqlstate.sql`, SHA-256 `b7f8637c4568cbb138c680089214d14b308567d2ae0eb52990c22b73976d1fab`. Review cũng xét phân loại lỗi trong Owner handler local để đánh giá contract; rollout SQL riêng không deploy handler đó hoặc OpenRouter.

Migration là một statement atomic, từ chối missing RPC và definition/ACL drift; chỉ đổi business `40001` thành `PT409`. Nó giữ OID, owner, ACL, empty search_path, SECURITY DEFINER, role/expiry/version/audit logic. Exact retry là no-op. Owner handler local phân biệt `PT409` → sanitized 409 với real `40001` → sanitized 503, không tự retry; structured permission code không bị message ghi đè. Actor vẫn lấy từ `getUser(token)`.

CLI receipt được kiểm tra độc lập: 18 shared versions, zero remote-only, five pending và **23/23 local hashes** khớp [receipt](MCY_CLI_MIGRATION_LEDGER_2026-10-09.json). Ledger alignment không cấp phép apply năm candidates.

## Kiểm thử reviewer thực chạy

```text
node --test tests/owner-control-plane.test.mjs tests/owner-conflict-migration-contract.test.mjs tests/owner-conflict-migration-rehearsal.cjs tests/owner-conflict-full-schema-rehearsal.cjs
```

**PASS 33/33, exit 0, không skipped:** handler 10, contract 4, minimal SQL fixture 15, full local-source baseline 4. PGlite replay 18 baseline migrations với fictional Auth/Storage scaffold; selective upgrade không đổi rows, table ACL/RLS/policies. Stale save không ghi config/audit, valid AI-off save tăng một version và một audit; client EXECUTE vẫn bị từ chối. Không dùng real staging tokens hoặc rows.

## Compatibility và giới hạn

- Reviewer xác minh source handler cũ có message-based `changed; reload` → 409, message migration giữ nguyên. Sau review, root đọc lại deployed `owner-control-plane` bằng connector: file `_shared/ownerControlPlane.ts`, lines 143–146 có đúng nhánh này. Đây là compatibility suy luận từ **deployed source**, chưa phải live HTTP test.
- Full replay là **local-source application baseline**, không phải reviewed snapshot schema của Supabase thực tế; chưa chứng minh Auth/Storage/PostgREST parity hoặc multi-session concurrency. Root chạy bounded `docker info --format '{{.ServerVersion}}'`: exit 1, thiếu `dockerDesktopLinuxEngine` pipe. Không khởi động/cài Docker hoặc thay bằng fixture để đóng concurrency gate.
- Guard không tự ngăn privileged concurrent DDL giữa catalog check và replace. Cần operational deployment lock, refresh đúng target/definition/ACL và operator/recovery readiness trước action.
- Sau approved apply cần readback MD5 `5ad67fe52caf79bd07c51caa0c30db92`, OID/owner/ACL và exact remote migration version trước bounded role-bound HTTP probe. Phải quan sát activity/log sau response; timeout client không chứng minh backend đã dừng.
- OpenRouter provider/adapter deployment cần review riêng. Hai AI flags giữ `false`; không bundle teacher/check-in/consent/collaboration. Không rollback về intentional business `40001`; nếu readback sai thì dừng probe và dùng reviewed forward repair.

Root đọc lại [hướng dẫn Supabase về retry loop](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b) ngày 09/10; tài liệu khuyến nghị mã `PT` cho HTTP mapping và lưu ý sửa function không dừng transaction đang chạy. Reviewer cũng đối chiếu [PostgREST 14 errors](https://docs.postgrest.org/en/v14/references/errors.html#raise-errors-with-http-status-codes) và [PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html). Không phát sinh termination/restart trong lượt review này.

Quyết định: **R3 source review hoàn tất; live rollout/acceptance chưa hoàn tất và chưa được cấp quyền bằng receipt này.** Xem [phiếu staging repair](MCY_OWNER_REPAIR_REVIEW_PACKET_2026-10-09.md) để biết các gate còn mở.
