# MCY UI/UX audit — 30/09/2026

## Kết luận

UI local có concept thương hiệu khá nhất quán và responsive desktop đã được xử lý bằng canvas giới hạn chiều rộng. Chưa thể đánh giá là production-ready: còn gate nội dung/quyền, thiết bị, triển khai và playback ổn định. Course detail có retry ngay trong app và fallback ngoài chỉ theo lựa chọn. Playwright tuần tự PASS 33/33; suite vẫn không thay thế xác minh Safari/Android thật hoặc CI branch protection. Playback local Edge không nhất quán: một capture hiện hình thật, capture kế tiếp còn spinner. Hosted Preview chưa được cập nhật.

## Hành trình đã review

1. **Welcome — desktop 1440×1000, mobile 390×844.** Ảnh yoga, wordmark, slogan và CTA có thứ bậc rõ; palette/serif/spacing đi cùng brand đã chọn. Trên desktop canvas giữ nội dung trong khung tối đa 1320px và CTA không kéo hết chiều ngang. Điểm cần theo dõi: ảnh chiếm diện tích lớn, nhưng không lấn phần nhận diện/điểm bắt đầu.
2. **Check-in — desktop 1440×1000, mobile 390×844, short portrait 320×568.** Bản đồ toàn thân, lựa chọn nhóm vùng và danh sách chữ đều hiện; có trạng thái “không khó chịu”, “chưa xác định” và “bỏ qua” riêng. Footer hai bước giữ CTA trong tầm với, phần dài cuộn được. Trên desktop nội dung tập trung vào cột giữa, có khoảng thở lớn; không thấy tràn ngang. Safari, bàn phím và thao tác bằng thiết bị thật chưa được audit.
3. **Danh mục video miễn phí — desktop và mobile.** Ba nhóm hiển thị 18/13/7 bài; tiêu đề mô tả video là bài riêng, nói rõ nguồn YouTube và xử lý dữ liệu kết nối. Card, heading, tab bar theo đúng palette và hierarchy. Nội dung dài hơn viewport và dựa vào cuộn tự nhiên; chưa đo bằng screen reader.
4. **Chi tiết bài học — mobile 390×844.** Ảnh trước sửa cho thấy grid hai cột vẫn áp trên mobile: phần mô tả chỉ còn một dải hẹp, chữ xuống dòng bất thường. Đã đổi mặc định sang một cột. Ảnh sau sửa xác nhận cột đơn và không tràn ngang. Lượt review trực tiếp mới phát hiện nút Play bị đẩy sát mép dưới bởi poster 9:16 trống; đã thu gọn riêng poster trước phát thành 16:9 trên mobile. Screenshot viewport 390×844 sau chỉnh sửa cho thấy nút Play trọn vẹn trong màn hình; sau khi Play, player chuyển về khung dọc 9:16 và nội dung tiếp tục cuộn bên dưới.
5. **Chi tiết bài học — desktop 1440×1000.** Desktop dùng grid 360px + 554px; tiêu đề/metadata và copy vẫn đọc được, không tràn ngang. Player dọc giữ tỷ lệ video. Sau thao tác Play, iframe được gắn; ảnh chụp cho thấy vùng player tối, nên chất lượng render/phát nội dung bên trong chưa được xác minh.
6. **Trợ giúp và quyền riêng tư AI — mobile 390×844.** Rà soát phát hiện cả bốn mục trợ giúp trước đó được đưa về một nội dung chung. Đã tách thành bốn bài hướng dẫn có nội dung riêng, kiểm tra tìm kiếm/empty state và đường tới privacy settings. Copy quyền riêng tư nói rõ AI inference đang tắt, tin nhắn không gửi provider và nút thể hiện “Đồng ý/Rút đồng ý” thay vì ngụ ý bật/tắt dịch vụ. Playwright cuộn được tới toggle cuối màn rồi khôi phục cuộn lên đầu trước chụp; ảnh sau khi chuyển cảnh hoàn tất cho thấy danh sách và bài viết đọc được. Nội dung bài ngắn nên còn khoảng trắng cuối trang, chấp nhận được cho dạng hướng dẫn ngắn nhưng có thể bổ sung khi có nội dung đã duyệt.
7. **Hồ sơ và quyền nội dung — mobile 390×844.** Bản trước gộp “không có khóa học” với “không có giao dịch” dù có 3 khóa miễn phí; nay khóa miễn phí xem trong app được tách khỏi thông tin khóa trả phí chưa cung cấp, không giả vờ đã tra cứu lịch sử mua từng tài khoản. Hồ sơ từng hiển thị chip `Asia/Bangkok` có vẻ chỉnh được nhưng không lưu; nay dùng múi giờ thiết bị thật ở dạng chỉ đọc, 14px. Hai flow Playwright xác nhận quyền nội dung và múi giờ trình duyệt; ảnh cho thấy các khối gọn, không tràn và còn CTA/footer rõ. Múi giờ không được lưu vào profile hay đồng bộ server.
8. **Check-in khi AI inference tắt — mobile 390×844 và desktop 1440×1000.** CTA chính đưa thẳng tới bài miễn phí; nội dung báo rõ chưa có gợi ý tự động; đăng nhập/tạo tài khoản là tùy chọn. Screenshot mới xác nhận trên mobile các lựa chọn không chen lấn footer, desktop giữ cột nội dung và CTA ở giữa canvas; không tràn ngang. E2E xác nhận lựa chọn được giữ sau khi mở rồi quay lại từ luồng tài khoản và không gọi endpoint AI.

