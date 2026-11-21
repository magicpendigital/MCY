# Bản đồ tách tệp điểm nóng (bước 1 của `split-hot-files.md`)

Nguồn: Codex qua mca, job `job-20261113-65611dce` (chỉ đọc, HEAD `f03b856`, 2026-11-13). Đây là đề xuất, chưa phải quyết định; mỗi lát vẫn cần Owner duyệt.

Hiện trạng: `src/Prototype.tsx` 170.386 byte / 2.078 dòng; `src/prototype.css` 97.114 byte / 1.177 dòng. Mục tiêu `Prototype.tsx` < 30 KB, giữ `LearnerPrototype`, `AuthSessionRouter`, hai bảng route, portal staff/callback và các ranh giới lazy hiện có.

## Nguyên tắc
- Giữ **một** `DemoContext` / một object state; chưa tách store. State đi xuyên màn: draft check-in → auth/consent/onboarding → Discover/Practice → reflection; `pendingCheckinPayload` + idempotency key đi cùng nhau; actor/session generation, consent, history bị vô hiệu cùng lúc khi đổi tài khoản.
- Chặn vòng import:
  1. Màn lấy route qua context (`app/navigation.tsx`), không import ngược `ROUTES` từ `Prototype`; bảng route ổn định, không tạo lại theo render.
  2. `BODY_LEVELS` vào `app/model.ts`, không đặt trong body map.
  3. `JourneyScreen.tsx` đang `import type` từ `Prototype` → đổi sang `app/model` (thêm vào phạm vi sửa).
  4. `i18n`: dictionary chỉ chứa dữ liệu; giữ một `screenOverrides` singleton và facade `src/i18n.ts`.
  5. Không tạo barrel `app/index.ts` (dễ kéo module lazy vào bundle đầu).
- Giữ default export `src/Prototype.tsx` và `src/prototype.css` làm đầu vào: runtime bảo vệ không phải đổi, `mobile-runtime.lock.json` không đổi, `.gitattributes` đã đủ.
- Lát consent, auth, persistence không phải R1 thuần: review guard theo review matrix; không "rút gọn" luồng async khi di chuyển.

## Lát TSX (nối đuôi, mỗi lát một commit)
| Lát | Tệp mới ← symbol | KB | Playwright chú ý |
|---|---|---:|---|
| 1 | `app/model.ts`, `state.tsx`, `events.ts`, `predicates.ts` ← type 57–135, `BODY_LEVELS`, `initialState`, `DemoContext`, `useDemo`, `clearAccountScopedState`, 2 event, 6 predicate | ~7 | learner-ux, learner-device-acceptance, session-restore, practice-flow |
| 2 | `app/useLearnerContinuation.ts`, `snapshots.ts`, `persistence.ts`, `auth.ts` ← hook, hàm 304–489, `authErrorMessage` | ~11 | learner-write-review, auth-email, password-auth, session-restore |
| 3 | `app/ui/*`, `app/body/*` ← Brand, Action, Choice, Eyebrow, DemoNote, Header, BodyMap, BodyStylePicker, RegionEditor + bảng toạ độ | ~12 | learner-ux, ios-input-zoom, lesson-thumbnails, checkin-overall-status |
| 4 | `app/navigation.tsx`, `accessibility.tsx`, `RouteSuspense.tsx`, `BottomNav.tsx` | ~4 | flow-accessibility, learner-ux |
| 5 | `screens/welcome/` ← WelcomeScreen, LocaleToggle, WelcomeFooter | 3 | session-restore, discover-finder |
| 6 | `screens/auth/` ← AuthEmailScreen, AuthCodeScreen | 11 | auth-email, password-auth, ios-input-zoom |
| 7 | `screens/consent/` ← ConsentScreen, ConsentFooter | 9 | learner-write-review, learner-device-acceptance |
| 8 | `screens/onboarding/` ← OnboardingScreen | 4 | learner-write-review |
| 9 | `screens/home/` ← HomeScreen, HomeQuickPicks | 4 | discover-finder, content-catalog |
| 10 | `screens/checkin/` ← CheckinScreen, CheckinFooter, EnergyFace | 19 | checkin-overall-status, learner-write-review |
| 11 | `screens/reflection/` ← ReflectionScreen, ReflectionFooter, SyncScreen | 11 | practice-flow, ios-input-zoom |
| 12 | `app/ui/AccountRow.tsx`, `screens/account/accountData.ts`, `PrivacyToggle.tsx`, `screens/help/articles.ts` | ~5 | account-deletion, password-auth |
| 13 | `screens/account/ProfileScreen.tsx` | 7 | my-classes, reading-preview, reading-publish |
| 14 | `screens/account/AccountDetailScreen.tsx` (chỉ TSX) | 23 | account-deletion, password-auth, learner-write-review |
| 15 | HelpArticleScreen, ReadinessScreen (chưa có test trực tiếp), DiscoverDetailScreen | 5 | learner-ux |
| 16 | `screens/reading/routes.tsx`, `screens/classes/MyClassesRoute.tsx` | ~3 | reading-*, my-classes |
| 17 | CourseDetailRoute, DiscoverRoute, JourneyRoute | ~4 | discover-finder, video-progress, content-catalog |
| 18 | PracticeRoute, `app/PracticeCapabilityObserver.tsx` | ~3 | practice-flow, learner-write-review |

