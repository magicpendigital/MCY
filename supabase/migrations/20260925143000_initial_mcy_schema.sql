-- Một chút yoga — staging schema v1
-- Applied through the Supabase migration API. Keep this file as the reproducible source.

create extension if not exists pgcrypto;

create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'vi-VN',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  body_display_preference text not null default 'neutral'
    check (body_display_preference in ('neutral', 'feminine', 'masculine')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  policy_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (revoked_at is null or revoked_at >= granted_at)
);

create table public.teachers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_name text not null,
  bio text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  local_timezone text not null,
  energy_level smallint check (energy_level between 0 and 5),
  overall_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.checkin_observations (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  region_code text not null check (region_code in ('neck', 'shoulder_left', 'shoulder_right', 'upper_back', 'lower_back')),
  state text not null check (state in ('discomfort', 'no_discomfort', 'uncertain', 'skipped')),
  level smallint check (level between 0 and 4),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (checkin_id, region_code),
  foreign key (checkin_id, user_id) references public.checkins(id, user_id) on delete cascade
);

create table public.daily_dialogues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_id uuid,
  context_version text not null,
  state text not null default 'open' check (state in ('open', 'completed', 'expired', 'abandoned')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (checkin_id, user_id) references public.checkins(id, user_id) on delete set null
);

