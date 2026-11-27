<!-- plan-template v1 -->
# Kế hoạch — thử nghiệm giảng viên (pilot GV)

Trạng thái: **đang làm P0** (lập 26/11; Owner duyệt quyết định 1–7 ngày 26/11 và yêu cầu triển khai tiếp; quyết định 8–12 còn chờ). Bước 1–5 xong 27/11 (migration staging `20261127031613`, Edge `teacher-control-plane` v1); bước 6–8 chờ Owner và GV1. Lập **trước khi sửa code**; đây cũng là phiếu tiếp nhận (intake) theo [TASK_LIFECYCLE](../../docs/quality/TASK_LIFECYCLE.md). Kiểm bằng `npm run check:plan plans/active/2026-11-26-teacher-pilot.md`. Khi xong, cập nhật `PLAN.md`.

Quy ước riêng tư: kho mã nay **công khai**. Không ghi email của giảng viên vào bất kỳ tệp nào. Owner cho phép (26/11) tên hiển thị của giảng viên đầu tiên là tên thật của giảng viên; trong tài liệu vẫn gọi là **GV1** cho gọn. Email chỉ được Owner nhập vào ô mời, ngay lúc mời.

## 1. Mục tiêu
Owner yêu cầu 26/11: phân tích và lên kế hoạch tính năng giảng viên để bắt đầu thử nghiệm. Cụ thể: (A) giảng viên đăng nhập và soạn bài; (B) học viên đăng ký lớp/khóa của giảng viên; (C) giảng viên dạy, rồi nhận xét học viên sau buổi. Kế hoạch này đi từ phần nhỏ nhất chạy được trước. Lớp trực tuyến dựa trên các quyết định đã có ở [live-class-design §11–§12](../backlog/live-class-design-2026-11-24.md): Owner chấp nhận rủi ro link YouTube không công khai; sĩ số không cố định; người vắng xem bản ghi và vẫn làm bài tập.

## 2. Tiêu chí xong
- P0: GV1 nhận lời mời và đăng nhập `?workspace=teacher` trên Preview. GV1 lưu và gửi duyệt một bài video. Owner duyệt bằng phiên của chính Owner. Bài hiện trong Khám phá, kèm tên GV1 lấy từ hồ sơ GV1 tự nhập. Mỗi bước có biên nhận PASS/FAIL ghi vào `docs/status/`.
- Đợt thử ngoài app: có số liệu thật (số người đăng ký, số người vắng, ai từ chối ghi hình, mẫu bài tập). Số liệu ghi vào kế hoạch LC0 và không chứa dữ liệu cá nhân.
- P1/P2 có kế hoạch riêng (R3) được Owner duyệt trước khi viết mã. Kế hoạch này không tự cho phép làm P1/P2.
- Lệnh kiểm theo mục 10 chạy xanh cho mọi thay đổi mã của P0.

## 3. Phạm vi sửa
- Kế hoạch này chỉ tạo tệp này. Khi Owner duyệt P0, phạm vi dự kiến:
  - `src/staff/owner.tsx`: thay thẻ "PILOT GIÁO VIÊN · ĐANG KHÓA" bằng ô "Mời giáo viên", gọi action `invite_teacher` đã có. Vùng nhân sự.
  - Áp migration `20261002204228_teacher_control_plane_rpcs.sql` lên `mcy-staging`, có tập dượt PGlite trước. Deploy Edge `teacher-control-plane`. Vùng backend.
  - Test: `tests/teacher-control-plane.test.mjs`, `tests/teacher-workspace.spec.ts`, cùng test mới cho ô mời.
- Mức rủi ro cao nhất: **R3** theo [review matrix](../../.claude/skills/mcy-change-review/references/review-matrix.md), vì đụng quyền giáo viên, lời mời, đồng ý và migration staging.
- Hiện trạng: commit `4009feb` trên `claude/dreamy-bardeen-n37gey`. Một agent khác đang gộp mã trên cùng cây làm việc, nên không đổi trạng thái git. Hành vi đang chạy phải giữ: đường khách ≤3 chạm; danh mục Khám phá hiện tại (snapshot hoặc danh mục đóng gói sẵn); workspace Owner; AI tắt.

