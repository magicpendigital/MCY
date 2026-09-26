# 06 · Trải nghiệm cốt lõi: từ hôm nay đến lần tiếp theo

**Đặc tả 0.2 để review. Các tên buổi, lời thoại và dữ liệu dưới đây là ví dụ hư cấu; chưa có AI thật, nội dung chuyên môn được duyệt hay thay đổi ứng dụng tương ứng.**

## 1. Sản phẩm người học thực sự mở mỗi lần

Một màn Hôm nay trả lời ba câu hỏi nối tiếp:

1. **Hôm nay nên tập gì?** Check-in ngắn và trao đổi với AI nếu cần, dẫn tới một lựa chọn cụ thể.
2. **Tập như thế nào?** Buổi của giáo viên, có chuẩn bị, cue, phụ đề, điều khiển và quyền dừng.
3. **Tiếp tục ra sao?** Feedback trung tính, lịch sử dễ hiểu và một quyết định có căn cứ ở lần quay lại.

Trung tâm giao diện là **thẻ kế hoạch buổi tập**, không phải lịch sử chat. Hội thoại là cách làm rõ ý định; khi đã đủ dữ liệu phải đưa người học sang lựa chọn. Có thể trò chuyện thêm khi người dùng muốn sửa kế hoạch, nhưng không bắt họ duy trì cuộc chat mỗi ngày.

Khái niệm “hằng ngày” diễn tả khả năng hỗ trợ vào ngày họ muốn tập, không cam kết phải tập mỗi ngày. Ngày nghỉ và quay lại sau nghỉ là kết quả bình thường.

## 2. Đối chiếu prototype hiện tại và phần cần phát triển

Đã đọc source src/Prototype.tsx. Đây là phân tích source, không kết quả chạy browser mới của app.

| Hiện có | Có thể giữ | Cần thay đổi theo hướng đã chọn |
|---|---|---|
| welcome | Thương hiệu ấm, giáo viên/nội dung, CTA bắt đầu | Lời hứa biết tập gì hôm nay; tránh giới thiệu như marketplace khóa |
| checkin | Chọn nhanh, trạng thái năng lượng, nhịp hỏi nhẹ | Thêm thời gian/ý muốn/không gian; body map không mặc định ai cũng khó chịu; có “không có vùng cụ thể” |
| Chuyển checkin thẳng sang today | Đường đi ngắn | Chèn trao đổi AI ngắn; khi context đủ thì cho xác nhận nhanh, không hỏi lại máy móc |
| today | Một card buổi chính, thời lượng, hướng dẫn | Thành Daily Practice Plan có lý do, nguồn và cách đổi; hiện tiêu đề đổi theo focus nhưng danh sách động tác còn cố định |
| practice | Tập trung vào buổi, cue và điều khiển | Timer 00:28 và hình tĩnh hiện là demo; production cần media thật. Nút biến thể nhẹ hơn phải có lựa chọn hợp lệ hoặc nói rõ chưa có |
| reflection | Khoảng dừng sau tập và note tùy chọn | Bỏ hướng mặc định tích cực; thêm nhịp/độ khó riêng với cảm nhận; như cũ/khó chịu hơn/chưa rõ/bỏ qua đều hợp lệ |
| progress | Nhìn lại, thẻ có nguồn AI/giáo viên tách nhau | Thay chart/số liệu preset bằng dữ liệu thực/fixture có nhãn; hiển thị quyết định đã thay đổi và vì sao |
| message | Nguồn người/AI đã phân biệt | AI trước buổi là luồng mới; thẻ sau buổi không nói đã nhìn thấy động tác hoặc hơi thở từ note |
| plans | Có khái niệm quyền lợi | Chuyển trọng tâm sang gói đồng hành; giáo viên/khóa là quyền bổ sung; chưa chốt giá |
| teacher | Demo viết/preview/gửi | Giữ như concept phụ, không yêu cầu hoàn chỉnh trước khi thử core AI |
| BottomNav | Điều hướng quen thuộc | Hôm nay/Hành trình/Khám phá/Cá nhân; Cá nhân không chỉ mở trang mua gói |

