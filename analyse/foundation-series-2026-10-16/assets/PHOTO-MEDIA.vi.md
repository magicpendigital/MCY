# Bộ ảnh phong cách chụp — Một chút nền tảng

Ngày: 16/10/2026, Asia/Bangkok. Phạm vi: **10 ảnh mới cho bản xem trước**, gồm 5 ảnh bài Đứng và 5 ảnh Bò–Mèo. Các minh họa cũ được giữ nguyên để so sánh.

## Hướng hình ảnh

Tham chiếu phong cách: `D:/Projects/MCY/public/assets/welcome-portrait-1024.webp` — dùng cho ánh sáng cửa sổ, màu kem/olive, cảm giác ảnh chụp và vật liệu phòng. Đây không phải bằng chứng nhận dạng của một giáo viên hay người mẫu thật. Nhân vật mới là **người phụ nữ trưởng thành hư cấu do AI tạo**, áo thể thao không tay xanh olive, quần cotton màu ngà, tóc đen búi thấp, chân trần trên thảm sage.

Công cụ: image_gen tích hợp, không API/CLI dự phòng. Tạo ảnh neo `standing-photo-01.png` trước; chín ảnh còn lại dùng đúng ảnh neo này làm tham chiếu nhân vật/phong cách, cùng minh họa tương ứng làm tham chiếu tư thế. Mỗi ảnh có một lệnh riêng. Chín lời gọi độc lập sau ảnh neo được chạy đồng thời.

Đã xem ảnh Welcome, các hình tư thế đầu vào và toàn bộ mười đầu ra. Không ghi đè tài sản cũ. Tất cả ảnh cuối cùng là PNG 1536 × 1024 px, nền đặc, tỉ lệ 3:2. Các ảnh là **hình tổng hợp bằng AI có phong cách nhiếp ảnh**, không phải ảnh chụp thực địa hay minh chứng giáo viên đã thực hiện/duyệt tư thế.

## Kiểm tra thị giác và giới hạn

- Bảng màu, tóc, mặt, quần áo và không gian nhất quán; hình cuối đã chuyển hoàn toàn sang phong cách ảnh chụp, không có nét chì/màu nước.
- Năm khung Đứng giữ đúng loại góc nhìn: toàn thân, cận bàn chân, tay dùng ghế hỗ trợ, cận thân trên và nhìn nghiêng. Hình cận cố ý cắt theo nội dung.
- Năm khung Bò–Mèo thể hiện trung tính → Bò nhẹ → giữa → Mèo nhẹ → trung tính góc ba phần tư. Các điểm tựa và phần đầu/tay/chân nằm trong khung; không thêm tư thế ra/vào sàn.
- Không thấy lỗi thừa chi lớn, chữ nhúng, mũi tên hay logo. Bò và Mèo có đường lưng phân biệt, cổ không bị ngửa hoặc ép mạnh.
- Đầu ra Bò–Mèo khung 5 đầu tiên tự thêm một ghế ở nền dù prompt yêu cầu bỏ ghế; đã dùng **một lệnh sửa riêng chỉ xóa ghế**, kiểm tra lại và chỉ đưa bản sửa vào assets. Bản trung gian giữ tại nguồn Codex, không dùng trong preview.
- Ghế ở khung Đứng 3 là ghế gỗ có chân và tay đặt trên lưng ghế; ảnh không tự xác nhận độ chống trượt hay tiếp xúc với tường. Điều kiện chọn/chặn ghế vẫn phải nêu bằng chữ và kiểm tra thực tế.
- Chất lượng thị giác không thay cho đánh giá tải lên khớp, chuyển động theo thời gian, hay duyệt chuyên môn. Cả nội dung lẫn hình vẫn **chờ chuyên gia yoga duyệt trước tích hợp/phát hành**.

## Tệp dùng trong bản xem trước

Metadata ngắn cho UI: [photo-media.json](photo-media.json). Các đường dẫn `image` là tương đối với trang preview ở thư mục cha.

