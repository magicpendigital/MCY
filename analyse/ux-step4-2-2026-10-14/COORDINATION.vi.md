# Điều phối UX — 4.2 Check-in

## Phê duyệt và phạm vi

Phản hồi người dùng được ghi nguyên văn: **“Đồng ý bước 4.1. Hãy giao Agent thực hiện bước 4.2 — bố cục check-in, sau đó cho Agent QC độc lập, bạn trực tiếp kiểm tra và báo cáo. Dừng chờ phản hồi của tôi trước bước tiếp theo.”** Đây là quyết định tiếp tục sau checkpoint 4.1, trong phạm vi candidate local. Không phải native, staging, live, upload, deploy hay release approval. Sau bước 4.2 phải báo cáo rồi dừng; bước kế tiếp chỉ mở theo phản hồi người dùng mới.

**4.2 Check-in: AUTHORIZED_ACTIVE.** Candidate nguồn là `.vercel/ux-step4-1-20261014`; candidate mới là `.vercel/ux-step4-2-20261014`. Worker sở hữu việc tạo/cập nhật candidate, code và harness; dự kiến kế thừa 231 inputs từ candidate trước và phải cung cấp bằng chứng/hash của chính mình. Candidate 4.1 cùng artifacts/reports cũ được giữ nguyên làm lịch sử.

| Vai trò | Model / trạng thái | Việc được giao |
|---|---|---|
| `checkin_implementer` | `gpt-6.1-sol`, medium; accepted | Chỉ triển khai 4.2 trong candidate mới; bàn giao files, source freeze/hash, harness, checks thực tế, kết quả và giới hạn. |
| `home_qc` | `gpt-6.1-sol`, high; **active sau source freeze** | QC độc lập trên đúng diff/hash 4.2; ghi findings có vị trí và điều kiện tái hiện. QC vẫn pending cho đến khi có báo cáo. |
| Root | Model hiện tại, giữ nguyên | Chỉ điều phối; sau QC đọc source/evidence và trực tiếp kiểm local preview; báo người dùng rồi dừng. Không sửa code. |
| `step_coordinator` | `gpt-6-luna`, medium | Chỉ tạo/cập nhật tài liệu điều phối theo thông tin được cung cấp; không sửa code hoặc tự xác nhận PASS. |

## Tiêu chí triển khai và nghiệm thu 4.2

- [ ] Cho phép chọn trạng thái nhanh trước bản đồ cơ thể; trạng thái đọc được và thao tác chính/tiếp tục rõ.
- [ ] Bản đồ cơ thể có disclosure hợp lý; cung cấp text list thay thế để chọn vùng và xem trạng thái.
- [ ] Giữ đầy đủ quan sát, kể cả phía/cơ thể bên trái-phải, không làm mất vùng đã chọn khi mở/đóng chi tiết hoặc quay lại bước trước.
- [ ] Xác nhận rõ trước khi xóa vùng/quan sát; thao tác xóa hoặc chỉnh sửa phản ánh đúng nội dung được xác nhận.
- [ ] Phân biệt rõ các lựa chọn/trạng thái “Chưa trả lời”, “Không thấy khó chịu”, “Chưa xác định” và “Bỏ qua”; thao tác mở bản đồ không tự tạo observation. Giữ xác nhận rõ trước khi xóa vùng/quan sát.
- [ ] Giữ điều hướng và footer/action trong safe area; nội dung cuộn được và không bị footer che.
- [ ] Không thay backend contract, schema, RPC, role, consent policy, runtime được bảo vệ hoặc dữ liệu live. Tuân root [AGENTS.md](../../AGENTS.md) hiện hành.
- [ ] Worker handoff/source freeze ghi candidate, inputs kế thừa, files/diff/hash, harness và từng check đã chạy cùng exit status. Không đánh dấu PASS khi chưa có evidence.
- [ ] `home_qc` review độc lập sau freeze; sửa finding P1/P2 trong phạm vi rồi QC lại đúng hash.
- [ ] Root sau QC trực tiếp đọc source/handoff/evidence và kiểm local preview; mô tả những gì quan sát được cùng giới hạn. Không suy ra native/device/full accessibility acceptance.
- [ ] Root báo người dùng kết quả 4.2 và dừng. **4.3 và mọi checkpoint khác vẫn WAITING_USER** cho tới phản hồi mới.

