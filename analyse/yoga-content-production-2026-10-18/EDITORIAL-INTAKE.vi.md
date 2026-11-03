# Intake biên tập: toàn bộ nguồn yoga MCY

Ngày 18/10/2026, Asia/Bangkok. Phạm vi của tài liệu: kiểm kê nguồn local và nghiên cứu nguồn công khai chính thức cho việc sản xuất bản nháp. Không phải thẩm định yoga, không xác nhận tính phù hợp cho người mới, không xuất bản hoặc chứng nhận quyền hình/giọng/nội dung. Root phụ trách đồng bộ referenced UX chat; tài liệu này không tự tuyên bố đã đọc chat đó.

## Outcome, baseline và giới hạn

Yêu cầu mới của Owner là tiếp tục sản xuất nội dung cho tất cả tư thế và lưu trữ đồng bộ với task tối ưu UI/UX. Phạm vi sản xuất đề xuất mặc định là **toàn bộ inventory hiện có của MCY**, giữ đường mở rộng về sau. Không thể dùng “tất cả tư thế yoga” làm một tổng số hữu hạn đã xác định khi chưa chốt một danh mục bên ngoài.

Đã đọc `AGENTS.md`, lifecycle, hai skill MCY hiện tại và review matrix. Công việc intake là R0; hướng dẫn vận động/ảnh để dạy thuộc R3 và vẫn cần chuyên gia người thật độc lập. Checkout dirty nhiều luồng, nên chỉ tạo tài liệu này và một probe trích frame local trong thư mục gói; không sửa app/candidate UX/nguồn video/cloud. Root giữ phân công, freeze, QC và final verification.

Nguồn dữ liệu hiện tại:

- [Source canonical](../../src/courses/freeCourses.ts): SHA256 `92cfc2e572a9aa94abdce1843609634a536d80ee29eecb55d12d21ddfa9e5436`; 38 record/38 YouTube ID, gồm18 `gentle`,13 `poses`,7 `sequences`. Giữ `courseId + lessonId + youtubeId` làm source reference ổn định.
- [Inventory14/10](../ux-implementation-2026-10-14/content/clip-inventory.csv): SHA256 `c73611f48f7932775de4489f4ff477e3862aab09df027aacaca4bb92b4987fec`; rights/expertise/captions chưa xác minh và nội dung chưa review. Đây là metadata source, không phải transcript.
- [Inventory MOV27/09](../uiux-audit-2026-09-26/media-inventory-2026-09-27.csv):38 file local; read-only existence xác nhận lại18/10 tại `D:\nilaza\documents\Trị liệu`, `Tư thế lẻ`, `Tổng hợp tư thế cơ bản`. Các tên cũ có claim điều trị/cải thiện; chỉ giữ như provenance, không khôi phục làm copy người học.
- [Release gate lịch sử](../MCY_FREE_CONTENT_RELEASE_GATE_2026-09-29.md): ghi đã sửa swap19/21 và metadata YouTube38/38 đối chiếu30/09. Chênh duration giữa tên MOV27/09 và source hiện tại **không chứng minh source hiện tại bị swap**. Chưa có crosswalk file-byte → YouTubeID được xác minh trong lượt18/10; cần đối chiếu media thực tế trước reuse.
- Hai bản foundation `standing` và `tabletop`16/10 là bài chữ5 bước + ảnh AI draft. Chỉ `tabletop` cùng chủ đề với record27; chưa được coi là transcript clip27. `standing` không tự map sang24 vì đứng tĩnh khác chuyển tiếp đứng lên. `rest` còn concept.

**38 clip không phải38 tư thế độc lập.**13 record nhóm poses gồm hai Cobra, một cặp chuyển động Cat–Cow, một chuyển tiếp đứng lên và một số tên biến thể chưa xác định. Nhóm gentle chứa vận động/chủ đề chung;7 sequence chưa có breakdown. Chưa chốt được tổng pose thực sự khác nhau. Mọi bên trái/phải/đổi bên hiện là `unknown`, không sinh bản mirrored giả định.

## Coverage theo source record

`Định danh từ tên` dưới đây chỉ là hướng kiểm, không phải xác nhận đã xem clip. Các mã S dẫn tới nguồn ở phần sau. Không dùng bảng này để tự mở eligibility hoặc điền reviewed=true.

