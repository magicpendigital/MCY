-- Read-only diagnostic of one incident window; no identities, headers, body, notes or URLs exported.
-- A zero matching-route count is insufficient telemetry and must not be interpreted as zero writes.
select count() as edge_entries,
countIf(length(log_attributes['request.path'])>0) as path_fields_present,
countIf(length(log_attributes['request.method'])>0) as method_fields_present,
countIf(position(log_attributes['request.path'],'save_my_checkin_for_current_user_with_current_consent')>0) as current_writer_path_mentions,
countIf(position(log_attributes['request.path'],'save_my_checkin_for_current_user_with_current_consent')>0 and log_attributes['request.method']='POST') as current_writer_post_entries,
countIf(position(log_attributes['request.path'],'save_my_checkin_for_current_user_with_current_consent')>0 and log_attributes['request.method']='POST' and log_attributes['request.headers.x_client_info']='mcy-learner/android') as declared_native_writer_posts,
countIf(position(log_attributes['request.path'],'save_my_checkin_for_current_user_with_current_consent')>0 and log_attributes['request.method']='POST' and position(log_attributes['request.headers.user_agent'],'Android')>0) as android_agent_writer_posts,
countIf(position(log_attributes['request.path'],'save_my_checkin_for_current_user_with_current_consent')>0 and log_attributes['request.method']='POST' and startsWith(log_attributes['request.headers.referer'],'https://localhost/')) as native_origin_referer_writer_posts
from logs where source='edge_logs'
