# MCY — phiếu review bản sửa Owner riêng, 09/10/2026

**Superseding operation result:** exact Owner repair below has now been applied separately to staging under the later explicit implementation instruction. Readback PT409/MD5/OID/ACL and live role-bound HTTP PASS 17/17; actual-schema Docker concurrency/PostgREST rehearsal PASS 8/8. Positive live save is separately blocked by automatic approval review pending explicit permission for the version/audit side effect. See [current acceptance record](MCY_OWNER_REPAIR_ACCEPTANCE_2026-10-09.md). The text below is the pre-action review packet, not the current unapplied state. General release/profile controls remain unchanged.

Trạng thái: **R3 SOURCE REVIEW HOÀN TẤT / CHƯA ÁP DỤNG**. Agent độc lập không phát hiện lỗi cần sửa trong phạm vi và chạy lại PASS 33/33. User đã xác thực CLI và cho phép review; đây chưa phải phê duyệt migration live hoặc toàn bộ release. AI vẫn tắt theo xác nhận Owner; không đọc secret values. [Kết quả và giới hạn review](MCY_OWNER_REPAIR_INDEPENDENT_REVIEW_2026-10-09.md).

## Thay đổi và đích

Bản đề xuất `mcy-owner-conflict-only-20261009`: sửa đúng mã xung đột phiên bản của RPC Owner từ `40001` sang `PT409`, để PostgREST trả lỗi HTTP 409 thay vì retry nghiệp vụ. Giữ function identity/owner/search_path/ACL, active Owner và expiry, validation, audit, version lock. Không sửa applied history, không bật AI hoặc grant quyền mới.

Đích duy nhất: Supabase **staging** `mhumbczqrzutdnraafhs` trong MagicpenDigital `rzbpjfrndhrtxagpgdre`, Singapore. Project metadata readback phù hợp. Không promote production hoặc mở target allowlist bằng receipt này.

Artifact duy nhất có thể được đề nghị apply:

- `supabase/migrations/20261007174155_fix_owner_config_conflict_sqlstate.sql`
- SHA-256 `b7f8637c4568cbb138c680089214d14b308567d2ae0eb52990c22b73976d1fab`
- Reviewed before-definition MD5 `1591e77afdfc0dacb6b39200d7bbefc2`; predicted after `5ad67fe52caf79bd07c51caa0c30db92`.

Migration từ chối missing RPC/definition drift/permission drift. Nếu chưa commit thì failure giữ nguyên definition cũ. Sau áp dụng không restore intentional `40001` làm rollback: chặn save/probe, readback và sửa tiến riêng nếu có lỗi. Deployment window cần ngăn privileged DDL đồng thời và revalidate đúng target/hash/ACL ngay trước action.

Không bundle bốn pending candidate khác (check-in, teacher drafts, consent cap, collaboration), local handler OpenRouter hoặc handler error-classification changes. Deploy Edge là scope riêng. Deployed Owner source readback có nhánh `changed; reload` → 409 và message RPC được giữ nguyên: compatibility migration-only phù hợp ở mức source. Live HTTP interaction vẫn chưa chạy; chưa gọi đây là end-to-end Owner UX fix.

## Bằng chứng ngày 09/10

| Check | Kết quả | Giới hạn |
|---|---|---|
| Official CLI 2.119.0 migration list | PASS, exit 0; 18 aligned, zero remote-only, five pending | Timestamp ledger alignment; không chứng minh SQL bytes remote giống local hoặc apply approval. [Receipt](MCY_CLI_MIGRATION_LEDGER_2026-10-09.json) gồm hashes của 23 local files |
| Target/RPC metadata readback | PASS | Exact org/ref/region và before definition MD5/owner/ACL/definer/search_path; chưa write/probe |
| New full local-baseline schema rehearsal | PASS 4/4 | Replay đủ 18 local migrations với fictional Auth/Storage scaffolding; selective upgrade giữ mọi app table/policy/row và RPC properties. Không actual Supabase Auth/Storage/HTTP parity |
| Existing minimal fixture + new full-schema rehearsal qua npm script | PASS 19/19, exit 0 | PGlite 0.5.8/PG17 in-memory; deny-outbound. Một DB session mỗi fixture, không parallel PostgreSQL transactions |
| Owner migration contract | PASS 4/4, exit 0 | Historical file hashes, exact guarded forward repair, pending no intentional 40001 |
| Runtime integrity | PASS 28/28, exit 0 | No UI/runtime change |
| Independent agent review | HOÀN TẤT; không phát hiện lỗi cần sửa; reviewer rerun PASS 33/33, exit 0, no skips | Agent `owner_repair_review`, user-authorized; [report](MCY_OWNER_REPAIR_INDEPENDENT_REVIEW_2026-10-09.md). Source review không cấp live rollout approval |
| Actual Supabase concurrency, direct/live HTTP, role-bound actors/revoked/old-token, deployment locking, restore/operator readiness | CHƯA CHẠY | Không biến fixture PASS thành gate này. Unsafe stale-save live giữ bị chặn |

