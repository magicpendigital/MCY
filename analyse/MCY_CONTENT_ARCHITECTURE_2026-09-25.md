# Một chút yoga — kiến trúc nội dung và quy trình phát hành v0.1

**Ngày:** 25/09/2026 · **Trạng thái:** đề xuất để thiết kế và thử nghiệm, chưa phải hệ thống đã triển khai.  
**Liên kết:** [blueprint sản phẩm v0.3](MCY_BLUEPRINT_2026-09-25.md), [từ điển dữ liệu v0.2](business-plan/03_DU_LIEU_PHAN_QUYEN_TRACKING.md), [hành trình/AI v0.2](business-plan/02_SAN_PHAM_HANH_TRINH_AI.md), `AGENTS.md`.

## 1. Quyết định kiến trúc

MCY cần **một quy trình quản trị nội dung**, nhưng **hai mô hình dữ liệu nội dung khác nhau**:

1. **Nội dung thực hành của giáo viên** là dữ liệu sản phẩm có điều kiện sử dụng và rủi ro an toàn. Mỗi lần phát hành là một phiên bản bất biến. Bộ chọn bài và AI chỉ được dùng các trường/phương án đã được duyệt của phiên bản ấy.
2. **Nội dung biên tập** gồm hướng dẫn dùng app, kiến thức, bài marketing, trang chuyên mục và trang đích. Nó cần tác giả, nguồn, cấu trúc khối hiển thị, phân loại, ngôn ngữ, tuyến URL, metadata SEO, lịch rà soát và kênh phân phối. SEO là mục tiêu xuất bản/trang web, không phải một nguồn chỉ dẫn tập luyện tự động.

Cả hai miền dùng chung danh bạ tác giả, kho media, bằng chứng quyền sử dụng, lịch sử duyệt và audit; không dùng một bảng `content` với JSON tự do cho mọi loại bài. **UI microcopy** cần kiểm cùng bản build; **chính sách/quyền đồng ý** có phiên bản pháp lý riêng và lưu mã phiên bản đã chấp thuận. Không dùng bài blog thay bản chính sách.

| Loại | Nơi sử dụng chính | Dữ liệu cần có | Ai được phát hành | Có thể làm nguồn chọn buổi tập? |
| --- | --- | --- | --- | --- |
| Buổi tập / bài giảng | Kế hoạch hôm nay, player, khóa học | Metadata thực hành, segment, media, phụ đề, điều kiện, quyền | Admin sau review chuyên môn | Có, **chỉ** phiên bản được duyệt và hợp lệ |
| Khóa học | Khu Khám phá, quyền mua/đăng ký về sau | Giáo trình có thứ tự trỏ tới phiên bản buổi tập | Admin sau duyệt | Không tự nó quyết định mức phù hợp |
| Hướng dẫn app / FAQ | Trợ giúp theo đúng màn và phiên bản app | Câu hỏi, bước thao tác, ảnh, screen key, app version | Editor/admin; review sản phẩm | Không |
| Bài kiến thức | Khu Khám phá và website | Tác giả, nguồn, reviewer, ngày cần rà, chủ đề | Editor + reviewer nếu có nội dung sức khỏe/vận động | Chỉ có thể là nguồn giải thích khi được gắn nhãn/duyệt riêng; không tạo quy tắc chọn bài |
| Bài marketing / trang SEO | Website, chiến dịch | Ý định người đọc, URL, SEO, CTA, campaign, nguồn và claim | Marketing/editor + review claim | Không |
| Trang chuyên mục | Website/app browse | Topic, phần giới thiệu, thứ tự bài được chọn, URL | Editor | Không |
| UI copy / điều khoản | Giao diện / đồng ý pháp lý | Khóa dịch, build hoặc policy version | Product/legal theo phạm vi | Không |

### Điểm neo vào sản phẩm

