-- Một chút yoga — staging hardening v1
-- Keep RLS deny-by-default on privileged content, and add FK indexes for pilot growth.

alter function private.set_updated_at() set search_path = pg_catalog;

create index if not exists asset_components_asset_idx on public.asset_components(asset_id);
create index if not exists asset_components_source_asset_idx on public.asset_components(source_asset_id);
create index if not exists asset_components_contributor_idx on public.asset_components(contributor_id);
create index if not exists asset_rights_component_idx on public.asset_rights(component_id);
create index if not exists campaigns_owner_idx on public.campaigns(owner_id);
create index if not exists caption_tracks_asset_idx on public.caption_tracks(asset_id);
create index if not exists caption_tracks_reviewer_idx on public.caption_tracks(reviewer_id);
create index if not exists checkin_observations_checkin_user_idx on public.checkin_observations(checkin_id, user_id);
create index if not exists content_placements_editorial_version_idx on public.content_placements(editorial_version_id);
create index if not exists content_placements_campaign_idx on public.content_placements(campaign_id);
create index if not exists course_lessons_session_version_idx on public.course_lessons(session_version_id);
create index if not exists courses_owner_teacher_idx on public.courses(owner_teacher_id);
create index if not exists daily_dialogues_checkin_user_idx on public.daily_dialogues(checkin_id, user_id);
create index if not exists dialogue_turns_dialogue_user_idx on public.dialogue_turns(dialogue_id, user_id);
create index if not exists editorial_ai_grants_approved_by_idx on public.editorial_ai_grants(approved_by);
create index if not exists editorial_publication_events_version_idx on public.editorial_publication_events(editorial_version_id);
create index if not exists editorial_publication_events_actor_idx on public.editorial_publication_events(actor_id);
create index if not exists editorial_publications_version_item_locale_idx on public.editorial_publications(version_id, item_id, locale);
create index if not exists editorial_review_events_version_idx on public.editorial_review_events(editorial_version_id);
create index if not exists editorial_review_events_reviewer_idx on public.editorial_review_events(reviewer_id);
create index if not exists editorial_routes_item_idx on public.editorial_routes(item_id);
create index if not exists editorial_routes_redirect_idx on public.editorial_routes(redirect_to_route_id);
create index if not exists editorial_seo_social_asset_idx on public.editorial_seo(social_image_asset_id);
create index if not exists editorial_session_links_session_version_idx on public.editorial_session_links(session_version_id);
create index if not exists editorial_sources_version_idx on public.editorial_sources(version_id);
create index if not exists editorial_versions_author_idx on public.editorial_versions(author_id);
create index if not exists editorial_versions_editor_idx on public.editorial_versions(editor_id);
create index if not exists editorial_versions_reviewer_idx on public.editorial_versions(expert_reviewer_id);
create index if not exists editorial_versions_hero_asset_idx on public.editorial_versions(hero_asset_id);
create index if not exists editorial_versions_source_idx on public.editorial_versions(source_version_id);
create index if not exists media_assets_owner_idx on public.media_assets(owner_user_id);
create index if not exists media_renditions_asset_idx on public.media_renditions(asset_id);
create index if not exists plan_items_plan_user_idx on public.plan_items(plan_id, user_id);
create index if not exists plan_items_session_version_idx on public.plan_items(session_version_id);
create index if not exists plan_items_user_idx on public.plan_items(user_id);
create index if not exists practice_plans_checkin_user_idx on public.practice_plans(checkin_id, user_id);
create index if not exists practice_reflections_run_user_idx on public.practice_reflections(practice_run_id, user_id);
create index if not exists practice_reflections_user_idx on public.practice_reflections(user_id);
create index if not exists practice_runs_plan_item_user_idx on public.practice_runs(plan_item_id, user_id);
create index if not exists practice_runs_session_version_idx on public.practice_runs(session_version_id);
create index if not exists practice_runs_user_idx on public.practice_runs(user_id);
create index if not exists reflection_observations_reflection_idx on public.reflection_observations(reflection_id);
create index if not exists reflection_observations_user_idx on public.reflection_observations(user_id);
create index if not exists session_alternatives_alternative_idx on public.session_alternatives(alternative_version_id);
create index if not exists session_alternatives_approved_by_idx on public.session_alternatives(approved_by);
create index if not exists session_assets_asset_idx on public.session_assets(asset_id);
create index if not exists session_publication_events_version_idx on public.session_publication_events(session_version_id);
create index if not exists session_publication_events_actor_idx on public.session_publication_events(actor_id);
create index if not exists session_publications_version_session_locale_idx on public.session_publications(version_id, session_id, locale);
create index if not exists session_review_events_version_idx on public.session_review_events(session_version_id);
create index if not exists session_review_events_reviewer_idx on public.session_review_events(reviewer_id);
create index if not exists session_suitability_reviewer_idx on public.session_suitability_rules(reviewer_id);
create index if not exists session_version_availability_changed_by_idx on public.session_version_availability(changed_by);
create index if not exists session_versions_media_asset_idx on public.session_versions(media_asset_id);
create index if not exists session_versions_reviewed_by_idx on public.session_versions(reviewed_by);
create index if not exists session_versions_source_idx on public.session_versions(source_version_id);
create index if not exists topics_parent_idx on public.topics(parent_id);
create index if not exists user_consents_user_idx on public.user_consents(user_id);