Initial sandbox CLI list trả `AccessTokenRequiredError`, mặc dù Owner đã login. Scoped unsandboxed CLI retry đọc được authenticated session và official ledger, không cần login/token lần nữa. CLI có bước nền “Initialising login role”; đây là cơ chế kết nối do CLI quản lý, không claim rằng command không có mọi platform side effect. Không apply application SQL/migration/deploy và không in credential.

Nguồn test mới: [owner-conflict-full-schema-rehearsal.cjs](../tests/owner-conflict-full-schema-rehearsal.cjs). `test:owner-conflict-sql-rehearsal` trong package được mở rộng để chạy cả fixture tối giản và full local baseline. Không thêm dependency/engine auto-install hoặc đổi CI protection. Gate mới vẫn cần engine có sẵn.

## Điều kiện trước/ sau rollout đề xuất

1. Independent R3 source review đã hoàn tất, không có finding cần sửa. Nếu artifact đổi phải refresh review/hashes/tests. Xác lập operational lock, actual-schema/concurrency rehearsal, actor/test và recovery readiness; các phần này còn thiếu. Không dùng source review để đóng rollout gate.
2. Trình Owner exact candidate/target/phạm vi và evidence/gaps sau review. CLI đăng nhập chỉ cấp kết nối, không tự phê duyệt sửa SQL live. Release runbook/profile enforcement còn riêng, không gỡ blockers rộng.
3. Khi exact staging repair được duyệt và prerequisites đạt, operator dùng route migration chọn đúng **một** artifact; không `db push` cả pending inventory. Connector application cần ghi remote version nó thực sự tạo và giữ local filename/content ledger theo supported workflow.
4. Readback definition after-MD5, migration ledger và privileges/OID preservation trước bounded stale-save HTTP test. Không set runner deployed-PT409 precondition theo source local.
5. Test role-bound HTTP 409/no continuing retries/no unexpected config/audit change, normal AI-off save và old/revoked role denial trong phạm vi duyệt. Quan sát connection/log sau response; timeout client không chứng minh backend dừng. Fixture grants hết hạn 11/10/2026 17:47:49.876 Bangkok; không gia hạn bằng retry.
6. OpenRouter/teacher/learner migrations, Edge deployment và inference là các bước riêng sau repair acceptance và các gate hiện hành. Không có recurring monitor được tạo bằng phiếu này.

## Rủi ro còn lại và phê duyệt

PGlite scaffold/model tests không chứng minh mọi platform defaults, production-schema drift, concurrency hoặc hiệu ứng PostgREST live. Hash guard giảm scope overwrite nhưng không ngăn privileged DDL racing bên ngoài. Independent agent source review không thay thế operational permissions, human cost/data-processing approval hoặc actor tests. Source HEAD vẫn `82458fc...` và candidate chưa commit, không coi HEAD là đầy đủ tested artifact.

Docker daemon check exit 1 do thiếu named pipe; không khởi động/cài service trong lượt này. Actual Supabase-local/multi-session rehearsal vẫn CHƯA CHẠY. Operational controls và reviewed release target mapping chưa xác minh; profile allowlist vẫn trống. Phiếu này chưa phải manifest đủ gate để trình phê duyệt release.

Quyết định live: **chưa có trong phiếu này**. Không ký approval thay Owner, không sửa target allowlist, không dùng checker PASS làm release authority.
