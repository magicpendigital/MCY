# Danh mục mở rộng yoga — metadata để lập kế hoạch

Đây là nguồn metadata biên tập có thể tiếp tục tăng, **không phải danh sách đầy đủ mọi tư thế hoặc mọi truyền thống yoga**. Catalog không là bài học, hướng dẫn tập, phiên thực hành, tiêu chuẩn phù hợp cá nhân hay nội dung được duyệt.

Snapshot seed có 114 mục: 68 `pose_family`, 3 `pose_variant`, 28 `skill`, 10 `knowledge_topic` và 5 `local_unresolved_topic`. Con số này không được cộng vào 14 bài đọc hoặc số ảnh đã sản xuất trong kho chính.

## Nguồn và tên

`catalog.json` là dữ liệu canonical của nhánh metadata này. `catalog.schema.json` và checker riêng được worker khác chuẩn bị theo intake; README này không tuyên bố control đã chạy hoặc QC đã PASS. Thiết kế và research ở [EXPANSION-INTAKE.vi.md](../../../analyse/yoga-content-production-2026-10-18/EXPANSION-INTAKE.vi.md); sổ nguồn ở [EXPANSION-RESEARCH-SOURCES.json](../../../analyse/yoga-content-production-2026-10-18/EXPANSION-RESEARCH-SOURCES.json).

Tên Việt mang `editorial_translation` hoặc `editorial_label`, `sourceAttested:false` và review pending. Đó là nhãn MCY dịch/biên tập từ khái niệm có nguồn; không nói teaching source đã có chữ Việt ấy. English có thể là tên source-attested hoặc nhãn biên tập tường minh. Sanskrit chỉ source-attested hoặc null; null là lựa chọn hợp lệ khi chưa xác minh hoặc tên xung đột.

`source_attested` chỉ nghĩa nguồn đã dùng đúng chữ được ghi, không nghĩa nguồn đúng tuyệt đối, tương đương xuyên truyền thống, hay đã có chuyên gia duyệt. Giữ chính tả như nguồn thay vì tự sửa Sanskrit theo trí nhớ. Alias chỉ nhận tên source-attested và context cụ thể.

Các nguồn web chỉ dùng nomenclature, category và context. Không sao chép ảnh, cues, thời lượng, liều thở, benefits hoặc lời điều trị. Nguồn local `local-inventory` pin chính xác inventory repo bằng SHA-256; nó chỉ chứng minh nhãn local và tuple source có thật, không chứng minh một asana chuẩn.

## Taxonomy và quan hệ

Taxonomy là đề xuất biên tập có phiên bản. Facet posture, skill, knowledge và local topic được giữ riêng; một pose có thể có nhiều facet. Facet không biểu thị độ khó, tác dụng trị liệu hoặc phù hợp với một người.

- `pose_family`: một tên tư thế được quản lý cùng context và khả năng mở rộng biến thể.
- `pose_variant`: có `variant_of` tới đúng family và evidence; seed có Dolphin, Forearm Plank và Wide Legged Forward Bend C.
- `skill`: chủ đề năng lực/nhận biết, gồm cơ thể/nền đỡ, chuyển động, cân bằng, hơi thở, chú ý/nghỉ và giao tiếp/tự phản tư.
- `knowledge_topic`: thuật ngữ, lịch sử/context, phương pháp, ethics và giới hạn nguồn.
- `local_unresolved_topic`: tên có thật trong inventory/unit nhưng identity còn chặn; không tính thành pose family.

`contextRefs` trỏ source IDs để giữ ngữ cảnh nguồn; không tự chứng minh một lineage. `study_topic_for` là liên hệ biên tập, không là prerequisite, progression, chỉ định hoặc bảo đảm an toàn. Không có quan hệ tự tạo phiên tập.

High/Low Lunge, Crow, Warrior III và Reclining Hero giữ `nomenclatureStatus:unresolved` ở các điểm còn xung đột. Sanskrit của High/Low Lunge, Crow và Warrior III để null. Không merge Crow/Bakasana/Kakasana hoặc Tadasana/Parvatasana chỉ qua tên giống nhau. Không suy Saddle trong mọi ngữ cảnh là exact Supta Virasana.

## Link về kho hiện có

Mỗi `existingContentLinks` có `unitId`, `revision`, `locale`, `unitPath`, relation, inventory tuple và giới hạn. Path là **repo-relative**. Chỉ dùng `related_topic`, `component_topic` hoặc `unverified_topic`; không có exact-match claim ở seed này.