Các điểm đang là demo không phải lỗi production đang gây hại; cần phân biệt để task implementation không dùng nhầm làm hành vi thật. Không phải làm lại toàn bộ prototype hoặc thay khung điện thoại.

**Thứ tự phát triển prototype sau khi được giao triển khai:** sửa baseline runtime đúng bytes → check-in mới → cuộc trao đổi → plan → reflection → lần quay lại → các trạng thái lỗi. Chỉ sửa app-owned UI trong ranh giới AGENTS; FlowStack, keyboard, safe area, device picker và chrome giữ nguyên.

## 3. Storyboard hai buổi, có phản hồi không tích cực

### Buổi A · Một người mới quay lại, có 10 phút

**Hôm nay:** “Bạn muốn dành bao nhiêu thời gian?” Các nút 5 / 10 / 15 / tự chọn. “Năng lượng hôm nay?” Thấp / Vừa / Nhiều / Chưa rõ. Ý muốn như “Tập nhẹ để bắt nhịp”, không bắt chọn vùng đau.

Người học chọn 10 phút, năng lượng vừa, “Tôi mới quay lại, muốn hướng dẫn dễ theo”. Dữ kiện lâu dài đã có chỉ hiển thị chip có thể sửa; không yêu cầu onboarding từ đầu.

**Trao đổi:** AI nói “Bạn muốn nhiều hướng dẫn hơn hay một buổi ít lời, dễ theo nhịp?” Đây là ví dụ câu làm rõ có tác dụng cho instruction_density, không phải câu bắt buộc mọi lần. User chọn “Nhiều hướng dẫn”. Nếu danh mục không có hai mức khác nhau thì không hỏi lựa chọn giả.

**Kế hoạch:** “Bắt nhịp nhẹ — 8 phút” là tên fixture minh họa, do giáo viên MCY xây dựng. Card cho biết đủ trong 10 phút, mức nhập môn, dụng cụ và lý do: “Bạn mới quay lại và muốn nhiều hướng dẫn.” Có “Bắt đầu”, “Điều chỉnh” và “Vì sao chọn bài này?”. Không hiện một đoạn AI dài thay video.

**Thực hành:** hướng dẫn đã quay/duyệt; có pause, phụ đề, cue và dừng. Khi hỏi trong buổi, ưu tiên nội dung ngắn đã duyệt; không buộc cầm điện thoại trò chuyện dài. Không giả AI đang quan sát cơ thể.

**Phản hồi:** “Buổi vừa rồi với bạn thế nào?” User chọn độ khó “Vừa”, nhịp “Hơi nhanh”, cảm nhận “Không thay đổi”. Cả ba là thông tin riêng; một buổi có thể vừa sức nhưng cảm nhận chưa đổi. Note không bắt buộc.

**Kết thúc:** “Đã lưu phản hồi: nhịp hơi nhanh. Lần sau MCY sẽ ưu tiên lựa chọn chậm hơn nếu phù hợp với điều kiện lúc đó.” Không nói “cơ thể đã cải thiện” hoặc chắc chắn ngày mai tốt hơn. Nút “Hoàn tất”, tùy chọn nhắc vào thời điểm user chọn.

### Buổi B · Quay lại, vẫn chỉ có 10 phút

**Hôm nay:** “Lần trước bạn thấy nhịp hơi nhanh. Hôm nay bạn có muốn ưu tiên nhịp chậm hơn?” Có Có / Giữ như trước / Sửa thông tin. Hỏi xác nhận trong prototype để nghiên cứu; về sau có thể là chip mặc định minh bạch tùy kết quả usability.

User chọn chậm hơn; AI kiểm thời gian/ý muốn hiện tại và tập candidates được phép. Nếu có fixture “Chậm lại để theo rõ — 9 phút” đã duyệt thì chọn; nếu không có, phải báo khoảng trống.

