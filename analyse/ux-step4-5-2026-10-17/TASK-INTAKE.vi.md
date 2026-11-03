# Phiếu nhận việc 4.5 — Reflection

17/10/2026 Asia/Bangkok · Windows/PowerShell, `D:\Projects\MCY`. **PRE_IMPLEMENTATION / BLOCKED chờ independent intake QC và root đọc/GO app.** Không cần thêm user permission cho phạm vi local đã được giao. Root điều phối, worker triển khai, reviewer độc lập và root kiểm artifact cuối; không được tự nhận verdict của vai trò khác.

Áp dụng [lifecycle](../../docs/quality/TASK_LIFECYCLE.md), [intake template](../../docs/quality/TASK_INTAKE.template.md), [QC template](../../docs/quality/TASK_QC.template.md), [MCY change review](../../skills/mcy-change-review/SKILL.md) và [risk matrix](../../skills/mcy-change-review/references/review-matrix.md). Record mới dùng PASS/FAIL/BLOCKED/NOT_APPLICABLE. Kế hoạch hiện tại: [PLAN-CONSOLIDATED](PLAN-CONSOLIDATED.vi.md).

## Quyết định, outcome và baseline

User mới nhất đã duyệt 4.4 và yêu cầu tiếp tục 4.5 Reflection theo lifecycle; **dừng trước 4.6 để user review**. Những trường WAITING_USER của hồ sơ 4.4 là checkpoint lịch sử; không sửa hồ sơ frozen. [4.4 current status](../ux-step4-4-2026-10-17/CURRENT-STATUS.vi.md), [root verification](../ux-step4-4-2026-10-17/ROOT-VERIFICATION.vi.md) và [independent app QC](../ux-step4-4-2026-10-17/INDEPENDENT-APP-QC.vi.md) mô tả kết quả local trước quyết định mới.

Observable outcome: không có vùng trước tập thì người học gặp cảm nhận chung trước, có đường ghi vùng hiện tại tùy chọn; chỉ vùng thực đã ghi mới có giao diện so sánh. Có vùng trước thì giữ comparison và thao tác từng vùng rõ ràng. Không gợi cải thiện từ vùng trống, không biến comparative outcome thành thang cảm nhận tuyệt đối, không thay khả năng ghi/skip. Exact existing `reflection.noteScope` (chỉ trong phiên, chưa đồng bộ tài khoản) phải thấy trước Ghi nhận kể cả note/pace nằm trong phần thu gọn. Worse alert ở cạnh overall, không giấu trong optional section đóng. Không chọn positive default; blank Record giữ semantics hiện tại. Vùng post mới phải có readback/edit path nhìn thấy hoặc summary rõ.

Baseline app là `.vercel/ux-step4-4-20261017`, chưa tích hợp root. [SOURCE-FREEZE 4.4](../ux-step4-4-2026-10-17/SOURCE-FREEZE.json) SHA256 `f11a6af114f42427cd6d758f5ac191d0af65324d5018e82524adf913fde7e243`; Prototype `4301656f5e45197b421a98d63d9da8898a699cbc608449ce51ce909bc0e84bee`; CSS `e06698038e069d2500923e1149534b1a35588b671ae3cd18b8b5e52f07ce1629`; i18n `64e09bd6a89101038de9cff2544962909a6b26e3822686abb8e295c7a1e82a1e`. Các hash này đã đọc lại trong discovery. Source/read receipt và freeze mới sẽ pin thêm dependencies/tests/config; không dùng HEAD làm baseline.

Đã đọc git status root: nhiều dirty files sẵn ở app/backend/tests/skills/config; không reset/chép đè/nhận làm thay đổi mới. App candidate 4.5 chỉ được tạo sau intake QC + root GO. Documentation worker chỉ ghi thư mục analysis mới này. Không copy `.env`, token hay account state. Không external effects/cost/cap mới; chỉ local `.invalid`/fixture, chặn cloud/media outbound. Native HALTED/current actor chưa xác minh lại; web BLOCKED_NO_UPLOAD_OR_ALIAS giữ nguyên.

**R1 presentation-only**: hierarchy, conditional JSX, scoped CSS và copy UI hẹp, trong contract hiện có. Chạm persistence/snapshot/API/provider/playback contract → dừng phân loại R2; chạm consent/Auth/clinical guidance/inference/control → dừng phân loại R3. R1 không được dùng để cấp clearance cho health guidance mới.

## Trace thực tế và các nhánh cần giữ

