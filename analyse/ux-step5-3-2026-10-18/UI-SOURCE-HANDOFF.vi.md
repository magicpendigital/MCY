# Bàn giao source UI 5.3 — chờ invocation gate

18/10/2026 · Implementer `/root/content51_plan`. **SOURCE ONLY; chưa chạy/import control, test collection, test, build, server hoặc browser.** Root GO intake/QC và addendum Owner local cho phép code trên candidate `.vercel/ux-step5-3-20261018-v1`; actual R3 control/runner review và root invocation GO vẫn cần trước thực thi. Đây không phải verdict QC/root hoặc human review5.2.

## Files sở hữu và pins tại bàn giao

Các path dưới tương đối với candidate; chỉ các file này do agent UI sửa. Shared contract/server thuộc implementer khác. Pin thay sau review phải refreeze và kiểm lại phạm vi ảnh hưởng.

| Path | Bytes | SHA-256 |
|---|---:|---|
| `src/Prototype.tsx` | 159516 | `39cc4d8434d7c43055e70d5e50a6a1d5a02388cd8979c8c4006c433ca83c79b0` |
| `src/staff/UnitReviewWorkspace.tsx` | 24604 | `20b1366173c1ed9ea7e58038befc9b69ce1ce477de5caa0890d8476b50375141` |
| `src/staff/unit-review.css` | 5390 | `4dd47ee66d5958f076933196d090d67d37c52a6839d0ec2e34509d6a06f3a33b` |
| `tests/unit-review-workspace.spec.ts` | 14177 | `251a0af5bbd2fc1e257de8670e078247abbbe604aa79290576153d59e78be72e` |
| `scripts/unit-review-global-setup.mjs` | 2110 | `40623d16459db2ba075a8f645c8c2c07361d314acb36fd1c2b7291fd5905a531` |
| `unit-review.playwright.config.ts` | 2255 | `344b74dcd524244ba43fa397b87b9169b016f5cc1d42e203e68b91f831856a45` |
| `tests/unit-review-catalog-contract.spec.ts` | 1587 | `52ab4527b4273062996c7157868b40c16a38bec6da6a3c743c54e6689ea7bb60` |
| `scripts/unit-review-egress-guard.mjs` | 4182 | `9e0ac189f37f3d00a9cfca756a96e9142c1a6bc01a6dc752c72e4d7dcd3da58b` |
| `scripts/unit-review-run.mjs` | 8271 | `6924ae8fa1d04f8dbf13f629df1e1b458732ce702c9f50dcbf00d13c1fdb37bd` |
| `tests/unit-review-egress-guard.test.mjs` | 2336 | `7461b66317a4386fd76e3042383e2c3fa7d95af2aa88deae063951801ee8a921` |

`Prototype` diff chỉ lazy import, boolean staff workspace và portal branch `?workspace=unit-review`; không thay learner routes/runtime. React portal giữ KeyboardProvider context: dùng KeyboardInput/Textarea, blur/dời mục gọi hide; MobileScroll sở hữu phần cuộn. Static source xác nhận class workspace trên `section.mobile-page`, `div.mobile-scroll` nằm bên trong nên responsive selector `.mcy-unit-review .mobile-scroll` đúng DOM.

## Hành vi đã viết, chưa nghiệm thu thực thi

- API cùng origin `/__mcy_review/v1`; import type-only từ `src/review/localReviewContract.ts`, không import canonical/server module vào frontend. Bootstrap form thuộc server; UI chỉ liên kết tới path cố định, không nhận/lưu token.
- Đóng mặc định khi không có local session; phiên chỉ từ server. Owner mode đọc nháp/source/version/media đã cấp, không có edit/review thật. Fixture mode dữ liệu trung tính, controls theo permission server, nhãn mô phỏng rõ. Notes tối đa2000 ký tự, epoch/hash/revision theo contract, chỉ memory của lease/version.
- Response malformed hoặc sai epoch/unit identity phải clear nội dung ngay. Notes/review không được trả sourceHash/revision khác; chỉ explicit draft thử mới có thể đổi version. Transport/unknown outcome khóa gửi lại đến explicit reload; không tự retry.
- Timeout request8s, expiry timer, kiểm session5s, abort/generation guards; clear trên pagehide/hidden, revalidate khi focus/pageshow/visible. Không hứa thu hồi bytes đã nhận trước khi revoke.
- Mục lục, trước/sau, alt/caption và missing/identity_blocked/not_produced; không tráo ảnh. Chọn từ danh sách dài sẽ focus/scroll reader sau khi read đúng bản. Đọc không tạo PracticeSession/Journey, không publish hoặc recommendation.

