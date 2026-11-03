# Điều phối UX theo từng bước — 14/10/2026

Tài liệu này điều chỉnh cách thực hiện các bước UX tiếp theo trong [kế hoạch cũ](../ux-implementation-2026-10-14/PLAN.vi.md). Kế hoạch cũ mô tả một đợt triển khai nhiều phần trước khi review và kiểm tổng. Từ checkpoint này, mỗi bước được thực hiện riêng: worker chuẩn bị code và harness trong candidate mới; reviewer độc lập QC; root tự kiểm source và hình ảnh chỉ đọc; root báo kết quả; sau đó dừng chờ phản hồi mới nhất của Owner trước khi bắt đầu bước kế tiếp. **4.1 Home đã hoàn tất implementation/QC/root verification và đang chờ phản hồi Owner.** Các bước còn lại, gồm 4.2, ở trạng thái **WAITING_USER**.

## Baseline và giới hạn

- Đợt UX trước nằm trong `.vercel/ux-implementation-20261014`; đây là candidate cũ và không được tiếp tục sửa cho bước này. Candidate mới là `.vercel/ux-step4-1-20261014`.
- Worker sở hữu việc chuẩn bị candidate, code và harness của bước được giao. Root điều phối, làm kiểm tra source/visual chỉ đọc và báo cáo; root không sửa code.
- Giữ nguyên runtime và các file được bảo vệ theo root [AGENTS.md](../../AGENTS.md), cùng các ranh giới về staging, dữ liệu, AI, native, upload, deploy và Production. Thay đổi giao diện local không mở rộng các quyền đó.
- Checkpoint native late-save trong AGENTS là operation riêng. Chỉ dẫn UX tổng quát này không phê duyệt native write, cài đặt, grant, staging, upload, alias, deploy, AI/inference hay Production.
- Hồ sơ nội dung F06 đã được chuẩn bị trong candidate cũ nhưng chưa có human review/teacher approval; chưa cho phép đưa nội dung vào catalog. Pilot ở bước 6 chưa được chuẩn bị hoặc phê duyệt để chạy.
- Báo cáo cũ ghi baseline bước 1–3 đã hoàn tất một phần trong candidate cũ với giới hạn cụ thể. F01/F02/F11 có fixture nhưng còn native/live hoặc thiết bị thật; F09 còn energy/range/trend; F12 còn giới hạn font/native; F13 chưa kiểm đầy đủ accessibility, 200% text hoặc assistive technology. Không mô tả toàn bộ accessibility là PASS.
- Hạn mức dùng chung có snapshot **75% đã dùng / 25% còn lại trong cửa sổ 7 ngày**. Đây không phải quota riêng của task và không hàm ý reset credit.

## Phân vai và quy trình kiểm soát

| Vai trò | Cấu hình | Trách nhiệm |
|---|---|---|
| Root / điều phối | Model hiện tại, giữ nguyên | Chỉ điều phối; đọc handoff, giữ checkpoint, kiểm source và visual chỉ đọc sau QC, báo kết quả rồi chờ Owner. Không sửa code. |
| `home_implementer` | `gpt-6.1-sol`, medium | Thực hiện riêng 4.1 trong candidate mới; sở hữu code và harness chuẩn bị; bàn giao file, diff/hash, kiểm tra đã chạy và giới hạn. |
| `home_qc` / reviewer độc lập | **Đã tạo, accepted**; `gpt-6.1-sol`, high | QC độc lập đúng diff/hash 4.1; ghi finding, mức độ, vị trí và điều kiện tái hiện; không tự mở rộng scope. |
| `step_coordinator` / điều phối tài liệu | `gpt-6-luna`, medium | Chỉ cập nhật tài liệu điều phối theo dữ kiện root cung cấp; không sửa code, không tự xác nhận QC hoặc root review. |

Công cụ đã chấp nhận cấu hình `home_implementer` và `home_qc`. Model của root giữ nguyên và không được cấu hình qua công cụ trong checkpoint này. Không cần tạo hướng dẫn thiết lập model thủ công. Tiến trình bắt buộc cho từng bước:

1. Worker chỉ thực hiện bước đang được phép, trên candidate riêng, và ghi handoff.
2. Sau handoff, giao reviewer độc lập đọc đúng candidate/hash; xử lý và kiểm lại finding thuộc bước đó.
3. Root tự đọc diff/source và kiểm preview/hình ảnh trong phạm vi được giao, chỉ đọc. Ghi rõ những gì root trực tiếp quan sát được và giới hạn.
4. Root báo Owner checkpoint gồm thay đổi, QC, kiểm tra, hash, giới hạn và trạng thái bước kế tiếp.
5. Dừng ở đó. Phản hồi mới nhất của người dùng quyết định có bắt đầu checkpoint tiếp theo hay không; timeout, im lặng hoặc báo cáo agent không phải là approval.

## Ma trận bước và trạng thái

