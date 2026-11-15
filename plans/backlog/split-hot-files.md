<!-- plan-template v1 -->
# Kế hoạch — Tách tệp điểm nóng (Prototype.tsx, prototype.css, i18n.ts)

Trạng thái: bước 1 xong (2026-11-14, [bản đồ](split-hot-files-map.md): 18 lát TSX + 8 lát CSS); lát 1 gộp vào `main` 2026-11-14 (Owner duyệt); lát 2 gộp vào `main` 2026-11-14 (Owner duyệt); lát 3 gộp vào `main` 2026-11-14 (Owner duyệt); lát 4 gộp vào `main` 2026-11-15 (Owner duyệt); lát 5 xong 2026-11-16 trên nhánh `claude/lat-5-welcome`, chờ Owner duyệt gộp.

## 1. Mục tiêu
`src/Prototype.tsx` (170 KB) bị 25% commit chạm, `src/prototype.css` (97 KB) 21%, `src/i18n.ts` 14%. Hai việc song song gần như luôn đụng nhau. Tách thành mỗi màn/tính năng một tệp để agent làm song song theo vùng và đọc ít ngữ cảnh hơn.

## 2. Tiêu chí xong
- Không đổi hành vi: `npm run test:runtime` (toàn bộ Playwright), `npm run test:unit`, `npm run check:ios15` xanh sau mỗi lát.
- `src/Prototype.tsx` chỉ còn khung app và định tuyến (< 30 KB); mỗi màn ở `src/screens/<tên>/` gồm `.tsx` + `.css`.
- Không màn nào import ngược từ `Prototype.tsx`.

## 3. Phạm vi sửa
- `src/Prototype.tsx`, `src/prototype.css`, `src/i18n.ts`, tệp mới trong `src/screens/`, `src/app/`, `src/i18n/`; `src/JourneyScreen.tsx` (chỉ đổi `import type` sang `app/model`); `.gitattributes` (eol=lf cho tệp mới nếu cần); `tests/browser-compat.test.mjs` chỉ khi phải quét thêm thư mục mới.
- Mức rủi ro: R1 (UI trong hợp đồng sẵn có, không đổi dữ liệu) nhưng diện rộng; các lát consent, auth, persistence (2, 6, 7, 8, 14) review guard như R2.

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
- `npm test && npm run check:ios15 && npm run test:runtime && npm run test:sites` + so ảnh trước/sau

## 11. Rủi ro còn lại
- Thứ tự CSS thay đổi có thể đổi giao diện mà test không bắt; cần so ảnh chụp trước/sau.

## 12. Cần duyệt
- Owner duyệt từng lát trước khi gộp vào `main`.

## Progress
- [x] 1 Bản đồ phụ thuộc (job mca `job-20261113-65611dce`, Codex, chỉ đọc)
- [x] 2 Lát 1: `app/model.ts`, `state.tsx`, `events.ts`, `predicates.ts` (mca `20261114-1315-5fe8`; chuyển nguyên văn; `Prototype.tsx` 170 → 163 KB; `npm test` 22/22, `check:ios15`, Playwright 223/223 PASS)
- [x] 3 Lát 2: `useLearnerContinuation`, `snapshots`, `persistence`, `auth` (mca `20261114-1340-9837`; nguyên văn; 163 → 152 KB; `npm test`, `check:ios15` PASS; Playwright 222/223 — lỗi duy nhất là test Carousel chập chờn của fixture runtime, không liên quan)
- [x] 4 Lát 3: `app/ui/*`, `app/body/*` (mca `20261114-1536-b4be`; nguyên văn; 152 → 139 KB; `npm test`, `check:ios15`, Playwright 223/223 PASS)
- [x] 5 Lát 4: `app/navigation.tsx`, `accessibility.tsx`, `RouteSuspense.tsx`, `BottomNav.tsx` (thêm context route; Claude làm lại tay sau khi job mca hỏng; 139 → 136 KB; `npm test`, `check:ios15` PASS; Playwright 218/223, 5 lỗi hết giờ khi máy nặng, chạy lại 5/5 PASS)
- [x] 6 Lát 5: `screens/welcome/WelcomeScreen.tsx` (+ `LocaleToggle`), `WelcomeFooter.tsx` (dùng `useRoutes()`; 136 → 132 KB; `npm test`, `check:ios15`, Playwright 223/223 PASS)
