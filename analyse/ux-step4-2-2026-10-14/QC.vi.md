# QC độc lập — bước 4.2 Check-in

Ngày 14/10/2026, reviewer `home_qc`. **PASS trong phạm vi R1 local; không có finding P1/P2 còn mở.** P3 ảnh xác nhận giữa transition đã đóng bằng ảnh mới và readback độc lập. Root vẫn cần trực tiếp kiểm và báo Owner rồi dừng trước 4.3.

## Phạm vi và pins

Đã đọc quyết định người dùng trong COORDINATION.vi.md và F05 audit, áp dụng root AGENTS.md hiện hành cùng mcy-change-review/review-matrix và mcy-brand-ux/brand/design references đã đọc ở checkpoint trước. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS là operation riêng. Candidate `.vercel/ux-step4-2-20261014` kế thừa candidate 4.1 đã được Owner đồng ý.

| File | SHA-256 tự đối chiếu |
|---|---|
| `src/Prototype.tsx` | `873111024377eb65ee55d229b9899d04acc798dca11c02924ab428cd6d39528c` |
| `src/prototype.css` | `856165bc65112bb46b9c4f0ee346820d5fe17607f4ecd4b0cc7fe97b8d5a340d` |
| `tests/learner-ux.spec.ts` | `8310820d8ffc64e3da1aee67cb7b4a9b367a0ea72b2822cc5271cce67ee4f0b9` |
| `tests/ux-checkin-layout.spec.ts` | `4b75a9c2a457ced4710e6965e59f547267989aa4e178ebf33a8d6a028fed9ecd` |
| `checkin.patch` | `bf07b83f48e9cd7ae465407e5fdede6972aed7bfdd7a9291f405507d48b78c2a` |

Reviewer tự hash tất cả 231 input baseline: candidate 4.1 không drift; 228 root input đã pin không drift; candidate 4.2 chỉ khác Prototype/CSS/learner-ux test và thêm một focused test. Tự so sánh text ngoài CheckinScreen và đoạn handlers từ captureContinuation tới statusDescription: byte-equivalent. Runtime/checker/lock, Home/Journey, Auth/consent/persistence/backend, assets, Step2 JSX và CheckinFooter giữ nguyên. R1 phù hợp vì diff chỉ thay UI disclosure/local visibility và bố cục quanh existing handlers.

## Source/flow review

- Prototype:1368–1371: disclosure khởi tạo từ existing preObservations; auto-open khi quay lại Step1 hoặc route key đổi và có vùng đã ghi. Không phụ thuộc mọi observation rerender nên đóng vẫn đóng; disclosure không sửa observation/bodyStatus hoặc dispatch save. Remount khôi phục discoverability qua initializer. Trường hợp xóa hết vùng khi đang mở vẫn cho dùng map/list để thêm lại.
- Prototype:1475–1504: neutral quick choices đặt trước map; `aria-expanded`/`aria-controls` trỏ panel tồn tại, hidden khi đóng. None/uncertain dùng chooseStatus hiện có; unanswered giữ null; skip riêng trong footer và dùng handler xác nhận cũ. Không coi mở map là lựa chọn sức khỏe hoặc câu trả lời. VI/EN phù hợp partial preview; không tuyên bố đánh giá an toàn/cá nhân hóa.
- Map/fullbody, trunk/arms/legs groups, body-display preference, text list, RegionEditor keyboard-aware và BottomSheet giữ hợp đồng hiện có. Quick status sau regional draft vẫn qua pendingStatus confirmation; skip vẫn confirmSkip, cancel giữ dữ liệu, confirm mới clear. Left/right unequal không bị gộp khi collapse/reopen.
- CSS mới chỉ quick choices/disclosure/panel và grid web rộng; không sửa runtime hoặc safe-area footer. Không có animation mới ngoài icon trạng thái. Scope không mở health/Auth/consent/RPC hoặc bước 4.3.

## Evidence và checks

Reviewer kiểm exact hashes của source, patch, reports, ảnh trong evidence, 4 built artifact pointers và scroll-probe.json: match. Worker báo build/TypeScript/runtime28/catalog0, scanner23, Sites4+isolation1 exit0; reviewer đọc harness/command/source boundary, không rerun build hoặc toàn suite. Harness .invalid override VITE/credentials, không `.env` copy, fs allow candidate + node_modules, server.close teardown.

