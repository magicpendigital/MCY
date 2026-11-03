# Intake hợp đồng nội dung yoga — 18/10/2026

Read-only discovery của `/root/content_contract_intake`; chỉ tài liệu này được tạo. Root quyết định freeze intake trước sản xuất. Không sửa app/candidate/AGENTS/schema, không kiểm cloud, không suy quyền phát hành từ yêu cầu chuẩn bị nội dung. Đây là đề xuất lưu trữ bản nháp, chưa là hợp đồng runtime đã tích hợp.

## Baseline và inventory

- Đã đọc lifecycle, intake template, `skills/mcy-change-review/SKILL.md`, review matrix, AGENTS và các kế hoạch UX 4.4–4.7. Root đang dirty nhiều luồng; không lấy HEAD hay sửa đè làm baseline. Root đã nhận trách nhiệm đọc referenced chat; tài liệu này không tuyên bố tự đọc chat đó.
- `src/courses/freeCourses.ts:3` là contract video hiện có: `id`, `youtubeId`, `title`, `duration`, `description`, `visibility`, `orientation`, captions. `FREE_COURSES` bắt đầu dòng39: **38 clip ID khác nhau và 38 YouTube ID khác nhau**;18 gentle,13 poses,7 sequences. Đã đếm trực tiếp regex trên source local, không dùng số lịch sử thay kiểm actual source.
- Cả root và `.vercel/ux-step4-{4,5,6,7}-.../src/courses/freeCourses.ts` cùng SHA256 `92cfc2e572a9aa94abdce1843609634a536d80ee29eecb55d12d21ddfa9e5436`. IDs01–38 và group giữ nguyên qua bốn candidate. Đây là đối chiếu bytes nội dung, không phải xác nhận toàn app candidate.
- **38 clip không đồng nghĩa38 tư thế duy nhất.** Nhóm poses có13 record;20/21 là hai phiên bản Rắn hổ mang,27 là chuyển động Bò–Mèo,24 là chuyển tiếp đứng lên. Nhóm gentle có vận động/giãn cơ/chủ đề chung;17/18 chưa có tên cụ thể.32–38 là chuỗi, chưa có breakdown. Số tư thế thực sự khác nhau của toàn38 **CHƯA XÁC ĐỊNH** vì source chưa có danh mục pose và chưa có content review toàn clip. Không tự gán Sanskrit, mức độ an toàn hay kỹ thuật từ tiêu đề “Quạ thấp”, “Hoang dã cao”, “Bánh xe thấp”.
- Inventory hiện có: `analyse/ux-implementation-2026-10-14/content/clip-inventory.csv` có38 mapping tương ứng, rights/expertise/captions UNVERIFIED và content NOT_REVIEWED. Mẫu `lesson-template.md` cùng thư mục đã có trách nhiệm, audience, dàn bài/chuyển tiếp, quyền, captions và exact review version. Giữ evidence cũ, không ghi đè như đã duyệt.
- Foundation preview: `analyse/foundation-series-2026-10-16/standing-lesson.json` và `tabletop-lesson.json` là hai bài5 bước đầy đủ, ID `standing` và `tabletop`; `assets/photo-media.json` là overlay10 ảnh AI. `rest` trong preview còn concept. Hai bài đầu là biên tập chưa chuyên môn/quyền; photo không phải bằng chứng giáo viên hoặc kỹ thuật đúng. Chỉ `tabletop` có chủ đề tương ứng clip27; chưa có bằng chứng bài chữ tái hiện hay transcribe chính clip27.

## Các contract phải giữ tách

1. **Video source record:** giữ legacy `courseId` + `lessonId`01–38 + `youtubeId` chính xác, không đổi thứ tự/visibility/captions. Một reference link không phải quyền tái sử dụng hình/âm thanh.
2. **Bài đọc tư thế/chuyển động:** loại mới, có bước/hình/alt/caption/nguồn và review riêng; không nhét vào `CourseLesson` hoặc giả `learning_intro` để bỏ gate.
3. **Buổi tập đã duyệt:** `supabase/functions/_shared/practiceContract.ts:16` yêu cầu version SHA64, durationSeconds thực hành, eligibility và review approved còn hạn; đây không phải schema nháp. `LessonSection:15` hiện chưa có alt/caption/provenance. `reviewedPracticeCatalog.ts` vẫn rỗng có chủ ý; tuyệt đối không đưa draft vào đó hay tự điền approved=true.
4. **Owner review candidate:** `contentReviewCandidates.ts` hiện chỉ `preparation-draft` scope `learning_intro` công khai không dạy động tác. Không import tài sản nháp vào registry/client bundle. `CONTENT-ADMIN-CURRENT.vi.md` và `CONTENT-ADMIN-PROPOSAL.vi.md` phân biệt Owner review hẹp và private teacher collaboration local; chưa có pipeline CMS ảnh từng bước/publish.