## Trạng thái sau khi có bằng chứng

Worker handoff/source freeze: `checkin.patch` có sẵn. `src/Prototype.tsx` SHA-256 `873111024377eb65ee55d229b9899d04acc798dca11c02924ab428cd6d39528c`; CSS SHA-256 `856165bc65112bb46b9c4f0ee346820d5fe17607f4ecd4b0cc7fe97b8d5a340d`.

Worker-reported checks (chưa được QC/root xác nhận): 11 focused PASS; build, TypeScript, runtime 28, catalog 0, scanner 23, Sites 4 + isolation 1 PASS. Regression checks pending.

`home_qc` report/hash/findings: pending.

Root source/visual check: pending.

Root report gửi lúc: _______________________________________

Phản hồi người dùng tiếp theo: ______________________________

## Ranh giới còn hiệu lực

Các con số và kết quả trong tài liệu UX cũ chỉ là lịch sử của candidate cũ. Root `AGENTS.md` hiện hành tiếp tục là nguồn ranh giới cho native, web và staging; trạng thái native `HALTED` và web `BLOCKED_NO_UPLOAD_OR_ALIAS` không thay đổi theo yêu cầu UX này. Không sửa `AGENTS.md`, candidate 4.1, artifacts/QA cũ hoặc tiến hành native/live/deploy trong checkpoint tài liệu này.

## Cập nhật 16/10/2026 — QC hoàn tất, root đang kiểm trực tiếp

Independent QC 14/10 đã hoàn tất trên source freeze: PASS phạm vi R1 local, không còn P1/P2; P3 capture đã được đóng bằng ảnh xác nhận cuối và readback. Root đã tự đọc QC/HANDOFF/patch/harness và xác nhận hai hash app khớp; root vẫn phải tự kiểm UI preview rồi ghi nhận kết quả thực tế. Handoff xác minh chỉ đọc ngày 16/10 được lưu riêng tại [HANDOFF-2026-10-16.json](HANDOFF-2026-10-16.json), không sửa chứng cứ lịch sử.

Preview tại `http://127.0.0.1:4189/?mode=web` được khởi động lại từ script đã pin `preview.mjs`; HTTP loopback trả 200. Chỉ dùng candidate local với `.invalid` backend, không copy `.env`, và fs allowlist giới hạn candidate cùng root `node_modules`. Phiên mới là exec session `6059`; session `48884` trong evidence cũ là lịch sử.

Trạng thái hiện tại: **QC_DONE_ROOT_DIRECT_CHECK_PENDING**. Không chạy lại broad tests trong handoff này. Sau khi root ghi lại quan sát UI của chính root, cập nhật bằng chứng root; rồi báo người dùng kết quả bước 4.2 và dừng. **4.3 vẫn WAITING_USER**; không native/cloud/deploy hoặc sửa app trong checkpoint này.

## Cập nhật mới nhất 16/10/2026 — root verification hoàn tất

Root đã trực tiếp kiểm candidate 4.2 trong CUA browser tab mới ngày 16/10 tại URL local `4189?mode=web` bằng guest-only/harness `.invalid`. Quan sát, số đo, thao tác và giới hạn được ghi riêng tại [ROOT-VERIFICATION.vi.md](ROOT-VERIFICATION.vi.md); bốn ảnh root ngày 16/10 có SHA-256 trong tài liệu đó. Root báo đã đọc full patch và QC, hash app khớp source freeze, review scope PASS và không tìm thấy P1/P2 bổ sung. Đây là bằng chứng root cung cấp; người cập nhật coordination không tự nhận thao tác UI.

Trạng thái bước 4.2: **IMPLEMENTED_QC_ROOT_VERIFIED_WAITING_USER**. Bước 4.3: **WAITING_USER**. Không chạy test mới, không sửa app/backend và không tiến hành bước tiếp theo cho tới khi có phản hồi người dùng.