## Đã xử lý trong lượt này

- **C17:** tách quyền xem khóa học miễn phí khỏi trạng thái sản phẩm trả phí chưa được cung cấp; không khẳng định tài khoản đã được kiểm tra giao dịch.
- **C18:** thay múi giờ hard-code bằng múi giờ runtime của thiết bị/trình duyệt, chỉ đọc; không tạo setting giả hoặc hứa lưu/sync khi schema không có trường đó.
- **C21:** bỏ CTA đăng nhập bắt buộc và nhãn “xem kế hoạch” gây hiểu nhầm; vào thư viện video miễn phí trực tiếp, giữ check-in trong phiên, consent lưu riêng, và nêu rõ chưa có gợi ý tự động khi AI tắt. Legacy auth return từ hội thoại nay về `discover`, không còn nhắm tới route `plan` không tồn tại.

## Điểm mạnh

- Brand direction đã chọn được áp dụng nhất quán: Khoảng mở, ivory, forest green, terracotta, serif editorial và Roboto cho nội dung giao diện.
- Khung web desktop không còn kéo nội dung thẳng ra toàn bộ chiều rộng; catalog dùng hai cột, màn đọc có max-width.
- Check-in cung cấp cả bản đồ tương tác lẫn danh sách chữ; phản ánh các trạng thái tự báo cáo, không giả định tiến triển sức khỏe.
- 38 bài học dùng ID YouTube thật; catalog tải động, không mount hàng loạt iframe. Player chỉ mount khi người học nhấn Play và màn học được rời đi thì iframe được tháo.
- Mobile detail đã được sửa để không ép video và copy vào hai cột trên màn 390px.
- Help center có câu trả lời theo đúng chủ đề thay vì nhiều link trỏ một trang; AI-off được giải thích nhất quán tại màn quyền riêng tư và hướng dẫn.

## Lỗi/rủi ro còn lại

