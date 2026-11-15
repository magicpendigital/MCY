# PLAN — bảng tiến độ sống của MCY (Một chút yoga)

> **Cập nhật lần cuối: 2026-11-16** — `main` là nhánh dữ liệu chính duy nhất (cả checkout chính `D:/Projects/MCY`), việc xong phải commit + merge vào `main` rồi xoá nhánh ([BRANCH_HYGIENE](docs/quality/BRANCH_HYGIENE.md)); đã dọn 9 nhánh đã merge; Owner duyệt roadmap A–E (14/11); tiếp theo: giai đoạn A (đóng 1.0) và tách tệp điểm nóng qua mca (lát 4 ở `main` 15/11; lát 5 xong trên nhánh `claude/lat-5-welcome`, chờ Owner duyệt gộp).
> Tệp đầu tiên Owner và mọi agent đọc. Trả lời: *đang ở đâu, còn gì, chờ ai*. Chi tiết việc lớn ở `plans/active/` (đang làm), `plans/done/` (đã chạy tốt), `plans/backlog/` (chưa làm). Quy tắc lâu dài ở `AGENTS.md`; lịch sử theo ngày ở `docs/status/`.

## Quy tắc cập nhật
1. Đầu phiên: đọc tệp này.
2. Mỗi lần giao code: sửa tệp này trong **cùng nhánh** — trạng thái, commit, ngày. Thay dòng cũ, không chép thêm lịch sử.
3. Chỉ ghi điều đã kiểm chứng; chưa thử thì ghi "CHƯA CHẠY".
4. Giữ ≤ 200 dòng; việc xong quá 2 tuần thì xoá (lịch sử có trong git). `npm run check:plan` báo khi quá 14 ngày hoặc quá dài.

Ký hiệu: ✅ xong · 🟡 làm một phần · ⬜ chưa làm · ⛔ chờ Owner · 🔍 chờ dùng thử

## 1. Mục tiêu
- Bản 1.0: khách dùng được, tài khoản tuỳ chọn có đồng bộ, không AI, tiếng Việt; web (Vercel Preview) + Android (Play Internal testing) từ cùng một commit.
- Nền tảng phát triển: nhiều agent làm song song an toàn, kiểm nhanh trong vài giây, không lỗi iOS 15 quay lại.

## 2. Việc lớn
| Việc | Nội dung | Trạng thái |
|---|---|---|
| Hợp nhất nhánh | `main` fast-forward tới `7a90a21` (toàn bộ lịch sử `codex-mcy-p1-preview`); tài liệu trỏ về `main` | ✅ 13/11: push `f03b856`, Vercel Preview READY, domain theo `main`, Production theo nhánh đỗ `production` (= `992ccd8`) |
| Quy trình mca | `AGENTS.md` gọn (27 → 20 KB) + bản đồ vùng + `.github/CODEOWNERS` + mẫu báo cáo, `CLAUDE.md`, `PLAN.md`, `plans/`, `check:plan` | ✅ cục bộ, [kế hoạch](plans/active/2026-11-13-repo-restructure.md) |
| Vòng kiểm nhanh | `npm run check:quick` (vài giây), `npm test` (~1 phút, không cần build), `npm run verify` (như CI); CI dùng chung danh sách `scripts/run-suite.mjs` | ✅ cục bộ |
| Gọn kho | `analyse/` 378 MB → ~79 MB (phần `content/` còn trỏ tới); toàn bộ giữ ở tag `archive/analyse-2026-11-13`; 23 script dùng một lần → `scripts/archive/` | 🟡 |
| Dọn nhánh (15/11) | Xoá 9 nhánh local đã merge + 2 worktree sạch; còn lại có lý do: `backup/pre-png-strip-20261028`, `backup/pre-slice-20261104` (chưa merge theo git nhưng nội dung đã ở `main`/tag, chờ Owner cho đổi thành tag `archive/…` rồi xoá); worktree cũ `C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY` (HEAD `82458fc` đã ở `main`, còn 34 tệp sửa + tệp mới chưa commit, chờ Owner quyết định giữ hay bỏ) | 🟡 chờ Owner |
| Tách tệp điểm nóng | `src/Prototype.tsx` (170 KB), `src/prototype.css` (97 KB), `src/i18n.ts` → mỗi màn/tính năng một tệp; giao mca từng lát | 🟡 bản đồ xong 14/11 ([18 lát TSX + 8 lát CSS](plans/backlog/split-hot-files-map.md)); lát 1 ở `main` 14/11 (163 KB, Playwright 223/223); lát 2 ở `main` 14/11 (152 KB); lát 3 ở `main` 14/11 (139 KB); lát 4 (route context, accessibility, `RouteSuspense`, `BottomNav`; 136 KB) ở `main` 15/11 ; lát 5 (màn chào → `src/screens/welcome/`; 132 KB) xong 16/11 trên nhánh `claude/lat-5-welcome` (npm test, check:ios15, Playwright 223/223 PASS), chờ Owner duyệt gộp. Từ lát 4 Claude tự làm (mca hỏng đăng nhập/mạng và xoá worktree chưa commit) |
| Bản 1.0.7 (batch 9) | INC-005 (zoom ô nhập trên iOS) đã ở web Preview, chưa lên Play/điện thoại | ⬜ chờ Owner yêu cầu phát hành |
| Roadmap A–E (thay G0–G8) | A đóng 1.0 → B vá vòng lặp + đo lường → C Closed testing 12 người/14 ngày, nhắc tập, nhịp tuần → D tăng trưởng hữu cơ + Production (~1/2027) → E hiện diện (có điều kiện, ≥ Q1/2027); avatar hoãn. Đã duyệt Q1–Q8; mốc ngày là ước tính. [Kế hoạch](plans/active/2026-11-14-roadmap-retention-loop.md) | 🟡 đã duyệt hướng; mỗi giai đoạn B–E cần kế hoạch riêng trước khi sửa code; A ⬜ chờ Owner yêu cầu 1.0.7 |

