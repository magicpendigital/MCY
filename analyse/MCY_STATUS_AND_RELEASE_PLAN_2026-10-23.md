# Một chút yoga — Hiện trạng, đánh giá UI/UX và kế hoạch phát hành web mobile + Google Play

Ngày lập: 23/10/2026. Đọc từ AGENTS.md, các bàn giao 14–21/10 trong `analyse/`, mã nguồn Android/Capacitor và chạy trực tiếp app (`?mode=web`, khung 390×844, chế độ khách, Vite local; không đăng nhập, không ghi dữ liệu, không gọi AI). Đây là đánh giá và kế hoạch, không phải phê duyệt phát hành; chưa deploy, cài đặt, ghi cloud hay đổi cấu hình nào.

---

## 1. Hiện trạng dự án

### 1.1 Đã có (mức mã nguồn / bằng chứng cục bộ)

| Mảng | Trạng thái |
|---|---|
| Ứng dụng học viên | Welcome → Check-in 2 bước (bản đồ cơ thể toàn thân + danh sách vùng) → Hôm nay → Khám phá (38 video YouTube không công khai, 3 nhóm) → Hành trình (dòng thời gian trung thực, không có % cải thiện) → Cá nhân (hồ sơ, quyền riêng tư, đồng ý, bảo mật). Chế độ web khung liền + khung giả lập iPhone/Pixel để review. |
| Backend staging | `mcy-staging` (MagicpenDigital, ACTIVE_HEALTHY theo readback 21/10). Auth email qua Resend, email thương hiệu VI/EN, ghi check-in gắn actor + consent, kill-switch, Owner control plane. Sổ migration 21 đã áp / 4 chờ (số 14/10, chưa đọc lại). |
| AI | **Tắt** (AI off, version 1, model unset). Có adapter OpenRouter + gate, nhưng catalog bài đã duyệt = 0 nên AI không có gì để gợi ý. |
| Nội dung | 38 clip YouTube (không công khai, chưa có hồ sơ quyền/caption/chuyên môn); kho `content/yoga-library`: 14 bài đọc/70 bước/55 ảnh nháp (25 slot bị chặn), 114 mục metadata mở rộng — **tất cả chưa được duyệt, ẩn với học viên**. `reviewedPracticeCatalog` = 0 buổi tập. |
| Build 21/10 | Gói web 61 tệp và APK `.mcydebug` pilot (11,585,235 byte) build PASS; fixture QA 31/31. Mới chỉ là artifact để review: **chưa deploy, chưa cài thiết bị**. Nằm trong worktree riêng `C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY`, chưa commit. |
| Quy trình | Intake → QC độc lập → root kiểm → evidence frozen; 4 tài liệu pilot UX (6.1) và 6 handbook vai trò đã soạn nhưng chưa phát. |

### 1.2 Đang bị chặn / rủi ro mở

1. **Native: khôi phục phiên (P0).** Từ 14/10 Owner báo mở lại app từ Recent/icon bị đưa về Đăng nhập; nguyên nhân chưa rõ, trạng thái HALTED. Build 21/10 không sửa lỗi này. Với app Play, đây là lỗi chặn phát hành.
2. **Truy cập web.** Cổng `BLOCKED_NO_UPLOAD_OR_ALIAS` do chưa chứng minh bảo vệ cho Preview mới; Owner đã chủ động tắt Vercel Authentication. Cổng này được viết cho pilot kín, **không phù hợp mô hình “công khai”** — cần một cổng phát hành công khai riêng (mục 4).
3. **Accessibility (P2 mở):** `FlowStack` giữ màn cũ cùng route ID trong DOM, không inert/aria-hidden theo từng entry → bàn phím/screen reader có thể chạm nội dung màn cũ. Full a11y acceptance đang BLOCKED.
4. **Nội dung/pháp lý:** chưa có buổi tập nào được duyệt chuyên môn/quyền; copy consent/privacy vẫn là “review text”; chưa có chính sách quyền riêng tư công khai.
5. **Backend là staging.** Chưa có quyết định/ngân sách cho project Production; staging giữ nguyên danh tính theo AGENTS.md.
6. **Kho mã không sạch:** 386 mục chưa commit trên `codex-mcy-p1-preview` (commit cuối 03/10); công việc 14–21/10 nằm rải ở worktree và `analyse/`. Runbook yêu cầu Git sạch để lập release manifest.
7. **Tốc độ/độ phức tạp:** bundle entry ~600 kB (cảnh báo Vite >500 kB), chưa có số đo hiệu năng trên điện thoại thật.