`CourseDetailRoute` và `PracticeRoute` chỉ sau người học tự xác nhận thực hành mới capture before state vào `reflectionBeforeStatus`, copied `reflectionBeforeObservations`, `reflectionHasCheckinBaseline`, lesson title rồi mở Reflection. `hasCheckinBaseline` true cho `none_now` và `uncertain`, false cho null/skipped. Khi flag false, route đặt beforeStatus=null và beforeObservations=[]: skipped/unanswered trước đó không còn phân biệt được ở Reflection. Không đổi route/state để khôi phục thông tin này; copy null chỉ nói trung tính “Chưa có ghi nhận vùng trước tập”, không khẳng định người dùng đã bỏ qua hoặc chưa check-in. **Predicate so sánh vùng là `reflectionBeforeObservations.length > 0`, không phải flag baseline hoặc bodyStatus.** Flag/status vẫn giữ nguyên ý nghĩa cho snapshot và copy.

ReflectionScreen hiện luôn vẽ hai maps và heading vùng trước; generic overall nằm sau chúng. Editor/keepSame/keepAll/unknown thao tác post state. Footer chỉ sync session state, không RPC: tạo before/after snapshot, localBefore chỉ nếu có baseline và chưa có currentRemoteCheckinId; append history chỉ khi saveFeedbackConsent, luôn đặt lastReflection rồi reset và replace Sync. Reflection không có save API/pending/error/retry riêng. Sync phân biệt skipped/endedEarly/noFeeling; Journey ghép remote+local, giữ outcome/status và compatible comparisons. Standalone check-in có persistence/uncertain retry riêng, không được kéo vào Reflection.

| Nhánh | Hiển thị dự kiến / invariant |
|---|---|
| Không baseline, before arrays rỗng | Overall optional trước; không empty before/after comparison hoặc lời như đã có mức trước. Current-area optional vẫn có đường thêm và nhìn thấy/sửa lại entry vừa thêm. |
| Có reported regions | So sánh trước/sau từng vùng/side thật; thiếu after là chưa ghi, không phải hết khó chịu. Giữ keep-one/all chủ động. |
| `none_now` / `uncertain`, không vùng | Ghi rõ trạng thái trước thực có; không gọi là chưa check-in, không tạo mức vùng. Overall trước, current-area optional. |
| skipped / null trước route | Cả hai về null khi không baseline; nêu thiếu ghi nhận vùng, không hứa phân biệt UI khi capture đã mất thông tin, không suy none_now. Post skip/no-answer vẫn giữ riêng theo semantics footer. |
| Mixed/unequal left-right | Giữ từng level/status, paired side/both/unspecified, sửa/xóa đúng entry. Không suy overall thành level vùng. |
| Unknown after | Handler cũ clear post observations + uncertain; UI không phủ nhận trạng thái chưa rõ. |
| Worse | Outcome/notice hiện có giữ nguyên; không thêm clinical instruction hoặc tự recommend. |
| Same | Keep-one/all chỉ khi chủ động; clear copied note như cũ. |
| New current region | Không invent before entry; có label hiện tại và đường nhìn/sửa/xóa qua UI, không biến thành regional baseline. |
| Skip/blank/endedEarly | Footer semantics nguyên vẹn; optional không ép điền, không suy success/improvement. |

`Outcome` và nhãn comparative “Dễ chịu hơn / Như cũ / Khó chịu hơn / Chưa rõ” phải giữ nguyên. No-baseline không được đổi nhãn thành mức tuyệt đối rồi lưu enum cũ. Copy mở chung có thể giải thích đây là tự phản hồi tùy chọn, không giả có baseline do hệ thống đo.

## Impact map / ownership

| Entry → dependency → output | Allowed change | Adjacent invariant / lý do loại trừ |
|---|---|---|
| Explicit lesson/practice CTA → route capture → Reflection | ReflectionScreen JSX hierarchy/sections và narrow render-derived predicate | Route callbacks/flag capture/reset byte-for-byte; không auto-open/complete |
| Before/post observations → region UI/editor | JSX/grouping/labels scoped | Handler logic, bodyRegions helpers, levels, statuses, side mapping unchanged |
| Footer → session snapshots → Sync/Journey | Không sửa | Không RPC/retry mới; giữ history consent gate, no duplicate before remote, session-only notice |
| Shared Prototype → Auth/check-in continuation | Không sửa | Guard/actor/session-generation/idempotency semantics giữ nguyên; negative regression vì chung file |
| CSS/i18n → learner layout/accessibility | Chỉ selectors Reflection và keys/copy UI mới cần thiết | Không global token/runtime/brand asset, không đổi enum translation shared semantics; VI/EN partial preview giữ. FlowStack giữ route đã mount: không dùng body/shared/:has reflection gây leak sang Home/CourseDetail sau khi rời màn. |
| CourseDetail/Home/check-in → nearby shared UI | Không sửa | Bảo toàn 4.1–4.4, media9:16/focus/recovery và same CTA |
| Backend/storage/roles/AI/CMS/native/release | NOT_APPLICABLE implementation | Trace chỉ session UI; không backend call từ footer, không schema/provider/assets mới, foundation draft riêng |

