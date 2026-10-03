-- Cover FK columns on the private control plane. These indexes keep owner
-- lookups and auth-user deletes bounded as the operational tables grow.

create index if not exists content_schema_registry_created_by_idx
  on private.content_schema_registry(created_by);
create index if not exists content_validation_runs_schema_idx
  on private.content_validation_runs(schema_key, schema_version);
create index if not exists data_request_events_actor_idx
  on private.data_request_events(actor_id);
create index if not exists data_requests_created_by_idx
  on private.data_requests(created_by);
create index if not exists feature_flag_events_actor_idx
  on private.feature_flag_events(actor_id);
create index if not exists feature_flags_updated_by_idx
  on private.feature_flags(updated_by);
create index if not exists push_endpoints_device_idx
  on private.push_endpoints(device_id);
create index if not exists role_assignments_assigned_by_idx
  on private.role_assignments(assigned_by);
create index if not exists share_grants_consent_event_idx
  on private.share_grants(consent_event_id);
create index if not exists support_messages_author_idx
  on private.support_messages(author_id);
create index if not exists teacher_assignments_assigned_by_idx
  on private.teacher_assignments(assigned_by);
create index if not exists workspace_invites_accepted_by_idx
  on private.workspace_invites(accepted_by);
create index if not exists workspace_invites_invited_by_idx
  on private.workspace_invites(invited_by);
