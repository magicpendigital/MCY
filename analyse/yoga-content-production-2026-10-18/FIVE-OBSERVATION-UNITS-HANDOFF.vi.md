# Bàn giao 5 bản đọc quan sát — 18/10/2026

Worker `/root/pose_inventory_intake`, theo root GO sau khi kiểm pixels bổ sung. Canonical là JSON trong `content/yoga-library/units/`; không sửa inventory, schema, app/candidate UX hoặc dữ liệu cloud.

| Unit | File | Chủ đích đã viết |
|---|---|---|
|`mcy.pose.kneeling-backbend`|`units/kneeling-backbend/r1.json`|Đọc nền quỳ và một tay chống sàn; không gán Camel hai tay nắm gót.|
|`mcy.pose.low-crow`|`units/low-crow/r1.json`|Phân biệt Crow-like trên bàn tay với low variant cẳng tay/đầu thấp; không dạy hạ đầu/nhấc chân.|
|`mcy.pose.wild-thing-high`|`units/wild-thing-high/r1.json`|Nhìn nền một tay và hai bàn chân; không dạy flip hoặc chuyển sang Wheel.|
|`mcy.transition.stand-up`|`units/stand-up/r1.json`|Phân biệt hình đứng và đoạn chuyển chưa quan sát; không gắn thành sit-to-stand hoặc recipe đứng lên.|
|`mcy.pose.low-wheel`|`units/low-wheel/r1.json`|Đọc nền cẳng tay/đầu gần sàn; không dạy tì đầu, đổi điểm chống hoặc vào/ra backbend.|

Mỗi unit có 5 bước **đọc/quan sát**, nguồn primary cụ thể từng bước, evidence từ still local thực sự thấy, đường vào/ra **chưa được hướng dẫn thực hành**, 5 photoAI briefs khác nhau. Tổng 25 briefs; **0 ảnh mới**, path/hash/mime/dimensions null, alt/caption trống. Media đều `identity_blocked` chờ chốt biến thể/điểm tựa và review. Không dùng ảnh giáo viên thật làm likeness reference.

`sourceRefs` giữ exact app ID/YouTubeID với `topic_reference` và `contentObserved:false`. `sourceObservations` chỉ ghi MOV local, SHA, các timestamp có pixels và giới hạn; không bind MOV bytes với YouTube. Không đọc/thu âm/transcribe audio hoặc xem trọn clip.

## Kiểm quan sát

`SOURCE-OBSERVATIONS.json` giữ lần đầu, kể cả lỗi layout. `SOURCE-OBSERVATIONS-supplement.json` bổ sung, không ghi đè history. Trong supplement có 11/13 file có ít nhất một khung nhìn thấy; cộng evidence ban đầu là **12/13**. Riêng WarriorII/index2 vẫn đen cả bốn khung; metadata/readyState không được dùng thay pixels. Không có kết luận chuyên môn hoặc nhãn tư thế “không an toàn” từ stills.

Chi tiết quan trọng của 5 unit: Quỳ ngả sau chỉ 2 frame ban đầu; Quạ có 2 frame bổ sung với hai cách chống khác nhau; WildThing chỉ 1 frame đích; Đứng lên chỉ khung đứng và montage gập, thiếu đoạn giữa; Bánh xe có 3 timestamp khác nhau qua hai lần capture, tải trên đầu vẫn không xác nhận. Các giới hạn được giữ ngay trong unit.

Nguồn pose chính đã mở ngày 18/10: YogaEasy Camel, Crow, WildThing, HalfStandingForwardBend và Wheel; chỉ đối chiếu họ tư thế, không dùng như recipe cho variant local. NCCIH/NHS hỗ trợ yêu cầu chuyên môn và stop principle, không dùng làm clearance. Không sao chép ảnh hoặc đoạn chỉ dẫn dài.

## Verification và phần root tiếp nhận

- **PASS:** `validateUnit` trên 5 unit, exit0; schema/closedflags/source IDs/evidence tồn tại/provenance/null-media/ref consistency. Kết quả `FIVE-OBSERVATION-UNITS-CHECK.json`.
- **PASS:** JSON có đủ 5 bước và 5 media/brief tương ứng từng unit; không có quyền duyệt/phát hành hoặc thời lượng thực hành được bịa.
- **ROOT_PENDING:** cập nhật 5 inventory backlinks rồi chạy whole-library validator/renderer/manifest/QC. Worker không chạy whole-library để giả thành PASS khi backlink chưa được root ghi.
- **BLOCKED:** reviewer yoga người thật, exact instructional entry/exit, quyền, media generation/pixel review, accessibility và adapter/publish.

`FIVE-OBSERVATION-UNITS-FREEZE.json` pin 5 file cùng các dependency và kết quả. Đây là freeze của phần worker, không thay manifest cuối toàn library. Helper `write-observation-units.py` chỉ để khởi tạo; JSON là canonical và helper từ chối ghi đè file đã tồn tại. Đừng rerun để reset các chỉnh sửa biên tập sau này.

Không có evidence mâu thuẫn chắc chắn cần sửa 7 unit nguyên tác khác: CowFace local thực sự là phần tay trên nền ngồi khoanh chân, phù hợp scope bản đọc; Cobra-gentle local cao hơn low original variant đã viết nhưng unit đó đã nói rõ không đại diện exact video. Root có thể bổ sung observation sau này mà không đổi quan hệ topic thành transcript.

Rollback: không consume 5 unit mới; giữ toàn bộ history/candidate/draft cũ. Server private port4318 vẫn là công cụ quan sát read-only, session7047 thuộc worker; root có thể yêu cầu dừng sau khi xem xong. Không có ứng dụng/runtime/native/deploy/cloud write trong phần này.