-- Consolidate overlapping SELECT policies so the advisor does not evaluate two
-- permissive predicates for the same authenticated request.
drop policy if exists teachers_public_read on public.teachers;
drop policy if exists teachers_owner_write on public.teachers;
create policy teachers_select_public_or_owner on public.teachers for select to anon, authenticated
using (active = true or (select auth.uid()) = user_id);
create policy teachers_insert_owner on public.teachers for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy teachers_update_owner on public.teachers for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy teachers_delete_owner on public.teachers for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists sessions_public_read on public.sessions;
drop policy if exists sessions_owner_read on public.sessions;
create policy sessions_select_public_or_owner on public.sessions for select to anon, authenticated
using ((select auth.uid()) = owner_teacher_id or exists (
  select 1 from public.session_publications sp
  join public.session_version_availability sva on sva.session_version_id = sp.version_id
  where sp.session_id = sessions.id and sva.can_start = true
));

drop policy if exists session_versions_public_read on public.session_versions;
drop policy if exists session_versions_owner_read on public.session_versions;
create policy session_versions_select_public_or_owner on public.session_versions for select to anon, authenticated
using (((select auth.uid()) is not null and exists (
  select 1 from public.sessions s where s.id = session_id and s.owner_teacher_id = (select auth.uid())
)) or exists (
  select 1 from public.session_publications sp
  join public.session_version_availability sva on sva.session_version_id = sp.version_id
  where sp.version_id = session_versions.id and sva.can_start = true
));

drop policy if exists segments_public_read on public.session_segments;
drop policy if exists segments_owner_read on public.session_segments;
create policy segments_select_public_or_owner on public.session_segments for select to anon, authenticated
using (exists (
  select 1 from public.session_versions v
  join public.sessions s on s.id = v.session_id
  where v.id = session_version_id and s.owner_teacher_id = (select auth.uid())
) or exists (
  select 1 from public.session_publications p
  join public.session_version_availability a on a.session_version_id = p.version_id
  where p.version_id = session_version_id and a.can_start = true
));

drop policy if exists editorial_versions_public_read on public.editorial_versions;
drop policy if exists editorial_versions_author_read on public.editorial_versions;
create policy editorial_versions_select_public_or_author on public.editorial_versions for select to anon, authenticated
using (exists (
  select 1 from public.editorial_publications p
  where p.version_id = editorial_versions.id and p.unpublished_at is null
) or (select auth.uid()) in (author_id, editor_id, expert_reviewer_id));