---

## 2. Đánh giá UI/UX (design-critique, phạm vi: mobile web 390×844, khách)

### Nhận định chung
Ngôn ngữ hình ảnh nhất quán và đúng định hướng thương hiệu (ngà ấm / xanh rừng / đất nung, serif biên tập, ảnh mềm); bản đồ cơ thể là điểm nhấn rõ; copy trung thực (không hứa chữa bệnh, trạng thái “Chưa ghi” rõ ràng). **Cơ hội lớn nhất:** lời hứa sản phẩm (“check-in → trò chuyện AI → buổi tập hôm nay”) chưa có thật, nên luồng hiện tại là *check-in dẫn tới thư viện video* — người dùng trả “công” (chọn vùng, năng lượng, thời lượng) nhưng nhận lại không thay đổi gì.

### Phát hiện (ưu tiên)

| # | Phát hiện | Mức | Đề xuất |
|---|---|---|---|
| U1 | **Dấu tiếng Việt bị tách rời ở tiêu đề serif** — quan sát thấy “thâ´y thê´ nào”, “muô´n”, “lâu”, “bă´t đâ`u”, “thê´”, “thê´ cơ bản”. Nguyên nhân: font editorial là `Georgia, Times New Roman, serif` (không đóng gói), Georgia không dựng đúng dấu chồng (ấ, ế, ầ…); Android không có Georgia nên mỗi máy một kiểu. Trái nguyên tắc “Keep Vietnamese marks unobstructed” trong BRAND_GUIDELINES. | 🔴 Nghiêm trọng (ảnh hưởng mọi tiêu đề, mọi thiết bị) | Đóng gói serif có subset tiếng Việt (ứng viên: Source Serif 4, Noto Serif, Lora, Newsreader qua `@fontsource`, weight 400/600), cập nhật token `editorial` và BRAND_GUIDELINES; kiểm ảnh chụp trên Android/iOS/Windows với bộ câu thử dấu chồng. Ảnh hưởng: chỉ `prototype.css`/token (không đụng runtime bảo vệ), Roboto đã có sẵn gói. |
| U2 | **Lời hứa lõi chưa có**: bước 2 hỏi “Hôm nay bạn muốn dành bao lâu?” rồi hiện “Hiện chưa có gợi ý tự động”; thời lượng/năng lượng chọn xong không đổi kết quả. Home: “Một bài học miễn phí, do bạn tự chọn”. | 🔴 | Phát hành 1.0 theo hai lựa chọn: **(A, khuyến nghị)** định vị thẳng là “Ghi nhận cơ thể + thư viện bài học miễn phí”, bỏ câu hỏi thời lượng/năng lượng nếu chưa dùng, dùng thời lượng để *lọc/sắp danh sách* video có sẵn (thật, không cần AI); **(B)** chờ buổi tập được duyệt rồi mới mở “Hôm nay”. Không dựng lại giao diện “gợi ý” giả. |
| U3 | **Footer chiếm ~21% chiều cao** (nút chính + 2 nút phụ 2 dòng) ở bước 1 và 2; bản đồ cơ thể bị đẩy sát chú thích. Nút “Đăng nhập hoặc tạo tài khoản (tùy chọn)” bị xuống 2 dòng. | 🟡 | Một CTA chính + một liên kết văn bản phụ; chuyển “Bỏ qua”/“Đăng nhập” thành text link; để footer ≤ 120 px trên 390×844. |
| U4 | **Cue “Cuộn xuống để xem thêm” hiện khi mọi nội dung đã vừa màn hình** (bước 2); cue ở Khám phá lặp ba lần. | 🟡 | Chỉ hiện khi `scrollHeight > clientHeight`. |
| U5 | **Chip “Cổ/Vai/Lưng…” ở Hành trình bị cắt ngang và thanh ngày cắt “T…”** | 🟢 | Thêm fade/padding cuối để báo có thể cuộn; kiểm lại với “both/left/right”. |
| U6 | **Mục “AI và điều được nhớ” hiện trong Cá nhân dù AI tắt** | 🟡 | Ẩn hoặc đổi nhãn “Chưa khả dụng” đến khi AI mở; tránh gợi ý hệ thống đang ghi nhớ gì đó. |
| U7 | **Welcome**: dòng đầu (logo/wordmark) trượt vào chậm; trên màn thấp thì `VI / EN*` (dev) trông như lỗi. | 🟢 | Đảm bảo không có chữ “EN*” trong bản production (đã có quy tắc, cần test chặn hồi quy). |
| U8 | **A11y**: P2 FlowStack (mục 1.2.3); chưa có đo tương phản số liệu, cỡ chữ lớn, screen reader, focus. | 🔴 trước Play | Sửa theo tiêu chí trong `RETAINED-ROUTE-A11Y-FINDING-v1.vi.md`, sau đó kiểm TalkBack thật. |
| U9 | **Màn đồng ý/riêng tư**: copy là văn bản review, cần bản chính thức tiếng Việt, và liên kết chính sách công khai. | 🔴 trước công khai | Soạn chính sách + điều khoản (người có chuyên môn pháp lý rà), thay copy review. |

### Điều đang làm tốt (giữ nguyên)
- Check-in tôn trọng quyền chọn: “bỏ qua”, “chưa ghi nhận”, “chỉ ghi lại, không chọn bài” là các trạng thái khác nhau.
- Bản đồ cơ thể + danh sách vùng song song; chú thích nằm ngoài ảnh.
- Hành trình không bịa xu hướng; ngày trống ghi “Chưa ghi”.
- Thanh điều hướng 4 tab rõ ràng, nhãn đủ, vùng chạm lớn.
- Màu nhấn đất nung trên nền ngà đủ nổi bật cho CTA chính; mô hình nhập khách không cần tài khoản giảm ma sát.

### Còn chưa đánh giá (cần bằng chứng thật)
Màn thực hành/phản hồi, trình phát video + caption, màn đồng ý, luồng đăng nhập email, tablet/ngang, cỡ chữ lớn, TalkBack/VoiceOver, hiệu năng thiết bị thật.

---

### 2.1 Cập nhật 23/10 (sau khi triển khai U1, U3–U7)

Phạm vi 1.0 đã được Owner chọn: khách dùng ngay, tài khoản tùy chọn, không AI, không bài thực hành mới. Đã làm trong mã nguồn (U1, U3 đã commit riêng; U6 chưa commit):

| Mục | Thay đổi | Ghi chú đính chính |
|---|---|---|
| U1 font | Đóng gói `@fontsource/source-serif-4` 5.3.1 (latin 400/400 italic/700 + vietnamese 400/400 italic). Token `--font-editorial` = `"Source Serif 4", Georgia, "Times New Roman", serif`; mọi stack serif cứng trong `prototype.css`, `practice.css`, `owner.css`, `teacher.css` dùng token. Cập nhật `design-system/tokens.*` và BRAND_GUIDELINES. h1 trang giảm 36→34px vì font rộng hơn. | Kiểm trực tiếp: “thấy thế nào”, “muốn”, “bắt đầu”, “miễn phí” dựng đúng dấu. **Wordmark và mọi tiêu đề đổi từ Georgia sang Source Serif 4 — Owner cần xem lại diện mạo thương hiệu.** |
| U3 footer check-in | Bỏ dòng tiến trình lặp (đã có “Bước x/2” ở đầu trang), chỉ còn thanh 2 đoạn; hai lựa chọn phụ thành liên kết gạch chân; nhãn “Đăng nhập hoặc tạo tài khoản (tùy chọn)” → “Lưu bằng tài khoản”. Chiều cao footer 176→124px (ngang: 162→100). | Dòng chữ lưu ý “Đây không phải đánh giá sức khỏe” ở bước 2 trước đó bị đẩy dưới footer; nay có thêm ~52px. |
| U4 cue cuộn | Không đổi mã. | **Đính chính:** cue của bước 2 và Khám phá đã chỉ hiện khi thật sự có nội dung ẩn; kết luận trước (“hiện khi đã vừa màn hình”) sai. Nguyên nhân thật là footer quá cao đẩy lưu ý sức khỏe xuống dưới (đã xử lý ở U3). |
| U5 chip/ngày bị cắt | Không đổi mã. | Là Carousel của runtime bảo vệ; mép cắt là gợi ý vuốt có chủ đích. Không thêm mặt nạ làm mờ nút cuối. |
| U6 AI (chưa commit: phụ thuộc `aiCapability` của luồng thực hành AI chưa commit) | Khi AI chưa sẵn sàng, mục/tiêu đề/nhãn đổi “AI và điều được nhớ” → “Điều được nhớ”; phần công tắc đồng ý AI giữ nguyên (không đổi chính sách consent). | Hiện lại nhãn “AI và…” khi `aiCapability === "ready"`. |
| U7 EN* | Không đổi mã. | `VI / EN*` chỉ hiện khi `import.meta.env.DEV`; bản production không có. Cần kiểm lại trên bản build. |

## 3. Mục tiêu: phát hành web mobile + Google Play (iOS là phase sau)

### 3.1 Khuyến nghị phạm vi bản 1.0 (cần Owner chốt)

**“Một chút yoga 1.0” = khách dùng được ngay; tài khoản tùy chọn để lưu check-in; thư viện video miễn phí; Hành trình; không AI; không bài thực hành mới chưa duyệt; không công cụ Teacher/Reviewer/Owner trong gói công khai.**
Lý do: đây là phần đã có và kiểm thử nhiều nhất; các phần còn lại phụ thuộc quyết định con người (chuyên môn, quyền, ngân sách AI) mà không nên đặt vào đường găng. Teacher/Reviewer/Owner ở `staff.html` và truy cập bằng tài khoản; cần kiểm bundle công khai không lộ nháp.

### 3.2 Yêu cầu của Google Play (đã tra cứu hôm nay)
- **Target API:** từ 31/08/2026 ứng dụng mới/bản cập nhật phải target Android 16 (API 36). Dự án đã `targetSdkVersion = 36`, `minSdkVersion = 24` → đạt. ([Android Developers – target SDK](https://developer.android.com/google/play/requirements/target-sdk))
- **Tài khoản cá nhân tạo sau 13/11/2023:** phải chạy closed test với ≥12 người tham gia opt-in liên tục 14 ngày mới được xin production; tài khoản tổ chức được miễn. Thông tin “12” và “14 ngày” theo trang trợ giúp Play Console. ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465)). → **Cần Owner cho biết loại tài khoản (cá nhân/tổ chức, đã xác minh chưa).** Nếu cá nhân, 14 ngày này là đường găng — bắt đầu sớm.
- **Xóa tài khoản:** app cho tạo tài khoản phải có đường xóa tài khoản và dữ liệu *trong app* **và** một liên kết web để yêu cầu xóa, khai báo trong Data safety. ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/13327111)). **Hiện không tìm thấy chức năng xóa tài khoản trong `src/`** (grep trống) → hạng mục mới bắt buộc. Cần thiết kế cùng quy tắc “lịch sử check-in append-only” và hậu quả lên dữ liệu consent/audit (phần pháp lý/giữ lại phải nêu trong chính sách).
- Các khai báo khác cần chuẩn bị (kiểm lại biểu mẫu hiện hành lúc nộp): Data safety, chính sách quyền riêng tư công khai, đối tượng/không dành cho trẻ em, xếp hạng nội dung, khai báo ứng dụng sức khỏe nếu form áp dụng, ảnh cửa hàng (icon 512, feature graphic, ảnh chụp), mô tả không nêu cam kết điều trị.

### 3.3 Khoảng trống kỹ thuật Android phát hiện trong mã
| Hạng mục | Hiện trạng | Việc cần làm |
|---|---|---|
| Application ID | `com.nilaza.motchutyoga` (release) | **ID Play là vĩnh viễn.** Owner xác nhận có dùng namespace `nilaza` hay ID MagicpenDigital/MCY trước khi tạo app trong Console (bản release hiện cài trên máy Owner dùng ID này). |
| Ký bản phát hành | Không thấy keystore/signing config; `release` chưa cấu hình ký | Tạo upload key, giữ ngoài repo, bật Play App Signing; cấu hình Gradle đọc từ biến môi trường. |
| Định dạng | Có script APK; chưa có AAB | Thêm `bundleRelease` (AAB) vào quy trình build + kiểm bằng `bundletool`. |
| Phiên bản | `versionCode 1`, `1.0` | Lập quy tắc tăng versionCode; mỗi lần upload Play cần mã mới. |
| `allowBackup=true` | Bật | Cân nhắc tắt hoặc thêm backup rules loại trừ localStorage/phiên đăng nhập (dữ liệu sức khỏe + token). Có thể liên quan lỗi khôi phục phiên — cần kiểm. |
| `minifyEnabled false` | Tắt | Chấp nhận với WebView app; ghi quyết định. |
| Lưu trữ phiên | Phiên Supabase trong WebView localStorage | Giả thuyết cho lỗi P0 (chưa kiểm chứng): chuyển sang lưu qua `@capacitor/preferences` (SharedPreferences) hoặc tìm nguyên nhân thật bằng chẩn đoán chỉ-đọc đã được review. |
| YouTube trong WebView | Đã ghi rủi ro Referer/API Client identity | Kiểm phát video trên thiết bị thật; cân nhắc `Referer` hợp lệ; ghi rõ không tuyên bố Privacy Enhanced Mode cho native. |
| Callback Auth | Auth đang kiểm thử qua scheme riêng `motchutyoga-mcydebug` (allowlist Supabase 17→18 URL chỉ thêm scheme này); chưa kiểm xem scheme/ID phát hành đã có trong allowlist chưa | Đọc lại allowlist, thêm đúng URL callback cho ID phát hành, hoặc dùng App Links (HTTPS xác minh) — bền hơn cho Play. |
| Quyền | Chỉ `INTERNET` | Tốt; giữ. |

### 3.4 Khoảng trống cho web công khai
- Quyết định **tên miền sản xuất** (hiện `motchutyoga.magicpendigital.com` gắn Preview branch) và thăng cấp Vercel Production; chọn project/team.
- Soạn **cổng phát hành công khai** thay cho cổng pilot kín: bảo vệ không còn là yêu cầu, nhưng cần: CSP/headers, kiểm bundle không chứa nháp/secret, chặn `staff` workspace khỏi lộ chi tiết, bản `robots`/SEO tối thiểu, ghi nhận lỗi (không thu dữ liệu sức khỏe).
- **Backend sản xuất:** hai lựa chọn — (1) nâng `mcy-staging` thành sản xuất có kiểm soát (đổi nhãn/ngân sách/backup) hoặc (2) project Production riêng. Cần chi phí và quyết định của Owner; không dùng dữ liệu người thật ở staging.
- Hạ chi phí rủi ro: có thể phát hành web/Play 1.0 ở chế độ **khách + không lưu đám mây** trước (không cần tài khoản), rồi bật tài khoản ở 1.1 — giảm đáng kể phụ thuộc backend/xóa tài khoản/pháp lý. Cần Owner quyết định.

---

## 4. Kế hoạch đề xuất (ước lượng thô, tuần làm việc; chưa là cam kết)

### Phase 0 — Chốt phạm vi và vệ sinh nguồn (≈ 3–5 ngày)
- Owner quyết: phạm vi 1.0 (3.1), loại tài khoản Play, application ID, tên miền, chiến lược backend (3.4), ai là người duyệt chính sách pháp lý.
- Gom nguồn: hợp nhất worktree pilot vào nhánh sạch, commit theo nhóm (UX, backend, content, tài liệu), tạo tag candidate; xử lý 386 thay đổi chưa commit mà không reset/xóa.
- Đọc lại trạng thái hiện tại: ledger migration, role, AI flag (số 14/10 đã cũ).
- *Điều kiện qua phase:* quyết định ghi lại trong AGENTS.md; nhánh sạch + build tái lập.

### Phase 1 — Sửa UX trước phát hành (≈ 2 tuần, song song Phase 2/3)
1. U1 font serif tiếng Việt (nhanh, tác động lớn).
2. U8/P2 a11y FlowStack + kiểm bàn phím, TalkBack, tương phản, chữ lớn.
3. U2 định vị lại luồng check-in theo phạm vi 1.0; U3/U4/U5/U6/U7.
4. Tablet/landscape/viewport thấp, trạng thái lỗi/offline/tải.
5. Bộ ảnh cửa hàng và ảnh chụp màn hình từ build thật.
- *Qua phase:* Playwright + ảnh chụp trên Pixel/iPhone preset + web thật; QC độc lập.

### Phase 2 — Tuân thủ, pháp lý, tài khoản (≈ 2–3 tuần)
- Chính sách quyền riêng tư và điều khoản công khai (URL ổn định); thay copy review; trang web “Yêu cầu xóa tài khoản”.
- Xóa tài khoản trong app + qua web, kèm quy tắc dữ liệu giữ lại; kiểm RLS/RPC; thử nghiệm A/B.
- Quyết định/triển khai backend sản xuất (nếu chọn có tài khoản ở 1.0) với runbook migration, backup/restore, kill-switch, theo dõi.
- Tuyên bố nội dung: không chẩn đoán/điều trị; xác nhận quyền dùng 38 clip (rights, caption) — hoặc chỉ đưa vào các clip đã xác nhận.

### Phase 3 — Android sẵn sàng Play (≈ 2–3 tuần; có thể bắt đầu sớm sau Phase 0)
1. **Chẩn đoán và sửa khôi phục phiên (P0)** bằng chẩn đoán chỉ-đọc + thử giả thuyết lưu trữ; kiểm bằng cách *Owner dùng icon thật/Recent*, không dùng shell-launch/force-stop/clear-data (quy tắc hiện hành).
2. Application ID/ký/AAB/versionCode; Play App Signing; App Links/callback Auth.
3. Pre-launch report của Play Console, kiểm thiết bị thật (Air1 Ultra + ít nhất 1 thiết bị cũ/thấp + 1 tablet).
4. Tạo app trong Console; Data safety, nội dung, đối tượng, hồ sơ cửa hàng; **upload sớm lên Internal rồi Closed testing**.
- *Tránh đường găng:* nếu là tài khoản cá nhân, bắt đầu closed test có ≥12 tester càng sớm càng tốt (14 ngày liên tục); cần sẵn danh sách tester thật, không mua/chèn.

### Phase 4 — Phát hành web (≈ 1 tuần, sau khi Phase 1–2 đạt)
- Production domain + deployment, header bảo mật, smoke test anon/khách, Core Web Vitals/độ nặng bundle (tách chunk; mục tiêu < 500 kB entry), theo dõi lỗi.
- Soft launch giới hạn (link riêng) trước khi mở truyền thông.

### Phase 5 — Production trên Google Play và quan sát (≈ 1–2 tuần sau closed test)
- Xin quyền production → staged rollout 5–20% → quan sát crash/ANR/khóa đăng nhập/xóa tài khoản → 100%.
- Kế hoạch dừng và vá nhanh (feature flag/kill-switch, bản cập nhật Play).

### Sau 1.0 (không nằm đường găng)
Buổi thực hành đầy đủ được duyệt (14 bài + 25 slot ảnh bị chặn), trò chuyện AI thật (cần nhà cung cấp/chi phí/consent/an toàn đã duyệt), luồng Teacher/Reviewer, iOS (TestFlight/App Store), tiếng Anh đầy đủ.

### Đường găng ước lượng
Phase 0 (1 tuần) → Phase 3 song song Phase 1/2 (3 tuần) → closed test 14 ngày (nếu cần) → production Play. **Khoảng 6–8 tuần** nếu Owner quyết nhanh và pháp lý không trễ; dịch chuyển chính nằm ở quyết định con người, không ở mã.

---

## 5. Quyết định cần Owner (ngắn)
1. Phạm vi 1.0: khách + tài khoản tùy chọn, không AI/không bài thực hành mới? (khuyến nghị: có)
2. Có tài khoản cloud ngay ở 1.0 hay 1.1 (khách trước)?
3. Tài khoản Google Play: cá nhân hay tổ chức; đã xác minh chưa; có ≥12 tester sẵn?
4. Application ID cho Play (giữ `com.nilaza.motchutyoga` hay ID khác) — vĩnh viễn.
5. Tên miền sản xuất; Supabase: nâng staging hay project Production riêng; ngân sách.
6. Người rà soát pháp lý/chính sách quyền riêng tư và người chịu trách nhiệm hỗ trợ/xóa dữ liệu.
7. Cho phép bắt đầu ngay các sửa UX (U1…U7) và Phase 0 hay chờ chốt thêm?

---

## 6. Giới hạn của báo cáo này
- UI/UX chỉ đánh giá trên web Vite local ở một khung 390×844, chế độ khách; không có kiểm tra thiết bị thật, TalkBack/VoiceOver, đăng nhập, thực hành, phát video.
- Thông tin Google Play lấy từ kết quả tìm kiếm hôm nay (trang Play Console Help/Android Developers); phải đọc lại bản hiện hành lúc nộp.
- Trạng thái backend/AI/ledger lấy từ ghi chép 14–21/10; chưa đọc lại hôm nay.
- Ước lượng thời gian là thô, phụ thuộc quyết định của Owner và tốc độ duyệt nội dung/pháp lý.
