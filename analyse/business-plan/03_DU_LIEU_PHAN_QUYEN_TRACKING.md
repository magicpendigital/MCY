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
User 1 ── N Checkin 1 ── 0..1 DailyDialogue 1 ── N DialogueTurn
User 1 ── N PreferenceMemory; mỗi memory có nguồn + scope + expiry
Checkin 1 ── N DailyPlan 1 ── N PlanRevision 1 ── N PlanItem
PlanRevision N ── N Evidence (checkin/reflection/memory/content)
PlanRevision 1 ── N PracticeRun N ── 1 SessionVersion
PracticeRun 1 ── N PlaybackCheckpoint; 1 ── 0..1 Reflection
Enrollment 1 ── N FeedbackCard; FeedbackCard 1 ── N EvidenceLink
User 1 ── N ShareGrant ── Scope + Recipient + Expiry
User 1 ── N DataRequest; mọi hành động đặc quyền → AuditEvent
```

**DailyPlan là đối tượng nghiệp vụ trung tâm**, không phải chỉ một tin chat. Kế hoạch có phiên bản, căn cứ, lựa chọn được chấp nhận, validation và liên kết tới buổi thực hành/phản hồi. User không cần enrollment khóa học để có daily plan.

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
| checkins | id, user_id, local_date, timezone_at_creation, time_budget_seconds?, energy?, intent?, context_encrypted?, readiness_check_id?, valid_until | Không unique theo ngày; context có schema; null ≠ khỏe; hôm nay không thành sở thích vĩnh viễn | L |
| recommendations | id, user_id, checkin_id, ai_run_id?, rule_version, catalog_version, selected_session_version_id?, status, reason_codes, created_at | Một lần chọn có provenance; liên kết plan_revision; no_match hợp lệ; không tự có quyền chạy | L |
| recommendation_candidates | recommendation_id, session_version_id, rank, eligibility_snapshot_ref, ranking_source | FK thật; chỉ ID hợp lệ; rules lọc cứng, AI rank trong tập đó; kiểm lại khi bắt đầu | L |
| practice_runs | id, user_id, session_version_id, enrollment_id?, recommendation_id?, plan_revision_id?, state, started_at?, ended_at?, end_reason?, timeline_version, version, timezone_at_start | idempotency_key unique trong scope user; không ghi đè version cũ | L |
| playback_checkpoints | id, run_id, device_id, sequence, media_position_ms, interval_start_ms?, interval_end_ms?, received_at | UNIQUE(run_id, device_id, sequence); server kiểm giới hạn/duration; buffer không cộng | L |
| reflections | id, run_id, user_id, perceived_change?, difficulty?, pace_fit?, duration_fit?, preference_for_next?, note_encrypted?, revision, submitted_at? | UNIQUE(run_id); owner phải trùng run; missing ≠ positive; không compulsory note | L tùy chọn |
| reflection_revisions | reflection_id, revision, changed_at, changed_by, protected_payload | Chỉ giữ nếu có nhu cầu audit đã xác định; retention riêng, không nhân dữ liệu mãi | N |
| share_grants | id, user_id, recipient_user_id, enrollment_id, scope, starts_at, expires_at, revoked_at? | Scope cụ thể: tiến độ, structured reflection, note được chọn; không “mọi dữ liệu mãi mãi” | L khi có feedback |
| safety_cases | id, user_id, run_id?, policy_version, state, restricted_reason?, opened_at, next_action, closed_at? | Dữ liệu hạn chế; không gọi là hồ sơ điều trị; không gửi marketing | L tối giản |

Quyền cho giáo viên xem dữ liệu hiện có không tự mở toàn bộ lịch sử. Form phải nói rõ phạm vi thời gian, khóa, loại dữ liệu và người nhận. Khi rút quyền: kiểm lại mọi request, vô hiệu cache, loại evidence khỏi draft chưa gửi; thẻ đã gửi giữ/xóa/redact theo policy và yêu cầu của người dùng. Không hứa có thể thu hồi điều một người đã đọc hoặc bản xuất đã được phép nhận.

V1 cá nhân hóa cách lựa chọn theo thời gian, ý muốn, kinh nghiệm và phản hồi được phép, không phải tạo phác đồ sức khỏe. Có đường xem bài mẫu hoặc tự chọn không cần AI; không được mô tả đường đó như có đầy đủ điều chỉnh cá nhân. Thu tối thiểu phần thật sự sử dụng và rà chuyên môn trước các quyết định liên quan triệu chứng. Check-in/ngôn ngữ wellness vẫn có thể tiết lộ tình trạng sức khỏe, phải phân loại thận trọng.

### 3.1. Hội thoại, kế hoạch và bộ nhớ có nguồn

| Bảng | Trường chính | Ràng buộc và quyền | Đợt |
|---|---|---|---|
| daily_dialogues | id, user_id, checkin_id, state, consent_version, context_version, opened_at, closed_at?, expires_at | Một cuộc trao đổi thuộc một owner/check-in; mới context thì không tái dùng kết quả cũ | L |
| dialogue_turns | id, dialogue_id, user_id, sequence, role, protected_text?, structured_context?, ai_run_id?, created_at, retention_until | UNIQUE(dialogue_id, sequence); owner phải trùng; văn bản nhạy cảm ở store hạn chế, không analytics | L tối giản |
| context_facts | id, user_id, dialogue_id?, field_key, typed_value_encrypted, source_type, source_turn_id?, source_checkin_id?, confirmed_at?, scope, valid_until, superseded_by? | Phân biệt user khai/AI diễn giải/confirmed; dữ kiện thiết yếu mơ hồ phải xác nhận; schema field allowlist | L |
| preference_memories | id, user_id, key, value_encrypted, source_reflection_id?, source_fact_id?, status, confirmed_at?, scope, valid_until?, revoked_at?, revision | Chỉ nhớ trong scope được phép; không suy bệnh/đặc tính dài hạn; user đọc/sửa/xóa; source dùng FK cụ thể | L |
| daily_plans | id, user_id, checkin_id, local_date, state, current_revision_id?, created_at | Một ngày có thể nhiều plan; idempotency cho cùng ý định; current revision phải thuộc plan | L |
| plan_revisions | id, plan_id, user_id, revision, recommendation_id, context_snapshot_ref, source_mode, total_duration_seconds, reason_codes, explanation_ref?, validator_version, validation_status, valid_until, accepted_at?, supersedes_id? | UNIQUE(plan_id, revision); immutable sau accepted; total từ media/content, không tin số do model sinh | L |
| plan_items | id, plan_revision_id, position, session_version_id, block_version_id?, transition_template_id? | V1 đúng một buổi hoàn chỉnh; sau này ghép block phải có template được duyệt; FK published còn hiệu lực | L một item; N block |
| plan_evidence | id, plan_revision_id, checkin_id?, reflection_id?, memory_id?, content_version_id?, purpose, evidence_revision | CHECK một loại source phù hợp; tất cả dữ liệu riêng cùng owner và còn quyền; không link tùy ý từ model | L |
| plan_decisions | id, plan_revision_id, user_id, action(accept/reject/change/defer), reason_code?, occurred_at | Retry idempotent; reject không mặc nhiên là dislike lâu dài; ý kiến tự do bảo vệ riêng | L |
| plan_validation_results | id, plan_revision_id?, ai_run_id, validator_version, outcome, failed_rule_codes, checked_at | Không đưa raw context vào log chung; lưu cả output bị reject tối thiểu để đếm lỗi | L |
| feedback_applications | id, plan_revision_id, reflection_id, reflection_revision, application_type, reason_code | Dấu vết dùng/không dùng feedback; không bắt mọi feedback phải đổi bài | L tối giản |

V1 có thể gộp context_facts vào snapshot có schema để giảm số bảng, nhưng phải giữ nguồn/expiry/confirmed và khả năng xóa. Đây là mô hình logic, chưa quyết định thiết kế vật lý. Không xây mọi bảng trước khi có một lát cắt chạy được.

**Liên kết bắt buộc:** plan, check-in, dialogue, reflection và memory phải cùng owner; có thể dùng composite FK (id, user_id) và kiểm API/database. plan_evidence chỉ tham chiếu dữ liệu được phép, không mở được người khác bằng ID. ai_run giữ model/prompt/catalog/policy version; không được có DB credential toàn quyền.

**Thứ tự ưu tiên:** ràng buộc an toàn/phạm vi được duyệt → điều user vừa xác nhận hôm nay → sở thích còn hiệu lực → feedback phù hợp gần đây → mặc định. Không lấy energy thấp đồng nghĩa bệnh; không lấy absence of feedback đồng nghĩa không có khó chịu. “Không muốn nằm sàn hôm nay” chỉ áp dụng buổi này; “hãy nhớ tôi thường thích buổi đứng” cần hành động nhớ được người dùng hiểu.

**Vòng đời chỉnh sửa:** feedback thay đổi thì future plan dùng revision mới; plan đã tập giữ provenance lịch sử nhưng explanation/evidence hiển thị phải được redact khi source bị xóa/rút quyền. Kế hoạch chưa tập được đánh dấu stale nếu thay đổi có ảnh hưởng. Rút AI consent ngăn inference mới, invalidate cache và xử lý memory/derived data theo policy; không xóa đơn hàng kế toán cùng một lệnh.

**Không dùng tổng kết AI làm nguồn sự thật độc lập:** summary phải dẫn về source, có thời hạn/version và được tái tạo hoặc xóa khi source thay đổi. Không để một suy diễn model tự nuôi thành “sự thật” qua các buổi.

## 4. Nội dung và vận hành giảng dạy

| Bảng | Trường chính | Quan hệ/ràng buộc | Đợt |
|---|---|---|---|
| teachers | user_id, public_name, bio, credentials_verified_ref?, active, support_schedule | Thông tin công khai tách hồ sơ/giấy tờ nội bộ | L |
| media_assets | id, storage_key, type, duration_ms, processing_status, checksum, rights_ref, rights_expire_at? | Không lưu URL public vĩnh viễn cho video trả phí | L |
| sessions | id, stable_slug, owner_teacher_id | Định danh logic; không chỉnh đè lịch sử | L |
| session_versions | id, session_id, version_no, locale, title, objective, level, intensity, pace, instruction_density, duration_seconds, props, space_requirement, floor_contact, positions, learning_focus, repetition_policy, exclusions_policy_ref, media_id, caption_asset_id?, status, reviewed_by?, approved_at?, published_at? | UNIQUE(session_id, version_no, locale); published cần đủ metadata/duyệt/media; caption theo chuẩn release | L |
| session_segments | id, session_version_id, position, start_ms, end_ms, cue_ref, exercise_version_id? | Mốc thời gian hợp lệ/không vượt video | L cue/N chi tiết |
| exercise_versions | id, exercise_id, version_no, locale, name, instructions, props, reviewed_by, status | Chỉ tạo khi thư viện động tác có nhu cầu rõ | N |
| variant_links | parent_segment_id, variant_session_segment_id, transition_rule, approval_ref | Không thay tùy tiện động tác cùng vùng; cả hai phiên bản được kiểm | N |
| courses/course_versions | id, course_id, version, locale, title, audience, syllabus, outcomes, status, support_policy_ref | Outcomes về học tập, không bảo đảm điều trị | N; L nếu phục vụ quyền lớp cũ |
| course_lessons | id, course_version_id, position, session_version_id, required, unlock_rule, completion_rule | UNIQUE(course_version_id, position); không tự hoàn thành do ngày trôi qua | N; L nếu phục vụ quyền lớp cũ |
| enrollments | id, user_id, course_version_id, cohort_id?, state, enrolled_at, access_grant_id | Version học cố định; chuyển version có mapping rõ | N; L nếu phục vụ quyền lớp cũ |
| lesson_progress | enrollment_id, lesson_id, state, last_run_id?, completed_at?, source | UNIQUE(enrollment_id, lesson_id); source=observed/self_report/imported phân biệt | N; L nếu phục vụ quyền lớp cũ |
| teacher_assignments | id, enrollment_id, teacher_user_id, valid_from, valid_to?, status | Giới hạn một primary teacher active nếu chính sách chọn; đổi người có audit | N; L nếu phục vụ quyền lớp cũ |
| cohorts | id, course_version_id, name, start_at, end_at, capacity, primary_teacher_id, enrollment_state | Khóa tự học có thể không có cohort; giữ chỗ cần expiry và transaction chống bán quá số chỗ | L nếu cohort |
| feedback_tasks | id, enrollment_id, assignment_id, milestone, due_at, status, completed_at? | Không tạo vô hạn từ mỗi note; task theo quyền lợi đã bán | N; L nếu phục vụ quyền lớp cũ |
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
| product_benefits | id, product_id, benefit_type, course_version_id?, quantity?, duration_policy | Tách daily_planner, catalog_access, teacher quota và course_access; thời hạn/quota có schema; không cần mua course mới có planner | L |
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
| ai_runs | id, user_id, dialogue_id?, purpose, consent_ref, context_version, prompt_version, model_version, knowledge_version, input_refs, output_ref?, validation_result, input_tokens?, output_tokens?, cost_unit?, cost_amount?, latency_ms, state, retention_until | L; log tách nhạy cảm; cost có đơn vị rõ, không ép chi phí rất nhỏ thành 0 VND; retry có operation_id |
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
| Context facts/memory | Chỉ buổi hiện tại nếu không chọn nhớ; sở thích lâu dài có review/expiry theo policy | Xóa/rút source phải invalidate summary, candidate cache và plan chưa tập |
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
| checkin_submitted | Domain server | checkin_ref, context_version | Không energy, vùng cơ thể hoặc free text ra marketing |
| daily_dialogue_started/completed | Server | dialogue_ref, turn_count, latency_bucket, outcome | Không lấy số lượt chat làm thành công |
| daily_plan_generated/rejected_by_validator | Server | plan_ref?, source_mode, catalog_version, outcome_code | Phân biệt AI/rules/manual; không tính output reject là plan đã hiển thị |
| daily_plan_presented | Client có acknowledgement | plan_revision_ref, exposure_id | Generated không đồng nghĩa người đã thấy |
| daily_plan_accepted/changed/deferred | Domain server | plan_revision_ref, action, reason_category | Lưu lý do nhạy cảm riêng; phân tích theo người/decision episode |
| next_plan_feedback_applied | Domain server sau validation | plan_revision_ref, application_type | Chỉ trace đúng source; không tự coi là outcome tốt |
| practice_started/ended | Domain server | run_ref, reason_category, valid_play_seconds | Dữ liệu học tập nội bộ, không ad SDK |
| reflection_submitted | Domain event tối thiểu | run_ref, revision | Không gửi loại cảm nhận/note ra marketing |
| media_failed | Collector kỹ thuật | error_class, platform, content_version_ref | Không signed URL/token |
| teacher_feedback_sent | Server | task_ref, turnaround_bucket | Không body hoặc learner name |
| ai_answer_reported | Server | run_ref, category | Nội dung chỉ người có quyền xử lý |
| consent_changed/deletion_completed | Server audit | purpose, version, request_ref | Bằng chứng, retention riêng |

Envelope: event_id, name, schema_version, occurred_at, received_at, producer, request_id, actor_ref nếu cần, platform/app_version và consent-policy snapshot phù hợp. Có event registry gồm owner, schema, nơi lưu, mục đích, thời hạn. Ingest loại thuộc tính ngoài allowlist; deduplicate bằng event_id, đối soát event server với domain DB. Người dùng từ chối analytics không được bị tính là không tập: báo độ phủ và dữ liệu thiếu, dùng dữ liệu vận hành chỉ theo căn cứ được phép.

## 10. KPI kiểm chứng vòng lặp

Chỉ số định hướng: **người có ít nhất một vòng lặp được nối tiếp trong kỳ** — buổi A đã thực hành → phản hồi A hợp lệ → plan B có căn cứ sử dụng phản hồi đó → người học xác nhận plan B phù hợp hoặc cần chỉnh. Không bắt feedback tích cực và không ép bài B khác bài A để tăng chỉ số. Báo cả tử số/mẫu số, tỷ lệ bỏ feedback và người chưa đến lần quay lại; đây là proxy hành vi, không chứng minh hiệu quả sức khỏe.

| Chỉ số | Định nghĩa đề xuất | Mục đích |
|---|---|---|
| Time-to-plan | Từ bắt đầu check-in tới plan đầu được hiển thị; p50/p90 và số bỏ trước plan | Đo công sức lựa chọn, không giấu người bỏ giữa chừng |
| Plan acceptance | Decision episode có plan được chấp nhận / episode có plan hiển thị | Xem kèm đổi bài, no-match và phỏng vấn; accept không chứng minh tập phù hợp |
| Time-to-practice | Từ vào Hôm nay tới bắt đầu media hợp lệ | Phân tách login, AI latency và user cân nhắc |
| First-loop activation | Người mới có plan được chọn và bắt đầu buổi trong 72 giờ / người đủ 72 giờ quan sát | Feedback không bắt buộc; theo dõi tỷ lệ hoàn thành vòng đầy đủ riêng |
| Honest feedback coverage | Run có feedback được gửi / run đã kết thúc hoặc dừng có thể hỏi | Gồm như cũ/khó chịu hơn/chưa rõ/bỏ qua tách riêng; không tối ưu tỷ lệ tích cực |
| Feedback-to-next-plan | Người có source feedback hợp lệ và plan sau dùng/giải thích đúng / người có feedback và quay lại trong cửa sổ | Báo thêm số không quay lại để không làm đẹp mẫu số |
| Perceived fit | Người trả lời kế hoạch phù hợp / người trả lời câu hỏi fit; đồng thời tỷ lệ trả lời / toàn bộ người được hỏi | Kết hợp lý do, không đồng nhất “dễ chịu hơn” với fit |
| W2/W4 | Người activated có ≥1 buổi ngày 7–13 / 21–27; mẫu số đủ thời gian theo dõi | Phân nhóm người quen/mới, AI/baseline, có/không feedback |
| Paying continuation | Người mua kỳ tiếp theo thật / người hết kỳ đủ cửa sổ mua lại | Gói 30 ngày chưa auto-renew thì gọi tái mua |
| Đóng góp/kỳ/người | Tiền giữ lại − AI − media/hạ tầng biến đổi − hỗ trợ biến đổi | Xem cả median/high-use và chi phí cố định/nội dung |
| Công founder | Phút hỗ trợ + review AI + sửa nội dung trên người/tuần | Không tự coi AI không cần vận hành |
| No-match/fallback | Episode không có bài hợp lệ / episode có đủ input; chia theo nguyên nhân không nhạy cảm | Phân biệt thiếu nội dung, vendor lỗi, policy và thiếu quyền |
| AI quality | ID hợp lệ, grounding, context đúng, memory đúng, feedback lineage đúng, critical failures, cost/latency | So với quy tắc/bộ lọc cùng nội dung; không xem chat nhiều là giá trị |
| Guardrails | Cấp sai quyền, thu trùng, rò dữ liệu, safety failure, lỗi phát, false-memory | Bất kỳ nghiêm trọng đều chặn mở rộng |

Playback hoàn tất có thể dùng ≥80% khoảng phát không trùng và xác nhận người dùng theo policy thử. Không tự nhận họ đã thực hiện đúng hoặc đạt sức khỏe tốt hơn; dừng do safety được tách khỏi “bỏ cuộc vì sản phẩm kém”. Launch có thể dùng checkpoint đơn giản nếu chưa ghép block; nhãn phải đúng nghĩa “đã xem/xác nhận”.

Dashboard tuần một trang: đến từ đâu → thử check-in → có plan → bắt đầu → feedback → quay lại và được điều chỉnh; nhóm trả tiền/tái mua; no-match/AI report/media error; tiền/quyền chưa khớp; chi phí/giờ founder. Marketing chỉ thấy funnel tổng hợp được phép, không lý do sức khỏe hay raw chat.

Với pilot 10–15 người, báo “6/10 người quay lại; 4/6 thấy phản hồi được dùng đúng” cùng lý do, không chỉ tỷ lệ đẹp. Thử so sánh AI với baseline cùng catalog bằng quan sát hai lần sử dụng, đảo thứ tự nếu phù hợp để giảm hiệu ứng mới lạ; không kết luận thống kê từ mẫu nhỏ. Thử nghiệm lớn chỉ sau khi chốt metric/sample size/cửa sổ. Không thử nghiệm giảm bảo vệ an toàn hoặc quyền hủy/xóa.