Ba file contract ở mục3–4 có bytes giống root và cả candidate4.4–4.7. Hash root: practiceContract `e52debcc8dd088e249a3b90f049ddc59d786582dadc1f88f96e54caf24eb0e17`; contentReviewCandidates `97b1cf85050861da17f21282a57f773f854e1d53a185cf7d5fdcbed93e680ffe`; reviewedPracticeCatalog `119d31e0aca5854d47c8bb0992b0aed68a9a24224fa76646053350c34d911f1e`.

## Đề xuất package draft chờ root chốt

Dùng thư mục riêng **`analyse/yoga-content-production-2026-10-18/`** làm staging nội dung local: `manifest.json`, `inventory.json`, `units/<contentId>/<revision>.json`, `media/`, `evidence/`, `reviews/`. Đây là layout đề xuất; root cần chọn tên cuối một lần trước workers. Không đặt trong `src`, `public`, Supabase migration hoặc sửa candidate UX. Dữ liệu JSON UTF-8 là nguồn chính; Markdown đọc được sinh từ JSON tránh hai nguồn lệch nhau.

Các ID source hiện có là canonical cho clip; content ID mới có namespace riêng và crosswalk explicit. Ví dụ `sourceRefs:[{courseId:"poses",lessonId:"27",youtubeId:"rWl5ySBsrG0",relation:"topic_reference",contentObserved:false}]` khác với `relation:"exact_video_transcript"`. Không tự cấp relation sau nếu chưa xem/đối chiếu. `standing` giữ alias preview, không đổi thành clip24 (đứng tĩnh khác chuyển tiếp đứng lên).

Contract đề xuất của một unit:

- `schemaVersion`, stable `id`, `aliases`, `revision`, `parentRevision`, `locale:"vi-VN"`, `kind:"pose_education"|"movement_education"|"transition_education"|"sequence_education"|"source_record"`, `seriesId`, sourceRefs và quan hệ chính xác.
- `productionStatus:"metadata_only"|"editorial_draft"|"media_draft"|"review_requested"`, **`learnerVisible:false`, `recommendationEligible:false`, `publishStatus:"unpublished"`** cố định trong package này. Trạng thái hoàn thiện nội bộ tách chuyên môn/quyền/phát hành.
- `title`, `shortTitle`, `intro`, `learningObjectives`, `scope`, audience/exclusions/prerequisites, preparation, stopGuidance, alternatives; không claim chữa trị hay gán beginner-safe từ tên nhóm.
- `readTimeSecondsEstimate` tách `practiceDurationSeconds:null`; chưa có liều tập thì null, không biến số phút đọc thành thời lượng động tác.
- `steps[]` có ID ổn định/thứ tự, title, body, detail, entry/exit, alternative, stopCue và mediaRefs; số bước theo nội dung thực, không ép mọi chuỗi vào5 hình. Bài mới có quan sát/chuyển vào/chuyển ra được giải thích trong scope; phần chưa có bằng chứng để null + blocker, không sinh lời chắc chắn.
- `media[]`: stable assetID, package-relative path hoặc null, variant photoAI/illustration/video, role, mime, width/height, SHA256 hoặc null, alt/caption đúng pixels, locale/transcript khi có, synthetic disclosure + provenance/tool/date/promptRef, quyền/trạng thái chuyên môn riêng. Không lấp null bằng ảnh sai tư thế hoặc tái dùng hình chỉ vì cùng nhóm.
- `sources[]` gồm URL/title/source type/date/use và giới hạn; AI synthesis không được trình bày như transcript video/Huyền My viết. Không hard-code attribution giáo viên khi profile/quyền chưa đủ.
- `reviewRequirements`, `reviewStatus:{expert:"pending",rights:"pending",editorial:"pending",accessibility:"pending"}`, `approvalRecords:[]`, blockers, changeLog. Chưa có người thật thì không tạo tên/chuyên môn/ngày quyết định giả. Review/hash gắn toàn copy + thứ tự + alt/caption + bytes media. Đổi ảnh tạo revision mới.
- Manifest có exact file/hash/size và imported preimages, số unit theo status, source inventory count, required expertise/rights gates và adapter target. Không tự hash manifest trong chính manifest.

