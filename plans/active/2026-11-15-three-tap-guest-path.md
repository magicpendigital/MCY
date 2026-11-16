<!-- plan-template v1 -->
# Kế hoạch — Lát 0: khách xem được bài trong ≤3 chạm (check-in thành tùy chọn)

Trạng thái: đã gộp vào `main` (`a89ed98`, PR #1, 16/11); còn chờ Owner đọc nguyên văn chữ mới (mục 12) rồi mới chuyển sang `plans/done/` (duyệt 2026-11-15, Owner trả lời "Đồng ý cho làm lát 0" và "Đồng ý đổi check-in là tùy chọn, sau khi đã xem bài"). Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận (intake) theo [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md). Kiểm bằng `npm run check:plan plans/active/2026-11-15-three-tap-guest-path.md`. Khi xong, cập nhật `PLAN.md`.

## 1. Mục tiêu
Nhóm tester báo: (1) muốn vào bài học trong ≤3 chạm; (2) ngại điền form khảo sát vì chưa thấy giá trị, chỉ muốn xem ngay bài hợp với mình. Từ code (15/11): đường ngắn nhất của khách là 4 chạm (Chào → Check-in → Khám phá → Phát), và check-in không đổi bài nào hiện ra. Lát 0 là bản vá nhỏ nhất đạt ≤3 chạm bằng thứ đã có: nút "Trải nghiệm thử" vào màn Hôm nay thay vì check-in; trên Hôm nay, khối "Bắt đầu nhẹ nhàng" (3 bài ngắn nhất) lên trước, check-in thành lối phụ. Đường: Chào (1) → bài ở Hôm nay (2) → Phát (3). Các lát sau (chip theo vùng, chuỗi clip tự chuyển, phản hồi 1 chạm, tài khoản sau buổi 2–3) có kế hoạch riêng.

## 2. Tiêu chí xong
- Khách bấm "Trải nghiệm thử" thấy màn Hôm nay, có 3 bài ngắn ngay trên màn hình đầu; bấm một bài rồi bấm "Học ngay trong ứng dụng" là video chạy (3 chạm tính từ màn Chào).
- Check-in vẫn vào được từ Hôm nay ("Bắt đầu check-in" / "Ghi nhận hôm nay"), mọi hành vi trong check-in giữ nguyên.
- Người đã đăng nhập: luồng Auth → Quyền dữ liệu → Onboarding → Hôm nay không đổi.
- `npm run check:quick`, `npm run check:ios15` xanh; các spec Playwright bị ảnh hưởng xanh (đã sửa đường vào, không nới assertion).

## 3. Phạm vi sửa
- `src/Prototype.tsx`: `WelcomeFooter` (đích của nút khách), `HomeScreen` (thứ tự khối, chữ). Vùng Learner app (tệp nóng, một người viết: không có worktree/nhánh khác đang dở; lát tách 5 và 9 trong [bản đồ](../backlog/split-hot-files-map.md) chưa làm, phải rebase lên đây).
- `src/prototype.css`: chỉ nếu cần khoảng cách của khối đã đổi chỗ (không dùng thuộc tính mới).
- `tests/*.spec.ts`: thêm bước "Bắt đầu check-in" sau "Trải nghiệm thử" ở các spec đang đi vào check-in từ màn Chào; thêm một spec mới cho đường 3 chạm.
- Mức rủi ro cao nhất: **R1** theo [review matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md): đổi điều hướng và chữ trong luồng người học, không đổi hợp đồng dữ liệu, đồng ý, quyền hay AI.
- Hiện trạng: `main` = nhánh làm việc = `4b8e3c6`, cây sạch, không có tệp dở của người khác.

## 4. Cố ý không đụng
- Check-in, bản đồ cơ thể, Hành trình, Phản hồi sau tập, Consent, Onboarding: giữ nguyên (chỉ đổi cách tới check-in từ khách).
- Tự phát video khi mở từ hàng gợi ý: **chưa làm trong lát 0**. Trình phát cần thao tác chạm của người dùng; trên iOS 15 và WebView Android chưa có bằng chứng, nên để lát 1 sau khi kiểm thiết bị. Nút "Học ngay trong ứng dụng" giữ nguyên.
- Không đổi `src/App.tsx`, `src/styles.css`, `src/mobile/` (runtime bảo vệ), `FlowStack`, `i18n.ts` (nhãn "Trải nghiệm thử" giữ nguyên chữ), Supabase, AI, nội dung.
- Không tính gợi ý theo vùng: hàng gợi ý vẫn xếp theo độ dài, không phải theo cơ thể người dùng; chữ trên màn nói rõ điều đó.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| `WelcomeFooter` "Trải nghiệm thử" | `flow.replace(ROUTES.home)` thay vì `push(checkin)` | Khách mới; nút Tạo tài khoản/Đăng nhập cạnh nó không đổi; `AuthSessionRouter` chỉ chạy khi đã đăng nhập | Đọc `Prototype.tsx` 555–605; spec session-restore chỉ kiểm nút còn/mất |
| `HomeScreen` thứ tự và chữ | Khối gợi ý lên trước; nút check-in thành phụ; chữ dẫn và "Bạn sẽ đi qua" mô tả đúng thứ tự mới | Người đã đăng nhập cũng thấy Hôm nay mới; nhãn "Bắt đầu check-in"/"Ghi nhận hôm nay" giữ nguyên chữ vì practice-flow, learner-write-review, learner-device-acceptance bấm theo tên | grep tests: chỉ các nhãn này và tiêu đề "Một chút thời gian cho chính mình." được tham chiếu |
| Back từ Hôm nay | Hôm nay không có nút Quay lại (đã vậy); Chào không còn trong ngăn xếp sau khi vào (replace) | Spec flow-accessibility kiểm "Quay lại" từ check-in về Chào: phải cập nhật theo đường mới | Đọc spec; sửa theo ý định (focus/inert sau pop), không bỏ assert |
| `HomeQuickPicks` | Không đổi. Đã thử thêm lối dự phòng khi tải lỗi rồi bỏ: test chặn module cũng chặn Khám phá nên không kiểm chứng trung thực được; lỗi tải vẫn như cũ (khối ẩn, check-in và thanh dưới vẫn dùng được) | 3 bài, sắp theo độ dài (spec discover-finder) | spec discover-finder dòng 38–52 |
| Spec đi vào check-in từ màn Chào | Thêm một bước bấm "Bắt đầu check-in" | checkin-overall-status, ios-input-zoom, flow-accessibility, lesson-thumbnails, discover-finder, reading-library, video-progress, content-catalog, learner-ux | Mỗi vị trí đã đọc; không đổi assert nội dung |

Xét: điều hướng (đổi, có test), chữ (đổi, mục 12), ngôn ngữ (tiếng Anh vẫn "Try it out" → Hôm nay, chữ Hôm nay là tiếng Việt cố định như hiện tại), trợ năng (focus sau replace: kiểm bằng flow-accessibility), dữ liệu/API/đồng ý/AI/runtime bảo vệ (không đổi), iOS 15 (không API mới, không CSS mới; `check:ios15`), build/cấu hình (không đổi).

## 6. Bảo mật
- Không bí mật, không dữ liệu mới, không thư viện mới, không thao tác ra ngoài. Khách không còn phải điền gì trước khi xem bài; không ghi gì lên server khi xem bài (như trước).

## 7. Hoàn tác
- `git revert` commit của lát này (đổi đích nút + thứ tự Hôm nay + spec); không có dữ liệu hay cấu hình đi kèm.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Sửa `WelcomeFooter`, `HomeScreen` | Claude | S |
| 2 | Sửa các spec đi vào check-in; thêm spec đường 3 chạm | Claude | S |
| 3 | Chạy `check:quick`, `check:ios15`, các spec bị ảnh hưởng; ghi `PLAN.md`; commit trên nhánh làm việc | Claude | S |

## 9. Cách thử
1. Mở app bằng khung web (không đăng nhập), bấm "Trải nghiệm thử": thấy màn Hôm nay với 3 bài ngắn ngay đầu trang.
2. Bấm một bài, bấm "Học ngay trong ứng dụng": video chạy. Đếm: 3 chạm từ màn Chào.
3. Quay lại Hôm nay, bấm "Bắt đầu check-in": vào check-in như cũ.
4. Đăng nhập một tài khoản thử: luồng cũ, kết thúc ở Hôm nay.

## 10. Lệnh kiểm
- `npm run check:quick`, `npm run check:runtime`, `npm run check:ios15`.
- Playwright (chromium cài sẵn, `--trace off`): các spec nêu ở mục 5 và spec mới. CHƯA CHẠY nếu môi trường không cho chạy; ghi rõ trong báo cáo.
- Không chạy được: iPhone iOS 15 thật, TalkBack, Android thật (CHƯA CHẠY, giữ nguyên các mục mở ở AGENTS.md).

## 11. Rủi ro còn lại
- Người dùng quen đường cũ thấy check-in "lùi một bước"; đo bằng phản hồi tester, chưa có đo lường tự động (giai đoạn B).
- Hàng gợi ý xếp theo độ dài, không theo nhu cầu: đạt "3 chạm" nhưng chưa "bài hợp với tôi". Phần đó thuộc lát 1 (chip theo vùng).
- Tự phát khi mở bài chưa làm; lát 1 cần kiểm trên iOS 15 và Android thật.
- Chữ mới trên Hôm nay là bản agent soạn theo hướng Owner đã đồng ý, chưa được Owner đọc nguyên văn (xem mục 12).

## 12. Cần duyệt
- Chữ trên Hôm nay (Owner xác nhận nguyên văn khi đọc báo cáo; revert chữ là một commit nhỏ).
- Không có thao tác ra ngoài (push, deploy, Play, migration). Commit chỉ trên nhánh làm việc; đẩy lên `origin` và đưa vào bản phát hành cần yêu cầu riêng của Owner.

## Progress
- [x] 1 Sửa `WelcomeFooter`, `HomeScreen`
- [x] 2 Sửa spec và thêm spec đường 3 chạm
- [x] 3 Kiểm, cập nhật `PLAN.md`, commit (xem bằng chứng bên dưới)

## Bằng chứng (15/11, máy cloud Linux, chromium 1243 cài sẵn trỏ qua `PLAYWRIGHT_BROWSERS_PATH`; bản Playwright của repo cần 1228)
- `npm run check:quick` PASS 7/7; `npm run check:ios15` PASS (chỉ kiểm tĩnh); `npm run test:unit` PASS.
- `npx playwright test --trace off` PASS **225/225** (3,7 phút). Lần chạy đầu: 21 lỗi, nguyên nhân là spec còn đi đường cũ Chào → Check-in (hàm `openGuestCheckin`) và 4 selector bắt cả màn Hôm nay đang đỗ phía dưới; đã sửa đường vào và bó selector theo màn hiện tại, không đổi nội dung assert. Lần chạy đầu giữ ở đây như một phần lịch sử, không tính là PASS.
- Spec mới `tests/guest-fast-path.spec.ts` (2 ca): khách từ Chào tới iframe video đúng 3 chạm và không qua check-in; ba bài nằm trong màn đầu 390x844, trên nút check-in; check-in vẫn vào và quay lại được.
- Không có đường chạy Playwright qua `MCY_PLAYWRIGHT_CHANNEL` trên máy này; đây là Chromium Linux, không phải Edge/Safari.

## Việc còn lại / CHƯA CHẠY
- iPhone iOS 15 thật, Android thật, TalkBack: CHƯA CHẠY.
- Tự phát khi mở bài: chưa làm (xem mục 4).
- Chữ mới trên Hôm nay chờ Owner đọc (mục 12).
