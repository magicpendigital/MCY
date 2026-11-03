# Independent final QA 5.3 — v1

Verifier `/root/profile46_qc`; 19/10/2026 Asia/Bangkok. **OVERALL_QA_BLOCKED: required mapped regression process chưa sạch.** Local source/control review PASS và new workspace UI15 clean PASS; không có P1/P2 source mới đã xác định. Current canonical acceptance vẫn **CURRENT_CANONICAL_REBIND_BLOCKED**. Không đổi required gate thành assertion-only PASS.

## Bằng chứng đã kiểm độc lập

[Source QC](FINAL-SOURCE-QC-v1.vi.md) SHA `00949cc5683196b217bfa87685ef64234cb8f853dbb6f732490d9a5acab42088` và [actual-current supplement](FINAL-SOURCE-QC-SUPPLEMENT-v1.vi.md) SHA `994db087848817b00222317128f340b3e8918809c24fa78a8c2a8dab2827c1fc` giữ nguyên. Chúng bind candidate `.vercel/ux-step5-3-20261018-v1`, [source255](COMBINED-CANDIDATE-SOURCE-FREEZE-v1.json) `fdfedf82b83c57f2ede7ac85bf9bb1d053604992b600fc13390b9b68375d4d6c`, [control v4](CONTROL-SOURCE-FREEZE-v4.json) `8fa517d08d99f938b76f93b11f07fe00ee8dd302155205a2fa13d6e2e0ca7c97` và [client59](BUILD-ARTIFACT-FREEZE-v1.json) `d9a5c81f5291d6404cdadff228f21acbd5f044de82382fbad991ca338ff43fda`.

- Worker Node13 actual child/wrapper0,13PASS/0skip; QC đọc TAP và2log SHA. Independent5 actual child/outer0,5PASS/0skip: static changed/added/raw-path/junction và joined HTTP source/revoke/expiry denial. Hai run là theo selected71 lúc chạy; không rerun sau upstream drift.
- Independent current adapter validation actual child/outer0:14keys,7SOURCE_CHANGED/7matched, listDeniedtrue, không payload; pre/post9control+current71 không đổi. [Receipt](current-canonical-negative-v1/receipt.json) `dd99a9a68ebfdffd358dcc831ea07942b79612796b5b46b8ab9e715e1df568c1`. Đây là negative PASS cho fail-closed, không acceptance của canonical mới.
- Root IAB actual14draft/ảnh Cobra1536×1024/identity_blocked không ảnh/focus/320 và1280px đã đọc receipt và xem3PNG. Là historical exact selected snapshot trước drift; không clinical/rights approval. [Owner stop v2](OWNER-PREVIEW-STOP-v2.json) xác minh exact PID32092/start command, private capability directory được dọn, TCP4260 đóng. Không có live Owner URL để bàn giao.
- [Official shell provision](HEADLESS-SHELL-PROVISION-EXECUTION-v3.json) `945b7132262825069dd5f1a185dbb459cd561d40e1a7d4d9d36390d173371cec`: CLI installed Playwright, fixed ignored workspace cache, OS allowlist/no provider/URL/TLS override, exit0/one internal download attempt. QC kiểm7critical evidence/manifest/exe hashes+bytes exit0; executable203034112bytes SHA `28016df6864d302434c9231e1f9f1a8a7ecc512cb2fe3faabb2a36130b96bcf1`. Root kiểm toàn613tools+7inputs; QC không nhận đó là own613rehash. No package/lock/app change.

## Hai default-headless-shell runs thực tế

Không `--channel`; same reviewed runner/proxy/config/source, static fixture server4253, deny proxy4255, OS allowlist+explicit `.invalid` fixture, fixed tool cache, no envfiles. Mỗi lệnh một lần theo root GO,600s/4MiB; không automatic retry.