| ID / group | YouTube ID | Tên source hiện tại | Định danh từ tên / việc cần xác minh |
|---|---|---|---|
|01 gentle|yKm7aOAWn-k|Thư giãn nhẹ|Chưa biết posture; không mặc định Savasana.|
|02 gentle|mjxV5BTR5jA|Kéo giãn gân kheo nhẹ|Họ hamstring stretch; chưa biết nằm/ngồi/đứng, dụng cụ, bên. S04 chỉ là tham khảo.|
|03 gentle|8KKUtPicnX0|Chuyển động toàn thân|Chưa có breakdown; không dựng flow từ tên.|
|04 gentle|lJkD5OsUs4E|Chuyển động lưng dưới|Chưa biết dạng/biên độ/chuyển tiếp.|
|05 gentle|XPk59lYaNzU|Chuyển động lưng dưới · bài ngắn|Có thể cùng họ04 nhưng chưa đủ cơ sở gộp hoặc coi duplicate.|
|06 gentle|BSiC_g5FmRI|Chuyển động cổ và lưng trên|Họ neck/upper-back mobility; chưa biết cử động. S03 chỉ đối chiếu từ vựng.|
|07 gentle|I5pwMv2jYT4|Chuyển động cổ và lưng trên · bài ngắn|Cùng họ tên06; vẫn giữ record riêng đến khi so hình/audio.|
|08 gentle|OJEzzRobrWQ|Nhón gót đứng · bài thực hành chân|Standing heel/calf raise từ tên; xác minh có điểm tựa, một/hai chân, nhịp. S02.|
|09 gentle|Ie55V8b4sD4|Giãn cơ nhẹ|Chưa biết vùng/posture; không gán một stretch cụ thể.|
|10 gentle|GQrO8VFJhss|Chuyển động nhẹ toàn thân|Không coi duplicate03/13 từ tên chung.|
|11 gentle|uLVYaURNcsM|Chuyển động vùng cổ|Chưa biết rotation/tilt/retraction; S03 chỉ tham khảo.|
|12 gentle|Gc8zn8NcCVk|Chuyển động hông và chân|Chưa biết posture/chuyển động/bên; không suy từ tên cũ.|
|13 gentle|CVjhYYhpn3o|Chuyển động nhẹ toàn thân|Tên chung; giữ riêng10/03.|
|14 gentle|_DttB5pLYjk|Mở vai khi nằm nghiêng|Side-lying shoulder movement từ tên, chưa chốt open-book hay dạng khác.|
|15 gentle|-o-0h5H0_2I|Chuyển động cột sống|Chưa biết flexion/extension/rotation; không gộp27.|
|16 gentle|NxSbVNT_D-Y|Lăn lưng với vòng|Có dụng cụ vòng theo tên; cần clip/giáo viên xác định loại vòng, tải trọng, vào/ra. Chưa có nguồn chính thức đủ khớp.|
|17 gentle|67PlLgpEpnU|Chuyển động nhẹ · bài17|Tên chưa mô tả động tác; identity blocker.|
|18 gentle|DLnOXS8BgJw|Chuyển động nhẹ · bài18|Tên chưa mô tả động tác; identity blocker.|
|19 poses|McOZ1FW5jBM|Quỳ gối ngả sau|Không tự gán Ustrasana: có thể camel, kneeling lean-back hoặc biến thể khác. S13 chỉ dùng nếu media xác nhận camel.|
|20 poses|54IPJkU7f_o|Rắn hổ mang · phiên bản nhẹ|Cobra family theo tên; phải xác minh pelvis/legs/arms, không tự đồng nhất Sphinx. S05.|
|21 poses|KtMlgK2cjsU|Rắn hổ mang|Cobra family theo tên; tách variant với20. S05.|
|22 poses|0fs1LCnK3-U|Quạ thấp|Không tự khóa Kakasana/Bakasana: cần biết điểm tựa chân/đầu/gối, khuỷu và có bay chân. S06 là họ tham khảo.|
|23 poses|p3sKiK8szF8|Hoang dã cao|Tên gợi Wild Thing nhưng chưa xác nhận so với Flip Dog/biến thể khác. S07.|
|24 poses|DOmYgUoQyZI|Đứng lên, giữ lưng thẳng|Transition từ vị trí nào chưa rõ; không gán Tadasana hoặc sit-to-stand từ tên.|
|25 poses|CwhLdstN0dc|Chó úp mặt · biến thể V ngược|Downward Dog family theo tên; xác minh gối/gót/tay, vào/ra, nhịp. S08.|
|26 poses|oFWjSKxXvKY|Trường tấn cao|High Lunge family theo tên; xác minh chân sau/tay/bên/chuyển vào. S09.|
|27 poses|rWl5ySBsrG0|Bò mèo|Cat–Cow movement pair theo tên; không tách thành hai lesson độc lập mặc định. S01.|
|28 poses|6Y-eWBnD8r8|Bánh xe thấp|Không tự đồng nhất Bridge/Wheel/forearm wheel; phải biết điểm tựa tay/cẳng tay/đầu. S10 chỉ họ Wheel.|
|29 poses|wnenFwBE5oY|Đầu bò|Cow Face family theo tên; cần xác minh chỉ tay hay cả chân, thứ tự đổi bên/strap. S11.|
|30 poses|wYiSFpP7vjs|Chó ba chân|Three-legged Downward Dog family theo tên; xác minh hông cân/mở, gối gập/duỗi và bên. S08.|
|31 poses|gkiWrw9hREU|Chiến binhII|WarriorII family theo tên; cần xác minh bên, thứ tự vào/ra, tay/gối. S12.|
|32 sequences|6DwXHdN_ccg|Chuỗi tư thế cơ bản · bài32|Thành phần/thứ tự/chuyển tiếp/bên chưa annotation.|
|33 sequences|f7UfRc4TKdM|Chuỗi tư thế cơ bản · bài33|Không suy progression từ số33.|
|34 sequences|ZV-eHhsNlgo|Chuỗi tư thế cơ bản · bài34|Thành phần chưa xác định.|
|35 sequences|npBdMvsuIto|Chuỗi tư thế cơ bản · bài35|Thành phần chưa xác định.|
|36 sequences|jgQLZsoIDKc|Chuỗi tư thế cơ bản · bài36|Thành phần chưa xác định.|
|37 sequences|rSOEcU1xGYA|Chuỗi tư thế cơ bản · bài37|Thành phần chưa xác định.|
|38 sequences|AfMciZa5npw|Chuỗi tư thế cơ bản · bài38|Thành phần chưa xác định.|

