# Root interim checks — giữ kết quả ban đầu

18/10/2026. Chỉ kho draft local, không app/backend/native/live.

- `node sync-inventory-backlinks.mjs`: PASS exit0;38source records giữ nguyên,13record liên kết14unit. Không coi metadata38 thành38bài hoàn tất.
- Sau independent `CONTROL-PREINVOCATION-REVIEW.vi.md` GO, root chạy `node --test analyse/yoga-content-production-2026-10-18/validate-library.test.mjs`: PASS **51/51**, process exit0. Có negative observations, provenance, PNG/chunks/CRC và nested manifest. Đây là fixture consistency, không phải chuyên môn/quyền/server enforcement.
- Root chạy global `node analyse/yoga-content-production-2026-10-18/validate-library.mjs` trong lúc media chưa xong: **FAIL exit1**, `Present media must use package media path`. Bộ Downward Dog mới ghi `content/yoga-library/media/...` vào field package-relative. Root gửi lỗi cho media implementer sửa data, không nới validator. Kết quả cuối phải ghi riêng sau sửa; không mang PASS51 sang toàn package.
- Root đã trực tiếp xem5PNG Downward Dog mới. Nhân vật/phòng/trang phục nhất quán; trạng thái và góc nhìn khác nhau. Khuất gối xa trong khung5 phải nói rõ, không claim tất cả điểm tiếp xúc đều nhìn thấy riêng. Không kết luận phù hợp người học hoặc kỹ thuật đã được duyệt.

Final manifest và QC còn chờ khi các bộ ảnh hoàn tất. Các source/hash/case cũ không tự được dùng làm final PASS khi dữ liệu thay đổi.