| Run | Assertion | Process và egress | Cleanup |
|---|---|---|---|
| `node scripts/unit-review-run.mjs --project unit-review-ui`, run1792349197869-11504,18:46:37→18:47:05UTC |15/15PASS,26.5s,0skip |**PASS_PROCESS exit0**. Forward165; denied HTTP/CONNECT/upgrade0, cap0, localTransportErrors0, unexpected0. |Normal teardown, owned child closed,4253/4255CLOSED, timeout/capfalse. Không independent OS-wide descendant enumeration. |
| `node scripts/unit-review-run.mjs --project preserved-regressions`, run1792349257150-31992,18:47:37→18:50:38UTC |12/12PASS,2.9m,0skip |**FAIL_PROCESS exit1**. Forward171, deniedCONNECT3, localTransportErrors2, otherdenials/cap0, unexpected3. Global teardown error: egress guard rejected3unexpected requests/cap violations. |Normal teardown, owned child closed,4253/4255CLOSED, timeout/capfalse. |

QC đọc exact runner receipts, complete15 stdout và mapped12 summary/error cùng empty stderr; không chạy lại tests.12mapped là11 unchanged browser regressions +1 equivalent Node-worker38lesson contract, không12unchanged browser cases. New15 giữ strict CSP; preserved project bypassCSP chỉ cho unchanged SDK `.invalid` mocks đã review, không actual network permission. Mọi CONNECT trên vẫn bị chặn; không có bằng chứng ở receipt để gán producer hoặc kết luận app leak. Local transport errors không bị đổi thành deniedHTTP.

| Frozen evidence | SHA-256 |
|---|---|
| [UI execution](MOCK-UI-EXECUTION-v5.json) | `f48c5818005bed2f3eef8fa4fa313bb5c47283eae8a97acabcaa79dc876e1938` |
| [UI receipt](HEADLESS-UI-v1.json) | `4b33436b308073cce56cb7c039c8af0eac3fee5a6cabc01e99ec040d6d1a4766` |
| [UI stdout](HEADLESS-UI-v1.stdout.log) | `235134efe146864184b7ab341653500e5f2f617b21933cb1063c6798779bbc3d` |
| [UI proxy](HEADLESS-UI-v1-egress.json) | `740a115e2217f22a510600f3ab095b2f1c19d420dee7ea6febce7575b1d9edb3` |
| [Mapped proxy](HEADLESS-MAPPED-v2-egress.json) | `a3187a53509f233e9d9f1169cf79114a2742b55818b5aca69f427355aaa419c8` |

Mapped runner raw receipt SHA `1865dd443837d93c9df3dfa203b9b558da6dd2bcfb2d059283289e33cb2eaad7`, stdout `33939e00d5619f9e5f0efa76f7001039c5260b59c984260b3ed538a04bd8200e`, stderr empty SHA `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, trong candidate `test-results/unit-review-invocations/1792349257150-31992.*`. QC hash reads actual PowerShell exit0. [Post-pins](HEADLESS-SUITES-POST-PINS-v1.json) SHA `ec92504829bfae19cb73a417a0b0aa220a00d1f87d904b709a24854a3f76f8ca` producer record10UI/59client/613tools matched,no app change/canonical rebase; không đồng nghĩa current canonical71match.

## Disposition

Required mapped regression gate còn mở; không tự retry, filter CONNECT, đổi deny policy hoặc tuyên bố local technical final PASS. App source không bị kết luận FAIL chỉ vì tool transport/egress; exact process failure vẫn phải giữ trong handoff. Có thể trình bày source/control PASS và15newUI clean PASS riêng, cùng blocker cụ thể này.

7unit canonical drift là production-in-flight: không cập nhật selectedSnapshot/ngầm chọnrevision mới. Muốn actual Owner preview mới cần review exact version/hash rebind và gate tương ứng; trước đó giữ BLOCKED. Human5.2 qualification/identity/independence/exact assignment/actual clinical/rights decisions vẫn pending, nominations không grant; production private integration, nativeHALTED/webreleaseBLOCKED không được gate local đóng. Không mở bước6.

Final handoff/evidence bundle còn được producer chuẩn bị; report này không claim đã QC freeze tài liệu chưa có. Giữ các lần Edge/full Chromium processFAIL, socket crash, setup WAV, bootstrap Origin, installer failure/timeout và source corrections nguyên lịch sử. Không native/cloud/device/Auth/live API hoặc mutation trong final evidence review này.
