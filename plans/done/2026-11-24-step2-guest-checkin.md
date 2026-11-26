<!-- plan-template v1 -->
# Kế hoạch — Bước 2: check-in của khách được lưu trên máy (#1) và check-in còn một bước (#6)

Trạng thái: Owner cho bắt đầu ngày 24/11 ("Đồng ý gộp và push, bắt đầu bước 2"). Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận theo [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md). Bước 1 ([kế hoạch hàng việc](2026-11-24-ux-sequence.md)) đã được Owner xem và cho gộp (PR #3).

## 1. Mục tiêu
- Khách (chưa có tài khoản) bấm lưu check-in thì bản ghi **được giữ trên chính máy đó** và hiện trong Hành trình, kể cả sau khi tải lại app. Hết ngõ cụt "Hành trình rỗng" (rà soát #1, phương án D0 đã được đồng ý: "khách lưu cục bộ, tài khoản lưu server").
- Check-in còn **một màn** cho mọi người: chạm vùng → mức → lưu hoặc tìm bài. Bỏ bước 2 (năng lượng, 5/10/15 phút), vì không đổi bài nào hiện ra và `minutes` không được lưu (#6). Không hiện thô chữ `intent` mặc định "Bắt nhịp".

## 2. Tiêu chí xong
- Khách: lưu check-in → vào Hành trình thấy bản ghi; tải lại trang vẫn còn; xóa từng bản ghi được; có nút "Xóa mọi ghi nhận trên máy này" (hỏi lại trước khi xóa).
- Dữ liệu khách nằm ở một khóa `localStorage` riêng, có phiên bản, tối đa 60 bản ghi; đọc/ghi bọc try/catch (chế độ riêng tư hoặc bộ nhớ bị chặn thì chỉ giữ trong phiên và nói rõ).
- Khi đăng nhập: bản ghi của khách **không** tự gửi lên tài khoản và không hiện trong Hành trình của tài khoản; vẫn nằm trên máy, hiện lại khi đăng xuất về chế độ khách. (Chuyển vào tài khoản: việc sau, cần đồng ý "dữ liệu sức khỏe".)
- Người có tài khoản: check-in một màn; lưu lên server như hiện nay (chỉ khi đã đồng ý lưu check-in); không còn hỏi năng lượng và thời gian; dữ liệu gửi đi có `energyLevel` rỗng (trường vốn tùy chọn).
- Không còn dòng "Bước 1/2", thanh tiến trình hai đoạn, chữ "Bắt nhịp" hiện thô.
- `npm run check:quick`, `npm test`, `npm run check:ios15` PASS; Playwright toàn bộ PASS; bài test mới cho lưu trên máy, tải lại, xóa, và việc tách khách/tài khoản.

## 3. Phạm vi sửa
- `src/screens/checkin/CheckinScreen.tsx`, `CheckinFooter.tsx`, `src/app/` (trạng thái, một mô-đun mới `guestJournal.ts` cho lưu trên máy), `src/JourneyScreen.tsx` (nút xóa trên máy), màn luyện tập nếu hiện `intent` thô, `src/i18n/checkin.ts` (chữ mới), tests liên quan. Vùng: Learner app.
- Mức rủi ro: **R2** (dữ liệu tự khai về cơ thể lưu trên máy, đổi luồng người học thấy). Không đụng backend, migration, đồng ý phía server.

## 4. Cố ý không đụng
- Chuyển bản ghi của khách vào tài khoản (cần đồng ý riêng, chữ Owner duyệt): để sau.
- Tài khoản chưa đồng ý "Lưu check-in": giữ như cũ (không lưu).
- Màn đồng ý và chữ đã chốt khác; runtime bảo vệ.
- Trường `energy`/`minutes` trong model và server: giữ (dữ liệu cũ vẫn đọc được), chỉ bỏ khỏi giao diện.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Hành vi kề cần giữ | Bằng chứng |
|---|---|---|---|
| Check-in (Hôm nay, sau buổi) | một màn; nút lưu cho cả khách và tài khoản | đường 3 chạm; bỏ qua; chọn trạng thái chung; sửa/xóa vùng | `tests/learner-ux.spec.ts`, `learner-write-review.spec.ts` |
| Hành trình | đọc thêm bản ghi trên máy khi là khách | so sánh, đổi ngày, xóa bản ghi tài khoản | `tests/journey*.spec.ts` |
| Đăng nhập/đăng xuất | tách bản ghi khách khỏi tài khoản | `clearAccountScopedState`, khôi phục phiên | `tests/session-restore.spec.ts` |
| Chút / AI | không đổi (AI tắt) | `aiPracticeOffered` vẫn hiện nút AI khi bật | `tests/ai-*` |
| iOS 15 | chỉ dùng `localStorage`, không API mới | — | `npm run check:ios15` |

## 6. Bảo mật và riêng tư
- Dữ liệu tự khai về cơ thể **chỉ nằm trên máy**, không gửi mạng. Máy dùng chung có thể thấy: chữ cạnh nút lưu nói rõ và có nút xóa.
- `public/privacy.html` hiện chưa nói về lưu cục bộ cho khách: **cần Owner xem lại** trước khi phát hành (văn bản pháp lý là của Owner; agent không tự sửa).

## 7. Hoàn tác
- Một commit riêng; `git revert`. Khóa `localStorage` có phiên bản; bản hoàn tác bỏ qua khóa đó (không hỏng app).

## 8. Các bước
| Bước | Nội dung | Ai làm | Cỡ |
|---|---|---|---|
| 1 | Sửa mã và test | agent con (Claude), dưới sự điều phối của agent gốc | M |
| 2 | QC độc lập trên diff đã đóng băng | agent con khác, không sửa mã | S |
| 3 | Agent gốc kiểm cuối, PLAN.md, commit | agent gốc | S |
| 4 | Owner đọc nguyên văn chữ mới, thử, cho gộp | Owner | — |

## 9. Cách thử
1. Không đăng nhập: Hôm nay → "Ghi nhận cơ thể" → chạm một vùng → lưu → Hành trình thấy bản ghi; tải lại trang vẫn còn.
2. Hành trình → "Xóa mọi ghi nhận trên máy này" → xác nhận → trống.
3. Đăng nhập: check-in chỉ một màn, không hỏi năng lượng/thời gian.

## 10. Lệnh kiểm
- `npm run check:quick`, `npm test`, `npm run check:ios15`
- Playwright toàn bộ (`--trace off`)

## 11. Rủi ro còn lại
- Máy dùng chung; dữ liệu mất khi người dùng xóa dữ liệu trình duyệt (nói rõ trong chữ).
- iPhone iOS 15 thật, Android thật, TalkBack: CHƯA CHẠY.

## 12. Cần duyệt
- Owner đọc nguyên văn chữ mới (cạnh nút lưu, nút và hộp xóa) trước khi gộp vào `main`.
- Owner xem lại `privacy.html` về lưu cục bộ.
- Gộp và push: cần Owner yêu cầu.

## Progress
- [x] 1 Sửa mã và test (24/11; Playwright 227/227)
- [x] 2 QC độc lập: PASS kèm 6 điểm nên sửa; đã sửa 5 điểm (lưu khi đang khôi phục phiên, đọc không ghi đè, bài test tách tài khoản chờ đăng nhập, thêm test, dọn mã bước 2); điểm màu chữ là báo nhầm; Playwright 230/230
- [x] 3 Kiểm cuối ở agent gốc (check:quick, npm test, check:ios15 PASS; 6 spec liên quan 78/78), PLAN.md, commit
- [x] 4 Owner cho gộp 25/11 (PR #4); privacy.html còn chờ Owner xem
- Ghi chú: AI (đang tắt) vẫn gửi `minutes: 10` và `intent` mặc định trong `PracticeRoute.tsx`; sửa khi làm Chút lát 1 (bước 3).
