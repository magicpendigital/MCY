# Bổ sung QC — actual current canonical denial

Verifier `/root/profile46_qc`; bổ sung độc lập sau [FINAL-SOURCE-QC-v1](FINAL-SOURCE-QC-v1.vi.md), SHA `00949cc5683196b217bfa87685ef64234cb8f853dbb6f732490d9a5acab42088` giữ nguyên byte. Không rebase selectedSnapshot hoặc thay source/upstream.

Root GO đã cho đúng existing-export expression trong [receipt](current-canonical-negative-v1/receipt.json). Một lần chạy `node --input-type=module -e <expression recorded verbatim in receipt>`, cwd `D:/Projects/MCY`, UTC18:35:58.3782527Z→18:36:05.1200798Z ngày18/10/2026, **child0/outer0**. Node chỉ import `canonicalAdapter.mjs`, đọc selectedSnapshot đã pin, gọi `verifyCurrent(key)` cho14 keys và `listUnits()`; không harness/source hook mới.

**PASS_EXPECTED_CURRENT_DRIFT_DENIAL:** selected14, changed7, matched7, listDeniedtrue, payloadEmittedfalse. Các7 unit source đã đổi bị `SOURCE_CHANGED`; listUnits không trả danh sách. Đây là kiểm adapter thực tế trên current bytes, không HTTP denial hoặc kiểm từng asset qua browser.

| Evidence | SHA-256 |
|---|---|
| [Receipt](current-canonical-negative-v1/receipt.json) | `dd99a9a68ebfdffd358dcc831ea07942b79612796b5b46b8ab9e715e1df568c1` |
| [Counts-only stdout](current-canonical-negative-v1/stdout.log) | `3423011fce0a8239303cd2549b7f9a74f1501ffdcb58c5f995cc094cebf23cd0` |
| [Empty stderr](current-canonical-negative-v1/stderr.log) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

Pre/post9control pins (bao gồm selectedSnapshot) +71 current canonical pins khớp nhau,0 input đổi trong run;7/71 vẫn khác historical selected snapshot. [Pre](current-canonical-negative-v1/pre-pins.json)/[post](current-canonical-negative-v1/post-pins.json) giữ hash observations, không ghi content. Child chỉ nhận6 OS keys (`SystemRoot/WINDIR/PATH/TEMP/TMP/USERPROFILE`), không envfile/provider/NodeOptions; giới hạn30s/1MiB, không chạm cap/timeout, owned child exited. Output chỉ counts/booleans, không body/token/contact. QC đọc lại stdout và kiểm2 log hashes, actual PowerShell exit0.

Thay đổi duy nhất về bằng chứng: phần current7 denial ở report v1 từ source inference đã có actual negative theo export được duyệt. **CURRENT_CANONICAL_BLOCKED và OVERALL_QA_PENDING vẫn giữ.** Historical Node13/independent5/root actual14 UI không bị chạy lại hoặc sửa. Không có HTTP/server/browser/capability, app/canonical mutation, human approval hoặc bước6 trong lần này.