**Kế hoạch có giải thích ngắn:** “Buổi này có nhịp chậm hơn buổi trước, vẫn trong 10 phút. Dựa trên phản hồi ‘hơi nhanh’ bạn đã gửi.” Cho mở căn cứ đúng buổi và sửa điều đã nhớ.

**Quyền chọn:** user có thể “Tập lại buổi trước”, “Chọn buổi này” hoặc “Hôm nay chỉ có 5 phút”. Nếu thay thời gian thì tạo plan revision mới, kiểm constraints lại; không sửa duration chữ hiển thị trên video cũ.

**Sau buổi:** hỏi lại cùng thang trung tính để so sánh trải nghiệm, không chọn sẵn “tốt hơn”. Người học có thể thấy chậm quá; lần kế tiếp điều chỉnh theo phản hồi mới và context, không đóng khung họ mãi ở một mức.

Điều cần kiểm chứng: người học có thấy lựa chọn B hợp lý hơn, hiểu căn cứ, sửa được hiểu nhầm và muốn quay lại không. Hai video khác nhau tự nó không chứng minh AI tốt hơn.

## 4. Giải phẫu các màn chính

| Màn | Thứ tự thông tin | Hành động và trạng thái |
|---|---|---|
| Hôm nay | Chào trung tính → context tối thiểu → tiếp tục buổi còn dở nếu có → một CTA | Chưa từng tập, vừa quay lại, đã tập, ngày nghỉ; không thúc ép thêm buổi |
| Check-in | Thời gian → ý muốn/năng lượng → context cần thiết → thông tin đã biết có thể sửa | Trả lời nhanh, nhập tự do tùy chọn; xác nhận điều ảnh hưởng eligibility nếu thiếu |
| Trao đổi AI | Nhãn AI → câu làm rõ → chips/nhập → tóm tắt context | Đang xử lý, retry, thiếu consent, ngoài phạm vi, “Tôi muốn chọn nhanh” |
| Plan | Tên/thời lượng → người làm nội dung → tại sao → chuẩn bị → bắt đầu | Đổi thời gian/nhịp, xem căn cứ, bài tương tự; no-match rõ |
| Practice | Video/cue → thời gian thật → pause/dừng → trợ giúp | Không sale/chat popup; khi đổi toàn buổi phải xác nhận và xử lý run cũ |
| Reflection | Câu hỏi trung tính → độ khó/nhịp → cảm nhận tùy chọn → note tùy chọn | Bỏ qua, sửa, chưa sync, khó chịu hơn dẫn safety flow; không làm khảo sát dài |
| Lần tiếp theo | Nhắc nguồn liên quan ngắn → xác nhận context → plan mới hoặc lặp có lý do | Không dùng thông tin nhạy cảm trên lockscreen/notification |
| Memory | Điều MCY nhớ → nguồn → phạm vi thời gian → sửa/xóa/không dùng | Không liệt kê suy bệnh hay hồ sơ “AI hiểu cơ thể” |

Đề xuất thử độ gọn: check-in 2–3 thao tác; trao đổi khoảng 1–3 lượt khi cần; mục tiêu thông thường tới plan trong 30–60 giây gồm thời gian người trả lời. Đây là giả thuyết UX, không timeout cứng hoặc lý do bỏ qua câu hỏi thiết yếu. Người có context rõ có thể nhanh hơn. Đo riêng latency hệ thống và thời gian thao tác.

Có thể gom check-in/trao đổi thành một màn liên tục với card kế hoạch hiện ở cuối để giảm chuyển route. Khi người dùng bắt đầu tập, cuộc trao đổi thu lại; nút Back không làm mất plan đã xác nhận. Không hiển thị “AI đang suy nghĩ về cơ thể bạn”; dùng trạng thái “Đang chọn trong các buổi phù hợp”.

## 5. AI làm gì và hệ thống giữ giới hạn gì?