create table public.dialogue_turns (
  id uuid primary key default gen_random_uuid(),
  dialogue_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence_no integer not null check (sequence_no > 0),
  role text not null check (role in ('user', 'assistant', 'system')),
  text_content text not null,
  retention_until timestamptz,
  created_at timestamptz not null default now(),
  unique (dialogue_id, sequence_no),
  foreign key (dialogue_id, user_id) references public.daily_dialogues(id, user_id) on delete cascade
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  storage_key text not null unique,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  mime_type text not null,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  checksum_sha256 text,
  processing_status text not null default 'staged'
    check (processing_status in ('staged', 'scanning', 'processing', 'ready', 'failed', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_components (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets(id) on delete cascade,
  component_type text not null check (component_type in ('person', 'music', 'voice', 'photo', 'graphic', 'document', 'other')),
  source_asset_id uuid references public.media_assets(id) on delete set null,
  contributor_id uuid references auth.users(id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create table public.asset_rights (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.asset_components(id) on delete cascade,
  rightsholder text not null,
  agreement_ref text not null,
  allowed_channels text[] not null default '{}',
  territories text[] not null default '{}',
  commercial_use boolean not null default false,
  derivatives_allowed boolean not null default false,
  transcription_allowed boolean not null default false,
  translation_allowed boolean not null default false,
  ai_use_allowed boolean not null default false,
  attribution_text text,
  model_release_ref text,
  valid_from date,
  expires_at date,
  revocation_state text not null default 'valid' check (revocation_state in ('valid', 'expiring', 'revoked')),
  created_at timestamptz not null default now(),
  check (expires_at is null or valid_from is null or expires_at >= valid_from)
);

create table public.media_renditions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets(id) on delete cascade,
  storage_key text not null unique,
  codec text,
  container text,
  width integer,
  height integer,
  bitrate_kbps integer,
  duration_ms integer,
  processing_status text not null default 'processing'
    check (processing_status in ('processing', 'ready', 'failed', 'withdrawn')),
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  owner_teacher_id uuid not null references public.teachers(user_id) on delete restrict,
  stable_slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_versions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete restrict,
  version_no integer not null check (version_no > 0),
  source_version_id uuid references public.session_versions(id) on delete set null,
  locale text not null default 'vi-VN',
  title text not null,
  summary text,
  objective text,
  level text,
  intensity text,
  pace text,
  instruction_density text,
  duration_seconds integer not null check (duration_seconds > 0),
  props jsonb not null default '[]'::jsonb,
  space_requirement text,
  floor_contact text,
  positions jsonb not null default '[]'::jsonb,
  learning_focus jsonb not null default '[]'::jsonb,
  exclusions_policy_ref text,
  media_asset_id uuid references public.media_assets(id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'changes_requested', 'approved', 'scheduled', 'published')),
  reviewed_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, version_no, locale),
  unique (id, session_id, locale)
);

create table public.session_publications (
  session_id uuid not null references public.sessions(id) on delete cascade,
  locale text not null,
  version_id uuid not null,
  published_at timestamptz not null default now(),
  primary key (session_id, locale),
  foreign key (version_id, session_id, locale)
    references public.session_versions(id, session_id, locale) on delete restrict
);

create table public.session_version_availability (
  session_version_id uuid primary key references public.session_versions(id) on delete cascade,
  can_start boolean not null default false,
  can_resume boolean not null default false,
  reason_code text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table public.session_segments (
  id uuid primary key default gen_random_uuid(),
  session_version_id uuid not null references public.session_versions(id) on delete cascade,
  position integer not null check (position > 0),
  start_ms integer not null check (start_ms >= 0),
  end_ms integer not null check (end_ms > start_ms),
  movement_name text,
  cue_text text,
  stop_cue text,
  breath_cue text,
  variant_ref text,
  unique (session_version_id, position)
);

create table public.caption_tracks (
  id uuid primary key default gen_random_uuid(),
  session_version_id uuid not null references public.session_versions(id) on delete cascade,
  locale text not null,
  asset_id uuid not null references public.media_assets(id) on delete restrict,
  format text not null check (format in ('vtt', 'srt', 'transcript')),
  review_status text not null default 'draft' check (review_status in ('draft', 'reviewed', 'approved')),
  reviewer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (session_version_id, locale, format)
);

create table public.session_assets (
  session_version_id uuid not null references public.session_versions(id) on delete cascade,
  asset_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null check (role in ('thumbnail', 'audio', 'pdf', 'illustration', 'supplement')),
  position integer not null default 1,
  primary key (session_version_id, asset_id, role)
);

create table public.session_suitability_rules (
  id uuid primary key default gen_random_uuid(),
  session_version_id uuid not null references public.session_versions(id) on delete cascade,
  context_code text not null,
  outcome text not null check (outcome in ('eligible', 'exclude', 'needs_human_review')),
  reason_code text not null,
  policy_version text not null,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (session_version_id, context_code)
);

create table public.session_alternatives (
  source_version_id uuid not null references public.session_versions(id) on delete cascade,
  alternative_version_id uuid not null references public.session_versions(id) on delete restrict,
  relation_type text not null check (relation_type in ('gentler', 'shorter', 'less_floor')),
  approved_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (source_version_id, alternative_version_id, relation_type),
  check (source_version_id <> alternative_version_id)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_teacher_id uuid references public.teachers(user_id) on delete set null,
  stable_slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_versions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  version_no integer not null check (version_no > 0),
  locale text not null default 'vi-VN',
  title text not null,
  audience text,
  outcomes jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, version_no, locale)
);

create table public.course_lessons (
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  position integer not null check (position > 0),
  session_version_id uuid not null references public.session_versions(id) on delete restrict,
  primary key (course_version_id, position),
  unique (course_version_id, session_version_id)
);

create table public.practice_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_id uuid,
  catalog_version text not null,
  policy_version text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'started', 'completed', 'no_match', 'expired')),
  created_at timestamptz not null default now(),
  foreign key (checkin_id, user_id) references public.checkins(id, user_id) on delete set null,
  unique (id, user_id)
);

create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null check (position > 0),
  session_version_id uuid not null references public.session_versions(id) on delete restrict,
  rationale text,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (plan_id, position),
  unique (id, user_id),
  foreign key (plan_id, user_id) references public.practice_plans(id, user_id) on delete cascade
);