## Lỗi đã thấy, chưa sửa
- mca: job lỗi (auth/mạng) bị xoá worktree kèm thay đổi chưa commit (15/11, lát 4 run `20261114-1845-cd90`). Khi giao mca, coi worktree của job là tạm; nếu job hỏng thì lấy diff ra ngay hoặc làm lại.
- `tests/mobile-runtime.spec.ts` › "Carousel preserves momentum and edge rubber-banding" chập chờn trên Windows/Edge khi máy tải nặng (14/11: 1/5 lần lặp, `scrollLeft` dừng đúng 60 sau khi thả). Fixture chỉ nạp `src/mobile` (runtime bảo vệ) nên không do việc tách `Prototype.tsx`; sửa cần Owner cho phép đụng runtime hoặc nới thời gian chờ trong test (không được làm yếu test).

## 3. Đang chờ Owner (mỗi mục một quyết định)
- ⛔ Supabase Auth redirect allowlist: thêm `https://mcy-git-main-magicpens-projects.vercel.app/auth/callback` nếu cần đăng nhập trên alias nhánh (domain chính không đổi).
- iPhone iOS 15 thật: ảnh `?debug=viewport` sau bản sửa INC-005.
- Cho roadmap: xác nhận hiện trạng Closed testing (đã mở chưa, bao nhiêu tester) trước khi lập kế hoạch giai đoạn C; chữ màn chào mới, chữ và nhóm clip cho gợi ý, chữ đồng ý đo lường (giai đoạn B); tên người duyệt chuyên môn.
- Mở cổng: ba chân chó, duyệt chuyên môn ảnh AI, hồ sơ giáo viên đầu tiên, ≥5 bài AI đã duyệt, Play Data safety, reset upload key trước production, sửa runtime bảo vệ (`styles.css`, `FlowStack.tsx`).

## 4. Trạng thái hiện tại (chuyển từ AGENTS.md ngày 2026-11-13; sửa tại chỗ)
- **Shipped (batch 8, versionCode 8 / 1.0.6, commit aef1f47, 2026-11-11):** web Vercel Preview, Play Internal testing 1.0.6, APK on the test phone; adds author-chosen lesson `areas` on top of batch 7 (Owner content hub, iOS CSS fallbacks, snapshot reader with bundled fallback). Real iPhone iOS 15 still CHƯA CHẠY.
- **Staging (`mcy-staging`, org MagicpenDigital):** migrations applied through `20261110175347` (content publication: public `content-published` bucket, author notes, snapshot RPC incl. screen texts); `owner-control-plane` Edge v12 (lesson `areas` and screen-text allow-list). The public `manifest.json` is not written until the Owner changes visibility/display/review or runs the explicit snapshot action in their own session; until then the app uses its bundled catalogue. AI off. The teacher control plane, teacher collaboration and AI assistant functions are not deployed. `import_catalog` has not been run. All reading switches follow the Owner's settings.
- **Open Owner decisions / gates:** real iPhone iOS 15: the Owner reported (2026-11-11) the display bug fixed but the screen zooms when a note field is focused (iOS 15.8.8; INC-005 fixes ship in batch 9; needs a `?debug=viewport` screenshot); enabling three-legged-dog and expert review of AI images; first activated teacher profile; AI catalog needs ≥5 expert- and rights-reviewed sessions; Play Data safety recheck; upload-key reset before production; protected-runtime edits for `styles.css` and `FlowStack.tsx`.
- **CI:** `.github/workflows/quality.yml` runs on every push; a red CI means do not release. It is not a branch protection rule (the private repo has none).
- **Verification facts that are still true:** the full Playwright suite passed on CI at 9216a24 (one retry allowed), not yet as a clean local run; TalkBack, YouTube fullscreen on devices and a full iOS 15 pass are unverified.

## 5. Đã xong gần đây
- 14/11 · Gắn `tests/input-font-size.test.mjs` (chặn zoom ô nhập iOS, INC-005) vào `check:quick`, `npm test` và CI — trước đó không lệnh nào chạy nó.
- 14/11 · Checkout chính `D:/Projects/MCY` chuyển từ `codex-mcy-p1-preview` sang `main` (`aac1142`); 4 PNG test ghi để lại dạng tệp bỏ qua trong `analyse/ux-ai-2026-10-10/` (bản sao ở `D:/Projects/MCY-switch-backup-2026-11-14`); 84 tệp CRLF lấy lại thành LF; kiểm: `npm run check:quick` PASS 6/6 tại checkout chính.
- 13/11 · Vercel: Production Branch → `production`, 2 biến Supabase chuyển sang Preview nhánh `main` (đổi phạm vi, không chép giá trị), push `main` + tag `archive/analyse-2026-11-13`, deploy `dpl_k9pMoaXy4rvsHkt6ysPTWvRYLsBD` READY, domain → `main`; kiểm: `/`, `/privacy.html`, `/terms.html`, `/delete-account.html`, `/auth/callback` = 200, cùng bundle `index-Cet0OJh3.js` như bản trước. `mcy-six.vercel.app` (Production cũ, prototype tháng 9) vẫn 404 như trước — không đổi.
- 13/11 · Điều tra nhánh: `main` chỉ là 2 commit khởi tạo (21/09), mã thật ở `codex-mcy-p1-preview`; `main` là tổ tiên nên fast-forward không mất gì · kiểm: `git merge-base`, Vercel `list_project_domains`, `filter_project_envs`
- 12/11 · INC-005 ghi nhận iPhone iOS 15.8.8 (commit `7a90a21`)
