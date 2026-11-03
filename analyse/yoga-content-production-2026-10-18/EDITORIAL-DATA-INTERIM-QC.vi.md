# Interim QC dữ liệu/biên tập —18/10/2026

Reviewer độc lập:`/root/content_independent_qc`. Theo phân công của root, đây là review giữa quá trình sản xuất12unit mới và các control cục bộ, **chưa phải final QC/freeze và không là duyệt chuyên môn yoga/quyền**. Media35ảnh đang được tạo nên không cho verdict hình/alt/caption hoặc coverage cuối. Không sửa source, unit hoặc media; chỉ ghi findings này.

## Findings cần xử lý trước final freeze

### P2 — Câu mô tả gối là nền đỡ ở Bánh xe thấp

`content/yoga-library/units/low-wheel/r1.json:132`, step4 hiện viết:“Hai bàn chân và đầu gối vẫn thuộc nền của hình ngả sau.” Trong contact sheet supplement pose0, hai bàn chân và cẳng tay ở thảm; hai gối đang gập và rời sàn. Cụm“thuộc nền”có thể bị hiểu là điểm tựa/chịu lực, nhất là toàn bài dạy đọc điểm tiếp xúc. Đề nghị tách rõ:“Hai bàn chân tạo điểm tiếp xúc với thảm; vẫn cần nhìn đầu gối cùng thân và tay…” Không tự suy tải trên đầu/cổ hoặc thêm hướng dẫn thực hành. Nội dung khác của unit đã giữ head-load unknown đúng với pixels.

### P2 — Observation record không được đối chiếu vào evidence nó khai báo

`validate-library.mjs:80` chỉ yêu cầu timestamps không rỗng và evidence file tồn tại. `sourceSha256`, `fileName`, mỗi timestamp không được match với record/frame thực của evidence JSON. Bốn probe in-memory bên dưới cho thấy ba bản observation bịa vẫn PASS. Gói này dựa vào sự phân biệt“đã thấy pixels”với“timestamp browser báo”; vì vậy chỉ hash tài liệu provenance chưa ngăn unit khai observation không có trong tài liệu đó.

Đề nghị resolver kiểm đúng source filename+SHA, timestamp nằm trong tập **visible** của initial/supplement được khai, không lấy cột đen/readyState làm evidence; unit cần bind nhiều evidence refs nếu trộn initial và supplement. Một số unit đang có timestamp từ cả hai tài liệu nhưng observation.evidenceRef chỉ trỏ supplement; ví dụ low-wheel29.437s là initial-visible, supplement cột3 đen. Cần biểu diễn provenance hợp lệ cho từng tập timestamp thay đơn giản bỏ timestamp để kiểm xanh. Thêm negative cases cho sai source SHA/file, timestamp chưa thấy và timestamp chỉ có black column.

### P2 — Present AI asset có thể mất toàn bộ provenance sản xuất mà validator vẫn PASS

`library-contract.mjs`cho phép null tool/date/source/prompt; `validate-library.mjs:89–99` chỉ kiểm trường provenance nếu có. In-memory mutate một ảnh foundation hiện hữu sang tất cả null vẫn được chấp nhận. Pixels có hash chưa đủ để truy lại prompt/tool/ngày cho review hoặc quyền.

Đề nghị khi status=`draft_present`, bắt buộc tool,createdAt,promptRef và sourcePath/sourceSha256 hoặc một production evidence tương đương được pin. Imported media phải giữ provenance nguồn16Oct; media mới phải trỏ log/prompt sản xuất thực. Unproduced media vẫn được giữ null. Thêm negative case xoá provenance trên present asset; đây là kiểm draft provenance, không tự nâng quyền/approval.

### P2 — Freeze loại mọi file tên manifest.json thay vì chỉ root manifest

`create-manifest.mjs:11`và`verify-manifest.mjs:13`filter bằng basename. Một file mới như`media/unrelated/manifest.json`bị cả freeze và verify bỏ qua. Manifest dùng để đóng gói mọi artifact trong canonical folder; chỉ chính`content/yoga-library/manifest.json`cần tránh self-hash. Đề nghị so exact resolved path và thêm negative case file manifest lồng ngoài root phải được pin hoặc bị reject. Chưa có bằng chứng file lồng như vậy đang tồn tại; đây là gap của control trước handoff.

## Probe độc lập đã chạy

Node ES module qua stdin, import trực tiếp`validateUnit`,load inventory/unit thực rồi`structuredClone`và mutate trong RAM. Không lưu clone hoặc thay file. Process exit0; kết quả accepted là defect được quan sát, không phải negative-test PASS.

| Probe | Đầu vào nền | Kết quả hiện tại |
|---|---|---|
|sourceObservation SHA→64số0|kneeling-backbend/r1|**FAIL control:**accepted=true|
|timestamp→99999|kneeling-backbend/r1|**FAIL control:**accepted=true|
|fileName→Invented.mov|kneeling-backbend/r1|**FAIL control:**accepted=true|
|media0 tool/date/sourcePath/sourceSHA/promptRef→null|foundation-standing/r3|**FAIL control:**accepted=true|

