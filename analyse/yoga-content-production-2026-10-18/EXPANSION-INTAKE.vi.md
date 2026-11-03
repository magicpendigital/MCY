# Intake danh mục mở rộng tư thế, kỹ năng và kiến thức yoga — 18/10/2026

Trạng thái: **INTAKE_READY_FOR_QC — chờ root + QC GO trước triển khai canonical**. Tài liệu này là intake/nghiên cứu; chưa tạo `expansion/catalog.json`, schema hoặc validator và chưa chạy công cụ kiểm mới. Bổ sung source snapshot và schema proposal dưới đây để reviewer có thể xét GO; chưa phải verdict QC.

## Quyết định, đầu ra và ranh giới

Phạm vi bổ sung theo [SCOPE-ADDENDUM.vi.md](SCOPE-ADDENDUM.vi.md): hoàn tất nhóm nội dung app hiện có trước, đồng thời chuẩn bị danh mục metadata có thể tiếp tục mở rộng. Không hứa một danh sách hữu hạn đại diện mọi tư thế, kỹ năng, biến thể hoặc truyền thống yoga. Danh mục phục vụ lập kế hoạch biên tập, không được đếm thành bài đọc đã sản xuất.

Canonical đề xuất, chỉ sau GO:

- `content/yoga-library/expansion/catalog.json`: metadata và nguồn cho các entity.
- `content/yoga-library/expansion/catalog.schema.json`: hợp đồng riêng, không mở rộng unit contract bằng trường thực hành.
- `content/yoga-library/expansion/README.vi.md`: ý nghĩa trường, giới hạn taxonomy, quy tắc thêm/sửa/merge và quy trình review.
- Công cụ kiểm/negative fixtures riêng trong thư mục analysis của task, để reviewer đọc trước khi chạy.

Mọi entity giữ `productionStatus: metadata_only`, `learnerVisible: false`, `recommendationEligible: false`, `publishStatus: unpublished`; chuyên môn, quyền, biên tập và accessibility đều pending, không có approvalRecords tự sinh. Không cues, trình tự tập, định lượng, thời gian giữ, liều thở, nín thở, lợi ích trị liệu, chống chỉ định/đối tượng phù hợp tự suy, độ khó, thumbnail hoặc ảnh.

Intake này không thay job ảnh của parent, không sửa 14 unit đang có, inventory, app/candidate UI, runtime, CMS, cloud, native, Auth, AI config hoặc deploy. Các trạng thái HALTED native và web protection gate trong AGENTS giữ nguyên. Đọc nguồn public để phân loại tên không là quyền dùng lại ảnh/video hoặc hướng dẫn.

## Baseline và ownership

Đã đọc `skills/mcy-change-review/SKILL.md`, lifecycle, intake template, review matrix, skill brand/UX, brand/design/tokens, package scripts và README kho. Checkout có nhiều thay đổi của nhiều luồng; không dùng HEAD làm identity cho toàn bộ dữ liệu và không reset/overwrite. Baseline hiện có: `inventory.json` có 38 source clip; `units/` có 14 bài đọc draft; nguồn và ảnh vẫn thuộc phạm vi sản xuất hiện có. Không suy 38 clip = 38 tư thế hoặc xác nhận nội dung clip chỉ từ title.

Worker `/root/pose_photo_production/photo_draft_check` chỉ sở hữu tài liệu intake này ở checkpoint. Root điều phối, chọn snapshot và final verification; QC độc lập đọc intake/control trước GO. Sau GO cần phân file ownership mới cho data/schema/checker, tránh ghi đè job ảnh.

Risk cao nhất của phạm vi bổ sung: **R3**, theo addendum và matrix vì taxonomy có thể được consumer nội dung sức khỏe dùng về sau. Đây không là tuyên bố rằng metadata đã dạy thực hành. Nội dung hướng dẫn/ảnh/phát hành tương lai cần intake và chuyên gia người thật cho exact bytes riêng.

## Impact map và cách kiểm đề xuất

| Entry/dependency | Contract/output mới | Consumer/adjacent cần giữ | Cách kiểm sau GO |
|---|---|---|---|
| Public teaching catalog/standards → nghiên cứu tên | Entity có source theo từng assertion | Không nhập claims sức khỏe, lời tập hoặc copy dài | QC kiểm mẫu và mọi mapping nhạy cảm từ trang nguồn thực mở |
| Taxonomy → catalog metadata | Tách pose, variant, skill, knowledge | Không biến skill thành asana; không gộp traditions do cùng tên | Schema + negative fixtures + kiểm tay tên/quan hệ |
| Current units/inventory → links | Link tường minh có relation và evidence | Không gọi topic reference là exact variant/video transcript | Kiểm target tồn tại, ID/lesson đúng, relation được cho phép |
| Schema/checker mới → local result | Dữ liệu kín, không consumer runtime | Unit contract/renderer hiện có giữ nguyên | Đọc control trước chạy; schema/ID/ref/flags/forbidden-field fixtures |
| Source package → manifest cuối | Snapshot expansion + tooling tương ứng | Không freeze trong lúc worker khác còn sửa | Root pin final bytes, QC riêng, rồi verify manifest |

