# QC ảnh giữa kỳ — Trường tấn cao và Chiến binhII

Ngày18/10/2026, Asia/Bangkok. Reviewer độc lập:`/root/content_independent_qc`. Đã trực tiếp xem10PNG và đọc unit scope/body/brief/alt/caption/provenance/closed flags. Đây là kiểm kỹ thuật/biên tập ảnh nháp; không duyệt chuyên môn yoga, quyền hoặc chuyển tiếp thực hành. Không sửa ảnh/dữ liệu và không chạy generation.

**Không phát hiện P1/P2 cụ thể trong10ảnh hiện tại.** Cả hai bộ có nhân vật/trang phục/bối cảnh nhất quán, không chữ/mũi tên/montage; không thấy mất/thừa chi rõ ở mức xem toàn ảnh. Các crop chủ động của khung3 đã được alt nêu đúng, không gọi mọi ảnh là toàn thân.

Unit SHA lúc đọc: high-lunge/r1`78135b89cbc95a8d8809afa28b88f605cb4e5d00b87f8e246a22e6936cef1368`; warrior-ii/r1`e666a51c0cf89a777b5d3ee8870deba4605af0049a8f8c90c342664e774cd067`. Hai unit vẫn media_draft,learnerVisible=false,recommendationEligible=false,publishStatus=unpublished,review pending,approvalRecords rỗng.

## Trường tấn cao

Ảnh ở`content/yoga-library/media/new-poses/high-lunge/`,1536×1024. Phạm vi unit là đọc nguyên tác, chưa tự cung cấp đường vào/ra hoặc xác nhận clip26. Bộ ảnh không tự chứng minh một chuyển tiếp từ đứng/chống tay là an toàn.

| File | SHA256 | Đọc pixels/metadata |
|---|---|---|
|high-lunge-photo-1.png|`7f227842fa0b4684ccf2141eb877cf5ae7310975302c836b9a2acc4b68c8d4c5`|Toàn thân lunge nhìn nghiêng, chân trước phẳng, gót sau nhấc, gối sau rời thảm; tay gần buông, tay xa bị thân che theo góc. Alt không hứa cả hai tay nhìn rõ.|
|high-lunge-photo-2.png|`46892914fa006debf076f23c8ac1859305d26054f1e0679f586b42e23eac4022`|Đứng tự nhiên nhìn trước, hai tay buông, hai chân có khoảng cách; đúng caption khung nghỉ không phải bước đang lao vào lunge.|
|high-lunge-photo-3.png|`c6cdc4efc946255a7c0b19699ad8c8da33b274c275db166b75dd88d4cd1237ae`|Crop từ phần ngực xuống chân, giữ hai điểm chân/gót sau trong khung; tay gần rõ và tay xa che một phần đúng alt. Không chữ/góc90độ.|
|high-lunge-photo-4.png|`f872b7c3fcca3501f1f79f62b293b98bc791e16d53c65a072a653eed7d1ef514`|Cùng hướng lunge, hai tay nâng trên đầu, đầu/ngón tay/chân đều trong khung, thân gần dựng. Không cắt điểm chân để chỉ khoe tay.|
|high-lunge-photo-5.png|`d56b5970ea9e8f4c33bfe590368a4ffa2bbe3dc1254daab87eaf8f9f8a5fca94`|Đứng nghỉ nhìn chếch bên; hai tay thả và hai chân làm nền. Không có chân giữa không trung hoặc bước chuyển nhanh.|

## Chiến binhII

Ảnh ở`content/yoga-library/media/new-poses/warrior-ii/`,1536×1024. Unit chọn phía phải của nhân vật làm phía trước theo proposal, chưa xác nhận bên clip31; alt dùng hướng trong ảnh nơi cần tránh áp nhầm bên người xem.

| File | SHA256 | Đọc pixels/metadata |
|---|---|---|
|warrior-ii-photo-1.png|`5d007533e951d1315d166b5e9b8a0c203dee60f9c7689e1e9d5e2261e3d4a39d`|Hình đứng mở, gối trái ảnh gập, hai tay dang và đầu nhìn về tay trước; hai tay/chân có đủ trong khung.|
|warrior-ii-photo-2.png|`a5ef00add136019fd398c58a8b3da58a4b64ad2a4486b64e40bffd20ccf98483`|Tay nghỉ để đọc nền chân; bàn chân trước hướng trái ảnh, chân sau hướng về máy đúng alt. Đầu nhìn hướng khác khung1nhưng step2chỉ đọc chân, không dùng khung này làm cue đầu.|
|warrior-ii-photo-3.png|`ad9eb9c15656d92970c13b88b7cb9b824c6bcd315f52e4cc9a6bc36a3351cad8`|Crop phần eo xuống hai chân; hai bàn chân/gối trước giữ rõ trong khung, không còn đầu/tay theo chủ đích crop và alt đã khai.|
|warrior-ii-photo-4.png|`c98977e99d1586239d44501de314b3d6ec35e06944cd76e477462c6bcf791555`|Góc ba phần tư khác khung1, hai tay gần ngang vai, đầu theo tay trước; khớp step4và giữ chân làm nền.|
|warrior-ii-photo-5.png|`1ae0dfd81a93b09d1b5f045dd7c70a3412d3da7d77dc6378f21489b4a7cf68af`|Chân trước giảm gập và tay hạ bên đùi, chân vẫn ở hình đứng rộng; đúng khung cuối, không ảnh đang xoay chân dưới tải.|

## Provenance và giới hạn

PowerShell đọc generation ledger và tính SHA256 trực tiếp cho10target files cùng10original image_gen output files theo sourceOutputPath; process exit0, **10/10 target=ledger=original output hash**. Hash media/unit assetBrief tương ứng cũng khớp khi đọc. Tool/date/source/hash/promptRef,AI disclosure và expert/rights pending còn nguyên. Ledger đang in_progress nên chưa được xem như production manifest cuối; kiểm này không độc lập chứng thực backend sinh ảnh hoặc quyền ngoài các field đã ghi.

Hình không tự chứng minh sự phù hợp cá nhân, phân phối tải, góc gối/cổ/vài hoặc chất lượng entry/exit. Reviewer kỹ thuật không đổi các pending đó thành approved. Bài đọc vẫn không tạo practice duration/record hoặc yêu cầu làm đủ hai bên. Một nền nghỉ ở đầu/cuối không thay cho hướng dẫn rời tư thế đã được chuyên gia duyệt.

Final QC/root được reuse việc xem pixels của10ảnh chỉ khi từng SHA giữ nguyên và ghi explicit comparison. Vẫn đọc lại text/alt/caption/brief/flags/ledger cuối, vì metadata có thể đổi độc lập. Nếu ảnh/map step/crop thay, review lại phần ảnh hưởng. Tổng35ảnh/schema/manifest và handoff UX vẫn chưa có verdict cuối trong tài liệu này.
