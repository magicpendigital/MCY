# QC độc lập — 4.2 visual revision

Ngày 16/10/2026, reviewer `checkin_visual_qc`. **PASS trong phạm vi diff R1 local; không còn P1/P2.** P2 reflow tiếng Anh và P3 cạnh nút bị footer che đã được sửa, kiểm lại độc lập. Root còn trực tiếp kiểm rồi báo Owner và dừng trước 4.3.

## Phạm vi và pins

Đã đọc root AGENTS.md, mcy-brand-ux, mcy-change-review/review-matrix, brand guidelines, design system/tokens/motion. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS vẫn giữ nguyên. Review chỉ candidate `.vercel/ux-step4-2-visual-20261016`, không tích hợp vào root hoặc candidate 4.2 cũ.

| Input cuối | SHA-256 tự kiểm |
|---|---|
| source-freeze.json | `d4e0b80ec2074414f2630ca9ac28e7926a6c7a20a8d0c956026552acf7eb04ce` |
| src/Prototype.tsx | `f25242eb356fbf7289bf6b67596599e2c84959533252d929a065864fee3ab781` |
| src/prototype.css | `390d1f2f58ae4cea1957243d41a2138420ab9241086a5d9dbf8d63f5c7216f6e` |
| tests/ux-checkin-layout.spec.ts | `e76bd8af417182cac1f6b9f3f03e6417196237b3f3bf41253c039830182fc7e5` |
| evidence.json | `a1b8627b95c2e4aa5fe52c141d8a7186ac9a1b05ef29dcac56b3629033009201` |

`node analyse/ux-step4-2-visual-2026-10-16/qc-integrity.mjs` **exit0**: 232 old-candidate inputs, 228 existing root inputs, 232 frozen candidate inputs match. Chỉ Prototype/CSS/hai tests khác baseline; ảnh, artifact pointers, patch và linked report hashes match. Reviewer tự so sánh handlers/state tới bodySummary, ngoài CheckinScreen và toàn Step2/RegionEditor/BottomSheet tail: byte-equivalent. Final diff thêm label spans tại Prototype:1488–1489; không đổi global Choice hoặc handler. CSS:1089/1101 chỉ sửa wrap/flex của hai nút tại chỗ.

## Source và visual review

Hero sage-soft đưa giá trị ghi nhận theo vùng lên trước, dùng đúng approved full-body art theo bodyStyle hiện có; mặc định feminine chỉ là fallback. Không có fake pain marker trên hero. Copy mô tả tự ghi nhận, không hứa AI, chẩn đoán hoặc kết quả sức khỏe. Hai lựa chọn không khó chịu/chưa xác định vẫn có nhãn rõ, 14px và target ít nhất44px; không chọn sẵn. Mở bản đồ không tự chuyển bodyStatus thành reported, không bắt nhập vùng mới được đi tiếp. Skip/no-answer và confirmation giữ hợp đồng cũ.

Đã trực tiếp xem pixels cuối 320/360/390/short/iPhone/Pixel/landscape, expanded/map, confirmation settled và hai ảnh 2x text độc lập. Hero rõ hơn ba lựa chọn dạng form cũ; fullbody không bị crop trong hero. Expanded thu gọn hero, giữ map/list và disclosure. Landscape cần cuộn, ban đầu chỉ thấy một phần hero; không khẳng định mọi control hoặc toàn map cùng nằm trong viewport đầu.

## Findings đã đóng

**P3 — CLOSED, narrow footer clearance.** Ở freeze `067524…e233`, own settled320×568 ghi hai nút y335/h59.1875/bottom394.1875 trong khi footerTop392: cạnh dưới2.1875px bị che, chữ vẫn đọc được. Không coi đổi assertion là sửa lỗi. Worker giảm đúng khoảng cách narrow, giữ sizes. Own final recheck đo bottom382.1875, footer392, cả bảo thủ thêm6px focus envelope vẫn còn3.8125px. 360 cũng PASS. Các lần geometry FAIL được giữ trong qc-probe-*geometry-failure.json; worker lưu pre-QC snapshot riêng.