create table public.practice_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_item_id uuid,
  session_version_id uuid not null references public.session_versions(id) on delete restrict,
  status text not null default 'started' check (status in ('started', 'paused', 'completed', 'stopped', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  actual_duration_seconds integer check (actual_duration_seconds is null or actual_duration_seconds >= 0),
  created_at timestamptz not null default now(),
  foreign key (plan_item_id, user_id) references public.plan_items(id, user_id) on delete set null,
  unique (id, user_id)
);

create table public.practice_reflections (
  id uuid primary key default gen_random_uuid(),
  practice_run_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_outcome text not null check (overall_outcome in ('better', 'unchanged', 'worse', 'uncertain', 'skipped')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (practice_run_id),
  foreign key (practice_run_id, user_id) references public.practice_runs(id, user_id) on delete cascade
);

create table public.reflection_observations (
  id uuid primary key default gen_random_uuid(),
  reflection_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  region_code text not null check (region_code in ('neck', 'shoulder_left', 'shoulder_right', 'upper_back', 'lower_back')),
  outcome text not null check (outcome in ('better', 'unchanged', 'worse', 'uncertain', 'skipped')),
  note text,
  created_at timestamptz not null default now(),
  unique (reflection_id, region_code),
  foreign key (reflection_id) references public.practice_reflections(id) on delete cascade
);

create table public.editorial_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('help', 'knowledge', 'marketing_article', 'category_page', 'landing')),
  stable_key text not null unique,
  owner_team text not null,
  created_at timestamptz not null default now()
);

create table public.editorial_versions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.editorial_items(id) on delete cascade,
  version_no integer not null check (version_no > 0),
  source_version_id uuid references public.editorial_versions(id) on delete set null,
  locale text not null default 'vi-VN',
  title text not null,
  summary text,
  body_schema_version text not null default 'blocks.v1',
  body_blocks jsonb not null default '[]'::jsonb,
  hero_asset_id uuid references public.media_assets(id) on delete set null,
  author_id uuid not null references auth.users(id) on delete restrict,
  editor_id uuid references auth.users(id) on delete set null,
  expert_reviewer_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'changes_requested', 'approved', 'scheduled', 'published')),
  review_due_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, version_no, locale),
  unique (id, item_id, locale)
);

create table public.editorial_publications (
  item_id uuid not null references public.editorial_items(id) on delete cascade,
  locale text not null,
  version_id uuid not null,
  published_at timestamptz not null default now(),
  unpublished_at timestamptz,
  primary key (item_id, locale),
  foreign key (version_id, item_id, locale)
    references public.editorial_versions(id, item_id, locale) on delete restrict
);

create table public.editorial_routes (
  id uuid primary key default gen_random_uuid(),
  locale text not null,
  slug text not null,
  item_id uuid not null references public.editorial_items(id) on delete cascade,
  route_status text not null default 'active' check (route_status in ('active', 'redirect', 'retired')),
  redirect_to_route_id uuid references public.editorial_routes(id) on delete restrict,
  unique (locale, slug)
);

create table public.editorial_seo (
  version_id uuid primary key references public.editorial_versions(id) on delete cascade,
  meta_title text,
  meta_description text,
  canonical_url text,
  robots_policy text not null default 'index,follow',
  social_image_asset_id uuid references public.media_assets(id) on delete set null,
  schema_type text
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.topics(id) on delete set null,
  stable_key text not null unique
);

create table public.topic_localizations (
  topic_id uuid not null references public.topics(id) on delete cascade,
  locale text not null,
  label text not null,
  primary key (topic_id, locale)
);

create table public.editorial_version_topics (
  editorial_version_id uuid not null references public.editorial_versions(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete restrict,
  position integer not null default 1,
  primary key (editorial_version_id, topic_id)
);

create table public.editorial_sources (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.editorial_versions(id) on delete cascade,
  source_url text not null,
  source_title text,
  publisher text,
  accessed_at timestamptz,
  claim_ref text
);

create table public.help_placements (
  editorial_version_id uuid not null references public.editorial_versions(id) on delete cascade,
  screen_key text not null,
  context_key text,
  min_app_version text,
  max_app_version text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  priority integer not null default 100,
  primary key (editorial_version_id, screen_key, context_key)
);

create table public.editorial_session_links (
  editorial_version_id uuid not null references public.editorial_versions(id) on delete cascade,
  session_version_id uuid not null references public.session_versions(id) on delete restrict,
  relation text not null check (relation in ('explains', 'related', 'recommended_next')),
  position integer not null default 1,
  primary key (editorial_version_id, session_version_id, relation)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  start_at timestamptz,
  end_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'active', 'ended', 'archived')),
  check (end_at is null or start_at is null or end_at >= start_at)
);

