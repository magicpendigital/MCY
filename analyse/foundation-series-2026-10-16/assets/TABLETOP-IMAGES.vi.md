# Năm hình minh họa — Làm quen chuyển động Bò–Mèo

Ngày: 16/10/2026. Phạm vi: tài sản raster cho bản xem trước thiết kế, chưa tích hợp ứng dụng.

## Trạng thái và cách tạo

- Dùng công cụ image_gen tích hợp, không dùng API/CLI dự phòng.
- Mỗi tệp được tạo bằng **một lời gọi riêng**, không cắt ô từ contact sheet. Các lời gọi độc lập được chạy đồng thời theo nhóm 1–2 và 3–5.
- Tham chiếu nhân vật/phong cách: `standing-step-01.png`, đã xem trực tiếp trước khi tạo. Giữ cùng nhân vật nữ trưởng thành người Việt, tóc búi thấp, áo sage rộng, quần xanh rừng rộng, chân trần và chất liệu màu nước/nét chì trên nền giấy ivory; thay tư thế, bỏ ghế.
- Bộ hình là **bản biên tập do AI tạo, chờ chuyên gia yoga duyệt** về giải phẫu, kỹ thuật, biên độ chuyển động và sự khớp giữa hình/lời. Không xem kiểm tra thị giác là phê duyệt chuyên môn hoặc quyền phát hành.
- Bản gốc được giữ tại thư mục generated_images của Codex; bản dùng trong dự án sao chép vào assets.

## Mục đích từng hình

| Tệp | Khung nội dung | Trạng thái chuyển động |
|---|---|---|
| tabletop-step-01.png | Chuẩn bị bốn điểm tựa | Bàn tay và đầu gối làm điểm tựa, lưng gần trung tính |
| tabletop-step-02.png | Mở nhẹ phía trước · Bò | Lưng hơi võng, cổ dài, biên độ nhỏ |
| tabletop-step-03.png | Đi qua vị trí giữa | Trở qua đường lưng gần trung tính, khung gần hơn nhưng không cắt điểm tựa |
| tabletop-step-04.png | Cuộn nhẹ lưng · Mèo | Lưng tròn nhẹ, đầu đi theo đường cong tự nhiên |
| tabletop-step-05.png | Trở về và kết thúc | Tạm dừng ở bốn điểm tựa, khung ba phần tư khác nhẹ |

Không có tư thế Em bé, ngồi lên gót, chuyển ngồi bên hông hoặc hướng dẫn đứng dậy bằng hình; nội dung kết thúc ở trạng thái trung tính và người học dùng cách ra/vào sàn quen thuộc phù hợp với mình.

## Kiểm tra đầu ra và nguồn

Đã xem trực tiếp cả năm đầu ra: hình 2 có đường lưng hơi võng; hình 4 có đường lưng tròn rõ; hình 3 quay về đường lưng gần trung tính; hình 5 đổi góc nhìn ba phần tư để tách khỏi khung chuẩn bị. Toàn bộ đầu, hai bàn tay, đầu gối và hai bàn chân nằm trong khung. Nhân vật và màu áo/quần nhất quán với bài Đứng. Không thấy lỗi thừa chi lớn, chữ nhúng, mũi tên hay đạo cụ. Kiểm tra này không đo được tải lên cổ tay/đầu gối hay xác nhận kỹ thuật; cần chuyên gia yoga đối chiếu.

Các giá trị kích thước dưới đây được đọc từ PNG header; SHA-256 từ đúng tệp đã sao chép trong assets.

| Tệp | Kích thước | Bytes | SHA-256 |
|---|---|---:|---|
| tabletop-step-01.png | 1536 × 1024 | 2159152 | a850217766ea3860820e3c7bfe9dc76de194e248a3413492870fe60c4410107c |
| tabletop-step-02.png | 1536 × 1024 | 2343081 | 2c0c2d7ed5f880da917eda40796e2c8db2149a886a38c3d0ca5cf09fcfdedef7 |
| tabletop-step-03.png | 1536 × 1024 | 2385125 | 47a4d630ead5b4616084625f1a1952f9f919949e4d155b9fdbcab7aa02545106 |
| tabletop-step-04.png | 1536 × 1024 | 2159976 | 24850fe94bc61e1190f8c0c506c8d45df7d25a6721ec63f53bf62d95efb1e9b3 |
| tabletop-step-05.png | 1536 × 1024 | 2372281 | 2f7d7d7d6d2b709ebd0586bc704e5be64c7e8718014088d1055acf07f1c04130 |

