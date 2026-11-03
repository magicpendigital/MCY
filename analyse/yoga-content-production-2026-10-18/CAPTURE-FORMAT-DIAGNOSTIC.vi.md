# Private capture format diagnostic —18/10/2026

Root đã chạy bộ59fixtures sau static GO trong `CONTROL-CAPTURE-PREINVOCATION-REVIEW.vi.md`: **58PASS/1FAIL, process exit1**. Case fail là `actual initial and supplement captures bind to their exact observation records`, lỗi `Unsupported or malformed PNG`. Kết quả này do root cung cấp cùng tool output; tác giả patch không nhận đó là một lượt tự chạy. Giữ nguyên receipt/output59case của root, không đổi nó thành PASS khi có bổ sung sau.

Nguồn control của lượt thất bại: validator`244c5e8e6721f20706aa32e059059d0419fafd4ab4d061e53ef109945e5f2de0`, tests`d40142f774658f07449640ad340f7ba0cefe924ea3a94ae11cc3aaa29552ce42`, producer`abf6ca7e765fd90509a0f7c6d391375c0ba94158bd32898e61edbe4a36b7ce1d`. Các source pins/receipt cũ giữ là lịch sử.

Root kiểm magic bytes: private CUA captures có tên `pose-0.png` ở initial và supplement thực ra là **JPEG**, bắt đầu`FF D8 FF E0`/JFIF và kết thúc`FF D9`. Extension lịch sử không phải MIME thực. SHA và nội dung capture/evidence JSON đã pin phải giữ nguyên; không rename, convert hoặc ghi đè ảnh để làm control xanh.

Patch bổ sung chỉ thay parser của **private screenshot evidence**: sniff PNG/JPEG từ bytes; PNG giữ kiểm chunks/CRC; JPEG kiểm SOI/EOI, ranh giới/độ dài marker segments, SOF dimensions và scan marker structure. Đây là integrity cấu trúc, **không full entropy/pixel decode**, không xác nhận tư thế hoặc đã xem video. Containment/no-symlink/captureSHA/rawMOV denial vẫn giữ. Media hình hướng dẫn trong canonical units vẫn bắt buộc PNG như trước.

Tests mới dự kiến gồm JPEG thật được copy riêng vào fixture temp dưới tên `.png`, malformed/truncated JPEG và unknown bytes với hash/evidence pin đã cập nhật. Chưa chạy trước reviewGO mới; kết quả bổ sung cần ghi riêng cùng exact source pins/process exit. Không sửa unit/media/evidence capture hoặc app/cloud.
