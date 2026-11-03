# MCY — independent R3: remaining native trial progress, 13/10/2026

Review chốt **2026-10-13 04:23:40 UTC**, reviewer `/root/auth_learner_final_review`, theo `skills/mcy-change-review/SKILL.md`. Scope: new progress-only observer, read-only progress SQL, packaged POST retry behavior và kết luận tiếp tục phần còn lại của exact approved manifest71bf. Không sửa app/APK/source hoặc old manifests/reviews/receipts; reviewer không device/ADB/cloud/email/write, không đọc env/token/private identity. Chỉ tạo report riêng.

**Không còn P1/P2 trong JS39e và SQL7ad cuối đã review.** Có đủ căn cứ tiếp tục các hiệu ứng wellbeing grant/check-in/revoke **đã được Owner duyệt**, A trước rồi B sau fresh B verification; không cần xin lại quyền cho cùng effect cap. Không resave A profile/locale, không tăng cap hoặc tự retry uncertain write. Native profile A exact-fixture và pre-profile Auth acceptance vẫn **PARTIAL/không đạt đầy đủ**, không rewrite lịch sử này thành PASS.

## Evidence mới thay điều kiện hold cũ, không thay approval

Owner trực tiếp báo profile A là dữ liệu giả và hoàn tất/save **“Chỉ một lần”**. [Distinct reconciliation observation](MCY_NATIVE_TRIAL_LEARNER_A_ACTOR_RECONCILIATION_2026-10-13.json) parent chạy source22bd lúc04:06:14–04:06:21.842Z: exactly1 local page, installed parallel APK5bf, native cached+server approvedA match, Auth200/confirmed/authenticated/same-session, home, localevi-VN và constrained metadata digests. Đây là actual native/Auth evidence đã đọc, khác earlier cache denial0cac; denial root cause vẫn undetermined.

[Fresh authority receipt](MCY_NATIVE_TRIAL_AUTHORITY_AFTER_RECONCILIATION_2026-10-13.json) SQL04:07:43 và parent-reported SQL04:14:34: A8consents/1check-in/1observation/profile1, B4/1/0/profile absent; role0/current terms/privacy/wellbeing revoked, history và nonLocale metadata/control unchanged. A profile created=updated03:50:39, prepared exactname/neutral-style không khớp; Owner fictional confirmation không biến exact fixture thành matched. Native Auth verified **sau** profile, nên pre-profile gate trước đó không được coi đạt. Reviewer đọc receipts/source, không independently query cloud trong supplemental này.

Approval vẫn exact manifest **`71bf0aa806e92d792bd55ad23592af22a78d76733a97af5f6ffa4f97ac19865d`**, staging `mhumbczqrzutdnraafhs` / MagicpenDigital `rzbpjfrndhrtxagpgdre`, approvedA/B, APK5bf. Max2 profile upsert requests/2locale updates/4wellbeing events/2check-ins/0new observations; old12/2/1 spent, không rerun. Đã kiểm25 frozen bound records,0mismatch. New human statement và fresh Auth/authority đủ thay điều kiện unresolved hold trước đó; không mở scope, đổi target/actor hoặc authorize additional A profile repair.

## One completion và retry: count classification đúng

Pinned `Prototype.tsx`58b8845c…: một Onboarding `complete()` gọi `persistProfile()` **một lần**; one upsert, sau thành công mới một `syncAuthEmailLocale`. Hydration/re-render chỉ đọc, không tự persist profile. Saving guard chặn completion đang pending; user statement one click là human evidence, không phải independent input-event instrumentation. `authEmailMetadata.ts` dùng một direct fetch PUT, no retry loop. Native verify/callback không chạy web cosmetic locale-sync path; không có automatic profile save vì sign-in/reload.

Hash-matched **actual APK SDK** `assets/dist-BXgLBU46.js` SHA **`68f557410358768a5010495947d0f9e37c1e835138dfdb4229c562e06de337cd`**: upsert và RPC dùng POST; retry allowlist chỉ **GET/HEAD/OPTIONS**. POST bị loại cả retryableHTTP503/520 và rejected network path, dù retryEnabled defaulttrue. Header-auth wrapper không tạo POST retry loop. Không suy hành vi từ chỉ local dependency hoặc nhầm defaultretrytrue là retrywrites.

Reviewer trích actual packaged retry/policy functions với fictional fetch: **6 groups PASS exit0** — POST200/401/503/520 và network throw đều đúng1fetch; GET503→200 có2fetch chứng minh retry machinery vẫn active cho reads. No real network. Đây là source execution/rehearsal, không actual HTTP telemetry của lần profile trước.

Vì vậy operational accounting A profile/locale1slot dựa **SOURCE_PLUS_USER_REPORTED_SINGLE_COMPLETION** là hợp lý; không gán `INDEPENDENT_HTTP_COUNT_PASS`, không suy row=request. Existing row+locale là corroboration commit, không standalone request count. Bounded log error/empty stream không thành0requests. Nếu có bằng chứng sau này về extra completions/requests hoặc drift, dừng/reconcile; hiện không có actual blocker buộc xin lại cùng health-effect permission đã được duyệt. B còn một planned profile/locale completion, chỉ sau fresh B actor/authority gate, không replay A save.

## Progress observer delta

