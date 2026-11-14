<!-- plan-template v1 -->
# Kế hoạch — Roadmap "từ phát hành đến người dùng quay lại" (thay lịch G0–G8)

Trạng thái: đã duyệt hướng (2026-11-14, Owner bấm "Duyệt khuyến nghị" cho cả tám quyết định Q1–Q8 của báo cáo roadmap). Đây là **kế hoạch hướng đi**, không phải lệnh làm: mỗi giai đoạn B–E vẫn cần kế hoạch riêng, được duyệt trước khi sửa code.

## 1. Mục tiêu
Phân tích chiến lược ngày 14/11 cho thấy kế hoạch hiện hành đúng ở nền (an toàn, nội dung có duyệt, không AI sớm) nhưng thiếu đoạn từ "đã phát hành" đến "có người dùng quay lại": check-in chưa trả gợi ý, cảm nhận sau tập không bền, chưa có nhắc tập, chưa đo lường. Kế hoạch này ghi lại tám quyết định đã duyệt và thay lịch G0–G8 của bộ kế hoạch kinh doanh v0.2 (đã quá hạn từ G1) bằng roadmap năm giai đoạn A–E. Nguồn: báo cáo roadmap và báo cáo đánh giá chiến lược gửi Owner 14/11/2026.

Tám quyết định đã duyệt (theo khuyến nghị):
- **Q1** Gợi ý bài theo quy tắc, không AI, trong 1.x (vùng cơ thể + nhãn `areas`, chuỗi 3–5 clip tự chuyển bài).
- **Q2** Sửa lời hứa ở màn chào cho đúng thứ app giao.
- **Q3** Nhắc tập cục bộ, Android trước.
- **Q4** Đo lường tối thiểu có đồng ý riêng.
- **Q5** Mở Closed testing ngay sau 1.0.7: 12 tester, 14 ngày liên tục.
- **Q6** Giữ chống streak; thêm "nhịp tuần" chỉ đếm lên, không nợ.
- **Q7** Hoãn phòng hiện diện đến cổng ở giai đoạn D; hoãn avatar vô thời hạn.
- **Q8** Thay lịch G0–G8 bằng roadmap này.

## 2. Tiêu chí xong
- `PLAN.md` ghi roadmap A–E, trạng thái từng giai đoạn và các mục chờ Owner; không còn trỏ tới lịch G0–G8 như lịch đang chạy.
- Mỗi giai đoạn B, C, D, E khi bắt đầu có kế hoạch riêng trong `plans/active/` (qua `plans/_TEMPLATE.md`) và được duyệt trước khi sửa code.
- `npm run check:plan` xanh sau thay đổi này.

## 3. Phạm vi sửa
- Kế hoạch này (`plans/active/2026-11-14-roadmap-retention-loop.md`) và `PLAN.md`. Không sửa `src/`, `supabase/`, `AGENTS.md`, runtime bảo vệ, `docs/product/PRODUCT_DECISIONS.md`.
- Mức rủi ro cao nhất của **thay đổi này**: R0 theo [review matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md), vì chỉ là tài liệu kế hoạch, không đổi hành vi. Các hạng mục tương lai mang mức cao hơn (bảng dưới).
- Hiện trạng: nhánh `claude/yoga-app-strategy-analysis-8ae991` vừa fast-forward lên `main` tại `3b875d3`; checkout chính chỉ có tệp chưa theo dõi `supabase/.temp/`; có phiên mca khác đang chạy trên worktree riêng (không đụng).

Mức rủi ro dự kiến cho các giai đoạn (để lập kế hoạch riêng sau):

