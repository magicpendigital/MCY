# Owner start/stop reuse plan — PREPARED, NOT INVOKED

Chỉ dùng sau Node13/QC/root GO riêng, không dùng preparation GO hoặc Node invocation GO để khởi động Owner server. Source/control/59client/71canonical phải còn khớp `CANDIDATE-FREEZE-v1.json` SHA `6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e`. Không sửa app hoặc CLI. Các receipt startup/stop cũ là lịch sử, không rerun/overwrite.

Command duy nhất dự kiến, cwd candidate mới:

```text
C:/Program Files/nodejs/node.exe server/contentReview/startLocalReview.mjs --mode owner_local_preview --port 4260
```

Trước launch: xác nhận4260 không có listener; nếu có bất kỳ listener/process không khớp ownership mới, dừng không kill theo tên/port. Kiểm source/client/canonical cùng root35dirty/old source/evidence. Child ProcessStartInfo WorkingDirectory candidate mới, UseShellExecute=false, CreateNoWindow=true, environment.Clear rồi6OS keys `SystemRoot,WINDIR,PATH,TEMP,TMP,USERPROFILE`; tuyệt đối không NODE_OPTIONS/provider/env-file. Có thể Start-Process nếu cần nhưng phải WindowStyle Hidden; ưu tiên ProcessStartInfo để tránh cửa sổ. Redirect stdout/stderr vào receipt folder mới `owner-preview-v1` ngoài candidate và không ghi capability value. Process stdout chỉ JSON pid/origin/mode/bootstrapFiles paths do CLI kiểm soát; parse đúng một startup line, ghi PID+creationUTC+executable+exact command/cwd để bind ownership. Private directory riêng do server tạo dưới `.vercel/local-review-private/review-*`; đường dẫn không phải capability value và không trở thành static content.

Health chỉ GET bootstrap form cùng origin kiểm no-store/CSP/mode startup, không gọi canonical endpoint không auth hoặc thử write. Root dùng browser của chính root, one-use bootstrap form và capability file qua kênh local đã có; capability value không ghi stdout, log, URL, receipt hoặc localStorage. Root chọn7unit mới chỉ đọc, kiểm câu exit phù hợp cùng asset/blocked label; không notes/edit/review/approval/assignment. TTL hết hoặc bootstrap hỏng thì ghi BLOCKED, không tự restart/extend/bypass. Root quyết định bounded recovery nếu cần. Browser evidence giữ phân biệt local viewing với human content/rights approval.

Stop sau root kiểm: chỉ exact owned PID với executable,creationUTC,commandLine khớp startup receipt; tránh PID reuse. Ưu tiên SIGTERM/CLI close nếu có owned session; nếu cần Stop-Process thì check identity ngay trước stop và ghi exact PID, không global kill. Xác nhận process absent và4260 closed. Nếu CLI close chưa dọn privateDir, kiểm Resolve-Path privateDir nằm trong resolved `.vercel/local-review-private` base, expected review-* folder từ receipt, không reparse point/symlink và không bằng base; rồi mới native PowerShell Remove-Item -LiteralPath exactPrivateDir -Recurse, không ghép shell. Không đọc capability để cleanup. Ghi stop receipt riêng, giữ unknown/failure nếu cleanup không xác minh được.

Sau stop kiểm255/59/71 +rootdirty/old evidence nguyên vẹn; user-facing handoff URL chỉ hiển thị khi process hợp lệ còn sống, không quảng bá URL đã dừng. Không cloud/Auth/SQL/device/deploy/inference; native/web gates giữ nguyên. Dừng chờ Owner sau final root verification.
