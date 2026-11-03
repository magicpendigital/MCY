# Independent R3 WAV delta review — v3

Reviewer `/root/profile46_qc`, 18/10/2026. **PASS_SOURCE_FOR_BOUNDED_NODE_AND_MOCK_UI_AFTER_ROOT_GO**; chưa invocation từ QC. [v2 source verdict](CONTROL-PREINVOCATION-QC-v2.vi.md) giữ nguyên, v2 runtime12/12 là lịch sử đúng source04aae; không carry sang source v3.

[Control freeze v3](CONTROL-SOURCE-FREEZE-v3.json) SHA `a919d6f3f90b16a1e922b6ae2c1cf81f685b4118615d972b33c5d30bd7f21664`; [correction](CONTROL-CORRECTION-v3.vi.md) SHA `7ad7e24afa52b1471ccbfa57fac7cf5279149956df6638c2aff39aa8df788444`. Independent PowerShell read/hash/size check **actual exit0,9source+71canonical+9v2-preimage pins match**. Diff đọc trực tiếp từ archived v2: chỉ `localReviewServer.mjs` và HTTP suite đổi; `git diff --no-index` exit1 nghĩa có expected diff, không test failure.

`.wav` được thêm vào extension allowlist hiện có; startup đòi ít nhất12bytes, RIFF ở0/WAVE ở8 trước khi pin hash. MIME audio/wav; request vẫn phải đúng startup path/hash/size, symlink/containment guards giữ nguyên. Không fallback arbitrary type, raw source hoặc canonical media; không thay CSP/no-store. Đây là container signature check, **không full WAV decode/playback validation**.

New Node case kiểm bounded neutral buffer positive/no-store/exact bytes, sau đó invalid signature bị chặn trước startup. Suite source mới13 grouped tests, chưa chạy; cần actual exit trước acceptance. Ba WAV baseline trong actual artifact được root kiểm theo báo cáo riêng; QC này không claim independent playback hoặc scan lại59 artifact files.

Gate: root có thể release exact frozen Node suites và mocked UI rerun với reviewed runner6924, `.invalid` build59artifact +10UI inputs được root pin pre/post. Giữ original mock setup failure (0body) và v2 Node12PASS như lịch sử. Bounded independent final probes được rebind v3/new outputs riêng và cần root source-read/GO trước chạy; actual Owner preview chưa GO. Local source/rechecks không atomic FS, không real identity/rights/human content approval/native/release. Không source mutation bởi QC; STOP sau5.3 trước bước6.