- **P1 — release:** Vercel Preview đang mở là bản cũ, còn nội dung buổi tập mẫu và nhiều YouTube subframe. Không thể cập nhật từ phiên hiện tại: Vercel API trả 403 do thiếu scope team và Vercel CLI không sẵn có. Không có Production deployment mới.
- **P1 — xác minh playback:** iframe mount không đồng nghĩa video có thể phát. Cần kiểm trên thiết bị/browser thật và trong hosted Preview mới; screenshot hiện tại chỉ chứng minh trạng thái UI.
- **P1 — giảng viên/nguồn nội dung:** giao diện hiện ghi attribution theo kênh “Một chút yoga”, chưa liên kết người dạy với hồ sơ giảng viên đã xác minh. Chỉ hiển thị tên đăng ký sau khi có profile/role binding được Owner xác nhận; không hard-code tên/email.
- **P1 — xác minh release/thiết bị:** full Playwright local PASS 33/33 trên Edge khi chạy tuần tự. Chưa xác minh GitHub required checks/branch protection, Safari/WebKit hoặc E2E trên iPhone/Android thật; local PASS không tương đương hosted CI/device coverage.
- **P2 — media presentation:** Poster trước khi phát dùng nền/tiêu đề chung, không phải thumbnail của clip. Điều này tránh dùng asset chưa rõ quyền nhưng làm các bài kém nhận diện; chỉ bổ sung thumbnail sau khi có quyền sử dụng được ghi nhận.
- **P2 — chiều dài nội dung:** Khung Shorts 9:16 trên mobile chiếm nhiều chiều dọc; hành vi cuộn là có chủ đích nhưng cần kiểm thêm trên máy thật, nhất là vị trí CTA và nút phản hồi khi bàn phím mở.
- **Accessibility đang được xác minh từng phần:** ngày 01/10, luồng FlowStack khóa bàn phím đã được test và sửa để scene cũ `aria-hidden`/`inert`, focus theo heading màn hiện hành, và có focus ring. Không có audit axe/screen-reader hoặc contrast toàn hệ thống; cỡ chữ/zoom thật, VoiceOver/TalkBack vẫn chưa kiểm.
- **Design system:** Visual language nhất quán nhưng `prototype.css` vẫn là stylesheet lớn, chứa nhiều override và giá trị trực tiếp. Có token và component dùng chung; chưa có component catalog/documented variants đủ để đảm bảo scale-up không tạo drift.
- **Performance:** Latest production build learner entry 832.27 kB minified (245.20 kB gzip), còn Vite warning trên 500 kB; cần chia route tiếp và profile trên thiết bị thực.

## Bằng chứng ảnh

Ảnh desktop/mobile tổng quan được chụp trên local preview `http://127.0.0.1:4175/?mode=web`. Ảnh Help/Privacy/quyền nội dung/hồ sơ/C21 mới được chụp bằng Playwright trên local Vite `http://127.0.0.1:4177/?mode=web`, sau khi chuyển cảnh ổn định; ảnh lưu trong thư mục cùng cấp `2026-09-30-current/`:

- [Desktop welcome](2026-09-30-current/desktop-01-welcome.png)
- [Desktop check-in](2026-09-30-current/desktop-02-checkin.png)
- [Desktop free-course catalog](2026-09-30-current/desktop-03-free-catalog.png)
- [Desktop lesson detail](2026-09-30-current/desktop-04-course-detail.png)
- [Desktop player after Play](2026-09-30-current/desktop-05-in-app-player.png)
- [Mobile catalog](2026-09-30-current/mobile-03-free-catalog.png)
- [Mobile lesson detail after fix](2026-09-30-current/mobile-04-course-detail.png)
- [Short-portrait check-in](2026-09-30-current/mobile-short-01-checkin.png)
- [Help center — danh sách hướng dẫn](2026-09-30-current/help-01-list.png)
- [Help article — body map](2026-09-30-current/help-02-body-map-guide.png)
- [Privacy — AI inference off](2026-09-30-current/privacy-03-ai-off.png)
- [Nội dung miễn phí và quyền trả phí](2026-09-30-current/account-access-04.png)
- [Hồ sơ — múi giờ thiết bị](2026-09-30-current/profile-timezone-05.png)
- [Mobile check-in — AI off, CTA bài học miễn phí](2026-09-30-current/mobile-06-checkin-ai-off.png)
- [Desktop check-in — AI off, CTA bài học miễn phí](2026-09-30-current/desktop-06-checkin-ai-off.png)

`mobile-04-course-detail.png` predates the final compact-poster adjustment. The updated 390×844 view was captured and reviewed live in the local preview; it is not substituted for the older image file.

## Addendum — kiểm tra lại mục video, 30/09/2026

Screenshot Playwright mới: [chi tiết mobile](2026-09-30-current/free-course-detail-mobile-final.png) và [chi tiết desktop](2026-09-30-current/free-course-detail-desktop-final.png). Mobile dùng một cột; desktop đặt media cạnh metadata và danh sách hai cột. Màu sắc, typography và khoảng cách theo cùng hệ thiết kế. Khi player mở, có nút retry trong app và liên kết nguồn YouTube mở tab mới chỉ khi được chọn.

