# MCY — Owner repair và môi trường kiểm thử, 09/10/2026

**ĐÃ ÁP DỤNG riêng Owner repair trên staging; ma trận HTTP PASS 17/17.** Lệnh triển khai của Owner và lựa chọn agent review độc lập là phạm vi của thao tác này. Đây là maintenance một RPC đang tồn tại; không phải promotion production hoặc approval toàn bộ release profile.

## Artifact và thao tác thực tế

- Đích: `mhumbczqrzutdnraafhs`, MagicpenDigital `rzbpjfrndhrtxagpgdre`, staging, Singapore. Fresh metadata trước thao tác đúng target.
- Artifact nguyên bytes: `20261007174155_fix_owner_config_conflict_sqlstate.sql`, SHA-256 `b7f8637c4568cbb138c680089214d14b308567d2ae0eb52990c22b73976d1fab`.
- Agent R3 review không phát hiện lỗi SQL, rerun PASS 33/33. Hai finding P2 về cleanup harness được sửa và reviewer xác nhận resolved trước apply.
- Official CLI 2.119.0: `migration up --linked --project-ref mhumbczqrzutdnraafhs --workdir <isolated-task-workdir> --agent yes`, **exit 0**, chỉ apply version `20261007174155`. Workdir chứa 18 applied SQL files và đúng một repair; bốn pending khác không có trong đó. Không chạy `db push`, không sửa migration history cũ.
- Lần gọi đầu thiếu `--linked` dừng tại `MigrationTargetFlagsError`, chưa kết nối; lần gọi đúng flags mới apply. Không retry sau kết quả mutation bất định.
- Có exclusive task-local file lock, một operator, fresh snapshot zero active Owner-save/concurrent function-DDL. Lock này không chứng minh remote protected release job hoặc chặn mọi privileged DDL ngoài quy trình. General release allowlist vẫn trống, không sửa checker/profile.

Readback qua connector độc lập sau CLI: OID **19270**, owner `postgres`, ACL `{postgres=X/postgres,service_role=X/postgres}`, SECURITY DEFINER và `search_path=''` giữ nguyên. `anon`/`authenticated` EXECUTE false, service-role true. Definition MD5 từ `1591e77afdfc0dacb6b39200d7bbefc2` thành **`5ad67fe52caf79bd07c51caa0c30db92`**; business `40001` absent, `PT409` present. Ledger connector và official CLI sau thao tác đều có **19 applied / 4 pending**, zero remote-only.

## Bằng chứng kiểm thử

| Kiểm tra | Kết quả | Giới hạn |
|---|---|---|
| Owner handler + contract + minimal/full-baseline SQL | PASS 33/33, exit 0 | PGlite/scaffold; không phải cloud Auth/HTTP |
| Runtime integrity | PASS 28/28 | Không sửa runtime/UI |
| Schema-only export public/private | PASS, 221277 bytes; SHA `e5112a2251c43a685aa1a7ddee14616fde3b6501c1bd5ad275d36724548e69db` | Không export rows/Auth/Storage data; không phải backup. CLI ephemeral connection tạm ở Docker Config.Env; container removal verified trước PASS |
| Real Docker PostgreSQL + PostgREST rehearsal | PASS 8/8, exit 0; cleanup verified | Actual staging app schema export; PG17.6 image/PostgREST14.13 khác platform minor live. Auth scaffold/default ACL normalization local; không full-platform parity. [Receipt](MCY_OWNER_DOCKER_REHEARSAL_2026-10-09.json) |
| Two-session row-lock contention | PASS | First commit, second PT409, exactly one version/audit; no lingering local save session |
| Local positive AI-off HTTP save | PASS | Fictional rows/JWT; không thay bằng live positive evidence |
| Five independently role-bound staging identities + negative HTTP | PASS 17/17, exit 0 | Anon/invalid JWT 401; learner A/B, teacher, reviewer 403; forged actor denied; Owner read 200; AI enable gate closed; stale save 409. [Receipt](MCY_OWNER_LIVE_HTTP_2026-10-09.json) |
| Activity after live probes | PASS, bounded snapshots | Zero active Owner-save at 02:14:43 and 02:17:04 Bangkok; config version 1, AI false, `ai_config.updated` count 0, total audits 4 |
| Bounded cloud log observation | PASS, 02:12–02:14 Bangkok | 13 Postgres log rows; 0 rows containing 40001, 0 Owner retry rows. Ingestion delay/short observation apply; no recurring monitor |
| Live positive identical AI-off save | **BLOCKED / chưa thực thi** | Automatic approval review rejected because it increments version and audit; explicit permission for this test side effect needed. No workaround attempted. [Test receipt](MCY_OWNER_LIVE_SAVE_2026-10-09.json) |

Helper screenshot supplied five successful sessions. Fresh Auth checks established distinct identities; role-controlled database readback found two fixture labels inverted. The negative matrix swapped learner-A/reviewer sessions **in memory only** to match actual roles. No token-file rewrite, role grant, expiry extension or credential output. Three role fixtures expire `2026-10-11T10:47:49.876065Z`; labels alone are not roles.

Security advisors after DDL: no finding naming the changed Owner RPC. Existing output: 40 INFO RLS-without-policy (default-deny/server-only or unopened features), five WARN authenticated SECURITY DEFINER learner/consent RPCs, one WARN leaked-password protection disabled. These remain separate review items; no blanket ACL/auth change was made. See [RPC advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) and [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Bước còn lại và giới hạn

The prepared, unexecuted `scripts/test-owner-live-save-roundtrip.mjs` sends one identical current AI-off configuration as authenticated Owner (expected version **1 → 2**, one legitimate `ai_config.updated` audit), then tests the actual previous version and reads back unchanged business values. It requires fresh independently inspected deployed PT409, exact current version/identity and closed AI gates. It never retries uncertain writes. Automatic approval review requires human approval for this particular positive test; SQL repair and negative acceptance are already complete.

No Edge deployment occurred: deployed Owner still uses the older Gateway adapter; local OpenRouter implementation is not shipped by the SQL repair. AI flags remain false. Check-in actor-bound, teacher, consent-cap and collaboration migrations remain pending. Full current frontend build cannot be deployed while its check-in RPC prerequisite remains unmet. No production release, upload, invitation, new paid test project or native installation occurred.

Stop path: on drift/timeout/unexpected writes, stop further saves/probes, inspect exact metadata/activity/logs, prepare a reviewed forward correction. Never restore intentional business `40001`, broadly restart staging or terminate unrelated sessions. Schema export is a schema rehearsal input, not a data recovery guarantee.

Domain setup follows the Owner's decision to review the latest Ready Preview branch; [Cloudflare DNS instructions and deployment identity](MCY_DOMAIN_REVIEW_DNS_2026-10-09.md). DNS/HTTPS activation is still pending the exact record.
