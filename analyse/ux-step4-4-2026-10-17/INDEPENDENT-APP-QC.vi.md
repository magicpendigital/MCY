# QC độc lập 4.4 — CourseDetail

**PASS trong phạm vi candidate local 4.4; không còn P1/P2 được phát hiện. Root final verification còn chờ và phải hoàn tất trước bàn giao Owner.** Không phải acceptance native, phát video YouTube thật, dữ liệu live, chuyên môn/quyền nội dung hoặc release. Dừng trước 4.5.

Reviewer `/root/step44_independent_qc`, độc lập với implementer `/root/course_detail_implementer`; root cho phép review sau freeze. Reviewer chỉ ghi probe/report/evidence của mình, không sửa app/tests/harness của worker, không đọc env-file, không gọi live/cloud/Auth/SQL/media/native/install/deploy. Môi trường Windows, Node, Edge headless và Vite local cổng 4208; backend `.invalid`, proxy chặn outbound và iframe được trả fixture trong bộ nhớ.

## Phạm vi và freeze đã review

- [SOURCE-FREEZE.json](SOURCE-FREEZE.json): SHA256 `f11a6af114f42427cd6d758f5ac191d0af65324d5018e82524adf913fde7e243`.
- [APP-EVIDENCE-FREEZE.json](APP-EVIDENCE-FREEZE.json): SHA256 `ea5e3fd5bd8f2efb7270d97c74058c909251f47d7f9857b770f0384d8f1455d6`.
- Candidate `.vercel/ux-step4-4-20261017`; 234 app inputs, 16 harness/intake inputs, 59 build files. CourseDetail SHA256 `62d64469abe584adf0536154a1a297dee6b745327a40beecca357fef6826b5e6`.
- Diff so với 4.3 chỉ có `src/courses/CourseDetailScreen.tsx`, selector course-detail trong `src/prototype.css`, expectation layout/disclosure trong `tests/learner-ux.spec.ts`, thêm `tests/ux-course-detail.spec.ts`. Reviewer đọc diff thật, source gọi/chọn bài/reflection, catalogue types, test source/config, intake/addendum và receipts. 233 input của baseline 4.3 và 228 root preimages giữ nguyên; không dùng candidate AGENTS cũ để điều hành native.

R1 phù hợp với thay đổi trình bày đã giới hạn. Thông tin bài chọn, loại video, thời lượng, mô tả hiện có và nút Phát được nhóm lại; context và caption detail mở chủ động. Không tạo objective/prerequisite/expert/rights claim. Caption summary phân biệt đủ unverified / verified không liệt kê VI / verified có VI. Source/privacy nằm trước Phát. Việc cuộn tức thời trong MobileScroll sau explicit Play và focus group có tên là hậu quả trình bày đã ghi addendum trước chỉnh handler; không có effect cuộn khi vào route, chọn bài hoặc back.

State/reset/timer/retry, visibility guard, iframe URL/attributes và reflection callback giữ contract cũ; iframe chỉ có sau Phát chủ động, dùng `autoplay=1` như baseline. Chọn/rời route tháo player; frame-loaded không thành đã xem hoặc đã tập. Không thêm persistence, health write, provider, catalogue hoặc capability. Thay expectation cũ phù hợp hierarchy mới, vẫn giữ assertion privacy, uncropped ratio, lifecycle và scope trung thực.

## Bằng chứng đã kiểm

