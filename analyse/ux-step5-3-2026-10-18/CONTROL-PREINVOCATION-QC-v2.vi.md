# Independent R3 control correction review — v2

Reviewer `/root/profile46_qc`, 18/10/2026. **PASS_SOURCE_FOR_BOUNDED_NODE_INVOCATION_AFTER_ROOT_GO**. Chỉ static source/read/hash review; chưa import/test/server/collection/build/browser từ QC. [v1 BLOCKED](CONTROL-PREINVOCATION-QC-v1.vi.md) là lịch sử, không sửa lại. Verdict này cho phép root xét chạy controls, không xác nhận controls đã PASS hoặc actual Owner preview sẵn sàng.

## Exact scope

[Freeze v2](CONTROL-SOURCE-FREEZE-v2.json) SHA `04aae7b43aef4649c34abb6f0058100a33353a682319374a3fdc062ebb16788d`; [correction](CONTROL-CORRECTION-v2.vi.md) SHA `bc270f6241d2595bd3b7998e37ee39081075d7beb49d44f6b7819ca0b7716e03`. Independent PowerShell pin command **actual exit0**, UTC `2026-10-18T16:06:23.4753721Z`:9/9 source+71/71 canonical+9/9 archived preimages match, mismatches0. Đọc JSON freeze và dùng `Get-FileHash -LiteralPath ... -Algorithm SHA256`, source `Get-Item.Length` so từng record; archive đối chiếu đúng các source v1. Không kiểm lại whole app/media ngoài71 dependency đã chọn.

Delta gồm model/server và ba suites; adapter, snapshot, CLI, shared contract giữ pin v1. Đã đọc actual delta và source dependencies. Worker [post-freeze parse receipt](CONTROL-STATIC-PARSE-v2.json) SHA `9d0cd24de5b1e6ac1308b83eb4d6be2c0684b4d1c1cea3471535e81b6829cae4` là bằng chứng implementer về node --check7, không test và không independent rerun; dùng receipt này thay inherited parse assertion trong freeze.

## Đóng hai blockers v1

- Model `requireCurrentSource` so record hash với current fixture hash sau awaited load; precondition cũng gọi guard. Draft commit chỉ gồm synchronous validation/update sau guard, nên concurrent request giữ hash cũ không thể ghi lần hai. Read/note/review dùng cùng guard. Server kiểm current fixture hash của result trước emit cho list/read/asset/mutation, bên cạnh source recheck và lease/epoch. New concurrency test yêu cầu exactly1fulfilled/1VERSION_CONFLICT và finalrevisionf2.
- WrongRevision fixture cập nhật cả selected unit và asset triples thành r999, để selection hợp lệ rồi readUnit mới kiểm JSON identity và trả SOURCE_CHANGED. Không đổi assertion để che wrong path.

Node-only canonical adapter không đổi, vẫn exact pinned source/full-buffer PNG/hash checks, consumed-field validation và bounded final source rechecks. Server static allowlist/hash/ancestor bounds, private capability path, wrong-process cookie, Origin/Host/intent, no-store và lease guards giữ thiết kế đã đọc. Không phát hiện P1/P2 source còn mở trong phạm vi cho **bounded Node controls**; runtime assertions còn NOT_RUN.

## Invocation và giới hạn bằng chứng

Nguồn hiện có12 grouped Node tests:4adapter,5model,3HTTP. OwnerHTTP bổ sung đọc canonical14/list, exactunit, một PNG, ephemeral note và deny draft/review; không mở role/CMS hoặc human approval. Tests ghi canonical chỉ vào temp copy, không upstream. Source token/notes không được log; HTTP failure assertions chỉ so status/opaque identity/synthetic note, không dump draft body.

Sau root GO, chạy exact frozen three suites bằng OS-env allowlist/no env file, bounded outer execution với durable command/exit/cap/cleanup receipt và frozen-input pre/post checks. Có thể chạy model suite trước để xác nhận CAS/revoke, rồi adapter và HTTP; không tự retry lỗi/pin drift. `node --test server/contentReview/reviewModel.test.mjs`, tương tự `canonicalAdapter.test.mjs` và `localReviewServer.test.mjs`, cwd candidate. Đây là proposed commands, chưa chạy. [UI runner v2](UI-RUNNER-SOURCE-QC-v2.vi.md) có gate độc lập cho build/egress/neutral mocked UI; không lấy UI mocks thay backend negative results.

Không nâng tên test thành claim quá mức: temp-copy drift test gọi `verifyCurrent` **sau** list/read/asset đã hoàn tất, chưa chủ động đổi source trong pending HTTP request. Model revoke test chặn pending read/note bằng gate; OwnerHTTP hiện chưa exercise revoke/expiry đúng tại final emit. Static artifact changed/added/symlink-root assertions chưa có trong12 nhóm. Các source guards đã đọc nhưng những edge này cần independent bounded final probes hoặc ghi NOT_RUN trước khi root xét actual Owner preview. Không yêu cầu framework hoặc broad suite mới; phải freeze/review các probe mới trước invocation.

Giới hạn giữ nguyên: SHA-pinned consumed-field checks không complete JSON Schema enforcement; finite filesystem checks không atomic snapshot; notes memory expiry sweep có khoảng tối đa60s nhưng mọi access sau expiry bị deny/purge; bytes đã gửi không thể thu hồi. Fixture/Owner local capability không xác minh account, chuyên môn, tính độc lập, quyền ảnh hoặc quyết định review người thật. Native HALTED/web BLOCKED; không cloud/Auth/SDK mới/env/device/deploy hoặc canonical edits. STOP sau5.3 trước bước6.
