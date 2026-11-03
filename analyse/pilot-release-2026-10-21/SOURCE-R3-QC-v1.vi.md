# R3 nguồn tích hợp và D0 trước invocation — 21/10/2026

**PASS_SOURCE_INTEGRATION_AND_D0_CONTROL_SCOPE; không còn P1/P2 trong phạm vi đã kiểm.** Có thể root cho đúng một D0 offline dependency provisioning theo freeze dưới đây. Chưa chạy D0/test/build/server; các controls W1/U1/U2/N1–N3 và public-config build invoker cần review tiếp trước chạy. Root là final verifier/GO, reviewer không cấp quyền release.

Reviewer `/root/pilot_release_qc`, độc lập với Agent triển khai. Chỉ đọc/hash/diff nguồn và evidence; không thực thi candidate script, npm, tests, compiler, Gradle, server, provider hoặc device trong QC này.

## Identity và đối chiếu trực tiếp

| Freeze/control | SHA-256 |
|---|---|
| SOURCE-FREEZE-v1.json | `5cd254ae1bd366e67ef763279c8db207cc061e67f10c39693cbb2a89e809fec5` |
| SOURCE-REVIEW-AND-INVOCATION-PLAN.vi.md | `7b0413702e1a8617ed9adeff84a9a71b6ec4462f92ce94f4c617e590bec4586b` |
| PUBLIC-CONFIG-REUSE-PROPOSAL-v2.json | `50f20a6735b8b925175f153b1eb7bd861bbb9901527dc8391d78568108911792` |
| deps-offline-invoker-v1.mjs | `0c491318de856bf1b90da3e3522cda24c1660772856ab073ed084783439a5b17` |
| D0-CONTROL-FREEZE-v1.json | `564d8db2b6726853def3543a2033c730e3f6737791d260cb1b8c74623b643b1b` |

Managed tree cố định `C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY`, base `82458fc219a2231ccac279112dfc0db5447b0edd`. Đối chiếu PowerShell exit0: 308 source/target pairs =616 hash/byte comparisons khớp, mọi target trong cây; freeze gồm 308 overlay+479 known files+9 references =796 pins khớp. 94 preimages match; 35 dirty D-root và sáu APK/metadata match. Đây là file evidence, không test app hay xác minh toàn bộ dependency động.

## Nguồn, bảo toàn và boundaries

Đã đọc thực tế Prototype mới và diff so D-root; đối chiếu các module Auth/persistence và build/config/harness liên quan. `useLearnerContinuation` giữ mounted/route-generation/actor/session-generation. `persistCurrentCheckin` bắt buộc callback, kiểm trước và sau await account-bound client, rồi gọi writer một lần. Cả ConsentFooter, Onboarding và standalone truyền continuation; underlying current-actor/current-consent RPC/payload giữ nguyên. Consent/profile/native callback và sáu module quan trọng giữ bytes/đoạn mã đã được so trong receipt. Saved-account/session/permission/cancelled là material UI delta đã được map tới affected regressions, không phải bằng chứng native incident đã được giải quyết.

Nguồn là exact accepted5.3 + root native/current AGENTS theo GO, không thêm mock edition hoặc participant backend. Canonical/private media không copy vào public; local Node reader vẫn cần đường repoRoot cũ nên không invoke từ managedtree. UI route reader tồn tại không thành service thật. D-root/candidates/frozen history/APKs được giữ; không dùng base Git HEAD thay pins của source overlay.

## Public staging binding

QC đọc đúng public JS lưu trữ, không eval/import và không log raw key. Tự hash receipt `5ce545db…8df`, APK `4b6620d6…413e`, entry `69180ee6…d2e7`: đều match proposal. Có một origin `https://mhumbczqrzutdnraafhs.supabase.co`, một `sb_publishable_` opaque key dài46, SHA `ba8150fb18a4662bf891065b80118362eae97caae4e451c876f42d8c614fba44`; không có secret prefix. **PASS provenance proposal** để giữ public binding cùng staging trong build sau control QC/root GO. Không chứng minh key hiện còn dùng được, server ACL, roles hoặc live acceptance; chưa inject giá trị vào process/file nào. Bản plan nói unconfigured build là phương án trước proposal; phải supersede rõ trong build control/evidence, không phát hai loại artifact dưới cùng claim.

## D0 control review trước chạy

Đã đọc toàn invoker và freeze, kiểm 9 pins inputs/dependency/tool. Invoker chỉ nhận `--root-approved-D0`, bind sourcefreeze SHA/cwd/realpath và kiểm479knowninputs trước/sau; không automatic retry nếu node_modules/control/evidence tồn tại. Node/npm executable và cache path cố định; args là `ci --offline --ignore-scripts --no-audit --fund=false` với user/global/cache paths tường minh; shell=false, windowsHide=true. Không dùng npm install, dependency junction hoặc D-root node_modules.

Điểm cần xử lý khi review đã đóng trong control: npm autoload user/global config được thay bằng hai tệp rỗng riêng. Project `.npmrc` có thật và được pin SHA `4b86f5f917232873bbf42e48812de3a2869a739df361ffa4a3b117a9f4ff65aa`; nội dung chỉ fund=false/audit=false, invoker kiểm exact hai dòng. OS allowlist loại server/provider env và không đọc `.env`; npm không chạy package lifecycle. npm có thể ghi cache/log trong cache được chỉ định, không được gọi là zero filesystem effects.

Timeout10phút/output4MiB và taskkill chỉ owned child PID/tree; cleanup/close thiếu xác minh hoặc source drift đều không thành PASS. Log redaction/receipt giới hạn output; không retry/fallback network. D0 không nhận public config, không khởi động app/test/server, không commit hoặc đụng device/cloud. Tên flag là invocation guard, không tự xác minh quyền con người; root phải ghi GO đúng freeze rồi mới invoke.

**D0 đủ điều kiện source/control QC trước invocation.** Cache thiếu, npm exit lỗi, cleanup thiếu hoặc package/lock đổi phải giữ failure và dừng; không bỏ offline/ignore-scripts để đạt. Root kiểm pins hiện tại trước đúng command trong D0 freeze. Chưa có dependency PASS khi chưa nhận process exit0 và source-preservation receipt.

## Các bước còn chặn

C1/W1/O1/N1–N3 có plan đúng scope nhưng actual invoker/environment/public-config provenance binding/output guard chưa được review trong verdict này. U1/U2 còn cần egress-limited config và exact selected tests/harness freeze; không dùng broad Playwright cũ để giả định isolation. Private reader relocated controls không được invoke. Không phải lặp lại toàn bộ tests lịch sử nếu inputs/environment unchanged; phải chạy checks của actual integration và downstream artifact.

Riêng native offline build: Gradle `--offline` không chặn wrapper distribution download trước bootstrap. Control sau phải pin/kiểm cached distribution hoặc dùng verified cached Gradle binary và fail closed khi cache thiếu; catalog gate explicit trước native Vite; isolated capsync; package/cert/file inventory/hash scanner. Không dùng generic installer tự shell-launch. Không có install/device/re-login/restore acceptance từ build.

Web protection hiện null/off, chưa chứng minh bảo vệ Preview mới; BLOCKED_NO_UPLOAD_OR_ALIAS giữ nguyên. Native HALTED/currentActorVerified=false, scope/human exact facts/real roles còn pending. Source/public-config/D0 QC không đóng bất kỳ gate đó, không mở budget cũ hoặc tạo authority. Recovery hiện là dừng dùng cây mới, giữ preimages và mọi history; root final/direct verification còn chờ.
