"""One-time authoring helper. The emitted unit JSON files are canonical; do not rerun over edits."""
from pathlib import Path
import hashlib, json

BASE=Path(__file__).resolve().parent
REPO=BASE.parent.parent
LIB=REPO/'content/yoga-library'
TEMPLATE=json.loads((BASE/'UNIT-TEMPLATE.json').read_text(encoding='utf-8'))
INITIAL=json.loads((BASE/'SOURCE-OBSERVATIONS.json').read_text(encoding='utf-8'))
SUPP=json.loads((BASE/'SOURCE-OBSERVATIONS-supplement.json').read_text(encoding='utf-8'))
OBS_INITIAL='analyse/yoga-content-production-2026-10-18/SOURCE-OBSERVATIONS.json'
OBS_SUPP='analyse/yoga-content-production-2026-10-18/SOURCE-OBSERVATIONS-supplement.json'

STYLE='Ảnh AI dự kiến, một ảnh riêng 3:2 ngang, phong cách foundation: nhân vật hư cấu trưởng thành áo olive, quần kem, thảm sage, phòng nền kem và ánh sáng tự nhiên. Không dùng hình hoặc gương mặt giáo viên trong video gốc làm reference; không chữ, mũi tên hay montage. '
GATE=' Chưa sinh ảnh. Chuyên gia phải chốt exact variant, bên, điểm chịu lực và framing trước khi tạo; kiểm giải phẫu và alt/caption theo pixels ảnh cuối. Đây là hình để đọc/quan sát, không phải một bước chuyển để người xem tự thực hiện.'

