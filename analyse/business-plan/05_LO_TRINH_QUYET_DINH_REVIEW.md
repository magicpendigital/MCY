# 05 · Lộ trình, nguồn lực và quyết định review

**Bản 0.2 · Mục tiêu bán dịch vụ đồng hành tự tập cuối 2026–đầu 2027. Lộ trình có điều kiện, chưa phải lịch cam kết phát hành.**

## 1. Thứ tự chứng minh

**Bước 1 — prototype hiện tại:** kiểm chứng người dùng hiểu và làm được vòng lặp, đặc biệt lần quay lại. Mô phỏng bằng dữ liệu hư cấu có nhãn rõ. Không tích hợp thanh toán/API thật trong bước prototype; không gọi kết quả scripted là năng lực AI đã chứng minh.

**Bước 2 — concierge minh bạch nếu cần:** giáo viên chọn trong nội dung đã duyệt và ghi lại nguyên tắc/khó khăn; người học biết do người chuẩn bị. Mục đích là học về lựa chọn và feedback, không đo độ tin cậy/chi phí inference. Giới hạn số người để không ảnh hưởng hai lớp hiện tại.

**Bước 3 — beta web có AI thật:** AI hỏi/làm rõ/chọn bài trong phạm vi, server kiểm ràng buộc, feedback nối sang buổi sau, dữ liệu có quyền và vận hành được. Đây mới là phép thử đầy đủ lời hứa sản phẩm.

**Bước 4 — pilot trả phí một kỳ:** bán quyền đồng hành và nội dung theo giới hạn công bố, đo thực hành lặp lại, tái mua, chi phí và công hỗ trợ. Khóa/lớp giáo viên vẫn có thể bán riêng; không dùng doanh thu lớp để tuyên bố AI đã có nhu cầu trả tiền.

Nếu chưa đủ năng lực kỹ thuật/review, có thể tiếp tục nghiên cứu dịch vụ hoặc giữ hai lớp hiện có tạo doanh thu. Không đổi âm thầm sang bán khóa rồi coi đã kiểm chứng sản phẩm AI.

## 2. Lịch đề xuất và đường phụ thuộc

| Mốc | Thời gian mục tiêu | Đầu ra review được | Gate / đường lùi |
|---|---|---|---|
| G0 · chốt phạm vi | 24/09–11/10/2026 | Kiểm kê nội dung/quyền, giờ founder, 8–12 phỏng vấn, 3–5 hoàn cảnh đầu, trần tiền mặt | Xác định nhu cầu đủ hẹp và nội dung đáp ứng; thiếu thì giảm phạm vi lời hứa |
| G1 · prototype hai buổi | 12/10–01/11 | Bổ sung cuộc trao đổi, plan có căn cứ, feedback trung tính và lần quay lại; 5–6 usability; 2–3 buổi thật để test theo được | Người mới hiểu nguồn AI/giáo viên, tìm được dừng, biết vì sao chọn bài |
| G2 · beta AI kín | 02/11–22/11 | Lát cắt web thật: login/consent → planner → player → feedback → plan tiếp; content/version/eval/observability; 10–15 người nếu đủ công suất | AI/data/content qua gate; nếu chưa đủ chỉ tiếp tục prototype/concierge có nhãn |
| G3 · sẵn sàng nhận tiền | 23/11–13/12 | Danh mục đủ phạm vi offer, quyền truy cập, gói một kỳ, refund/privacy/support, QC, backup/restore và đối soát | Tiền→quyền→tập; outage AI có phương án; chưa đạt thì lùi bán AI |
| G4 · kỳ trả phí nhỏ | 14/12/2026–10/01/2027 bắt đầu tuyển | Đề xuất 8–15 người, bao gồm người mới; mỗi người đủ 30 ngày nếu mua kỳ 30 ngày | Giao đúng quyền lợi, theo dõi bỏ cuộc/công hỗ trợ/chi phí; không cắt kỳ vì lịch dự án |
| G5 · đo tiếp tục | Từ 11/01/2027, theo ngày hết kỳ từng người | Sửa điểm nghẽn, mời mua kỳ tiếp khi đến hạn, quan sát W4 và tái mua thật | Nhóm vào 10/01 cần theo dõi đến tháng 2; không kết luận cuối tháng 1 cho mọi người |
| G6 · mở rộng nhỏ | Q1–Q2/2027 nếu có bằng chứng | Bổ sung đúng khoảng trống nội dung, giảm no-match, cải thiện memory; cân nhắc recurring | Giá trị tăng thêm và economics; không thêm video để đủ số |
| G7 · mobile | Sau khi core ổn và thấy nhu cầu native | Spike thiết bị thật, một nền tảng ưu tiên theo người dùng rồi nền tảng còn lại | Push/offline/player giải quyết vấn đề thật và có ngân sách duy trì |
| G8 · tiếng Anh | Sau mô hình VN vận hành lặp lại | Chọn một nước, nghiên cứu 10–15 người, biên tập offer/nội dung/hỗ trợ | Không coi dịch UI là đã sẵn sàng kinh doanh quốc tế |

