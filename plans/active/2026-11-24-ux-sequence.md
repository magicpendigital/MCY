<!-- plan-template v1 -->
# Kế hoạch — Thứ tự triển khai sau rà soát (bước 1: sửa nhỏ #2, #3, #9, #10)

Trạng thái: đã duyệt hướng (24/11). Bước 1 đang làm; bước 2 trở đi chưa duyệt. Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận (intake) theo [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md). Theo TASK_LIFECYCLE, mỗi bước phải xong QC độc lập, kiểm cuối và được Owner xem rồi mới sang bước sau.

## 1. Mục tiêu
Owner viết ngày 24/11: "Tôi đồng ý với các phân tích và phương án đã đề xuất. Hãy tiến hành sắp xếp và tiến hành điều chỉnh / bổ sung theo thứ tự triển khai đề xuất." Nguồn của thứ tự là [rà soát 18/11](../backlog/ux-audit-2026-11-18.md) (mục "Thứ tự gợi ý"), [thiết kế Chút](../backlog/ai-assistant-central-design.md) mục 9, [mô hình trả phí](../backlog/paid-tier-ux-2026-11-18.md) mục 9 và [vai người duyệt](../backlog/reviewer-role-design.md). Kế hoạch này xếp toàn bộ việc thành một hàng duy nhất, rồi làm bước 1.