Đã đọc đường đọc dữ liệu của tooling: `validate-library.mjs` chỉ đọc `units/**/*.json`, inventory và contract hiện có; `render-library.mjs` consume kết quả unit đó. `create-manifest.mjs` lại walk toàn bộ library: expansion data sẽ được pin như package artifact, nhưng tool list đang explicit và phải bổ sung checker/fixtures/intake mới sau GO. Không suy pin bytes = semantic validation expansion. Package scripts hiện không tự import expansion vào app.

UI/navigation/locales/accessibility/runtime/build/native/data/API/identity/consent không có đường consume mới ở bước này. Loại các bề mặt đó khỏi test hành vi vì chỉ có intake local; đây không là PASS app hoặc release. Nếu phát hiện import/consumer tự động thì dừng và mở lại impact map trước triển khai. Không chạy full suite app cho một tài liệu nghiên cứu.

## Taxonomy đề xuất để QC đọc sớm

Đây là **thiết kế biên tập**, không phải một hệ phân loại phổ quát đã được các nguồn đồng thuận. Giữ taxonomy có phiên bản, mô tả phạm vi và extensible; một entity có thể có nhiều facet.

1. `pose_family`: một tên tư thế có phạm vi rõ và các biến thể được ghi riêng. Facet hình thức quan sát gồm đứng, ngồi, quỳ, nằm sấp, nằm ngửa; facet quan hệ vận động gồm gập trước, ngả sau, xoắn, nghiêng bên, cân bằng đứng, cân bằng tay, đảo thân. Không suy hiệu quả/độ khó từ facet.
2. `pose_variant`: quan hệ `variant_of` tới đúng family khi có nguồn; support/prop/arm-only/leg-only/side là metadata riêng. Không tự sinh mọi tổ hợp biến thể.
3. `skill`: năng lực/chủ đề học, tách taxonomy khỏi pose. Nhánh dự kiến: nhận biết cơ thể và điểm tựa; đọc chuyển động; di chuyển/chuyển tư thế; thăng bằng; quan sát hơi thở; kỹ thuật thở có tên; chú ý; nghỉ/thả lỏng; giao tiếp lựa chọn/giới hạn. Mục nâng cao chỉ được ghi tên/category và nguồn.
4. `knowledge_topic`: thuật ngữ, lịch sử/truyền thống, các phương pháp yoga, ethics và hiểu giới hạn nội dung. Không tính các chủ đề này thành tư thế hoặc kỹ năng vận động.
5. `local_unresolved_topic`: tên/chủ đề có thật trong unit/inventory hiện có nhưng chưa xác minh exact pose/variant. Không tính vào số pose families; không dùng nó làm alias của asana chuẩn.

Các nhánh skill/knowledge là cách MCY tổ chức để biên tập. Nguồn có thể chứng minh một khái niệm được dạy, không tự chứng minh nó là điều kiện tiên quyết hoặc bắt buộc cho một asana.

## ID, tên, alias và quan hệ

- Stable ID đề xuất: `mcy.expansion.pose.<slug>`, `mcy.expansion.variant.<slug>`, `mcy.expansion.skill.<slug>`, `mcy.expansion.knowledge.<slug>`, `mcy.expansion.local-topic.<slug>`. Slug không chứa locale, revision, mức khó hoặc claim sức khỏe. Không thay ID khi chỉnh tên. Merge sau review dùng deprecation/redirect có lịch sử, không tái sử dụng ID.
- Theo steering mới của root, `names.vi` được có nhãn dịch/biên tập nguyên tác cho app Việt với `provenance: editorial_translation` hoặc `editorial_label`, `reviewStatus: pending`, nguồn khái niệm English/Sanskrit và `sourceAttested: false`. Không ghi chúng như chữ Việt đã xuất hiện trên teaching source. Tên Việt đã có trong unit/inventory vẫn là local editorial draft, không thành external verification.
- Mỗi tên English/Sanskrit dạng `source_attested` cần nguồn thật đã mở xác nhận đúng chữ và ngữ cảnh; chưa xác minh thì `null`. English của skill/knowledge cũng có thể là `editorial_label` nếu ghi rõ. Sanskrit chỉ chấp nhận `source_attested`, không bắt buộc và không tự chế tên ghép. Không tự chuẩn hoá diacritics thành một tên được cho là có trong nguồn.
- Alias là assertion source-attested có locale, tradition/context và sourceRefs; nhãn Việt mới dịch là primary editorial name, không tự biến thành alias nguồn. Hai tên giống nhau không tự là cùng tư thế; cùng một tư thế có thể có nhiều tên. Chỉ gộp khi có evidence; chưa chắc thì `related_to` hoặc chưa tạo link.
- Relations dự kiến: `variant_of`, `related_to`, `has_named_component`, `study_topic_for`. Chỉ `variant_of` có hướng parent; không có `prerequisite_for`, `safe_for`, `treats`, `recommended_for`, progression hoặc auto-sequence.
- Pose ↔ skill chỉ nói chủ đề có thể cần biên tập/quan sát trong quan hệ đó, cần source hoặc rationale biên tập ghi rõ. Không đánh dấu đã thành thạo, khả năng thực hành hoặc phù hợp cá nhân.

