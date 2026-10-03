-- Owner-approved staging hardening scope (2026-10-01): remove direct client
-- privileges from the 18 public tables with RLS enabled and no policies;
-- retain SELECT only on the 10 public-read tables whose policies are SELECT-only.
-- Do not change service_role, learner-owned tables/RPCs, policies, or default ACLs.

REVOKE ALL PRIVILEGES ON TABLE
  public.campaigns,
  public.caption_tracks,
  public.content_placements,
  public.course_lessons,
  public.course_versions,
  public.courses,
  public.editorial_ai_grants,
  public.editorial_publication_events,
  public.editorial_review_events,
  public.media_assets,
  public.media_renditions,
  public.session_alternatives,
  public.session_assets,
  public.session_publication_events,
  public.session_publications,
  public.session_review_events,
  public.session_suitability_rules,
  public.session_version_availability
FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE
  public.editorial_items,
  public.editorial_publications,
  public.editorial_routes,
  public.editorial_seo,
  public.editorial_session_links,
  public.editorial_sources,
  public.editorial_version_topics,
  public.help_placements,
  public.topic_localizations,
  public.topics
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE
  public.editorial_items,
  public.editorial_publications,
  public.editorial_routes,
  public.editorial_seo,
  public.editorial_session_links,
  public.editorial_sources,
  public.editorial_version_topics,
  public.help_placements,
  public.topic_localizations,
  public.topics
TO anon, authenticated;
