# 03 · Dữ liệu backend, phân quyền và đo lường

**Mô hình logic để review, chưa phải SQL/migration hoặc thiết kế đã triển khai.** Không cần xây hết các bảng ở V1. Những bảng N/M chỉ tạo khi tính năng tương ứng được duyệt; giữ các ranh giới nghiệp vụ ngay từ đầu.

## 1. Quy ước và quan hệ cốt lõi

ID dùng UUID hoặc định danh ngẫu nhiên tương đương; thời điểm lưu UTC, kèm timezone IANA và local_date khi ý nghĩa nghiệp vụ phụ thuộc ngày địa phương. Tiền lưu số nguyên theo đơn vị nhỏ nhất của currency, không float; VND không có phần thập phân thực dùng. Trường `?` là nullable, không phải tự gán giá trị mặc định. Các bảng có `created_at`, `updated_at` nếu chỉnh sửa; bản ghi sự kiện dùng append-only. Soft delete không thay thế quy trình xóa dữ liệu thật.

```text
User 1 ── N AuthIdentity
User 1 ── 1 Profile; 1 ── N ConsentEvent
User 1 ── N Order 1 ── N OrderItem N ── 1 Product
Product 1 ── N Price; 1 ── N ChannelSKU; 1 ── N Benefit
OrderItem 1 ── N EntitlementGrant N ── 1 User
Course 1 ── N CourseVersion 1 ── N Lesson N ── 1 SessionVersion
User 1 ── N Enrollment N ── 1 CourseVersion
Enrollment 1 ── N TeacherAssignment N ── 1 Teacher
User 1 ── N PracticeRun N ── 1 SessionVersion
PracticeRun 1 ── N PlaybackCheckpoint; 1 ── 0..1 Reflection
Enrollment 1 ── N FeedbackCard; FeedbackCard 1 ── N EvidenceLink
User 1 ── N ShareGrant ── Scope + Recipient + Expiry
User 1 ── N DataRequest; mọi hành động đặc quyền → AuditEvent
```

Course không đồng nghĩa product: cùng giáo trình có thể bán bản tự học hoặc có hỗ trợ, nhưng không nhân đôi video. Product không đồng nghĩa entitlement: một giao dịch có thể cấp nhiều lợi ích độc lập. Enrollment không đủ để cho xem bài nếu quyền truy cập đã hết; quyền học hợp lệ cũng không bỏ qua điều kiện nội dung/readiness.

## 2. Từ điển dữ liệu người dùng

| Bảng | Trường nghiệp vụ chính | Quan hệ/ràng buộc | Đợt |
|---|---|---|---|
| users | id, status(active/suspended/deletion_pending/deleted), created_at, deleted_at? | Không lưu role do client tự khai; auth provider quản lý bí mật xác thực | L |
| auth_identities | id, user_id, provider, provider_subject, verified_at, email? | UNIQUE(provider, provider_subject); email là thuộc tính, không khóa quyền học | L |
| profiles | user_id, display_name?, locale, timezone, experience?, primary_goal?, onboarding_version, onboarding_completed_at? | PK/FK user_id; mục tiêu/kinh nghiệm chỉ thu khi sử dụng; không hồ sơ công khai mặc định | L |
| terms_acceptances | id, user_id, terms_version, accepted_at, channel | Bằng chứng điều khoản tách consent tùy chọn | L |
| consent_events | id, user_id, purpose, policy_version, action(grant/withdraw), occurred_at, source, evidence_ref? | Append-only; effective consent là trạng thái suy ra; mỗi mục đích riêng | L |
| notification_preferences | user_id, channel, enabled, local_time?, weekdays?, timezone_mode, quiet_start?, quiet_end? | UNIQUE(user_id, channel); dịch vụ và quảng cáo tách mục đích | L |
| notification_endpoints | id, user_id, device_id?, endpoint_encrypted, channel, status, last_seen_at | Token không public/log; logout/revoke xử lý phù hợp | N/M |
| role_assignments | id, user_id, role, scope_type, scope_id?, starts_at, ends_at?, assigned_by | Quyền do server/owner hợp lệ cấp; không boolean is_admin trong form hồ sơ | L |
| devices | id, user_id, platform, app_version, last_seen_at, revoked_at? | ID do app cấp, không fingerprint; token/session bí mật ở auth/secure storage | M/N |
| guest_sessions | id, opaque_token_hash, expires_at, merged_user_id?, consumed_at? | Launch có thể chỉ lưu local tiến độ mẫu; không lưu health guest server | L tối giản |
| data_requests | id, user_id, type(export/delete/correct), status, verified_at?, due_at, completed_at?, result_ref?, exception_reason? | Link export ngắn hạn; không upload công khai; có retry/receipt | L |