create table public.content_placements (
  id uuid primary key default gen_random_uuid(),
  editorial_version_id uuid not null references public.editorial_versions(id) on delete cascade,
  channel text not null check (channel in ('app', 'website', 'email', 'social')),
  campaign_id uuid references public.campaigns(id) on delete set null,
  start_at timestamptz,
  end_at timestamptz,
  cta_ref text,
  priority integer not null default 100,
  check (end_at is null or start_at is null or end_at >= start_at)
);

create table public.editorial_ai_grants (
  editorial_version_id uuid not null references public.editorial_versions(id) on delete cascade,
  scope text not null check (scope in ('app_help_only', 'explain_only')),
  approved_by uuid not null references auth.users(id) on delete restrict,
  valid_until timestamptz,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  primary key (editorial_version_id, scope)
);

create table public.session_review_events (
  id uuid primary key default gen_random_uuid(),
  session_version_id uuid not null references public.session_versions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  review_type text not null,
  decision text not null check (decision in ('approved', 'changes_requested', 'rejected')),
  reason text,
  checklist_version text,
  created_at timestamptz not null default now()
);

create table public.editorial_review_events (
  id uuid primary key default gen_random_uuid(),
  editorial_version_id uuid not null references public.editorial_versions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  review_type text not null,
  decision text not null check (decision in ('approved', 'changes_requested', 'rejected')),
  reason text,
  checklist_version text,
  created_at timestamptz not null default now()
);

create table public.session_publication_events (
  id uuid primary key default gen_random_uuid(),
  session_version_id uuid not null references public.session_versions(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('published', 'suspended', 'resumed', 'retired')),
  reason text,
  created_at timestamptz not null default now()
);

create table public.editorial_publication_events (
  id uuid primary key default gen_random_uuid(),
  editorial_version_id uuid not null references public.editorial_versions(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('published', 'unpublished', 'redirected', 'retired')),
  reason text,
  created_at timestamptz not null default now()
);

create index checkins_user_date_idx on public.checkins(user_id, local_date desc, created_at desc);
create index checkin_observations_user_region_idx on public.checkin_observations(user_id, region_code);
create index dialogues_user_created_idx on public.daily_dialogues(user_id, created_at desc);
create index dialogue_turns_user_created_idx on public.dialogue_turns(user_id, created_at desc);
create index sessions_owner_idx on public.sessions(owner_teacher_id);
create index session_versions_filter_idx on public.session_versions(status, locale, duration_seconds);
create index session_publications_version_idx on public.session_publications(version_id);
create index session_segments_version_idx on public.session_segments(session_version_id, position);
create index suitability_context_idx on public.session_suitability_rules(context_code, outcome);
create index practice_plans_user_created_idx on public.practice_plans(user_id, created_at desc);
create index practice_runs_user_started_idx on public.practice_runs(user_id, started_at desc);
create index editorial_publications_locale_idx on public.editorial_publications(locale, published_at desc);
create index editorial_routes_lookup_idx on public.editorial_routes(locale, slug);
create index editorial_versions_status_locale_idx on public.editorial_versions(status, locale, published_at desc);
create index help_placements_screen_idx on public.help_placements(screen_key, context_key, status);
create index editorial_version_topics_topic_idx on public.editorial_version_topics(topic_id);
create index content_placements_channel_idx on public.content_placements(channel, start_at, end_at);

