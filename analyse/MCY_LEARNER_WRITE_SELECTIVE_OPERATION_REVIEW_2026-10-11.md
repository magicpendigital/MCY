# MCY — review bổ sung thao tác learner writes trên staging

Captured: **2026-10-11 18:29:36 UTC / 2026-10-12 01:29:36 Asia/Bangkok**. Tên file giữ ngày của candidate/evidence 11/10; đây không phải readback cloud mới.

**Kết luận nguồn: không còn P1/P2 trong phạm vi đã review sau hai sửa bên dưới.** Gói thao tác đủ cụ thể để Owner xem xét đúng candidate và side effects. Báo cáo này không phê duyệt thực thi, không chứng minh migration đã applied hoặc live actor matrix đã đạt, và không thay general release/Production gate.

Review độc lập theo `skills/mcy-change-review/SKILL.md`, review matrix, AGENTS.md hiện hành và `docs/release/RELEASE_RUNBOOK.md`. Chỉ đọc nguồn/public receipts, kiểm syntax và inventory/hash local; không đọc `.env`, token hoặc thông tin đăng nhập; không gọi cloud, apply SQL, đổi role/expiry hoặc sửa implementation. Báo cáo R3 trước được giữ nguyên.

## Candidate và phạm vi

Target là `mcy-staging-learner-write`, project `mhumbczqrzutdnraafhs`, org MagicpenDigital `rzbpjfrndhrtxagpgdre`. Candidate duy nhất là `20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql`, SHA256 `439963a4be829f46661b72aad89267038033e0ce1401b404f8ef95ddd421785a`.

Nguồn bổ sung đã đọc: clean/upgrade rehearsal, STOP/RESUME, prepare script, phiếu Owner và operation JSON trước regeneration. Không review lại toàn bộ implementation dưới nhãn mới; hash candidate và báo cáo [R3 trước](MCY_AUTH_LEARNER_FINAL_REVIEW_2026-10-11.md) vẫn khớp checkpoint đã độc lập kiểm thử34/34.

## Hai P2 đã đóng

| Finding | Scenario cụ thể | Sửa đã kiểm tra |
| --- | --- | --- |
| P2 — phiếu Owner chưa được bind bằng hash | Receipt đầu chỉ lưu đường dẫn phiếu. Sau khi Owner duyệt manifest, nội dung hướng dẫn/side effects trong phiếu có thể đổi mà manifest giữ nguyên bytes. | Prepare script dòng103 lưu `ownerPacket: {path, sha256}`; hash được tính bằng reader đã kiểm path. Phiếu không chứa hash của JSON nên không tạo vòng hash. |
| P2 — lệnh apply thiếu `--linked` | Lệnh `migration up --include-all --project-ref …` không chọn remote. TS CLI mặc định local và từ chối project ref trên đường local, khiến thao tác trong phiếu không thực hiện được trên staging. | Phiếu bước3 và `proposedApplyArguments` dòng88 đều có `--linked --include-all`, explicit project/workdir. Chỉ là arguments dự kiến, không được gọi trong prepare script. |