G2 khá tham vọng đối với solo. Nếu chưa có người làm kỹ thuật và reviewer, phải kéo lịch hoặc giảm phần phụ; không cắt ownership, safety hay dùng dữ liệu thật trước kiểm tra. Các giai đoạn có thể chồng một phần nhưng không bỏ phụ thuộc nội dung/consent/validation. Không hứa web/iOS/Android/camera cùng ra trong ba tháng.

## 3. Nguồn lực và cách cắt phạm vi

| Giờ thêm mỗi tuần ngoài hai lớp | Phạm vi có thể xem xét | Cần làm rõ |
|---|---|---|
| ≤6 giờ | Research + prototype + thử dịch vụ rất nhỏ; duy trì lớp | Khó vừa sản xuất nội dung vừa vận hành custom AI; lùi lịch hoặc có hỗ trợ kỹ thuật |
| 8–12 giờ | Nội dung ít nhưng đủ phạm vi, prototype/pilot kín; web nếu có người phụ trách kỹ thuật | Ưu tiên loop, hoãn teacher console, native và nhiều offer |
| 15–20 giờ + năng lực kỹ thuật/reviewer | Web V1 theo lát cắt, một payment flow, admin tối thiểu | Giờ làm thêm không thay thẩm định chuyên môn/bảo mật |

Ví dụ 12 giờ/tuần: nội dung/rà/quay 3 giờ; organic 2; nghiên cứu 1,5; hỗ trợ và review AI 2; sản phẩm/QA/phối hợp 2,5; buffer 1. Chỉ là cách phân bổ, chưa đủ để một người không có kinh nghiệm tự làm production trong thời hạn. Nếu hai lớp chưa được tính đủ công chuẩn bị, phải trừ phần đó trước.

Vai trò cần có người chịu trách nhiệm: founder cho sản phẩm/nội dung/vận hành; người đủ chuyên môn rà phạm vi và safety; kỹ sư/reviewer rà auth/payment/AI/data/release; kế toán/pháp lý theo mô hình thực. Có thể thuê theo mốc thay tuyển đội, không giả một agent là reviewer chuyên môn độc lập.

Thứ tự cắt khi thiếu nguồn lực: camera/voice → native → cộng đồng/gamification → nhiều gói/khuyến mãi → teacher workspace phức tạp → tìm kiếm thư viện lớn. Giữ vòng lặp hai buổi, nội dung đã duyệt, quyền dữ liệu, dừng, thanh toán đáng tin và hỗ trợ khi lỗi.

## 4. Backlog theo lát cắt

| Epic | Kết quả nhỏ có giá trị | Phụ thuộc / gate |
|---|---|---|
| E01 Coverage nội dung | 3–5 hoàn cảnh ưu tiên, các buổi hoàn chỉnh/metadata/giới hạn, 2–3 mẫu | Kiểm kê và review chuyên môn; no-match phải có đáp án trung thực |
| E02 Prototype vòng lặp | Check-in → trao đổi → plan → practice → feedback → lần sau | Tiếp tục source hiện có trong boundary; sửa baseline runtime trước preview |
| E03 Nền kỹ thuật | ADR, dev/staging/prod, auth, secret, CI và API contract | Không coi report là quyền đổi framework/runtime |
| E04 Identity/consent/context | Tài khoản, quyền dữ liệu, context có scope, memory sửa/xóa | Negative ownership tests và rút quyền |
| E05 AI chọn buổi | Candidates hợp lệ → model chọn → validate → thẻ kế hoạch → xác nhận | Nội dung E01, quyền E04, eval và timeout/fallback |
| E06 Thực hành thật | Player/caption/dừng/resume, run gắn plan revision | Thiết bị thật và mạng yếu; không timer demo |
| E07 Feedback sang lần sau | Structured feedback + source → plan sau dùng đúng → giải thích | Core acceptance nhiều buổi; missing không thành positive |
| E08 Bán và cấp quyền | Một kỳ trả tiền, đơn snapshot, xác minh, grant/refund, hỗ trợ | Retry/idempotency, tiền và quyền khớp |
| E09 Vận hành/QC | Theo dõi no-match/report/chi phí, data request, backup và kill switch | Không raw health/chat sang marketing; release evidence |
| E10 Hỗ trợ giáo viên/khóa | Tích hợp quyền lớp cũ và gói bổ sung khi cần | Không là điều kiện chặn E05–E07 nếu không bán gói này |
| E11 Mobile | Dùng chung account/plan/grant, native capabilities | Bằng chứng nhu cầu, store compliance, spike |
| E12 English | Một offer được biên tập cho một thị trường | Hỗ trợ, local rules, channel và economics |