Các nhóm trùng tên cần so sánh, không deduplicate tự động:03/10/13;04/05;06/07;20/21.07/06 có thể cùng họ nhưng khác phiên bản, duration hoặc audio.27 là movement pair nên không cộng “Cat” và“Cow” vào tổng clip.30 là variant của Downward Dog25, không phải cùng media. Sequence32–38 có thể lặp các pose trước nhưng phải có quan hệ `contains` theo timestamp sau khi xem; không sao chép nội dung toàn pose thành7 bản khác.

## Source map phục vụ bản nháp

Đã mở các trang dưới đây bằng web ngày18/10/2026. Dùng để đối chiếu thuật ngữ, cấu trúc cue và câu hỏi review, không sao chép ảnh/video hoặc hướng dẫn dài. Không có permission tái phân phối được suy từ việc truy cập công khai. Không bê nhãn cấp độ, lợi ích y khoa, số nhịp hay hướng dẫn xử lý chấn thương của một nguồn vào MCY như kết luận riêng cho người học.

| Mã | Nguồn primary / đơn vị xuất bản | Dùng cho intake | Giới hạn |
|---|---|---|---|
|S00|[NCCIH: Yoga—Effectiveness and Safety](https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety)|Khung yêu cầu hướng dẫn có chuyên môn và điều chỉnh theo cá nhân.|Không phải xác nhận từng pose/ảnh MCY hoặc clearance sức khỏe.|
|S01|[Mayo Clinic: Cat/cow pose](https://www.mayoclinic.org/healthy-lifestyle/stress-management/multimedia/cat-cow-pose/vid-20453581)|27; so cấu trúc all-fours, hai pha, chuyển lại.|Không xác nhận clip27; không chép cue thành transcript.|
|S02|[NHS: Strength exercises](https://www.nhs.uk/live-well/exercise/strength-exercises/)|08; từ vựng heel raise/điểm tựa và chuyển động có kiểm soát. Có sit-to-stand để đối chiếu nếu24 thực sự là ngồi–đứng.|Không tự map24; không import liều tập từ nguồn.|
|S03|[NHS: Flexibility exercises](https://www.nhs.uk/live-well/exercise/flexibility-exercises/)|06/07/11 nếu media cho thấy rotation/tilt; ngôn ngữ comfort-range.|Tên“vùng cổ” chưa đủ quyết định là cử động nào.|
|S04|[NHS: How to stretch after exercising](https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/)|02; phân biệt hamstring stretch nằm với dạng khác.|Không lấy hình minh họa NHS vào gói; không khẳng định clip giống nguồn.|
|S05|[YogaEasy: Cobra Pose](https://www.yogaeasy.com/artikel/cobra-pose)|20/21; thuật ngữ Bhujangasana, khác biệt mức nâng, trục cổ, ra tư thế.|Variant exact và phạm vi phải do reviewer MCY xác nhận.|
|S06|[YogaEasy: Crow Pose](https://www.yogaeasy.com/artikel/crow-pose)|22; arm-balance family, điểm tựa và weight shift cần kiểm.|Nguồn gọi Crow/Bakasana; không coi tên Sanskrit dùng thống nhất mọi trường phái.|
|S07|[YogaEasy/Jennilee Toner:9 steps into Wild Thing](https://www.yogaeasy.com/artikel/9-steps-into-wild-thing)|23; phân biệt shape với đường vào/ra và năng lực shoulder-support.|Không biến article sequence thành flow MCY hoặc gọi“cao”là cấp độ.|
|S08|[YogaEasy: Downward Dog Pose](https://www.yogaeasy.com/artikel/downward-dog-pose)|25/30; Downward Dog và three-legged variation, kiểm hông/điểm tựa khác nhau.|Tên30 chưa xác nhận hip-opener hay hips-level.|
|S09|[YogaEasy: Crescent Pose/High Lunge](https://www.yogaeasy.com/artikel/crescent-pose-high-lunge)|26; high-lunge family, chân trước/sau, chọn đường vào.|Tên Sanskrit High Lunge khác giữa nguồn; ưu tiên tên tiếng Việt rõ và variant fields.|
|S10|[YogaEasy: Upward Bow or Wheel Pose](https://www.yogaeasy.com/artikel/upward-bow-or-wheel-pose)|28 nếu media là Wheel; câu hỏi head/hand/forearm-support và vào/ra.|“Bánh xe thấp”chưa được phép khóa thành đúng pose này.|
|S11|[YogaEasy: Cow Face Pose](https://www.yogaeasy.com/artikel/cow-face-pose)|29; phân biệt arms-only với kết hợp chân, sides và props.|Không suy mọi người phải móc hai bàn tay hoặc chồng gối.|
|S12|[YogaEasy: Warrior2 Pose](https://www.yogaeasy.com/artikel/warrior-2-pose)|31; terminology VirabhadrasanaII, chân trước/sau, quay đổi bên.|Không copy một góc/số nhịp như quy tắc chung mọi cơ thể.|
|S13|[YogaEasy: Camel Pose](https://www.yogaeasy.com/artikel/camel-pose)|19 chỉ nếu frame/audio xác nhận camel family.|Hiện vẫn conditional, không đủ để đổi title thành Ustrasana.|

YogaEasy là nguồn giảng dạy trực tiếp, dùng đối chiếu nội dung của chính họ; không phải cơ quan chứng nhận MCY. URL pose library EkhartYoga cũ đã chuyển hướng sang YogaEasy trong lượt kiểm18/10; dùng URL đích ở bảng để tránh citation dẫn trang index chung. Những nguồn Yoga Journal/Art of Living/search results khác không được dùng làm căn cứ final của intake này.

## Nhóm sản xuất đề xuất

Đây là nhóm vận hành theo độ đầy đủ bằng chứng, **không phải giáo trình theo độ khó** hay lộ trình người học phải đi lần lượt.

1. **Bao phủ nguồn:** tạo đủ38 source records giữ IDs/group/duration/captions/source status; bổ sung `identityStatus`, `contentObserved`, evidence refs và blockers. Không gọi38 record là38 bài hoàn tất.
2. **Giữ foundation độc lập:** nhập nguyên trạng hai draft `standing`/`tabletop` với revision, AI provenance và alt đúng pixels; `tabletop →27` chỉ `topic_reference`; `standing`không có exact-video binding. Không biến concept`rest`thành approved lesson.
3. **Pose families có tên tương đối rõ:**20/21/25/26/27/29/30/31. Có thể chuẩn bị outline/source questions sớm; cues và ảnh cuối phải theo exact variant xác minh, từng bên, chuyển vào/ra. Nhóm này8 source record, không mặc định8 unique pose.
4. **Pose/transition cần xác minh ưu tiên:**19/22/23/24/28. Giữ metadata và image/cue brief có câu hỏi; chốt identity/điểm tựa trước khi tạo ảnh instructional hoặc dựng5 bước tự tin.
5. **Movement record có tên vùng/cử động:**02/06/07/08/11/12/14/15/16. Xem/trình bày từng clip, không mở rộng thành phác đồ theo vùng đau hay phục hồi.
6. **Gentle còn mô tả chung:**01/03/04/05/09/10/13/17/18. Annotation first: tất cả posture, timestamp, cử động, bên, dụng cụ, lời nói; sau đó chọn unit canonical hoặc chỉ source record.
7. **Sequence32–38:** annotation thành phần và chuyển tiếp đầy đủ; liên kết canonical unit nếu thực sự giống; giáo viên chịu trách nhiệm nhận định có đủ mở–chính–kết hay chỉ clip minh họa. Không cộng thời lượng video ngắn để suy duration buổi tập.

Mỗi nội dung cuối cần entry/exit/alternatives/stop cues, nguồn và cue-review riêng, cùng manifest bytes media và quyền. Không ép mỗi movement/sequence vào5 bước nếu làm mất chuyển tiếp. Chưa đủ nguồn thì field cụ thể để null+blocker; không gắn ảnh cùng nhóm làm placeholder giả đúng posture.

## Media inspection18/10 và kết quả kỹ thuật

- PASS: liệt kê38 MOV thật trong ba thư mục local đã nêu; không copy/đổi file gốc. Không đọc tài khoản/inbox/token và không kiểm remote playback.
- BLOCKED: chưa xem trọn38 MOV, chưa nghe/transcribe audio, chưa chốt sides hoặc exact identity. Không gọi metadata/open web là đã xem video.
- PATH decoder: không có ffmpeg/ffprobe trên PATH/bundled deps, bundled Python có PIL/numpy nhưng không cv2/av/imageio. Probe Windows Runtime `extract-local-frame.ps1` đọc thử riêng`Quạ thấp.mov`và dự định ghi`crow-probe.jpg`; đầu tiên sandbox từ chối, một automatic review timeout, lần retry được chạy nhưng COM collection binding trong PowerShell thất bại trước khi tạo frame. Đây là lỗi công cụ local, không phải verdict nội dung; **chưa có frame** để dựa vào.
- Không cài dependency, không tải/mirror video YouTube, không upload nội dung, không AI generation, không thực hiện review/assignment/publish. Script probe là hỗ trợ nghiên cứu đang FAIL, không nằm trong runtime hoặc được coi là pipeline đã sẵn sàng.

## Acceptance và handoff

Intake hoàn tất khi root đối chiếu bảng38 source IDs với source canonical, đọc source map và giữ đúng các unknowns. Gói sản xuất có thể tiếp tục công việc độc lập như schema/crosswalk/provenance/import draft; phần identity có điều kiện cần media inspection thực tế trước cue/photo instructional mới. Root final/QC độc lập và chuyên gia yoga vẫn là các việc riêng.

Rollback local: bỏ qua package mới, không sửa hoặc thay thế các draft16/10, source38 và candidate UX. Không có migration, deploy, native install/launch, rights declaration hoặc gate release được thực hiện bởi intake này.

## Bổ sung đường xem media local —18/10

Theo phân công tiếp của root, đã thử lấy decoder `imageio-ffmpeg==0.6.0` từ đúng PyPI vào thư mục `tools/` riêng. Sandbox DNS thất bại; download ngoài sandbox quá chậm, hai tiến trình pip được dừng có kiểm soát trong chính session. Một lần tải16byte-ranges của cùng wheel có pin size/SHA256 công bố trên [PyPI metadata](https://pypi.org/pypi/imageio-ffmpeg/0.6.0/json) đã dừng với timeout240giây. Wheel chưa tải đủ/chưa xác minh/chưa cài; không thực thi binary tải dở. Các script/partial-download chỉ là bằng chứng công cụ, không thuộc learner package.

Fallback local đã chuẩn bị: `serve-private-pose-review.mjs` chỉ phục vụ đúng13MOVnhóm“Tư thế lẻ”quaGET/HEAD, chỉ bind`127.0.0.1:4318`; không directory listing, không upload, không đọc dataset khác. Trang`/review?pose=0..12` có4video với fragmenttimestamp yêu cầu, cho browser decode và root kiểm pixels. Đã dừng session server sandbox không truy cập được từ host và khởi động host-only session mới. Không dùng sourcevideo như ảnh có quyền hoặc đưa vào public/assets.

Kiểm protocol host PASS6cases: trang200;videoHEAD200;range206và64bytekhớp filegốc;unknownID404;POST405;traversal404. SyntaxNodePASS. **Kiểm browser/pixels vẫn BLOCKED(unrun) tại thời điểm bổ sung này** vì subagent không cóCUA; root cần xác nhậnvideo decode/currentTime và chụp bằng browser trước khi bảng identity được nâng khỏi metadata-only. Thay đổi hạ tầng xem local không tự đóng review chuyên môn/quyền.