### Hàng việc (thứ tự triển khai)
| Bước | Nội dung | Mức | Điều kiện bắt đầu |
|---|---|---|---|
| **1** | Sửa nhỏ: #2 Hành trình tự chọn bản ghi mới nhất của ngày; #3 bỏ mã chết (màn "Phạm vi hỗ trợ", nhánh "YÊU CẦU VỀ DỮ LIỆU", CSS của màn đó); #9 bỏ số "38" viết cứng, sửa chữ cũ trong workspace Owner ("app vẫn dùng nội dung trong mã"); #10 header hiện tên màn ở màn con | R1 | Owner đồng ý 24/11 (đang làm) |
| 2 | #1 khách ghi check-in được lưu trên máy (đề xuất D0/D1 đã được đồng ý) + rút check-in còn một bước (bỏ năng lượng, 5/10/15 phút: #6) | R2 | Owner xem xong bước 1; cần kế hoạch riêng (dữ liệu sức khỏe trên máy, chữ đồng ý) |
| 3 | Chút lát 1: khe Chút ở Hôm nay, chip vùng, chuỗi clip có đếm ngược 3 giây và nút Dừng, phản hồi một chạm (5 trạng thái), tấm mời tài khoản sau buổi 2–3. Bốn điểm thiết kế Owner đã đồng ý theo đề xuất ngày 24/11 | R2 | Sau bước 2; kế hoạch riêng; chữ mới đưa Owner đọc nguyên văn trước khi gộp |
| 4 | Gộp Quyền dữ liệu + Bắt đầu vừa đủ thành một tấm; dọn màn Cá nhân: chữ kỹ thuật lộ ra (#4), nhãn lệch việc (#7), ẩn mục chưa có thật | R3 (đồng ý) | Sau bước 3; chữ đồng ý cần Owner duyệt |
| 5 | Chuyển "Xem trước nội dung", "Hiển thị cho học viên" ra workspace Owner (#5); tắt lời gọi tới Edge Function chưa triển khai (#8) | R3 | Sau bước 4 |
| 6 | Vai người duyệt chuyên môn: mời/gán người khác (thiết kế T6) | R3 (vai, migration) | Kế hoạch R3 riêng; áp staging cần Owner yêu cầu |
| 7 | Trả phí F0 (trường `access`, hàm `hasEntitlement`, khe "Gói và mua hàng" ẩn) rồi F1–F4 | R2→R3 | Sau Closed testing (Owner 18/11) và khi Owner cung cấp pháp nhân bán |

Đường 3 chạm của khách (lát 0) giữ nguyên qua mọi bước.

## 2. Tiêu chí xong (bước 1)
- Vào Hành trình ngay sau khi lưu check-in: thẻ hiện bản ghi vừa lưu, không hiện "Chưa có ghi nhận" khi băng ngày ghi có bản ghi.
- Không còn route `readiness`, tệp `ReadinessScreen` và CSS `.mcy-readiness-*`; nhánh "YÊU CẦU VỀ DỮ LIỆU" không còn trong `AccountDetailScreen`.
- Hôm nay ghi "Xem tất cả bài học" thay cho "Xem tất cả 38 bài" (không số viết cứng); hai thông báo và một ghi chú trong workspace Owner nói đúng: app đọc bản công khai mới nhất, chưa có thì dùng nội dung đi kèm.
- Màn con (có nút quay lại) hiện tên màn ở header; bốn tab chính vẫn hiện "Một chút yoga".
- `npm run check:quick`, `npm test`, `npm run check:ios15` PASS; Playwright các spec liên quan PASS.

## 3. Phạm vi sửa
- `src/JourneyScreen.tsx`, `src/Prototype.tsx` (bỏ một route), `src/screens/readiness/` (xóa), `src/prototype.css` (bỏ một dòng `@import`), `src/app/styles/p55-L0777.css` (bỏ một selector), `src/screens/account/AccountDetailScreen.tsx`, `src/screens/home/HomeScreen.tsx`, `src/app/ui/Header.tsx` + một quy tắc CSS cho tiêu đề màn con, `src/staff/ContentHubPanel.tsx`, `src/staff/DisplayConfigPanel.tsx`. Vùng: Learner app, Staff.
- Mức rủi ro cao nhất: R1 theo [review matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md), vì đổi giao diện người học thấy (header, chữ một nút, chọn bản ghi), không đụng dữ liệu, đồng ý, quyền hay backend.
- Hiện trạng: nhánh `claude/dreamy-bardeen-n37gey` đã gộp `origin/main` `248de8e`; không có tệp đang dở của người khác; hành vi phải giữ: đường 3 chạm, xóa/sửa bản ghi Hành trình, so sánh, các tab chính.

## 4. Cố ý không đụng
- Runtime bảo vệ (`src/mobile/`, `styles.css`, `App.tsx`...): không cần.
- Chữ đã chốt trên Hôm nay và màn đồng ý: chỉ đổi nhãn nút "Xem tất cả 38 bài" (số sai khi kho thay đổi), không đổi câu khác.
- #1, #4–#8: thuộc bước 2–5, cần kế hoạch và chữ Owner duyệt.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| Hành trình (tab, sau check-in, sau phản hồi) | bản ghi mặc định = bản cuối của ngày đang chọn khi chưa chọn | xóa bản ghi, sửa vùng, so sánh, đổi ngày | `tests/learner-ux.spec.ts`, `tests/journey*.spec.ts` |
| Route `readiness` | xóa | không có `flow.push/replace` nào tới nó | grep `routes.readiness` = 0 |
| Header mọi màn con | hiện tên màn thay vì tên thương hiệu | trợ năng giữ `aria-label`; tab chính giữ thương hiệu | `tests/learner-ux.spec.ts:253` (tab chính, tiếng Anh) |
| Workspace Owner | chữ thông báo | không đổi hành vi | grep tests không có chuỗi này |
| iOS 15 (INC-001) | một quy tắc CSS mới, không dùng tính năng mới | — | `npm run check:ios15` |

## 6. Bảo mật
- Không bí mật, không đầu vào mới, không gọi mạng mới, không thư viện mới.

## 7. Hoàn tác
- Một commit riêng cho bước 1; hoàn tác bằng `git revert` commit đó. Không có dữ liệu hay cấu hình nào đổi.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Sửa 4 mục, chạy kiểm | agent (Claude) | S |
| 2 | QC độc lập trên diff đã đóng băng | agent con (không sửa mã) | S |
| 3 | Cập nhật PLAN.md, commit, gộp vào `main` khi Owner yêu cầu | agent | S |

## 9. Cách thử
1. Mở app, bấm "Ghi nhận cơ thể", chạm một vùng, lưu, vào Hành trình: thẻ hiện ngay bản ghi vừa lưu.
2. Vào Cá nhân → mở một mục (ví dụ Quyền riêng tư): header ghi "Quyền riêng tư" thay vì "Một chút yoga"; về tab chính thấy lại "Một chút yoga".
3. Hôm nay: nút dưới ba bài ngắn ghi "Xem tất cả bài học".

## 10. Lệnh kiểm
- `npm run check:quick`
- `npm test`, `npm run check:ios15`
- `npx playwright test tests/learner-ux.spec.ts` và các spec Hành trình liên quan (`--trace off`)

## 11. Rủi ro còn lại
- Tiêu đề màn con dài có thể bị cắt bằng dấu "…" trên màn hẹp; đã giảm cỡ chữ, chưa kiểm trên máy thật.
- iPhone iOS 15 thật, Android thật, TalkBack: CHƯA CHẠY.

## 12. Cần duyệt
- Gộp bước 1 vào `main` và push: Owner đã cho phép "commit, push, merge" ở việc trước; với bước này cần Owner xác nhận lại (không tự suy ra).
- Bắt đầu bước 2: cần Owner xem bước 1 rồi đồng ý.

## Progress
- [x] 1 Sửa 4 mục (24/11)
- [x] 2 QC độc lập (FAIL lần đầu: test tiếng Anh, tiêu đề chưa dịch, snapshotSynced chưa rõ; đã sửa, chạy lại PASS)
- [x] 3 PLAN.md, commit trên nhánh (chưa gộp `main`, chưa push: chờ Owner)