| Kiểm | Kết quả và xuất xứ |
|---|---|
| Bảy baseline commands | PASS, mọi process exit 0: runtime 28, reviewed catalogue 0, TypeScript, Vite build, Sites preparation, bundle scanner 23 text files, Sites 4 + environment isolation 1. Reviewer đọc command/log/receipt; không nhận là rerun độc lập. |
| Focused 4.4 | PASS 15/15, exit 0, worker evidence: 320/360/390/landscape/desktop/iPhone/Pixel, disclosure/geometry/reveal, keyboard, 28px VI/EN, selection/back/no-write, 16:9 source fixture và caption metadata branches. |
| Mapped existing paths | PASS 11/11, exit 0: catalogue 38 clips, guest/lazy routes, honest guidance, English flow, new hierarchy/mobile/desktop, inert/focus, recovery/timeout và short portrait/reflection. Đây là selection được khai báo, không phải whole learner-ux suite. |
| Adjacent accepted UX | PASS 69/69, exit 0: năm file Home, check-in layout, energy/time, save-feedback, Journey selection. Chạy cwd evidence riêng, không ghi đè ảnh lịch sử. |
| Probe độc lập | PASS 7/7, exit 0: `node analyse/ux-step4-4-2026-10-17/independent-qc-probe.mjs`; [kết quả](independent-qc/probe-results.json). Vite root lấy đúng candidate 4.4, assertion lớp/group/summary mới không thể PASS trên root/4.3 cũ. |
| Final pin/receipt check độc lập | PASS, exit 0: `node analyse/ux-step4-4-2026-10-17/independent-qc/final-pins.cjs`; [807 raw-byte pins](independent-qc/final-pins.json), gồm source/harness/intake/evidence/screenshots/build và baseline/root preservation. Cả hai manifest và source/harness match sau probe và sau khi mọi runner worker hoàn tất. |

Probe độc lập dùng Tab/Enter thật ở 320×568, VI/EN và font 28px thực: mở caption, tới privacy, tới Phát; media group nhận focus với tên bài, iframe fixture có nút tương tác, Tab qua fixture tới recovery trong hai lần. Reload giữ continuation, chọn bài và back/reopen không tạo iframe mới hoặc reflection. Media footprint trước/sau giữ 286×508.44px và được đưa tới khoảng y=67px dưới header 55px; không thêm auto-scroll ở entry trong cửa sổ quan sát. Không có write request hoặc pageerror; hai embed GET mỗi flow do Play + reload đều được fulfill local. Ba caption metadata branches được kiểm độc lập bằng response-module fixture, không sửa catalogue hay xác minh phụ đề live.

Reviewer trực tiếp xem pixels final 320, landscape, desktop, Pixel và English 28px, cùng ảnh player 28px do probe độc lập tạo. Không thấy cắt chữ/tràn ngang hoặc nút/focus bị che trong các ảnh đã xem. Ảnh và browser fixture không thay kiểm screen reader/thiết bị thật hoặc player thật.

## Failure history và giới hạn

Worker giữ hai lượt focused ban đầu 11/13 và 12/13 exit 1, sửa focus continuation/fixture rồi chạy final 15/15; không biến các lượt cũ thành PASS. Freeze ban đầu thiếu config được giữ riêng; final review chỉ gắn f11 đã đủ config.

Probe QC đầu tiên dừng exit 1 trước Vite/browser vì **lỗi mapping đường dẫn của reviewer**: đã kiểm đúng appInputs rồi generic loop kiểm `manifest.changed` với root prefix, lấy hash root/4.3 `aafbe8b5…` để so candidate `62d64469…`. Không có app mutation. Root/worker cùng đối chiếu xác nhận; reviewer sửa riêng QC harness để dùng candidate cho appInputs và root cho named harnessAndIntake. [Receipt ban đầu](independent-qc/initial-freeze-mismatch.json) giữ nguyên, [đính chính](independent-qc/initial-freeze-mismatch-correction.json) ghi rõ nguyên nhân. Final probe và 807-pin check exit 0 trên **cùng f11**, không cần refreeze app không đổi bytes.

Không phát hiện P1/P2 còn mở trong scope review. Vite cảnh báo chunk trên 500kB được giữ trong log; không tuyên bố tối ưu performance hoàn chỉnh. English vẫn là partial preview. Hành vi player thật, caption/rights/expert review, screen reader và native/iOS/Android thật chưa được nghiệm thu. Native HALTED, web BLOCKED_NO_UPLOAD_OR_ALIAS và lịch sử trial FAIL giữ nguyên. PASS local không đảm bảo zero regression hay cho phép cloud write/release.

Rollback local: không tích hợp 4.4 và giữ candidate 4.3 đã được duyệt; không chạm dữ liệu/APK/deployment. Root cần trực tiếp kiểm final pins, pixels/thao tác artifact cuối và ghi verdict riêng, sau đó bàn giao Owner; **STOP trước 4.5 chờ quyết định tiếp theo**. Báo cáo/evidence QC này được thêm riêng sau freeze và không sửa nguồn hoặc pending fields của receipts đã frozen.
