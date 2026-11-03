# Review độc lập candidate UX — 14/10/2026

Reviewer `ux_review`; candidate `D:\Projects\MCY\.vercel\ux-implementation-20261014`. Mức cao nhất R3 do trải nghiệm Auth/consent. Chỉ đọc source, diff, các fixture và evidence; chỉ sửa báo cáo này. Không chạy browser suite, cloud, `.env`, native, deploy, email hoặc AI. Root chịu trách nhiệm final UI/build/runtime/scanner và visual QA.

Đã đọc AGENTS, `skills/mcy-change-review/SKILL.md` + matrix, `skills/mcy-brand-ux/SKILL.md`, brand/design/tokens, PLAN, hai handoff, baseline và coverage/config Playwright. Dated plan nói packet native 14/10 pending là snapshot lịch sử; AGENTS mới nhất có approval/install riêng, không cấp phép candidate UX hay web release.

## Kết quả review lại source cuối

**Hai P2 đã đóng bằng source review; không còn P1/P2 trong phạm vi candidate UX + QA harness đã đọc.** Root sau đó báo full UI cuối **167/167 PASS exit0** và focused state17/17 PASS; reviewer đối chiếu JSON đã lưu, không rerun browser. Các kiểm chứng này không cấp release/native/live clearance. Phần evidence cuối bên dưới thay trạng thái test-pending ở lượt review đầu.

- P2 nháp rỗng: `hasCheckinTransferDraft` chung ở Prototype:246 kiểm đúng route và bodyStatus/preObservations/energy/pending payload. ConsentScreen:1197, ConsentFooter:1212/:1240 và OnboardingScreen:1270/:1290 đều dùng điều kiện đó. Không tự bật quyền; existing profile thiếu/stale required consent không có draft sẽ chỉ ghi required consent hiện hành. Test mới có ma trận missing/stale × actual/no draft, kiểm consent event purposes, 0/1 check-in và 0 profile writes.
- P2 loading: `checkinReadStatus` riêng chỉ hydrate lifecycle đặt loading/ready/error; reset guest/account giữ ready. Writer vẫn giữ pending key/payload khi lỗi nhưng không đổi readstatus. Journey:133–146 dùng readstatus, phân biệt pending save notice + CTA, không diễn đạt history chắc chắn trống khi save chưa xác nhận. JourneyRoute Prototype:802–805 quay về checkin step2 nếu pending, giữ edits/key/payload; nếu không pending mới reset cho check-in mới. Error hướng dẫn reload ứng dụng. Fixture mới kiểm writer abort → Journey không read-loading → pending CTA → edits còn → retry byte-equivalent payload. Không khẳng định server không commit sau abort.
- Review lại không thấy actor/route/generation/canDispatch guard bị giảm, không đổi backend/runtime/server policy. Remote result có thể được ghi state trên cùng actor sau route leave theo contract cũ, nhưng caller không tự clear/navigate khi continuation mất hiệu lực.

Hashes source trực tiếp: Prototype `1ba0188b54edd5d34eaeb04dc2d4ccbc51da3073cc440564f4db3140fc623c03`; Journey `681eb452fadcc0bbfebd3fb12784237de6837ff7385c4e49d4b564fc0a8f2a70`. `tsc --noEmit` chạy độc lập lại trên hai source đó **PASS exit0**. Test sources tại readback: save `e93cff373c22efda83b47e2706ffc34ac7aec2b9ba46741b9c88941b22410e00`, Journey `c7d3aa7280e9f23d236752d1cd529b30396c72535fd6715f678c8f47cbe075b9`; reviewer đọc assertions nhưng không chạy browser.

## Lượt source đầu — findings đã sửa

Lượt đầu có 2 P2 dưới đây; source/hash và line numbers là snapshot trước fix, giữ để audit. Trạng thái hiện hành nằm ở phần review lại phía trên.

1. **[P2] Nhánh ConsentFooter vẫn coi đường quay lại là nháp có dữ liệu.** Candidate `src/Prototype.tsx:1199`, `:1227–1228` và copy `:1184`. Tài khoản đã có profile nhưng required consent thiếu/stale; khách mở check-in không chọn body/energy, đăng nhập từ nút tùy chọn, rồi xác nhận required consent với wellbeing granted. `hasTransferDraft` chỉ kiểm onboardingComplete + authReturnTo và writer được gọi `practice_preparation` với nháp trống. Đây là hành vi kế thừa còn sót trong phạm vi F11/all-callers, dù OnboardingScreen mới đã kiểm nội dung nháp. Dùng chung predicate có dữ liệu cho copy, footer và writer; thêm fixture existing profile/stale required consent/no draft, kiểm 0 check-in POST và không hiện chuyển nháp.