Trang **Hôm nay** vẫn bắt đầu bằng check-in → hội thoại ngắn → một kế hoạch cụ thể. Bài của giáo viên là nguồn thực hành được chọn từ catalog. Bài kiến thức và khóa học hỗ trợ giải thích, học tiếp và khám phá; không biến màn đầu thành một kho video hoặc dòng bài SEO.

## 2. Bài giảng của giáo viên: từ bản thảo tới buổi tập đủ điều kiện

### 2.1. Đơn vị nội dung và cấu trúc

- `sessions(id, owner_teacher_id, stable_slug, created_at)` là danh tính ổn định của **một buổi tập hoàn chỉnh**. Một video tải lên chưa mặc nhiên là buổi tập.
- `session_versions(id, session_id, version_no, locale, source_version_id?, title, objective, level, intensity, pace, instruction_density, duration_seconds, props, space_requirement, floor_contact, positions, learning_focus, exclusions_policy_ref, media_id, status, reviewed_by?, approved_at?, published_at?)` là bản phát hành. Sau khi publish, không sửa đè cả title, cue, media, phụ đề hay điều kiện chọn bài. Tạo bản mới và chuyển con trỏ live sau khi duyệt.
- `session_publications(session_id, locale, version_id, published_at)` là **một** con trỏ phiên bản ưu tiên cho mỗi `(session_id, locale)`. FK kép phải bảo đảm version thuộc đúng session/locale. Bộ chọn bài mới chỉ xét bản con trỏ chỉ tới, không quét mọi bản từng có status `published`.
- `session_version_availability(session_version_id PK/FK, can_start, can_resume, reason_code?, changed_by, changed_at)` điều khiển khả năng dùng của **từng version** sau phát hành, có audit. Vì vậy khóa học/kế hoạch cũ có thể tiếp tục mở version hợp lệ trước đó; thu hồi an toàn đặt `can_start=false` cho mọi version liên quan mà không xóa lịch sử tập. Quyết định cho buổi đang chạy được ghi riêng qua `can_resume`.
- `session_segments(id, session_version_id, position, start_ms, end_ms, movement_name, cue_text, stop_cue?, breath_cue?, variant_ref?)` đặt lời chỉ dẫn đúng mốc media. Kiểm `0 ≤ start_ms < end_ms ≤ duration_ms`, thứ tự và khoảng hở có chủ đích.
- `session_suitability_rules(id, session_version_id, context_code, outcome, reason_code, policy_version, reviewer_id)` dùng các kết quả `eligible | exclude | needs_human_review`. Đây là **quy tắc đã duyệt**, khác nhãn biên tập/SEO. Mô tả vùng cơ thể không đồng nghĩa bài trị liệu vùng đó.
- `session_alternatives(id, source_version_id, alternative_version_id, relation_type, approved_by)` chỉ cho nhãn “nhẹ hơn”, “ngắn hơn”, “ít nằm sàn hơn” khi mối quan hệ đã được rà. Lựa chọn thay thế cũng phải tự qua bộ lọc quyền và phù hợp.
- `session_assets(session_version_id, asset_id, role, position)` nối thumbnail, audio, PDF, hình minh họa, caption/transcript với đúng phiên bản. `media_renditions` chứa các định dạng/độ phân giải đã xử lý; `caption_tracks` chứa locale, định dạng, trạng thái rà và đồng bộ.
- `media_renditions(id, asset_id, storage_key, codec, container, width?, height?, bitrate?, duration_ms, processing_status)` và `caption_tracks(id, session_version_id, locale, asset_id, format, review_status, reviewer_id?)` giữ đường dẫn media đã xử lý, chất lượng và bản phụ đề được duyệt; mọi rendition/track vẫn kế thừa quyền của asset nguồn.
- `course_versions` và `course_lessons` chỉ sắp xếp thứ tự, tham chiếu **đúng `session_version_id`**. Không nhân bản video vào từng khóa. Quyền của học viên đối với khóa/phiên bản đã đăng ký cần giữ được khi catalog đổi.
- `plan_items` và `practice_runs` trỏ bản bài được dùng thực tế để có thể giải thích một đề xuất và lịch sử tập. Thu hồi không xóa lịch sử đã xảy ra.

