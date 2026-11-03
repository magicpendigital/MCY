# QC độc lập — bước 4.1 Home

Ngày 14/10/2026. Reviewer `home_qc`. **PASS trong phạm vi R1 local; không có finding P1/P2 còn mở.** Root chưa được thay thế bởi QC này: root vẫn cần tự kiểm source/visual trước báo Owner và dừng checkpoint.

## Source được review

Candidate `.vercel/ux-step4-1-20261014`, baseline `.vercel/ux-implementation-20261014`. Đã đọc root AGENTS.md, `mcy-change-review`/review matrix, `mcy-brand-ux`, brand guidelines, design system/tokens và COORDINATION.vi.md. Diff cao nhất là **R1**, vì Home chỉ đọc state và gọi hai navigation handler hiện có; không thay Auth, consent, persistence, API, health guidance hay runtime.

| Input | SHA-256 reviewer tự tính |
|---|---|
| `src/Prototype.tsx` | `0a9d46864b427c58dd9e0bac1f35f143176f2e1558b19e0baf1820ebd1b6fd3a` |
| `src/prototype.css` | `66b2edad77bf9057d0a3c72f17c09b954c325d5d48b7df788b7f1c51cb9eb25a` |
| `tests/ux-home.spec.ts` | `d4b26b7bed811561f25d03b1a4c06071d4dc5e9fc4a7d30fba78a69434ef0996` |
| `home.patch` | `a70605f93a58a876f96398e7f1eb96897af047a663965b98e2a0549ac64862c6` |

Đối chiếu độc lập toàn bộ baseline 230 input: candidate cũ không drift, root input được ghi baseline không drift, candidate mới chỉ khác Prototype/CSS. 230 input kế thừa gồm 228 baseline trước + 2 test đã có; bước Home chỉ thêm **một** test mới. Protected runtime, checker, lock, backend và assets được kế thừa byte-identical. Đây là đối chiếu các input đã pin, không phải tuyên bố mọi file ngoài manifest trong workspace bất biến.

## Kết quả source và hành vi

- HomeScreen tại Prototype:1339–1361 có một CTA chính trước ảnh và một đường manual vào Discover. Hai handler chỉ `flow.push`, không reset draft, không gửi save, không mở Auth/consent hoặc thay pending key/payload.
- Predicate tại Prototype:1345–1346 giới hạn nhãn tiếp tục vào guest draft trong phiên và loại baseline đã handoff/lastReflection. Không dùng history/snapshot để tạo personalized claim. Năng lượng, region và observation giữ lại từ baseline không tự thành nháp chưa hoàn tất khi `checkinBaselineReady` là true.
- `ready` đọc capability hiện có; các trạng thái checking/disabled/not_ready đều nói ghi nhận rồi tự chọn video. Không hứa cá nhân hóa trong AI-off, không inference mới do nút Home. Handler capability/AI và consent checks không đổi. Copy EN có disclosure partial-preview được test, không được coi là full English support.
- CSS:76–82 chỉ scope `.mcy-home-page`; ảnh hiện có dùng chiều cao tự nhiên/contain, không gradient phủ hoặc crop người. Margin, touch target và focus kế thừa token/runtime. Đã trực tiếp xem cả 5 PNG 360/390/1440/iPhone/Pixel: CTA rõ, VI glyphs đọc được, không thấy chrome bị sửa hay ảnh crop đầu/mặt. PNG 360 được chụp sau scroll tới ảnh nên đầu nội dung không nằm trong frame; ảnh desktop chỉ thấy phần ảnh nằm trong viewport, không phải bằng chứng asset bị crop.
- Đã đọc CheckinFooter, standalone/persist continuation, Journey onStartNext, reflection callback và ReflectionFooter để đối chiếu predicate/retained state. Những handler đó byte-unchanged. Home không mở rộng resume authenticated pending-save; Start mở lại lựa chọn theo semantics cũ, không tạo một draft trống mới. Không chứng minh native session restoration từ local review này.

## Evidence được kiểm

Worker `evidence.json` ghi build/TypeScript/runtime28/catalog0, scanner23, Sites4 + isolation1 exit0. Reviewer đọc harness/commands, không rerun build hoặc broad suite. Worker Home report **9 expected/0 unexpected/0 flaky**, relevant report **82 expected/0 unexpected/0 flaky**; reviewer tự tính hash hai JSON đúng evidence và kiểm chúng trỏ vào candidate hiện tại. Report source SHA ở trên match source-freeze. Ba practice exporter tới old evidence folder được loại; không gọi 82 là mọi case toàn candidate.

Reviewer chạy probe riêng bằng Node inline + Playwright Edge, dùng `start(4193)` từ qa-global-setup, Vite/Edge cùng process; mọi request ngoài 127.0.0.1 bị abort, browser/server đóng trong finally. **Exit0 PASS** trên source pinned:

1. Guest chọn `Không thấy khó chịu` + energy `Bình thường`, handoff manual catalog, về Home: không có `Tiếp tục check-in` hoặc notice nháp; mở Start lại vẫn thấy status/energy giữ nguyên. Probe này xác minh completed-baseline/retained-energy cụ thể; region/preObservations được kiểm bằng source guard và byte-unchanged handler, không tuyên bố riêng một browser probe observation.
2. 320×640, 360×640, 390×640 sau route animation settle: primary cao51px, secondary52px; cả hai nằm trong viewport và trên footer y572; mobile-scroll không overflow ngang. X/inset lần lượt17/17/24px.
3. Keyboard modality → focus primary: outline solid3px ở cả ba width. Zero external request trong probe cuối. Không có provider/cloud writes.

Các intermediate probe được phân biệt: default sandbox đóng Edge trước khởi động; escalated browser không thấy server4188 khác context; programmatic focus ngay sau mouse không kích hoạt `:focus-visible`; lượt geometry đầu còn transform của route entrance nên không dùng bounding box đó làm layout acceptance. Sau keyboard modality và animation settle, probe cuối PASS như trên, không sửa app/harness source để đạt PASS. Đây không phải các app finding đã sửa.

## Giới hạn

Không còn finding P1/P2 trong đúng Home diff/hash. Local UI/fixture evidence không mở gate native/live Auth, data write, content/teacher/rights, AI/inference, staging upload/alias/deploy hoặc Production. Native HALTED checkpoint và web protection gate vẫn riêng. Physical devices, full screen reader/assistive technology, 200% text/reflow, toàn diện accessibility và WCAG chưa được nghiệm thu ở bước này; Vite chunk warning >500kB vẫn còn. Resume có giới hạn guest current-session đã ghi rõ trong handoff; không mở scope bước 4.2 hoặc các backlog khác.