### Hiện trạng có bằng chứng (đọc mã và tài liệu ngày 26/11)
Trong kho có **ba** nơi giảng viên có thể soạn bài. Chỉ nơi thứ ba đang chạy trên staging.
1. **"Soạn bài" (bản nháp cũ):** `src/staff/teacher.tsx` gọi Edge `teacher-control-plane` (action `list_drafts`, `save_draft`, `accept_invite`, `invite_teacher`). RPC nằm trong migration `20261002204228`. Có test offline `tests/teacher-control-plane.test.mjs` (17 test) và `tests/teacher-migration-contract.test.mjs`. Có test giao diện `tests/teacher-workspace.spec.ts` dùng máy chủ giả. **Staging:** Edge chưa deploy (PLAN.md §4). Migration còn pending theo ledger 12/10 (`analyse/MCY_LEARNER_WRITE_LEDGER_2026-10-11.json`, `remoteApplied: false`). Bản nháp này **không có đường xuất bản**.
2. **Cộng tác riêng tư** (bài, khóa, duyệt chuyên gia, ghi danh, điểm danh, nhận xét sau buổi, gửi nhận xét): `src/staff/TeacherCollaborationPanel.tsx`, Edge `teacher-collaboration`, migration `20261005004000`. Phía học viên có màn "Lớp của tôi" (`src/classes/classApi.ts`), chỉ đọc. Test: `tests/teacher-collaboration.test.mjs`, `.spec.ts`, `-rehearsal.cjs`. **Staging:** chưa áp, chưa deploy ([docs/teacher-collaboration-local-mvp.md](../../docs/teacher-collaboration-local-mvp.md)). Ghi danh do admin làm qua adapter "Miu", phần này chưa nối. Phần này **không kiểm đồng ý `teacher_sharing`**: trong migration và handler không có chữ "consent".
3. **"Bài video của tôi"** (kho nội dung có phiên bản): `src/staff/TeacherContentPanel.tsx` gọi Edge `owner-control-plane` (`save_content`, `submit_content`). Owner duyệt (`review_content`) bằng lời cam kết gõ tay. Owner chỉnh hiển thị và xuất bản snapshot `content-published/manifest.json`. **Staging:** đã áp tới `20261110175347`, Edge v12 (PRODUCT_DECISIONS, PLAN.md §4). Test: `tests/teacher-content.spec.ts`, `tests/content-workspace-handler.test.mjs`, `tests/content-publication.test.mjs`, `tests/content-hub.spec.ts`. Bài video là một mã YouTube (`youtubeId`) kèm tóm tắt, thời lượng, vùng cơ thể và `visibility` (private/unlisted/public).
- **Điểm chặn chung:** SQL chỉ nhận vai "teacher" khi có dòng `private.role_assignments` (role teacher, còn hiệu lực) **và** `public.teachers.active` (`private.mcy_content_review_actor`, migration `20261010113419`). Hiện chỉ một đường tạo được hai dòng này có kiểm toán: `mcy_teacher_accept_own_invite`. Hàm này nằm trong migration `20261002204228`, chưa áp, và được gọi qua Edge `teacher-control-plane`, chưa deploy. Staging hiện có **0 hồ sơ giáo viên đang hoạt động**. Workspace Owner chưa có ô mời: thẻ "PILOT GIÁO VIÊN" ghi "ĐANG KHÓA" (`src/staff/owner.tsx:320`).
- **Đồng ý chia sẻ với giáo viên (`teacher_sharing`)** đã có trong màn đồng ý và Cá nhân (`src/backend/learnerData.ts`, `AccountDetailScreen.tsx`). Chưa có chỗ nào ở server dùng tới nó.
- **Mẫu email mời** đã có (`supabase/templates/invite.html`, trong 13 mẫu Resend).

