<!-- plan-template v1 -->
# Kế hoạch — Tách tệp điểm nóng (Prototype.tsx, prototype.css, i18n.ts)

Trạng thái: chờ duyệt từng lát (Owner đã chọn ngày 2026-11-13: giao mca từng bước, nối đuôi, review chéo).

## 1. Mục tiêu
`src/Prototype.tsx` (170 KB) bị 25% commit chạm, `src/prototype.css` (97 KB) 21%, `src/i18n.ts` 14%. Hai việc song song gần như luôn đụng nhau. Tách thành mỗi màn/tính năng một tệp để agent làm song song theo vùng và đọc ít ngữ cảnh hơn.

## 2. Tiêu chí xong
- Không đổi hành vi: `npm run test:runtime` (toàn bộ Playwright), `npm run test:unit`, `npm run check:ios15` xanh sau mỗi lát.
- `src/Prototype.tsx` chỉ còn khung app và định tuyến (< 30 KB); mỗi màn ở `src/screens/<tên>/` gồm `.tsx` + `.css`.
- Không màn nào import ngược từ `Prototype.tsx`.

## 3. Phạm vi sửa
- `src/Prototype.tsx`, `src/prototype.css`, `src/i18n.ts`, tệp mới trong `src/screens/`, `src/app/`, `src/i18n/`; `.gitattributes` (eol=lf cho tệp mới nếu cần); `tests/browser-compat.test.mjs` chỉ khi phải quét thêm thư mục mới.
- Mức rủi ro: R1 (UI trong hợp đồng sẵn có, không đổi dữ liệu) nhưng diện rộng.

## 4. Cố ý không đụng
- Runtime bảo vệ (`src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/mobile/`), `src/staff/`, backend, chữ "đã chốt".

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| `src/App.tsx` → `Prototype` | vị trí mã các màn | mọi luồng học viên, iOS 15 | Playwright toàn bộ + `check:ios15` |
| Thứ tự CSS | thứ tự nạp CSS đổi khi tách | bố cục mọi màn | so ảnh chụp trước/sau ở `test-results/` |
| `tests/browser-compat.test.mjs` | ngân sách CSS theo tệp | cổng iOS 15 | phải quét cả thư mục mới, ngân sách không tăng |

## 6. Bảo mật
- Không thêm thư viện; không đổi luồng đồng ý/tài khoản.

## 7. Hoàn tác
- Mỗi lát là một commit riêng trên nhánh `mca/run-*`; revert lát đó.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Bản đồ phụ thuộc trong `Prototype.tsx` (màn, state chung, helper) → đề xuất cây thư mục | mca (chỉ đọc) | S |
| 2 | Tách helper/state dùng chung ra `src/app/` | mca | M |
| 3 | Mỗi lần một màn (Chào, Check-in, Hôm nay, Bài tập, Ghi nhận, Hành trình, Khám phá, Tài khoản…) kèm CSS của nó | mca, nối đuôi | M |
| 4 | Tách `i18n.ts` theo màn | mca | M |

## 9. Cách thử
1. Sau mỗi lát, mở app cục bộ và đi luồng chính: Chào → Check-in → Bài tập → Ghi nhận → Hành trình.

## 10. Lệnh kiểm
- `npm run check:quick && npm run test:unit && npm run check:ios15 && npm run test:runtime`

## 11. Rủi ro còn lại
- Thứ tự CSS thay đổi có thể đổi giao diện mà test không bắt; cần so ảnh chụp trước/sau.

## 12. Cần duyệt
- Owner duyệt từng lát trước khi gộp vào `main`.

## Progress
- [ ] 1 Bản đồ phụ thuộc