Supabase xác nhận explicit project ref không tự chọn linked target; source của command mặc định local và handler từ chối ref khi target không linked. Đã đối chiếu [divergence document](https://github.com/supabase/cli/blob/develop/apps/cli/docs/go-cli-divergences.md), [up.command.ts](https://raw.githubusercontent.com/supabase/cli/develop/apps/cli/src/commands/migration/up/up.command.ts) và [up.handler.ts](https://raw.githubusercontent.com/supabase/cli/develop/apps/cli/src/commands/migration/up/up.handler.ts). Parent còn báo đã kiểm `migration up --help` của installed official2.119.0 exit0; reviewer không chạy binary/cloud apply.

## Prepare script và manifest

Script yêu cầu đúng canonical workspace root, đúng ledger25 version duy nhất/20 aligned/0 remote-only/5 pending và đúng toàn bộ filename/hash migration. Reader từ chối absolute path, `..`, leaf symlink và resolved path ra ngoài root. Thư mục operation phải có canonical path khớp; file có sẵn phải đúng hash, file mới dùng exclusive creation. Inventory isolated phải khớp chính xác20 migration đã applied + candidate.

Reviewer kiểm **offline inventory PASS exit0**:21 file isolated khớp tên và SHA với ledger/source; pending duy nhất là candidate; `supabase/config.toml` chỉ chứa `project_id = "mcy"` và newline. Không đọc cache CLI/credentials.

Child process duy nhất trong prepare là official `migration list` với explicit project ref/workdir, timeout60s và raw lỗi được giữ kín. Script kiểm trả về đúng20 aligned và một pending version. Không có gọi `migration up`, `db push`, RPC, Auth email hoặc SQL write. Các mutation arguments chỉ được ghi trong receipt.

`--include-all` cần vì candidate đứng trước hai migration đã applied; nó bao gồm mọi version thiếu trong remote history, nên giới hạn một pending trong isolated workdir là điều kiện thiết yếu. [Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-up) hỗ trợ semantics này. Không dùng workdir root với bốn pending candidate khác.

Receipt giữ `PREPARED_AWAITING_OWNER_DECISION`, `releaseAuthorized:false`, `cloudMutationPerformed:false`, dirty working tree và general checker chưa cleared. Các hashes ghi bằng script là binding, không phải tự động thẩm định PASS/authorization. Operator phải kiểm fresh authority, target, source/hash, deployed SQL/ACL và quyết định Owner ngay trước thực thi. Read-only list của parent ở receipt trước regeneration là evidence có thời điểm, không được kéo dài thành current state.

**Operation JSON cần được regenerate từ final script và báo cáo này trước khi trình Owner.** Báo cáo cố ý không embed SHA của operation JSON; JSON có thể bind báo cáo hoàn chỉnh trong evidence mà không tạo vòng hash. Bất kỳ thay đổi phiếu/nguồn/evidence nào sau duyệt vẫn cần kiểm lại exact manifest và quyết định.

## Clean replay và STOP/RESUME

Clean test tạo hai PGlite database rỗng với platform scaffolding giả, áp dụng chronological21 và observed20 rồi candidate cũ hơn. Test so function body/identity arguments/ACL/search_path/security-definer fingerprints, Owner MD5, private USAGE và direct client table-write denial. Có missing/current/stale/revoked consent, exact retry/changed payload, expected UID mismatch, cross-user read isolation, anon/old-writer denial và AI off/version1/model-unset.

STOP/RESUME được chạy tuần tự trên cả hai database: STOP từ chối writer mới/cũ; RESUME khôi phục fingerprint trước STOP, writer mới lưu được sau current consent, writer cũ vẫn denied. Parent báo final rehearsal **1/1 PASS exit0,49.993s**; reviewer lần bổ sung này đọc nguồn, không rerun database. Syntax final clean test **PASS exit0**. Đây là scaffolding/SQL/ACL evidence tuần tự, không phải Supabase Auth, live effective role, OID/owner readback hoặc concurrent HTTP evidence. Docker/PostgREST concurrency là receipt riêng.

STOP chỉ REVOKE client EXECUTE của hai writer; RESUME chỉ cấp lại EXECUTE writer mới cho authenticated và giữ writer cũ đóng. Nó không hủy transaction đang chạy, không chặn trusted service-role direct table writes và không phục hồi/xóa dữ liệu. Phiếu nêu rõ phải quan sát/xử lý in-flight trước khi tuyên bố mọi ghi đã dừng. Resume cần incident resolution và deployed-source/ACL check riêng; không tự chạy sau STOP.

## Side effects và gates còn mở

Phiếu ghi rõ native/debug client cũ sẽ không lưu check-in sau apply, và quay lại Preview cũ không mở writer unsafe. Live matrix chỉ dùng hai disposable actors đã được xác minh độc lập; tối đa12 consent events,2 check-in rows,1 observation giả; append-only events/fixture rows được giữ lại và ghi trong receipt. Không dùng health data thật hoặc tài khoản khách hàng; không cấp optional AI/Teacher/marketing consent. Đây là giới hạn thao tác được đề xuất, **chưa là evidence đã chạy matrix hoặc cap tự động được enforcement**.

Các phiên A/B ghi nhận trước đây đã hết hạn; staff grants cũ cũng đã hết hạn. Cần Auth/identity/actual authority mới, không suy luận từ nhãn helper, không grant/extend để vượt gate. Trước và sau apply cần fresh ledger/SQL/function owner/search_path/ACL/private USAGE/old/helper denial; Owner MD5/OID/ACL và AIoff/version1/model-unset phải giữ nguyên. Cần bounded actor matrix, stored-row/count readback và log window tối đa5phút; không có log không đồng nghĩa zero error. Unknown apply outcome cần readback trước quyết định tiếp, không automatic retry.

**CHƯA CHẠY trong review bổ sung:** cloud apply, live learner consent/check-in matrix, thực thi STOP/RESUME trên staging, current operator/control enforcement và native acceptance. AI enablement/inference, bốn pending migration khác, Production, role/expiry changes và successful Owner-config-save nằm ngoài gói này. Rejection cũ của positive Owner-config-save không được bypass bằng phiếu mới.

## Hash final đã kiểm độc lập

| Input | SHA256 |
| --- | --- |
| `scripts/prepare-learner-write-operation.mjs` | `373fabb63c19211fb219fad62ef383bc2458dd8c3fea94695a8d0e1ddc218909` |
| `analyse/MCY_LEARNER_WRITE_OPERATION_2026-10-11.md` | `b64d52f211b6a1bf179b2989f1683f18824903b4f88a6d956f79000969c09aa0` |
| `tests/learner-write-clean-rehearsal.cjs` | `217a950c8003c5a72630e5cbded5ded5c85dfffc0624a876536b368e1f171887` |
| `docs/release/MCY_LEARNER_WRITE_STOP_2026-10-11.sql` | `fc558996a3f789b4b4c0691c584916edf22f7d49e68ebe2dc0230d03e171f25e` |
| `docs/release/MCY_LEARNER_WRITE_RESUME_2026-10-11.sql` | `b8064b0f8f031036ed85a7e5b041cdd4e429c83e0f5d4201703afdf3df396c0f` |
| Candidate migration | `439963a4be829f46661b72aad89267038033e0ce1401b404f8ef95ddd421785a` |
| Prior R3 — unchanged | `a16c6e7c82d6192d02e35486a92de02f327f9d715b75e6e30c6cbbe4f91abc92` |

Final `node --check` prepare script và clean test đều **PASS exit0**. Reviewer không sửa các input trên; chỉ tạo báo cáo bổ sung này.