## Lát CSS (sau TSX, lấy lần lượt từ đầu tệp, không đổi thứ tự)
C1 dòng 1–144 · C2 145–273 · C3 274–419 · C4 420–558 · C5 559–685 · C6 686–805 · C7 806–1095 · C8 1096–1177.
- Mỗi đoạn rule liên tiếp cùng chủ → `src/screens/<feature>/styles/pNN-Lxxxx.css` hoặc `src/app/styles/pNN-Lxxxx.css` (`xxxx` = dòng gốc). Khối `@media`/`@container` đa màn giữ nguyên ở `app/styles`.
- `prototype.css` thành manifest `@import` theo đúng thứ tự gốc (`@import` phải đứng trước mọi rule). CSS đang nạp sớm giữ nạp sớm; không import CSS từ màn lazy.
- `.mcy-welcome` khai báo ở 8 chỗ; gom theo tên sẽ đổi cascade. Không đổi selector list, specificity; không CSS Modules, nesting, `@layer`.
- Ngân sách iOS 15 đếm toàn `src/` (viewport units 16/16, container units 7/7, `:has()` 10/10, `@container` 3/3): tách một khối `@container` thành hai sẽ vượt trần. Scanner đã quét đệ quy, không cần sửa test.

## Lát i18n (lập 2026-11-22, sau CSS)
`src/i18n.ts` (511 dòng, 214 key × 2 ngôn ngữ) giữ vai trò facade: `AppLocale`, `MessageKey`, `screenOverrides`, `msg()`, `formatMessage()` và các hàm nhãn. Mỗi lát chuyển một nhóm key liên tiếp sang `src/i18n/<nhóm>.ts`, chỉ chứa dữ liệu (`vi<Nhóm>` `as const` và `en<Nhóm>: Record<keyof typeof vi<Nhóm>, string>`); facade trải lại `...vi<Nhóm>` / `...en<Nhóm>` đúng chỗ cũ nên thứ tự key, nội dung chữ và `MessageKey` không đổi. Không tạo `src/i18n/index.ts` (để `./i18n` vẫn trỏ tới facade). Bằng chứng mỗi lát: kết xuất bảng `vi`/`en` trước/sau giống hệt từng byte (cả thứ tự key).
I1 `brand` → `app.ts`; `welcome`, `session`, `locale` → `welcome.ts` (18 key) · I2 `checkin`, `regionEditor` (46 key; cân nhắc chuyển cả bảng nhãn vùng/mức/bên/năng lượng, giữ hàm ở facade) · I3 `dialogue` (17 key, hiện không màn nào gọi; chuyển nguyên, không xoá) · I4 `reflection`, `sync` (42 key) · I5 `journey` (65 key) · I6 `discover`, `course` (26 key; phải sửa `tests/screen-text-keys.test.mjs` để đọc cả `src/i18n/*.ts`, giữ nguyên các khẳng định, và chú thích trong `contentWorkspaceContract.ts`).

## Kiểm mỗi lát
`npm run check:quick` khi sửa; trước khi giao: `npm test && npm run check:ios15 && npm run test:runtime && npm run test:sites`, cộng so ảnh trước/sau (mobile hẹp, landscape thấp, desktop, iPhone/Pixel review, reduced motion). `learner-ux` chụp ảnh nhưng không so ảnh tự động; `mobile-runtime.spec.ts` chỉ chạy fixture runtime.

Sau khi tách xong: giao agent theo thư mục feature; một người giữ quyền sửa composition, route manifest và CSS manifest. Tách `i18n` là đợt kế tiếp, giữ nguyên key, copy và cơ chế override đã xuất bản.