Test source dự kiến **15 case**, chưa collection: closed/no learner auth; Owner/version/media; note uncertainty; fixture rehearsal; ba mutation mismatch; stale session/read; expiry; version conflict; malformed permission; danh sách14 mục keyboard/narrow/large text; ba responsive320×640,844×390,1280×900. Đây là neutral fixtures, không canonical content/ảnh hoặc liên hệ thật.

## Static checks thực tế và lịch sử

Working directory `D:/Projects/MCY`, Windows PowerShell/Node hiện có. Không dùng command nào import UI/control hoặc gọi provider.

- `node node_modules/typescript/bin/tsc --noEmit -p .vercel/ux-step5-3-20261018-v1/tsconfig.json`: **PASS exit0** sau source sửa. Lần đầu FAIL lỗi narrowing unknown của validator/callback; đã sửa, giữ lịch sử failure này.
- `node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module ESNext --moduleResolution bundler --esModuleInterop --skipLibCheck --types node .vercel/ux-step5-3-20261018-v1/tests/unit-review-workspace.spec.ts .vercel/ux-step5-3-20261018-v1/unit-review.playwright.config.ts`: **PASS exit0**. Lần spec đầu thiếu `--ignoreConfig` FAIL TS5112; lần thêm config chưa chỉ `--types node` FAIL process declaration; command cuối đúng flag PASS, không thay package.
- `node --check .vercel/ux-step5-3-20261018-v1/scripts/unit-review-global-setup.mjs`: **PASS exit0**, parse-only.
- Đã đọc diff Prototype so approved4.7: đúng narrow wire; `git diff --no-index` exit1 biểu thị có diff, không phải test PASS/FAIL.
- Filesystem/static whitespace/new-contact/import check trên4 file UI ban đầu **PASS exit0**: ba file mới không email, Prototype contact-pattern set bằng baseline, không import canonical/control. Check no-email toàn Prototype ban đầu FAIL do pattern cũ, sau đó so baseline; không log email thô. Các source delta P2 và runner mới cần nằm trong freeze/control review mới, không kế thừa static verdict của bytes trước.
- Sau P2, kiểm whitespace/no-contact/forbidden-frontend-import trên5 file mới lúc đó **PASS exit0**; handoff link1/1 tồn tại. Config và Node-worker contract vừa bổ sung đã static typecheck cùng UI spec **PASS exit0** với command trên cộng `tests/unit-review-catalog-contract.spec.ts`; setup parse-only tiếp tục **PASS exit0**. Không có test collection hoặc execution trong các kết quả này.
- Sau runner egress delta, `node --check` trên `unit-review-egress-guard.mjs`, `unit-review-global-setup.mjs`, `unit-review-run.mjs`, `unit-review-egress-guard.test.mjs` và standalone config TypeScript check **PASS exit0**. Chỉ parse/typecheck; negative test source chưa được import/chạy. Các pin runner cũ đã supersede bằng bảng10 file hiện tại, không mang verdict actual-control cũ sang source mới.
- [Runner source QC v1](UI-RUNNER-SOURCE-QC-v1.vi.md) đã giữ invocation BLOCKED vì SIGTERM direct-child rồi chờ close vô hạn. Delta source sau đó thay bằng bounded owned-tree cleanup và receipt classification bên dưới; `node --check scripts/unit-review-run.mjs` **PASS exit0** trên pin mới6924ae…37bd. Chưa chạy timeout/cleanup branch hoặc nhận QC acceptance mới; không đổi verdict v1.

## Runner source để independent QC đọc trước invocation