### Bảng khoảng trống (3 luồng)
| Luồng | Đã có | Còn thiếu | Rủi ro | Đồng ý cần có |
|---|---|---|---|---|
| A. GV soạn bài → Owner duyệt → xuất bản | Kho nội dung + duyệt + snapshot chạy trên staging (nơi 3). Mã mời + nhận lời mời + kích hoạt hồ sơ có kiểm toán, có test offline (nơi 1). Mẫu email mời. | Áp migration `20261002204228`; deploy `teacher-control-plane`; 3 biến server (`MCY_TEACHER_API_ENABLED`, `MCY_TEACHER_INVITES_ENABLED`, `MCY_TEACHER_INVITE_HASH_SECRET` do Owner nhập ở Dashboard); ô "Mời giáo viên" cho Owner. Chưa có tải video lên (bài dùng YouTube của GV). Ba trình soạn trùng nhau: tab "Soạn bài" cũ không xuất bản được nên dễ gây nhầm. | Migration viết từ 2/10, trước kho nội dung: phải tập dượt trên chuỗi hiện tại. Lần duyệt đầu tiên **ghi `manifest.json` lần đầu**, nên danh mục của mọi người dùng Preview và Play đổi từ bản đóng gói sang snapshot. Tên GV hiện công khai. Quyền dùng video. | Không cần đồng ý của học viên. GV1 đồng ý điều khoản và quyền riêng tư khi tạo tài khoản. Căn cứ quyền dùng video do Owner ghi khi duyệt. |
| B. Học viên đăng ký lớp/khóa của GV | Bảng ghi danh và điểm danh trong migration cộng tác (chưa áp). Màn "Lớp của tôi" chỉ đọc. Owner 21/11: bảng quyền dùng (F0) là nguồn sự thật duy nhất. | Trang lớp/khóa trực tuyến; ghi danh tay có kiểm toán do Owner làm (LC0); dòng quyền dùng F0; Edge; màn Owner ghi danh. Ghi danh của bản cộng tác lại là bảng riêng, trái quyết định F0. | Hai hệ ghi danh chồng nhau. Chính sách Play về thu tiền ngoài app. Lộ link phòng họp. | `teacher_sharing` phải là điều kiện ở server để GV thấy học viên. Đồng ý ghi hình riêng cho từng học viên (live-class §8). |
| C. GV dạy buổi trực tuyến, nhận xét sau buổi, bài tập về nhà | Nhận xét có bản sửa, nút gửi riêng và nhật ký (migration cộng tác, chưa áp). Nhãn "AI hỗ trợ · giáo viên đã xác nhận". | Buổi học có giờ (`live_sessions`); nộp bài tập; GV xem bài tập; trang xem lại bản ghi (YouTube không công khai) chỉ cho người ghi danh; hộp thư; email. Nhận xét bằng AI cần kế hoạch R3 riêng. | Lộ dữ liệu học viên cho GV. Học viên thấy nhận xét của nhau. Hình học viên trong bản ghi. Lời nhận xét nghe như chẩn đoán. | `teacher_sharing` (GV xem bài tập); đồng ý ghi hình; `ai_processing`, tài khoản trả phí và cổng AI nếu có nhận xét AI. |

## 4. Cố ý không đụng
- Phần cộng tác (`20261005004000`, `teacher-collaboration`): không áp, không deploy cho pilot. Bảng ghi danh riêng của nó trái quyết định F0. Phần nhận xét của nó sẽ được dùng lại trong kế hoạch P2 sau khi rà lại.
- Tab "Soạn bài" cũ: không xóa trong P0, chỉ ghi trong hướng dẫn GV1 là "chưa xuất bản được". Việc gộp ba trình soạn làm ở bước 5 (tách màn nhân sự).
- Màn học viên, runtime bảo vệ, AI, Play, giá: không đổi. Pilot miễn phí, không có giá trong app.
- Tải video lên Storage của MCY: không làm. GV dùng kênh YouTube của chính GV.

## 5. Ảnh hưởng
| Lối vào / phụ thuộc | Thứ thay đổi | Ai dùng / hành vi kề cần giữ | Bằng chứng hoặc lý do loại trừ |
|---|---|---|---|
| `?workspace=owner` | Ô mời thay thẻ khóa | Owner; các tab Nội dung, Duyệt, AI giữ nguyên | test spec mới + `content-hub.spec.ts` |
| `?workspace=teacher` | Nhận lời mời chạy thật trên staging | GV1; người không có lời mời vẫn bị từ chối | `teacher-workspace.spec.ts`; thử thật với một tài khoản không được mời |
| Schema staging | Thêm RPC mời/nhận lời mời/nháp (migration `20261002204228`) | Không bảng học viên nào đổi | Tập dượt PGlite; đọc lại quyền thực tế |
| Snapshot `manifest.json` | Ghi lần đầu khi Owner duyệt hoặc đổi hiển thị | Mọi người dùng web Preview và Play 1.0.7 đọc snapshot | Đối chiếu danh mục trước và sau (mục 9, bước 8) |
| Đồng ý, iOS 15 | P0 không đổi màn học viên | — | `check:ios15` vẫn chạy trước mọi lần push |

