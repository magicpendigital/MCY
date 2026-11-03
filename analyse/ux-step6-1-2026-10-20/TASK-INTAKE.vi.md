# Intake 6.1 — hồ sơ vận hành pilot, chưa chạy với người tham gia

20/10/2026 · **READY_FOR_INTAKE_QC; chưa triển khai bốn tài liệu đề xuất.** Chỉ ghi intake này và [BASELINE.json](BASELINE.json). Dùng skill mcy-change-review/lifecycle và mcy-brand-ux cho tiếng Việt, lựa chọn tùy ý và không hứa hiệu quả. Không đổi kỹ năng, workflow chung hoặc source ứng dụng.

## Quyết định và kết quả cần đạt

Owner yêu cầu mới: **“Triển khai bước tiếp theo.”** Bước6 trong [PLAN14/10](../ux-implementation-2026-10-14/PLAN.vi.md) là pilot text+hình, tách Tìm hiểu/Thực hành,5–8người/hai vòng định tính. **6.1 là phân đoạn mới do task này đề xuất:** chuẩn bị hồ sơ readiness và vận hành trên giấy trước khi có thể chạy pilot; không nói plan gốc đã duyệt sẵn tiểu mục6.1 hoặc UI tách hai route đã tồn tại. Người dùng tiếp tục yêu cầu Agent thực thi → QC độc lập → root trực tiếp kiểm → báo cáo và dừng chờ duyệt.

Owner vừa trả lời: **“Đã có; tôi sẽ cung cấp quyết định và phạm vi.”** Trạng thái `OWNER_REPORTED_DECISIONS_EXIST_DETAILS_PENDING`. Không khẳng định chưa có quyết định ngoài đời; chưa nhận người/basis/ngày/exact(id,revision,locale,path,SHA,asset hashes)/mục đích và phạm vi sử dụng để đối chiếu tại task này. Canonical vẫn pending/approvalRecords rỗng. Actual pilot `BLOCKED_DETAILS_PENDING`; không tự ghi approval hoặc truy cập contacts để lấp chỗ trống. Root đang chờ facts từ Owner; Agent có thể chuẩn bị hồ sơ độc lập, không hỏi phép lại.

Nghiệm thu dự kiến sau GO: bốn tài liệu vận hành đọc được, dẫn lại đúng protocol sẵn có, phân biệt người/lượt, route/task/review và các điều kiện chưa đủ; kịch bản không hướng dẫn vận động, không cho thấy draft chưa duyệt, biểu mẫu kết quả rỗng không bịa dữ liệu. IndependentQC kiểm nội dung/links/negative walkthrough, root đọc trực tiếp artifact, rồi STOP. Đây không là tuyển người, phát consent thực, chia sẻ artifact hoặc chạy vòng thử.

## Baseline thực và tài liệu tái sử dụng

BASELINE SHA256 `aa7d1ebce9ab68bf3a74d2ee8950a8319cdb6b205fdcd5558b52a540d161d1f4`: manifest `content/yoga-library/manifest.json`44.303bytes/168inputs/SHA `0fa137d5ea658fadfdb8a1ab97e5fd86550a03b82fbed972530b338e65d114b1` cùng168 hash+bytes khớp;71core reader,255candidate source,59client và35rootdirty đã pin, không mismatch. Những đọc/hash này không import module hoặc chạy validator/app. HEAD và exact reference hashes ở baseline; HEAD riêng không đại diện dirty workspace.

5.3 đã đạt local snapshot rebind: [root final](../ux-step5-3-snapshot-2026-10-19/ROOT-FINAL-VERIFICATION.json) `e716526ff7683854d1f7ddf9e8146fdc85345aacfc880b773ea278cc5b4b4da8`; candidate `.vercel/ux-step5-3-rebind-20261019-v1` giữ nguyên. Node13/probe/rootUI19/10 là bằng chứng local reader, cleanup/freshpins20/10; không phê duyệt nội dung cho participant. Gói14readingdrafts/70steps/55presentmedia/25identity_blocked/114metadata planning vẫn unpublished,learnerVisible=false,recommendationEligible=false,practiceDuration=null; catalog practice thật trong candidate còn rỗng. Manifest chỉ pin bytes, không authority.