Test mô phỏng request YouTube bị chặn xác nhận retry gửi lại đúng video, không tạo player thứ hai và không rời URL ứng dụng. Playback thật biến thiên trong Edge: một capture hiện khung hình video, capture kế tiếp cùng sample còn spinner sau 4,5 giây. Playback vì vậy chỉ **PARTIAL**; không suy rộng sang 38 clip, âm thanh, WebView hoặc máy thật. Quyền sử dụng, caption, thumbnail và safety review vẫn là gate riêng.

Sau patch, `npm run test:runtime -- --workers=1 --reporter=line` PASS 33/33; `npm run build` PASS, nhưng chunk learner 832.27 kB minified / 245.20 kB gzip vẫn vượt cảnh báo 500 kB. Safari/Android thật, CI required checks và hosted Preview còn CHƯA XÁC NHẬN.

## Gate trạng thái

| Gate | Trạng thái | Bằng chứng/giới hạn |
|---|---|---|
| Local screenshot review desktop/mobile | PASS · phạm vi local | Đã lưu và mở xem ảnh nêu trên; browser viewport 1440×1000, 390×844, 320×568. |
| Course-detail responsive geometry | PASS · Playwright script độc lập | 390px một cột, 1440px hai cột, `scrollWidth === viewport`; chưa phải test runner/CI. |
| Automated regression test | PASS 33/33 · local | `npm run test:runtime -- --workers=1 --reporter=line`, Edge/local Vite 4177: 33/33 PASS. Bao gồm responsive, hai device presets, no-AI guest flow và kiểm lỗi/retry YouTube; không chứng minh branch protections/CI, WebKit/Safari hoặc thiết bị thật. |
| YouTube playback thực | PARTIAL · local Edge | Một capture hiện hình video thật; capture lặp lại cùng sample còn spinner. Chưa playback ổn định, chưa kiểm 38/38, âm thanh, máy thật hoặc hosted Preview. |
| Hosted Preview cập nhật | BỊ CHẶN | API 403 scope team; CLI không có. |
| Android cài revision mới | BỊ CHẶN · dữ liệu cũ giữ nguyên | `assembleDebug` PASS với JDK 21; cài đè bị `INSTALL_FAILED_UPDATE_INCOMPATIBLE` do chữ ký APK khác bản đang cài. Không gỡ app. Cần đúng signing key hoặc Owner duyệt gỡ/cài lại có nguy cơ mất dữ liệu local. |
| Production release | CHƯA ĐẠT | AI, teacher actor/security, rights/safety content, E2E, physical devices, deployment/rollback và legal gates vẫn mở. |

## Addendum — kiểm tra UX hỗ trợ phát video, 30/09/2026

Sau patch cuối, lỗi/retry YouTube được thu gọn vào disclosure **“Video gặp sự cố khi phát?”**; panel chứa retry nội bộ và lựa chọn mở nguồn YouTube chỉ xuất hiện theo yêu cầu. E2E xác nhận panel đóng ban đầu, trạng thái ARIA, link nguồn an toàn và retry đúng clip, không nhân đôi iframe. Ảnh và biên bản chi tiết: [run-03 review](2026-09-30-current/run-03/review.md).

Desktop 1440×1000 có khung hình video thật ở 0:02/0:43; mobile 390×844 có một capture trước đó phát được, nhưng capture mới sau 20 giây vẫn hiện spinner. Playback tiếp tục **PARTIAL**, không coi iframe mount là bằng chứng phát ổn định. Course catalog/detail nhìn cân đối và không tràn ngang ở các viewport đã thử; đây chưa phải xác nhận accessibility hay thiết bị thật. Capture mới nhất, gồm trạng thái spinner mobile, được lưu trong `2026-09-30-current/run-03/`.

Sau patch: `npm run check:runtime` PASS (28 protected files), `npm run test:runtime -- --workers=1 --reporter=line` PASS 33/33, `npm run build` PASS với cảnh báo learner chunk 832.69 kB minified / 245.31 kB gzip (>500 kB), `npm run check:bundle-secrets` PASS (8 text assets), `npm run test:sites` PASS 4/4, `git diff --check` PASS. Các metadata bài có tên dạng `bài 17`/`bài 32` còn cần biên tập đối chiếu nội dung thật; accessibility audit, Safari/Android WebView, Preview mới và xác minh quyền/captions/thumbnails vẫn **CHƯA XÁC NHẬN**. Test Sites thành công không phải bằng chứng deployment.