## 6. Bảo mật
- Kho công khai: không ghi tên, email, mã băm email, token hay `MCY_TEACHER_INVITE_HASH_SECRET` vào kho, chat hay biên nhận. Biên nhận chỉ ghi "GV1" và mã UUID của lời mời.
- Mời chỉ qua phiên Owner. Server kiểm vai Owner (`mcy_ai_get_owner_config`). Lời mời hết hạn sau 72 giờ, có khóa idempotency. Email đã xác minh không tự cấp quyền.
- Trước khi cho tải gì lên, phải chứng minh trên staging thật rằng tài khoản thường **không** tự ghi được `public.teachers.active = true` (review matrix).
- GV không đọc được dữ liệu học viên trong P0. P1/P2 phải đi qua RPC `security definer`, `search_path` rỗng, EXECUTE chỉ cho `service_role`. Danh tính kiểm lại bên trong RPC. Lỗi nghiệp vụ dùng `PT409`.
- Đã quét nhanh lịch sử git ngày 26/11 theo hai mẫu khóa Supabase (`sb_secret_…`, JWT HS256): không thấy. Quét đầy đủ (GitHub secret scanning hoặc gitleaks) **CHƯA CHẠY**.
- Tên GV1 đã nằm sẵn trong ít nhất hai tài liệu cũ: `docs/product/PRODUCT_DECISIONS.md` (dòng content workspace) và `docs/status/AGENTS_FULL_LOG_2026-11-08.md`. Xem quyết định 9.

## 7. Hoàn tác
- Tắt `MCY_TEACHER_INVITES_ENABLED` và `MCY_TEACHER_API_ENABLED`. Edge trả 404/503 và workspace GV báo "chưa sẵn sàng".
- Thu hồi vai GV1 bằng thao tác có kiểm toán (đặt `ends_at` cho role_assignment, `teachers.active = false`). Owner phải yêu cầu. Bài của GV1 lúc đó hiện không tên tác giả.
- Ẩn bài của GV1 bằng `set_visibility` trong workspace Owner. Snapshot được dựng lại. Nếu snapshot lỗi, app quay về danh mục đóng gói sẵn.
- Migration chỉ thêm RPC. Nếu cần gỡ thì viết migration sửa tiếp theo, không xóa lịch sử.

## 8. Các bước
### Các giai đoạn đề xuất (nhỏ trước)
| Giai đoạn | Nội dung | Cần migration/Edge | Mức | Khi nào |
|---|---|---|---|---|
| **N (ngoài app)** | Lớp trực tuyến thử ngoài app theo live-class §12(a). Ghi danh qua Zalo/email. Học trên Zoom/Meet, ghi bằng phần mềm Owner đang dùng. Gửi link YouTube không công khai trực tiếp. Bài tập và nhận xét qua email. | Không | — (không mã) | Ngay khi Owner sẵn sàng; chạy song song với P0 |
| **P0** | Luồng A trên staging, chỉ web: mời GV1, GV1 soạn bài video, Owner duyệt, xuất bản | Có: áp migration `20261002204228` + deploy `teacher-control-plane` (mỗi việc Owner yêu cầu riêng) | R3 | Song song với bước 3–4 của hàng việc. Chỉ đụng vùng nhân sự và backend, không đụng tệp học viên. |
| **P1** | Luồng B: trang lớp, Owner ghi danh tay có kiểm toán, ghi danh = dòng quyền dùng F0. `teacher_sharing` bắt buộc ở server. Chỉ web. Miễn phí. | Có | R3, kế hoạch riêng | Là **F0 + LC0**, sau bước 4–5, trước bước 6 (live-class §12 b) |
| **P2** | Luồng C: buổi có giờ, nộp bài tập (chữ trước), GV chỉ xem bài tập của học viên đã ghi danh **và** đang đồng ý. Nhận xét gửi riêng từng người. Trang xem lại bản ghi chỉ cho người ghi danh (LC2 + LC4). | Có | R3, kế hoạch riêng | Sau P1 |
| **P2-AI** | AI gợi ý nhận xét, GV đọc trước khi gửi | Có | R3, kế hoạch riêng | Chỉ sau cổng AI: tài khoản trả phí, `ai_processing`, duyệt chuyên môn. Không có trong pilot miễn phí. |

