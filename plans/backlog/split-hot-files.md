<!-- plan-template v1 -->
# Kế hoạch — Tách tệp điểm nóng (Prototype.tsx, prototype.css, i18n.ts)

Trạng thái: bước 1 xong (2026-11-14, [bản đồ](split-hot-files-map.md): 18 lát TSX + 8 lát CSS); lát 1 gộp vào `main` 2026-11-14 (Owner duyệt); lát 2 gộp vào `main` 2026-11-14 (Owner duyệt); lát 3 gộp vào `main` 2026-11-14 (Owner duyệt); lát 4 gộp vào `main` 2026-11-15 (Owner duyệt); lát 5 gộp vào `main` 2026-11-16 (Owner duyệt); lát 6 gộp vào `main` 2026-11-16 (Owner duyệt); lát 7 gộp vào `main` 2026-11-16 (Owner duyệt); lát 8 gộp vào `main` 2026-11-17 (Owner duyệt); lát 9 gộp vào `main` 2026-11-17 (Owner duyệt); lát 10 gộp vào `main` 2026-11-18 (Owner duyệt); lát 11 gộp vào `main` 2026-11-18 (Owner duyệt); lát 12 gộp vào `main` 2026-11-18 (Owner duyệt); lát 13 gộp vào `main` 2026-11-18 (Owner duyệt); lát 14 gộp vào `main` 2026-11-19 (Owner duyệt); lát 15 gộp vào `main` 2026-11-19 (Owner duyệt); lát 16 gộp vào `main` 2026-11-19 (Owner duyệt); lát 17 gộp vào `main` 2026-11-19 (Owner duyệt); lát 18 gộp vào `main` 2026-11-19 (Owner duyệt); hết lát TSX; lát C1 gộp vào `main` 2026-11-21 (Owner duyệt); lát C2 gộp vào `main` 2026-11-21 (Owner duyệt); lát C3 gộp vào `main` 2026-11-21 (Owner duyệt); lát C4 gộp vào `main` 2026-11-21 (Owner duyệt); lát C5 gộp vào `main` 2026-11-21 (Owner duyệt); lát C6 gộp vào `main` 2026-11-21 (Owner duyệt); lát C7 gộp vào `main` 2026-11-22 (Owner duyệt); lát C8 (lát CSS cuối) gộp vào `main` 2026-11-22 (Owner duyệt); tách CSS xong, đợt kế tiếp là `i18n`; lát I1 gộp vào `main` 2026-11-22 (Owner duyệt); lát I2 gộp vào `main` 2026-11-22 (Owner duyệt); lát I3 gộp vào `main` 2026-11-22 (Owner duyệt); lát I4 gộp vào `main` 2026-11-23 (Owner duyệt); lát I5 gộp vào `main` 2026-11-23 (Owner duyệt).

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
- [x] 7 Lát 6: `screens/auth/AuthEmailScreen.tsx`, `AuthCodeScreen.tsx` (dùng `useRoutes()`; nguyên văn trừ 2 dòng `useRoutes()`; 132 → 121 KB; `npm test`, `check:ios15` PASS; Playwright 221/225, 4 lỗi khi máy 100% CPU — auth-callback:65, learner-ux:465, learner-ux:915, practice-flow:42 — chạy lại riêng 5/5 PASS)
- [x] 8 Lát 7: `screens/consent/ConsentScreen.tsx`, `ConsentFooter.tsx` (dùng `useRoutes()`, kể cả `finishAtAuthDestination(flow, routes, …)`; nguyên văn trừ 1 dòng `useRoutes()`; 121 → 112 KB; `npm test`, `check:ios15` PASS; Playwright 224/225, learner-ux:1038 hết giờ khi máy nặng, chạy lại PASS)
- [x] 9 Lát 8: `screens/onboarding/OnboardingScreen.tsx` (dùng `useRoutes()`; nguyên văn trừ 1 dòng `useRoutes()`; 112 → 108 KB; `npm test`, `check:ios15` PASS; Playwright 224/225, mobile-runtime:137 lỗi khi máy nặng, chạy lại PASS)
- [x] 10 Lát 9: `screens/home/HomeScreen.tsx` (+ `HomeQuickPicks`; dùng `useRoutes()`; import động `courses/*` đổi sang `../../courses/`; 108 → 104 KB; `npm test`, `check:ios15` PASS; Playwright 223/225, content-catalog:77 và content-hub:33 lỗi khi máy nặng, chạy lại 18/18 PASS)
- [x] 11 Lát 10: `screens/checkin/CheckinScreen.tsx` (+ `EnergyFace`) và `CheckinFooter.tsx` (dùng `useRoutes()`; nguyên văn trừ 2 dòng `useRoutes()`; 104 → 84 KB; `npm test`, `check:ios15` PASS; Playwright 222/225, auth-email:63, content-catalog:110 và mobile-runtime:74 lỗi khi máy nặng, chạy lại 20/20 PASS)
- [x] 12 Lát 11: `screens/reflection/ReflectionScreen.tsx`, `ReflectionFooter.tsx`, `SyncScreen.tsx` (dùng `useRoutes()`; nguyên văn trừ 2 dòng `useRoutes()`; trả chú thích `HomeQuickPicks` sót từ lát 9 về `HomeScreen.tsx`; 84 → 73 KB; `npm test`, `check:ios15` PASS; Playwright 225/225)
- [x] 13 Lát 12: `app/ui/AccountRow.tsx`, `screens/account/PrivacyToggle.tsx`, `screens/account/accountData.ts` (kiểu `AccountPanel`, liên kết pháp lý, chữ quyền riêng tư AI), `screens/help/articles.ts` (nguyên văn, chỉ thêm `export`; 73 → 69 KB; `npm test`, `check:ios15` PASS; Playwright 224/225, learner-ux:501 hết giờ khi máy nặng, chạy lại 11/11 PASS)
- [x] 14 Lát 13: `screens/account/ProfileScreen.tsx` (dùng `useRoutes()`; import động `library/readingPreviewApi`, `classes/classApi` đổi sang `../../`; 69 → 62 KB; `npm test`, `check:ios15` PASS; Playwright 224/225, learner-ux:574 hết giờ khi máy nặng, chạy lại 12/12 PASS)
- [x] 15 Lát 14: `screens/account/AccountDetailScreen.tsx` (dùng `useRoutes()`; tuyến bài hướng dẫn qua context mới `HelpRoutesContext` / `useHelpRoutes()` trong `app/navigation.tsx`, Prototype cấp cùng chỗ với `RoutesContext`; nguyên văn trừ 2 dòng hook; 62 → 39 KB; `npm test`, `check:ios15`, Playwright 225/225 PASS)
- [x] 16 Lát 15: `screens/readiness/ReadinessScreen.tsx`, `screens/help/HelpArticleScreen.tsx`, `screens/discover/DiscoverDetailScreen.tsx` (dùng `useRoutes()` ở 2 màn đầu; `HELP_ARTICLE_ROUTES` vẫn ở Prototype; 39 → 34 KB; `npm test`, `check:ios15`, Playwright 225/225 PASS)
- [x] 17 Lát 16: `screens/reading/routes.tsx` (4 route bài đọc + màn lazy), `screens/classes/MyClassesRoute.tsx` (dùng `useRoutes()`; import động đổi sang `../../`; `ReadingLessonFooter` vẫn lazy trong Prototype vì bảng route dùng; 34 → 31 KB; `npm test`, `check:ios15` PASS; Playwright 224/225, learner-ux:1038 sai số lần tải video khi máy nặng, chạy lại cùng reading-* và my-classes 20/20 PASS, lặp riêng 3/3 PASS)
- [x] 18 Lát 17: `screens/discover/CourseDetailRoute.tsx`, `screens/discover/DiscoverRoute.tsx`, `screens/journey/JourneyRoute.tsx` (mỗi tệp kèm màn lazy; dùng `useRoutes()`; import động đổi sang `../../`; 31 → 27 KB, đạt mục tiêu < 30 KB; `npm test`, `check:ios15` PASS; Playwright 224/225, mobile-runtime:74 (Carousel) lỗi khi máy nặng, chạy lại cùng discover-finder, video-progress, content-catalog, learner-ux:1038 21/21 PASS)
- [x] 19 Lát 18: `screens/practice/PracticeRoute.tsx` (kèm màn lazy; dùng `useRoutes()`), `app/PracticeCapabilityObserver.tsx` (nguyên văn; 27 → 24 KB; hết lát TSX; `npm test`, `check:ios15` PASS; Playwright 224/225, ios-input-zoom:52 hết giờ khi bấm nút ở màn chính lúc máy nặng, chạy lại cùng practice-flow và learner-write-review 33/33 PASS)
- [x] 20 Lát C1: `prototype.css` dòng 3–143 → 6 tệp `@import` theo thứ tự gốc: `app/styles/p01-L0003.css` (nền, dùng chung), `screens/welcome/styles/p02-L0057.css`, `screens/home/styles/p03-L0070.css`, `app/styles/p04-L0084.css` (hội thoại, thẻ kế hoạch, nút trình phát — không màn nào dùng), `screens/reflection/styles/p05-L0126.css`, `app/styles/p06-L0131.css` (tóm tắt hành trình, thẻ lịch sử — không màn nào dùng); CSS build giống hệt từng byte (`index-CHFd5jIO.css` trước và sau); `npm test`, `check:ios15`, Playwright 225/225 PASS
- [x] 21 Lát C2: `prototype.css` dòng gốc 145–272 → 3 tệp `@import` theo thứ tự gốc: `screens/discover/styles/p07-L0145.css` (Khám phá và chi tiết khoá học; `mcy-catalog-card`, `mcy-course-scroll-hint` không màn nào dùng), `screens/account/styles/p08-L0251.css` (thẻ hồ sơ; `mcy-offer-card`, `mcy-reset` không màn nào dùng), `app/styles/p09-L0260.css` (thanh điều hướng dưới và `@media (max-height: 760px)` của Chào/Hôm nay); dòng chú thích 273 ở lại làm đầu lát C3; CSS build giống hệt từng byte (`index-CHFd5jIO.css` trước và sau); `npm test`, `check:ios15` PASS; Playwright 219/225 lần chạy đầu (máy tải nặng), 3 tệp lỗi chạy lại 1 worker 16/16 PASS.
- [x] 22 Lát C3: `prototype.css` dòng gốc 273–418 → 11 tệp `@import` theo thứ tự gốc (p10–p20): `app/styles` (khung trang, tiêu đề, thương hiệu, nút; bản đồ cơ thể dùng chung; chân trang luồng dùng chung; hội thoại và trang kế hoạch — hầu như không màn nào dùng; `@media (max-height: 760px)` của Chào/bản đồ cơ thể), `screens/welcome`, `screens/checkin` (3 đoạn, xen giữa bởi bản đồ cơ thể và chân trang luồng), `screens/reflection`, `screens/journey` (`mcy-journey-map`, `mcy-trend-card` không màn nào dùng); CSS build giống hệt từng byte; `npm test`, `check:ios15`, Playwright 225/225 PASS.
- [x] 23 Lát C4: `prototype.css` dòng gốc 420–557 → 9 tệp `@import` theo thứ tự gốc (p21–p29): `app/styles` (bản đồ cơ thể v2, chọn kiểu, sửa vùng; `mcy-standalone-link` và `mcy-flow-footer.single` dùng ở nhiều màn; tấm chi tiết/danh sách chọn và bố cục check-in/ảnh chụp dùng chung), `screens/checkin` (3 đoạn), `screens/reflection`, `screens/journey` (`mcy-example-link` không màn nào dùng); CSS build giống hệt từng byte; `npm test`, `check:ios15` PASS; Playwright 223/225 lần đầu (máy tải nặng), chạy lại 2 tệp 1 worker 45/47, 2 bài lỗi lần đó chạy riêng 2 lần 4/4 PASS — mọi lỗi đều là phần tử chưa hiện trong 5 giây.
- [x] 24 Lát C5: `prototype.css` dòng gốc 559–684 → 7 tệp `@import` theo thứ tự gốc (p30–p36): `app/styles` (hiệu ứng dấu thương hiệu, phản hồi bấm, `prefers-reduced-motion`; `mcy-locale-note` dùng ở 3 màn; `@media (max-width:360px)` và khối `@container mcy-app-viewport (min-width:620px)` dùng cho nhiều màn, giữ nguyên một khối), `screens/checkin` (2 đoạn, gồm các `@media` và `:has()` chỉ của check-in), `screens/account` (`mcy-device-timezone`), `screens/welcome` (`mcy-slogan-note`); CSS build giống hệt từng byte; `npm test`, `check:ios15` PASS; Playwright 223/225 lần đầu (máy tải nặng; discover-finder:14 và learner-ux:1038 là lỗi do tải đã gặp ở lát trước), chạy riêng 2 lần 4/4 PASS.
- [x] 25 Lát C6: `prototype.css` dòng gốc 686–804 (trạng thái tài khoản, đồng ý, hỗ trợ, đồng bộ, sẵn sàng) → 20 tệp `@import` theo thứ tự gốc (p37–p56), chia theo từng đoạn liền cùng chủ: `app/styles` cho luật dùng ở nhiều màn (chân trang Chào/Đồng ý và `:has()`, ô nhập, lỗi biểu mẫu, thẻ đồng ý, dòng tài khoản, khung tài khoản, nhãn trạng thái, nội dung bài viết; hai khối `@container` giữ nguyên), còn lại vào `screens/welcome`, `screens/auth`, `screens/account`, `screens/reflection` (đồng bộ), `screens/readiness`, `screens/journey` (nút xoá); `mcy-auth-state-row`, `mcy-state-link`, `mcy-reauth`, `mcy-request-card` không màn nào dùng; CSS build giống hệt từng byte; `npm test`, `check:ios15` PASS; Playwright 222/225 lần đầu (máy tải nặng), 3 bài lỗi chạy riêng 2 lần 6/6 PASS.
- [x] 26 Lát C7: `prototype.css` dòng gốc 806–1094 (màn Chào, bề mặt web rộng, chi tiết khoá học màn nhỏ) → 5 tệp `@import` theo thứ tự gốc (p57–p61): `screens/welcome` cho luật màn Chào và hai khối `@media` chỉ của màn Chào; `app/styles` cho khối `@media (max-height:680px)` (có chân trang Đồng ý) và khối `@media (min-width:900px)` dùng cho nhiều màn (giữ nguyên cả khối, kể cả `@media` lồng); `courses/styles` cho video dọc và chi tiết khoá học màn nhỏ (`CourseDetailScreen`); CSS build giống hệt từng byte; `npm test`, `check:ios15` PASS; Playwright 223/225 lần đầu (máy tải nặng), 2 bài lỗi chạy riêng 2 lần 4/4 PASS.
- [x] 27 Lát C8 (lát CSS cuối): `prototype.css` dòng gốc 1096–1177 (xoá tài khoản, mật khẩu, khôi phục phiên, tìm bài nhanh, chọn nhanh, Hành trình trống, lỗi tải màn, hướng dẫn khoá học, bài chọn của biên tập) → 14 tệp `@import` theo thứ tự gốc (p62–p75): `screens/account`, `screens/auth`, `screens/welcome` (thẻ khôi phục phiên), `screens/home` (chọn nhanh), `screens/journey`, `screens/checkin` (gợi ý ô nhập), `courses/styles` (DiscoverScreen, CourseDetailScreen), `app/styles` cho luật tìm bài dùng chung Khám phá và Trang chủ và cho `RouteBoundary`; `prototype.css` giờ chỉ còn 75 dòng `@import` (3,4 KB, từ 97 KB); CSS build giống hệt từng byte; `npm test`, `check:ios15` PASS; Playwright 225/225 lần đầu.
- [x] 28 Lát I1 (i18n đầu tiên): bản đồ 6 lát i18n ghi trong [bản đồ](split-hot-files-map.md); key `brand.*` → `src/i18n/app.ts`, `welcome.*`, `session.*`, `locale.*` → `src/i18n/welcome.ts` (18 key mỗi ngôn ngữ); `src/i18n.ts` giữ facade và trải lại hai nhóm đúng chỗ cũ; bảng `vi`/`en` kết xuất trước/sau giống hệt từng byte (214 key, cả thứ tự); typecheck, `npm test`, `check:ios15` PASS; Playwright 215/225 lần đầu (máy tải nặng), 10 bài lỗi chạy riêng 2 lần 24/24 PASS.
- [x] 29 Lát I2: key `checkin.*`, `regionEditor.*` (46 key mỗi ngôn ngữ) và 4 bảng nhãn cơ thể `regionLabels`, `energyLabels`, `levelLabels`, `sideLabels` → `src/i18n/checkin.ts` (chỉ dữ liệu, `import type` `AppLocale`); hàm nhãn, `guidedChoiceLabels` (ghi nhận, Hành trình) và facade ở `src/i18n.ts`; bảng `vi`/`en` và 5 bảng nhãn kết xuất trước/sau giống hệt từng byte; typecheck, `npm test`, `check:ios15` PASS; Playwright 225/225 lần đầu.
- [x] 30 Lát I3: key `dialogue.*` (17 key mỗi ngôn ngữ, hiện không màn nào gọi; chuyển nguyên, không xoá) → `src/i18n/dialogue.ts`; bảng `vi`/`en` và bảng nhãn kết xuất trước/sau giống hệt từng byte; typecheck, `npm test`, `check:ios15` PASS; Playwright 225/225 lần đầu.
- [x] 31 Lát I4: key `reflection.*`, `sync.*` (42 key mỗi ngôn ngữ) → `src/i18n/reflection.ts`; `guidedChoiceLabels` ở lại facade vì Ghi nhận, Đồng bộ và Hành trình cùng dùng; bảng `vi`/`en` và bảng nhãn kết xuất trước/sau giống hệt từng byte; typecheck, `npm test`, `check:ios15` PASS; Playwright 225/225 lần đầu.
- [x] 32 Lát I5: key `journey.*` (65 key mỗi ngôn ngữ) → `src/i18n/journey.ts`; `src/i18n.ts` còn 126 dòng; bảng `vi`/`en` và bảng nhãn kết xuất trước/sau giống hệt từng byte; CSS build giống hệt; typecheck, `npm test`, `check:ios15` PASS; Playwright 225/225 lần đầu.
