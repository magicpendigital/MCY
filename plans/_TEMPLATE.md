<!-- plan-template v1 -->
# Kế hoạch — {{tên ngắn}}

Trạng thái: {{chờ duyệt | đã duyệt (ngày) | xong}}. Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận (intake) theo [TASK_LIFECYCLE](../docs/quality/TASK_LIFECYCLE.md). Kiểm bằng `npm run check:plan plans/active/<tệp>.md`. Khi xong, cập nhật `PLAN.md`.

## 1. Mục tiêu
{{Một đoạn: làm gì, vì sao, cho ai. Yêu cầu/quyết định mới nhất của Owner (nguồn, ngày).}}

## 2. Tiêu chí xong
- {{Tiêu chí đo được, Owner tự kiểm được}}
- {{Lệnh kiểm chạy xanh}}

## 3. Phạm vi sửa
- {{tệp / thư mục được sửa; vùng trong bản đồ vùng của AGENTS.md}}
- Mức rủi ro cao nhất: {{R0–R3}} theo [review matrix](../.claude/skills/mcy-change-review/references/review-matrix.md), vì {{lý do}}.
- Hiện trạng: commit {{sha}}, tệp đang dở của người khác: {{có/không}}; hành vi đang chạy phải giữ: {{…}}.

## 4. Cố ý không đụng
- {{phần liên quan đã xem và để nguyên — vì sao}}

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| {{…}} | {{…}} | {{…}} | {{…}} |

Xét: giao diện/điều hướng/ngôn ngữ/trợ năng, lưu trữ/dữ liệu/API/schema, danh tính/vai trò/đồng ý, nội dung/media/AI, web/native/runtime bảo vệ, build/cấu hình, iOS 15 (INC-001), quy trình.

## 6. Bảo mật
- {{bí mật, đầu vào không tin cậy, RLS/grant, thao tác ra ngoài, thư viện mới và nguồn gốc}}

## 7. Hoàn tác
- {{tắt bằng công tắc nào; cách quay về bản trước; giới hạn}}

## 8. Các bước
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| {{1}} | {{…}} | {{…}} | {{S/M/L}} |

## 9. Cách thử
1. {{bước Owner tự làm, bằng lời thường}}

## 10. Lệnh kiểm
- `npm run check:quick`
- {{các cổng theo mức rủi ro: test:unit, check:ios15, test:runtime / spec liên quan, kiểm thật trên thiết bị nếu cần}}

## 11. Rủi ro còn lại
- {{điều chưa chứng minh được. Rủi ro chưa xử lý được thì ghi "- [CAO] …": check:plan sẽ chặn cho tới khi Owner quyết}}

## 12. Cần duyệt
- {{mỗi mục một quyết định của Owner; thao tác ra ngoài (push, deploy, Play, migration, gửi mail) ghi rõ ở đây}}

## Progress
- [ ] {{1}}