Thứ tự với hàng 7 bước: bước 3 (Chút) đang chờ Owner xem ảnh. P0 không đụng tệp của bước 3–4. Ô mời ở `owner.tsx` nhỏ; bước 5 sẽ gộp lại khi tách màn nhân sự. P1 và P2 theo đề xuất §12 (3 → 4 → 5 → F0 + LC0 → 6 → F1–F4). Không bán gì, không đặt giá. Theo quyết định 18/11, phần thu tiền (F1–F4) vẫn đợi sau Closed testing.

### Bước của P0
| Bước | Nội dung | Ai làm (agent/mca) | Cỡ |
|---|---|---|---|
| 1 | Đọc staging, không ghi: ledger migration, Edge đang có, số hồ sơ GV, quyền thực tế của `public.teachers` | agent | S |
| 2 | Tập dượt PGlite chuỗi hiện tại + `20261002204228`: mời, nhận lời mời, hết hạn, mời trùng, người lạ, tài khoản đã tồn tại | agent | M |
| 3 | Ô "Mời giáo viên" trong workspace Owner + test; gộp vào `main` theo quy trình | agent | M |
| 4 | Owner yêu cầu áp migration → áp, đọc lại, đổi tên tệp theo phiên bản remote | agent (skill `mcy-supabase-rollout`) | M |
| 5 | Owner nhập 3 biến server ở Dashboard. Owner yêu cầu deploy `teacher-control-plane`. Kiểm 401 khi chưa đăng nhập. | Owner + agent | S |
| 6 | Owner mời GV1 bằng ô mời (email do Owner gõ). GV1 xác nhận email, đặt tên hiển thị ở Cá nhân → Thông tin cá nhân, mở `?workspace=teacher` | Owner, GV1 | S |
| 7 | GV1 tạo bài video ("Bài video của tôi") với video trên kênh của chính GV1, để `visibility` = private, rồi gửi duyệt | GV1 | S |
| 8 | Owner duyệt, gõ lời cam kết và căn cứ quyền, xem bằng chế độ "xem như học viên", rồi mới bật hiển thị | Owner | S |
| 9 | Ghi biên nhận vào `docs/status/` (không có tên hoặc email), cập nhật `PLAN.md` | agent | S |

## 9. Cách thử
Kịch bản thử P0. Ghi PASS / FAIL / CHƯA CHẠY, kèm ngày, commit và môi trường. Môi trường: web Preview `https://motchutyoga.magicpendigital.com`, backend `mcy-staging`.
1. **Owner** mở `/?workspace=owner`, đăng nhập. Ô "Mời giáo viên" hiện ra. Nhập email GV1, bấm mời. Kỳ vọng: "Đã gửi lời mời". Mời lại lần nữa: kỳ vọng "đã gửi", không có email thứ hai. Ghi: UUID lời mời, giờ gửi.
2. **Thử âm:** một tài khoản học viên thử (không được mời) mở `/?workspace=teacher`. Kỳ vọng: "Chưa có lời mời giáo viên". Agent gọi Edge khi chưa đăng nhập: kỳ vọng 401.
3. **GV1** mở email "Xác nhận lời mời" (mẫu Một chút yoga), bấm link trong 72 giờ. GV1 đồng ý điều khoản, rồi đặt tên hiển thị ở Cá nhân → Thông tin cá nhân.
4. **GV1** mở `/?workspace=teacher`. Kỳ vọng: vào được workspace, tên tài khoản hiện ở góc. Ghi lại nếu báo "hãy hoàn thiện tên hiển thị".
5. **GV1** mở "Bài video của tôi", tạo bài: mã YouTube của video GV1 sở hữu, tóm tắt, thời lượng, vùng cơ thể, `private`. Lưu rồi gửi duyệt. Kỳ vọng: trạng thái "chờ duyệt".
6. **Owner** mở tab Nội dung hoặc Duyệt: thấy bài của GV1. Owner **không sửa được** bài (chỉ duyệt). Owner gõ lời cam kết và căn cứ quyền, rồi bấm duyệt.
7. **Owner** dùng "xem như học viên" để xem bài. Sau đó đổi hiển thị sang công khai.
8. **Agent** đọc `content-published/manifest.json` (chỉ đọc), đối chiếu với danh mục trước bước 7: các bài cũ còn đủ, đúng thứ tự, có thêm 1 bài.
9. **Học viên thử** (khách, trên web) mở Khám phá: thấy bài có tên GV1, phát được video. Trên Play 1.0.7 (máy thử Air1 Ultra): như trên, hoặc ghi CHƯA CHẠY.
10. **Hoàn tác thử:** Owner ẩn bài. Học viên tải lại thì không còn thấy bài.
- Luôn ghi CHƯA CHẠY: iPhone iOS 15 thật; TalkBack; tải video lên (không có trong phạm vi).

