# Root verification — revision thị giác 4.2, 16/10/2026

**IMPLEMENTED_QC_ROOT_VERIFIED_WAITING_USER** trong phạm vi UI local R1. Root đã đọc đầy đủ QC cuối, kiểm exact source/diff/harness và trực tiếp thao tác preview bằng CUA; không có P1/P2 bổ sung. **4.3 — WAITING_USER.** Root chỉ điều phối, phản biện và kiểm tra; source do implementer triển khai.

## Exact candidate và QC đã đọc

Candidate `.vercel/ux-step4-2-visual-20261016`, preview <http://127.0.0.1:4190/?mode=web>, backend fixture `.invalid`. Root tự kiểm Get-FileHash trên source cuối, đọc final diff/harness và chấp nhận QC trong các giới hạn đã nêu.

| Input | SHA256 |
|---|---|
| Prototype.tsx | `f25242eb356fbf7289bf6b67596599e2c84959533252d929a065864fee3ab781` |
| prototype.css | `390d1f2f58ae4cea1957243d41a2138420ab9241086a5d9dbf8d63f5c7216f6e` |
| source-freeze.json | `d4e0b80ec2074414f2630ca9ac28e7926a6c7a20a8d0c956026552acf7eb04ce` |
| evidence.json | `a1b8627b95c2e4aa5fe52c141d8a7186ac9a1b05ef29dcac56b3629033009201` |
| QC.vi.md, root đã đọc toàn bộ | `8a0b8ac09225adc265117164dd8bde9362df0bbc2da690996fcd03e92ae443b6` |

QC kết luận PASS phạm vi diff R1 local, không còn P1/P2; P3 mép nút320 và P2 reflow English28px đã được sửa và recheck độc lập. Không coi các lần chạy lỗi hay snapshot trước sửa là final PASS.

## Root trực tiếp quan sát và thao tác

- Fresh guest ở360×640: hai lựa chọn ban đầu đều `aria-pressed=false`; font14px, mỗi vùng chạm cao44px, đáy367 so với footer464, document width360. Root tự xem `root-final-360.png`.
- 320×568: document width320, hai vùng chạm cao59.1875px, đáy382.1875 so với footer392; không clipping. Root tự xem `root-final-320.png`. Khoảng trống9.8125px cũng chứa được focus outline3px+offset3px.
- Root dùng Enter chọn “Chưa xác định”, đi tiếp Step2 và thấy summary “Chưa xác định”; chọn “Sửa” rồi mở thẻ vẫn giữ lựa chọn này. Sau resize390×844, thẻ expanded không lặp thumbnail/câu giá trị, group selector hiện rõ; root tự xem `root-final-expanded-390.png`.
- Root cuộn CUA thông thường0.3 tại vùng map: toàn thân hiện phía trên footer và danh sách chữ tới được. Root tự xem `root-final-map-390.png`.
- Root chọn “Cổ” từ danh sách chữ → “Nhẹ” → “Lưu vùng này”: chỉ tạo fictional guest draft trong bộ nhớ. Collapse hiện số1; mở lại vẫn có “Cổ · Nhẹ”. Không thực hiện lưu check-in cuối.
- Chọn “Không thấy khó chịu” mở confirmation; root tự xem ảnh đã settle, thấy đủ hai hành động. “Giữ các vùng đã ghi” giữ “Cổ · Nhẹ”; lặp lại và chọn “Đổi lựa chọn” chuyển none_now sang pressed=true, “Cổ” về “Chạm để ghi”. Root xác nhận clear đã xảy ra đúng sau xác nhận. `root-final-confirm-390.png` là ảnh root tự chụp/xem.
- Reload kết thúc trial guest và trở về Welcome. Các thao tác này không tạo account/live health record. Root đã reset viewport override, reload rồi mở fresh guest: cả hai lựa chọn chưa chọn, thẻ ban đầu thu gọn. Tab preview được đánh dấu Deliverable và đang hiển thị tại4190?mode=web để bàn giao.

Năm ảnh trên thuộc root, không phải implementer hoặc QC tự nhận là root đã xem.

| Ảnh root | SHA256 |
|---|---|
| root-final-360.png | `f7e639644ee4fa4fe32916c19278d8702c4ea085458055ab34c85e981f3abf07` |
| root-final-320.png | `6951bb0d05cc7326b9452d1a66bc0959979aff7d28073b4454fbdfb63c2bd83d` |
| root-final-expanded-390.png | `e45b07ec40f1c85898870f588540bfcdc254d870bf7f2410c729618ea1470624` |
| root-final-map-390.png | `36989cc29f10d4818b135f6b2f243aa1b9cdaa9144bbe5ddad9b1f2f01c1d0df` |
| root-final-confirm-390.png | `e1db6279acd48df6c2ae098332e2f63d5b557ae15207d438ca49f25fa7303346` |

## Bằng chứng đúng theo từng source

Implementer: regression45/45 process exit0 trước các refinement CSS/text, giữ nguyên report lịch sử; focused15/15 process exit0 trên source cuối với actual28px text/range bounds, seven viewports và các nhánh liên quan. Không cộng thành60 unique tests. Build/TypeScript, integrity28 protected files, catalogue0 issue, bundle scanner23 text files và Sites4+isolation1 đều exit0. Không gọi integrity28 là28 UI tests hoặc scoped Playwright là toàn suite runtime.

QC: 13 record PASS trên source trước text fix được giữ nguyên attribution; process đó exit1 ở EN2x và không được gọi là all-green. Final4/4 own recheck process exit0 trên exact final pins: default320/360 và actual2x VI/EN, accessible names, focus/keyboard và bounds; externalRequests0. QC không chạy lại45 hoặc build. Root đã đọc và chấp nhận cách phân biệt bằng chứng này; root manual checks ở trên là một lớp riêng.

## Giới hạn và điểm dừng

PASS chỉ cho local UI và diff hiện tại. Chưa có physical Android/iOS, native restoration/Auth, OS dynamic type, đầy đủ browser200%zoom/WCAG hoặc screen reader acceptance. True2x checks giới hạn ở changed card/quiet choices. English còn là partial internal preview. Vite chunk >500kB warning giữ nguyên.

Không root integration, real data/Auth/consent/SQL write, AI inference, native build/install/launch, deploy/alias hoặc Production change. Native HALTED và web BLOCKED_NO_UPLOAD_OR_ALIAS tiếp tục áp dụng. Candidate4.2 cũ và evidence cũ giữ nguyên; pre-QC/pre-text-fix snapshots giữ đầy đủ mapping/hash. Bước4.2 revision đã triển khai và kiểm tra trong candidate local; dừng để người dùng xem, **không bắt đầu4.3**.