## Addendum — copy audit và hồi quy cuối ngày 30/09/2026

- Bài hướng dẫn được làm rõ phạm vi: người học tự chọn từng bài trong danh mục; ứng dụng hiện không ghép video thành buổi tập hay chọn bài từ check-in. Đã bỏ attribution “nhóm nội dung MCY” và thông tin ngày rà soát/nguồn không có bằng chứng. Disclaimer được giữ ở giọng hướng dẫn, không mang sắc thái tư vấn y tế. Regression test `course guidance has honest scope and does not invent editorial or review metadata` xác nhận copy và không hiển thị metadata tự nhận chưa được xác minh.
- Screenshot mới [course-guidance-mobile](2026-09-30-current/run-03/04-course-guidance-mobile.png) chụp tại 390×844 sau khi đợi route transition hoàn tất và đã được xem trực tiếp. Bố cục một cột, cỡ chữ/độ rộng dòng dễ đọc, khoảng trắng cuối trang còn lớn do nội dung ngắn nhưng không làm hỏng hierarchy hoặc che điều khiển; không có lỗi console/pageerror ở lượt kiểm tra. Không có screenshot desktop mới riêng cho bài này; kết luận desktop tiếp tục dựa trên audit responsive trước đó.
- Hồi quy đầy đủ mới nhất `npm run test:runtime -- --workers=1 --reporter=line`: **34/34 PASS**, Chromium Chrome/local preview. `npm run check:runtime` PASS 28 protected files; `npm run build` PASS; Sites 4/4; bundle secret check PASS (8 text assets); `git diff --check` PASS. Learner JS chunk 832.42 kB min / 245.23 kB gzip vẫn phát cảnh báo >500 kB, nên performance optimization và thiết bị thật còn mở.
- Các gate kiểm soát và vận hành không đổi: anon ACL tests PASS; authenticated actor suite chưa chạy do thiếu fixtures; staging không có Edge Functions deployed; AI giữ off; Vercel deployment-list read bị 403 thiếu team scope (không thử deploy); cài APK bị mismatch certificate và không gỡ app. Chín video YouTube được đọc metadata đại diện vẫn có tiêu đề kiểu “bài 17/32”; nội dung thật chưa đủ để biên tập tên tư thế. Không thay metadata YouTube nếu chưa có xác nhận ngay trước khi lưu. Rights, captions, thumbnail, safety review, iOS/Android physical verification, accessibility, production deployment/rollback và policy/legal review vẫn **CHƯA ĐẠT/CHƯA XÁC NHẬN**.

## Addendum — audit trực tiếp danh mục và hướng dẫn, 30/09/2026

### Phạm vi

Luồng đã chụp và xem ở Chrome/Playwright, local preview: Khám phá → danh mục khóa học miễn phí → bài “Cách chọn bài học video”. Viewport mobile 390×844 và desktop 1440×1000. Đây là audit UX kết hợp rủi ro accessibility dựa trên screenshot/DOM; không phải chứng nhận WCAG.

### Các bước và nhận xét

1. **Danh mục khóa học miễn phí.** [Mobile — đầu danh mục](2026-09-30-current/run-04/mobile-01-catalog.png), [mobile — cuộn tới cuối](2026-09-30-current/run-04/mobile-01b-catalog-bottom.png), [desktop](2026-09-30-current/run-04/desktop-01-catalog.png). Ba nhóm có tổng 38 bài, card một cột trên mobile và hai cột trên desktop; thông tin “xem trong ứng dụng”/xử lý dữ liệu YouTube hiển thị gần nơi cần. Mobile có thêm 133px nội dung cuộn; ở trạng thái đầu, ghi chú cuối và link hướng dẫn chỉ lộ một phần sát bottom navigation nên cue cuộn chưa mạnh. Đã thử cuộn tới cuối: ghi chú và link đều đọc được, link kết thúc ở y=734 trong khi bottom navigation bắt đầu y=776; **không bị che**, nhưng nên giữ một cue cuộn rõ ràng hoặc làm phần tiếp nối dễ nhận biết hơn.
2. **Bài hướng dẫn chọn nội dung.** [Mobile](2026-09-30-current/run-04/mobile-02-guide.png), [desktop](2026-09-30-current/run-04/desktop-02-guide.png). Nội dung nói đúng giới hạn hiện hành, không tự chọn nội dung từ check-in, nhắc dừng nếu bài tập không phù hợp và phân biệt reflection với tư vấn y tế. Desktop giữ cột đọc trung tâm, không tràn ngang; mobile một cột, tiêu đề và body phân cấp rõ. Khoảng trắng dưới bài khá lớn do nội dung ngắn; phù hợp nhịp đọc yên tĩnh nhưng có thể rút ngắn bằng nội dung đã kiểm duyệt, không nên lấp bằng thông tin giả.