Regression worker: **81 PASS + 1 geometry FAIL, exit1**, report giữ nguyên. Targeted cuối **16 PASS, exit0** gồm focused11, fullbody1 và Home4. Không gọi một lượt regression82 all-green. Test cũ chỉ thêm explicit disclosure trong helper và cuộn map trước cùng mapBottom<=footerTop/pin>=44 assertions; không bỏ data/side assertions. Gán scrollTop trong test không tự đủ làm usability acceptance; bằng chứng wheel dưới đây bổ sung khoảng trống đó.

Reviewer chạy hai probe riêng bằng Node inline + Playwright Edge, Vite `start(4195)` trong cùng process; abort mọi request ngoài127.0.0.1, browser/server đóng trong finally. **Cả hai probe cuối exit0, external requests0, appsource không đổi**:

1. 320×640: disclosure52px, x17/width286, keyboard focus solid3px. Chọn none_now rồi mở disclosure vẫn giữ none_now. Hai khuỷu tay trái Vừa/phải Nhẹ giữ qua collapse/reopen, manual catalog→Home→check-in remount→Step2 Edit auto-open. Collapse không bị effect bật lại; skip cancel giữ hai phía, confirm chuyển skipped và xóa vùng. Không kiểm bằng thay state trực tiếp.
2. Cuộn **mouse.wheel thông thường**, không gán scrollTop hoặc scrollIntoView: 390×844 map top281.625/bottom626.625, footer668, pin48px; last text region bottom663.8125 trên footer và click mở editor. 360×640 last region bottom437.1875/footer464; 844×390 last region bottom200.140625/footer228, đều fully visible/clickable. Full map đồng thời trong landscape không phải điều kiện được khẳng định; text alternative và các phần cuộn được.

Probe intermediate riêng: selector `.mobile-scroll` toàn page bị strict vì có màn history; sửa thành active-route selector. Lượt tìm full map đồng thời trên landscape cuộn vượt last region, nên không dùng làm kết luận app lỗi; probe cuối tìm last region với wheel bounded hai chiều. Worker geometry failures và ảnh quick ban đầu giữa FlowStack transition cũng được giữ/loại, không gộp thành PASS trước sửa harness.

## Visual review và finding evidence

Đã trực tiếp xem quick-final360/390/landscape/iPhone/Pixel, map-final360, expanded-final-landscape và wheel390. Portrait hiển thị ba lựa chọn trước map, đủ chữ VI và CTA; landscape dùng scroll vì vùng nội dung thấp. Map/text list có thể tới trên footer bằng wheel; chrome và safe-area giữ nguyên. Initial quick ảnh giữa transition không dùng làm acceptance.

**P3 evidence gap — CLOSED:** `checkin-confirm.png` chỉ thấy dim backdrop, chưa thấy panel trong pixels vì chụp giữa BottomSheet entrance. Tái hiện: focused test đợi dialog `toBeVisible()` rồi chụp ngay; visibility chưa chứng minh panel đã tới trong viewport. Worker giữ ảnh cũ làm rejected intermediate; separate isolated exporter chụp `checkin-confirm-final.png`, SHA-256 `28890a55aa49069e19473f985607da3ec9458e06cd6191f8155ba610ff7a6e4e`, sau hai nút trong viewport và bounded settlement500ms. Reviewer tự hash và trực tiếp xem pixels: panel có title, mô tả rõ xóa các vùng vừa ghi, nút Đổi lựa chọn và Giữ các vùng đã ghi đọc/bấm được; bounds x0/y570.90625/w390/h273.09375. `confirm-capture.json` ghi exit/PASS riêng. Behavior cancel/confirm đã PASS trong independent probe; không có source finding, không sửa app/test/report pins để chụp ảnh này. Source và hai test hashes được reviewer tự kiểm lại sau capture, vẫn match bảng trên.

## Giới hạn

Không còn P1/P2 trong đúng diff/source pins. Local/browser fixture pass không nghiệm thu native session/data restoration, physical Android/iOS, live/backend/Auth, clinical/content/teacher/rights, full assistive technology/screen reader/WCAG hoặc 200% reflow. Vite chunk >500kB warning còn nguyên. Không appcode edit, root integration, native/email/deploy/AI inference/cloudwrite trong QC. Bước4.3 vẫn WAITING_USER.