| Thành phần | Trách nhiệm |
|---|---|
| Giáo viên/reviewer | Tạo và duyệt nội dung, metadata, phạm vi, cue, điều kiện sử dụng, cấu trúc ghép nếu có |
| Bộ lọc server | Quyền nội dung, trạng thái publish/withdraw, locale, thời lượng, dụng cụ/không gian, ràng buộc phạm vi đã duyệt |
| AI hội thoại | Hiểu ý định tiếng Việt, phát hiện mơ hồ, đề nghị context có cấu trúc, hỏi phần tác động đến lựa chọn |
| AI chọn kế hoạch | Xếp hạng/chọn buổi trong candidates hợp lệ theo sở thích/feedback, đề xuất lý do và phương án điều chỉnh |
| Validator server | Kiểm lại ID, owner, quyền, version, thời lượng, evidence, constraints và trạng thái nguồn; reject hoặc yêu cầu chọn lại có giới hạn |
| Người học | Xác nhận context/plan, đổi lựa chọn, dừng và phản hồi thật; sửa/xóa memory |
| Vận hành | Rà report/no-match/chi phí, sửa coverage, tắt chức năng có lỗi và xử lý quyền lợi |

Một mô hình có thể làm cả hội thoại và lựa chọn; không cần nhiều agent hoặc orchestration phức tạp để có MVP. Số lần gọi model là quyết định sau spike, không ấn định mỗi màn một request.

Không gửi toàn bộ lịch sử mỗi lần. Chỉ lấy các facts còn hiệu lực, feedback liên quan, context hiện tại và metadata/cue nguồn có quyền. Nội dung người dùng và tài liệu retrieval là dữ liệu không đáng tin; không được trở thành chỉ thị lấy secret, vượt policy hoặc xem người khác.

**V1:** chọn một buổi hoàn chỉnh có thể gồm nhiều động tác/bài nhỏ đã được giáo viên sắp sẵn. AI quyết định buổi nào và tại sao. **Giai đoạn sau:** chọn block trong template có khởi đầu/chuyển tiếp/kết thúc được duyệt; kiểm toàn chuỗi, thời lượng, tải và biến thể. Nhiều tổ hợp toán học không đồng nghĩa nhiều buổi hợp lệ; không quảng cáo “vô hạn bài tập an toàn”.

Giải thích có căn cứ quan trọng hơn văn vẻ. Khi không có nguồn cho một nhận xét, bỏ nhận xét hoặc nói chưa biết. Không lấy confidence của model làm tín hiệu y tế. Nội dung dừng/triệu chứng/định tuyến phải do chuyên môn rà, không đưa cho AI sáng tác theo mỗi chat.

## 6. Hợp đồng một kế hoạch và vòng đời

Đây là hợp đồng logic để triển khai sau, không phải API đang có.

| Nhóm dữ liệu | Ví dụ / quy tắc |
|---|---|
| Danh tính | plan_id, revision, user_id; server tạo/kiểm owner |
| Đầu vào | checkin_id/context_version, thời gian, ý muốn, facts đã xác nhận còn hiệu lực |
| Nội dung | session_version_id thuộc candidates hợp lệ; V1 một buổi hoàn chỉnh |
| Thời lượng | Tổng thời lượng lấy từ content/media; không nhận số LLM tự sinh |
| Nguồn quyết định | source_mode = ai / rules / manual / demo, model/prompt/catalog/policy version nếu có |
| Lý do | Reason codes có schema + lời giải thích ngắn; liên kết đúng evidence |
| Giới hạn | valid_until, validation_status, quyền và điều kiện phải kiểm lại trước run |
| Lựa chọn | accepted/rejected/changed/deferred, thời điểm, lý do tùy chọn |
| Thực hành | run_id gắn đúng revision; không sửa lịch sử khi user đổi plan |
| Phản hồi | reflection_id + revision; nullable nếu không trả lời |
| Lần sau | evidence/application log chỉ rõ dùng/không dùng feedback vì sao |