Kịch bản đợt N (ngoài app). Owner và GV1 tự làm, agent không giữ dữ liệu:
1. GV1 mở một lớp trên Zoom hoặc Meet. Người đăng ký báo qua Zalo/email. Thông báo trước: buổi có ghi hình, khung hình ưu tiên chỉ có giảng viên, ai không muốn xuất hiện thì tắt camera.
2. Sau buổi: link YouTube không công khai gửi riêng cho người đã đăng ký. Bài tập gửi qua email trong 7 ngày (số ngày theo đề xuất §12, chờ Owner chốt). GV1 nhận xét qua email.
3. Owner ghi lại, không có tên người: số đăng ký, số có mặt, số vắng, số nộp bài, số từ chối ghi hình, mất bao lâu để nhận xét. Các số này đưa vào kế hoạch LC0.

## 10. Lệnh kiểm
- `npm run check:quick` sau mỗi lần sửa; `npm run check:plan plans/active/2026-11-26-teacher-pilot.md`.
- R3 cho P0: `npm test`; `node --test tests/teacher-control-plane.test.mjs tests/teacher-migration-contract.test.mjs`; tập dượt PGlite cho migration giáo viên; Playwright `teacher-workspace`, `teacher-content`, `content-hub`, `content-review` và spec mới của ô mời; `npm run check:ios15` trước push; đọc lại quyền thực tế trên staging sau khi áp (anon, authenticated, service_role, PUBLIC, TRUNCATE).
- Thử thật trên staging theo mục 9, có biên nhận.

## 11. Rủi ro còn lại
- Lộ dữ liệu học viên cho GV (P1/P2). Mặc định GV không thấy gì. Chỉ thấy bài tập của học viên đã ghi danh **và** đang bật `teacher_sharing`. Không bao giờ thấy check-in, nhật ký, Hành trình. Rút đồng ý thì GV mất quyền xem ngay. Bản cộng tác hiện có chưa kiểm đồng ý, nên chưa được dùng nguyên trạng.
- Kho công khai. Tên GV1 đã có trong tài liệu cũ và trong lịch sử git. Lịch sử không viết lại được vì cấm `--force`. Tài liệu sắp tới chỉ dùng "GV1".
- Staging thực chất là backend của bản thử nghiệm thật (Preview và Play Internal). Lần ghi `manifest.json` đầu tiên đổi danh mục của mọi tester. Dữ liệu staging ở lại staging. Production chưa có, và trước production phải chuyển Edge sang khóa mới.
- Migration `20261002204228` viết trước kho nội dung. Có thể vướng thay đổi quyền ở các migration sau (ví dụ `20261005004000` thu quyền đọc `teachers`). Tập dượt phải chứng minh nó không vướng.
- Nếu email GV1 đã có tài khoản, `inviteUserByEmail` có thể báo lỗi và lời mời bị kẹt ở "chưa xác nhận". Tập dượt (bước 2) phải kiểm trường hợp này và có cách xử lý trước khi mời thật.
- Chính sách Play: app Android không hiện giá hay hướng dẫn chuyển khoản. Lớp trực tuyến (P1) chỉ chạy trên web cho tới khi kiểm xong chính sách cho dịch vụ 1-1 và lớp nhóm trực tuyến.
- iOS 15: P0 không đổi màn học viên. P1/P2 thêm màn học viên, nên phải qua skill `mcy-ios-compat` và `check:ios15`. iPhone thật CHƯA CHẠY.
- Nội dung GV1 là hướng dẫn tập. Không có lời hứa chữa bệnh. Owner chịu trách nhiệm duyệt và quyền dùng video.

