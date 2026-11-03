# MCY — candidate consent/check-in cho bước tiếp theo, 11/10/2026

Candidate sửa việc lưu check-in đúng tài khoản và consent hiện hành, giữ dữ liệu nháp khi phản hồi mạng chưa rõ. Hiện **local đã triển khai/kiểm thử; database staging chưa apply**. Đây là bước chuẩn bị dữ liệu cho vòng check-in→Plan, không mở AI hoặc xuất bản bài tập.

## Lỗi đã tái hiện và bản sửa

Docker hai session thật tái hiện candidate cũ kiểm consent rồi chờ INSERT; revocation có thể commit trong lúc chờ nhưng check-in vẫn ghi. Candidate cuối dùng chung transaction advisory lock theo actor cho `record_my_consent` và writer, kiểm consent mới nhất sau lock, chỉ cho READ COMMITTED. Revoke đi trước thì save bị từ chối; save đi trước thì revoke phải chờ và các save sau bị từ chối.

Retry cũ theo ID có thể trả lại record đã lưu khác payload mới. Candidate so sánh toàn bộ payload đã canonicalize; exact retry trả cùng row, reuse key khác payload bị22023. Wrapper bind `p_expected_user_id` với Auth UID; writer cũ bị đóng để tránh đường bỏ qua expected actor. Các ACL/private schema không mở rộng, Owner function MD5 giữ nguyên.

Client chụp token/UID, session epoch chống A→B→A và route generation để phản hồi muộn không đổi màn hình mới. Consent mất phản hồi phải replay đúng event/key ban đầu trước khi ghi lựa chọn trái lại. Partial batch chỉ cập nhật baseline đã readback; checkbox nháp được giữ. Check-in chưa rõ kết quả freeze key/payload; “Thử lại bản ghi trước” xác nhận bản đó, phần sửa vẫn nháp cho key mới. Kết quả thành công nằm trong status riêng, không có copy lỗi lưu giả. Chưa có đồng bộ session/reflection mới.

## Candidate và evidence

- Migration duy nhất: `20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql`, SHA256 `439963a4be829f46661b72aad89267038033e0ce1401b404f8ef95ddd421785a`.
- [Official ledger](MCY_LEARNER_WRITE_LEDGER_2026-10-11.json):20 shared/aligned,0 remote-only,5 pending. Candidate này, teacher RPC, consent-cap, collaboration và AI admission vẫn pending; không dùng `db push` hoặc bundle candidate khác.
- [Docker/PostgREST](MCY_LEARNER_WRITES_DOCKER_2026-10-11.json):9 nhóm PASS,8 existing service ACL observations; schema-only staging export + fictional identities, internal network/no host port/bind mount, cleanup PASS. Có HTTP200, actor mismatch/anon/old writer/private/helper/direct-write denial, exact concurrent retry và hai thứ tự revoke/save.
- `tests/learner-write-clean-rehearsal.cjs`: final **1/1 PASS**, exit0. Clean chronological21 và upgrade20 applied+candidate có cùng public/private function bodies/ACL; current consent, stale/revoked denial, cross-user read, exact/changed retry, OwnerMD5 và private denial kiểm ở cả hai đường. PGlite PostgreSQL17/WASM có scaffold Auth/Storage giả; không gọi đây là full Supabase stack hoặc live Auth.
- Final UI136, build/runtime28/scanner23/Sites4/isolation1 và check-in contract4 PASS. [R3](MCY_AUTH_LEARNER_FINAL_REVIEW_2026-10-11.md) ghi source hashes, findings đã sửa và limits. Cùng key Checkin leave→return bằng synthetic touch gesture chưa nghiệm thu browser; route generation được review và đường rời/quay lại library đã test, không thay protected runtime để làm fixture xanh.
- [Actor Auth preflight](MCY_LEARNER_WRITE_ACTOR_PREFLIGHT_2026-10-11.json): A/B200/email confirmed, expiry11:56:27Z/11:56:40Z. Đây chỉ là xác thực, chưa chứng minh role hoặc live consent/write isolation. Nhãn helper không chứng minh role; các staff test grants tạm đã hết hạn10:47:49.876065Z. Không gia hạn/cấp role.