Vòng đời: draft context → needs clarification hoặc selecting → validated proposal / no match / unavailable → accepted → started → completed hoặc ended early → feedback optional → context cho lần sau. Không coi mỗi chat message là trạng thái buổi tập.

Stale khi input có thay đổi liên quan, consent/quyền bị rút, nội dung bị thu hồi, expiry hoặc policy yêu cầu kiểm lại. Không tự giả “hôm nay” theo UTC khi user ở múi giờ khác. Đổi timezone không làm mất run cũ; ghi local date tại thời điểm tạo và timezone nguồn.

Chống race/retry: cùng operation_id không tạo nhiều kế hoạch hoặc trừ quota hai lần; chỉ một revision được accept cho cùng ý định. Hai thiết bị có thể có hai run riêng nếu chủ động bắt đầu, nhưng không overwrite checkpoint nhau. Stream AI đến muộn sau logout/đổi context phải bị bỏ theo owner/request version.

## 7. Khi nào feedback được dùng thế nào?

| Người học cung cấp | Ảnh hưởng phù hợp | Điều không được làm |
|---|---|---|
| “Nhịp hơi nhanh” | Ưu tiên pace chậm hơn nếu user còn muốn và catalog có | Suy người học yếu hoặc có bệnh |
| “Khó quá” | Làm rõ phần khó nếu cần; chọn mức dễ hơn thuộc phạm vi đã duyệt | Tự kê biến thể chưa được duyệt hoặc gọi là hồi phục |
| “Cảm giác không thay đổi” | Ghi đúng; xem cùng fit/ý muốn, có thể lặp bài | Coi thất bại, ép tập lâu hơn hoặc tự ghi cải thiện |
| “Khó chịu hơn” | Luồng dừng/phạm vi đã rà; không upsell nhắc tập tiếp | Tự tìm bài “chữa” cảm giác đó |
| “Thích bài này” | Cho lặp khi phù hợp, gợi kế hoạch có liên quan | Hứa bài mới hằng ngày hoặc ép tăng độ khó |
| “Hôm nay không muốn nằm sàn” | Context chỉ buổi này; nếu cần sở thích dài hạn thì hỏi riêng | Tự nhớ vĩnh viễn |
| “Tôi thường thích ít lời hơn” | Đề nghị lưu preference, có nguồn và nút sửa | Suy từ một lần tắt tiếng |
| Bỏ trống/bỏ qua | Không đủ dữ liệu; chọn từ context hiện tại và phần có quyền khác | Điền giá trị tích cực mặc định |
| Sửa phản hồi cũ | Future plan dùng revision mới; invalidation phần phụ thuộc | Giữ summary cũ như sự thật hoặc sửa lịch sử run |
| Không quay lại nhiều ngày | Hỏi điều kiện hiện tại, không có buổi phải bù | Tự tăng độ khó theo lịch hoặc dùng “bạn đã thất bại” |

Không phải mọi feedback đều làm đổi session_id. “Lặp lại bài quen nhưng chuẩn bị rõ hơn” có thể là lựa chọn hợp lý nếu nội dung phù hợp và người học muốn. Điều AI cải thiện có thể là lựa chọn, thời điểm, mức hướng dẫn hoặc sự rõ ràng; không nhất thiết video mới.

## 8. Tình huống khó chịu cần đưa vào prototype/test