Năm local topics kneeling-backbend19, low-crow22, wild-thing-high23, stand-up24 và low-wheel28 không map thành Camel/Crow/Bridge/Wheel/standing-asana chuẩn. Foundation standing không link stand-up24. Skill ground-transition có thể liên hệ stand-up24 ở mức unverified topic, không xác nhận kỹ thuật.

Cobra gentle20 là low-lift editorial; Cow Face29 chỉ phần tay trên nền ngồi đơn giản; Three-legged Dog30 là square-hip editorial. Link family không xác nhận exact clip, side, transcript hoặc quyền. Clip gentle/sequence khác chưa được annotation không tự có pose mapping.

## Trạng thái đóng và mở rộng sau này

Envelope và mọi entity đều metadata-only, learnerVisible false, recommendationEligible false, unpublished; bốn review expert/rights/editorial/accessibility pending; approvalRecords rỗng. Không tự đổi thành approved để thử UI. Mục nâng cao cũng chỉ là tên/category/context, không dạy tự tập.

Stable IDs không chứa locale/revision/độ khó và không đổi khi chỉnh nhãn. Khi thêm mục: xác nhận source assertion, chọn đúng kind/facet, giữ pending, kiểm tên/alias/context và links, rồi đi qua QC với exact snapshot. Không thêm derivative để chạy đủ số. Merge/deprecate cần review và lịch sử; không tái dùng ID đã tồn tại.

Schema/checker/fixtures riêng cần independent review trước invocation theo intake. Sau sửa dữ liệu/control phải pin lại snapshot và kiểm phần bị ảnh hưởng. Schema/technical PASS không là chuyên gia yoga, quyền, editorial/accessibility hoặc release clearance.

Danh mục chưa được app/runtime/CMS consume; không có thay đổi cloud, Auth, native, AI hoặc deployment trong nhánh này. Việc biên soạn bài học hoặc đưa metadata tới learner cần intake và acceptance riêng.

## Mục lục seed để Owner duyệt

Bảng đọc từ cùng dữ liệu canonical: mỗi mục xuất hiện một lần theo facet đầu tiên; các facet khác vẫn ở JSON. Cột tình trạng là nomenclature; **mọi review chuyên môn/quyền/biên tập/accessibility đều pending**. Các mục này là metadata, không phải bài học đã sản xuất.