Thư mục nguồn: `C:/Users/Admin/.codex/generated_images/01a14358-3b52-7e82-a115-4ad8853c2eb1/`

- tabletop-step-01.png ← `exec-ca218c1a-a8d1-4981-8304-c0763452b488.png`
- tabletop-step-02.png ← `exec-e088d4d4-867c-4974-81f0-3aa30ef94ade.png`
- tabletop-step-03.png ← `exec-3787ccb5-651f-452f-8c2a-95657122b7ab.png`
- tabletop-step-04.png ← `exec-5fd41c02-86f8-4501-9531-7ca6f75a6531.png`
- tabletop-step-05.png ← `exec-d9a1b758-fac6-4d9a-9c11-97d9920f6c2d.png`

## Prompt nguyên văn


### Prompt 1

```text
Use case: scientific-educational. Asset: ONE individual teaching illustration for a Vietnamese yoga foundations mobile preview, Bò–Mèo (Cow–Cat) lesson. Input image is ONLY a reference for character identity, wardrobe, palette, watercolor texture and pencil linework. Make a NEW composition of this EXACT adult Vietnamese woman, realistic average build, blackhair lowbun, muted sage loose shortsleeve shirt, forestgreen loose trousers, barefeet. Do NOT keep standingpose or chair fromreference. Plain warmivory texturedpaper wall/floor, ONE terracotta rectangular yoga mat onflatfloor. Nochair, props, plants, labels, text, numerals, arrows, medical overlays, energy/breathsymbols, logos, watermark or multiplepanels. Wide landscape3:2, intended1536x1024. Calm editorial watercolor/finepencil samequality asreference. Fullhead, bothhands, bothknees and bothfeet fullyinsideframe withsufficientmargin, correcthumananatomy, samebodyproportions, notglossyfitnessphotography. 
Composition: camera SIDEVIEW, woman facesLEFT, slightlyelevated enough to see far hand and far knee with a small naturaloffset; keep torso silhouette clear. FOURpoints ofsupport: twohands andtwoknees ONMAT. Palmsflat withfingersforward, naturalfivefingers eachvisiblehand. Knees underhips, handsundershoulders, elbowseasy, feetresting naturally behindknees topsdown. Show BOTHarms and BOTHlegs unmistakably and nofloatinghand/knee. Shirt loose but spinecurve stillreadable frombackcontour. FRAME1 of5, NEUTRAL STARTING TABLETOP. Horizontal neutralback, levelpelvis, neck a natural continuation ofspine, gaze downtoward matbetweenhands, eyesopen. Torso fromshouldersto hips broadly level. No saggingbelly, no roundingback, no liftingchin, no dramatic curve or sittingonheels. Quiet pause and broadstablebase.
```

### Prompt 2

