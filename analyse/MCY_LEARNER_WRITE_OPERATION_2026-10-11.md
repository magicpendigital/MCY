# MCY — phiếu áp dụng check-in/consent trên staging, 11/10/2026

**Đang chuẩn bị, chưa áp dụng database.** Bản web mới đã ở domain MCY; bước này nối thao tác lưu check-in với database staging theo đúng tài khoản và consent hiện hành. Không dùng phiếu này làm nghiệm thu Production hoặc bật AI.

## Candidate cụ thể

- Release ID: `mcy-learner-write-20261011`.
- Target: `mcy-staging-learner-write`, project `mhumbczqrzutdnraafhs`, org MagicpenDigital `rzbpjfrndhrtxagpgdre`.
- Migration duy nhất: `20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql`.
- SHA256: `439963a4be829f46661b72aad89267038033e0ce1401b404f8ef95ddd421785a`.
- [Operation manifest](MCY_LEARNER_WRITE_OPERATION_2026-10-11.json) ghi đầy đủ hash nguồn, 25 migration local, 21 file trong isolated workdir và evidence liên quan. SHA của **toàn bộ file JSON** được báo riêng khi xin quyết định; không tự viết approval JSON để thay quyết định của Owner.

## Thay đổi và người bị ảnh hưởng

Writer mới bind UID của thao tác với Auth UID, kiểm ba consent hiện hành, cùng consent RPC dùng lock theo actor. Thu hồi consent đi trước phải chặn save; thử lại đúng key/payload trả cùng bản ghi; cùng key khác payload bị từ chối. Client giữ nháp khi kết quả chưa rõ và từ chối phản hồi từ phiên/tài khoản/màn hình cũ. Không đổi quyền nhân sự, dữ liệu Teacher, Storage hay Owner AI config.

Writer cũ bị đóng để chặn đường bỏ qua expected actor. **Native/debug client cũ chưa cập nhật sẽ không lưu được check-in sau apply**; cần build/test riêng trước khi nghiệm thu native. Quay lại Preview cũ không khôi phục writer unsafe. Không cần mua/thay gói hoặc mở thêm dịch vụ trong thao tác này; kiểm thử chỉ dùng tài nguyên staging hiện có, không gọi nhà cung cấp AI.

## Evidence đã đạt và phần còn mở

[Báo cáo triển khai](MCY_LEARNER_WRITES_IMPLEMENTATION_2026-10-11.md): Docker/PostgREST9 nhóm PASS, hai thứ tự lock và concurrent exact retry; PGlite clean21/upgrade20+candidate/STOP/RESUME1 PASS; UI136, migration contract4 và R3 cuối34 PASS. [R3 nguồn](MCY_AUTH_LEARNER_FINAL_REVIEW_2026-10-11.md) có hash đóng băng. Fixture không chứng minh live Auth, live RLS hoặc quyền nhân sự; chưa có live learner write. Chưa có Production release enforcement được chứng minh; general profile vẫn không có target allowlist, không sửa nó để ép checker xanh.

## Thao tác và điều kiện dừng

1. Trước thực thi, đối chiếu lại org/project, quyền operator, toàn bộ source/hash và ledger20 applied/0remote-only/5pending. Kiểm Owner function MD5 `5ad67fe52caf79bd07c51caa0c30db92`, OID/ACL và AIoff/version1/model-unset. Dừng nếu drift, hash hoặc quyền không khớp.
2. [Prepare script](../scripts/prepare-learner-write-operation.mjs) chỉ tạo `.vercel/mcy-learner-write-20261011`, gồm20 migration đã applied + duy nhất candidate; config tối thiểu `project_id="mcy"`, không Auth/SMTP/secret. Official CLI list trong workdir phải có20aligned/0remote-only và pending đúng `20261002120000`.
3. Operator dùng official CLI `migration up --linked --include-all --project-ref mhumbczqrzutdnraafhs --workdir D:\Projects\MCY\.vercel\mcy-learner-write-20261011`. `--linked` chọn database remote; explicit project ref không tự chọn remote. `--include-all` cần vì timestamp candidate nằm trước hai migration đã applied; workdir giới hạn chính xác một pending version. Không `db push`, không dùng root migrations, không apply bốn candidate khác. Không retry tự động khi kết quả chưa rõ; đọc ledger/deployed source trước quyết định tiếp.
4. Đọc lại ledger21, từng function body/owner/search_path/ACL, private schema USAGE và old writer/helper denial. OwnerMD5/OID/ACL và AI config phải giữ nguyên. Migration return code chưa đủ nghiệm thu.
5. Sau Auth/identity và authority readback độc lập, chạy matrix bằng hai **disposable staging actors** A/B: positive save/readback, exact retry, changed payload denial, cross-user mismatch/read isolation, anon/direct table/private/helper/old writer denial, stale/revoked consent denial. Nhãn helper không chứng minh role. Các staff grant cũ đã hết hạn; không gia hạn/cấp role để làm test xanh.
6. Bounded live matrix được giới hạn **tối đa12 consent events, 2 check-in rows và1 observation giả**, không dùng hồ sơ sức khỏe thật hoặc ghi vào tài khoản khách hàng. Consent history append-only và fixture rows sẽ được ghi rõ trong receipt; không xóa rồi gọi là restore. Các optional AI/Teacher/marketing consent không được cấp. Nếu tài khoản đã có dữ liệu thật hoặc không được xác định là disposable thì dừng trước ghi và chọn test actor phù hợp.
7. Sau matrix, readback counts/state; đọc cửa sổ log tối đa5phút quanh run, kiểm không có access/write sai actor, không HTTP5xx hoặc timeout chưa giải thích. Một bất thường đủ dừng acceptance, không retry để che lỗi. Không thấy log không được diễn giải là zero error. Không tắt protection/đổi DNS/Production.

## Stop và phục hồi

[STOP](../docs/release/MCY_LEARNER_WRITE_STOP_2026-10-11.sql) chặn EXECUTE writer mới/cũ của client; đã rehearsal. Script **không hủy transaction đang chạy và không chặn trusted service-role direct-table writes**; phải quan sát/xử lý in-flight trước tuyên bố đã dừng mọi ghi. Không xóa consent/check-in/audit hoặc restore database đè lên dữ liệu mới.

[RESUME](../docs/release/MCY_LEARNER_WRITE_RESUME_2026-10-11.sql) chỉ mở writer mới sau deployed-source/ACL readback và khắc phục incident; writer cũ vẫn đóng. Resume là quyết định sau incident, không tự chạy chỉ vì STOP xong.

## Quyết định còn cần

Owner duyệt target/migration/manifest cụ thể và giới hạn fixture side effects ở trên. [mcy-change-review](../skills/mcy-change-review/SKILL.md) quy định “Only the exact owner-approved target/artifact may enter a separately verified protected release path.” [Runbook](../docs/release/RELEASE_RUNBOOK.md) yêu cầu quyết định gắn candidate/target/manifest. Yêu cầu này áp dụng cho **migration learner writes đang pending**, không mở lại phê duyệt email/web đã được yêu cầu. Không lặp test successful Owner-config-save đã bị automatic approval review từ chối trước đây.