**Không thu mặc định:** ngày sinh đầy đủ, địa chỉ nhà, giới tính, cân nặng, số đo, ảnh cơ thể, danh bạ, GPS, hồ sơ bệnh án. Nếu giới hạn dịch vụ người trưởng thành, dùng xác nhận phù hợp phạm vi và chính sách đã rà; không thu DOB chỉ để marketing. Phone chỉ thêm nếu kênh hỗ trợ/đăng nhập đã chọn thật sự cần và được giải thích.

## 3. Dữ liệu nhạy cảm và thực hành

| Bảng | Trường chính | Ràng buộc/ý nghĩa | Đợt |
|---|---|---|---|
| readiness_checks | id, user_id, policy_version, answer_set_encrypted?, decision, reason_code?, checked_at, recheck_due_at? | decision=unknown/within_scope/needs_review/stop_guidance; không dùng tên safe; quyền riêng | L nếu cá nhân hóa |
| checkins | id, user_id, local_date, timezone_at_creation, time_budget_seconds?, energy?, focus?, readiness_check_id? | Không unique theo ngày nếu có nhiều lần; lịch sử có timestamp; null ≠ khỏe | L tối giản |
| recommendations | id, user_id, checkin_id?, rule_version, selected_session_version_id?, status, reason_codes, created_at | candidates ở bảng con; no_match là kết quả hợp lệ; dữ liệu giải thích có quyền | L rules/N |
| recommendation_candidates | recommendation_id, session_version_id, rank, eligibility_snapshot_ref | FK thật; chỉ ID published/hợp lệ tại lúc đề xuất, kiểm lại lúc bắt đầu | N |
| practice_runs | id, user_id, session_version_id, enrollment_id?, recommendation_id?, state, started_at?, ended_at?, end_reason?, timeline_version, version, timezone_at_start | idempotency_key unique trong scope user; không ghi đè version cũ | L |
| playback_checkpoints | id, run_id, device_id, sequence, media_position_ms, interval_start_ms?, interval_end_ms?, received_at | UNIQUE(run_id, device_id, sequence); server kiểm giới hạn/duration; buffer không cộng | L |
| reflections | id, run_id, user_id, perceived_change?, difficulty?, note_encrypted?, revision, submitted_at? | UNIQUE(run_id); owner phải trùng run; missing ≠ positive; không compulsory note | L tùy chọn |
| reflection_revisions | reflection_id, revision, changed_at, changed_by, protected_payload | Chỉ giữ nếu có nhu cầu audit đã xác định; retention riêng, không nhân dữ liệu mãi | N |
| share_grants | id, user_id, recipient_user_id, enrollment_id, scope, starts_at, expires_at, revoked_at? | Scope cụ thể: tiến độ, structured reflection, note được chọn; không “mọi dữ liệu mãi mãi” | L khi có feedback |
| safety_cases | id, user_id, run_id?, policy_version, state, restricted_reason?, opened_at, next_action, closed_at? | Dữ liệu hạn chế; không gọi là hồ sơ điều trị; không gửi marketing | L tối giản |