```text
Use case: scientific-educational. Asset: ONE individual teaching illustration for a Vietnamese yoga foundations mobile preview, Bò–Mèo (Cow–Cat) lesson. Input image is ONLY a reference for character identity, wardrobe, palette, watercolor texture and pencil linework. Make a NEW composition of this EXACT adult Vietnamese woman, realistic average build, blackhair lowbun, muted sage loose shortsleeve shirt, forestgreen loose trousers, barefeet. Do NOT keep standingpose or chair fromreference. Plain warmivory texturedpaper wall/floor, ONE terracotta rectangular yoga mat onflatfloor. Nochair, props, plants, labels, text, numerals, arrows, medical overlays, energy/breathsymbols, logos, watermark or multiplepanels. Wide landscape3:2, intended1536x1024. Calm editorial watercolor/finepencil samequality asreference. Fullhead, bothhands, bothknees and bothfeet fullyinsideframe withsufficientmargin, correcthumananatomy, samebodyproportions, notglossyfitnessphotography. 
Composition: camera SIDEVIEW, woman facesLEFT, slightlyelevated enough to see far hand and far knee with a small naturaloffset; keep torso silhouette clear. FOURpoints ofsupport: twohands andtwoknees ONMAT. Palmsflat withfingersforward, naturalfivefingers eachvisiblehand. Knees underhips, handsundershoulders, elbowseasy, feetresting naturally behindknees topsdown. Show BOTHarms and BOTHlegs unmistakably and nofloatinghand/knee. Shirt loose but spinecurve stillreadable frombackcontour. FRAME2 of5, GENTLE COW. Starting fromfourpointtabletop, show ONLY A SMALL comfortablechange: chestglides slightlyforward, backgentlyconcave ratherthan deeplyarched, pelvis tilts gently. Neck stayslong, chin levelto slightlyforward, eyesopen gazing atmat aheadofhands withoutcrankingneck upward. Bothpalms andbothknees planted; no stretchingarmsforward, no raisinghand/leg. Curve mustbe visiblydifferent fromneutral but modest, no deepbackbend/exaggeratedribflare.
```

### Prompt 3

```text
Use case: scientific-educational. Asset: ONE individual teaching illustration for a Vietnamese yoga foundations mobile preview, Bò–Mèo (Cow–Cat) lesson. Input image is ONLY a reference for character identity, wardrobe, palette, watercolor texture and pencil linework. Make a NEW composition of this EXACT adult Vietnamese woman, realistic average build, blackhair lowbun, muted sage loose shortsleeve shirt, forestgreen loose trousers, barefeet. Do NOT keep standingpose or chair fromreference. Plain warmivory texturedpaper wall/floor, ONE terracotta rectangular yoga mat onflatfloor. Nochair, props, plants, labels, text, numerals, arrows, medical overlays, energy/breathsymbols, logos, watermark or multiplepanels. Wide landscape3:2, intended1536x1024. Calm editorial watercolor/finepencil samequality asreference. Fullhead, bothhands, bothknees and bothfeet fullyinsideframe withsufficientmargin, correcthumananatomy, samebodyproportions, notglossyfitnessphotography. 
Composition: camera SIDEVIEW, woman facesLEFT, slightlyelevated enough to see far hand and far knee with a small naturaloffset; keep torso silhouette clear. FOURpoints ofsupport: twohands andtwoknees ONMAT. Palmsflat withfingersforward, naturalfivefingers eachvisiblehand. Knees underhips, handsundershoulders, elbowseasy, feetresting naturally behindknees topsdown. Show BOTHarms and BOTHlegs unmistakably and nofloatinghand/knee. Shirt loose but spinecurve stillreadable frombackcontour. FRAME3 of5, PASSING THROUGH THE NEUTRAL MIDDLE. SideprofileLEFT, torso broadlyhorizontal, neutralback nearlystraight, necklong gazedownmat, neutralpelvis. This is the calm midpoint between a gentlyconcave Cow and gentlyroundedCat, NOTeitherextreme. Show thefullbody withhead,hands,knees,feet stillinsideframe; slightlycloserframing thanframe1but do NOTcrop. Space thefarhand andfarknee a littlebehind inperspective so allfourpointsreadclearly. No deepdip and no rounding. Eyesgentlyopen directeddown. Avoid an Scurvedback: use a readable broadlyflat neutralbackline.
```

### Prompt 4

