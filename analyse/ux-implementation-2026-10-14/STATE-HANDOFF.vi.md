# Bàn giao UX state — 14/10/2026

Phạm vi F01/F11 và phần copy/accessibility F13 do root giao. Đã đọc AGENTS.md đầy đủ, skill mcy-change-review + review-matrix, mcy-brand-ux, brand/design/tokens, PLAN.vi.md, audit source và coverage/config Playwright hiện có. Mức review R3 vì liên quan trải nghiệm Auth/consent. Đây là candidate local, chưa tích hợp vào checkout hoặc phát hành.

## File sở hữu

- `.vercel/ux-implementation-20261014/src/Prototype.tsx`: candidate app duy nhất được worker sửa.
- `.vercel/ux-implementation-20261014/tests/ux-save-feedback.spec.ts`: file kiểm thử mới duy nhất.
- Báo cáo này. Không sửa test cũ, runtime, backend, schema, consent policy/default, package/lock hoặc config.

Candidate Prototype SHA256 `9e87921c285ce9cd5065664805d6638ddf22300c50f1bcc5f3deff6cc6799cf8`; test final SHA256 `935c9bbae5ed3307f1aab0f4fa15f257b50541c768f695f1a915395b8ed4fee2`. Root Prototype vẫn `32c100fbcd7433f6db2c6c299556adb22633d5cd8ecd9da01ca5420515287482` tại readback 09:43:45+07. Root kiểm manifest frozen tổng khi ghép.

## Hành vi đã sửa

F01: `persistCurrentCheckin` trả kết quả tách `saved_account`, `saved_session`, `not_saved_permission`, `cancelled`. Khách mặc định/tài khoản revoked không tạo history, không clear nháp, không chuyển Hành trình; hiện notice “Check-in chưa được lưu. Nháp vẫn ở đây.” và hướng dẫn quyền tùy chọn. Copy trước thao tác phân biệt lưu tài khoản, chỉ giữ phiên và chưa cho phép lưu. Local append vẫn chỉ ở caller standalone khi khách đã chủ động bật `saveFeedbackConsent` bằng flow hiện có; không thêm storage hoặc consent mặc định.

Đã trace cả ba caller: standalone, ConsentFooter chuyển nháp và Onboarding complete. Hai caller chuyển nháp giữ điều kiện quyền và capture continuation trước/sau await; standalone xử lý kết quả rõ, giữ pending key/payload qua error và retry cùng record. Guard trước/sau client preparation, session generation, actor và route vẫn có; RPC đã dispatch có thể commit trên server, không khẳng định guard hủy transaction. Không suy đây là cause native extra B.

F11: security action đổi thành “Đăng nhập bằng tài khoản khác”, giải thích hồ sơ/Hành trình riêng theo tài khoản; vẫn `authMode=login`/return security, không thêm email-update contract. Onboarding không có nháp dùng một CTA “Lưu hồ sơ và tiếp tục” gọi cùng complete mà nút “Để sau” cũ đã gọi; bỏ lựa chọn phụ trùng hành vi và panel chuyển nháp rỗng. Đây là thay flow tối thiểu có lý do: primary cũ luôn mở panel dù không có draft, secondary lại ghi profile dưới tên trì hoãn. Có nháp vẫn hỏi trước, phân biệt “Lưu hồ sơ và check-in”/“Lưu hồ sơ và giữ nháp”/“Lưu hồ sơ và bỏ nháp”. `hasTransferDraft` guard bảo đảm account-return discover mà không có body/energy/observation/pending payload chỉ ghi profile, không tạo check-in rỗng. Không thay profile writer, payload hoặc retry semantics.

F13: tên accessible PrivacyToggle gồm title + Bật/Tắt hoặc actionLabels, giữ `aria-pressed`, dấu check decorative `aria-hidden`. Profile/header/notifications nói “Tùy chọn thông báo”, nhắc tập chưa mở và chưa đặt lịch; bỏ lời hứa giờ/kênh/múi giờ và chữ Backend. Profile “Email đã xác minh”; onboarding bỏ mã A04 và chữ “ghi server”.

## Kiểm tra

Working directory mọi check app: `D:\Projects\MCY\.vercel\ux-implementation-20261014`. Dùng dependency root đã có, không cài package.

- `node ../../node_modules/typescript/bin/tsc --noEmit`: **PASS, exit 0**, sau source final guard.
- `node ../../scripts/check-mobile-runtime.mjs`: **PASS 28 protected files, exit 0**. Không đổi checker/lock.
- Playwright trên final app source: lượt 12 cases **11 PASS/1 FAIL, exit1** (2.2 phút). Guest session case chỉ vấp assertion cuối lúc AnimatePresence còn hai `flow-current` sau chuyển Hành trình; đã thêm cùng bounded atomic `expectRoute` để chờ đúng màn. Rerun riêng `--grep 'guest session recording'`: **1/1 PASS, exit0** (48.4 giây process, 18.0 giây case). Tổng 12 case có PASS trên final app source; **không gọi đó là một lượt toàn file12/12 exit0**. Root chạy full suite sau cùng.

Command final: `$env:MOBILE_RUNTIME_TEST_PORT='4187'; $env:MCY_PLAYWRIGHT_CHANNEL='msedge'; $env:MCY_PLAYWRIGHT_VITE_CONFIG_LOADER='runner'; node ../../node_modules/@playwright/test/cli.js test tests/ux-save-feedback.spec.ts --workers=1`.