Đã đọc toàn source validator/schema/tests/manifest-generator/verifier hiện tại. Các negative đang có cho published/visible/recommendable/fake approval/expert approved/practice duration/source mapping/path/hash/dimensions/schema drift là đúng hướng. Cần rerun chúng sau sửa control và bổ sung các gap trên. PNG checker hiện chỉ kiểm signature/IHDR/dimensions/IEND; final cần thêm malformed/truncated PNG fixture thay coi header là full decode proof. Chưa tuyên bố một ảnh hiện tại malformed.

## Kết quả review copy/nguồn hiện tại

Đã đọc body/detail/entry/exit/scope/prerequisites/preparation/blockers/sources của toàn12unit mới. Không thấy claim chữa trị, auto-progress, người mới mặc định phù hợp, số nhịp bắt buộc hoặc giả teacher approval trong copy đã đọc. Tất cả giữ learnerVisible/recommendationEligible=false,publishStatus=unpublished,practiceDuration=null,review pending. Đây là kiểm copy hiện tại, không bảo đảm hướng dẫn chuẩn hoặc phù hợp cho mọi người.

| Nhóm | Đối chiếu nguồn primary và copy | Giới hạn |
|---|---|---|
|cobra/cobra-gentle|Nền khung chậu/chân, khuỷu gập, cổ, hạ thân có căn cứ trong[YogaEasy Cobra](https://www.yogaeasy.com/artikel/cobra-pose)và[ACE Cobra](https://www.acefitness.org/resources/everyone/exercise-library/16/cobra/). Copy không nhập liều và phân biệt original variant với clip20/21.|Không xác nhận clip20là BabyCobra/Sphinx hoặc bản thấp an toàn hơn.|
|downward-dog|Nền tay–gối, nâng hông, gối gập/gót không ép và trở lại có trong[YogaEasy Downward Dog](https://www.yogaeasy.com/artikel/downward-dog-pose);[ACE](https://www.acefitness.org/resources/everyone/exercise-library/18/downward-facing-dog/)chỉ làm đối chiếu hình theo use đã ghi.|Không nhập chuỗi push-up hoặc drill; không chứng minh người học chịu lực tay phù hợp.|
|high-lunge|Copy giữ chân trước/sau, gót sau nâng, quan hệ gối/cổ chân và nhiều entry options của[nguồn High Lunge](https://www.yogaeasy.com/artikel/crescent-pose-high-lunge).|Bài cố ý chưa cung cấp đường thực hành; không gọi đã đủ5bước tự tập.|
|cow-face|[Nguồn Cow Face](https://www.yogaeasy.com/artikel/cow-face-pose)có lựa chọn phần tay riêng, không bắt ngón gặp nhau. Copy arms-only khớp scope, không nhập phần chân chồng/forwardfold.|Chưa nhận exact variant hoặc bên clip29.|
|three-legged-dog|[Five Parks Yoga](https://fiveparksyoga.com/yoga-poses/three-legged-dog/)có hips-level/open distinction, leg-lower option và shoulder-sinking concern. Original variant giữ hips-level đúng với source use.|Không coi số thứ tự là cấp tiếp theo hoặc tự động nối lunge.|
|warrior-ii|Hướng chân, tay/đầu, gối trước và straightening trước đổi hướng có trong[nguồn WarriorII](https://www.yogaeasy.com/artikel/warrior-2-pose). Copy không nhập liều hoặc góc cố định cho mọi cơ thể.|Cách đặt chân/chuyển vẫn cần expert review.|
|5observation units|Đã mở lại source Camel/Crow/WildThing/HalfStandingForwardBend/Wheel; sources.use không tự nhận exact local variant. Đã xem trực tiếp5private contact sheets: initialpose8,supplementpose0/5/6/7; mô tả chính khớp pixels, ngoại trừ cách gọi gối là nền ở finding trên.|Không xem MOV liên tục/audio, không xác minh bên, tải trên đầu/cổ hoặc MOV↔YouTube.|

Safety source use được kiểm có giới hạn: [NCCIH](https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety)nêu hướng dẫn có chuyên môn/cá nhân hoá; hai trang[NHS chair-based video](https://www.nhs.uk/live-well/exercise/pilates-and-yoga/chair-based-pilates-exercise-video/)và[Strength/Flex](https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/)có nguyên tắc dừng khi đau/không khoẻ và tìm hỗ trợ nếu lo ngại/không hết. Không dùng chúng làm kỹ thuật từng pose, không mang số liên hệ UK sang copy MCY. Mở web18/10/2026 không tạo quyền tái sử dụng media.

## Boundary của review này

Media35ảnh/alt/caption/changelog và blockers“chưa có ảnh”đang thay đổi: **BLOCKED cho review cuối**, cần đọc theo final bytes. Inventory backlinks/coverage/manifest đang lắp: chưa cho verdict. Hai foundation import chưa được review kỹ thuật đầy đủ trong lượt interim; chỉ dùng một unit thật làm probe. Human expert/rights/accessibility/release vẫn BLOCKED.

Sau các sửa copy/control, root freeze lại exact units/schema/validator/tests/artifacts rồi giao final QC. Reviewer độc lập sẽ kiểm dispositions và các negative bổ sung; root final verification và sync UX là bước riêng.
