-- Phase 4 (content workspace): the public snapshot may also carry approved, switched-on screen texts, so an author can replace the
-- few unlocked screen texts without a release. The Edge function projects only the keys on its allow-list (screenTextKeys.ts) and
-- publishes nothing else; everything not listed stays locked in the app code.
--
-- Patches one existing function in place, so it carries a DRIFT GUARD: it refuses to run unless the deployed function still holds
-- exactly the text this change expects, once. Expand-only: no table, column or privilege changes; the grants are restated unchanged.
do $guard$
declare def text;
begin
  select pg_get_functiondef('public.mcy_content_snapshot(uuid)'::regprocedure) into def;
  if def is null or length(def) - length(replace(def, 'where i.kind in (''video_lesson'', ''course_group'') and private.mcy_content_effective', '')) <> length('where i.kind in (''video_lesson'', ''course_group'') and private.mcy_content_effective') then
    raise exception using errcode = '55000', message = 'snapshot_function_drift';
  end if;
end $guard$;

create or replace function public.mcy_content_snapshot(p_actor_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare d private.mcy_display_config%rowtype;
begin
  if private.mcy_content_review_actor(p_actor_id) <> 'owner' then raise exception using errcode = '42501', message = 'owner_access_required'; end if;
  select * into strict d from private.mcy_display_config where singleton;
  return jsonb_build_object('display', d.config, 'display_version', d.version_no, 'items', coalesce((
    select jsonb_agg(jsonb_build_object('item_id', i.item_id, 'kind', i.kind, 'seq', v.seq, 'content_hash', v.content_hash, 'title', v.title, 'payload', v.payload,
      'author_kind', i.author_kind, 'origin', v.origin,
      'author_label', case when i.author_kind = 'teacher' then (select t.public_name from public.teachers t where t.user_id = i.author_id and t.active) end) order by i.item_id)
    from private.mcy_content_items i join private.mcy_content_versions v on v.item_id = i.item_id
    where i.kind in ('video_lesson', 'course_group', 'screen_text') and private.mcy_content_effective(v.item_id, v.content_hash)), '[]'::jsonb));
end $$;

revoke all on function public.mcy_content_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.mcy_content_snapshot(uuid) to service_role;