Final `observe-native-trial-progress.mjs` SHA **`39e753d1bc10f3709f7eb0c38f6cc97761e962e132b4b9beb6b0d8cd2d20ae9d`** có output namespace riêng `MCY_NATIVE_PROGRESS_…`, existing/wx receipts giữ exclusivity. Held A chỉ cho read `before-grant`; A_ACTIVE health phases choA, cấm A before/after-profile. WAITING_FOR_B_LOGIN chỉ cho B before-profile read; B_ACTIVE profile/health phases choB. Wrong actor/STOP/COMPLETE bị từ chối trước device. Không write executor hoặc tự đổi intent.

Phần từ `const app=manifest.device.package` trở xuống **byte-identical** source22bd: one local page/APK/PID/foreground, cache-approved actor beforebearer, GET-only server match/confirmed, same-session checks, typed export/digests,30s bounds/cleanup/captured byte pins/post-cleanup drift denial. Không mở rộng data collection/session/email/UI action.

Syntax **PASS exit0**; independent exact-prefix spec matrix **16groups PASS exit0**, mockfs/process,0device/network/write. Covered held-A grant-only, health read phases on activeA, A-profile denial, wrong actor, waitingB profile-only, activeB profile/health và stopped/complete. Body equality là source evidence; không broad rerun20body cases đã đạt ở22bd hoặc giả đây là physical progress PASS.

## Read-only SQL và P2 projection đã đóng

New `native-trial-progress-readback.sql` chỉ SELECT/builtin metadata/JSON/hash/time functions, fixed approved hashedA/B, không mutating RPC/DDL/DML. Captures counts/actual authority/current consent/profile enum+fixture bool/hash; oldconsent/check-in/observation digests theo **exact cutoff03:31:52.615701Z**, và typed newconsent/newcheck-in rows/newobservation count. Không note/evidence/email/userID/idempotency key value/raw metadata/name được export; only presence/digests cho private payload. Body preference/purpose/action/source/body/capture constrained bởi schema; energy/date/times typed.

Initial SQL980688a6… còn raw free-text locale/timezone/policy_version, có thể export unexpected private text. Parent sửa **trước invocation**: final SHA **`7ad159192c6cad8a6567161db258169f959cbb4808f26e0bcda6462b61046204`**, locale4enum/other, new+latest policy7current constants/other, timezone phải thuộc `pg_catalog.pg_timezone_names` elseother. P2 projection đóng; source review không còn P1/P2.

Optional independent in-memory PGlite CASE-only execution **CHƯA CHẠY**: defaultmodule `@electric-sql/pglite` absent/MODULE_NOT_FOUND, không phải SQL failure; không đọc env để tìm engine. Parent chạy reviewed SELECT lúc **04:23:24Z** báo runtime/readback PASS: A8/1/1, B4/1/0, newconsent/newcheck-in empty/newobs0; profile/metadata/history/authority/control unchanged, first oldconsent digests captured trước grant. Đây là parent runtime evidence, không independent database execution. SQL-family metadata hashes chỉ so SQL↔SQL; native compactcanonical hashes chỉ native↔native.

## Điều kiện tiến hành còn giữ

Có thể chạy39e `A before-grant` dưới hold, cùng fresh SELECT, rồi hướng dẫn **một** manual wellbeinggrant; readback phải đúng new1event/purpose/version/channelAndroid. Một fake standalone check-in none_now/energy2 (“Bình thường” maps index2)/no notes/no observations; no AI/lesson/inference. Reopen qua user Recent/icon, revoke1lần trong cap; denied-save không tạo new RPC/row. Không yêu cầu Journey cũ rỗng hoặc xóa history. B login do người dùng rồi fresh39e+authority trước B profile/grant/check-in/revoke; không dùng stale helper403 hoặc metadata role làm staff evidence.

Mỗi bước cần current actor/policy/role/count/control, exact request key/payload khi readback phù hợp; unknown commit dừng và đọc, không automatic retry/key mới. Stored GET receipt là snapshot, không lâu dài bypass server write-consent check. Initial wrong-profile exactfixture/pre-writeAuth và missing HTTP telemetry vẫn partial dù health branches về sau có thể PASS. Không thêm requested permissions đã có, không general release/AI/Production/role/expiry/SQLapply/iOS/content gate waiver.

## Pins bổ sung

| Input | SHA256 |
|---|---|
| Progress-only observer | `39e753d1bc10f3709f7eb0c38f6cc97761e962e132b4b9beb6b0d8cd2d20ae9d` |
| Minimized progress SELECT | `7ad159192c6cad8a6567161db258169f959cbb4808f26e0bcda6462b61046204` |
| Actual packaged SDK | `68f557410358768a5010495947d0f9e37c1e835138dfdb4229c562e06de337cd` |
| A native reconciliation PASS receipt | `305817d8f8953a2697bebd4753bc6adfa46e5f5372883328c6ccdc378328e68d` |
| Authority-after-reconciliation snapshot | `9ac8e9f16d3f859eca24bce1aa91a2b1af3109713c209369fc64dae6517f9054` |
| Previous reconciliation R3 retained | `dc8fe4e28bdef8ea8b3ea34a62caa4535f7ae6bd1fbf0d1943fb473ad0a6f25b` |

Mọi actual progress phải receipt riêng; report này không rewrite previous holds/prepared/failure evidence hoặc tự báo nativehealthPASS.