### Tổng kết UX và accessibility

- **Điểm mạnh:** cùng hệ ivory/forest/terracotta và kiểu chữ với phần còn lại; desktop không bung nội dung ra hết khung; tổng số bài được diễn đạt rõ; copy mới không giả mạo người biên tập/ngày duyệt hoặc khả năng AI hiện chưa bật.
- **Rủi ro ưu tiên:** chưa đủ nội dung biên tập để phân biệt cụ thể các clip đánh số như “bài 17/32”; tiêu đề nên dựa trên review từng video, không suy đoán tên tư thế. Trên mobile, cue scroll tới ghi chú/link ở cuối danh mục khá yếu. Chữ phụ trong card/note nhỏ hơn body nên cần đối chiếu contrast và zoom thực.
- **Accessibility cần xác minh tiếp:** screenshot không chứng minh thứ tự đọc screen reader, tên truy cập của icon-only back/nav, focus-visible/keyboard traversal, WCAG contrast, text scaling 200%, reduced motion hoặc thao tác VoiceOver/TalkBack. Chưa chạy axe/WCAG scanner hoặc thiết bị hỗ trợ thực tế; không kết luận đạt chuẩn WCAG.
- **Giới hạn bằng chứng:** không kiểm playback của từng YouTube, policy/cookie behavior, 38 title/caption/rights, hoặc trải nghiệm trên Safari/WebView trong lượt audit này. `scrollWidth` của document là 390px trên mobile và 1440px trên desktop; không có lỗi `pageerror` trong các capture desktop. Sites test thành công trước đó không đồng nghĩa hosted deployment.

Hình chụp trong mục này là evidence của lượt audit hiện tại; screenshot run-03 ở trên giữ làm lịch sử kiểm tra cũ.

## Addendum — cue cuộn danh mục mobile, 30/09/2026

- Danh mục giờ đo overflow/scroll position trên `.mobile-scroll`; chỉ khi còn nội dung bên dưới ở viewport app hẹp mới hiện cue “Cuộn xuống để xem ghi chú và cách chọn bài”. Cue biến mất ở cuối danh mục và không xuất hiện trên desktop. Không sửa `src/mobile/` hay protected runtime.
- Ảnh sau patch: [mobile — đầu danh mục](2026-09-30-current/run-05/mobile-catalog.png), [mobile — cuối danh mục](2026-09-30-current/run-05/mobile-catalog-bottom.png), [desktop](2026-09-30-current/run-05/desktop-catalog.png). Cả ba được chụp và mở xem. Trên 390×844, phần cuối hướng dẫn nằm ở y=748, thanh điều hướng bắt đầu y=776; nội dung cuộn được và không bị che. Desktop 1440px không tràn ngang và không có cue.
- Regression `course guidance has honest scope and does not invent editorial or review metadata` kiểm cue hiện ở đầu, ẩn tại đáy, link hướng dẫn reachable, trở lại đầu và đổi desktop để xác nhận cue ẩn. Suite cuối sau sửa đạt **34/34 PASS** trên Chrome. Screenshot của Playwright nay ghi vào output riêng từng lượt test thay vì đè các ảnh audit lưu trong `analyse/`.
- Đây là cải thiện discoverability, không phải accessibility sign-off. Cỡ chữ/contrast, keyboard-only, screen reader, 200% zoom và VoiceOver/TalkBack vẫn chưa kiểm định đầy đủ.

## Cập nhật kiểm chứng build cuối — 30/09/2026