Đã đọc [NEXT-STEPS5.1](../ux-step5-1-2026-10-18/NEXT-STEPS.vi.md), [pilot-test-protocol](../ux-implementation-2026-10-14/content/pilot-test-protocol.md), [CONTENT-PILOT](../ux-implementation-2026-10-14/content/CONTENT-PILOT.vi.md), lesson-template, canonical integration handoff, docs/content-review và finalpackageQC. Protocol đã có câu hỏi nghiên cứu,5–8adult/hai vòng,nhiệm vụ,consent/ghi chú tối thiểu,stop,giờ biên tập/review. NEXT-STEPS đã phân biệt clip/readingunit/session/course và exact-version review. **Tái sử dụng, không tạo protocol/inventory/schema/validator thứ hai, không sửa tài liệu cũ hoặc chép14bài vào packet.** Packet mới chỉ cụ thể hóa việc chuyển giao moderator/mapping/review evidence/kết quả rỗng còn thiếu.

Mỗi vòng không phải5–8người riêng. Mục tiêu5–8người **khác nhau** toàn pilot; phân bổ3–4lượt vòng1 và2–4lượt vòng2 chỉ cho5–8người khác nhau khi không trùng. Nếu có người quay lại, phải ghi riêng uniqueCount/attendanceCount/returningCount; không đếm họ hai lần để đạt cỡ mẫu. Lịch/đối tượng/tiêu chí tuyển/quota/việc quay lại vẫn là đề xuất cần Owner xác định trước tuyển; không dùng số0do chưa chạy làm kết quả quan sát.

## Phạm vi, rủi ro và file ownership

**R0 theo diff tài liệu không đổi hành vi**, nhưng QC bắt buộc do user và cần xem kỹ ranh giới health/consent/rights/access. Không thay Auth/consent sản phẩm,control/runtime/ACL hoặc đưa health guidance; nếu đổi những phần này hay triển khai route/server/pilot thật thì là scope mới, cập nhật intake/risk thích hợp trước làm. Consent UX đề xuất trong packet không là legal approval. Không cần web research/khẳng định quy định hay thông số bên ngoài; dùng nguồn dự án đã pin và ghi UNKNOWN.

Implementer `/root/snapshot53_sync` chỉ sở hữu hai file intake hiện tại; sau source/doc GO dự kiến tạo đúng4file dưới thư mục mới này:

| File dự kiến | Bổ sung vận hành, không thay nguồn cũ |
|---|---|
| `PILOT-READINESS.vi.md` | Mục tiêu,2vòng/unique-attendances,checklist facts thật cần nhận,đối chiếu exactversion/purpose,ownership chưa phân công,delivery/retention pending và stop trước tuyển |
| `ROUTE-TASK-MATRIX.vi.md` | Hai đường **trên giấy**: Tìm hiểu đọc/hiểu nhãn/mục tiêu/giới hạn/thoát/ai duyệt; Thực hành chỉ là nhánh pending cần buổi trọn vẹn đã duyệt,không CTA enabled hoặc chuyển readingunit thành session; task kỳ vọng/error/help/measure/abort |
| `MODERATOR-PACKET.vi.md` | Script mở đầu/đồng ý tùy ý/task probes/debrief bằng tiếng Việt trung tính; khung lựa chọn bỏ qua/dừng/không ghi; cách ghi chú tối thiểu,quản lý withdraw,access/retention do Owner điền trước chạy; không bài tư thế/cue/medicalscreening |
| `PILOT-RESULTS.template.md` | Bảng trống observation-vs-interpretation/task/time/help/misunderstanding/reason-return/cost sửa-review; cột unique/lượt; decision table triage/owner/version/evidence/next action rỗng,không PASS/người/quote/review tự tạo |

Reviewer độc lập do root chỉ định; root chỉ điều phối/direct artifact verification; không có người thật được Agent tự phân công. Moderator/editor/qualifiedreviewer/rights/accessibility/data custodian/Owner được ghi theo trách nhiệm và trạng thái pending facts, không gán tên/authority từ contact nomination. Canonical review/template là nơi quyết định nội dung thật; packet chỉ tham chiếu evidence, không chép approval vào JSON.

## Impact và lựa chọn kiểm tra