Quyền cho giáo viên xem dữ liệu hiện có không tự mở toàn bộ lịch sử. Form phải nói rõ phạm vi thời gian, khóa, loại dữ liệu và người nhận. Khi rút quyền: kiểm lại mọi request, vô hiệu cache, loại evidence khỏi draft chưa gửi; thẻ đã gửi giữ/xóa/redact theo policy và yêu cầu của người dùng. Không hứa có thể thu hồi điều một người đã đọc hoặc bản xuất đã được phép nhận.

Không bắt mọi bài học dựa vào hồ sơ nhạy cảm. V1 có thể là giáo trình cố định có nội dung giới hạn được duyệt, checkpoint và feedback học tập; mở cá nhân hóa sức khỏe chỉ sau thẩm định. Check-in/ngôn ngữ wellness vẫn có thể tiết lộ tình trạng sức khỏe, phải phân loại thận trọng.

## 4. Nội dung và vận hành giảng dạy

| Bảng | Trường chính | Quan hệ/ràng buộc | Đợt |
|---|---|---|---|
| teachers | user_id, public_name, bio, credentials_verified_ref?, active, support_schedule | Thông tin công khai tách hồ sơ/giấy tờ nội bộ | L |
| media_assets | id, storage_key, type, duration_ms, processing_status, checksum, rights_ref, rights_expire_at? | Không lưu URL public vĩnh viễn cho video trả phí | L |
| sessions | id, stable_slug, owner_teacher_id | Định danh logic; không chỉnh đè lịch sử | L |
| session_versions | id, session_id, version_no, locale, title, objective, level, intensity, duration_seconds, props, exclusions_policy_ref, media_id, caption_asset_id?, status, reviewed_by?, approved_at?, published_at? | UNIQUE(session_id, version_no, locale); published cần đủ metadata/duyệt/media; caption theo chuẩn release | L |
| session_segments | id, session_version_id, position, start_ms, end_ms, cue_ref, exercise_version_id? | Mốc thời gian hợp lệ/không vượt video | L cue/N chi tiết |
| exercise_versions | id, exercise_id, version_no, locale, name, instructions, props, reviewed_by, status | Chỉ tạo khi thư viện động tác có nhu cầu rõ | N |
| variant_links | parent_segment_id, variant_session_segment_id, transition_rule, approval_ref | Không thay tùy tiện động tác cùng vùng; cả hai phiên bản được kiểm | N |
| courses/course_versions | id, course_id, version, locale, title, audience, syllabus, outcomes, status, support_policy_ref | Outcomes về học tập, không bảo đảm điều trị | L |
| course_lessons | id, course_version_id, position, session_version_id, required, unlock_rule, completion_rule | UNIQUE(course_version_id, position); không tự hoàn thành do ngày trôi qua | L |
| enrollments | id, user_id, course_version_id, cohort_id?, state, enrolled_at, access_grant_id | Version học cố định; chuyển version có mapping rõ | L |
| lesson_progress | enrollment_id, lesson_id, state, last_run_id?, completed_at?, source | UNIQUE(enrollment_id, lesson_id); source=observed/self_report/imported phân biệt | L |
| teacher_assignments | id, enrollment_id, teacher_user_id, valid_from, valid_to?, status | Giới hạn một primary teacher active nếu chính sách chọn; đổi người có audit | L |
| cohorts | id, course_version_id, name, start_at, end_at, capacity, primary_teacher_id, enrollment_state | Khóa tự học có thể không có cohort; giữ chỗ cần expiry và transaction chống bán quá số chỗ | L nếu cohort |
| feedback_tasks | id, enrollment_id, assignment_id, milestone, due_at, status, completed_at? | Không tạo vô hạn từ mỗi note; task theo quyền lợi đã bán | L |
| feedback_cards | id, enrollment_id?, user_id, source_type, author_id?, approved_by?, body_encrypted, status, sent_at?, revision, ai_run_id? | teacher phải author có quyền; AI không được giả chữ ký; draft không tới learner | L/N |
| feedback_evidence | id, card_id, run_id?, reflection_id?, content_version_id? | CHECK đúng loại FK; không JSON ID tùy ý vượt quyền | L/N |
| live_occurrences | id, cohort_id, starts_at, ends_at, timezone, meeting_secret_ref, capacity, status | Server chỉ trả link cho người đủ quyền; thay lịch có thông báo | L nếu live |
| live_bookings | id, occurrence_id, enrollment_id, status, booked_at, canceled_at?, attendance_source?, attended_at? | UNIQUE(occurrence_id, enrollment_id); vào link không đồng nghĩa đã tham gia/tập | N khi cần đặt chỗ |
| content_reviews | id, object_version_id, reviewer_id, review_type, decision, notes_ref, reviewed_at | Có evidence người duyệt; agent không tự gán approved | L |