create trigger profiles_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger teachers_updated_at before update on public.teachers
for each row execute function private.set_updated_at();
create trigger checkins_updated_at before update on public.checkins
for each row execute function private.set_updated_at();
create trigger checkin_observations_updated_at before update on public.checkin_observations
for each row execute function private.set_updated_at();
create trigger media_assets_updated_at before update on public.media_assets
for each row execute function private.set_updated_at();
create trigger sessions_updated_at before update on public.sessions
for each row execute function private.set_updated_at();
create trigger session_versions_updated_at before update on public.session_versions
for each row execute function private.set_updated_at();
create trigger courses_updated_at before update on public.courses
for each row execute function private.set_updated_at();
create trigger course_versions_updated_at before update on public.course_versions
for each row execute function private.set_updated_at();
create trigger practice_reflections_updated_at before update on public.practice_reflections
for each row execute function private.set_updated_at();
create trigger editorial_versions_updated_at before update on public.editorial_versions
for each row execute function private.set_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'user_consents', 'teachers', 'checkins', 'checkin_observations',
    'daily_dialogues', 'dialogue_turns', 'media_assets', 'asset_components', 'asset_rights',
    'media_renditions', 'sessions', 'session_versions', 'session_publications',
    'session_version_availability', 'session_segments', 'caption_tracks', 'session_assets',
    'session_suitability_rules', 'session_alternatives', 'courses', 'course_versions',
    'course_lessons', 'practice_plans', 'plan_items', 'practice_runs', 'practice_reflections',
    'reflection_observations', 'editorial_items', 'editorial_versions', 'editorial_publications',
    'editorial_routes', 'editorial_seo', 'topics', 'topic_localizations',
    'editorial_version_topics', 'editorial_sources', 'help_placements', 'editorial_session_links',
    'campaigns', 'content_placements', 'editorial_ai_grants', 'session_review_events',
    'editorial_review_events', 'session_publication_events', 'editorial_publication_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end
$$;

-- User-owned data: every policy includes an owner predicate. No anonymous write access.
create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy consents_select_own on public.user_consents for select to authenticated
using ((select auth.uid()) = user_id);
create policy consents_insert_own on public.user_consents for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy consents_update_own on public.user_consents for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy checkins_select_own on public.checkins for select to authenticated
using ((select auth.uid()) = user_id);
create policy checkins_insert_own on public.checkins for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy checkins_update_own on public.checkins for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy observations_select_own on public.checkin_observations for select to authenticated
using ((select auth.uid()) = user_id);
create policy observations_insert_own on public.checkin_observations for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy observations_update_own on public.checkin_observations for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy dialogues_select_own on public.daily_dialogues for select to authenticated
using ((select auth.uid()) = user_id);
create policy dialogues_insert_own on public.daily_dialogues for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy dialogues_update_own on public.daily_dialogues for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy turns_select_own on public.dialogue_turns for select to authenticated
using ((select auth.uid()) = user_id);
create policy turns_insert_own on public.dialogue_turns for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy runs_select_own on public.practice_runs for select to authenticated
using ((select auth.uid()) = user_id);
create policy runs_insert_own on public.practice_runs for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy runs_update_own on public.practice_runs for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy plans_select_own on public.practice_plans for select to authenticated
using ((select auth.uid()) = user_id);
create policy plans_insert_own on public.practice_plans for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy plans_update_own on public.practice_plans for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy plan_items_select_own on public.plan_items for select to authenticated
using ((select auth.uid()) = user_id);
create policy plan_items_insert_own on public.plan_items for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy reflections_select_own on public.practice_reflections for select to authenticated
using ((select auth.uid()) = user_id);
create policy reflections_insert_own on public.practice_reflections for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy reflections_update_own on public.practice_reflections for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy reflection_observations_select_own on public.reflection_observations for select to authenticated
using ((select auth.uid()) = user_id);
create policy reflection_observations_insert_own on public.reflection_observations for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy reflection_observations_update_own on public.reflection_observations for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Published content is readable; drafts and privileged metadata stay server-side.
create policy teachers_public_read on public.teachers for select to anon, authenticated
using (active = true);
create policy teachers_owner_write on public.teachers for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy sessions_public_read on public.sessions for select to anon, authenticated
using (exists (
  select 1 from public.session_publications sp
  join public.session_version_availability sva on sva.session_version_id = sp.version_id
  where sp.session_id = sessions.id and sva.can_start = true
));
create policy sessions_owner_read on public.sessions for select to authenticated
using ((select auth.uid()) = owner_teacher_id);
create policy sessions_owner_write on public.sessions for insert to authenticated
with check ((select auth.uid()) = owner_teacher_id);
create policy sessions_owner_update on public.sessions for update to authenticated
using ((select auth.uid()) = owner_teacher_id) with check ((select auth.uid()) = owner_teacher_id);