Task coding đầu sau khi duyệt nên là một lát cắt prototype hai buổi với fixture rõ ràng. Không giao “xây toàn bộ báo cáo”, không tích hợp backend chỉ để demo luồng. Sau usability mới giao lát cắt AI thật trong môi trường thử có kiểm soát.

## 5. Gates sản phẩm và kinh doanh

Ngưỡng sau là đề xuất quản trị, không phải benchmark ngành. Chốt trước pilot, báo số đếm và lý do; không lấy mẫu nhỏ làm chứng minh thống kê.

| Gate | Bằng chứng đề xuất | Nếu không đạt |
|---|---|---|
| Hiểu vòng lặp | 5/6 người làm được hai lần sử dụng không chỉ đường; tất cả phân biệt AI/giáo viên và tìm được dừng | Sửa flow/copy trước thêm feature |
| Chọn buổi hữu ích | Người dùng giải thích được lý do; perceived fit không kém baseline; công sức chọn giảm hoặc lợi ích đủ bù | Sửa context/ranking/copy; có thể rút số lượt chat |
| Feedback có tác dụng | Case kiểm soát cho kết quả đúng; người quay lại nhận ra thay đổi có căn cứ hoặc lý do lặp | Sửa memory/lineage; chưa quảng cáo “ngày càng hiểu bạn” |
| Nội dung đủ | Phần lớn hoàn cảnh đã chọn có ít nhất một lựa chọn hợp lệ; no-match trong pilot được phân tích cụ thể | Bổ sung đúng gap hoặc thu hẹp offer; không đặt tỷ lệ chung khi chưa biết phân bố |
| AI/data đáng tin | Eval mục tiêu ở phần 04, không critical failure chưa xử lý, quyền/consent/fallback đúng | Chưa public/bán AI; tiếp tục kiểm chứng phạm vi hẹp |
| Có trả tiền | 5–10 người mua thật offer rõ, có người ngoài lớp quen; ghi refund | Rà nhu cầu, độ tin cậy, giá và giá trị so với video miễn phí |
| Có quay lại | W2/W4 và lý do; mốc thảo luận ban đầu 30%/20% nhưng không auto-pass | Chưa mở rộng acquisition; đọc cả missing feedback và người không quay lại |
| Có tiếp tục trả tiền | Người hết kỳ có cơ hội tái mua thật; ghi cả không mời được/không mua | Không tự bật recurring để che thiếu nhu cầu |
| Vận hành nổi | Công hỗ trợ/review AI dưới 70% ngân sách thời gian dự trù, không incident nghiêm trọng mở | Giới hạn cohort hoặc sửa quyền lợi/giá |
| Kinh tế có triển vọng | Đóng góp dương sau cost biến đổi và công hỗ trợ, theo dõi hai kỳ; biết vốn chưa thu hồi | Sửa giá/quota/cost, không gọi thu gộp là lợi nhuận |
| Native có lý do | Giới hạn web làm mất buổi lặp lại hoặc có nhóm khách cần offline/push; spike cải thiện | Tiếp tục web; số request riêng không đủ quyết định |
| English có đường phục vụ | VN vận hành lặp lại; nhu cầu và channel ở một nước cụ thể | Chưa dịch hàng loạt |

Một buổi vừa sức không có nghĩa phải báo dễ chịu hơn. Gate cốt lõi là quyết định phù hợp và người học có quyền phản hồi thật, nghỉ hoặc dừng.

## 6. Chi phí và vận hành tiết kiệm

