# Chuẩn bị QC độc lập — 4.3

Reviewer `energy_time_qc`, 16/10/2026. Trạng thái: **CHƯA CHẠY candidate probe; CHƯA CÓ verdict.** Chờ worker xác nhận app freeze bất biến và root GO.

Đã đọc root AGENTS.md, PLAN.vi.md bước4 mục3/F03, hai skill repo mcy-brand-ux/mcy-change-review và review-matrix, brand guidelines, design system/tokens. Phạm vi R1 trình bày Check-in bước2. Native HALTED/web BLOCKED giữ nguyên; không backend, Auth thật, health/consent write, native, install, deploy hoặc inference.

Baseline được root giao: candidate 4.2 visual đã duyệt `.vercel/ux-step4-2-visual-20261016`; Prototype SHA256 `f25242eb356fbf7289bf6b67596599e2c84959533252d929a065864fee3ab781`, CSS `390d1f2f58ae4cea1957243d41a2138420ab9241086a5d9dbf8d63f5c7216f6e`. Sẽ tự kiểm đối chiếu baseline/final freeze và 232 old + 228 root pins khi freeze có sẵn, không sửa evidence cũ.

Tiêu chí source: chỉ Step2 presentation/styles/tests; Step1 visual, handlers, state, save/error/retry/standalone footer, payload và Practice flow giữ nguyên. Time chỉ là tham khảo ở AI-off/not-ready, không ngụ ý lọc Discover. Energy tùy chọn, ghi khi được phép, không hứa Journey hiện hiển thị. AI-ready copy phải truy vết được minutes+energy từ PracticeRoute sang PracticeFlowScreen và hành động/consent rõ ràng; fixture không suy live capability.

Tiêu chí own browser probe: default/đổi lựa chọn/Step1 Edit-retain ở320/360/390; 5/10/15 với10 mặc định, năm energy cũ và không chọn sẵn; accessible names/pressed state; chữ điều khiển14px+, target44px+, keyboardTab focus thật; VI/EN 2x text chỉ changed controls; no horizontal overflow; ordinary wheel ở short/landscape và footer opaque/reachable. Đo sau settle, không đòi mọi nội dung cùng có mặt viewport đầu, không suy OS dynamic text hay WCAG đầy đủ từ injected text stress.

Own port4198, Vite `.invalid` env và abort requests ngoài localhost; không dùng preview4191 hoặc port4196. Đọc kết quả R1 của worker (command/process exit/final pins) thay vì chạy trùng toàn suite. Lỗi harness/intermediate giữ riêng qc-*; finding P1/P2 thật gửi worker+root trước verdict, worker là người sửa source. Chỉ viết QC newfiles ở thư mục này. Root còn manual review rồi WAITING_USER trước4.4.