## Stop/restore đã rehearsal

[STOP SQL](../docs/release/MCY_LEARNER_WRITE_STOP_2026-10-11.sql) thu hồi EXECUTE client cho writer mới và cũ. [RESUME SQL](../docs/release/MCY_LEARNER_WRITE_RESUME_2026-10-11.sql) chỉ mở writer mới cho authenticated sau khi xác minh deployed source/ACL và xử lý incident. Clean/upgrade test chạy cả hai script, đối chiếu function/ACL fingerprint phục hồi, positive write mới và old writer vẫn denied. Không xóa data/consent/audit; không mở lại writer cũ có race. STOP không hủy transaction đã chạy; cần xử lý/quan sát in-flight trước khi tuyên bố đã chặn mọi ghi.

Native/debug client cũ gọi writer cũ sẽ fail closed sau apply. Đây là giới hạn tương thích có chủ ý để chặn đường unsafe; chỉ update native sau build/test riêng. Preview cũ không phải đường rollback an toàn cho check-in backend. Không restore database đè lên các ghi mới.

## Thao tác staging đề xuất sau nghiệm thu candidate

1. Reverify project MagicpenDigital/mcy-staging, official ledger20 aligned/0remote-only, exact candidate/schema hash, current A/B Auth + actual server authority và AIoff. Chuẩn bị isolated workdir gồm20 applied+duy nhất candidate, không đổi root allowlist để giả green.
2. Chỉ apply candidate qua official CLI explicit project/workdir. Dừng nếu ledger/diff vượt phạm vi. Readback deployed function definitions/owner/search_path/ACL, private USAGE, old RPC EXECUTE denial, unchanged Owner MD5/OID và ledger21.
3. Live API matrix bằng disposable staging accounts, dữ liệu **giả**: actor-bound happy save+readback/exact retry, key mismatch, A/B cross-user, anon/private/helper/direct table denial, stale/revoked consent, appropriate denied staff/expired authority. Không thao tác quyền hoặc email thật để tạo actor thiếu. Event consent fixture phải được đối chiếu với baseline và ghi lại side effects; không thể xóa lịch sử append-only rồi gọi là restore.
4. Chỉ nghiệm thu live write sau toàn bộ matrix PASS; nếu lỗi, STOP và giữ audit/rows để xử lý. Consent-cap pending phải sửa/retest để giữ shared-lock/isolation trước khi apply về sau.

Đã chuẩn bị [phiếu thao tác cụ thể](MCY_LEARNER_WRITE_OPERATION_2026-10-11.md), [manifest](MCY_LEARNER_WRITE_OPERATION_2026-10-11.json) và isolated workdir20applied+candidate. Official CLI trong workdir xác nhận20aligned/0remote-only và đúng một pending version; preparation không áp dụng SQL. Live fixture giới hạn12 consent events,2 check-in rows,1 observation giả trên hai tài khoản disposable, history append-only được giữ và ghi rõ. Các client native cũ sẽ fail closed; STOP không hủy in-flight hoặc chặn trusted service-role direct-table writes.

[Review thao tác bổ sung](MCY_LEARNER_WRITE_SELECTIVE_OPERATION_REVIEW_2026-10-11.md) đóng hai P2 trong preparation: manifest phải hash phiếu Owner, và lệnh remote phải có `--linked` bên cạnh explicit project-ref/`--include-all`. Không còn P1/P2 trong nguồn preparation đã review; inventory21/hash và syntax PASS. Parent đã regenerate manifest sau bản review cuối; không thay báo cáo R3 được pin trong Preview.

Chưa apply do stage gate cần quyết định với candidate cụ thể và live-test side effects; [mcy-change-review](../skills/mcy-change-review/SKILL.md) yêu cầu “Only the exact owner-approved target/artifact may enter a separately verified protected release path.” [Release runbook](../docs/release/RELEASE_RUNBOOK.md) yêu cầu duyệt candidate/target/manifest cụ thể. General release profile vẫn empty allowlist và dirty checkout; candidate/tests không tuyên bố Production release path được enforcement hoặc cleared. Đã chuẩn bị code, test và stop path trước khi xin quyết định; không dùng yêu cầu tiếp tục để tự cấp quyền hay bật AI.