Các cột tham chiếu đa loại trong bảng trên phải được cụ thể hóa bằng FK/bảng con khi thiết kế vật lý. Không dùng một trường polymorphic rồi bỏ toàn bộ kiểm toàn vẹn. JSON chỉ dùng metadata có schema/version hoặc snapshot bất biến có lý do; user, price, role, entitlement và quan hệ khóa cần cấu trúc truy vấn/kiểm thử được.

## 5. Thương mại và quyền lợi

| Bảng | Trường chính | Quy tắc | Đợt |
|---|---|---|---|
| products | id, type(course/membership/support), status, terms_version | Product đang bán không phụ thuộc tên marketing | L |
| product_benefits | id, product_id, benefit_type, course_version_id?, quantity?, duration_policy | Tách xem khóa, feedback quota, AI access; cấu hình có schema | L |
| prices | id, product_id, currency, amount_minor, billing_mode(one_time/recurring), interval?, country, starts_at, ends_at? | Không sửa giá đơn đã chốt | L; recurring N |
| channel_skus | id, product_id, price_id?, channel, storefront?, external_product_id, active | UNIQUE(channel, storefront, external_product_id) | M/N |
| orders | id, user_id, channel, state, currency, subtotal_minor, discount_minor, tax_minor, total_minor, terms_snapshot, expires_at, idempotency_key | Server tính; không tin tổng tiền client | L |
| order_items | id, order_id, product_id, price_id, product_snapshot, quantity, line_total_minor | Snapshot quyền lợi/thời hạn/SLA lúc mua | L |
| payment_attempts | id, order_id, provider, external_transaction_id?, status, paid_minor?, settled_at?, verified_by?, reconciliation_ref? | UNIQUE(provider, external_transaction_id) khi có; không giữ số thẻ | L |
| payment_events | id, provider, external_event_id, signature_verified, received_at, occurred_at, payload_ref, processing_state | UNIQUE(provider, external_event_id); payload tối thiểu bảo vệ và hết hạn | L |
| entitlement_grants | id, user_id, benefit_id, order_item_id?, source_type, starts_at, ends_at?, status, revoked_at?, revocation_reason? | Server cấp; học viên cũ/manual cần bằng chứng; các grant độc lập | L |
| subscriptions | id, user_id, product_id, provider, external_subscription_id, status, period_start, period_end, cancel_at_period_end | Không dùng cho khóa một lần; grace/dunning theo policy đã chốt | N |
| refunds | id, order_id, payment_attempt_id, external_refund_id?, amount_minor, status, requested_by, reason_code, approved_at? | Tổng refund không vượt đã thu; một phần có mapping quyền lợi | L |
| invoices | id, order_id, invoice_provider_ref, status, issued_at?, protected_billing_ref | Chính sách thuế/hóa đơn chọn cùng kế toán | L nếu áp dụng |
| coupons/redemptions | id, code_hash, scope, validity, usage_limit; order_id, user_id | Chống replay; không cần xây coupon engine tại launch | N |

**Bất biến:** một payment event được xử lý nhiều lần vẫn chỉ có một hiệu ứng; trạng thái đơn cũ không ghi đè trạng thái mới; hoàn tiền một đơn không tước quyền trùng còn hợp lệ từ đơn khác; cancel renewal không expire ngay; course access và teacher support có thể kết thúc khác ngày.