| Tệp | Kích thước | Bytes | SHA-256 |
|---|---|---:|---|
| standing-photo-01.png | 1536 × 1024 | 1901732 | 30057869efb6e2038c5c1748e9e5f1c2427b2b74a99ada0b174ddf4016c69fe6 |
| standing-photo-02.png | 1536 × 1024 | 2264740 | c3223681f3b2545a63b9315ecc6fbf3a57a8403e90ff5eba9e5c296e8e44ddba |
| standing-photo-03.png | 1536 × 1024 | 1790440 | 9702379d9ef6fecb5d0b03bd251864db5e74bfa7c78c8a08dcfdc5dbb8bb6bd5 |
| standing-photo-04.png | 1536 × 1024 | 1724506 | 1db229e0cebb9255304470f05253ab2aff9dde6e3248763c022982f3041139d2 |
| standing-photo-05.png | 1536 × 1024 | 1735900 | 4a8ed0d7d336610a0a6913140ecdddd77c79c2754f437316977a8fa6ce2c8e54 |
| tabletop-photo-01.png | 1536 × 1024 | 1863364 | 7482d368b19c233026fa0a3bc966e233ed0738aa168a21f2d22913d407884db2 |
| tabletop-photo-02.png | 1536 × 1024 | 1909518 | 83671dd1ff6f1e1c5fd8d8e106993ec460472880bce042e475a3ddcd83b32099 |
| tabletop-photo-03.png | 1536 × 1024 | 1949476 | 8b3e4cdb2d2db1263024b7d427b18b00ca4afc9fcc314eda139e8c1cbc7ac149 |
| tabletop-photo-04.png | 1536 × 1024 | 1890923 | e4b1f8a87c7bb8d0247551703d54c532fca5ff7f2915544391560de4465af019 |
| tabletop-photo-05.png | 1536 × 1024 | 1784957 | 058480e418ddd023bade704de90a349f3fc907a8d7a64b7559a9f13f2705b8b1 |

Kích thước đọc trực tiếp từ PNG header; SHA-256 tính trên bản đã sao chép vào workspace.

## Nguồn ảnh gốc

Thư mục nguồn: `C:/Users/Admin/.codex/generated_images/01a14358-3b52-7e82-a115-4ad8853c2eb1/`

- standing-photo-01.png ← `exec-e4255949-52ba-4c51-adcb-f8045435d156.png`
- standing-photo-02.png ← `exec-9e350592-7066-4249-8703-6628e0959610.png`
- standing-photo-03.png ← `exec-6fb60f38-0415-4eb5-bd00-0b22ce93fb93.png`
- standing-photo-04.png ← `exec-40c9d7a8-fe18-44df-ac9b-a2b7bacfcc80.png`
- standing-photo-05.png ← `exec-deb95087-9174-4f90-b131-1667a3491a0e.png`
- tabletop-photo-01.png ← `exec-4df2f217-9291-4297-a750-127d2a06d55e.png`
- tabletop-photo-02.png ← `exec-18429eb4-d152-418e-9ed6-97ff26fa18f6.png`
- tabletop-photo-03.png ← `exec-8e8b7a6e-6d38-4907-8248-d311f118a0dd.png`
- tabletop-photo-04.png ← `exec-06346231-ef42-44ec-9110-4ba1a06dc195.png`
- tabletop-photo-05.png ← `exec-f4057f9d-2c69-41a4-b25a-99f6ccf2cc4e.png`

Bò–Mèo khung 5 trung gian bị loại khỏi preview: `exec-7822e4fb-b07b-4c77-9ff4-2849bd9fa800.png`. Bản cuối ở bảng trên được sửa từ đúng tệp trung gian này.

## Bộ prompt nguyên văn

### standing-photo-01.png

