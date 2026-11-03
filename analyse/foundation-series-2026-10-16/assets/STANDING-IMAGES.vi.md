# Năm hình minh họa — Đứng và nhận biết điểm tựa

Ngày: 16/10/2026. Phạm vi: tài sản raster cho bản xem trước thiết kế, chưa tích hợp ứng dụng.

## Trạng thái và cách tạo

- Dùng công cụ image_gen tích hợp, không dùng API/CLI dự phòng.
- Tạo **một lệnh riêng cho mỗi hình**, không cắt các ô từ contact sheet; hình 3–5 được tạo đồng thời bằng ba lời gọi độc lập.
- Tham chiếu duy nhất: `standing-concept.png`, đã xem bằng công cụ view_image trước khi tạo, để giữ nhân vật, trang phục và phong cách của bản đề xuất trước.
- Năm hình đều là PNG, 1536 × 1024 px, nền đặc ivory, tỉ lệ 3:2. Bản gốc được giữ tại thư mục generated_images của Codex; các bản dùng trong dự án đã sao chép vào thư mục assets.
- Hình có tính chất minh họa do AI tạo. Đây là **bản biên tập chờ chuyên gia yoga duyệt** về kỹ thuật, phương án hỗ trợ, độ rõ của điểm chạm và sự khớp giữa hình và lời hướng dẫn. Kiểm tra thị giác dưới đây không thay thế việc duyệt chuyên môn hoặc quyền phát hành.

## Mục đích từng hình

| Tệp | Khung nội dung | Bố cục |
|---|---|---|
| standing-step-01.png | Nhìn toàn bộ | Toàn thân góc trước 3/4, đứng tự nhiên; ghế ở bên cạnh |
| standing-step-02.png | Nhận biết điểm tựa | Cận hai bàn chân và cẳng chân, thấy khoảng cách và phần chân chạm thảm |
| standing-step-03.png | Có những cách bắt đầu khác nhau | Toàn thân; một tay đặt lên lưng ghế, hai chân chạm thảm |
| standing-step-04.png | Biết lúc cần đổi hoặc dừng | Cận thân trên, vai tự nhiên, mắt mở, tay buông |
| standing-step-05.png | Biết cách kết thúc | Toàn thân góc nghiêng, dừng ở cách đứng tự nhiên |

## Kiểm tra thị giác

Đã xem trực tiếp cả năm đầu ra. Nhân vật, tóc, quần áo và bảng màu nhất quán. Các khung toàn thân giữ đầu và bàn chân trong ảnh; hình 2 chủ động cắt dưới gối; hình 4 chủ động cắt phần chân. Không có chữ nhúng, mũi tên, logo hoặc hình ghép. Không thấy lỗi thừa tay/chân lớn; tư thế đứng đơn giản và không mang tính thử thách thăng bằng.

Giới hạn cần lưu ý: hình 3 cho thấy ghế gỗ có chân và tay đặt lên lưng ghế; hình không tự chứng minh vị trí ghế áp sát tường. Hướng dẫn chuẩn bị ghế vững, chống trượt và vị trí dùng hỗ trợ phải nằm trong nội dung chữ, không suy từ hình.

## Nguồn đầu ra gốc

- standing-step-01.png ← `C:/Users/Admin/.codex/generated_images/01a14358-3b52-7e82-a115-4ad8853c2eb1/exec-8b5578dd-4391-480c-b96a-d6c2c5329634.png`
- standing-step-02.png ← `C:/Users/Admin/.codex/generated_images/01a14358-3b52-7e82-a115-4ad8853c2eb1/exec-9fc3d609-4d23-4c7c-a7c3-e55b1e3a7745.png`
- standing-step-03.png ← `C:/Users/Admin/.codex/generated_images/01a14358-3b52-7e82-a115-4ad8853c2eb1/exec-eb73e014-3a76-4083-b547-4ec6d825e4ac.png`
- standing-step-04.png ← `C:/Users/Admin/.codex/generated_images/01a14358-3b52-7e82-a115-4ad8853c2eb1/exec-d6acba60-8cdb-4153-9c74-af0fa07e3985.png`
- standing-step-05.png ← `C:/Users/Admin/.codex/generated_images/01a14358-3b52-7e82-a115-4ad8853c2eb1/exec-d13a20a4-b9f8-4577-bb92-38ca5cb38cc1.png`