Đã đọc original `scripts/playwright-global-setup.mjs` (`6cb18bae67a2cb2fdc35fa6925886cb1b54ce659b657fc9740ed1f21314660d1`): dùng Vite với override loopback nhưng không boundary static riêng5.3. Runner mới **không dùng setup này hoặc Vite**; dùng `createLocalReviewServer` fictional mode và artifact static đã build riêng. Tái dùng unchanged isolation helper (`f475bbd3e419259f043e4dd3c603b6733a33ece980cbc4df4f1de22c3406b4c0`) để `.invalid`/fictional publishable key và strip known server env. Helper không biến fixture thành real Auth.

Dedicated setup yêu cầu built JS chứa cả URL/key fixture trước start; bootstrap files chỉ ở private ignored folder ngoài candidate, không đọc/print/gửi browser mocks; teardown gọi server close. **Artifact directory đã đối chiếu source:** server static root hiện là `candidateRoot/dist/client`, cùng artifact với marker check `dist/client/assets`; bootstrap redirect tới `/?workspace=unit-review&mode=web`. Lệch `dist` cũ đã được server implementer sửa; không đổi protected build config. Server/control/runner dependencies và built artifact vẫn cần frozen R3 review riêng.

Server CSP giữ `connect-src 'self'`. Project `preserved-regressions` dùng `bypassCSP:true` chỉ cho SDK/mock `.invalid` cũ trong process `fictional_rehearsal`; không áp dụng project15 reader UI hoặc Owner actual preview, không chứng minh CSP/real private authorization. Original free-course contract browser-import `/src/courses/freeCourses.ts` không phù hợp strict static server. **Root đã GO bounded source substitution:**11 unchanged browser cases +1 equivalent Node-worker contract `unit-review-catalog-contract.spec.ts` import approved FREE_COURSES trong test worker, giữ nguyên tập assertions38record; original file giữ nguyên và không mở `/src`. Tổng12 mapped regression, không phải12 unchanged browser cases. Exact grep escaping và denominator phải được collection xác nhận sau invocation GO.

**Egress delta cần actual QC mới:** config ép browser qua deny proxy `127.0.0.1:4255`, `bypass:'<-loopback>'`; proxy chỉ forward HTTP tới exact `127.0.0.1:4253`. Mọi HTTP đích khác/CONNECT/upgrade bị deny; cap10000 request, body16384 bytes, local-forward timeout10s. Proxy ghi receipt counts-only trong `test-results/unit-review-5-3/egress-<time>-<pid>.json`, không destination/header/body/capability; teardown đóng sockets/proxy/server và throw nếu có denied/cap violation. Receipt không chứng minh mọi lời gọi bị test mock hấp thụ: không có context catchall; route `.invalid` được intercept trước network, proxy chỉ đo transport chưa được mocks xử lý. Đây là giới hạn minh bạch của runner; actual Owner CSP không đổi.

Negative source test `unit-review-egress-guard.test.mjs` chỉ request tới proxy loopback: kiểm positive local-forward và remote `.invalid` bị403 trước network, receipt ghi failure aggregate nhưng không lưu destination/sentinel. Test tự assert negative rồi kết thúc PASS nếu control đúng. Chưa chạy nên chưa có negative proof thực tế.15UI+11 browser mock regressions sau này phải đồng thời PASS với egress receipt0 unexpected để chứng minh đường mock mong đợi vẫn hoạt động; không lấy parse pass thay điều đó.

`unit-review-run.mjs` là entry point được đề nghị cho invocation: child env chỉ allowlist biến OS cần Node/browser, cộng fixture URL/publishable key `.invalid` rõ ràng và proxy loopback; không kế thừa server/provider/Auth secrets, NODE_OPTIONS hoặc đọc env file. Chỉ nhận ba project đã chốt, channel giới hạn msedge/chrome/chromium, optional `--list` cho Playwright. Timeout120s cho collection/negative,600s cho suite; output cap4MiB. Logs/exit/signal/PID/caps nằm riêng `test-results/unit-review-invocations/<runid>.*`; receipt chỉ ghi tên biến OS, không giá trị hoặc secret. Process success không thay asserted test outcome/denominator, cần đọc logs và egress receipt.