| Khoản | Cách giảm công/chi | Phần cần giữ |
|---|---|---|
| Marketing | Organic, tái sử dụng, giới thiệu tự nguyện | Đúng quyền liên hệ; không mua danh sách |
| Nội dung | Quay theo khoảng trống coverage; batch ít bài hoàn chỉnh | Cue/âm thanh/caption, chuyên môn, quyền media |
| AI | Context ngắn có nguồn, ít lượt làm rõ, model phù hợp, quota và timeout; không gọi LLM khi chỉ xem lịch sử | Eval, server-side secrets, privacy, giải thích fallback |
| Hạ tầng | Ít nhà cung cấp, managed services theo tiêu chí, free tier để thử | Backup/restore, quota alerts, export và chi phí vượt ngưỡng |
| Kỹ thuật | Reuse domain, ít screen phụ, review theo milestone | Ownership/payment/consent/AI validation |
| Hỗ trợ | FAQ từ câu hỏi thật, cửa sổ trả lời và quota con người | Đường xử lý bị trừ tiền/không tập được, incident AI |
| Mobile | Phát triển sau gate | Signing, store policy, thiết bị thật và bảo trì |

Sổ chi phí tách một lần, cố định tháng, biến đổi/người, giờ founder và dự phòng hoàn tiền. Cảnh báo 50/80/100% ngân sách đã chốt; budget cap AI không được tắt webhook hay quyền nội dung đang bán. Tắt AI kéo dài phải thông báo và bù/gia hạn/hoàn theo điều khoản công bố. Không gọi fallback là phục vụ đầy đủ tính năng trả phí nếu thực tế mất lợi ích chính.

## 7. Rủi ro lớn và tín hiệu sớm

| Rủi ro | Tín hiệu | Điều chỉnh |
|---|---|---|
| Hội thoại gây phiền hơn chọn video | Nhiều bỏ trước plan, câu hỏi lặp | Cho trả lời nhanh, dùng context đã xác nhận, hỏi ít hơn |
| Cá nhân hóa chỉ ở lời văn | Các context khác nhau ra cùng bài không lý do | Rà coverage/ranking và cho thấy căn cứ thật |
| Danh mục quá nhỏ | No-match hoặc lặp ngoài ý muốn liên tục | Chọn phân khúc hẹp, sản xuất đúng gap; không bịa bài |
| AI bị hiểu thành quan sát/chẩn đoán | Người học tin AI biết tư thế/cơ thể không qua input | Nhãn và giải thích nguồn; sửa nội dung/eval |
| Memory sai kéo dài | Phản hồi một ngày thành “đặc điểm của bạn” | Scope/expiry, confirm, sửa/xóa và lineage |
| Founder quá tải | Trễ hỗ trợ, không review report hoặc quay được nội dung | Giới hạn số người, gói rõ, buffer, reviewer theo mốc |
| Người mua vì quen giáo viên | Nhóm khách mới không quay lại | Phân cohort, kiểm chứng thông điệp và onboarding khách mới |
| Tốn chi phí nhưng ít practice | Chat nhiều, retry nhiều, ít bắt đầu | Giới hạn phạm vi conversation, đo cost/buổi có ích |
| Native làm chậm core | Nhiều lỗi đồng bộ/store khi web chưa ổn | Hoãn platform, giữ chung API/quyền |
| Mất niềm tin cộng đồng | Karma bị cảm nhận là ép upsell | Vai trò lớp độc lập, lời mời riêng tự nguyện |

## 8. Decision log

Trạng thái **đã chọn** chỉ áp dụng đúng phạm vi founder đã nói; những dòng còn lại là đề xuất để phản biện.