| Tình huống | Phản ứng người dùng cần thấy |
|---|---|
| Không muốn chat hôm nay | “Chọn nhanh” dùng context tối thiểu; nếu thiếu điều kiện quan trọng thì hỏi ngắn hoặc tự chọn bài mẫu phù hợp |
| Hỏi nhiều mà vẫn không có bài | Báo rõ không có lựa chọn trong phạm vi, giải thích điểm thiếu; không vòng hỏi vô tận |
| Không bài đúng 5 phút | Chỉ đề nghị thời lượng khác nếu user chủ động chấp nhận; không cắt bài dài |
| AI chọn bài đã tập | Nói rõ đây là lặp có chủ đích, có lựa chọn khác nếu tồn tại; không giả mới |
| Muốn bài ngoài danh mục/quyền | Nói rõ chưa có/chưa được cấp; nội dung ngoài phạm vi không được bịa |
| AI hiểu nhầm ý muốn | Chip context có nút sửa; tạo lại kế hoạch từ context đúng, không buộc chat giải thích nhiều lần |
| AI lỗi/quota hết | Tên nguồn fallback, lịch sử còn truy cập, buổi đã duyệt còn phù hợp có thể xem; retry giới hạn |
| Gián đoạn AI kéo dài trong gói trả phí | Thông báo phạm vi ảnh hưởng, lịch xử lý và bù/gia hạn/hoàn theo điều khoản; không chỉ hiện mã lỗi |
| Feedback chưa sync | “Đang lưu”; giữ draft bảo vệ tối thiểu, retry, không nói AI đã nhớ khi chưa ghi thành công |
| Vào lần sau từ máy khác | Plan/history theo server; không thiếu quyền vì đổi thiết bị; giải thích nếu draft chỉ ở máy cũ |
| Thay thời gian sau khi đã có plan | Cập nhật revision, kiểm lại duration; plan cũ không tự chạy |
| Bấm dừng khi mất mạng | Dừng ngay ở client; hướng dẫn cần thiết có sẵn; không chờ AI |
| Hết hạn giữa buổi | Grace thương mại đã chốt cho run đang hợp lệ; không chặn nút dừng hoặc reflection |
| Xóa điều AI nhớ | Xác nhận rõ phạm vi xóa, cập nhật plan chưa tập; không hỏi lại chính thông tin vừa yêu cầu bỏ trong marketing |
| Người dùng không trả lời cảm nhận | Hoàn tất buổi bình thường; lịch sử ghi “chưa phản hồi” nếu cần, không cảnh báo đỏ |
| Bị trùng/nhầm nguồn teacher | Mỗi lời có nhãn tác giả/căn cứ; AI không tự đổi sang chữ ký giáo viên |

Fallback là cơ chế bảo toàn trải nghiệm và quyền lợi trong sự cố, không phải cách bỏ AI khỏi sản phẩm chính. Nút chọn nhanh cũng không được che việc đang chạy rules thay AI nếu người dùng được hứa AI.

## 9. Danh mục nhỏ: bao phủ hoàn cảnh trước số lượng

Đề xuất bắt đầu bằng 3–5 hoàn cảnh trong khả năng chuyên môn và thời gian sản xuất, ví dụ “mới quay lại, cần nhiều cue”, “chỉ có khoảng ngắn”, “muốn nhịp chậm”, “không muốn chuẩn bị nhiều dụng cụ”. Đây là nhóm nhu cầu sản phẩm, không chỉ định bài cụ thể.

| Metadata phải có | Để giải quyết |
|---|---|
| Thời lượng thực, có buổi ngắn hoàn chỉnh | Người dùng ít thời gian không bị gợi bài vượt budget |
| Cấp độ, yêu cầu kỹ năng, mức hướng dẫn | Người mới theo được; không tự tăng difficulty |
| Pace và intensity tách nhau | “Nhanh quá” không đồng nghĩa “nặng quá” |
| Dụng cụ, không gian, có nằm sàn/đổi vị trí | Hoàn cảnh nhà ở và khả năng chuẩn bị |
| Mục tiêu học tập, ý muốn phù hợp | Chọn bài có lý do, tránh tên chung chung |
| Phạm vi/loại trừ được duyệt | Eligibility có thể kiểm, không để model quyết tự do |
| Người duyệt, version, thời điểm publish/withdraw | Biết nội dung nào được dùng và thu hồi được |
| Repetition/related sessions/alternatives đã rà | Lặp có lý do hoặc đổi có căn cứ |
| Media, caption, transcript, cue | Người học thực hành được, không chỉ xem thẻ plan đẹp |