12 cases: guest denied; account revoked denied; guest existing explicit session opt-in + reload loss; account success payload/one writer; uncertain exact retry + edited draft; delayed client leave-route zero dispatch; already-dispatched response after actor switch no navigation; no-draft profile retry; has-draft revoked profile retry retains draft; has-draft granted profile retry one check-in; account-return with no draft profile-only; security and notification truthful labels/toggle name.

Intermediate evidence: first commands used non-existent candidate node_modules path (MODULE_NOT_FOUND, exit1), corrected to root dependencies. Sandbox Edge launch failed before app execution; diagnostic single-test exit1 shows crashpad/Edge temp profile errors. Scoped outside-sandbox mock run allowed; initial new fixture had wrong guest CTA/step1 library label, counted read RPC POSTs as writes and sampled AnimatePresence transition before settled. Intermediate runs 3/11,7/11,8/11 PASS with whole-run exit1; fixed fixture setup/atomic bounded route polling, not app/runtime assertions. Final12 and final targeted1 bind source above; test's last settled-route edit changes no app code or expected outcome.

All browser backend data are fictional at `https://mcy-playwright.invalid`; real Supabase domain requests blocked. No credentials/.env, staging read/write, emails, native/device calls, build/install, deploy, provider inference, role/grant or config change occurred.

## Root follow-up và giới hạn

- Existing `tests/learner-device-acceptance.spec.ts` revoked-save case around135–138 expects Journey after denied save. Update to check-in + explicit not-saved notice + retained draft and keep exact0new-save counts. This is an intentional behavior change, not permission to weaken denial assertions.
- Other changed copy locators to review: onboarding Tiếp tục/Để sau/Xác nhận chuyển nháp/Bỏ nháp; notifications Nhắc tập và thông báo/Nhắc tập trong ứng dụng; security Đổi email có xác minh. ConsentFooter labels with Xác nhận chuyển nháp/Bỏ nháp remain unchanged; don't blanket-replace.
- Existing toggle row selectors and `/Rút đồng ý/` generally still match; exact global Bật/Tắt accessible name must include purpose. Root owns existing-test adaptation and full suite.
- Vite focused fixture warns root font files outside candidate serving allow list. These passes establish behavior, not font/glyph screenshot evidence; root must resolve local dependency serving before typography verification, preserving protected runtime config.
- Full build, scanner, Sites, full UI, device presets, narrow/large-text/screenshots, independent review and physical-native/live actor acceptance: **CHƯA CHẠY bởi worker**. Root owns remaining checks. No native13Oct trial clearance/new14Oct approval or web protection clearance is inferred.
- Rollback local: do not integrate candidate. Source cannot cancel an already dispatched RPC; preserve history and pending exact payload on uncertain outcome. No new live trial budget.

## Bổ sung sau review độc lập

Root chuyển hai P2 trong phạm vi về worker; lượt UI162 trên source trước đã kết thúc (160 PASS/2 expectation cũ, root xử lý). Worker chờ suite kết thúc rồi mới sửa source.

1. ConsentFooter trước vẫn coi destination check-in là có nháp, có thể ghi một `practice_preparation` rỗng khi existing-profile actor xác nhận required consent missing/stale. Nay shared `hasCheckinTransferDraft` kiểm destination + bodyStatus/preObservations/energy/pending payload; ConsentScreen banner, ConsentFooter CTA/discard/dispatch và Onboarding dùng cùng helper. Hai nhánh chuyển nháp chỉ lưu khi có dữ liệu thật và quyền hiện hành; hợp đồng/payload/policy không đổi.
2. Journey trước dùng `backendStatus` chung với writer; failed write giữ loading khiến lịch sử trống báo tải vô hạn. Worker thêm `checkinReadStatus` vào DemoState: initial/reset ready, hydrate load loading/success ready/failure error theo generation hiện hành; initialization client/session failure error. Writer/consent/profile state updates không đặt field này. Lỗi native callback/listener không đổi trạng thái lịch sử đã đọc. Root sở hữu Journey UI đọc field mới và notice/CTA pending.
3. Theo bổ sung root, `JourneyRoute.onStartNext` khi có pending payload chỉ đặt bước2 và push check-in; giữ nguyên pending key/payload và nháp hiện tại, không tự resave. Khi không pending, flow next check-in hiện tại giữ nguyên.

Source bổ sung Prototype SHA256 `1ba0188b54edd5d34eaeb04dc2d4ccbc51da3073cc440564f4db3140fc623c03`, test final SHA256 `e93cff373c22efda83b47e2706ffc34ac7aec2b9ba46741b9c88941b22410e00`; source/test hash phía trên là checkpoint trước review. TypeScript bổ sung và sau Journey đồng bộ **PASS exit0**; runtime28 **PASS exit0**. Focused17 cases **17/17 PASS exit0**,1.2phút, cùng command port4187/Edge/runner/workers1 ở trên; scoped outside sandbox vì lỗi Edge sandbox đã ghi. Source app không thay trong lượt17; server teardown process đã hoàn tất. Đây là lượt toàn file17 exit0 trên source bổ sung, supersedes thiếu lượt toàn file12 exit0 ở checkpoint cũ. Full broad/reviewer follow-up vẫn do root thực hiện.

Năm case mới: missing/stale required consent × actual/empty draft kiểm đúng2required events và1/0checkin; failed writer→library→Journey không fake loading, báo pending thay vì khẳng định chắc chắn không có dữ liệu, CTA “Xem lại lần lưu chưa xác nhận” mở đúng retry với nháp sửa còn nguyên, lần retry dùng đúng frozen key/full payload. Fixture giả cập nhật consents/policy versions chỉ từ intercepted `record_my_consent`; không gọi staging/email. Assertion pending/empty được đồng bộ trước invocation với UI Journey của root; không sửa app hay assertion giữa lượt17.