## Prompt nguyên văn

Kích thước đã đọc từ PNG header của các bản dùng trong dự án: tất cả 1536 × 1024 px.

| Tệp | Bytes | SHA-256 |
|---|---:|---|
| standing-step-01.png | 2174660 | e511c3c576ccba27f13fd4e5b1e774ed5f39fba262ef2af479987e1decf6487e |
| standing-step-02.png | 2497100 | cd26db67c3b01fb265d50d7397da0199754eaafe11602ed9d11ddb412f57ec49 |
| standing-step-03.png | 1994833 | 30156e2c4eba3f332c583b873ea7d6fe83623ebe0b7e2e00d53baeb395e7652f |
| standing-step-04.png | 2089809 | 340646362a6a66f21f01d8cca9e199532c66ddf9c29925402b0770285d9b1430 |
| standing-step-05.png | 1938396 | ad76e37022c77c082a26d12879ba7b69c851cd488531a63ba9145ce790fb6137 |

### Prompt 1

```text
Use case: scientific-educational. Asset: one individual editorial illustration for the Vietnamese yoga-foundations lesson "Đứng và nhận biết điểm tựa", frame 1 of 5.
Input image is a character, palette and style reference. Create a new composition preserving this exact adult Vietnamese woman's identity, body proportions, sage loose short-sleeve shirt, dark forest green loose trousers, black hair in a low bun, barefoot.
Primary scene: relaxed, ordinary standing position seen from a front three-quarter view, full body from head to both feet. Feet comfortably about hip-width, both soles grounded, knees easy, arms resting naturally beside torso, fingers natural, chin level, eyes gently open. Do not make a rigid military stance, heels lifted, chest thrust out, or feet forced to touch. The image teaches observing a starting position, not pushing into a pose.
A simple sturdy wooden chair can stand to viewer right near a plain wall, not touching the person. Wide landscape 3:2 composition, intended 1536x1024. Figure large and clearly legible with generous plain space at left/right, head and feet fully in frame. Ivory paper background with minimal floor line, terracotta rectangular yoga mat, forest/sage palette. Match reference hand-drawn editorial watercolor and fine pencil contours, subtle textured paper, calm humane tone.
No text, lettering, numerals, labels, arrows, badges, logos, watermark, decorative plants, extra people, or multiple panels. Anatomically credible two arms, two legs, five fingers where visible, five toes per foot; no exaggerated body ideals. One complete illustration, not a contact sheet.
```

### Prompt 2

```text
Use case: scientific-educational. Asset: one individual editorial illustration for the Vietnamese yoga-foundations lesson "Đứng và nhận biết điểm tựa", frame 2 of 5.
Input image is character, wardrobe, palette and style reference. Make a distinct close-up illustration of that same adult Vietnamese woman's TWO bare feet and lower legs only, cropped deliberately below the knees at the top edge. She wears the same forest green loose trousers, hems above ankles, and stands on the same terracotta rectangular mat. Natural comfortable hip-width spacing, both soles and all toes resting on the mat, heels grounded. View from a low front three-quarter angle so both feet, the heel/outer edge contact, and toe contact are understandable. Two normal feet, left and right with inner big toes correctly oriented, five toes on each foot, no toe spread exercise, no forced parallelism, no tiptoe or weight-shift instruction. Leave generous space around the two feet so the feet can be read on a mobile screen.
Match the reference's delicate pencil contours and watercolor texture, warm ivory paper background, sage/forest/terracotta muted palette, subtle ground shadow. Wide landscape 3:2, intended1536x1024. This must be a newly composed closeup, not the full-body reference with a foot inset.
No text, numerals, labels, arrows, dots, pressure-map coloring, medical overlays, logos, watermark, extra feet, multiple panels, chair, or decorative plants. One single educational illustration.
```

### Prompt 3