create policy session_versions_public_read on public.session_versions for select to anon, authenticated
using (exists (
  select 1 from public.session_publications sp
  join public.session_version_availability sva on sva.session_version_id = sp.version_id
  where sp.version_id = session_versions.id and sva.can_start = true
));
create policy session_versions_owner_read on public.session_versions for select to authenticated
using (exists (select 1 from public.sessions s where s.id = session_id and s.owner_teacher_id = (select auth.uid())));
create policy session_versions_owner_insert on public.session_versions for insert to authenticated
with check (exists (select 1 from public.sessions s where s.id = session_id and s.owner_teacher_id = (select auth.uid())));
create policy session_versions_owner_update on public.session_versions for update to authenticated
using (exists (select 1 from public.sessions s where s.id = session_id and s.owner_teacher_id = (select auth.uid())))
with check (exists (select 1 from public.sessions s where s.id = session_id and s.owner_teacher_id = (select auth.uid())));

create policy segments_public_read on public.session_segments for select to anon, authenticated
using (exists (select 1 from public.session_versions v join public.session_publications p on p.version_id = v.id
  join public.session_version_availability a on a.session_version_id = v.id where v.id = session_version_id and a.can_start = true));
create policy segments_owner_read on public.session_segments for select to authenticated
using (exists (select 1 from public.session_versions v join public.sessions s on s.id = v.session_id
  where v.id = session_version_id and s.owner_teacher_id = (select auth.uid())));
create policy segments_owner_write on public.session_segments for insert to authenticated
with check (exists (select 1 from public.session_versions v join public.sessions s on s.id = v.session_id
  where v.id = session_version_id and s.owner_teacher_id = (select auth.uid())));

create policy editorial_publications_public_read on public.editorial_publications for select to anon, authenticated
using (unpublished_at is null);
create policy editorial_items_public_read on public.editorial_items for select to anon, authenticated
using (exists (select 1 from public.editorial_publications p where p.item_id = editorial_items.id and p.unpublished_at is null));
create policy editorial_versions_public_read on public.editorial_versions for select to anon, authenticated
using (exists (select 1 from public.editorial_publications p where p.version_id = editorial_versions.id and p.unpublished_at is null));
create policy editorial_versions_author_read on public.editorial_versions for select to authenticated
using ((select auth.uid()) = author_id or (select auth.uid()) = editor_id or (select auth.uid()) = expert_reviewer_id);
create policy editorial_versions_author_insert on public.editorial_versions for insert to authenticated
with check ((select auth.uid()) = author_id);
create policy editorial_versions_author_update on public.editorial_versions for update to authenticated
using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
create policy editorial_routes_public_read on public.editorial_routes for select to anon, authenticated
using (route_status in ('active', 'redirect'));
create policy editorial_seo_public_read on public.editorial_seo for select to anon, authenticated
using (exists (select 1 from public.editorial_publications p where p.version_id = editorial_seo.version_id and p.unpublished_at is null));
create policy topics_public_read on public.topics for select to anon, authenticated using (true);
create policy topic_localizations_public_read on public.topic_localizations for select to anon, authenticated using (true);
create policy version_topics_public_read on public.editorial_version_topics for select to anon, authenticated
using (exists (select 1 from public.editorial_publications p where p.version_id = editorial_version_topics.editorial_version_id and p.unpublished_at is null));
create policy sources_public_read on public.editorial_sources for select to anon, authenticated
using (exists (select 1 from public.editorial_publications p where p.version_id = editorial_sources.version_id and p.unpublished_at is null));
create policy help_placements_public_read on public.help_placements for select to anon, authenticated
using (status = 'active' and exists (select 1 from public.editorial_publications p where p.version_id = help_placements.editorial_version_id and p.unpublished_at is null));
create policy session_links_public_read on public.editorial_session_links for select to anon, authenticated
using (exists (select 1 from public.editorial_publications p where p.version_id = editorial_session_links.editorial_version_id and p.unpublished_at is null));

-- Default-deny remains for media rights, availability, reviews, grants and publication events.