## 12. Cần duyệt
1. **Chạy đợt N (ngoài app) ngay?** Khuyên: **có**, song song với P0. Dữ liệu học viên ở Zalo/email là trách nhiệm của Owner và GV1, không chép vào staging.
2. **Làm P0 trên staging, chỉ web?** Khuyên: **có**.
3. **Thao tác ra ngoài của P0.** Mỗi việc Owner yêu cầu riêng trong lúc làm: (a) áp migration `20261002204228` lên `mcy-staging`; (b) deploy Edge `teacher-control-plane`; (c) Owner tự nhập 3 biến server ở Dashboard (agent không thấy giá trị); (d) push lên `main` (Preview). Khuyên: đồng ý cả bốn, theo thứ tự này.
4. **Cách mời.** Khuyên: ô "Mời giáo viên" trong workspace Owner (Owner tự gõ email, có kiểm toán). Không chọn: agent tự chạy script mời, vì agent không được giữ phiên Owner hay email GV.
5. **Hồ sơ giáo viên đầu tiên (cổng đang chờ trong PLAN.md).** Khuyên: kích hoạt hồ sơ của GV1 với tên hiển thị do chính GV1 nhập. Bài của GV1 hiện "tên GV1" trong app.
6. **Bài đầu tiên của GV1 hiện công khai cho mọi tester ngay sau duyệt?** Khuyên: **không**. Duyệt ở `private`, xem bằng "xem như học viên", rồi mới bật hiển thị và đối chiếu snapshot (mục 9, bước 7–8).
7. **Quyền video.** Khuyên: chỉ video trên kênh YouTube của chính GV1, GV1 xác nhận có quyền. Owner ghi căn cứ quyền khi duyệt. Video 38 clip hiện có không chuyển tác giả trong pilot.
8. **Thứ tự P1/P2.** Khuyên: theo §12(b) của thiết kế lớp trực tuyến: 3 → 4 → 5 → **F0 + LC0 (= P1)** → P2 → 6 → F1–F4. Ghi danh là dòng quyền dùng F0. Pilot miễn phí, không giá. Nếu có chuyển khoản thì làm ngoài app.
9. **Tên GV1 trong tài liệu công khai.** Khuyên: thay tên bằng "GV1" ở hai tệp đã nêu trong mục 6 (một thay đổi tài liệu R0, cần Owner đồng ý). Chấp nhận rằng lịch sử git vẫn còn tên.
10. **GV thấy gì về học viên ở P2.** Khuyên: chỉ tên hiển thị và bài tập học viên nộp cho đúng lớp đó. Dùng đồng ý `teacher_sharing` chung kèm ghi danh từng lớp. Bài tập P2 là chữ trước; ảnh/video sau, cần bucket riêng (R3).
11. **Chính sách vắng/hủy (§12 của thiết kế lớp trực tuyến)** dùng cho đợt N. Khuyên: dùng bản đề xuất (bài tập nộp trong 7 ngày; GV báo dời trước 24 giờ). Owner sửa các con số nếu muốn.
12. **Nhận xét bằng AI:** không có trong pilot miễn phí. Khuyên: để kế hoạch R3 riêng, sau cổng AI.

## Quyết định của Owner (26/11)
1. Đợt N: **đồng ý**; đang có 2 lớp trực tuyến chạy qua Google Meet.
2. Làm P0 trên staging, chỉ web: **đồng ý**.
3. Thao tác ra ngoài của P0 (áp migration, deploy Edge, Owner nhập 3 biến server, push lên `main`): **đồng ý**, theo thứ tự trong mục 12.3.
4. Mời qua ô "Mời giáo viên" trong workspace Owner: **đồng ý**.
5. Kích hoạt hồ sơ GV1; tên hiển thị là tên thật của giảng viên (GV1 tự nhập trong Cá nhân): **đồng ý**.
6. Duyệt ở `private`, xem như học viên rồi mới bật hiển thị: **đồng ý**.
7. Chỉ video trên kênh YouTube của chính GV1; Owner ghi căn cứ quyền khi duyệt: **đồng ý**.
8–12: **chưa trả lời** (thứ tự P1/P2, tên trong tài liệu cũ, GV thấy gì ở P2, chính sách vắng/hủy, AI nhận xét). P0 không phụ thuộc các mục này.

