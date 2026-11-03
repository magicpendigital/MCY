# Independent R3 control source review 5.3 — v1

Reviewer `/root/profile46_qc`, 18/10/2026. **Verdict: BLOCKED_INVOCATION — cần sửa exact-version race và negative fixture trước root GO.** Không import module, chạy test/collection/build/server/browser; không sửa implementation, canonical, approved4.7 hoặc root app. Đây là pre-invocation source review, không final acceptance.

## Inputs và bằng chứng thực tế

[CONTROL-SOURCE-FREEZE-v1.json](CONTROL-SOURCE-FREEZE-v1.json) SHA-256 `fabca0c4b8068c3b17713e5331ba5f458e3fb729263dbaf69583025dfc5de884`:9 source/contract/snapshot/tests,71 canonical dependencies (schema+inventory+14units+55assets). Independent read/hash/size command **actual exit0**, UTC `2026-10-18T15:56:02.3627584Z`,9/9 source +71/71 canonical match, mismatches0. PowerShell đọc freeze bằng `Get-Content -Raw | ConvertFrom-Json`, kiểm `Get-FileHash -LiteralPath ... -Algorithm SHA256` và source bytes theo từng record; throw/exit1 nếu mismatch. Không thực thi canonical validator/generator.

Đã đọc trọn adapter/model/server/CLI/shared contract và ba suite; snapshot/pins được đối chiếu theo freeze. UI/runner review riêng tại [UI-RUNNER-SOURCE-QC-v1](UI-RUNNER-SOURCE-QC-v1.vi.md), đang BLOCKED vì forced-close bound/cleanup; không kế thừa source verdict sang bytes mới.

## Hai điểm phải sửa

1. **P2 — stale fixture record vượt optimistic version check.** `reviewModel.mjs:179–193` tải cloned record qua await; `precondition` so body với record cũ. Hai draft đồng thời cùng author/f1/hash1 đều có thể commit: request đầu ghi f2 và cập nhật assignment của author; request sau kiểm lease với assignment mới vẫn hợp lệ, nhưng so body với record f1 đã giữ từ trước rồi ghi f3. Tương tự read/note giữ record trước await có thể tiếp tục sau draft của cùng actor. Cần kiểm record vẫn đúng current fixture hash/revision sau await và ngay trước commit; không dựa UI pending để khóa direct HTTP. Thêm negative concurrency xác định một successful draft, một VERSION_CONFLICT và chỉ tăng revision một lần; kiểm stale read/note thích hợp bằng cùng bounded mechanism.

2. **P2 control-test — wrongRevision không vào intended path.** `canonicalAdapter.test.mjs` chỉ đổi selected unit revision thành r999, để asset triples ở r1. `createCanonicalAdapter` throw đồng bộ INVALID_INPUT vì asset trỏ unselected triple, trước `assert.rejects(readUnit, SOURCE_CHANGED)`. Sửa fixture coherent để kiểm exact JSON identity mismatch hoặc tách đúng sync selection rejection; không đổi expected để che sai path.

## Source boundary đã kiểm và giới hạn

Mode cố định tại process start; fictional không tạo canonical adapter, Owner chỉ list/read/asset/note. Actor đến từ capability server-side, không query/role flag. Per-process cookie name/token khó đoán, HttpOnly/SameSiteStrict, exact Host/Origin/Sec-Fetch-Site, intent+JSON cho mutations; bootstrap one-use, expiry và private path ngoài candidate. CLI chỉ log path/PID/mode, không capability. Không SDK/provider mới hoặc persisted notes/canonical writes.

Static root kiểm dist/client ancestors, within-candidate; startup allowlist hashes và request hash checks, không source/raw JSON fallback. Canonical path allowlist, symlink ancestors, bounded regular-file reads, selected SHA, unpublished flags, inventory join và namespaced media pins. Asset buffer/MIME/PNG signature được kiểm trước first byte; server final source + lease/epoch checks sau awaits trước send. Note purge khi revoke/expiry access và periodic sweep; close xóa maps, connections và capability directory. Đây là source design, chưa proof runtime. Schema SHA + consumed-field invariants được kiểm; **không complete JSON-Schema validator**. Final rechecks không là atomic filesystem snapshot và không thu hồi bytes đã gửi.

## Negative gate còn phải có trước actual Owner preview

Suites hiện có9 grouped tests dự kiến (chưa collection/run) kiểm adapter14/55/25, bad pin/selection/path/symlink; model actor/revision/revoke/expiry/notes; fixture HTTP one-use/wrong token/Host/Origin/intent/raw path/wrong-process cookie và expiry. Source-only counts không là PASS.

Cần bounded group chứng minh HTTP Owner mode từ chối draft/review và current-source/lease drift không emit private result; test hiện chỉ toggle mock `verifyCurrent` rồi gọi verifier tách biệt, chưa nối nó với HTTP response path. Negative controls cho static artifact changed/added ngoài startup allowlist và symlink root cũng cần được map nếu claim boundary này đã exercised. Không cần framework mới hoặc broad suite; dùng copied neutral/local fixtures và exact selected pins, không mutate upstream.

Sau source correction/refreeze, QC đọc delta trước root invocation GO. Root có thể dùng explicit pre/post frozen-input verification thay runner framework; phải ghi actual commands/exits và stop khi pins drift. First commands nên là bounded Node negatives/egress trước collection/browser; build/static artifact scan+pins trước Owner server. R3 source clearance không cấp real account/role/qualification/independence/human decision, native hoặc release acceptance. STOP sau5.3 trước bước6.