```text
Use case: photorealistic-natural. Asset: single landscape teaching image for a Vietnamese yoga app draft preview. Create a PHOTOGRAPHIC replacement for the standing lesson frame1.
INPUTS: Image1 (welcome portrait) is reference ONLY for photographic style, warm daylight, cream/olive palette and simple room materials. Do not copy its seatedpose, closedeyes, headtilt or imply the same realperson. Image2 (standing illustration) is ONLY a POSE/compositionreference, not artstyle, clothing or color.
Create a consistent NEW fictional adult Vietnamese/Asian woman in her early30s, average realistic build and height, natural warmmedium skin with real pores, gentle ovalface, darkbrown eyes, straight blackhair in a lowbun, minimalmakeup, no jewelry. Wardrobe: matte olive/sage sleeveless athletic top with modest scoopneck, relaxed ivory cotton trousers to justabove ankles, barefoot. This person will anchor a10frame lessonset: makeface/hair/clothes distinctive and stable.
POSE1: ordinary relaxed standing, fullbody fromhead tobothfeet, frontthreequarterview, comfortablyhipwidth feet bothflat onmat, knees easy, arms naturallybesidetorso fingersrelaxed, chinlevel, eyesopen forward. No rigidposture, no heelslifted, no excessivechestlift, no yoga balancechallenge. A plain sturdy lightwood chair atviewer right nearwall, separatedfromperson.
SCENE: quiet minimal room, warmcream plasterwall, light oakplankfloor, subtlebaseboard, muted sage texturedyogamat, softwindowdaylight fromleft, gentle realshadows. No plants needed. Composition fullbodyuncropped with generousspace andallmat inframe, landscape3:2 intended1536x1024.
STYLE: believable editorial lifestyle PHOTOGRAPH with natural lens perspective approximately50mm, realistic fabricweave skintexture woodgrain, softlylit but sharp enough tosee feet/hands. Matchwelcomereference warm clean photograph. No watercolor, pencilcontours, paint, papertexture, illustration, CGI, plastic skin, beautyglow, oversmoothing, fashionadvertising. No text,numerals,arrows,labels,logos,watermark. Credible anatomy with twoarms/twolegs andnatural handsfeet. One scene notcollage.
```

### standing-photo-02.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. STANDINGFRAME2: closeup of TWO barefeet andlowerlegs only, crop belowknees asreference. Same ivorytrousers hems aboveankles. Naturalcomfortablehipwidth stance, bothsoles andheels grounded onsagemat; lowfront3/4view. Show five naturaltoes on eachfoot, leftandright orientationcorrect, innerbigtoes, no toe spreadexercise. Generousspacearoundfeet, nochair needed.
```

### standing-photo-03.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. STANDINGFRAME3: fullbody frontthreequarter, allheadhandsfeetinsideframe. Womanstands ordinaryhipwidth bothfeetflat onsagemat, knees easy, onehandverylightlyresting on top of nearby sturdyplain lightwoodchairback atcomfortheight, otherarmnaturallyaside. Chairatviewer right within reach, nearwall, four normal legs onfloor, nowheels. No leaning/gripping. Chinlevel eyesopen. Preserve supportcontact andsimpleposture fromposeinput.
```

### standing-photo-04.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. STANDINGFRAME4: relaxed upperbody threequarter view fromhead to upperthighs, bothhands completelyvisible restingnearsidesofhips, shouldersnatural, chinlevel eyesopen, neutralchest no puffingorbackarch. Sameolive sleevelesstop ivorytrousers. No handsontorso, no breathingarrows, nochairneeded. Naturalhumanexpression, no posechallenges.
```

### standing-photo-05.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. STANDINGFRAME5: fullbody sideprofile facingLEFT, entireheadhandsfeetvisiblewithmargin. Ordinaryrelaxedstanding pause, bothfeet grounded comfortablyhipwidth onsagemat asprofileperspectiveallows, knees easy, armsnaturallybesidetorso, shouldersrelaxed, chinlevel eyesopen. NOwalking orliftedheel/foot, no stretch/no formalbalancepose. Nochairneeded.
```

### tabletop-photo-01.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. TABLETOPFRAME1: fullbody SIDEVIEW headLEFT, slightlyelevated sothefarhand andfarkneearevisibleseparately. Bothpalmsandbothknees planted onsagemat, handsundershoulders kneesunderhips, tops ofbothfeet restingbehindknees. Neutralstartingtabletop: broadlyhorizontal neutralback/pelvis, necklong naturalspinecontinuation, eyesgentlyopen lookingdownatmat. No saggingback, no rounding, no headlift. Fullhead, BOTHhands/knees/feetuncropped. NOchair.
```

### tabletop-photo-02.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. TABLETOPFRAME2 GENTLECOW: fullbody SIDEVIEW headLEFT andallhead/hands/knees/feetinsideframe. Bothpalmsandbothknees plantedonsagemat, handsundershoulders kneesunderhips, feetrestingbehind. SMALL comfortableCowmotion: chestslightlyforward andback gentlyconcave, pelvistiltsslightly, no deepbackbend/ribflare. Neckstayslong chinleveltoslightlyforward, eyesopenlookingatmataheadofhands withoutcrankingneckup. Preservefourpointbase, no liftedlimbs. NOchair.
```