### Thay đổi trong lúc làm P0
- Email đã có tài khoản: Auth không gửi thư mời cho địa chỉ đã có tài khoản (`email_exists`). Trước đây lời mời sẽ kẹt ở "chưa xác nhận". Thêm RPC `mcy_teacher_invite_mark_existing_account` vào migration `20261002204228` (chưa áp nên còn sửa được). Edge trả `existing_account` và ô mời nói rõ: không gửi thư; Owner nhắn GV1 đăng nhập bằng mã gửi qua email rồi mở trang giáo viên. Nhận lời mời vẫn cần email đã xác minh của chính tài khoản khớp mã băm, nên cổng không lỏng hơn.
- Ô "Mời giáo viên" thay thẻ khóa trong workspace Owner (`src/staff/TeacherInvitePanel.tsx`): chuẩn hóa email, một khóa idempotency cho mỗi địa chỉ (bấm lại không gửi thư thứ hai), không lưu email trong trình duyệt, báo lỗi trung thực (cổng đóng, không phải Owner, chưa xác nhận gửi).
- Tập dượt PGlite (`npm run test:teacher-control-plane-rehearsal`, cần `MCY_PGLITE_MODULE_PATH`): chuỗi 31 migration staging đã áp rồi `20261002204228`; 7/7 đạt. Áp sạch, chỉ thêm 8 RPC (security definer, `search_path` rỗng, chỉ service_role được EXECUTE); anon/authenticated không đọc/ghi/TRUNCATE bảng lời mời. Đủ luồng mời → gửi → nhận, giới hạn 3/giờ, lời mời hết hạn/không chắc, email đã có tài khoản, người lạ, email chưa xác minh, tên sai, vai trò đã thu hồi.
- Edge tính mã băm từ email của phiên đã xác minh (không nhận mã băm từ trình duyệt), nên SQL tin mã băm là đúng thiết kế.
- **Giới hạn đã biết (backlog):** giảng viên đã bị thu hồi quyền không thể được mời lại bằng cùng email (RPC nhận lời mời kiểm tra lời mời đã dùng trước). Không ảnh hưởng pilot; nếu cần mời lại sẽ sửa bằng migration riêng.
- ~~Điểm chặn: phiên cloud không có công cụ Supabase.~~ Đã gỡ 27/11: phiên trên máy Owner dùng Supabase CLI và Management API.
- **27/11, bước 1, 4, 5 trên staging:** staging khớp chuỗi (31 đã áp, `20261002204228` chưa áp). Tập dượt lại 7/7. Áp đúng một migration, version remote **`20261127031613`**; tệp local đã đổi tên theo version này, test và README cập nhật. Đọc lại: 8 RPC `security definer`, `search_path` rỗng, chỉ service_role có EXECUTE; anon/authenticated/service_role không có quyền nào trên `private.workspace_invites`; số đếm nội dung không đổi. Owner nhập 3 biến; deploy `teacher-control-plane` v1 (`verify_jwt`), gọi không đăng nhập → 401. Staging có sẵn 2 dòng vai teacher (1 còn hiệu lực, 1 hết hạn) nhưng 0 hồ sơ giáo viên; RPC nhận lời mời tái dùng các dòng này. [Biên nhận](../../docs/status/receipts/2026-11-27-teacher-control-plane-staging.md).

## Progress
- [x] Phân tích hiện trạng và lập kế hoạch (26/11)
- [x] Owner duyệt quyết định 1–7 (26/11); 8–12 còn chờ
- [x] Đợt N ngoài app: đang chạy (2 lớp trên Google Meet, Owner báo 26/11)
- [x] P0 bước 1–5 (bước 2–3 ở `main` `2255dfa` 26/11; bước 1, 4, 5 trên staging 27/11)
- [ ] P0 bước 6–8 (Owner mời GV1, GV1 soạn bài, Owner duyệt) — chờ Owner và GV1
- [ ] P0 bước 9 (biên nhận phần 6–8 + `PLAN.md` sau khi Owner thử)
- [ ] Kế hoạch riêng P1 (F0 + LC0)
- [ ] Kế hoạch riêng P2