| Hạng mục | Mức | Lý do |
|---|---|---|
| Gợi ý theo quy tắc (Q1) | R3 | hướng dẫn liên quan sức khoẻ; cần Owner duyệt chữ và nhóm clip |
| Sửa lời màn chào (Q2) | R1 | chữ người học thấy; văn bản đã chốt nên cần Owner đồng ý chữ cụ thể |
| Lưu cảm nhận sau tập | R2 | trạng thái bền, đồng ý và RPC |
| Đo lường (Q4) | R3 | đồng ý, quyền riêng tư, Data safety |
| Nhắc tập cục bộ (Q3) | R3 | thêm plugin Capacitor, quyền thông báo, Data safety |
| Nhịp tuần (Q6), link sâu, thẻ chia sẻ | R1–R2 | giao diện; thẻ chia sẻ là dữ liệu sức khoẻ tự báo cáo |
| Closed testing (Q5) | R3 | phát hành Play |
| Phòng hiện diện (Q7, giai đoạn E) | R3 | thời gian thực, đồng ý, an toàn nội dung |

## 4. Cố ý không đụng
- Các cổng an toàn hiện có: không AI trước ≥5 buổi được duyệt chuyên môn, không tuyên bố trị liệu, đồng ý tách riêng từng mục đích, giảng viên chỉ vào bằng lời mời, cổng iOS 15 (INC-001, INC-005). Roadmap không nới cổng nào.
- Đường nội dung rồi AI (giai đoạn 0–6 của kế hoạch 08/11): thứ tự giữ nguyên; chỉ thêm một việc — luật chọn theo vùng ở giai đoạn B dùng chung cấu hình quy tắc của workspace để AI sau này chỉ thay bước chọn.
- `docs/product/PRODUCT_DECISIONS.md` và `AGENTS.md`: chưa sửa. Khi một quyết định thành hành vi thật (nhắc tập, đo lường, nhịp tuần), kế hoạch của giai đoạn đó cập nhật các tài liệu này trong cùng thay đổi.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| `PLAN.md` | thêm dòng roadmap, ghi quyết định | Owner và mọi agent đọc đầu phiên | `npm run check:plan` (≤200 dòng, ngày cập nhật) |
| `plans/active/` | thêm một kế hoạch hướng đi | `check:plan` quét mọi tệp làm từ mẫu | chạy `npm run check:plan` |
| Mã ứng dụng, Supabase, CI, Play, Vercel | không đổi | người dùng hiện tại | diff chỉ có hai tệp tài liệu |
| Tài liệu cũ (kế hoạch 05 G0–G8, tài liệu 23/10, `RELEASE_LEDGER`, `ANDROID_PLAY_RELEASE.md`) | chưa sửa, chỉ ghi ở mục 11 là lỗi thời hoặc mâu thuẫn | agent đọc nhầm tài liệu cũ | liệt kê ở mục 11 |

Xét: giao diện/ngôn ngữ — không đổi; dữ liệu/đồng ý/AI/runtime bảo vệ — không đổi; iOS 15 — không đổi (không có mã).

## 6. Bảo mật
- Không có bí mật, không đọc dữ liệu người dùng, không thao tác ra ngoài, không thêm thư viện. Số liệu thị trường trích từ báo cáo chiến lược; riêng ngưỡng và mốc ngày là ước tính của agent, không phải số đo.

## 7. Hoàn tác
- `git revert` commit của kế hoạch này; `PLAN.md` quay về bản trước. Không có tác động ngoài repo.

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Ghi kế hoạch hướng đi và cập nhật `PLAN.md`, chạy `check:plan` | Claude | S |
| A | Đóng 1.0: phát hành 1.0.7 khi Owner yêu cầu, chụp `?debug=viewport` trên iPhone iOS 15.8.8 thật, Owner xử lý reset upload key, Data safety, văn bản pháp lý; tách tệp điểm nóng qua mca song song, không chặn B. Ước tính 1–2 tuần từ 17/11 | Claude + Owner + mca | S |
| B | Vá vòng lặp: gợi ý theo quy tắc, lưu cảm nhận sau tập, bỏ chữ nội bộ và nút chết, đo lường có đồng ý, sửa lời màn chào. Ước tính 3–5 tuần sau A | Claude, kế hoạch riêng | M |
| C | Closed testing 12 tester 14 ngày, nhắc tập cục bộ Android, nhịp tuần, link sâu từng bài, thẻ chia sẻ. Chạy chồng với B | Claude + Owner, kế hoạch riêng | M |
| D | Tăng trưởng hữu cơ (thử thách 7 ngày TikTok, nhóm Zalo, trang đích, ASO) và Production, hướng tới tháng 1/2027 | Owner chủ yếu | M |
| E | Bộ đếm hiện diện và phòng theo giờ; chỉ mở khi có đủ người dùng cùng khung giờ (đề xuất ngưỡng ~20, Owner đặt lại); không sớm hơn quý 1/2027 | Claude, kế hoạch riêng | M–L |