```text
Use case: scientific-educational. Asset: ONE individual teaching illustration for a Vietnamese yoga foundations mobile preview, Bò–Mèo (Cow–Cat) lesson. Input image is ONLY a reference for character identity, wardrobe, palette, watercolor texture and pencil linework. Make a NEW composition of this EXACT adult Vietnamese woman, realistic average build, blackhair lowbun, muted sage loose shortsleeve shirt, forestgreen loose trousers, barefeet. Do NOT keep standingpose or chair fromreference. Plain warmivory texturedpaper wall/floor, ONE terracotta rectangular yoga mat onflatfloor. Nochair, props, plants, labels, text, numerals, arrows, medical overlays, energy/breathsymbols, logos, watermark or multiplepanels. Wide landscape3:2, intended1536x1024. Calm editorial watercolor/finepencil samequality asreference. Fullhead, bothhands, bothknees and bothfeet fullyinsideframe withsufficientmargin, correcthumananatomy, samebodyproportions, notglossyfitnessphotography. 
Composition: camera SIDEVIEW, woman facesLEFT, slightlyelevated enough to see far hand and far knee with a small naturaloffset; keep torso silhouette clear. FOURpoints ofsupport: twohands andtwoknees ONMAT. Palmsflat withfingersforward, naturalfivefingers eachvisiblehand. Knees underhips, handsundershoulders, elbowseasy, feetresting naturally behindknees topsdown. Show BOTHarms and BOTHlegs unmistakably and nofloatinghand/knee. Shirt loose but spinecurve stillreadable frombackcontour. FRAME4 of5, GENTLE CAT. Sameleftfacing sidecamera, fourpointstablebase onmat. Gentlyround the middleandupperback upward into a modest smoothcurve, pelvis tilts slightlyunder, belly softlydrawsin as naturally impliedbycurve, shouldersremainoverhands andkneesunderhips. Headfollows thenaturalcurve down veryslightly, neckrelaxed andlong, chin NOTjammedtochest, eyesgentlyopen lookingtowardmat. Show a clearlyroundedbackdifferentfromneutral andCow while keeping movementsmall andcomfortable. No deepcompression, no squattingback, no liftedhands/legs, no fiercelytuckedhead.
```

### Prompt 5

```text
Use case: scientific-educational. Asset: ONE individual teaching illustration for a Vietnamese yoga foundations mobile preview, Bò–Mèo (Cow–Cat) lesson. Input image is ONLY a reference for character identity, wardrobe, palette, watercolor texture and pencil linework. Make a NEW composition of this EXACT adult Vietnamese woman, realistic average build, blackhair lowbun, muted sage loose shortsleeve shirt, forestgreen loose trousers, barefeet. Do NOT keep standingpose or chair fromreference. Plain warmivory texturedpaper wall/floor, ONE terracotta rectangular yoga mat onflatfloor. Nochair, props, plants, labels, text, numerals, arrows, medical overlays, energy/breathsymbols, logos, watermark or multiplepanels. Wide landscape3:2, intended1536x1024. Calm editorial watercolor/finepencil samequality asreference. Fullhead, bothhands, bothknees and bothfeet fullyinsideframe withsufficientmargin, correcthumananatomy, samebodyproportions, notglossyfitnessphotography. 
Composition: camera SIDEVIEW, woman facesLEFT, slightlyelevated enough to see far hand and far knee with a small naturaloffset; keep torso silhouette clear. FOURpoints ofsupport: twohands andtwoknees ONMAT. Palmsflat withfingersforward, naturalfivefingers eachvisiblehand. Knees underhips, handsundershoulders, elbowseasy, feetresting naturally behindknees topsdown. Show BOTHarms and BOTHlegs unmistakably and nofloatinghand/knee. Shirt loose but spinecurve stillreadable frombackcontour. FRAME5 of5, RETURN AND FINISH IN NEUTRAL TABLETOP PAUSE. Distinct slightlyelevated THREEQUARTER SIDEVIEWfromfrontleft so botharmsandbothkneesareespeciallyclear, womanstillfacesLEFT. Fullbodyinsideframe, handsundershoulders, kneesunderhips, bothfeetrestingbehindknees. Broadlyflatneutralback, pelvisneutral, chinneitherliftednortucked, necklonggazedownatmat, eyesgentlyopen. Restingpause onallfourpoints, NOTsittingonheels, NOTchildpose, NOgettingup, NOsidehiptransfer, NOtwo-statecomposite. Slightlywiderframingthanframe3 toshowreturntostablebase. Sameidentity/styleproportions andwarmivorybackground.
```

