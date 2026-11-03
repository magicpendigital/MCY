# MCY — nghiệm thu gói learner-write trên staging, 12/10/2026

**Gói `mcy-learner-write-20261011` đã được Owner duyệt, áp dụng và nghiệm thu trong phạm vi staging.** Writer hiện bind đúng tài khoản khởi tạo thao tác, kiểm consent hiện hành sau lock và giữ idempotency cho toàn bộ payload. 41 request thực tế qua 10 nhóm API, readback database và log đều PASS. Ngày báo cáo là Asia/Bangkok; thời điểm thực thi là 11/10 UTC.

## Phạm vi được duyệt và đã thực hiện

Owner trả lời **“Duyệt gói staging và kiểm thử giới hạn trên”** cho [phiếu](MCY_LEARNER_WRITE_OPERATION_2026-10-11.md) / [manifest](MCY_LEARNER_WRITE_OPERATION_2026-10-11.json), SHA256 `13521cea066fa99467d23cca987533e03339efd019bbd4a09dc287b890ae2143`. Giữ nguyên bytes của manifest và toàn bộ input đã bind; trạng thái “awaiting decision” trong file đó là checkpoint chuẩn bị, không phải trạng thái hiện tại.

Target được đọc lại: `mcy-staging` / `mhumbczqrzutdnraafhs`, org MagicpenDigital `rzbpjfrndhrtxagpgdre`, ACTIVE_HEALTHY. Chỉ migration `20261002120000_bind_checkin_writes_to_current_actor_and_consent.sql`, SHA256 `439963a4be829f46661b72aad89267038033e0ce1401b404f8ef95ddd421785a`, được áp dụng.

Official CLI 2.119.0 chạy một lần từ isolated workdir chứa 20 migration đã applied và đúng candidate, với `migration up --linked --include-all --project-ref … --workdir …`. [Apply receipt](MCY_LEARNER_WRITE_APPLY_2026-10-12.json) ghi intent trước thực thi, start18:48:22.837Z / exit0 lúc18:48:26.845Z, không automatic retry. [Baseline](MCY_LEARNER_WRITE_BASELINE_2026-10-12.json) kiểm org/ref, ledger, Owner, AI, RPC và effective ACL trước apply. [Ledger mới](MCY_LEARNER_WRITE_LEDGER_2026-10-12.json): **21 aligned, 0 remote-only, 4 pending**; isolated post-list21/0pending. Bốn candidate Teacher, consent cap, collaboration và AI admission vẫn chưa áp dụng.

## Kết quả xác minh

| Kiểm tra | Kết quả và evidence |
| --- | --- |
| Frozen manifest/source/evidence/packet/25 local migrations; isolated21 đúng tên/hash | PASS trước và sau apply; không regenerate manifest |
| Deployed SQL, owner, search_path, EXECUTE; bảng/RLS/private USAGE/TRUNCATE | PASS [readback](MCY_LEARNER_WRITE_READBACK_2026-10-12.json), reviewer đọc trực tiếp độc lập |
| Owner function | Definition MD5 `5ad67fe52caf79bd07c51caa0c30db92`, OID19270, owner/search_path/ACL giữ nguyên |
| AI | off / version1 / model unset; không save, inference, grant hoặc gia hạn role |
| Hai disposable identities | Auth200/email confirmed, digest khớp SQL; không active staff/teacher; baseline0consent/0checkin/0observation [actor gate](MCY_LEARNER_WRITE_ACTOR_GATE_2026-10-12.json) |
| Live API | **10 nhóm / 41 request PASS**, exit0 [runner receipt](MCY_LEARNER_WRITE_LIVE_2026-10-12.json) |
| Lưu thực tế và side effects | Đúng **12 consent events / 2 check-in / 1 observation giả**, [final counts](MCY_LEARNER_WRITE_FINAL_COUNTS_2026-10-12.json) |
| Log cửa sổ18:51:25.402–18:53:40Z | 41 edge requests khớp runner; HTTP5xx0; SQL denial chỉ22023/28000/42501 đúng dự kiến [logs](MCY_LEARNER_WRITE_LOGS_2026-10-12.json) |