Luồng thanh toán: tạo order snapshot → provider tạo phiên theo idempotency key → xác minh webhook/server query → kiểm amount/currency/product/owner → transaction ghi payment + grant + outbox → gửi thông báo. Không dùng `success=true` trên URL làm bằng chứng. Email lỗi không làm mất quyền; job gửi lại từ outbox. Đối soát định kỳ tìm payment đã thành công nhưng thiếu grant và grant không có nguồn hợp lệ.

## 6. Vận hành, AI, flags và sự kiện

| Bảng | Trường chính | Điều kiện |
|---|---|---|
| support_tickets | id, user_id, category, priority, state, assigned_to?, due_at, restricted_payload_ref? | Finance ticket không tự mở nhật ký; hạn chế file đính kèm |
| support_messages | id, ticket_id, author_id, visibility, protected_body, sent_at | Nội bộ và gửi học viên tách; kiểm quyền mỗi lần đọc/gửi |
| benefit_usage | id, grant_id, usage_type, operation_id, quantity, period_key, recorded_at | UNIQUE(grant_id, operation_id); retry không trừ hai lần; quota AI/feedback tính từ ledger |
| ai_runs | id, user_id, purpose, consent_ref, prompt_version, model_version, knowledge_version, input_refs, output_ref?, validation_result, cost_minor?, latency_ms, retention_until | Không raw prompt chứa health text trong log chung |
| ai_reports | id, ai_run_id, reporter_id, category, status, reviewer_id? | Quyền review theo nhiệm vụ; có phương án tắt |
| feature_flags/flag_audit | key, version, owner, eligibility, rollout, default, expiry, fallback; actor, reason, changed_at | Server quyết định nhánh nhạy cảm; thay đổi có audit |
| outbox | id, aggregate_type, aggregate_id, event_type, payload_minimal, created_at, delivered_at?, attempts | Transactional với domain update; consumer idempotent |
| audit_events | id, actor_id/service_id, action, object_type, object_id, outcome, request_id, occurred_at, reason? | Không chứa nguyên note/token; quyền ghi và đọc tách; export audit bảo vệ |
| leads | id, contact_encrypted, consent_ref, source_id, status, created_at, retention_until | Không gắn sức khỏe/nhật ký vào CRM marketing |
| campaign_touches | id, pseudonymous_id?, campaign_id, source, medium, consent_ref?, occurred_at | UTM allowlist, không symptom trong URL; không fingerprint |
| product_events | event_id, event_name, schema_version, actor_pseudo_id?, session_id?, screen_id?, occurred_at, received_at, platform, app_version, properties_allowlist | Pipeline phân loại dữ liệu và mục đích; không tự do JSON tùy tiện |
| experiment_assignments | experiment_id, unit_id, variant, assigned_at, eligibility_version | Chỉ khi lượng mẫu đủ; assignment không là exposure |

## 7. Phân quyền: vai trò + điều kiện theo bản ghi

| Vai trò | Được | Không được mặc định |
|---|---|---|
| Guest | Nội dung mẫu/public, tiến độ tạm tối thiểu | Đọc tài khoản, lịch sử riêng hoặc suy quyền bằng email |
| Learner | Đọc/sửa phần của mình; học nội dung có quyền; rút chia sẻ | Đổi owner, cấp quyền, tự xác nhận payment |
| Teacher | Enrollment được giao còn hiệu lực; phần đã được chia sẻ; feedback có căn cứ | Mọi learner, mọi note, payment hoặc toàn bộ hồ sơ sức khỏe |
| Content editor | Soạn nội dung/metadata/media draft | Duyệt chuyên môn chính mình bằng tài khoản bot hoặc xem nhật ký |
| Content reviewer | Duyệt loại nội dung thuộc năng lực được giao | Truy cập user ngoài nhu cầu hoặc bypass an toàn |
| Support | Tài khoản che bớt thông tin, trạng thái quyền, ticket | Raw reflection, secret, tự refund/cấp unlimited |
| Finance | Đối soát order/payment/refund/invoice | Nhật ký hoặc chat AI |
| Growth/analyst | Funnel tổng hợp, dữ liệu marketing đã cho phép | Danh sách người đau/khó chịu, raw AI prompt, ad audience sức khỏe |
| Owner/security admin | Quản lý cấu hình/quyền; truy cập khẩn cấp có lý do | Không dùng tài khoản quyền cao hàng ngày để xem mọi thứ |
| Service identity | Một tác vụ cụ thể: webhook, notification, AI | Khóa DB toàn quyền trên client hoặc chia sẻ một secret cho mọi dịch vụ |