### Tư thế — nền đứng

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.chair` | Ghế | Chair Pose | `pose_family` | pending |
| `mcy.expansion.pose.high-lunge` | Trường tấn cao | Crescent Pose / High Lunge | `pose_family` | unresolved |
| `mcy.expansion.pose.dancer` | Vũ công | Dancer’s Pose | `pose_family` | pending |
| `mcy.expansion.pose.eagle` | Đại bàng | Eagle pose | `pose_family` | pending |
| `mcy.expansion.pose.extended-hand-to-big-toe` | Tay nắm ngón chân cái khi đứng | Extended Hand To Big Toe Pose A-B | `pose_family` | pending |
| `mcy.expansion.pose.extended-side-angle` | Góc nghiêng mở rộng | Extended Side Angle Pose | `pose_family` | pending |
| `mcy.expansion.pose.half-standing-forward-bend` | Đứng gập trước một nửa | Half Standing Forward Bend | `pose_family` | pending |
| `mcy.expansion.pose.half-moon` | Nửa vầng trăng | Half-Moon Pose | `pose_family` | pending |
| `mcy.expansion.pose.hand-to-big-toe-forward-fold` | Gập trước với tay nắm ngón chân cái | Hand to Big Toe Forward Fold | `pose_family` | pending |
| `mcy.expansion.pose.intense-side-stretch` | Duỗi nghiêng mạnh | Intense Side Stretch Pose | `pose_family` | pending |
| `mcy.expansion.pose.mountain` | Ngọn núi | Mountain Pose | `pose_family` | pending |
| `mcy.expansion.pose.reverse-warrior` | Chiến binh ngược | Reverse Warrior Pose | `pose_family` | pending |
| `mcy.expansion.pose.revolved-triangle` | Tam giác xoay | Revolved Triangle Pose | `pose_family` | pending |
| `mcy.expansion.pose.standing-forward-bend` | Đứng gập trước | Standing Forward Bend | `pose_family` | pending |
| `mcy.expansion.pose.standing-splits` | Đứng nâng chân | Standing Splits | `pose_family` | pending |
| `mcy.expansion.pose.tree` | Cái cây | Tree Pose | `pose_family` | pending |
| `mcy.expansion.pose.triangle` | Tam giác mở rộng | Triangle Pose | `pose_family` | pending |
| `mcy.expansion.pose.warrior-i` | Chiến binh I | Warrior 1 Pose | `pose_family` | pending |
| `mcy.expansion.pose.warrior-ii` | Chiến binh II | Warrior 2 Pose | `pose_family` | pending |
| `mcy.expansion.pose.warrior-iii` | Chiến binh III | Warrior 3 | `pose_family` | unresolved |
| `mcy.expansion.pose.wide-legged-forward-bend` | Đứng chân rộng gập trước | Wide Legged Forward Bend | `pose_family` | pending |
| `mcy.expansion.variant.wide-legged-forward-bend-c` | Đứng chân rộng gập trước C | Wide Legged Forward Bend C | `pose_variant` | pending |

### Tư thế — nền ngồi

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.bharadvaja-twist` | Xoắn Bharadvaja | Bharadvaja’s Twist | `pose_family` | pending |
| `mcy.expansion.pose.boat` | Con thuyền | Boat Pose | `pose_family` | pending |
| `mcy.expansion.pose.bound-angle` | Góc cố định | Bound Angle Pose | `pose_family` | pending |
| `mcy.expansion.pose.cow-face` | Đầu bò | Cow Face Pose | `pose_family` | pending |
| `mcy.expansion.pose.easy` | Ngồi thoải mái | Easy Pose | `pose_family` | pending |
| `mcy.expansion.pose.half-lord-of-fishes` | Nửa vặn mình | Half Lord Of The Fishes Pose | `pose_family` | pending |
| `mcy.expansion.pose.head-to-knee` | Đầu hướng gối | Head to Knee Pose | `pose_family` | pending |
| `mcy.expansion.pose.heron` | Diệc | Heron Pose | `pose_family` | pending |
| `mcy.expansion.pose.lotus` | Hoa sen | Lotus Pose | `pose_family` | pending |
| `mcy.expansion.pose.marichi-a` | Marichi A | Pose dedicated to the sage Marichi A | `pose_family` | pending |
| `mcy.expansion.pose.marichi-c` | Marichi C | Pose dedicated to the sage Marichi C | `pose_family` | pending |
| `mcy.expansion.pose.revolved-head-to-knee` | Đầu hướng gối xoay | Revolved Head to Knee Pose | `pose_family` | pending |
| `mcy.expansion.pose.seated-forward-bend` | Ngồi gập trước | Seated Forward Bend | `pose_family` | pending |
| `mcy.expansion.pose.staff` | Cây gậy | Staff Pose | `pose_family` | pending |
| `mcy.expansion.pose.upward-wide-angle-seated` | Ngồi góc rộng nâng chân | Upward Facing Wide-Angle Seated Pose | `pose_family` | pending |

### Tư thế — nền quỳ

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.camel` | Lạc đà | Camel Pose | `pose_family` | pending |
| `mcy.expansion.pose.child` | Em bé | Child’s Pose | `pose_family` | pending |
| `mcy.expansion.pose.gate` | Cánh cổng | Gate Pose | `pose_family` | pending |
| `mcy.expansion.pose.hero` | Anh hùng | Hero Pose | `pose_family` | pending |
| `mcy.expansion.pose.low-lunge` | Trường tấn thấp | Low lunge | `pose_family` | unresolved |

### Tư thế — nền nằm sấp

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.bow` | Cánh cung | Bow Pose | `pose_family` | pending |
| `mcy.expansion.pose.cobra` | Rắn hổ mang | Cobra Pose | `pose_family` | pending |
| `mcy.expansion.pose.half-frog` | Nửa con ếch | Half Frog Pose | `pose_family` | pending |
| `mcy.expansion.pose.locust` | Châu chấu | Locust Pose | `pose_family` | pending |
| `mcy.expansion.pose.sphinx` | Nhân sư | Sphinx Pose | `pose_family` | pending |