specs=[
 {
  'slug':'kneeling-backbend','id':'mcy.pose.kneeling-backbend','legacy':'19','youtube':'McOZ1FW5jBM','index':8,
  'title':'Quỳ gối ngả sau · nhận biết nền đỡ bất đối xứng','short':'Quỳ gối ngả sau',
  'intro':'Một hình ngả sau khi quỳ có thể dùng hai tay ở gót, một tay trên sàn hoặc một cách đỡ khác. Bài đọc này giúp nhận ra hình đang quan sát trước khi học đường chuyển với giáo viên.',
  'scope':'Chỉ đọc và nhận biết biến thể quỳ ngả sau với một lòng bàn tay trên sàn, tay kia qua đầu đã thấy trong hai khung MOV local. Không đồng nhất với Camel hai tay nắm gót. Không hướng dẫn tự vào/ra, chuyển tải trọng hoặc ngả cổ; các phần thực hành đó đang bị chặn chờ chuyên gia.',
  'objectives':['Nhận ra đầu gối/cẳng chân và một tay tạo nền khác với tư thế đứng ngả sau.','Phân biệt tay chống với tay đang vươn qua đầu.','Biết những thông tin còn thiếu trước khi học đường vào và trở về.'],
  'sourceTitle':'YogaEasy — Camel Pose','sourceUrl':'https://www.yogaeasy.com/artikel/camel-pose',
  'sourceUse':'Chỉ đối chiếu họ kneeling backbend và yêu cầu chuẩn bị/đường trở về trong tài liệu giảng dạy. Nguồn mô tả Camel; không dùng nó để gán tên hoặc cung cấp entry cho biến thể một tay chống sàn của MOV local.',
  'obsNotes':'Chỉ initial capture cột1 tại7.269s và cột2 tại16.961s có hình. Cột1: hai gối/cẳng chân trên thảm, một tay chống sàn, thân ngả sau và tay kia qua đầu; cột2: ngồi gần gót, thân dựng, hai tay mở. Supplement của file này đen cả4cột. Không xem toàn clip/audio, không xác định bên hay tải lên cổ.',
  'times':[7.269,16.961], 'evidence':OBS_INITIAL,
  'specialBlocker':'Chưa xác lập đường chuyển giữa ngồi/quỳ và ngả sau một tay, bên thực hiện, vị trí tay chống và tải trên vai/cổ. Không mở thực hành từ hai ảnh tĩnh.',
  'steps':[
   ('Gọi đúng hình đang xem','Hình được quan sát có hai đầu gối trên thảm và một tay chống sàn. Đó là nền khác với một người đứng ngả sau, dù cả hai hình đều mở phần trước thân.','Tên Quỳ gối ngả sau ở đây là tên chủ đề. Chưa chốt tên Sanskrit hoặc gọi hình này là Camel tiêu chuẩn.',['pose-source'],'Góc nghiêng toàn thân của đúng biến thể quỳ một tay chống sàn và tay kia qua đầu; chỉ lập hình sau khi chuyên gia chốt bàn tay, hai gối, cẳng chân và đầu rõ ràng. Không thay bằng Camel nắm gót.'),
   ('Nhìn nền quỳ trước','Dõi theo hai đầu gối và phần cẳng chân tiếp xúc thảm. Những điểm này giúp người đọc phân biệt nền quỳ với nền hai bàn chân.','Ảnh không cho biết cảm giác ở đầu gối hoặc cách đặt đệm của một người cụ thể. Không cần quỳ xuống để kiểm xem mình có giống hình không.',['pose-source','safety'],'Góc thấp nghiêng ba phần tư tập trung từ hông tới hai gối/cẳng chân của biến thể đã chốt, giữ đủ tay chống trong khung để nền đỡ không bị hiểu nhầm; không thêm gối/đệm chưa được reviewer chọn.'),
   ('Tách hai vai trò của tay','Một bàn tay đang ở sàn, còn cánh tay kia đi qua phía trên đầu. Hai tay không làm cùng một việc trong hình này.','Góc chụp chưa cho biết lực dồn vào tay chống bao nhiêu. Không suy ra rằng cứ đặt một tay phía sau là có thể ngả người tới hình.',['pose-source','safety'],'Góc sau ba phần tư của vai và hai cánh tay trong exact variant; thấy rõ một lòng bàn tay với sàn và tay tự do qua đầu, cổ/đầu không bị cắt. Không xoắn thêm thân để làm ảnh đẹp.'),
   ('Đọc đường cong cùng nền đỡ','Nhìn thân ngả sau trong quan hệ với nền quỳ và bàn tay, thay vì chỉ nhìn cằm hay độ cao của ngực. Một khung tĩnh không kể lại lúc chuyển tải trọng.','Mẫu còn thiếu đường vào, cách trở về và lựa chọn khi không thoải mái. Những khoảng trống ấy cần giáo viên giải thích, không được lấp bằng một cú ngả sâu hơn.',['pose-source','safety'],'Góc nghiêng rộng cho thấy trọn đầu, thân, tay chống và nền quỳ, độ ngả do chuyên gia quyết định; không cận mặt ngửa cổ, không cắt điểm tựa. Không minh họa thêm bước vào/ra chưa review.'),
   ('Dừng ở câu hỏi cần được hướng dẫn','Trước khi muốn học động tác, hãy có câu trả lời rõ: bắt đầu từ đâu, tay nào làm nền, trở về bằng cách nào và có thể chọn cách khác nào. Bài đọc này chưa cung cấp những chỉ dẫn thực hành đó.','Bạn đã hoàn thành việc nhận biết một biến thể. Có thể khép bài ngay tại đây; đọc xong không phải là đã thực hiện tư thế.',['pose-source','safety','stop-source'],'Cùng nhân vật ở tư thế nghỉ ngồi quen thuộc đã được chốt, tay thả tự nhiên, đang xem lại nội dung trên thiết bị; bối cảnh thảm và ánh sáng nhất quán. Đây là kết thúc phần đọc, không phải minh họa cách thoát khỏi backbend.'),
  ],
 },
 {
  'slug':'low-crow','id':'mcy.pose.low-crow','legacy':'22','youtube':'0fs1LCnK3-U','index':7,
  'title':'Quạ thấp · phân biệt tay chống và cẳng tay','short':'Quạ thấp',
  'intro':'Tên Quạ thấp chưa cho biết người tập đang chống trên bàn tay hay cẳng tay. Bài đọc đặt hai hình cạnh nhau bằng lời để giúp nhận ra sự khác biệt về nền đỡ, không biến chúng thành một progression để tự thử.',
  'scope':'Chỉ quan sát Crow-like arm balance và một biến thể hạ khuỷu/cẳng tay xuất hiện trong hai frame local. Chưa xác định tải trên đầu hoặc đường chuyển giữa hai hình. Không dạy nhấc chân, hạ đầu, đổ người hoặc vào/ra arm balance; mọi thực hành đó chờ chuyên gia.',
  'objectives':['Nhận ra hai cách chống tay khác nhau trong nguồn local.','Phân biệt đầu gần sàn với khẳng định đầu đang chịu lực.','Không dùng việc nhấc cả hai chân làm điều kiện hoàn tất bài đọc.'],
  'sourceTitle':'YogaEasy — Crow Pose','sourceUrl':'https://www.yogaeasy.com/artikel/crow-pose',
  'sourceUse':'Đối chiếu Crow family, bàn tay/khuỷu/gối và việc dịch trọng lượng là một kỹ năng cần hướng dẫn. Nguồn không được dùng làm recipe cho biến thể forearm/head-low của MOV local; không gán Bakasana/Kakasana cho cả hai hình.',
  'obsNotes':'Supplement cột2 tại13.401s thấy knees-near-upper-arms, khuỷu gập, chân nhấc; cột3 tại21.059s thấy thân/đầu hạ thấp, khuỷu/cẳng tay tới sàn và chân vẫn nhấc. Hai cột còn lại đen. Initial screenshot7 lỗi layout, không có frame sử dụng được. Không xác định bên, head contact/load, nhịp hay full transition.',
  'times':[13.401,21.059], 'evidence':OBS_SUPP,
  'specialBlocker':'Chưa có review điểm chịu lực trên bàn tay/cẳng tay/đầu và đường vào, đường trở về hoặc hỗ trợ khi mất vững. Không dạy forearm/head-low arm balance từ stills.',
  'steps':[
   ('Nhận ra hai hình khác nhau','Một khung local có thân được giữ trên bàn tay với khuỷu gập; khung khác hạ phần tay và đầu xuống rất thấp. Không đọc hai hình như cùng một nền đỡ.','Từ Quạ thấp chưa đủ để chốt tên chuyên môn của từng biến thể. Trong bài này, tên ngắn không thay cho mô tả điểm tiếp xúc.',['pose-source'],'Ảnh riêng của Crow-like shape đã được chuyên gia chốt, góc nghiêng thấy đủ hai lòng bàn tay, khuỷu, gối và hai chân; không đầu chạm sàn. Không dùng ảnh này đại diện cho forearm-low variant.'),
   ('Theo dõi phần tay gần sàn','Ở hình Crow-like, bàn tay là điểm cần nhìn rõ. Ở khung thấp hơn, khuỷu/cẳng tay tiến tới sàn nên cách đọc nền phải thay đổi.','Ảnh mới chỉ được dựng sau khi người duyệt xác nhận từng đoạn tay nào chạm thảm. Không ghép bàn tay của hình này với thân của hình kia.',['pose-source','safety'],'Ảnh riêng của đúng low variant sau khi reviewer xác minh cẳng tay/bàn tay; góc thấp rộng đủ thấy toàn bộ upper-body và nền đỡ. Không tạo một cấu trúc lai tay/cẳng tay chưa được chốt.'),
   ('Không đoán tải trên đầu','Đầu gần sàn không tự chứng minh đầu được phép làm điểm chịu lực. Một ảnh bên ngoài không cho biết cách người tập phân bố lực hoặc kiểm soát cân bằng.','Bài đọc không hướng dẫn hạ đầu hay thử tì đầu để tìm hình. Đây là khoảng thông tin phải được giải thích trực tiếp trước bất kỳ phần thực hành nào.',['pose-source','safety'],'Góc nghiêng upper-body của exact low variant, đầu/cổ và tay đều đủ trong khung để chuyên gia kiểm contact. Identity blocked: tuyệt đối không sinh head-bearing pose khi tải trên đầu/cổ chưa xác minh; không diễn tả động tác hạ đầu.'),
   ('Bỏ mục tiêu phải nhấc chân','Trong hai mẫu đã thấy có chân rời sàn. Điều đó mô tả hình của người trong nguồn, không phải một nhiệm vụ hay thước đo tiến bộ dành cho bạn.','Nhìn đồng thời gối, khuỷu và thân để hiểu hình là đủ cho bước đọc này. Không chuyển trọng lượng về trước hoặc nhấc chân theo một ảnh đơn.',['pose-source','safety'],'Góc ba phần tư toàn thân của một biến thể đã chốt, làm rõ quan hệ gối với tay và chân, không crop chân để giả đang bay. Không tạo cặp trước/sau hoặc mũi tên gợi người xem nhấc chân.'),
   ('Chốt điều chưa có trong bài','Cách vào, cách trở về và cách được hỗ trợ khi mất vững đều chưa có hướng dẫn thực hành được duyệt. Nếu muốn học kỹ năng này, hãy bắt đầu bằng trao đổi với giáo viên thay vì thử nối hai ảnh.','Bạn có thể kết thúc phần đọc ngay khi nhận ra sự khác biệt giữa hai nền đỡ. Không cần chứng minh bằng việc giữ một hình trên tay.',['pose-source','safety','stop-source'],'Cùng nhân vật ngồi nghỉ cạnh thảm, tay không chống tải, đang đọc hoặc trao đổi ngoài khung; không có người hỗ trợ kéo/nâng cơ thể. Khung kết thúc là nghỉ đọc, không phải exit arm balance.'),
  ],
 },
 {
  'slug':'wild-thing-high','id':'mcy.pose.wild-thing-high','legacy':'23','youtube':'p3sKiK8szF8','index':6,
  'title':'Hoang dã cao · nhìn rõ ba điểm tựa','short':'Hoang dã cao',
  'intro':'Một hình mở ngực lớn có thể khiến ta chỉ chú ý tới cánh tay đang vươn. Bài đọc kéo sự chú ý trở về bàn tay và hai bàn chân đang tạo nền, rồi phân biệt hình đích với đường chuyển chưa được thấy.',
  'scope':'Chỉ đọc Wild-Thing/flipped-dog family được quan sát trong một frame local: một tay và hai bàn chân ở sàn, thân ngả mở. Không hướng dẫn flip từ Chó ba chân, Side Plank, nhấc hông hoặc chuyển sang Wheel; entry/exit và exact variant chờ chuyên gia.',
  'objectives':['Nhận ra tay chống khác tay tự do.','Đọc hai bàn chân và phần thân trong cùng một hình.','Hiểu một ảnh đích không cung cấp đường vào hoặc cách quay lại.'],
  'sourceTitle':'YogaEasy / Jennilee Toner — 9 steps into Wild Thing','sourceUrl':'https://www.yogaeasy.com/artikel/9-steps-into-wild-thing',
  'sourceUse':'Đối chiếu Wild Thing family, nền một tay và yêu cầu chuẩn bị/kiểm soát đường chuyển. Không sao chép chuỗi9bước, bài warm-up, lật người hoặc lời hứa injury-free; không mặc định đúng exact variant của nguồn local.',
  'obsNotes':'Chỉ supplement cột3 tại28.824s có pose pixels, loading spinner phủ một phần. Thấy một lòng bàn tay và hai bàn chân ở sàn, cả hai gối có vẻ gập, thân/chest mở lên và tay tự do vươn về sau/qua đầu. Các cột khác đen. Không thấy entry/exit, bên hay lực trên từng chân/tay.',
  'times':[28.824], 'evidence':OBS_SUPP,
  'specialBlocker':'Một frame đích không xác minh chuẩn bị vai/cổ tay, bên, chuyển vào/ra hoặc cách phân phối lực. Không có hướng dẫn thực hành lật người hoặc chuyển sang Wheel.',
  'steps':[
   ('Tìm nền trước cánh tay vươn','Trong mẫu được quan sát, một bàn tay và hai bàn chân ở sàn. Cánh tay còn lại vươn ra xa không phải là toàn bộ câu chuyện của tư thế.','Hãy đọc hình từ các điểm tiếp xúc rồi mới tới phần thân. Tên Hoang dã cao chưa nói cách người tập đã chuyển tới đây.',['pose-source'],'Ảnh toàn thân ba phần tư của đúng variant một tay/hai chân được chuyên gia chốt, nhìn rõ cả ba điểm tiếp xúc. Không thay bằng Full Wheel hai tay hoặc biến thể một chân trên không.'),
   ('Phân biệt tay chống với tay tự do','Bàn tay ở sàn có quan hệ trực tiếp với vai phía trên nó. Tay tự do đang mở ra ngoài có vai trò khác trong hình bất đối xứng này.','Góc chụp không đo được lực trên cổ tay hoặc vai. Không cần chống một tay xuống để tự kiểm xem vai mình có làm được như ảnh hay không.',['pose-source','safety'],'Góc nghiêng gần phần tay chống/vai nhưng giữ cả thân và chân trong khung để không mất nền đỡ; tay tự do hiện rõ, không cắt bàn tay. Không thêm xoay sâu hoặc collapse vai vì hiệu ứng ảnh.'),
   ('Giữ hai bàn chân trong cách đọc','Hai bàn chân trong frame local không được xem là một chi tiết trang trí. Quan sát cả hai chân giúp thấy nền của hình mở ngực này khác với tư thế quỳ ngả sau.','Mẫu một góc chưa cho biết chân nào nhận nhiều lực hơn hoặc các bước chân trước đó. Bài đọc không yêu cầu bạn xếp chân theo ảnh.',['pose-source'],'Góc thấp ba phần tư tập trung hai bàn chân/gối của exact variant, còn thấy bàn tay chống và thân để đúng ngữ cảnh. Bên và vị trí gót/mũi chân chờ chuyên gia chốt; không suy từ ảnh mirrored.'),
   ('Tách hình đích khỏi đường chuyển','Hình mở ngực chỉ cho thấy một thời điểm. Nó chưa kể cách thân xoay, khi nào tay/chân đổi nhiệm vụ hoặc làm sao trở về có kiểm soát.','Không nối hình này với Chó ba chân hoặc Side Plank để tự tạo một cú lật. Tài liệu giảng dạy tham khảo cũng xem đường chuyển và chuẩn bị là phần riêng cần được hướng dẫn.',['pose-source','safety'],'Góc nghiêng toàn thân khác khung1, mô tả hình đã đứng yên theo variant được duyệt; không sequence montage, không xoay/lật đang diễn ra, không chữ chỉ đường chuyển sang Chó ba chân hoặc Wheel.'),
   ('Chọn bước tiếp là hỏi rõ','Nếu muốn học tư thế, những câu hỏi tiếp theo là về nền tay/chân, chuẩn bị, đường vào, đường trở về và lựa chọn khác. Tất cả phần thực hành đó còn chờ hướng dẫn chuyên môn.','Bạn có thể chỉ dừng ở việc nhận ra một nền bất đối xứng. Đọc xong không yêu cầu ngả sâu hơn hoặc hoàn thành một cú lật.',['pose-source','safety','stop-source'],'Cùng nhân vật ngồi nghỉ cạnh thảm, tay nghỉ trên đùi, đang xem lại nội dung trên thiết bị; không dựng exit từ Wild Thing. Khung yên, ánh sáng và trang phục nhất quán.'),
  ],
 },
 {
  'slug':'stand-up','id':'mcy.transition.stand-up','legacy':'24','youtube':'DOmYgUoQyZI','index':5,
  'title':'Đứng lên · đọc chuyển động qua nền chân','short':'Đứng lên',
  'intro':'Thấy một khung người đang gập và một khung đứng chưa cho biết đoạn chuyển giữa chúng diễn ra thế nào. Bài đọc giúp tách nền chân, đầu gối và thân, thay vì hiểu “lưng thẳng” là một hình phải cố giữ bằng mọi giá.',
  'scope':'Bài đọc quan sát chủ đề chuyển tới đứng. Hai frame local thấy một người đứng/vươn tay và một montage so sánh thân gập; các đoạn giữa chưa có pixels. Không xác nhận video là sit-to-stand, Tadasana hay một quy trình fold-to-stand đầy đủ. Không chỉ dẫn tự đứng dậy từ gập hoặc từ sàn; entry/exit chờ chuyên gia.',
  'objectives':['Phân biệt tư thế đứng với một quá trình chuyển tới đứng.','Nhìn nền chân và quan hệ gối–hông–thân khi đọc hình.','Không tự nối các khung thiếu thành hướng dẫn vận động.'],
  'sourceTitle':'YogaEasy — Half Standing Forward Bend','sourceUrl':'https://www.yogaeasy.com/artikel/half-standing-forward-bend',
  'sourceUse':'Đối chiếu họ đứng gập/half-lift và việc đọc vị trí thân trong quan hệ với chân. Không coi Half Standing Forward Bend là danh tính của clip24 hay lấy đường chuyển của nguồn làm transcript video.',
  'obsNotes':'Supplement cột1 tại5.596999s thấy đứng trên hai chân và vươn tay; cột4 tại29.852s là montage hai panel so sánh người gập/hinge, có bối cảnh/người khác. Cột2/3 đen. Không thấy quá trình đứng lên liên tục, nhịp, audio hoặc exact starting posture.',
  'times':[5.596999,29.852], 'evidence':OBS_SUPP,
  'specialBlocker':'Chưa thấy các frame giữa; chưa xác định điểm bắt đầu, nhịp và cách đứng lên phù hợp. Montage so sánh còn có quyền người/bối cảnh riêng chưa xác minh; không tái tạo như before/after hiệu quả.',
  'steps':[
   ('Nhận ra điều một khung chưa kể','Một khung đứng là hình đích; một đoạn đứng lên còn có điểm bắt đầu và những thay đổi ở giữa. Bài này chưa có đủ hình giữa để kể lại đoạn chuyển.','Đọc sự khác biệt ấy giúp tránh biến hai ảnh rời thành một chỉ dẫn tự tập. Không cần cúi hay đứng lên trong lúc xem.',['pose-source'],'Ảnh AI riêng toàn thân người đứng tự nhiên trên hai chân, tay nghỉ; góc nghiêng đủ thấy từ đầu đến chân. Không coi khung này là Tadasana chuẩn hoặc là kết quả trị liệu của một ảnh trước đó.'),
   ('Nhìn nền hai bàn chân','Trong một hình đứng, hãy tìm hai bàn chân và vùng sàn tiếp xúc trước khi nhìn độ thẳng của lưng. Nền chân là một phần của cách đọc toàn thân.','Ảnh không đo được cảm giác thăng bằng hay lực dưới từng bàn chân. Không có yêu cầu tự dồn lực, khóa gối hoặc đặt chân theo một khoảng cách cố định.',['pose-source','safety'],'Góc thấp chụp riêng hai bàn chân và phần cẳng chân của cùng người đang đứng, cả gót/mũi chân rõ; không mũi tên áp lực, không thêm nhón gót. Tư thế đứng cụ thể chờ chuyên gia chốt.'),
   ('Đọc hông, gối và thân cùng nhau','Hình người gập cần được nhìn cùng đầu gối và vùng hông, thay vì chỉ chấm xem lưng có thành một đường thẳng hay không. Một nhãn ngắn không mô tả hết chuyển động.','Trong nguồn local còn có montage so sánh. Nó không cung cấp quyền suy ra chẩn đoán, hiệu quả sau một buổi hoặc một cách gập đúng cho mọi người.',['pose-source','safety'],'Một ảnh góc nghiêng của standing hinge/half-lift do chuyên gia chọn, thấy đủ gối/hông/thân/đầu và điểm tay hỗ trợ nếu có. Không before/after, không mô phỏng montage hoặc người trong video nguồn; identity blocked đến khi variant được chọn.'),
   ('Không tự điền đoạn chuyển còn thiếu','Từ thân gập tới thân dựng, ảnh cần kể được đoạn giữa và cách dừng. Hai frame tách rời chưa cho biết nhịp, mức hỗ trợ hay thời điểm đổi vị trí tay.','Bạn có thể đánh dấu phần muốn hỏi giáo viên: bắt đầu từ hình nào, có điểm tựa nào và làm gì khi không muốn tiếp tục. Bài đọc này không đưa một lệnh đứng lên thật nhanh hoặc thật thẳng.',['pose-source','safety'],'Ảnh rộng của nhân vật đang đọc hai khung minh họa trên thiết bị, cơ thể ngồi nghỉ; không minh họa một intermediate rise chưa được xác minh. Không dựng mũi tên hoặc motion trail tạo cảm giác đã có recipe đứng lên.'),
   ('Kết thúc việc đọc, giữ lựa chọn riêng','Bạn có thể kết thúc sau khi phân biệt nền đứng và đoạn chuyển tới đứng. Nếu cần hướng dẫn vận động, hãy chọn một phần thực hành có đường vào/ra và người phụ trách rõ ràng.','Việc hoàn tất bài không chứng minh bạn đã đứng lên từ một tư thế gập hay từ sàn. Phần thực hành cụ thể của chủ đề này vẫn chưa được duyệt.',['pose-source','safety','stop-source'],'Cùng người ngồi nghỉ thoải mái, đặt thiết bị xuống hoặc dừng đọc, cạnh thảm; không vẽ hành động đứng lên khỏi ghế như một thay thế đã được kê. Khung kết thúc reader, không phải bước exit thực hành.'),
  ],
 },
 {
  'slug':'low-wheel','id':'mcy.pose.low-wheel','legacy':'28','youtube':'6Y-eWBnD8r8','index':0,
  'title':'Bánh xe thấp · nhận biết điểm tựa gần đầu','short':'Bánh xe thấp',
  'intro':'Một hình ngả sau nhìn giống vòng cung có thể dùng bàn tay, cẳng tay hoặc một nền khác. Bài đọc này giúp phân biệt điều nhìn thấy với điều chưa biết về tải trọng, đặc biệt ở vùng đầu và cổ.',
  'scope':'Chỉ đọc biến thể backbend local có khuỷu/cẳng tay trên thảm và đầu rất gần sàn. Không đồng nhất với Bridge hoặc Wheel hai tay duỗi. Không hướng dẫn tự tì đầu, chuyển từ tay sang cẳng tay, nâng hông hoặc vào/ra; tất cả các thao tác chịu lực chờ chuyên gia xác lập.',
  'objectives':['Phân biệt hình vòng cung với một danh tính/điểm tựa cụ thể.','Nhận ra tiếp xúc gần đầu không cho biết tải trên đầu/cổ.','Biết những gì cần được giải thích trước khi có phần thực hành.'],
  'sourceTitle':'YogaEasy — Upward Bow or Wheel Pose','sourceUrl':'https://www.yogaeasy.com/artikel/upward-bow-or-wheel-pose',
  'sourceUse':'Chỉ đối chiếu Wheel family và sự cần thiết của chuẩn bị/đường ra. Nguồn mô tả Wheel chủ yếu trên bàn tay; không cung cấp recipe cho biến thể cẳng tay/đầu gần sàn local. Không nhập hướng dẫn qua đỉnh đầu hoặc nâng chân của nguồn.',
  'obsNotes':'Initial cột1 tại8.028s và cột3 tại29.437s có pixels; supplement cột1 tại8.028s và cột2 tại18.733s có pixels. Thấy ngồi gối gập/arms-up và deep backbend với hai bàn chân, khuỷu/cẳng tay ở sàn, đầu gần sàn. Không xác nhận đầu chịu tải hay trình tự vào/ra; các cột còn lại đen.',
  'times':[8.028,18.733,29.437], 'evidence':OBS_SUPP,
  'specialBlocker':'Exact biến thể cẳng tay/đầu, điểm chịu lực cổ và đường vào/ra chưa chuyên gia xác minh. Không sinh ảnh hoặc chỉ dẫn head-bearing/forearm-wheel như nội dung tự tập.',
  'steps':[
   ('Gọi rõ nền đỡ trước tên tư thế','Một đường cong lớn của thân chưa đủ để gọi hình là Bridge hay Wheel tiêu chuẩn. Trong mẫu local, khuỷu/cẳng tay và đầu đều rất gần thảm.','Bài đọc giữ tên nguồn Bánh xe thấp như một nhãn chủ đề; tên chuyên môn của exact variant vẫn chờ xác nhận.',['pose-source'],'Góc nghiêng toàn thân của exact forearm-supported backbend chỉ sau khi chuyên gia chốt; thấy đầu, hai tay/cẳng tay và hai bàn chân. Không thay bằng Bridge hoặc straight-arm Wheel. Identity blocked cho đến khi xác nhận load/support.'),
   ('Nhìn khuỷu và cẳng tay riêng','Quan sát đoạn tay nào nằm gần hoặc tiếp xúc với thảm. Một hình dùng cẳng tay có nền khác với hình đặt hai lòng bàn tay cạnh vai rồi duỗi tay.','Không nối hai cách chống thành một bước chuyển tưởng tượng. Đổi nền tay trong khi thân đang chịu lực cần hướng dẫn riêng mà bài này chưa có.',['pose-source','safety'],'Góc nghiêng rộng upper-body của exact variant, rõ hai khuỷu/cẳng tay và hướng bàn tay; giữ cả đầu/cổ trong khung. Không minh họa động tác đổi từ lòng bàn tay xuống cẳng tay.'),
   ('Không suy tải từ vị trí đầu','Thấy đầu sát sàn chưa cho biết phần nào đang chịu lực hoặc mức tải ở cổ. Một ảnh đẹp không có thông tin cảm giác, kiểm soát hay khả năng của người xem.','Bài đọc không yêu cầu đặt đỉnh đầu xuống để thử. Điểm tiếp xúc và tải ở vùng này phải được người có chuyên môn giải thích trước mọi ảnh hướng dẫn cuối.',['pose-source','safety'],'Góc sau ba phần tư đủ rõ đầu/cổ cùng toàn bộ nền tay, không cận mặt làm mất điểm tựa. Không sinh đầu chịu tải hoặc ép cổ; chỉ tạo khi reviewer đã xác lập chính xác contact/load và chọn góc hình.'),
   ('Giữ bàn chân trong toàn cảnh','Hai bàn chân và đầu gối vẫn thuộc nền của hình ngả sau. Đọc chúng cùng thân và tay giúp tránh chỉ chú ý vào độ cao của vòng cung.','Không có mục tiêu nâng cao hông hoặc tăng độ cong ở đây. Một still cũng không cho biết cách người tập đã vào hình hay có thể trở lại.',['pose-source','safety'],'Góc thấp ba phần tư của hai bàn chân/gối trong exact variant, vẫn giữ tay và đầu đủ thấy để không mất ngữ cảnh tải. Không nâng một chân hoặc thay thế vị trí chân bằng thông số tự suy.'),
   ('Khép bài ở giới hạn đã biết','Điều cần làm rõ tiếp là exact biến thể, điểm chịu lực, chuẩn bị và cách kết thúc có kiểm soát. Khi các phần đó chưa được duyệt, bài dừng ở nhận biết hình.','Bạn đã đến cuối phần đọc mà không cần thực hiện một backbend. Không dùng một tấm ảnh kế tiếp để tự thiết kế cách hạ người xuống.',['pose-source','safety','stop-source'],'Cùng nhân vật ở tư thế nghỉ quen thuộc cạnh thảm, đang xem lại nội dung; không nằm hoặc hạ từ backbend để giả minh họa exit. Khung kết thúc phần đọc, không phải một bước thực hành chịu tải.'),
  ],
 },
]