V1 đề xuất 8–12 buổi hoàn chỉnh nhưng phải kiểm ma trận coverage: hàng là hoàn cảnh ưu tiên, cột là buổi; mỗi ô ghi phù hợp/không/điều kiện. Có thể ít hơn nếu phân khúc rất hẹp hoặc cần nhiều hơn nếu thiếu lựa chọn thay thế. Không nhân 3 mức thời gian × 3 năng lượng × 3 vùng cơ thể để buộc quay đủ mọi tổ hợp.

Mỗi tuần xem no-match và lý do đổi/bỏ buổi đã được tổng hợp phù hợp quyền. Ưu tiên quay bài mở được nhiều hoàn cảnh thường gặp nhất trong scope, thay vì thêm chủ đề chỉ vì hấp dẫn trên mạng. Chất lượng âm thanh/cue và tính nhất quán quan trọng với thư viện nhỏ.

Khóa nền có thể là đường học kỹ năng khi cần, rồi người dùng quay lại vòng lặp. Không ép mọi người hoàn thành giáo trình dài để được hỏi “hôm nay tập gì”; những prerequisite thực sự cần được nội dung chuyên môn quy định.

## 10. Kế hoạch kiểm chứng và tiêu chí nghiệm thu prototype tiếp theo

**Vòng usability:** 5–6 người, gồm người chưa quen giáo viên. Giao tác vụ hai lần: chọn buổi hôm nay, phản hồi không tích cực/không thay đổi, quay lại với một context khác, sửa điều AI nhớ. Không chỉ đường thao tác, không gọi người dùng sai khi họ không hiểu copy.

**Vòng so sánh giá trị:** dùng cùng catalog, thử bộ lọc/quy tắc đơn giản và hội thoại AI. Đổi thứ tự ở những người phù hợp để giảm hiệu ứng mới lạ; ghi rõ khác biệt nhiệm vụ. Với mẫu nhỏ chỉ rút tín hiệu định tính, không tuyên bố thắng A/B thống kê.

**Vòng sử dụng thật:** beta AI có quyền và nội dung đã duyệt, theo dõi ít nhất 14 ngày, rồi đủ 28–30 ngày cho câu hỏi quay lại/tái mua. Cho người tham gia biết khả năng và giới hạn beta; không dùng sample nhỏ xác nhận an toàn y tế.

| Acceptance | Bằng chứng cần xem |
|---|---|
| Người mới biết việc cần làm | Hoàn thành check-in→plan không cần hướng dẫn ngoài |
| AI có tác động thực vào lựa chọn | Context khác nhau cho kết quả phù hợp constraints; giải thích có nguồn, không chỉ thay tiêu đề |
| Feedback trung thực được chấp nhận | Như cũ/khó chịu hơn/chưa rõ/skip đều có đường đi đúng |
| Feedback nối sang lần sau | Plan B truy về nguồn A đúng revision; user nhận ra/sửa được |
| Không giả tiến bộ | Không số liệu chart/tuyên bố cảm nhận tự sinh; fixture có nhãn |
| Có đường khi thiếu nội dung | No-match không bịa buổi hoặc lặng lẽ vượt budget |
| Có đường khi AI lỗi | Timeout/fallback có nguồn, retry được, các quyền cơ bản vẫn hoạt động |
| Không cần chat dài | Task thường tới plan đủ nhanh; báo cả người bỏ trước plan |
| Giữ runtime | check:runtime pass sau phục hồi baseline; keyboard/scroll/safe area/picker kiểm lại |
| Chưa nhầm prototype với sản phẩm thật | Mọi dữ liệu demo/AI mô phỏng/không có payment thật được nói rõ |

Những quyết định cần phản biện trước implementation: các hoàn cảnh ưu tiên; mức lựa chọn nguyên buổi so với ghép block; độ ngắn của hội thoại; quyền nhớ context; thời hạn gói đồng hành và quyền giáo viên. Không cần chốt nhà cung cấp AI hoặc thiết kế mọi màn phụ để kiểm thử vòng lặp này.