- Hai lần thử build chuẩn trước đó bị EPERM tại Vite temp/dist trong sandbox; sau khi quyền ghi workspace được cấp, `npm run build` chuẩn hoàn tất PASS và tạo đủ Sites artifacts. Build cuối có learner entry 833.10 kB min / 245.52 kB gzip, tiếp tục phát cảnh báo chunk >500 kB.
- Trên production preview cục bộ `http://127.0.0.1:4175/?mode=web`, smoke check tải entry mới `assets/index-BH94K4lH.js`; viewport 390px và 1440px lần lượt có document width 390px/1440px, cue cuộn chỉ hiện ở mobile, không phát sinh page error trong lượt này. `npm run test:sites` PASS 4/4; `npm run check:bundle-secrets` PASS 8 text artifacts; runtime suite 34/34 PASS. Đây không phải hosted deployment hoặc kiểm thử thiết bị thật.
- Vercel `list_deployments` được gọi lại ở chế độ chỉ đọc và vẫn trả 403: phiên thiếu scope `magicpens-projects`. Không tạo deployment; Preview hosted chưa được cập nhật và Production chưa phát hành.

## Addendum — rà soát welcome trên desktop lớn và đo bundle, 30/09/2026

- Chụp mới build local hiện hành ở Chrome 1440×1000: [welcome desktop 1440×1000](2026-09-30-current/run-06/01-welcome-desktop-1440x1000.png). Ảnh đã được mở kiểm tra; canvas giữ tối đa khoảng 1320px, căn giữa với lề đều, thứ bậc thương hiệu/ảnh/CTA rõ và không kéo nút chính hết chiều rộng màn hình. `document` và `body` đều rộng đúng 1440px, cao 1000px; không có `pageerror` trong lượt chụp.
- Đây là đánh giá thẩm mỹ tốt cho màn welcome desktop ở kích thước đã thử, không phải sign-off toàn bộ accessibility. Ảnh 877×877 của tab hiện tại cho thấy cùng bố cục ở bề mặt hẹp hơn; hành vi trình duyệt thực trên máy người dùng vẫn cần đối chiếu riêng.
- Benchmark Chrome cục bộ trên `4175`: learner entry 833,102 byte giải nén / 243,427 byte encoded, thời gian resource ~53ms; FCP ~568ms. Đây là máy cục bộ, không đại diện mạng di động hoặc thiết bị yếu.
- Đã thử lazy-load riêng màn Hành trình: entry giảm 833.10 → 822.52 kB raw và 245.52 → 243.04 kB gzip, nhưng thêm chunk 11.92 / 3.60 kB gzip tải khi mở Hành trình; tổng gzip tới route này tăng nhẹ và thêm một request. Vì lợi ích cold-start nhỏ, không đáng đổi lấy độ trễ route, thử nghiệm đã được gỡ và build cuối khôi phục bundle nguồn ban đầu. Vite cảnh báo chunk >500 kB còn nguyên; chưa có bằng chứng profiler trên thiết bị thật để biện minh cho tách sâu hơn.

## Addendum — chụp lại UI desktop/mobile sau chuyển cảnh, 01/10/2026