## Nguồn bước đầu đã mở

Ngày truy cập research: 18/10/2026. Chỉ lấy tên/phân biệt category và context; không nhập benefits, healing, energy, negative-thinking hoặc lời hướng dẫn thực hành.

| ID đề xuất | Nguồn | Phạm vi sử dụng |
|---|---|---|
| `ya-rys-standards` | [Yoga Alliance — Standards for RYS Credentials](https://yogaalliance.org/Standards-for-RYS-Credentials) | Curriculum có asana, breath, meditation, biomechanics và yoga humanities; chứng minh cần tách các miền. Không là taxonomy phổ quát hoặc credential MCY. |
| `ya-scope` | [Yoga Alliance — Scope of Practice](https://yogaalliance.org/policies-priorities-progress/scope-of-practice/) | Giữ lineage/context và giới hạn chuyên môn; không suy một khung là định nghĩa đầy đủ yoga. |
| `ye-poses-1` | [YogaEasy — Yoga Poses archive](https://www.yogaeasy.com/artikel/category/yoga-poses) | Seed tên pose English và một số Sanskrit, cùng link trang riêng. Chưa lấy cả archive làm xác nhận mọi alias. |
| `iyengar-index` | [Eyal Shifroni — Light on Yoga Asanas Index](https://eyalshifroni.com/blog/b-k-s-iyengars-light-on-yoga-asanas-index/) | Nguồn teaching theo Iyengar để nghiên cứu index/family/variant; chưa dùng tên chưa đọc được ở file đính kèm. |
| `ayush-cyp-2026` | [Ministry of Ayush — Common Yoga Protocol 2026](https://yoga.ayush.gov.in/uploads/assets/cyp/CYP_Book_English_2026.pdf) | Search tìm đúng PDF nhưng open bị Internal Error ở checkpoint này: **BLOCKED cho assertion chưa mở**, không dùng snippet như đã đọc PDF. |
| `sivananda-12` | [Sivananda — 12 Basic Asanas](https://sivananda.org/teachings/12-basic-asanas/) | Worker đã mở trực tiếp danh sách tên của Open Class theo Sivananda; không nhập health/energy claims hoặc gọi 12 mục là đầy đủ yoga. |
| `sivananda-5` | [Sivananda — 5 Points of Yoga](https://sivananda.org/teachings/5-points-of-yoga/) | Chỉ context asana, breath, relaxation và meditation; không nhập claims hoặc prescription về tâm trạng/thực phẩm. |
| `yogapoint-asana` | [Yoga Vidya Gurukul/YogaPoint — Yoga Poses](https://www.yogapoint.com/info/yogasana.htm) | Danh mục teaching có tên và nhiều cách nhóm. Không nhập các nhánh bệnh/tình trạng/độ khó, không auto-equate tên khác context. |
| `yogapoint-home` | [YogaPoint](https://www.yogapoint.com/) | Chỉ nhận diện các miền breath, meditation, cleansing và philosophy; không lấy course marketing/therapy claims. |
| `ye-awareness` | [Dawn Meredith-Davies/YogaEasy — Posture, alignment and recovering from injury](https://www.yogaeasy.com/artikel/posture-alignment-and-recovering-from-injury) | Chỉ khái niệm body/postural awareness, vào/ra tư thế và lực từ nền; loại toàn bộ giải thích/claims điều trị đau của bài. |
| `ya-code` | [Yoga Alliance — Code of Conduct](https://yogaalliance.org/policies-priorities-progress/code-of-conduct/) | Chỉ consent/agency, honest communication và cultural responsibility làm chủ đề kiến thức/giao tiếp. |

Worker đã mở trực tiếp các nguồn Sivananda/YogaPoint trên sau snapshot sơ bộ. Không suy credential/đồng thuận lâm sàng từ teaching website. URL Sivananda đoán ban đầu `/teachings/five-points/` không mở được; link chính xác từ navigation là `/teachings/5-points-of-yoga/`, đã mở. YogaPoint Book of Practices PDF bị tool chặn do kích thước 17,235,773 bytes; chưa dùng bản đó làm nguồn đã đọc. YogaEasy archive page8 lỗi fetch cả URL trực tiếp và Next; không suy nội dung page8.

Seed không có quota. Ưu tiên một tập đủ bằng chứng, có thể tiếp tục tăng, thay vì chạy đủ 80–150 bằng tên tự bịa hoặc tách biến thể để tăng số. Snapshot tên, candidate breadth và schema chi tiết ở phụ lục dưới; số record cuối chỉ chốt sau QC.

## Link hiện có: quy tắc trước triển khai

- `mcy.foundation.standing` chỉ liên hệ chủ đề nhận biết đứng/nền chân, không tự đổi thành Tadasana hoặc link clip24.
- `mcy.foundation.cat-cow` là bài đọc chuyển động; nếu catalog có Cat/Cow family riêng, link `component_topic`/`related_topic`, không gọi bài là exact asana duy nhất.
- Cobra và Cobra gentle là hai unit cùng họ; chỉ tạo một family với variant metadata đã chứng minh, không tự nhận tên truyền thống mới.
- Cow Face unit đang quan sát phần tay trên nền ngồi đơn giản; không map thành full Gomukhasana legs hoặc clasp.
- Năm unit identity-blocked: kneeling-backbend/19, low-crow/22, wild-thing-high/23, stand-up/24 và low-wheel/28. Chúng giữ local unresolved topic và không có mapping tới Camel/Crow/Bridge/Wheel/standing-asana chuẩn. Stand-up24 thuộc chuyển tư thế, không là standing foundation. Low-wheel28 có nền cẳng tay/đầu gần sàn, không map Upward Bow qua tên.
- Cobra gentle20 là bản nâng thấp biên tập nguyên tác, chưa exact clip; Cow Face29 là arms-only trên nền ngồi đơn giản; Three-legged Dog30 chọn square-hip editorial. Link family chỉ `related_topic` hoặc `component_topic` có hạn chế, không chứng nhận exact video variant.
- Inventory source clip giữ group/lesson/youtube ID thật. Link từ catalog phải xác nhận record tồn tại và ghi `topic_reference` khi chỉ biết tên/chủ đề; không xác nhận kỹ thuật, bên, transcript hoặc quyền.

## Gate, stop và rollback

Intake sơ bộ gửi root/QC đọc song song. Chỉ sau root + QC GO mới ghi canonical data/schema/README hoặc validator. Trước chạy validator mới: reviewer đọc control và negative fixtures, gồm duplicate ID; unknown taxonomy/ref; missing source; Sanskrit/alias không có evidence; cycles; target không tồn tại; exact-link thiếu chứng cứ; bất kỳ flag public/approved; forbidden cues/difficulty/suitability/benefits fields.

Check sau triển khai dự kiến: parse JSON/schema, stable/unique IDs, taxonomy/ref integrity, per-name provenance/null, alias/tradition scope, quan hệ có nguồn, links current unit/inventory, flags kín và forbidden fields. Có negative fixtures cho trường hợp sai, kiểm không thay đơn vị/app/runtime hiện có. Tất cả ở trạng thái **BLOCKED/chưa chạy** trong intake này.

Stop nếu cần suy tên/variant, nguồn không đọc được, nguồn mâu thuẫn hoặc consumer có thể đưa metadata ra learner. Rollback local là không consume thư mục expansion và giữ version cũ; không xóa record/history để che mâu thuẫn. Không có external write/cost/operation target ở phạm vi nghiên cứu; chỉ public read.

Root/QC/final review: **pending**. Chuyên gia yoga/quyền/editorial/accessibility: **pending**. Không có native/cloud/release acceptance.

## Phụ lục A — source snapshot và seed có căn cứ

Snapshot là sổ nghiên cứu URL/tên đã đọc ngày 18/10/2026, không là bản sao teaching article hoặc snapshot bất biến của website. Nguồn web có thể đổi; catalog cần ghi `accessedAt`, `assertionScope`, locator và exact tên được dùng. Các tên liệt kê dưới đây là pool để chọn seed, **không phải danh sách hữu hạn yoga hoặc số family cuối**. Các derivative cần cân nhắc `pose_variant`, không tăng số family chỉ để đạt quota.

| Source ID và link trực tiếp | Tên English có trong archive, chỉ dùng nomenclature |
|---|---|
| `ye-poses-1` — [page 1](https://www.yogaeasy.com/artikel/category/yoga-poses) | Bharadvaja’s Twist; Boat; Bound Angle / Butterfly; Bow; Bridge; Camel; Cat; Chair / Powerful; Child’s; Cobra. |
| `ye-poses-2` — [page 2](https://www.yogaeasy.com/artikel/category/yoga-poses/page/2) | Cow Face; Cow; Crescent / High Lunge; Crow; Dancer’s; Dolphin; Downward Dog; Eagle; Easy; Extended Hand To Big Toe A–B. |
| `ye-poses-3` — [page 3](https://www.yogaeasy.com/artikel/category/yoga-poses/page/3) | Extended Side Angle; Fish; Forearm Balance; Forearm Plank; Four Limbed Staff; Gate; Half Frog; Half Lord Of The Fishes; Half Standing Forward Bend; Half-Moon. |
| `ye-poses-4` — [page 4](https://www.yogaeasy.com/artikel/category/yoga-poses/page/4) | Hand to Big Toe Forward Fold; Happy Baby; Head to Knee; Headstand; Hero; Heron; Intense Side Stretch; Locust; Lotus; Low Lunge. |
| `ye-poses-5` — [page 5](https://www.yogaeasy.com/artikel/category/yoga-poses/page/5) | Mountain; Pigeon; Plank; Plough; Marichi A; Marichi C; Reclined Butterfly; Reclined Big Toe; Reclining Hero / Saddle; Revolved Head to Knee. |
| `ye-poses-6` — [page 6](https://www.yogaeasy.com/artikel/category/yoga-poses/page/6) | Reverse Warrior; Revolved Triangle; Seated Forward Bend; Shoulderstand; Side Plank; Sphinx; Staff; Standing Forward Bend; Standing Splits; Tree. |
| `ye-poses-7` — [page 7](https://www.yogaeasy.com/artikel/category/yoga-poses/page/7) | Triangle; Upward Bow / Wheel; Upward Facing Dog; Upward Facing Wide-Angle Seated; Upward Plank; Warrior 1; Warrior 2; Warrior 3; Wide Legged Forward Bend; Wide Legged Forward Bend C. |

Archive pages 1–7 cho **70 heading entries**, không tự động là 70 family. Chỉ English đã đủ làm canonical seed pending; không bắt buộc điền mọi Sanskrit. Source riêng của pose nên dùng khi cần khẳng định variant/alias/context mạnh hơn title của index. Ví dụ lấy source-attested Bhujangasana tại mục Cobra; không tự suy mọi pose còn thiếu Sanskrit qua trí nhớ.

Nguồn Sivananda12 bổ sung context có tên Kakasana và Pada Hastasana; nguồn YogaPoint có thêm Shavasana, Swastikasana, Tadagasana, Vajrasana, Makarasana, Anantasana, Simhasana, Kukkutasana, Mayurasan. Đây là candidate có chữ thật trong [directory](https://www.yogapoint.com/info/yogasana.htm), không nhập level hay prescription của directory. Seed có thể thêm một số mục này để phủ nền quỳ, nằm nghỉ và tên theo lineage. Sanskrit/English chỉ ghép khi chính mục nguồn ghép; không tự đồng nhất các tên na ná.

Các tư thế đảo thân/cân bằng tay/đưa chân lên đầu trong nguồn vẫn chỉ metadata; `metadata_only` không xác nhận khả năng tự thực hiện. Chưa có chuyên gia yoga thật duyệt seed hoặc lựa chọn variants.

### Xung đột tên phải giữ lại

1. [Warrior 3 article](https://www.yogaeasy.com/artikel/warrior-3) có heading gắn Prasarita Padottanasana, còn image label trong cùng trang ghi Virabhadrasana III; archive cũng dùng Prasarita Padottanasana cho wide-legged fold. **Không lấy heading sai khả nghi làm Sanskrit canonical hoặc alias.** Seed Warrior III có thể giữ English, Sanskrit null, `nomenclatureStatus: unresolved` cho tới nguồn đối chiếu khác.
2. [High Lunge](https://www.yogaeasy.com/artikel/crescent-pose-high-lunge) và Low Lunge trong archive cùng có Anjaneyasana. Giữ hai entity theo English và metadata gót/gối chỉ khi nguồn cho phép; Sanskrit null hoặc source-scoped alias unresolved, không merge qua cùng Sanskrit.
3. Crow trong YogaEasy dùng Bakasana, trong [Sivananda12](https://sivananda.org/teachings/12-basic-asanas/) dùng Kakasana; YogaPoint có Bakasan gắn Heron. Không dùng alias toàn cục để gộp những record này hoặc xác minh clip22.
4. Mountain: YogaEasy dùng Tadasana, YogaPoint có Parvatasana. Không lấy từ English giống nhau để merge context khác; Parvatasana để riêng/chưa đưa seed nếu chưa nghiên cứu exact page.
5. Reclining Hero/Saddle là heading gộp của YogaEasy. Không tự xác nhận mọi Saddle trong Yin là exact Supta Virasana; alias phải giữ context hoặc pending.

Những điểm trên cho thấy `source_attested` chỉ xác nhận nguồn có chữ đó, **không bằng kiểm chứng tên đúng hoặc đồng nhất xuyên truyền thống**. Cần riêng `nomenclatureStatus: pending | unresolved`; chưa có enum approved ở seed.

## Phụ lục B — breadth kỹ năng và kiến thức

Các nhãn Việt dưới đây là **editorial_label pending của MCY**, không là chữ Việt source-attested, không là bài tập hoặc checklist đánh giá người học. Source chỉ cung cấp khái niệm để biên tập. ID chưa phải canonical trước GO.

| Nhánh | Candidate skill slugs và nhãn ngắn | Căn cứ conceptual |
|---|---|---|
| Đọc cơ thể/nền đỡ | `body-awareness` — nhận biết cơ thể; `support-point-literacy` — đọc điểm tựa; `joint-motion-literacy` — nhận biết hướng chuyển động khớp; `side-difference-observation` — quan sát khác biệt hai bên; `personal-range-observation` — nhận biết khoảng chuyển động | `ye-awareness`; `ya-rys-standards` phần biomechanics. Đây là chia nhỏ biên tập, không danh sách chuẩn của các nguồn. |
| Di chuyển/chuyển tư thế | `weight-shift-literacy` — đọc chuyển trọng tâm; `ground-transition-literacy` — nhận biết chuyển nền sàn/đứng; `entry-exit-literacy` — đọc đường vào/ra; `movement-breath-coordination` — quan hệ chuyển động/hơi thở; `sequencing-literacy` — nhận biết thứ tự | `ye-awareness`, `ye-high-lunge`, `ya-rys-standards`; stand-up24 chỉ link local unresolved transition. |
| Cân bằng | `standing-balance-literacy` — đọc nền một chân; `hand-support-balance-literacy` — đọc nền tay; `forearm-support-balance-literacy` — đọc nền cẳng tay | `ye-poses-2`/`ye-poses-3`; `ya-rys-standards`. Không là progression hoặc khẳng định an toàn. |
| Hơi thở | `breath-awareness` — quan sát hơi thở; `abdominal-breathing-topic` — chủ đề thở bụng; `yogic-breathing-topic` — chủ đề Yogic Breathing; `alternate-nostril-topic` — chủ đề thở luân phiên; `ujjayi-topic`; `bhramari-topic`; `viloma-topic` | [YogaPoint Pranayama directory](https://www.yogapoint.com/info/pranayama.htm), các heading tên; không copy cách làm/ratio/giữ hơi/claims. Không gộp mọi Anuloma Viloma và Nadi Shodhana qua một alias. |
| Chú ý/nghỉ | `attention-anchor-topic` — chủ đề điểm chú ý; `meditation-observation` — nhận biết thiền; `relaxation-literacy` — nhận biết phần nghỉ; `mantra-topic`; `mudra-topic` | [YogaPoint meditation](https://www.yogapoint.com/info/meditation.htm) chỉ tên/concept target/mantra; `sivananda-5`; `ya-rys-standards`. Không nhập lời kiểm soát tâm trí hoặc gán cảm xúc tốt/xấu. |
| Giao tiếp/tự phản tư | `choice-communication` — nói lựa chọn/giới hạn; `consent-communication` — trao đổi đồng thuận; `self-reflection` — tự phản tư | `ya-code`, `ya-scope`, `ya-rys-standards`. Không thay consent hiện hành trong app hoặc gọi đây là training certificate. |

Pool trên có **28 skill candidates**, có thể giảm/gộp sau QC; không cần tăng số. `ground-transition-literacy` là đề xuất biên tập qua current unit + khái niệm entry/exit, chưa là kỹ thuật có nguồn đủ để dạy.

Knowledge riêng: thuật ngữ asana; phân biệt posture/transition/sequence; lịch sử và lineage; quan hệ Hatha/Ashtanga theo ngữ cảnh nguồn; ethics/yama-niyama; consent/agency trong dạy yoga; pranayama và breath awareness như khái niệm; dharana/dhyana theo context; mantra/mudra như thuật ngữ; giới hạn hình tĩnh và nguồn/transcript. Đây là pool khoảng 10 chủ đề, không tính vào 28 skills. Yama/Niyama/Dharana chỉ ghi Sanskrit khi source có đúng chữ; nhãn Việt giải thích vẫn editorial pending.

Nguồn pranayama còn có Bhastrika/Surya Bhedan và các tên kỹ thuật khác. Nếu sau này thêm chúng thì chỉ metadata tên/context; không cần thêm vào seed hiện tại để đủ số. Không tạo hướng dẫn tự tập cho kỹ thuật nâng cao, breath retention, bandha hoặc cleansing.

## Phụ lục C — schema proposal để xét GO

Hợp đồng đề xuất có `additionalProperties: false` ở mọi object đã định nghĩa. Chỉ dùng tập JSON Schema keywords mà checker thực sự hỗ trợ; không thêm dependency/package để hỗ trợ `oneOf`. Có thể dùng common closed object + semantic kind checks thay conditional schema phức tạp. Checker phải từ chối keyword không hỗ trợ và kiểm kind-specific fields/relations riêng; không im lặng bỏ qua schema. Cấm cue/media/difficulty/suitability/benefit fields bằng cách không có trong schema; validator còn kiểm ref/domain/link/flags mà JSON Schema không bao phủ.

| Object | Trường bắt buộc và constraint dự kiến |
|---|---|
| Envelope | `schemaVersion`, `taxonomyVersion`, `status: metadata_only`, `scopeNote`, `nonExhaustive: true`, `sources`, `taxonomies`, `entities`, closed flags/review/approvalRecords[] |
| Source | `id`, `kind: web_teaching | local_draft_inventory`, `url`, `repoPath`, `sha256`, `title`, `publisher`, `accessedAt`, `usage: nomenclature_and_classification_only`, `limits`. Web: HTTPS URL, repoPath/hash null; chỉ source đã mở thành công. Local: url null, exact repoPath+SHA thật; kiểm bytes trước chạy. Retrieval failure chỉ research log, không source assertion. |
| Taxonomy | ID ổn định, `domain: posture | skill | knowledge | local_topic`, label với provenance, `classificationStatus: editorial_proposed`; `parentId` null/known và graph không cycle |
| Common entity | `id`, `kind`, `names: {vi,en,sa}`, `aliases[]`, `taxonomyRefs[]`, `contextRefs[]`, `relations[]`, `existingContentLinks[]`, `sourceRefs[]`, `nomenclatureStatus: pending | unresolved`, closed flags/reviews |
| Name/alias | Null hoặc `{text, locale, provenance, sourceAttested, conceptualSourceRefs, attestationSourceRefs, reviewStatus: pending}`. `source_attested` ⇒ `sourceAttested:true`, attestation refs không rỗng; `editorial_translation/editorial_label` ⇒ false, conceptual refs không rỗng, attestation refs rỗng. `sa` chỉ source_attested/null; alias chỉ source_attested. Local unresolved name dùng editorial_label + local inventory conceptual ref, không giả external attestation. |
| Assertion ref | `{sourceId, scope, locator}`; `scope: name_vi | name_en | name_sa | alias | conceptual_topic | classification | relation | tradition_context`; locator tới heading/page/section đã đọc hoặc exact inventory record. Không chứa instructions hoặc benefit extracts. |
| Pose family | ID prefix pose; taxonomy posture; không `familyId`; tên có nguồn hoặc nhãn biên tập rõ. Có thể chứa nhiều context với khác biệt chưa giải quyết, không tự gộp qua tên. |
| Pose variant | ID prefix variant; đúng một relation `variant_of` tới pose family có evidence; không variant chain hoặc cycle; chưa có evidence thì giữ separate family pending hoặc chưa tạo entity. |
| Skill/knowledge | Domain riêng; không variant_of pose; không duration/reps/achievement/prerequisite; named breath practices là metadata technique topic. |
| Local unresolved topic | ID prefix local-topic; source local unit/inventory có thật; giữ `nomenclatureStatus: unresolved`, không alias/variant_of/exact pose mapping; không tính vào pose-family coverage. |
| Relation | `{type, targetId, basis: source_attested | editorial_topic, sourceRefs, reviewStatus: pending}`. Enum chỉ `variant_of`, `related_to`, `has_named_component`, `study_topic_for`; compatibility theo kinds; không prerequisite/treats/safe_for/recommended_for. |
| Existing content link | `{unitId, revision, locale, unitPath, relation: related_topic | component_topic | unverified_topic, inventoryRefs[], scopeNote}`; kiểm actual ID/revision/locale/path (hiện vi-VN) và exact tuple `{courseId, lessonId, youtubeId}`. Không có exact_match enum ở snapshot này. |
| Closure | Entity + envelope đều `learnerVisible:false`, `recommendationEligible:false`, `publishStatus:unpublished`, `productionStatus:metadata_only`; bốn reviews pending; `approvalRecords:[]`. Không `approved`/boolean true public. |

Ví dụ cấu trúc tên chỉ để reviewer đọc, chưa ghi canonical:

```json
{
  "vi": {
    "text": "Rắn hổ mang",
    "locale": "vi-VN",
    "provenance": "editorial_translation",
    "sourceAttested": false,
    "conceptualSourceRefs": [{ "sourceId": "ye-poses-1", "scope": "name_en", "locator": "Cobra Pose heading" }],
    "attestationSourceRefs": [],
    "reviewStatus": "pending"
  },
  "en": {
    "text": "Cobra Pose",
    "locale": "en",
    "provenance": "source_attested",
    "sourceAttested": true,
    "conceptualSourceRefs": [],
    "attestationSourceRefs": [{ "sourceId": "ye-poses-1", "scope": "name_en", "locator": "Cobra Pose heading" }],
    "reviewStatus": "pending"
  },
  "sa": null
}
```

Không yêu cầu Sanskrit ở ví dụ dù có candidate source; null không phải lỗi completeness. Schema phải từ chối cùng tên Việt dịch ở trên nếu tự đổi provenance thành source_attested mà không có evidence chữ Việt.

Nguồn local cho 5 unresolved topics dùng `kind: local_draft_inventory`, `url:null`, `repoPath:content/yoga-library/inventory.json`, SHA `85b1242a4f9fd06fa8eb53f3a12adb4e1bc401ab277813ff149b0c9a65ebe3ed`. Tên như “Bánh xe thấp” dùng `editorial_label/sourceAttested:false`, conceptual ref locator `records[courseId=poses,id=28]`. Không mượn source Camel/Wheel để chứng minh identity chưa rõ. Unit hashes đang thay theo job ảnh nên chỉ đối chiếu actual unit selector khi chạy, chưa đưa chúng vào local source pin.

### Negative cases tối thiểu trước canonical acceptance

1. Unknown field cue/dose/benefits/difficulty/suitableFor/media → reject.
2. Bất kỳ public/recommendation/publish/approved flag hoặc approvalRecord → reject.
3. Duplicate stable ID/source/taxonomy; empty/non-HTTPS source; sourceRef thiếu source/locator → reject.
4. Sanskrit editorial_translation hoặc tên source_attested không attestation refs → reject.
5. Tên Việt dịch giả sourceAttested hoặc editorial label thiếu conceptual source → reject.
6. Variant parent không tồn tại/sai kind; relation type sai; taxonomy cycle/variant cycle; cross-domain taxonomy → reject.
7. Unit/revision/locale/path không tồn tại/khớp hoặc inventory tuple khác canonical; local source repoPath/hash lệch; local source giả URL external → reject.
8. Exact-match/asana mapping lên 5 local unresolved topics; foundation standing ↔ stand-up24; Cow Face arms-only ↔ full legs → reject hoặc kiểm fail-closed bằng explicit forbidden map fixtures.
9. Xung đột Sanskrit Warrior III bị tự điền từ heading; Crow aliases bị merge xuyên context; High/Low Lunge tự merge → reject bằng data-specific consistency assertions hoặc giữ unresolved đã ghi.
10. Metadata catalog bị tính vào unit/media count hoặc checker bỏ qua expansion → fixture/assertion riêng; manifest pin bytes không được đứng thay semantic result.

Control có giới hạn: schema không thể chứng minh nguồn nói đúng, người dịch giỏi, chuyên gia người thật hoặc phù hợp một cơ thể. Những điều đó giữ pending/BLOCKED cho instructional/public use.

## Phụ lục D — current crosswalk được phép đề xuất

| Current unit | Tuple/link có thật | Quan hệ catalog tối đa ở checkpoint |
|---|---|---|
| `mcy.foundation.standing@r3` | Không sourceRefs | Skill body/support observation; không Tadasana exact hoặc clip24 |
| `mcy.foundation.cat-cow@r3` | poses/27/rWl5ySBsrG0 | Component topics Cat và Cow; bài chuyển động, chưa video exact |
| `mcy.pose.downward-dog@r1` | poses/25/CwhLdstN0dc | Related Downward Dog family; variant biên tập gối gập, chưa exact clip |
| `mcy.pose.high-lunge@r1` | poses/26/oFWjSKxXvKY | Related High Lunge; không giải quyết Sanskrit chung với Low Lunge |
| `mcy.pose.warrior-ii@r1` | poses/31/gkiWrw9hREU | Related Warrior II; chưa xác nhận exact side/clip |
| `mcy.pose.cobra@r1` | poses/21/KtMlgK2cjsU | Related Cobra family; reading/media draft chưa expert approval |
| `mcy.pose.cobra-gentle@r1` | poses/20/54IPJkU7f_o | Related Cobra, original low-lift editorial; chưa exact clip variant |
| `mcy.pose.cow-face@r1` | poses/29/wnenFwBE5oY | Component arms topic; không full Gomukhasana legs/clasp |
| `mcy.pose.three-legged-dog@r1` | poses/30/wYiSFpP7vjs | Related Dog family, square-hip editorial; Sanskrit null nếu chưa nguồn riêng |
| `mcy.pose.kneeling-backbend@r1` | poses/19/McOZ1FW5jBM | Local unresolved topic; không Camel exact |
| `mcy.pose.low-crow@r1` | poses/22/0fs1LCnK3-U | Local unresolved topic; không Crow/Kakasana/Bakasana exact |
| `mcy.pose.wild-thing-high@r1` | poses/23/p3sKiK8szF8 | Local unresolved topic; không chuẩn hoá exact Wild Thing |
| `mcy.transition.stand-up@r1` | poses/24/DOmYgUoQyZI | Local unresolved transition topic; không standing foundation |
| `mcy.pose.low-wheel@r1` | poses/28/6Y-eWBnD8r8 | Local unresolved topic; không Bridge/Upward Bow/Wheel exact |

Các tuple đã đọc từ `inventory.records`; unit sourceRefs cũng chứa chúng với `relation: topic_reference`, `contentObserved:false`. Đây là kiểm tồn tại metadata, không mới xem clip. Các clip gentle/sequence còn lại không được gán asana qua title khi chưa annotation riêng.

Scoped baseline đã đọc (SHA-256, trước canonical; unit/media còn được parent sửa nên chưa freeze chúng):

| Input | SHA-256 |
|---|---|
| `content/yoga-library/inventory.json` | `85b1242a4f9fd06fa8eb53f3a12adb4e1bc401ab277813ff149b0c9a65ebe3ed` |
| `src/courses/freeCourses.ts` | `92cfc2e572a9aa94abdce1843609634a536d80ee29eecb55d12d21ddfa9e5436` |
| `validate-library.mjs` | `cbe8ee17dfcf57e1800f265aa7d0cec0ab63c91cefeec46b87c423482f731541` |
| `create-manifest.mjs` | `abf6ca7e765fd90509a0f7c6d391375c0ba94158bd32898e61edbe4a36b7ce1d` |
| `render-library.mjs` | `71d4fd3cae116e66dd734e7698de1ee55f3c35a9023f6aa426f0f55a77da32c9` |

`rg -n 'yoga-library|expansion' src scripts package.json` không trả match trong checkpoint nghiên cứu. Trước triển khai cần đọc lại nếu app/consumer đổi; không xem kết quả này như chứng minh không thể có consumer gián tiếp.

## Checkpoint handoff intake

- **PASS (read-only discovery):** đã đọc current unit/inventory/tooling cần cho scope; source pages nêu trên đã mở, failure URLs được giữ với giới hạn rõ; đối chiếu source names/conflicts và crosswalk metadata.
- **BLOCKED/chưa chạy:** canonical schema/data/checker/negative fixtures, expansion integration vào manifest/runbook, independent QC và final/root verification. Lý do: đang ở explicit intake gate.
- **Không áp dụng ở intake:** UI/browser/device/cloud/API tests; không thay code hoặc runtime.
- Rollback: bỏ/không consume đề xuất; mọi current unit/media và live trạng thái giữ nguyên. Không có external mutation trong task con này.