```text
Use case: scientific-educational. Make ONE distinct standalone editorial watercolor-and-pencil illustration for a Vietnamese yoga foundations mobile lesson. Reference image supplies the EXACT adult Vietnamese woman's identity, proportions, face, sage loose short-sleeve shirt, forest green loose trousers, dark hair low bun, bare feet, textured ivory paper, terracotta mat, fine pencil outlines, calm natural tone. Preserve all those identity/style invariants. Wide landscape 3:2, intended1536x1024. Minimal ivory wall and subtle floor line. No text, letters, numbers, labels, logos, watermark, arrows, breathing/energy symbols, extra people, decorative plants, multi-panels or collage. Natural credible anatomy. FRAME3 — supported standing alternative. Fullbody frontthreequarter view, head and bothfeet entirely visible. Woman stands comfortably hipwidth on terracotta mat, bothfeet flat, knees easy. Beside her on viewer right is a sturdy plain wooden chair, its back directly against the plainwall, four normal legs readable onfloor and no wheels. Her nearest hand rests very lightly on top of the chairback at a comfortableheight, elbow naturally bent, no gripping or pushing; other arm rests beside her torso. Chair is at side within easy reach, not infront or sofar sheleans. Upright relaxed torso without leaning, chinlevel, eyesopen. Make chairperson contact physically natural and bothfeet on mat. One ordinary supportiveoption, not a balancechallenge.
```

### Prompt 4

```text
Use case: scientific-educational. Make ONE distinct standalone editorial watercolor-and-pencil illustration for a Vietnamese yoga foundations mobile lesson. Reference image supplies the EXACT adult Vietnamese woman's identity, proportions, face, sage loose short-sleeve shirt, forest green loose trousers, dark hair low bun, bare feet, textured ivory paper, terracotta mat, fine pencil outlines, calm natural tone. Preserve all those identity/style invariants. Wide landscape 3:2, intended1536x1024. Minimal ivory wall and subtle floor line. No text, letters, numbers, labels, logos, watermark, arrows, breathing/energy symbols, extra people, decorative plants, multi-panels or collage. Natural credible anatomy. FRAME4 — relaxed upper body observation. Distinct close framing from crown of head to upperthighs of same woman, threequarter front view. She stands naturally, eyesopen, chinlevel, mouth neutral with gentleexpression. Shoulders relaxed at naturalheight, chestneutral, not puffedout, no archedback. BOTH arms hang naturally at sides with hands completelyvisible nearhips, no touchingchest or belly. Loose sage shirt fallsnaturally overhips, foresttrousers partlyvisible. Large legible face/neck/shoulder contour for mobile readers. Plain warmivory background, no chair needed and no mat needed in this crop. No breathing arrows or visual effects. Emphasize ease rather than rigid posturalcorrection.
```

### Prompt 5

```text
Use case: scientific-educational. Make ONE distinct standalone editorial watercolor-and-pencil illustration for a Vietnamese yoga foundations mobile lesson. Reference image supplies the EXACT adult Vietnamese woman's identity, proportions, face, sage loose short-sleeve shirt, forest green loose trousers, dark hair low bun, bare feet, textured ivory paper, terracotta mat, fine pencil outlines, calm natural tone. Preserve all those identity/style invariants. Wide landscape 3:2, intended1536x1024. Minimal ivory wall and subtle floor line. No text, letters, numbers, labels, logos, watermark, arrows, breathing/energy symbols, extra people, decorative plants, multi-panels or collage. Natural credible anatomy. FRAME5 — ending pause. Distinct FULLBODY SIDE PROFILE of samewoman facing viewer left. Head and bothfeet completelyvisible with generous margins. Ordinary relaxedstand, bothfeet grounded about hipwidth as allowed in profileperspective, knees easy, arms hangingnaturally, shoulders relaxed, chinlevel and eyesopen. Do not show walking, onefootraised, tiptoe, stretchedarms, seatedposition or a formal pose. Same terracottamat fullyonfloor, no chairneeded. The profile looks like a simple comfortablepause at the end of a lesson. Keep bodyweight overfeet, uprightneutral not leaningforward/back. Ensure two separate anatomicallycredible legs/feet discernible without bizarre twist.
```