**Brief bắt buộc trước khi quay:** mục đích buổi; nhóm người học và bối cảnh; điều kiện loại trừ/không đủ thông tin; mức, nhịp, cường độ, mật độ giải thích; dụng cụ/không gian/tư thế; cấu trúc đoạn và thời lượng ước tính; lời dừng hoặc chuyển sang bài nhẹ hơn; hình ảnh/âm nhạc/giọng và quyền sử dụng; ngôn ngữ/phụ đề. Thời lượng công bố phải được đối chiếu với media cuối, không chỉ lấy từ kịch bản.

### 2.2. Luồng sản xuất và trách nhiệm

`brief → giáo viên soạn nháp → kiểm phạm vi/quyền → quay và tải bản gốc vào vùng riêng → quét/kiểm định file → xử lý video, thumbnail, transcript và caption nháp → editor rà bản người học sẽ xem → reviewer chuyên môn rà hướng dẫn, giới hạn, phương án thay thế → admin phát hành → theo dõi lỗi/câu hỏi → sửa bằng version mới hoặc thu hồi`.

Giáo viên chỉ soạn, xem trước và gửi duyệt nội dung của mình. Người tạo không tự duyệt các trường quyết định phù hợp/an toàn. Reviewer cần xem **bản media cuối** cùng phụ đề và thời lượng, không chỉ đọc brief. Phụ đề nhận dạng tự động chỉ là nháp; cần người rà cue, thuật ngữ và mốc thời gian. Dịch EN cần `source_version_id`, người dịch/rà và trạng thái riêng. Thay đổi biên tập ở bản VI đưa bản EN vào hàng đợi rà; thay đổi vì an toàn/thu hồi phải tạm chặn cả bản dịch, rendition và phương án thay thế phụ thuộc cho đến khi được duyệt lại.

Các trạng thái soạn/duyệt đề xuất: `draft → submitted → changes_requested → approved → scheduled → published`. Sau đó `session_version_availability` có thể chặn bắt đầu/tiếp tục theo lý do và audit, còn payload version đã publish không sửa. Mở rộng `content_reviews` hiện có thành `session_review_events(session_version_id FK)` và `editorial_review_events(editorial_version_id FK)`; sự kiện phát hành cũng tách theo miền tương ứng để có FK thực, append-only, người thực hiện, quyết định, lý do, thời điểm và checklist. Một version chỉ publish khi mọi cổng bắt buộc qua; `approved` chưa đồng nghĩa với `published`.

### 2.3. Media và quyền sử dụng

Lưu file gốc, video đã encode, hình, nhạc, PDF và caption trong **object storage**; PostgreSQL giữ `storage_key`, checksum, MIME, kích thước, thời lượng, tỷ lệ hình, trạng thái xử lý và FK. Không lưu video nhị phân trong bảng PostgreSQL. Xử lý upload và transcode ở server/job, không trên điện thoại; player dùng media đã tối ưu/adaptive streaming nếu thử tải cho thấy cần.

Thêm `asset_components(id, asset_id, component_type, source_asset_id?, contributor_id?)` để kê khai từng phần hình người, nhạc, giọng, ảnh, đồ họa hoặc tài liệu trong media; `asset_rights(id, component_id FK, rightsholder, agreement_ref, allowed_channels, territories, commercial_use, derivatives_allowed, transcription_allowed, translation_allowed, ai_use_allowed, attribution_text?, model_release_ref?, valid_from, expires_at?, revocation_state)` lưu một hoặc nhiều chứng cứ quyền cho từng phần. Cổng publish phải kiểm **tất cả** thành phần và phạm vi sử dụng của bản phát hành; bản dịch/bản encode kế thừa giới hạn quyền nguồn. Có cảnh báo trước hết hạn, chặn phát hành khi thiếu quyền và phương án xử lý nếu bài đã bán bị mất quyền.

