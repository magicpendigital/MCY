# Node13 invocation plan — snapshot rebind

PREPARED / CHƯA CHẠY. Candidate freeze: `CANDIDATE-FREEZE-v1.json` SHA256 `6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e`. Cần independent actual-selection QC và root invocation GO trước execution. Không dùng preparation GO làm phép chạy test.

Command đúng tại `D:/Projects/MCY/.vercel/ux-step5-3-rebind-20261019-v1`:

```text
C:/Program Files/nodejs/node.exe --test server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs
```

Dùng pattern `analyse/ux-step5-3-2026-10-18/run-control-node-v4.ps1` đã đọc làm cơ sở ghi nhận; không chạy wrapper cũ vì nó bind candidate/GO/pins lịch sử. Một ProcessStartInfo mới đặt WorkingDirectory candidate mới, UseShellExecute=false, redirect stdout/stderr, ArgumentList tách từng đối số trên. Clear child environment rồi chỉ thêm `SystemRoot,WINDIR,PATH,TEMP,TMP,USERPROFILE`; không NODE_OPTIONS/provider/SDK/env-file. Dùng Node executable path đã resolve ở trên; timeout60000ms, nếu timeout kill đúng child process tree và ghi FAIL, không blind retry. Pattern Task async drain stdout/stderr tránh pipe blockage.

Trước child: đối chiếu SHA freeze và exact root invocation GO mới, verify255 sourceFiles+59 clientFiles+71 canonicalDependencies theo full repo-relative path trong freeze; chặn nếu lệch. Output folder duy nhất mới `analyse/ux-step5-3-snapshot-2026-10-19/node13-v1`, refuse nếu có. Ghi stdout.tap,stderr.txt,receipt.json; receipt gồm start/endUTC, executable/version, command/cwd, environment key names only, freeze/GO SHA, exit,timeout, TAP summary, pre/post mismatch arrays, output SHA. Sau child kiểm lại cùng255/59/71 và root35dirty/old evidence pins. Wrapper exit1 nếu child lỗi/timeout/pins lệch, dù TAP hiển thị pass. Chỉ PASS khi process exit0,13pass/0fail/0skip và pins không đổi. Giữ mọi failure nếu có; xin root quyết định scope tiếp theo, không sửa checker hoặc hạ assertion.

Các Node tests tạo HTTP fixture trên loopback ephemeral port và temporary data để kiểm control, không phải startup actual Owner preview hoặc native/cloud acceptance. Không mở4260 hay browser, không notes/review/edit canonical/approve/publish. Independent QC có thể chạy negatives riêng sau root GO; source/control thực vẫn không đổi.