common_sources=[
 {'id':'safety','title':'NCCIH — Yoga: Effectiveness and Safety','url':'https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety','use':'Chỉ dùng căn cứ cần hướng dẫn có chuyên môn; không xác nhận phù hợp cá nhân hoặc kỹ thuật từng hình MCY.','accessedAt':'2026-10-18'},
 {'id':'stop-source','title':'NHS — Strength and Flex exercise plan: How-to videos / safety information','url':'https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/','use':'Chỉ đối chiếu nguyên tắc dừng khi đau hoặc không khỏe; không dùng bài Strength/Flex làm kỹ thuật tư thế yoga.','accessedAt':'2026-10-18'},
]

for spec in specs:
    unit=json.loads(json.dumps(TEMPLATE))
    index=spec['index']; source=INITIAL['records'][index]
    obsid=f'local-{spec["slug"]}-stills'
    unit.update({
      'id':spec['id'],'legacyAliases':[f'poses:{spec["legacy"]}'],'kind':'transition_education' if spec['slug']=='stand-up' else 'pose_education',
      'productionStatus':'editorial_draft','title':spec['title'],'shortTitle':spec['short'],'intro':spec['intro'],'scope':spec['scope'],
      'learningObjectives':spec['objectives'],'audience':'Người lớn đọc để tìm hiểu và chuẩn bị câu hỏi. Bài này không yêu cầu thử tư thế hoặc xác nhận phù hợp cho người mới; không phải hướng dẫn tự xử lý triệu chứng.',
      'prerequisites':['Hiện chỉ có phần đọc; mọi đường vào/ra và lựa chọn thực hành của exact variant cần chuyên gia xác lập trước.'],
      'preparation':['Đọc khi đang nghỉ trong tư thế quen thuộc; không chuyển sang nền của ảnh để đọc.','Xem cả phạm vi và phần kết trước; có thể chỉ đọc hoặc dừng bất cứ lúc nào.','Chưa có ảnh AI: năm khung là brief có điều kiện, không phải hình hướng dẫn sẵn có.'],
      'stopGuidance':'Có thể dừng phần đọc bất cứ lúc nào. Bài không yêu cầu vận động; nếu đang tự thử và thấy đau hoặc không khỏe, dừng lại và tìm hỗ trợ phù hợp.',
      'alternatives':['Chỉ đọc phần nhận biết; không thử tư thế.','Ghi câu hỏi để trao đổi với giáo viên trước khi chọn nội dung thực hành.'],
      'readTimeSecondsEstimate':240,'readTimeNote':'Ước lượng thời gian đọc; không phải thời lượng giữ tư thế hoặc buổi tập.','ending':'Bạn đã đến cuối phần đọc. Không tự ghi nhận đã thực hành hoặc suy ra cảm giác tốt hơn từ việc đọc xong.',
      'sourceRefs':[{'courseId':'poses','lessonId':spec['legacy'],'youtubeId':spec['youtube'],'relation':'topic_reference','contentObserved':False}],
      'sourceObservations':[{'id':obsid,'fileName':source['sourceFileName'],'sourceSha256':source['sourceSha256'].lower(),'timestampsSeconds':spec['times'],'visualOnly':True,'audioObserved':False,'notes':spec['obsNotes']+' Các mốc là vị trí browser báo; chỉ những cột có pixels mới được tính quan sát. MOV chưa bind bytes với YouTubeID.','evidenceRef':spec['evidence']}],
      'sources':[{'id':'pose-source','title':spec['sourceTitle'],'url':spec['sourceUrl'],'use':spec['sourceUse'],'accessedAt':'2026-10-18'},*common_sources],
      'blockers':[spec['specialBlocker'],'Chưa có chuyên gia yoga thật duyệt đối tượng, exact variant, copy, mọi phần thực hành và từng ảnh.','Năm ảnh mới chưa được tạo: path/hash/mime/dimensions null, alt/caption trống; chưa có media để thẩm định pixels.','Chưa xem trọn clip hoặc audio, chưa xác nhận trái/phải và quan hệ MOV-byte/YouTubeID; đây không phải transcript.','Quyền text/media/likeness, biên tập, accessibility và adapter/CMS/phát hành vẫn chờ xử lý.'],
      'changeLog':['r1 — nguyên tác đọc/quan sát có AI hỗ trợ dựa trên nguồn primary và các still local thực sự nhìn thấy; không có phần thực hành được duyệt hoặc ảnh mới.'],
      'provenance':{'createdAt':'2026-10-18','authoring':'ai_assisted_original','sourceFiles':[{'path':p,'sha256':hashlib.sha256((REPO/p).read_bytes()).hexdigest()} for p in [OBS_INITIAL,OBS_SUPP]],'notes':'Original educational reading only. Still images were inspected; no full original video or audio review. Public-source facts are limited paraphrases; questions, reading flow and image briefs are editorial proposals. Private instructor captures are evidence only, not likeness inputs or learner assets. The emitted JSON is canonical; this helper must not overwrite later edits.'},
    })
    unit['steps']=[];unit['media']=[];unit['assetBriefs']=[]
    for i,(title,body,detail,source_ids,brief) in enumerate(spec['steps'],1):
      stepid=f'step-{i}'; mediaid=f'{spec["slug"]}-photo-{i}'
      unit['steps'].append({'id':stepid,'order':i,'title':title,'body':body,'detail':detail,'entry':'Bắt đầu hoặc tiếp tục phần đọc khi đang nghỉ; không phải đường vào tư thế.','exit':'Kết thúc phần đọc; không đánh dấu đã thực hành.' if i==5 else 'Chuyển sang khung đọc kế tiếp; không thực hiện chuyển động theo các ảnh.','alternative':'Có thể chỉ đọc, xem lại hoặc khép bài.','stopCue':'Không cần thử tư thế. Dừng đọc hoặc dừng tự thử khi muốn; hướng dẫn dừng chung ở đầu bài vẫn áp dụng.','sourceIds':source_ids,'evidenceRefs':[obsid],'mediaIds':[mediaid]})
      status='identity_blocked'
      unit['media'].append({'id':mediaid,'stepId':stepid,'variant':'photo_ai','status':status,'path':None,'sha256':None,'mime':None,'width':None,'height':None,'alt':'','caption':'','synthetic':True,'disclosure':'Chưa có ảnh. Brief dự kiến ảnh AI, còn chờ chốt biến thể/điểm chịu lực và thẩm định chuyên môn; alt chỉ viết sau khi có pixels thật.','rightsStatus':'pending','expertStatus':'pending','provenance':{'tool':None,'createdAt':None,'sourcePath':None,'sourceSha256':None,'promptRef':None,'notes':'Not produced. No source-video instructor likeness or footage will be reused as a generation reference.'}})
      unit['assetBriefs'].append({'id':f'{spec["slug"]}-brief-{i}','stepId':stepid,'mediaId':mediaid,'status':status,'path':None,'sha256':None,'brief':STYLE+brief+GATE,'sourceIds':['pose-source','safety'],'evidenceRefs':[obsid]})
    target=LIB/'units'/spec['slug']/'r1.json'
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists(): raise RuntimeError(f'Refuse overwriting existing canonical unit {target}')
    target.write_text(json.dumps(unit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'path':str(target.relative_to(REPO)),'id':unit['id'],'steps':5,'unproducedBriefs':5},ensure_ascii=False))