### Tư thế — nền nằm ngửa

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.bridge` | Cây cầu | Bridge Pose | `pose_family` | pending |
| `mcy.expansion.pose.fish` | Con cá | Fish Pose | `pose_family` | pending |
| `mcy.expansion.pose.happy-baby` | Em bé vui vẻ | Happy Baby Pose | `pose_family` | pending |
| `mcy.expansion.pose.plough` | Cái cày | Plough Pose | `pose_family` | pending |
| `mcy.expansion.pose.reclined-butterfly` | Góc cố định khi nằm ngửa | Reclined Butterfly Pose | `pose_family` | pending |
| `mcy.expansion.pose.reclined-big-toe` | Nằm ngửa nắm ngón chân cái | Reclined Big Toe Pose | `pose_family` | pending |
| `mcy.expansion.pose.reclining-hero` | Anh hùng nằm ngả | Reclining Hero Pose | `pose_family` | unresolved |
| `mcy.expansion.pose.supine-rest` | Nằm nghỉ Savasana | corpse pose | `pose_family` | pending |

### Tư thế — nền chống đỡ

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.cat` | Mèo | Cat Pose | `pose_family` | pending |
| `mcy.expansion.pose.cow` | Bò | Cow Pose | `pose_family` | pending |
| `mcy.expansion.variant.dolphin` | Cá heo | Dolphin Pose | `pose_variant` | pending |
| `mcy.expansion.pose.downward-dog` | Chó úp mặt | Downward Dog Pose | `pose_family` | pending |
| `mcy.expansion.variant.forearm-plank` | Tấm ván trên cẳng tay | Forearm Plank | `pose_variant` | pending |
| `mcy.expansion.pose.four-limbed-staff` | Gậy bốn chi | Four Limbed Staff Pose | `pose_family` | pending |
| `mcy.expansion.pose.pigeon` | Bồ câu | Pigeon Pose | `pose_family` | pending |
| `mcy.expansion.pose.plank` | Tấm ván | Plank Pose | `pose_family` | pending |
| `mcy.expansion.pose.side-plank` | Tấm ván nghiêng | Side Plank Pose | `pose_family` | pending |
| `mcy.expansion.pose.wheel` | Bánh xe | Upward Bow or Wheel Pose | `pose_family` | pending |
| `mcy.expansion.pose.upward-dog` | Chó ngửa mặt | Upward Facing Dog Pose | `pose_family` | pending |
| `mcy.expansion.pose.upward-plank` | Tấm ván ngửa | Upward Plank Pose | `pose_family` | pending |

### Tư thế — cân bằng trên nền tay

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.crow` | Quạ | Crow Pose | `pose_family` | unresolved |

### Tư thế — đảo thân

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.pose.forearm-balance` | Cân bằng trên cẳng tay | Forearm Balance | `pose_family` | pending |
| `mcy.expansion.pose.headstand` | Đứng bằng đầu | Headstand | `pose_family` | pending |
| `mcy.expansion.pose.shoulderstand` | Đứng bằng vai có hỗ trợ | Shoulderstand | `pose_family` | pending |

### Kỹ năng — cơ thể và nền đỡ

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.skill.body-awareness` | Nhận biết cơ thể | Body awareness | `skill` | pending |
| `mcy.expansion.skill.support-point-literacy` | Đọc điểm tựa | Support-point literacy | `skill` | pending |
| `mcy.expansion.skill.joint-motion-literacy` | Nhận biết hướng chuyển động khớp | Joint-motion literacy | `skill` | pending |
| `mcy.expansion.skill.side-difference-observation` | Quan sát khác biệt hai bên | Side-difference observation | `skill` | pending |
| `mcy.expansion.skill.personal-range-observation` | Nhận biết khoảng chuyển động | Personal range observation | `skill` | pending |

### Kỹ năng — di chuyển và chuyển tư thế

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.skill.weight-shift-literacy` | Đọc chuyển trọng tâm | Weight-shift literacy | `skill` | pending |
| `mcy.expansion.skill.ground-transition-literacy` | Nhận biết chuyển nền sàn và đứng | Ground-transition literacy | `skill` | pending |
| `mcy.expansion.skill.entry-exit-literacy` | Đọc đường vào và ra | Entry-and-exit literacy | `skill` | pending |
| `mcy.expansion.skill.movement-breath-coordination` | Nhận biết quan hệ chuyển động và hơi thở | Movement–breath coordination topic | `skill` | pending |
| `mcy.expansion.skill.sequencing-literacy` | Nhận biết thứ tự | Sequencing literacy | `skill` | pending |

