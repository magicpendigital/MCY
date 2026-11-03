# Chỉnh câu chuyển khung đọc sau bàn giao ảnh

Root đã đọc `PHOTO-PRODUCTION.vi.md` có `CANONICAL_WRITE_STOP`, rồi sửa28 trường `steps[].exit` của7unit r1: downward-dog, high-lunge, warrior-ii, cow-face, three-legged-dog, cobra, cobra-gentle. Reviewer độc lập đã đồng ý sửa câu này trước khi root áp dụng.

- Câu cũ: “Xem khung tiếp để đọc đầy đủ đoạn chuyển; không tự thực hiện theo một khung đơn.”
- Câu mới: “Chuyển sang khung đọc kế tiếp; không suy đường vào/ra từ một hình.”

Câu cũ có thể khiến người đọc tưởng bộ ảnh đã đủ đường chuyển thực hành, trong khi scope của các bài vẫn giới hạn ở đọc/quan sát và một số đường vào/ra chưa chọn. Patch chỉ thay đúng câu exit đó,4lần/unit; không bổ sung chỉ dẫn vận động, không đổi ảnh hoặc approval. Node kiểm JSON và đếm exact string **PASS, exit0,28fields/7units**. Manifest cuối sẽ pin JSON sau sửa; không mang unit hash trước sửa trong receipt producer sang nhận là hash cuối.