2. **[P2] Lỗi lưu để lại status loading, khiến Journey báo đang đọc mãi.** Candidate `src/JourneyScreen.tsx:133–146` dùng chung backendStatus làm trạng thái đọc. `src/Prototype.tsx:424` đặt loading trước writer nhưng catch standalone `:1436–1441` chỉ đặt lỗi local. Sau writer abort/failed, tới Khám phá rồi Hành trình với 0 bản ghi sẽ gặp “Đang tải bản ghi…” vô hạn và mất empty CTA; mở lại Journey không bắt đầu hydration. Đây là tương tác mới với Journey loading branch. Tách trạng thái đọc hoặc settle trạng thái shared sau lỗi trên đúng actor/generation; giữ pending key/payload. Fixture cần failed save → Journey, không chỉ save alert/retry.

## Những phần đã trace

- `persistCurrentCheckin`: kết quả account/session/denied/cancelled riêng; permission denied không append/clear/navigate ở standalone. Local history chỉ guest standalone đã opt-in. Cả ba callers đọc; continuation trước/sau clientprep, generation, actor và route vẫn giữ. Guard không hủy RPC đã dispatch.
- Uncertain save dùng lại pending payload/key; standalone so sánh draft hiện tại với record đã xác nhận và giữ edits nếu khác. Không sửa RPC/payload/server Auth hoặc consent policy.
- Onboarding không draft chỉ ghi profile, nhãn phản ánh side effect; có draft quyền tắt không writer, nháp được giữ; account security action vẫn login tài khoản khác; notification copy nói tính năng chưa mở.
- Journey chọn latest khi chưa có lựa chọn, pin ID khi chủ động chọn ngày/record/trend, giữ ngày trống, reset state/sheets theo actor key. Loading/error/empty riêng; bản ghi đang có vẫn xem được khi read loading/error. Outcome khó chịu hơn/chưa rõ/skip không bị đổi thành improvement. Delete contract kế thừa; không tuyên bố live deletion acceptance.
- Fixture mới kiểm real app save path, payload/count, guest opt-in/reload loss, uncertain exact retry/edits, delayed getSession leave-route, dispatched response account switch, onboarding profile retry/has draft/no draft và truthful labels. Journey fixture dùng real component nhưng stub map/editor, atomic synthetic patch; kiểm selection/hydration/account reset/VI+EN empty/session+worse. Những fixture đó có ý nghĩa nhưng không thay live/native/server boundary hoặc pixel typography QA.

## Evidence trực tiếp của reviewer

- `node ../../node_modules/typescript/bin/tsc --noEmit`, cwd candidate: **PASS exit0**. Source lúc chạy: Prototype SHA256 `9e87921c285ce9cd5065664805d6638ddf22300c50f1bcc5f3deff6cc6799cf8`; Journey SHA256 `76e084a037e452ce188aa194b2355ed4503d0500e0853aa33b0278e37b7a8523`.
- SHA256 đối chiếu 37 baseline inputs: root **37/37 match**, candidate khác đúng Prototype/Journey; 35 backend/package/protected-runtime inputs chọn kiểm giữ nguyên. Đây là subset, không phải full manifest verification. Root Prototype `32c100fbcd7433f6db2c6c299556adb22633d5cd8ecd9da01ca5420515287482`; root Journey `9857c1129184c26a6068c465628afac16c7890d3dc42db0e7b6120946f191255`.
- Không rerun browser. Worker reported final app source 12 save cases có PASS qua full11/12 + targeted1/1, không gọi là full12 exit0; Journey10/10 exit0. Root final suite đang chạy, chưa ghi PASS thay root.

## QA harness root

Đọc `qa-global-setup.mjs` SHA256 `29dec64601484a3adc225a4749ac145b20b956e14605a5d1377ad1517e809867` và `qa.playwright.config.mjs` SHA256 `1b7f7b88d56f073f28f077d3ed9b67ca1c0cce57a485f530f62c1de8eca67829`. Hai `node --check` độc lập **PASS exit0**; không khởi động server/browser từ reviewer.