Media dành cho người có quyền xem đặt trong bucket private; API kiểm tài khoản, entitlement, trạng thái/version/quyền rồi mới cấp đường xem ngắn hạn. **Không coi URL ký là cơ chế thu hồi tức thì:** theo tài liệu Supabase, URL đã ký vẫn dùng được đến hết hạn, độc lập với việc đổi khóa Auth; CDN có thể còn cache sau hạn token đến hết TTL. Thu hồi phải chặn cấp URL mới ngay, đặt TTL/cache phù hợp, và kiểm tra phương án xóa/đổi object hoặc proxy/DRM cho nội dung cần cắt truy cập khẩn cấp. [Supabase private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), [signed URLs](https://supabase.com/docs/guides/storage/serving/downloads), [Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn).

Hình minh họa của bài web công khai có thể ở bucket public/CDN sau khi đã kiểm quyền kênh web; file gốc, bản nháp và tài sản trả phí không đi vào bucket này. Supabase phân biệt rõ mô hình truy cập public và private của bucket. [Supabase buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).

### 2.4. Hợp đồng với bộ chọn bài và AI

Server lọc trước theo `con trỏ hiện hành + can_start + còn quyền + locale + entitlement + suitability + thời lượng + dụng cụ + bối cảnh`. AI chỉ xếp hạng/diễn đạt trong tập ứng viên đã qua lọc, dựa trên **summary, cue, metadata và quy tắc đã duyệt của đúng version**. Kiểm lại ID và quyền khi tạo kế hoạch **và khi bắt đầu buổi**; một plan cũ có thể phát version cũ nếu `can_start=true` và còn quyền. Lưu `catalog_version`, `policy_version`, `session_version_id` và lý do gợi ý trong plan. Nếu không có bài hợp lệ, trả `no_match` rõ ràng và gợi ý bước an toàn khác; không tự ghép động tác hoặc gán một tag marketing như “giảm đau vai” thành chỉ định.

`needs_human_review` chặn bài khỏi tập ứng viên AI và chặn bắt đầu buổi đó. Trạng thái cơ thể chưa chọn, không chắc, bỏ qua và “không khó chịu hiện tại” là các dữ kiện khác nhau; không suy thiếu dữ liệu thành `eligible`. Nếu cần đánh giá của giáo viên, phải có assignment và quyền chia sẻ cụ thể do người học cấp; hệ thống không tự gửi check-in hoặc hội thoại cho giáo viên.

## 3. Hướng dẫn, kiến thức và marketing: mô hình biên tập chung

### 3.1. Kiểu bài và nơi xuất bản

- **Help:** bài giải quyết một việc cụ thể như “cách sửa check-in” hoặc “cách tắt gợi ý AI”, gồm `screen_key`, ngữ cảnh, khoảng phiên bản app, các bước, ảnh minh họa, câu hỏi liên quan. Hiện trực tiếp ở điểm mắc của người dùng và có thể tìm trong Trợ giúp. Khi luồng UI thay đổi, bài liên quan vào hàng đợi rà soát.
- **Knowledge:** bài kiến thức về thói quen tập, kỹ thuật cơ bản, chuẩn bị/dừng tập. Ghi tác giả, trình độ/vai trò, nguồn, ngày rà chuyên môn, phạm vi tuyên bố. Nội dung mang tính sức khỏe/vận động cần review độc lập phù hợp; tránh lời hứa chữa trị. Có thể liên kết tới một `session_version_id` đã duyệt, không suy ngược quan hệ chọn bài từ liên kết đó.
- **Marketing article / SEO:** bài phục vụ một nhu cầu tìm hiểu thật, có CTA đi vào hành trình phù hợp, tác giả và nguồn khi có claim. SEO title, description, canonical, social image, sitemap và dữ liệu cấu trúc là metadata của **trang xuất bản**. Một bài kiến thức tốt cũng có thể là trang SEO; không nhân bản nội dung chỉ để thêm từ khóa. Google khuyến nghị nội dung hữu ích, có nguồn và rõ người viết, đặc biệt khi nội dung có thể ảnh hưởng sức khỏe. [Google Search Central — helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
- **Topic/chuyên mục:** `topics` là phân loại ổn định, có tên/bản dịch và quan hệ cha con. `category_page` là trang biên tập có đoạn giới thiệu và danh sách bài/buổi được chọn, có thứ tự. Một tag tự động không đủ tạo trang chuyên mục có giá trị.
- **Campaign/landing:** có mục tiêu, kênh, thời hạn, CTA và variant; không đưa copy khuyến mại vào bản bài giảng. Chính sách giá/quyền mua dùng miền commerce, không lấy từ đoạn văn marketing.

### 3.2. Bảng đề xuất và các trường quan trọng

Giữ các trường truy vấn/quan hệ ở cột chuẩn và FK; chỉ `body_blocks` là JSONB theo schema cố định để biên tập bố cục. Cho phép các block đã định nghĩa như `paragraph`, `heading`, `image`, `callout`, `steps`, `faq`, `quote`, `related_content`, `cta`; validate độ sâu, trường, URL, alt text, quyền asset và escape khi render. Không nhận HTML/script tùy ý.

| Bảng | Trường chính và ràng buộc |
| --- | --- |
| `editorial_items` | `id`, `kind` (`help, knowledge, marketing_article, category_page, landing`), `stable_key UNIQUE`, `owner_team`, `created_at`; ID không đổi khi đổi tên/URL. |
| `editorial_versions` | `id`, `item_id FK`, `locale`, `version_no`, `source_version_id?`, `title`, `summary`, `body_schema_version`, `body_blocks JSONB`, `hero_asset_id?`, `author_id`, `editor_id?`, `expert_reviewer_id?`, `status`, `review_due_at?`, `approved_at?`, `published_at?`, `content_hash`, `created_at`; `UNIQUE(item_id, locale, version_no)`. Version published bất biến. |
| `editorial_publications` | `item_id`, `locale`, `version_id FK`, `published_at`, `unpublished_at?`; một con trỏ live cho mỗi `(item_id, locale)`. Khi đổi bản, cập nhật con trỏ trong transaction và phát sự kiện xóa cache. |
| `editorial_routes` | `id`, `locale`, `slug`, `item_id FK`, `route_status`, `redirect_to_route_id FK?`; `UNIQUE(locale, slug)`. Giữ slug cũ làm redirect khi đổi URL; không lưu canonical URL trùng ở đây. |
| `editorial_seo` | `version_id FK`, `meta_title`, `meta_description`, `canonical_url?`, `robots_policy`, `social_image_asset_id?`, `schema_type?`; là nguồn canonical URL của bản web live, mặc định tự trỏ URL hiện hành. |
| `topics`, `topic_localizations`, `editorial_version_topics` | `topics(id, parent_id?, stable_key)`, tên theo locale, `editorial_version_topics(editorial_version_id FK, topic_id FK, position)`; taxonomy của bài nằm trong version đã duyệt. |
| `editorial_sources` | `version_id FK`, `source_url`, `source_title`, `publisher?`, `accessed_at`, `claim_ref?`; nguồn cho từng bản, hỗ trợ rà khi thông tin thay đổi. |
| `help_placements` | `editorial_version_id FK`, `screen_key`, `context_key?`, `min_app_version?`, `max_app_version?`, `status`, `priority`; gắn phạm vi trợ giúp với đúng bản đã duyệt. Các khoảng phiên bản app active cho cùng item/screen/context không được chồng nhau; có thể phục vụ bản help cũ cho app cũ. |
| `editorial_session_links` | `editorial_version_id FK`, `session_version_id FK`, `relation` (`explains, related, recommended_next`), `position`; liên kết biên tập, **không** phải suitability rule. |
| `campaigns`, `content_placements` | `campaigns(id, name, owner_id, start_at?, end_at?, status)`; `content_placements(editorial_version_id FK, channel, campaign_id FK?, start_at?, end_at?, cta_ref?, priority?)`. Locale lấy từ version, placement được audit riêng, chỉ chạy khi version vẫn live và quyền kênh còn hiệu lực. |
| `editorial_ai_grants` | `editorial_version_id FK`, `scope` (`app_help_only, explain_only`), `approved_by`, `valid_until?`, `status`; mặc định không có grant. Chỉ mục truy hồi xây từ grant còn hiệu lực của đúng version đang được phục vụ: con trỏ editorial hoặc help placement phù hợp app version. |
| `session_review_events`, `editorial_review_events` | `session_version_id FK` hoặc `editorial_version_id FK`, `actor_id`, `decision`, `reason`, `at`, `checklist_version`; audit append-only, hạn chế quyền đọc. Publication events tách cùng cách theo mỗi miền. |

`editorial_versions` có thể được lưu với mỗi bản dịch là một version riêng; `source_version_id` giúp phát hiện bản dịch cũ. Cần kiểm uniqueness và FK kép để `editorial_publications.version_id` luôn cùng `item_id, locale` với con trỏ; kiểm trong transaction/constraint thay vì tin frontend. `editorial_routes` là đường web; bài thông thường trong app mở bằng stable ID/deep link và lấy bản locale hiện hành. Help theo màn dùng `help_placements` để lấy đúng bản đã duyệt cho phiên bản app cụ thể, có thể là bản cũ vẫn active với app cũ.

**Ví dụ một bài hướng dẫn:** `stable_key=help.change_checkin`, `kind=help`, `locale=vi-VN`, `screen_key=checkin`, `min_app_version=1.0`, `body_blocks=[heading, steps, image]`, `review_due_at` sau đợt thay đổi UX. **Ví dụ một bài kiến thức:** `stable_key=knowledge.breath_pause`, có tác giả, nguồn, reviewer, `topic=breathing`; liên kết tới buổi tập là FK được duyệt, không phải một lời hứa kết quả.

### 3.3. Kênh phân phối và SEO

- **Trong app:** API trả list card gọn (`id`, title, summary, thumbnail nhỏ, reading time, topic) rồi tải body khi mở. Help có endpoint theo screen/context/**app version** và trả bản nằm trong khoảng active đã duyệt. Không gửi toàn kho bài hoặc video gốc tới thiết bị. Bản lưu offline, nếu có, phải có TTL/version và cơ chế thu hồi; chưa hứa offline ở pilot.
- **Website:** trang công khai có URL ổn định và HTML đã render từ server hoặc tạo sẵn; xuất title/description/canonical trong HTML, sitemap chỉ gồm trang live indexable, redirect khi đổi slug. Google mô tả render sẵn/server giúp crawler thấy nội dung trực tiếp trong HTML. [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article).
- **Đa ngôn ngữ:** chỉ tạo URL EN/hreflang khi đã có nội dung EN được dịch và rà thật. Không tự dùng bản VI trong route EN. Brand English vẫn là giả thuyết cần thử ở thị trường đã chọn.
- **Kênh marketing:** một article ID có thể có card app, trang web, email/social excerpt. `content_placements(editorial_version_id, channel, campaign_id?, start_at, end_at, cta_ref?)` lưu chỗ đặt và CTA của đúng bản; không tạo bản copy riêng rẽ thiếu nguồn gốc. Bài social với thông điệp khác đáng kể cần version/campaign asset riêng.
- **Chỉ mục AI:** mặc định không có `editorial_ai_grants`. Bài trợ giúp đã duyệt có thể cấp phạm vi `app_help_only` theo app version; bài kiến thức có nguồn, reviewer và còn hạn có thể cấp `explain_only`. Chỉ index đúng `editorial_version_id` còn được phục vụ và bỏ khỏi tập truy hồi khi thu hồi. Không index quảng cáo/SEO, nháp, ý kiến người dùng hoặc text bên ngoài làm quy tắc chọn bài. Nội dung truy hồi là dữ liệu không tin cậy; server tiếp tục áp bộ lọc và policy riêng.

### 3.4. Chu kỳ biên tập

`brief (người đọc, câu hỏi, nơi hiển thị, nguồn, CTA) → draft → rà biên tập → rà chuyên môn nếu có claim vận động/sức khỏe → kiểm media/alt/caption/bản dịch/quyền → preview đúng app/web → approve → publish bản bất biến → xóa cache/cập nhật sitemap/chỉ mục AI theo phạm vi → theo dõi → rà lại, sửa bản mới hoặc unpublish/redirect`.

`review_due_at` là hàng đợi thực, ưu tiên bài có claim dễ lỗi thời và help gắn màn đã đổi. Thay tiêu đề SEO cũng tạo bản mới để lịch sử phát hành rõ ràng. Không đổi ngày hiển thị trên trang chỉ để trông mới nếu nội dung không thay đổi đáng kể; Google khuyến nghị tránh cách này. [Google helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## 4. Quyền, hiệu năng và CMS

**Phân quyền:** người học đọc bản public/live và nội dung thực hành mình có quyền; giáo viên sửa nháp bài của mình; editor sửa bài được giao; reviewer ghi quyết định cho bản được giao; admin publish/thu hồi với lý do. Draft/preview dùng quyền riêng và link ngắn hạn, không index; public website không có khóa admin. Không cấp CMS quyền vào check-in, cảm nhận cơ thể, chat hay hành trình người học. Audit xuất bản và thay quyền phải giữ nguyên bản, không cho tác giả tự xóa dấu vết.

Nếu dùng Supabase, triển khai **GRANT tối thiểu + RLS** trên bảng được phơi bày qua Data API; `TO authenticated` một mình chưa giới hạn owner. Các schema riêng tư không cấp client trực tiếp; API server xử lý publish/entitlement và giữ secret ở server. Changelog hiện cho biết bảng mới có thể **không tự lộ qua Data API**, nên migration phải khai báo quyền/exposure có chủ đích. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Data API change](https://supabase.com/changelog?types=breaking-change). Bảng `storage` do Supabase quản lý chỉ đọc metadata bằng SQL; thao tác file qua Storage API, không sửa/xóa thẳng `storage.objects`. [Supabase Storage schema](https://supabase.com/docs/guides/storage/schema/design).

**Hiệu năng:** index `editorial_publications(locale, published_at DESC)` cho feed, `editorial_routes(locale, slug)` cho route, `help_placements(screen_key, context_key)` cho help rồi lọc khoảng phiên bản app; index FK/topic link và `session_versions(status, locale, duration_seconds)` cộng các cột lọc thực tế cho catalog. Chỉ index các JSON path có query đo được. Trang web cache theo published version và xóa cache khi đổi con trỏ; app nhận metadata nhỏ, media qua CDN/rendition. Tách truy vấn listing khỏi body dài và media; phân trang, tránh N+1. Kiểm p95 bằng thiết bị/mạng và tập nội dung pilot trước khi khóa ngân sách hiệu năng.

**CMS cho pilot:** ứng viên là PostgreSQL/Supabase trong blueprint + một giao diện biên tập tối thiểu cho giáo viên/editor/admin: brief, form metadata có validation, upload, preview, checklist review, lịch phiên bản, publish/thu hồi. Quy trình và ràng buộc nằm ở backend, không phụ thuộc nút của CMS. Đây là đề xuất giảm số nguồn dữ liệu khi nhóm nhỏ, **chưa phải lựa chọn đã triển khai**.

Nếu lượng bài/người biên tập tăng, thử **Directus** như giao diện trên miền bảng SQL nội dung hoặc **Sanity** cho editorial đa kênh. Cổng quyết định gồm: vai trò/duyệt nhiều bước, bản dịch, preview, portability, chi phí, và chứng minh CMS chỉ có credential/content schema; nếu là kho riêng, đồng bộ **snapshot đã publish** với ID/version vào delivery API, một nguồn gốc rõ cho mỗi bài. Không nối một CMS tổng quát trực tiếp vào toàn database chứa dữ liệu học viên. [Directus product/docs](https://directus.com/start), [Directus versioning](https://directus.com/features/content-versioning), [Sanity schemas](https://www.sanity.io/docs/studio/schemas-and-forms).

## 5. Thứ tự làm và cổng nghiệm thu

| Cổng | Công việc | Chỉ chấp nhận khi |
| --- | --- | --- |
| G0 — kiểm kê | Liệt kê bài/asset hiện có, chủ quyền, giấy phép, ngôn ngữ; chọn 3–5 hoàn cảnh ưu tiên từ nghiên cứu; lập ma trận hoàn cảnh × bài hợp lệ | Biết bài nào có thể quay/phát và gap nào tạo `no_match`; số bài mục tiêu dựa trên coverage, không dựa vào số lượng thư viện |
| G1 — chuẩn nội dung | Chốt brief buổi tập, block schema editorial, taxonomy, checklist chuyên môn/biên tập và quy ước claim; wireframe admin/preview | Giáo viên/editor hoàn thành một bài mẫu mà không cần nhập JSON thô; reviewer nhận đủ media/metadata để quyết định |
| G2 — thử hạ tầng | Migration/schema, GRANT/RLS, storage bucket, media processing, version pointer, route/redirect, API catalog/help; thử Directus/Sanity nếu có nhu cầu thực | Test allow/deny learner/teacher/editor/admin, quyền media, rollback publish, phiên bản lịch sử và cắt cấp URL; không có đường đọc draft/cá nhân trái quyền |
| G3 — nội dung beta | Sản xuất tập bài đủ phủ hoàn cảnh đầu, help cho tác vụ chính, vài bài kiến thức có nguồn; web public chỉ cho bài đã qua review | Mỗi buổi có caption, duration đúng, điều kiện, reviewer và quyền; mọi help gắn đúng màn; bài công khai có tác giả/route/canonical và kiểm claim |
| G4 — vận hành | Theo dõi no-match, lỗi phát media, bỏ dở, câu hỏi help, nội dung hết hạn, tìm kiếm và chuyển từ bài web vào check-in/practice | Có chủ sở hữu xử lý sự cố, version/withdrawal vận hành được; mở rộng catalog theo gap được đo, không chạy SEO hàng loạt trước khi vòng tập ổn |

**Các số mục tiêu ban đầu** như 8–12 buổi hoàn chỉnh và 10 bài help chỉ là giả định để lập công việc; thay bằng coverage của các hoàn cảnh ưu tiên và kết quả thử với người học. Bộ prototype hiện dùng nội dung minh họa trong bộ nhớ và player minh họa; chưa phải nội dung có quyền, review và phát hành.

## 6. Việc cần quyết định trước khi viết CMS thật

1. Ai là chủ sở hữu/quyền quay, nhạc, giọng, hình người và phạm vi thương mại của từng bài? Có thể dịch/cho AI trích dùng phần nào?
2. Ai là reviewer độc lập cho cue/giới hạn, và ai được quyền publish/thu hồi khi founder vắng mặt?
3. Nhóm hoàn cảnh đầu và số lượng buổi **đủ phủ** là gì sau nghiên cứu G0? Với trường hợp không có bài, câu trả lời sản phẩm là gì?
4. Website marketing cần xuất bản với tần suất/nhóm người viết nào? Câu trả lời quyết định có nên đưa CMS chuyên dụng vào sớm.
5. Chính sách khi một video đã bán bị thu hồi, và mức cắt truy cập khẩn cấp cần đạt, là gì? Quyết định này ảnh hưởng media delivery hơn là bảng bài viết.