**P2 — CLOSED, EN 2x text reflow.** Ở freeze `257633…ad31`/app `0d287…c761`/CSS `b56d…62b2`, chèn 28px vào changed choice text (gốc14px), 44px vào card heading (gốc22px narrow), không phóng pseudo circle. EN “No discomfort now” clientWidth152/scrollWidth163; “discomfort” tràn11px và bị nền selected “Not sure” phủ. Có pixels/metrics độc lập trong qc-text-capture-true.png và qc-text-capture.json, capture process **exit0**; đây là issue thật của changed controls. Final local spans min-width0/overflow-wrap:anywhere và flex-basis7.5em cho phép xếp dọc khi text lớn. Own final EN/VI 28px: label/button không overflow, full words đọc được và cả hai accessible names/keyboard activation giữ nguyên. Không sửa global Choice/handlers. Pre-text-fix snapshot73 linked files giữ nguyên.

## Evidence thực chạy

Worker reports đã đọc và tự kiểm hashes: regression45/45 **exit0** chạy trước narrow/text refinements; final focused15/15 **exit0** sau toàn bộ sửa, gồm seven viewports, four outcomes, retention, EN, actual2x text. Build/TypeScript, protected-runtime integrity28 files, catalogue0 issue, bundle scanner23 text files, Sites4+environment isolation1 đều command exit0. Không gọi integrity28 là28 UI tests; không gọi scoped Playwright là toàn bộ `npm run test:runtime`. Reviewer không chạy lại full suite hoặc build. Chunk >500kB warning vẫn còn.

Own Playwright Edge guest-only/Vite4197, .invalid env isolation, abort mọi request ngoài127.0.0.1, browser/server đóng finally:

- `qc-probe-text-stress-failure.json` giữ **13 record đã PASS** trước EN overflow failure, trên app `0d287…c761`/CSS `b56d…62b2`: default320/360 geometry+keyboard, ordinary-wheel landscape quiet choices, contrast, none/uncertain/no-answer/skip khác nhau; unequal elbow Trái Vừa/Phải Nhẹ giữ qua collapse/reopen, neutral display preference, actual catalog→Home→checkin→Edit remount; none/skip cancel giữ vùng, confirm uncertain mới clear; wheel tới/click được last text region ở320/landscape; VI2x text PASS. Không báo toàn process đó PASS: **exit1** tại EN2x assertion.
- `qc-final-recheck.mjs` / `qc-final-recheck.json`: **4/4, exit0**, final exact pins bảng trên, externalRequests0. Own default320/360 checks full rect+6px clearance,44px,14px, no auto-answer, Tab/Enter/pressed state/visible3px focus. Own2xVI/EN checks no horizontal overflow, text spans, accessible exact names và activation; screenshots qc-final-keyboard-320/360.png, qc-final-text-false/true.png trực tiếp xem. Chỉ recheck affected controls sau local spans/flex; prior flow evidence không được đổi nhãn thành rerun trên final hash.

Contrast calculated từ computed quiet color và source tokens: forest/canvas7.10:1, helper/sage5.16:1, heading/sage9.87:1. Đây là color-pair check trong changed UI, không phải WCAG toàn app.

Các harness failures được giữ riêng: sandbox Edge launch trước app; focus-visible modality sau pointerclick; stale Home locator sau baselineReady; một expected focus-offset3px quá chặt trong transition. Đã sửa harness đúng observed source/modality và chạy lại phạm vi tương ứng, không đổi app để làm test xanh. Final recheck pins trước/sau match.

## Giới hạn và handoff

Không physical Android/iOS, native restoration/Auth, real backend/write/consent, real assistive technology, OS dynamic text hoặc full WCAG acceptance. 2x probe chỉ tăng chữ trong changed card/controls và kiểm reflow, không đại diện toàn hệ điều hành. Không .env copy, live staging/network, SQL/Auth write, launch/install/deploy/inference hoặc sửa protected runtime. Root integration/4.3 chưa thực hiện; quay lại preview cũ4189 vẫn là lựa chọn local, không cần live rollback. Root cần trực tiếp kiểm exact final candidate4190, báo Owner rồi dừng.