- Chụp lại các màn ở Chrome/Playwright trên bản local hiện tại `http://127.0.0.1:4175/?mode=web`. Trước mỗi ảnh, chờ màn hiện hành về đúng vị trí của `.flow-scenes` và transform kết thúc, rồi mới chụp; đây là kiểm soát thời điểm capture, không phải thay đổi FlowStack hay runtime. Tất cả ảnh 02–10 đã được mở xem.
- Desktop 1440×1000: [check-in](2026-09-30-current/run-06/02-checkin-desktop-1440x1000.png), [check-in khi AI tắt](2026-09-30-current/run-06/03-checkin-ai-off-desktop-1440x1000.png), [danh mục](2026-09-30-current/run-06/04-free-course-catalog-desktop-1440x1000.png), [chi tiết khóa](2026-09-30-current/run-06/05-course-detail-desktop-1440x1000.png), [player đang phát](2026-09-30-current/run-06/06-in-app-player-desktop-1440x1000.png), [hỗ trợ player](2026-09-30-current/run-06/07-player-recovery-desktop-1440x1000.png). Các màn sau điều hướng có `activeLeft=sceneLeft=60`, transform `none`, document width 1440px; không còn dải màn trước. Ảnh mobile: [check-in](2026-09-30-current/run-06/08-checkin-mobile-390x844.png), [danh mục](2026-09-30-current/run-06/09-free-course-catalog-mobile-390x844.png), [chi tiết khóa](2026-09-30-current/run-06/10-course-detail-mobile-390x844.png); viewport/document width 390px, active screen căn tại x=0. Không có `pageerror` trong lượt capture.
- **Đánh giá thẩm mỹ trực tiếp:** hệ màu ivory/forest/terracotta, serif tiêu đề, nhịp khoảng cách và cách dùng nhãn nhất quán giữa các màn. Canvas desktop được giới hạn/căn giữa; danh mục chuyển từ lưới hai cột sang card một cột trên mobile; chi tiết video đổi từ media cạnh nội dung sang xếp dọc, chữ và nút học vẫn rõ. Đây là chất lượng thị giác tốt cho MVP và phù hợp concept; không thấy lỗi tràn hoặc lệch bố cục ở các kích thước đã thử. Không kết luận toàn bộ sản phẩm đạt chuẩn production chỉ từ hình ảnh.
- **Player:** ở capture desktop này, video YouTube thật `yKm7aOAWn-k` hiện nội dung hình, timeline 0:03/0:43 và trạng thái pause trong iframe ngay trong ứng dụng. Disclosure trợ giúp mở đúng hướng retry trong app và fallback YouTube theo lựa chọn. Đây là xác nhận playback của một clip/một lần chạy trên Chrome workstation; chưa xác nhận 38 clip, âm thanh/captions, hosted Preview hay mobile WebView.
- **Đã tối ưu check-in mobile:** hình toàn thân ban đầu bị footer cố định che phần bàn chân ở 390×844. Đã giảm bề rộng minh họa xuống 230px (tỷ lệ 2:3): ảnh mới cho thấy toàn hình và chú thích nằm trên footer, chừa khoảng 29px; hotspot vẫn 48px. Ở breakpoint ≤360px, giới hạn hình về 210px để quy tắc màn thấp không bị override ngược lên 270px. Test riêng xác nhận map/footer/touch target; full Playwright 34/34 PASS.
- Ảnh mới cũng giải quyết sự không chắc chắn do capture quá sớm: dải mảnh ở mép trái trong ảnh cũ là trạng thái chuyển cảnh, không tái hiện khi đợi FlowStack ổn định. Không sửa protected runtime. Giữ nguyên các gate chưa đạt: kiểm accessibility thực (keyboard/screen reader/contrast/zoom), Safari/iOS và Android thật, quyền/caption/safety của nội dung, roster/profile giáo viên, actor/API tests, Preview/Production, CI/protected checks và chính sách pháp lý.

## Addendum — FlowStack keyboard accessibility, 01/10/2026

- Audit mới trên luồng Khám phá → khóa học → Quay lại tìm thấy focus/tab traversal vẫn chạm vào catalog cũ ở bên dưới màn chi tiết. `FlowStack` giữ route trước để animate; runtime không tự áp `inert`/`aria-hidden`. Đã xử lý trong boundary app-owned, không sửa protected runtime; focus được chuyển về heading sau route change và focus-visible dùng token terracotta 3px.
- Regression Edge: route trước có `aria-hidden=true` và `inert`; role query không tìm thấy nút ẩn; push/pop đưa focus về heading của route mới; Tab giữ focus trong route hiện hành; focus computed `3px solid rgb(142, 75, 53)`; ảnh được chụp sau transition settle và mở xem: [chi tiết khóa + keyboard focus](../ux-audit-2026-10-01/run-01/01-course-detail-keyboard-focus.png). Biên bản mới: [MCY_ACCESSIBILITY_AUDIT_2026-10-01.md](../ux-audit-2026-10-01/MCY_ACCESSIBILITY_AUDIT_2026-10-01.md).
- Đây là cải thiện bàn phím/DOM của một luồng Edge local, không phải screen-reader audit hay WCAG sign-off. VoiceOver/TalkBack/NVDA, contrast scan toàn app, zoom 200%, Safari/WebView vẫn CHƯA CHẠY. Full runtime suite sau patch PASS 35/35, Edge local, tuần tự, exit 0; xem report keyboard audit riêng để biết phạm vi.