App worker được ghi candidate mới `.vercel/ux-step4-5-20261017`: `src/Prototype.tsx` chỉ ReflectionScreen JSX/render-only derived constants; `src/prototype.css` selectors reflection scoped; `src/i18n.ts` keys/copy UI hẹp; `tests/ux-reflection.spec.ts`; existing expectation chỉ khi đổi hierarchy đã giải thích. **ReflectionFooter, handlers, routes, backend, Sync và Journey ưu tiên byte-for-byte**. Nếu footer root class thật sự cần vì layout phải có addendum trước, chứng minh handler không đổi. Không tự tạo helper runtime/state hoặc sửa checker/lock để PASS.

## Kiểm trước bàn giao

4.4 có lịch sử local PASS 95 selected UI cases + bảy baseline commands; independent7 cases/807pins; root257pins/manual. Chỉ là prior evidence, không phải 4.5 PASS. Chưa chạy baseline/new 4.5 checks → BLOCKED, không phải failure mới. Gaps thực: chưa có dedicated reflection branch matrix; physical/native/screen-reader/live/video acceptance còn thiếu.

| Impact/invariant | Check dự kiến | Expected / evidence |
|---|---|---|
| No-baseline vs none_now/unknown/skip | Focused matrix dùng navigation thật + scoped fixture khi cần | Overall trước; none_now/uncertain truthful; null dùng copy trung tính vì route gộp skipped/unanswered; zero invented comparison/levels |
| Reported/mixed/sides/keep/new region | Editor qua nút thật, data assertions trước/sau | Per-area values/notes/side preserved; new post entries visible/editable |
| Worse/unknown/optional/skip/blank | Existing labels/notice + Sync/history assertions; optional panels đóng | Không positive default; worse notice vẫn cạnh overall, noteScope nguyên văn visible trước Record; blank allowed; exact skip/status/endedEarly semantics |
| Guest/account + wellbeing off/on | Fixture request counter, history/lastReflection checks | Zero reflection cloud/AI writes; history gate/session semantics cũ |
| Branch entry/back/reentry/account switch | Route tests, existing session guards; rời Reflection về CourseDetail/Home sau mount | Không leak actor/state/delayed navigation; retained route không làm leak styles/fixed footer sang màn khác |
| Keyboard/text/viewport | 320×568,360×640,390×844,844×390,desktop,iPhone/Pixel; actual28px VI/EN | Readable, focus/textarea/editor/footer reachable, no overflow; không gọi physical acceptance |
| Accepted 4.1–4.4 + save/Journey | ux-home, ux-checkin-layout, ux-energy-time, ux-course-detail, ux-save-feedback, ux-journey-selection | Scoped regression PASS process exit0 |
| Shared Prototype protected negatives | Selected learner-write-review exact retry; delayed A→B/A→B→A; leave/return continuation; save-feedback revoked/guest/delayed-client cases | Same key/payload/actor/route guards, no new write; fixture only |
| Existing reflection paths | learner-ux VI/EN/body-region/short portrait; practice-flow explicit reflection iPhone/Pixel | Same callbacks/notice/Sync behavior; `.invalid` fixtures only |
| Baseline gates | Current scripts runtime, catalogue, tsc/build/Sites prep, bundle scanner, Sites+environment isolation | Runtime28/catalogue0; exact commands/env/cwd/exit/path recorded; equivalent build steps không gọi nguyên npm build nếu không chạy |

Không chạy arbitrary full suite. Mở rộng khi diff/failure/review chỉ ra gap cụ thể. Existing tests ghi screenshot về analysis cũ phải chạy cwd evidence mới để không ghi đè lịch sử. Không env-file/live helper; test fixtures/proxy/CSP chặn external. Historical PyYAML skill-validator gap thuộc control task cũ; **NOT_APPLICABLE gate mới của 4.5 vì không sửa skill**, không xóa gap lịch sử.

Sau implementation: freeze app + dependencies/tests/harness/artifacts; independent app QC kiểm final bytes/negative cases/evidence; root trực tiếp rehash, đọc diff và kiểm pixels/thao tác trước handoff. Có thay đổi sau freeze thì refreeze và rerun affected checks/review; không kế thừa verdict im lặng. No zero-regression guarantee hay proven remote CI enforcement.

## Acceptance / stop / rollback

Accept local 4.5 khi hierarchy phản ánh dữ liệu thực, baseline statuses không lẫn, comparative semantics và entry/editor/footer/Sync/Journey/consent/guards không đổi, no-write fixtures đạt, regression/gates phù hợp exit0, độc lập QC và root final đạt. App readiness hiện BLOCKED chờ intake QC + root GO, app acceptance chưa có.

STOP nếu pin sai, ngoài file scope, cần contract/clinical logic mới, external request thật, required check fail, P1/P2 mở hoặc final QC thiếu. Rollback local: không tích hợp 4.5, giữ approved4.4; không sửa dữ liệu/APK/deployment. Handoff nêu exact final hashes/patch, checks/failures/limits, QC/root verdict và **WAITING_USER trước4.6**. Không cloud/native/deploy/AI grant từ intake này.