Mốc ngày và cỡ việc là ước tính của agent cho một người làm cùng agent, chưa đối chiếu giờ làm thực tế. Nếu giờ không đủ, cắt thẻ chia sẻ và nhịp tuần trước; giữ gợi ý, lưu cảm nhận, đo lường và Closed testing.

## 9. Cách thử
1. Mở `PLAN.md`: thấy dòng roadmap và các quyết định đã duyệt.
2. Mở kế hoạch này: đọc tám quyết định và bảng mức rủi ro.
3. Chạy `npm run check:plan`: thấy "Kiểm kế hoạch: đạt."

## 10. Lệnh kiểm
- `npm run check:plan` và `npm run check:quick`. Không chạy `check:ios15` hay Playwright vì không có thay đổi mã; ghi rõ đó là CHƯA CHẠY có chủ đích, không phải đã đạt.

## 11. Rủi ro còn lại
- Tài liệu không ghi số tester và người dùng hiện có; mọi ngưỡng ở giai đoạn C–E thiếu mốc gốc. Owner cần xác nhận hiện trạng Closed testing (Q5) trước khi lập kế hoạch giai đoạn C.
- Người duyệt chuyên môn cho clip và buổi AI chưa có tên; đường AI và phần gợi ý (Q1) nghẽn ở đây. Duyệt Q1 là duyệt hướng; chữ gợi ý và nhóm clip đủ điều kiện (clip đã duyệt, hoặc nhãn "gợi ý theo vùng, chưa phải chỉ định") vẫn do Owner chốt khi lập kế hoạch giai đoạn B.
- 38 clip chưa có hồ sơ quyền, caption và duyệt chuyên môn (danh mục đã duyệt hôm nay: 0).
- Một người làm; B và C chạy chồng nhau là lát cắt dày nhất.
- Bằng chứng thị trường mỏng: ca TikTok indie là tự báo cáo, không có dữ liệu chi phí quảng cáo hay mức sẵn sàng trả tiền ở Việt Nam. Giữ chân sau 30 ngày của app sức khoẻ thường chỉ 3–8%.
- iOS chưa từng build, iPhone thật chưa chạy: lượt từ TikTok mở trên iPhone chỉ vào được bản web.
- Tài liệu lỗi thời hoặc mâu thuẫn, chưa sửa trong thay đổi này: kế hoạch 05 (G0–G8, ở tag `archive/analyse-2026-11-13`); tài liệu 23/10 còn nói "không có chức năng xóa tài khoản" và "không có keystore"; `RELEASE_LEDGER` thiếu dòng cho 1.0.7; `ANDROID_PLAY_RELEASE.md` còn ghi chưa quyết domain web Production. Chưa kiểm lại từng tài liệu này trong phiên hiện tại; thông tin lấy từ lượt đọc trước.

## 12. Cần duyệt
- Không có thao tác ra ngoài (push, deploy, Play, migration) trong kế hoạch này; chỉ commit cục bộ khi Owner bảo.
- Cần Owner xác nhận khi lập kế hoạch từng giai đoạn: hiện trạng Closed testing và số tester (C); chữ màn chào mới (B); chữ và nhóm clip cho gợi ý (B); chữ đồng ý đo lường (B).

## Progress
- [x] 1 Ghi kế hoạch hướng đi, cập nhật `PLAN.md`
- [ ] A Đóng 1.0 (chờ Owner yêu cầu phát hành 1.0.7)
- [ ] B Vá vòng lặp (chờ kế hoạch riêng)
- [ ] C Closed testing và vòng quay lại
- [ ] D Tăng trưởng hữu cơ và Production
- [ ] E Hiện diện cùng nhau (có điều kiện)