Một founder có thể kiêm nhiều vai trò, nhưng workflow và log vẫn phân biệt hành động. Dùng tài khoản đặc quyền có MFA; danh tính dùng hằng ngày ít quyền hơn. “Break glass” để xử lý sự cố phải có lý do, thời hạn và audit; không là cổng đọc mọi health data mặc định.

Điều kiện đọc reflection của giáo viên: đã xác thực ∧ assignment đúng enrollment còn hiệu lực ∧ người học đúng owner ∧ share grant đúng scope/thời gian chưa bị rút ∧ tài khoản không bị đình chỉ. Áp dụng tại API/database, không chỉ route UI. File/media, export, realtime và cache cũng phải tuân thủ; test teacher A/B, learner A/B và role bị thu hồi.

Khi dùng DB có row-level policy, các đường server/service role bypass policy vẫn cần kiểm quyền riêng và tests. Không coi “bật RLS” là đủ. Các view/aggregate/search/vector retrieval phải giữ phạm vi người dùng; derived data không được trở thành cửa rò rỉ.

## 8. Lưu giữ, rút quyền, xuất và xóa

Các thời hạn dưới đây là **đề xuất nội bộ để thẩm định**, không tuyên bố thời hạn luật định. Trước pilot cần bảng chính thức: trường nào, mục đích/căn cứ, ai đọc, nhà xử lý nào, vùng lưu, thời hạn, cách xóa và ngoại lệ.

| Dữ liệu | Đề xuất mặc định | Khi xóa/rút quyền |
|---|---|---|
| Guest progress | Local tối đa 7 ngày, có xóa ngay; không health text | Merge xác minh một lần hoặc hết hạn |
| Hồ sơ/tiến độ | Khi tài khoản hoạt động; policy tài khoản không hoạt động cần thông báo | Xóa hoặc khử định danh không thể đảo ngược nếu hợp lệ |
| Reflection/check-in | Tối đa 12 tháng ban đầu trừ người dùng chọn giữ lâu hơn theo cơ sở hợp lệ | Xóa nguồn, cache, chỉ mục, summary phụ thuộc hoặc redact |
| AI raw input/output | Mặc định không lưu raw nếu không cần; tối đa 30 ngày nếu cần QA và được phép | Xóa cả bản nhà cung cấp theo khả năng/hợp đồng |
| Analytics thô nội bộ | 90 ngày; aggregate dài hơn sau kiểm tái định danh | Xóa linkage cá nhân; nhóm nhỏ không gọi là anonymous |
| Security audit | Ví dụ 180 ngày, tối thiểu payload | Giữ phần cần thiết theo căn cứ đã rà, hạn chế truy cập |
| Orders/invoices | Theo nghĩa vụ pháp lý/kế toán thực tế | Tách khỏi hồ sơ học; giải thích phần không thể xóa ngay |
| Backup | Cửa sổ mục tiêu 30 ngày nếu nhà cung cấp đáp ứng | Tombstone/deletion ledger để không hồi sinh tài khoản khi restore |