| Entry/dependency → đầu ra | Phần đổi/preserved | Kiểm tra dự kiến sau GO; expected |
|---|---|---|
| PLAN6 + protocol +5.1 →4doc | Operational supplement,tổng5–8unique/hai vòng,không lập protocol cạnh tranh | Review mapping từng nhiệm vụ/chỉ số về nguồn; arithmetic walkthrough3+2=5,4+4=8; trường hợp người trở lại không doublecount |
| Canonical manifest/human facts → readiness | Dẫn exactbyte/purpose mới đủ xét đưa người xem; báo Ownerđãcó nhưng details pending | Negative walkthrough missing reviewer/rights/version mismatch/intro chưa review vẫn BLOCKED; không invent evidence |
| Tìm hiểu/Thực hành paper matrix → moderator | Đọc khác vận động; không duration/practice/Journey mới hoặc mời participant xem draft | Reviewer đi đọc/thoát/help/decline; practice pending,identity_blocked không tráo ảnh,không dạy movement hoặc suy completion=hiệu quả |
| Consent draft → minimalnotes/results | Tự nguyện,skip/stop/withdraw; notes không health/contact/account/photo/audio | Walkthrough refuse/stop/accidental identifying disclosure; fields tối thiểu,pending owner/location/access/retention+deletion dates phải resolve trước chạy; không hứa xóa ngoài khả năng |
|5.3lease/bootstrap → delivery proposal | Ownerinternalreader không participant route | Actualsource lease15min/bootstrap5min đã đọc; **không sharecap/extend/bypass/reuse cho30–45minpilot**; delivery vẫn pending; offline artifact chỉ khi exactpurpose/rights/access được chọn+duyệt,không export lúc này |
|4doc → independentQC/root handoff | Nội dung/link/claim/ngôn ngữ rõ,results empty | Bounded file/link/hash/empty-template assertions bằng read-only builtins không import app; independentreview và root đọc4doc; freeze exactdocs+references trước finalQC |
| App/source/core/manifest/rootdirty | Không đổi app/JSON/assets/schema/validators/protocol cũ | SHA/bytes sau docs so baseline168/71/255/59/root35 và relevantrefs; không chạy fullsuite/runtime/build/browser vì không đổi executable hoặc frontend |

Không có test/validator/control/generator invocation ở intake. Discovery có hai lỗi locator chỉ đọc (catalog nằm dưới supabase/functions/_shared,Windowswildcardrg) và một guard tên contacts quá rộng chặn image-contactsheet; đã sửa cách đọc/hash, không tạo file/source effects; baseline ghi rõ. Không đọc file email/contact nominations hoặc giá trị capability; asset pin đọc bytes để SHA,không publish ảnh/privateevidence.

## Điều kiện human entry và điểm dừng

Intro **không vận động** hoặc orientation cũng cần exact-version editorial/accessibility/rights/purpose review phù hợp trước người xem; không giả intro cũ được phép vì không có tư thế. Thực hành cần session approved trọn vẹn/timing/transition/media/targetaudience thích hợp;14readingdrafts/9bài có media không thay3buổi được duyệt. Facts Owner sẽ cung cấp phải được đối chiếu, nếu phiên bản thay thì review phần ảnh hưởng, không “latest” tự động. Không chuyển patient/clinicalscreening vào packet; không hỏi triệu chứng hoặc quyết định ai an toàn tập.

Trước pilot thực cần matching human evidence,đối tượng/tuyển phù hợp,delivery cụ thể,consent copy+privacy handling,moderator/data custodian thật,retention/access/deletion/withdraw handling và Owner quyết định chạy rõ scope. Trong6.1 chỉ đề xuất/các ô rỗng; không thu người/notes/contacts/health/account/recording,không gửi email/chats ngoài hoặc tạo session/capability. Dừng nếu hướng soạn cần thực hành/cue/clinical guidance,new role/access/export hoặc source drift; báo root cập nhật scope trước làm. Không app/native/cloud/server/browser/deploy/AI/media writes hoặc sửa canonical/approvalRecords.

Rollback tài liệu: không dùng operational supplement; giữ protocol/canonical/candidate/history không đổi. Native vẫn HALTED/currentActorVerified=false; web BLOCKED_NO_UPLOAD_OR_ALIAS. Sau intake QC/root GO mới triển khai4docs; sau QC và root kiểm hồ sơ6.1 thì báo cáo **STOP chờ Owner**, không tự chạy vòng1 hoặc xây route/khóa5–7bài/AIruntime. Hiện status implementation `BLOCKED_PENDING_INTAKE_QC_AND_ROOT_GO`; pilot `BLOCKED_DETAILS_PENDING`.