**Coverage:** tạo đủ38 `source_record` mapping để không bỏ mất video, nhưng chúng không phải38 bài mới hoàn tất. Chỉ tạo bài giáo dục có danh tính/phạm vi xác định; các record mơ hồ vẫn metadata_only + cần chuyên gia xác định. Mỗi pose có thể liên kết nhiều clip/variant; sequence liên kết nhiều unit theo thứ tự sau review, không sao chép poses thành38 bản trùng.

## Impact map và gates

| Entry/dependency | Dữ liệu thay đổi | Consumer/bảo toàn | Phép kiểm phù hợp |
|---|---|---|---|
| Free-course38 + CSV | crosswalk local | Giữ01–38/group/YouTubeID/duration/captions/visibility | Đếm38 unique + so sánh từng field byte/source; không cần chạy player/cloud |
| Foundation JSON + media overlay | migrate/bao gói có revision | Giữ lời/ảnh hiện có và disclosure, không đổi receipt16Oct | Canonical content diff, file/hash/dimensions/alt/caption review; sourceRef không giả transcript |
| Units mới + media | Health guidance + ảnh AI | Reader tương lai, chuyên gia/rights/editorial | R3 nội dung: source-backed cue review, ảnh giải phẫu/tư thế/chuyển tiếp, independent QC + **chuyên gia người thật còn BLOCKED** |
| Draft schema/validator | Hợp đồng dữ liệu local | Không bundle/import/publish/recommend | Reject duplicate IDs/order, broken refs/path traversal/missing media/hash mismatch, approved/published flags, read/practice confusion; negative fixtures |
| Manifest/crosswalk | Handoff sang UX task | UX4.4–4.7 đang có source riêng | Pin shared4 files + no app/candidate changes; gửi manifest/path/contract sau freeze |
| Auth/roles/consent/backend/native/web | Không đổi | HALTED native, web blocked, teacher boundaries giữ nguyên | NOT_APPLICABLE vì không call/modify những surface này; không dùng app tests làm giả acceptance |

Rủi ro cao nhất của **sản xuất health guidance/media là R3**, dù package chỉ nháp. Tài liệu intake này R0. Không có yêu cầu chạy cả build/UI suite cho doc/JSON local không được import; làm vậy không chứng minh chất lượng yoga. Nếu có adapter/reader/CMS/app changes về sau, lập intake tương ứng và chọn gates R1–R3 theo diff thực.

Tests hiện hành đã đọc: `package.json`, `playwright.config.ts` (`testMatch:"**/*.spec.ts"`), `tests/learner-ux.spec.ts` có guest browse, lazy course routes, course scope truthfulness, player recovery, VI/EN navigation; `tests/reviewed-practice-catalog.test.mjs` có empty-catalog fail-closed và exact text/scope/media mutation rejects. Bounded đề xuất cho package: validator tests mới + no-import/scope assertion; tùy root có thể chạy existing catalog tests chỉ để xác nhận closedstate, không cần unrelated Auth/browser. Chưa chạy các test này trong intake, trạng thái **BLOCKED (unrun)** chứ không PASS.

## Boundary và bàn giao

Root quản lý freeze/ownership và phối hợp referenced UX task; workers chỉ sửa files được giao. Các bản16Oct,38clip source và toàn candidate UX giữ nguyên. Rollback local là không consume package mới, giữ preimages; không đề xuất reinstall/rollback live. Human expert/rights/content release và CMS/adapter là dependency riêng, không được tự đóng khi kỹ thuật pass.

Read-only checks đã thực hiện PASS:38 unique record/youtube count;4 shared files root so với4 candidate đều cùng bytes. Không kiểm video/provider hiện tại, không xem/transcribe/upload MOV, không AI runtime/provider call, không cấp quyền/email/native/deploy/cloudwrite. Intake sẵn sàng root review; **chưa sản xuất nội dung** trong phạm vi agent này.