Setup chỉ định candidate root/envDir; assert bốn development env files không tồn tại, xóa mọi inherited VITE_ trước isolate fixture `.invalid`, loại known server credentials. Vite fs allow đúng candidate + root/node_modules cho font, loopback4190/strictPort; config protected không đổi/không loadEnv. Listen failure đóng server; teardown trả `server.close()` awaited. Config testMatch chạy *.spec.ts và ghi JSON/report/output riêng. Không còn P1/P2 trong source harness này; isolation không phải general secret scan hay hard security sandbox.

Root reported intermediate full **160/162 exit1**, hai failure từ locators cũ (purpose+label toggle và English empty Journey badge). Reviewer đã được thông báo sửa expectation theo semantics mới, giữ denied0-write và empty0-record; đó không phải full suite PASS. Kết quả final riêng nằm phía dưới.

## Evidence cuối và reconciliation hướng dẫn

Root báo command `node node_modules/@playwright/test/cli.js test --config analyse/ux-implementation-2026-10-14/qa.playwright.config.mjs` từ root: **167/167 PASS, exit0, 5.2 phút**. Reviewer đọc trực tiếp `ui-results.json` SHA256 `a8c7e4791f0ae004fbb281b58a7df4fbc893f19d72d43f48f4c40e749cb7369a`: stats expected167/unexpected0/skipped0/flaky0, duration313993.725ms; không có errors. Đó là đối chiếu runner artifact do root chạy, không phải kiểm thử độc lập của reviewer. Root còn báo build/runtime28/catalog0/Vite/Sites preparation PASS, scanner23 PASS, Sites4 + isolation1 PASS exit0 và focused state17/17 PASS. Reviewer không tự chạy lại các suite đó. Source cuối vẫn Prototype `1ba0188b…623c03`, Journey `681eb452…8f2a70`; save test `e93cff37…410e00` match lượt review trước.

Reviewer đọc đầy đủ diff candidate-snapshot → root `AGENTS.md`: đúng 8 dòng thêm ở đầu, gồm heading native14Oct và các checkpoint approval/install/startup/currentA. Root current SHA256 `cd51d9bf588d36cabde52dec56a9d57c01ec2c45e0df6c74ec539d41c264876c`; baseline/candidate snapshot vẫn `b300e5c647d5c01ed8373ffce12c2f867638e6ae4fa5f318a5d84413365db51f`. Không có edit khác trong AGENTS diff. Reviewer chạy lại hash toàn 228 root inputs từ baseline: **227 unchanged, 1 known documentation drift AGENTS.md**; exit0. Baseline.json được giữ nguyên, hash trực tiếp `6de2360876d5259e69f4f002942d35002cfc48be4c96308f04511f0e1077db6b`. Không thể ghi 228unchanged hoặc copy snapshot cũ trở lại root.

Root latest AGENTS là hướng dẫn có thẩm quyền hiện tại: operation `mcy-native-late-save-20261014` gắn APK/manifest riêng đã approved/install; A login scoped read-only verification hiện currentActorVerified=true, chờ user Home/Journey/Recent-icon trước grant, neweffects0 và whole native acceptance pending. Reviewer chỉ xác nhận nội dung tài liệu, không xác minh native/live trong task UX. Approval và giới hạn operation đó không tự áp dụng cho candidate UX khác source/artifact. Các câu pending ở candidate AGENTS/plan là historical snapshot. Web vẫn BLOCKED_NO_UPLOAD_OR_ALIAS đến protection gate; không approval inferred cho integration UX, upload/alias, native test thêm, AI hoặc Production.

## Giới hạn

Root CSS touch48/font14/consent heading16 là app-only source. Editorial token đổi Times New Roman + bundled Roboto fallback. Follow-up trực tiếp xác nhận candidate `design-system/tokens.json` đã đồng bộ; candidate brand paragraph ghi rõ 14/10, fallback Roboto khi thiết bị thiếu Times New Roman và chưa có native acceptance. Root brand/token originals còn Georgia-first theo baseline vì chưa tích hợp. Reviewer không xác nhận pixels/font licensing mới; không thêm font download. Font/reflow/focus/platform evidence vẫn do root thực hiện.

Native/live actor, real HTTP/database, physical Android/iOS, assistive tech, full WCAG, clinical/content/rights, web protection và release: **CHƯA CHẠY trong review này**. Native 13/10 FAIL/cap0, operation 14/10 và web BLOCKED_NO_UPLOAD_OR_ALIAS giữ các giới hạn riêng. Rollback local bằng không tích hợp candidate; không có cloud effect để rollback.