### tabletop-photo-03.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. TABLETOPFRAME3 PASSINGTHROUGHMIDDLE: fullbody SIDEVIEW headLEFT, a littlecloserframingbut head/BOTHhands/BOTHknees/BOTHfeetalluncropped. Bothpalms/kneesplanted sagemat, shouldersoverhands hipsaboveknees, necklong eyesdowntomat. BroadlyFLAT neutralback andneutralpelvis — midpointafterCowbeforeCat, not CowdiporCatround. Slightperspectiveseparationofnear/farlimbs. NOchair.
```

### tabletop-photo-04.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. TABLETOPFRAME4 GENTLECAT: fullbody SIDEVIEW headLEFT, fullhead/BOTHhands/BOTHknees/BOTHfeetinsideframe. Bothpalmsandkneesplanted sagemat handsundershoulders kneesunderhips. Round middleandupperback gentlyupward into modestsmoothcurve, pelvisgentlytucks, headfollowscurvenaturally slightdown, necklongrelaxed no chinhardtochest. Eyesgentlyopen lookingatmat. ClearlyroundedbackdifferentfromneutralandCow, notdeepextremebend. No liftedlimbs orheelssitting, NOchair.
```

### tabletop-photo-05.png

```text
Use case: photorealistic-natural. Create ONE new PHOTOREAL landscape teaching photograph for a Vietnamese yoga foundations draft preview. INPUT1 is thephotographicANCHOR: preserve exactly this fictional adult Vietnamese/Asianwoman's faceidentity/bodyproportions, blackhairlowbun, matte olivesage sleevelessathletictop, relaxed ivorycottontrousers anklelength, barefeet. Preserve anchorroom warmcreamwall andlightoakfloor, softleftwindowdaylight, muted sagemat, naturalrealshadows. INPUT2 is ONLY thePOSE/framingreference, NOTdrawingstyle/wardrobe/matcolor. Convert thatpose into the anchor's actual PHOTOGRAPHIC world and SAMEPERSON. Natural50mmlens, realistic pores/fabricweave/woodgrain, gentle light but crisp handsfeet. No watercolor, pencil, illustration, papertexture, CGI/plasticskin, beautyglow, oversmoothing, fashioneditorial, plants. No text/labels/arrows/medicalsymbology/logos/watermarks. One scene notcollage. 3:2landscape intended1536x1024. Credible normalanatomy; no extralimbs/fusedhands/extra digits. TABLETOPFRAME5 ENDINGPAUSE: fullbody slightlyelevated THREEQUARTERSIDEVIEWfromfrontleft, womanstillheadLEFT; entirehead/BOTHhands/BOTHknees/BOTHfeetinsideframewithmargin. Bothhandsundershoulders bothkneesunderhips on sagemat, feetrestbehind. Back/pelvisreturnnearNEUTRAL broadlyflat, necklong eyesdowntomat, quietpause. Sameperson/clothes/room. Thisis neutralfourpointtabletop NOTCoworCat, NOTchildpose, NOTsittingonheels, NOstandup orsidehiptransfer, NOchair.
```


### Sửa riêng Bò–Mèo khung 5: xóa ghế khỏi nền

```text
Use case: precise-object-edit. Target image is a photoreal draft teaching image. Remove ONLY the wooden chair on the far right background and reconstruct the same continuous warm cream wall/baseboard/lightoakfloor behind it. Keep absolutely everything else unchanged: same woman's identity, face, body, olive sleeveless top, ivory trousers, both hands/knees/feet, neutral fourpoint tabletop pose facingLEFT, exact camera framing, sage mat, sunlight, shadows, photographic materialtexture, colors and1536x1024landscape composition. No newprops/plants/letters/logos/arrows. Do not change pose, anatomy, face, person, clothing or imagecrop. This is a background chair removal only.
```

