# Independent UI runner cleanup delta — v2

Reviewer `/root/profile46_qc`, 18/10/2026. **PASS_SOURCE_FOR_BOUNDED_FICTIONAL_UI_INVOCATION_AFTER_ROOT_GO**. Chỉ đọc source và kiểm hash; chưa import/test/collection/build/server/browser. Bản này đóng riêng runner blocker trong [v1](UI-RUNNER-SOURCE-QC-v1.vi.md); [backend control v1](CONTROL-PREINVOCATION-QC-v1.vi.md) vẫn BLOCKED, đặc biệt actual Owner preview và fixture exact-version control chưa được clearance.

Exact handoff mới [UI-SOURCE-HANDOFF.vi.md](UI-SOURCE-HANDOFF.vi.md) SHA `9131d6b8da83d788cb2e36d15075ed611f07706868916b31025f7b7b44da39c7`. Runner `scripts/unit-review-run.mjs` SHA `6924ae8fa1d04f8dbf13f629df1e1b458732ce702c9f50dcbf00d13c1fdb37bd`;9 owned inputs còn lại đúng pin đã review. Independent PowerShell hash/size check **actual exit0,10/10 match**; không parse/import control. Command đọc bảng pin handoff bằng regex, kiểm từng `Get-FileHash -Algorithm SHA256` + `Get-Item.Length`, throw nếu mismatch/count khác10.

Delta đã đọc: khi timeout/output cap, runner chỉ taskkill `/PID <owned child> /T /F`, helper tối đa8s; secondary deadline20s settle outcome kể cả child không close. Không target PID sau khi đã quan sát child exit; không global browser kill. Receipt ghi timeout/cap/helper exit/secondary deadline và trạng thái cleanup. Probe loopback read-only4253/4255 (negative project4265),500ms mỗi probe; open/unknown hoặc chưa chứng minh child close làm processFAIL và `UNKNOWN_DO_NOT_RETRY_AUTOMATICALLY`. Normal close+selected ports closed chỉ chứng minh owned child/listeners; normal browser descendants không được liệt kê độc lập, receipt ghi đúng giới hạn này. Không lấy taskkill request làm cleanupPASS. Forced branches chưa chạy thực tế.

Proxy exact-local deny, bounded capture/env allowlist, CSP separation và11 browser+1 equivalent Node-worker catalog assertions của v1 giữ nguyên. Root đã nhận trách nhiệm explicit frozen-input pre/post checks; runner không tự thay thế trách nhiệm đó.

Gate tách biệt:

- Root có thể GO riêng isolated `.invalid` build/artifact scan, egress-negative, collection15UI/12mapped rồi mocked UI suites theo đúng source đã review. Build phải đọc approved package/config và không copy canonical/contact vào dist; artifact scan/pins trước server. Đây không là test backend exact-version hoặc Owner authorization.
- First reviewed runner command sau GO: `node scripts/unit-review-run.mjs --project egress-negative`; chỉ local proxy negative, không import backend. Đọc actual process exit và negative assertions trước collection/browser. Collection sau đó dùng exact project/channel từ handoff; không chạy broad suite.
- UI global setup chỉ fictional mode;15UI dùng neutral mocked API, regression11 browser dùng unchanged `.invalid` SDK mocks; không canonical bootstrap hoặc actual Owner session. Không dùng kết quả các mocks để đóng backend P2 hoặc claim private Auth.
- Owner server/real draft API và final backend negatives phải chờ corrected control freeze, independent review và root GO riêng. Nếu source/backend dependency hoặc artifact đổi, kiểm lại affected pins/gate. Không automatic retry khi forced cleanup unknown.

Không app edits từ QC, canonical/root/4.7 nguyên byte; native HALTED/web BLOCKED, human5.2 vẫn BLOCKED. STOP sau5.3 trước bước6.