| Checkpoint | Phạm vi | Trạng thái hiện tại |
|---|---|---|
| 4.1 Home | Ưu tiên check-in hôm nay/tiếp tục theo capability; giảm phần giới thiệu lặp; không hứa thao tác không tồn tại. | **IMPLEMENTED, QC AND ROOT VERIFIED — WAITING_USER**. Kết quả theo [root verification](ROOT-VERIFICATION.vi.md); chờ root gửi báo cáo cuối và phản hồi Owner. |
| 4.2 Check-in | Trạng thái nhanh trước, chi tiết mở khi cần; text alternative; giữ hành vi lưu/consent đã được bảo vệ. | **WAITING_USER** |
| 4.3 Giải thích AI-off | Nói rõ time/energy được dùng ở đâu khi AI tắt; không hứa cá nhân hóa chưa có. | **WAITING_USER** |
| 4.4 Course | Đặt mục tiêu, loại nội dung, play và thông tin quyết định gần nhau; giữ tỷ lệ 9:16, nguồn và privacy. | **WAITING_USER** |
| 4.5 Reflection | Khi thiếu baseline hỏi cảm nhận chung; khi có baseline mới so sánh; dùng CTA hiện có. | **WAITING_USER** |
| 4.6 Profile | Ưu tiên chức năng hiện có; không trình bày support/lịch/gói/lớp chưa có như đang hoạt động. | **WAITING_USER** |
| 4.7 Responsive | Thu hẹp, landscape, welcome crop và desktop hierarchy trên runtime hiện có. | **WAITING_USER** |
| Journey còn lại | F09 energy readback, phạm vi 7/30 ngày, trend và vị trí rail; tách checkpoint rõ trước khi giao. | **WAITING_USER — cần phân loại thành phạm vi riêng** |
| Accessibility còn lại | F12/F13: text lớn/reflow, focus, keyboard, screen reader/assistive tech và kiểm native thực tế còn thiếu. Chia thành checkpoint có tiêu chí và môi trường kiểm phù hợp; không gộp thành tuyên bố WCAG. | **WAITING_USER — cần phân loại thành phạm vi riêng** |
| Bước 5 — hồ sơ nội dung | Bộ hồ sơ/pilot docs đã được chuẩn bị ở candidate trước; cần human review, người phụ trách, rights và chuyên môn. | **WAITING_USER — chưa human-review/duyệt** |
| Bước 6 — pilot text + hình | Protocol thử định tính đã được soạn tại `analyse/ux-implementation-2026-10-14/content/pilot-test-protocol.md`. Chưa chạy pilot, chưa có người tham gia, và nội dung/quyền/người duyệt chưa đủ điều kiện được duyệt. | **WAITING_USER — chưa bắt đầu pilot** |
| Bước 7 — kiểm cuối | Tích hợp, review, build/checks và evidence cuối sau các checkpoint được Owner cho phép. | **WAITING_USER — final integration gate chưa mở** |

Các hàng WAITING_USER là backlog để báo cáo và xin phản hồi sau checkpoint; không phải lệnh bắt đầu nối tiếp hay phê duyệt chung cho toàn bộ bước 4–7.

## Checks theo bước và cổng tích hợp cuối

Ở mỗi bước, worker báo những kiểm tra tập trung đã chạy và exit status cùng harness/giới hạn. Reviewer QC đúng diff/hash và findings. Root sau đó tự kiểm source, runtime boundary và preview/hình ảnh liên quan; ghi evidence hoặc ghi rõ phần chưa quan sát. Không chạy bộ kiểm tổng của toàn candidate để thay cho kiểm từng bước, và không sửa checker/lock để đạt PASS.

Chỉ mở bước 7 sau khi các bước được thực hiện đã có checkpoint riêng và phản hồi Owner cho phép tiếp tục. Cổng cuối cần xác định source/artifact chính xác, review độc lập, kiểm tra phù hợp trên đúng source cuối, manifest/hash/evidence, giới hạn thiết bị/accessibility/nội dung, và các gate native/web/staging riêng còn áp dụng. Local pass không tự mở native, live, web upload/alias, deploy, AI hoặc Production.

## Checklist nghiệm thu 4.1 Home

- [x] Worker xác nhận candidate `.vercel/ux-step4-1-20261014`, source baseline và file sẽ sửa; không ghi vào checkout app hoặc candidate cũ. Hash source/CSS/test được ghi trong [root verification](ROOT-VERIFICATION.vi.md).
- [x] Home làm nổi bật bắt đầu/tiếp tục check-in và chỉ hiển thị lựa chọn phù hợp capability hiện có; root quan sát guest Home và continuation.
- [x] Giảm nội dung giới thiệu lặp mà không loại bỏ thông tin cần để người học quyết định; worker handoff và root visual review ghi nhận kết quả.
- [x] CTA, nhãn và trạng thái phản ánh hành vi thật; root quan sát trạng thái session chưa lưu và giữ selection khi tiếp tục.
- [x] Handoff ghi file/diff/hash, harness và checks tập trung đã chạy, kết quả, giới hạn và ảnh/preview. Chi tiết checks: Home 9 + regression 82 PASS exit 0; build, runtime 28, scanner 23, Sites 4 và isolation 1 PASS.
- [x] Reviewer độc lập QC đúng hash; `home_qc` R1 PASS, không P1/P2, narrow independent probe hoàn tất trước root review.
- [x] Root trực tiếp kiểm source và visual chỉ đọc; root báo viewport/runtime quan sát và giới hạn, không suy ra native acceptance.
- [ ] Root gửi báo cáo cuối cho Owner và nhận phản hồi mới nhất về bước sau. 4.2 vẫn WAITING_USER, chưa bắt đầu.

### Ghi nhận sau khi có kết quả

Worker handoff: đã ghi trong `ROOT-VERIFICATION.vi.md`; chi tiết đầy đủ trong handoff/evidence của candidate.

Candidate/source hash: `src/Prototype.tsx` SHA-256 `0a9d46864b427c58dd9e0bac1f35f143176f2e1558b19e0baf1820ebd1b6fd3a` (full hash details in `ROOT-VERIFICATION.vi.md`).

Reviewer QC và findings: `home_qc` R1 PASS, no P1/P2; report hash được ghi trong `ROOT-VERIFICATION.vi.md`.

Root source/visual verification: đã hoàn tất theo `ROOT-VERIFICATION.vi.md`.

Checks và giới hạn: đã ghi trong `ROOT-VERIFICATION.vi.md`.

Root report đã gửi lúc: ________________________

Phản hồi Owner cho bước tiếp theo: ______________