### Kỹ năng — đọc thăng bằng

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.skill.standing-balance-literacy` | Đọc nền một chân | Standing-balance literacy | `skill` | pending |
| `mcy.expansion.skill.hand-support-balance-literacy` | Đọc nền tay | Hand-support balance literacy | `skill` | pending |
| `mcy.expansion.skill.forearm-support-balance-literacy` | Đọc nền cẳng tay | Forearm-support balance literacy | `skill` | pending |

### Kỹ năng — hơi thở

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.skill.breath-awareness` | Quan sát hơi thở | Breath observation topic | `skill` | pending |
| `mcy.expansion.skill.abdominal-breathing-topic` | Chủ đề thở bụng | Abdominal breathing topic | `skill` | pending |
| `mcy.expansion.skill.yogic-breathing-topic` | Chủ đề Yogic Breathing | Yogic breathing topic | `skill` | pending |
| `mcy.expansion.skill.alternate-nostril-topic` | Chủ đề thở luân phiên | Alternate-nostril breathing topic | `skill` | pending |
| `mcy.expansion.skill.ujjayi-topic` | Chủ đề Ujjayi | Ujjayi topic | `skill` | pending |
| `mcy.expansion.skill.bhramari-topic` | Chủ đề Bhramari | Bhramari topic | `skill` | pending |
| `mcy.expansion.skill.viloma-topic` | Chủ đề Viloma | Viloma topic | `skill` | pending |

### Kỹ năng — chú ý và nghỉ

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.skill.attention-anchor-topic` | Chủ đề điểm chú ý | Attention-anchor topic | `skill` | pending |
| `mcy.expansion.skill.meditation-observation` | Nhận biết thiền | Meditation observation topic | `skill` | pending |
| `mcy.expansion.skill.relaxation-literacy` | Nhận biết phần nghỉ | Relaxation literacy | `skill` | pending |
| `mcy.expansion.skill.mantra-topic` | Chủ đề mantra | Mantra topic | `skill` | pending |
| `mcy.expansion.skill.mudra-topic` | Chủ đề mudra | Mudra topic | `skill` | pending |

### Kỹ năng — giao tiếp và tự phản tư

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.skill.choice-communication` | Nói lựa chọn và giới hạn | Choice-and-limits communication | `skill` | pending |
| `mcy.expansion.skill.consent-communication` | Trao đổi đồng thuận | Consent communication | `skill` | pending |
| `mcy.expansion.skill.self-reflection` | Tự phản tư | Self-reflection | `skill` | pending |

### Kiến thức — thuật ngữ và phương pháp

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.knowledge.asana-terminology` | Thuật ngữ asana | Asana terminology | `knowledge_topic` | pending |
| `mcy.expansion.knowledge.posture-transition-sequence` | Phân biệt tư thế, chuyển tư thế và chuỗi | Posture, transition and sequence distinctions | `knowledge_topic` | pending |
| `mcy.expansion.knowledge.pranayama-breath-awareness` | Phân biệt pranayama và quan sát hơi thở | Pranayama and breath-observation concepts | `knowledge_topic` | pending |
| `mcy.expansion.knowledge.dharana-dhyana-context` | Dharana và Dhyana theo ngữ cảnh | Dharana and Dhyana contexts | `knowledge_topic` | pending |
| `mcy.expansion.knowledge.mantra-mudra-terminology` | Thuật ngữ mantra và mudra | Mantra and mudra terminology | `knowledge_topic` | pending |

### Kiến thức — lịch sử và ngữ cảnh

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.knowledge.history-lineage` | Lịch sử và ngữ cảnh truyền thống | History and lineage context | `knowledge_topic` | pending |
| `mcy.expansion.knowledge.hatha-ashtanga-context` | Ngữ cảnh tên Hatha và Ashtanga | Hatha and Ashtanga naming contexts | `knowledge_topic` | pending |

### Kiến thức — ethics và giới hạn nguồn

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.knowledge.yama-niyama` | Yama và Niyama như khái niệm ethics | Yama and Niyama as ethics concepts | `knowledge_topic` | pending |
| `mcy.expansion.knowledge.consent-agency` | Đồng thuận và quyền lựa chọn | Consent and agency | `knowledge_topic` | pending |
| `mcy.expansion.knowledge.image-source-limitations` | Giới hạn hình tĩnh và đối chiếu nguồn | Static-image and source-comparison limits | `knowledge_topic` | pending |

### Chủ đề local — identity chưa xác minh

| ID | Tên Việt biên tập | English | Kind | Tình trạng tên |
|---|---|---|---|---|
| `mcy.expansion.local-topic.kneeling-backbend` | Quỳ gối ngả sau | — | `local_unresolved_topic` | unresolved |
| `mcy.expansion.local-topic.low-crow` | Quạ thấp | — | `local_unresolved_topic` | unresolved |
| `mcy.expansion.local-topic.wild-thing-high` | Hoang dã cao | — | `local_unresolved_topic` | unresolved |
| `mcy.expansion.local-topic.stand-up` | Đứng lên, giữ lưng thẳng | — | `local_unresolved_topic` | unresolved |
| `mcy.expansion.local-topic.low-wheel` | Bánh xe thấp | — | `local_unresolved_topic` | unresolved |