| ID | Quyết định | Trạng thái | Cần review |
|---|---|---|---|
| D01 | Vòng check-in → AI → buổi hôm nay → feedback → lần sau là sản phẩm chính | Đã chọn | Thay course-first trong 0.1 |
| D02 | Khóa/thư viện hỗ trợ, không cạnh tranh bằng số lượng video | Đã chọn | Cách đưa kỹ năng nền vào hành trình |
| D03 | Việt Nam trước, tiếng Anh sau | Đã chọn | Chưa chọn nước tiếng Anh |
| D04 | Tiếp tục prototype hiện tại | Đã chọn làm nền | Chưa triển khai; giữ runtime và chỉ dẫn |
| D05 | Web V1 trước, native theo gate | Đề xuất | Tập thiết bị người học, nhu cầu offline/push |
| D06 | 8–12 buổi hoàn chỉnh, 2–3 làm mẫu, 3–5 hoàn cảnh ưu tiên | Đề xuất | Kiểm kê nội dung và coverage trước chốt số |
| D07 | AI chọn buổi hoàn chỉnh trước; ghép block sau review | Đề xuất kỹ thuật/nội dung | Chất lượng điều chỉnh vs công thẩm định |
| D08 | Ngà/xanh/đất nung, concept khoảng nghỉ có hướng dẫn | Đề xuất kế thừa | Chưa duyệt token/logo; test độ đọc |
| D09 | AI text trao đổi/chọn/dùng feedback trong core | Đã chọn vai trò; phạm vi text đề xuất | Voice/camera chưa trong launch |
| D10 | Context tối thiểu, nhớ có scope/nguồn, người dùng sửa/xóa | Đề xuất | Copy consent và retention |
| D11 | Pilot gói 30 ngày trả một lần, chưa tự gia hạn | Đề xuất | Hạn dùng, quyền lợi, thử miễn phí có đủ hai lần dùng |
| D12 | Chưa chốt giá; 149k chỉ minh họa economics | Đề xuất nghiên cứu | Giá lớp hiện tại, willingness-to-pay, cost thật |
| D13 | Teacher support là quyền riêng có quota | Đề xuất | Công suất founder, không hứa đọc mọi note |
| D14 | Cùng account/plan/history/grant mọi platform | Đề xuất kiến trúc | SKU/store rules và xung đột thiết bị |
| D15 | Docs + CI + giới hạn quyền agent, AI eval là gate core | Đề xuất quy trình | Reviewer và gói repo phù hợp |
| D16 | Phục hồi baseline line endings trước coding/preview app | Việc cần xử lý, chưa làm | Không sửa lock/checker để bypass |
| D17 | Không dùng dữ liệu chat/cảm nhận/sức khỏe cho marketing | Đề xuất bắt buộc trong thiết kế | Tracking allowlist và nhà xử lý |
| D18 | Concierge chỉ kiểm chứng tiền đề, không đóng giả AI | Đề xuất fallback nghiên cứu | Nếu AI chưa đạt gate thì chưa bán lời hứa AI |
| D19 | Giữ karma độc lập; học viên lớp cũ được đối soát quyền | Đề xuất vận hành | Không tự cấp/bán lại khi chuyển |
| D20 | Stack/vendor/lịch cụ thể chốt sau inventory và spike | Chưa quyết định | Người chịu trách nhiệm kỹ thuật và trần tiền mặt |

Không cần trả lời lại D01–D04. Những thông tin còn thiếu tác động lớn: giờ founder có thể dành ngoài lớp, video nào đã có và quyền sử dụng, số người/giá/lịch lớp, chuyên môn/reviewer, trần tiền mặt và khả năng kỹ thuật. Chưa có các con số này vẫn review được hướng sản phẩm, nhưng chưa lập ngân sách/lịch cam kết đáng tin.

## 9. Thứ tự review đề nghị

Đọc phần 06 trước để phản biện trải nghiệm hai buổi và phạm vi AI. Sau đó review D06–D07 về lượng/chất nội dung; D10–D13 về dữ liệu, quyền lợi và thu tiền; cuối cùng phần 03–04 về cơ chế thực thi và QC.

Câu hỏi ra quyết định: plan có thật sự giúp người học chọn không; phản hồi nào phải đổi lựa chọn và phản hồi nào không; người dùng có hiểu căn cứ/giới hạn không; một người có cung cấp nổi không; cùng danh mục ấy, AI có hơn bộ lọc đơn giản không. Đây là những vấn đề nghiên cứu, không yêu cầu founder xác nhận tất cả ngay.

## 10. Trạng thái bàn giao

Bản 0.2 gồm 6 phần Markdown và HTML tổng hợp. Bản 0.1 lưu riêng. Cập nhật tài liệu kế hoạch và ghi định hướng bền vững vào AGENTS theo chỉ dẫn hiện hành; không sửa application/runtime, tích hợp AI/backend/payment, cài skills, gửi marketing hoặc deploy.

Đã đối chiếu source prototype, không nhận mock timer/thống kê/thẻ demo là tính năng production. Runtime check trước đó fail vì 24 file CRLF/LF; chẩn đoán trong bộ nhớ khớp hash gốc, chưa sửa và chưa tuyên bố app pass QC. Kiểm bản HTML review là kiểm tài liệu, không thay kiểm ứng dụng.

Nguồn nền tảng/pháp lý/y tế trong phần 01–04 là đầu vào để rà quyết định, không chứng nhận tuân thủ hoặc an toàn cho sản phẩm chưa triển khai. Kiểm lại theo đúng vendor, pháp nhân, quốc gia và luồng dữ liệu trước public launch.