Quy trình xóa: re-auth → ghi request → xác định nguồn mua và hướng dẫn hủy nếu còn gia hạn → khóa token/session theo policy → job xóa domain + media riêng + cache + AI/vendor + marketing → ghi receipt tối thiểu → xử lý backup theo chu kỳ. Không nói “xóa ngay mọi bản sao” nếu hạ tầng không làm được. Việc hủy thuê bao chưa xong phải có hỗ trợ, không để thành điều kiện vô hạn ngăn quyền xóa hợp lệ.

Việt Nam có Luật 91/2025/QH15 và Nghị định 356/2025/NĐ-CP cùng hiệu lực từ 01/01/2026. Cần thẩm định nghĩa vụ theo loại dữ liệu, vai trò doanh nghiệp và luồng xử lý, kể cả xuyên biên giới. Tài liệu này xác minh sự tồn tại/ngày hiệu lực, chưa thẩm định từng điều. [R13 · Luật](https://congbao.chinhphu.vn/van-ban/luat-so-91-2025-qh15-45578.htm), [R14 · Nghị định](https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-356-2025-nd-cp-468371.htm).

Ngoài dữ liệu: trước nhận tiền phải rà tư cách kinh doanh, thông tin người bán, nghĩa vụ website/app thương mại điện tử theo mô hình thực tế, điều khoản số, thuế/hóa đơn, quảng cáo sức khỏe, refund, quyền media và xử lý khiếu nại. Đây là danh sách công việc giao người có chuyên môn; không mặc định quy định cũ hay nhãn “wellness” tạo ngoại lệ.

## 9. Tracking: bốn luồng tách mục đích

1. **Giao dịch/vận hành thiết yếu:** order, grant, login error, delivery; cơ sở xử lý theo chức năng và policy đã rà, không phụ thuộc đồng ý nhận quảng cáo.
2. **Product analytics nội bộ:** funnel, player error, tiến độ; sự kiện tập luyện có thể nhạy cảm dù chỉ có ID, nên hạn chế và không tự gửi SDK bên thứ ba.
3. **Marketing:** nguồn chiến dịch và liên hệ được phép, không health data; consent quảng cáo không mặc nhiên cho phép mọi xử lý sức khỏe.
4. **Phân tích chất lượng/an toàn:** dữ liệu hạn chế cho người phụ trách, đầu ra tổng hợp; không biến safety_case thành audience quảng cáo.

Đề xuất launch không gắn ad pixel/session replay lên màn học, check-in, nhật ký, AI hay thanh toán. Auto-capture và URL tự động đều tắt ở vùng riêng. SKU/course title/URL cũng có thể tiết lộ sức khỏe, không chỉ free text. Analytics nội bộ chỉ nhận tên event và thuộc tính đã duyệt; log error được redaction trước khi gửi nhà cung cấp.

| Event | Nguồn phát | Thuộc tính được cân nhắc | Mục đích / guardrail |
|---|---|---|---|
| landing_viewed | Client nếu được phép | campaign_id tổng quát, locale | Không symptom/ad identifier trong URL |
| sample_started | Client/internal collector | session_public_id, platform | Dùng nội bộ nếu nội dung có thể nhạy cảm |
| signup_completed | Server | auth_method, channel | Không email/token |
| checkout_created | Server | order_ref, currency, channel | Không payment detail |
| payment_confirmed | Server sau xác minh | transaction_ref, amount_minor | Nguồn doanh thu; không lấy nút bấm làm sale |
| entitlement_granted | Server | grant_ref, benefit_type | Đối soát thời gian cấp quyền |
| practice_started/ended | Domain server | run_ref, reason_category, valid_play_seconds | Dữ liệu học tập nội bộ, không ad SDK |
| reflection_submitted | Domain event tối thiểu | run_ref, revision | Không gửi loại cảm nhận/note ra marketing |
| media_failed | Collector kỹ thuật | error_class, platform, content_version_ref | Không signed URL/token |
| teacher_feedback_sent | Server | task_ref, turnaround_bucket | Không body hoặc learner name |
| ai_answer_reported | Server | run_ref, category | Nội dung chỉ người có quyền xử lý |
| consent_changed/deletion_completed | Server audit | purpose, version, request_ref | Bằng chứng, retention riêng |

Envelope: event_id, name, schema_version, occurred_at, received_at, producer, request_id, actor_ref nếu cần, platform/app_version và consent-policy snapshot phù hợp. Có event registry gồm owner, schema, nơi lưu, mục đích, thời hạn. Ingest loại thuộc tính ngoài allowlist; deduplicate bằng event_id, đối soát event server với domain DB. Người dùng từ chối analytics không được bị tính là không tập: báo độ phủ và dữ liệu thiếu, dùng dữ liệu vận hành chỉ theo căn cứ được phép.

## 10. KPI và định nghĩa ra quyết định

| Chỉ số | Định nghĩa | Sử dụng |
|---|---|---|
| Khách tiềm năng có chất lượng | Người chủ động xin thông tin/thử khóa, không đếm follower | Hiểu nhu cầu theo nguồn |
| Kích hoạt người mua | Người mua bắt đầu bài thật trong 72 giờ / người mua hợp lệ đã có đủ 72 giờ | Theo dõi tắc login/quyền/hướng dẫn |
| Thực hành tuần | Số người có ≥2 run hợp lệ/tuần theo timezone đã chọn | Chỉ số hành vi, không sức khỏe |
| Hoàn tất bài | Run đạt ≥80% khoảng phát không trùng + xác nhận hoàn thành theo policy | Quy tắc thử, không bằng chứng làm đúng; safety exit tách riêng |
| W2/W4 | Người activated có ≥1 buổi ngày 7–13 / 21–27; mẫu số đủ thời gian theo dõi | Không gọi nhầm D7/D30; không bỏ người rời |
| Kết thúc khóa | Hoàn tất các bài bắt buộc theo course rule / enrollment đủ cửa sổ quan sát | Không lấy ngày qua đi làm hoàn thành |
| Đóng góp/cohort | Thu thuần trừ cost biến đổi và công phục vụ cohort | Xem cùng số giờ founder |
| Tải giáo viên | Phút hỗ trợ/học viên/tuần và SLA đúng hạn | Gate nhận thêm người |
| Tái mua/gia hạn | Giao dịch kế tiếp thật / người tới cơ hội mua tiếp | Không dùng ý định khảo sát thay doanh thu |
| Chất lượng AI | Có căn cứ, báo sai, fallback, chi phí/người sử dụng | So với baseline rules/FAQ; không xem lượt chat là giá trị |
| Guardrails | Cấp sai quyền, thu trùng, dữ liệu rò, safety failure, lỗi phát | Bất kỳ nghiêm trọng đều chặn mở rộng |

V1 không nhất thiết triển khai đủ bộ đếm intervals phức tạp cho nhiều biến thể; có thể đo player checkpoint đơn giản và giữ nhãn “đã xem/xác nhận hoàn thành” đúng nghĩa. Khi đổi định nghĩa, tăng metric_version và không ghép hai cách tính vào cùng xu hướng mà không chú thích.

Dashboard tuần một trang: lượt vào có thể đo → học mẫu → người mua → bắt đầu học → quay lại; đơn/quyền chưa khớp; support và lỗi; thu/chi/giờ công. Phân cohort nguồn quen/khách mới, karma/trả phí và nền tảng. Không đánh giá teacher bằng việc giảm báo khó chịu hoặc tăng completion bằng mọi giá.

Mẫu nhỏ phải báo cả số đếm và nguyên nhân: 3/10 quay lại hữu ích hơn “retention 30%” đứng một mình. Chỉ chạy thử nghiệm đối chứng khi xác định metric chính, mức thay đổi cần phát hiện, sample size và cửa sổ quan sát; không phân tích nhiều lần rồi chọn kết quả đẹp. Không A/B các bảo vệ an toàn hoặc quyền hủy/xóa.