API kiểm anonymous, expected actor khác/null, stale latest privacy, revoked wellbeing, retry đúng payload, same key khác consent/energy/observation, writer cũ/private helper, direct INSERT, readback từng field và RLS khác tài khoản. HTTP:200×27,400×3,401×2,403×8,404×1; các denial là case chủ đích. 13 PostgreSQL errors tương ứng3×22023 +2×28000 +8×42501; helper404/PGRST202 là unexposed route. Không có timeout, unexpected5xx/code hoặc writer transaction tiếp tục trong post-test snapshot.

[Review R3 độc lập](MCY_LEARNER_WRITE_EXECUTION_REVIEW_2026-10-12.md) kiểm executor/harness/hash và trực tiếp đối chiếu deployed SQL/ACL/ledger/control. P2 về baseline guard đã sửa trước apply; không còn P1/P2 trong phạm vi được review. Reviewer không tự ghi dữ liệu hoặc gọi inference. Evidence UI136/build/runtime28/scanner23/Sites4/isolation1, Docker9 nhóm và clean/upgrade/STOP-RESUME1 từ checkpoint11/10 tiếp tục áp dụng cho cùng source đóng băng; không trình bày là các suite vừa chạy lại.

## Lịch sử kiểm thử được giữ

Learner A:8 events,1 check-in,1 observation `neck/uncertain`, note “Fictional staging fixture; no real symptom”. Learner B:4 events,1 check-in,0 observation. Không dùng triệu chứng thực. Tất cả fixture keys thuộc run `mcy-lw-9ebef4ed-cccd-4a19-a7e1-c585de11da0a`.

Cuối run, terms/privacy vẫn granted ở version review-0.1, **wellbeing_data revoked cho cả hai**. Lưu lại kể cả retry key cũ bị chặn. Đây là trạng thái kiểm thử có lịch sử append-only; không gọi là hoàn nguyên về trạng thái chưa có dữ liệu. Không xóa event hoặc health row. Nếu dùng lại hai tài khoản này để review web, cần đồng ý wellbeing trong app trước khi lưu.

## App và giới hạn

Bản web Preview đã triển khai ở [domain MCY](https://motchutyoga.magicpendigital.com) dùng RPC mới; bước này nối backend tương ứng, không cần build/deploy lại nguồn web. [Receipt hosted11/10](MCY_AUTH_EMAIL_HOSTED_2026-10-11.json) xác minh deployment `dpl_2zYC7QQJKMRLGsKgWPpWQqnPkaT4` / artifact `3197f3ebf8805a04e97bc5350f2d18bbc96fa443ed71b2cd273a327a4d04c662` và bốn hosted byte hashes. Kiểm HTTPS mới trả protectedSSO302, protection giữ; MCP Vercel hiện không đọc được binding và CLI context không xác nhận bằng JSON, nên không nâng receipt11/10 thành fresh artifact/visual acceptance. Không deploy web, thay DNS/protection hay promote Production trong thao tác này.

**Native/debug build cũ tạm không lưu được check-in**, theo tác động Owner đã duyệt. Cần build và kiểm thử native dùng writer mới trước nghiệm thu Android/iOS. Không có physical-native hoặc hosted signed-in UI/inbox acceptance mới trong gói database này.

Catalog bài tập duyệt vẫn rỗng, AI giữ off; technical PASS không cung cấp chuyên môn yoga, quyền media hoặc pháp lý. General release profile/Production gates vẫn mở; không dùng kết quả này để áp dụng bốn pending migration, bật AI, gia hạn role hay chạy positive Owner-config-save đã bị automatic review từ chối.

STOP/RESUME đã rehearsal ở local với source đóng băng. Không cần chạy STOP trên staging vì kiểm tra đạt. STOP thu hồi client EXECUTE, không hủy transaction đang chạy hoặc ngăn trusted service-role direct-table writes; resume chỉ mở writer mới, giữ writer cũ đóng. Deployed public wrapper có service-role EXECUTE từ default ACL được quan sát; private helper và private schema vẫn không cho client/service truy cập trực tiếp.

Bước kế tiếp: review check-in/consent trên web hiện tại và cập nhật native tương thích; triển khai các gói Teacher/consent cap/AI admission theo migration và actor gates riêng. AI lựa chọn buổi tập cần catalog có duyệt chuyên môn/rights trước khi mở pilot.