Timeout/output cap chỉ kích hoạt **một** cleanup attempt. Trên Windows, khi owned child PID còn active và chưa quan sát exit/close, runner spawn `taskkill.exe` bằng argument array `/PID <owned-child.pid> /T /F`, `shell:false`, `windowsHide:true`; không tìm/kill theo port hoặc xử lý PID không thuộc runner. Helper có deadline8s. Secondary deadline20s kết thúc chờ kể cả child không close: đóng các owned pipe, unref handle và ghi kết quả UNKNOWN; không automatic retry. Nếu đã quan sát parent exit, không taskkill PID đó để tránh target PID có thể tái sử dụng. Non-Windows chỉ dừng direct owned child và ghi giới hạn tree cleanup, không suy tương đương Windows.

Sau close/deadline, probe read-only tối đa500ms cho4253/4255 (negative test:4265), không kill listener. `cleanup.verified` chỉ xác nhận owned child close + selected listeners closed, và nếu forced thì cần OS taskkill success/no deadline; normal browser descendants không được enumerate và receipt ghi rõ điều đó. Nếu không chứng minh được trong phạm vi này: `UNKNOWN_DO_NOT_RETRY_AUTOMATICALLY`, process FAIL. Tổng bound chờ process là timeout chính +20s secondary, cộng probe/receipt I/O; không suy timeout chính600s là toàn bộ thời gian. Root giữ outer freeze/cleanup checks, không có generic pin framework mới.

Sau R3/root invocation GO, lệnh dự kiến, **cwd candidate**:

```powershell
node scripts/unit-review-run.mjs --project egress-negative
node scripts/unit-review-run.mjs --project unit-review-ui --channel msedge --list
node scripts/unit-review-run.mjs --project preserved-regressions --channel msedge --list
node scripts/unit-review-run.mjs --project unit-review-ui --channel msedge
node scripts/unit-review-run.mjs --project preserved-regressions --channel msedge
```

Project regression chọn11 title browser trong [intake](TASK-INTAKE.vi.md) và1 Node-worker equivalent đã nêu, chỉ5 file test đã map; không toàn staff suite. Collection `--list` cũng nằm sau invocation gate. `msedge` ở lệnh trên là lựa chọn dự kiến cần xác nhận môi trường; chưa có browser/device chạy. Build/runtime/catalog/bundle/Sites/isolation regressions do root/runner phù hợp thực hiện và ghi evidence mới.

## Root browser verification dự kiến sau gate

CLI source hiện có `server/contentReview/startLocalReview.mjs`; source đã đọc, chưa chạy. Sau actual R3/root GO và static fixture artifact được build/scanned, từ candidate có thể start một process Owner bằng:

```powershell
node server/contentReview/startLocalReview.mjs --mode owner_local_preview --port 4254
```

Đây là lệnh chuẩn bị, không process đang chạy. CLI chỉ xuất PID/origin/mode và đường dẫn bootstrap file, không capability bytes. Root mở `http://127.0.0.1:4254/__mcy_review/v1/bootstrap`; form có heading `Local review access`, password label `One-use local capability`, nút `Continue`. Capability được operator đưa từ kênh private out-of-band vào field trong bộ nhớ; không URL/log/chat/receipt/localStorage. Submit thành công redirect workspace `mode=web`. Không tự xác minh Teacher/Reviewer từ phiên này.

Root kiểm trực tiếp scope/version/hash đúng snapshot, count theo receipt thực tế, các ảnh eligible và missing/blocked label, mục lục/focus/scroll, không edit/review/publish control Owner, ghi chú ephemeral và clear khi lease mất hiệu lực. Không dùng xem ảnh làm chuyên môn/rights approval. Stop process qua CLI signal để teardown; bytes đã nhận không thể bị thu hồi hồi tố. Server/CLI pins do control implementer/final freeze sở hữu; UI handoff không thay control verdict.

Không sửa root app, protected runtime, package/lock, canonical, cloud/native/Auth/roles/mail/AI. Rollback bằng bỏ candidate; native HALTED/web BLOCKED và human expertise/rights còn pending. Sau final QC/root: **STOP chờ Owner trước bước6/integration/release khác**.
