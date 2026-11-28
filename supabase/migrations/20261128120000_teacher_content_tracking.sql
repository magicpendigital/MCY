-- W1 / T1 (Owner 28/11, plan plans/active/2026-11-28-teacher-workspace-w1.md): what a teacher may know about the teacher's own
-- video lessons and free courses after sending them, read in one call for the "Theo dõi" view:
--  * the version learners are allowed to see (approved at that exact version and switched on after the latest review), and whether
--    it actually reaches the app (a lesson only through a shown course that lists it; a course only while it holds a shown lesson);
--  * the history of sends and review decisions, by version and time, never who reviewed or the reviewer's declaration;
--  * the courses that hold a lesson: the teacher's own courses, plus courses that are shown to learners anyway (public titles).
-- Read-only, no learner data, no new table. Expand-only. security definer, empty search_path, EXECUTE for service_role only;
-- the actor is re-checked inside (verified Owner or active teacher; a teacher reads only items the teacher authored).

create function public.mcy_content_tracking(p_actor_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r text; items jsonb;
begin
  r := private.mcy_content_review_actor(p_actor_id);
  with mine as (
    select i.item_id, i.kind, i.created_at from private.mcy_content_items i
    where i.kind in ('video_lesson', 'course_group') and (r = 'owner' or (i.author_kind = 'teacher' and i.author_id = p_actor_id))
    order by i.created_at desc limit 300
  ), shown as (
    select v.item_id, v.seq, v.title, v.payload, i.kind
    from private.mcy_content_versions v join private.mcy_content_items i on i.item_id = v.item_id
    where i.kind in ('video_lesson', 'course_group') and private.mcy_content_effective(v.item_id, v.content_hash)
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'item_id', m.item_id, 'kind', m.kind,
    'shown_seq', (select max(s.seq) from shown s where s.item_id = m.item_id),
    'on_app', case when m.kind = 'video_lesson' then
        exists (select 1 from shown s where s.item_id = m.item_id)
        and exists (select 1 from shown g where g.kind = 'course_group' and jsonb_typeof(g.payload -> 'lessonIds') = 'array' and g.payload -> 'lessonIds' ? m.item_id)
      else exists (select 1 from shown g join shown l on l.kind = 'video_lesson'
        where g.item_id = m.item_id and jsonb_typeof(g.payload -> 'lessonIds') = 'array' and g.payload -> 'lessonIds' ? l.item_id) end,
    'history', coalesce((select jsonb_agg(h.e order by h.at desc) from (
        select x.at, x.e from (
          select e.occurred_at as at, jsonb_build_object('event', 'submit', 'seq', e.seq, 'at', e.occurred_at) as e
            from private.mcy_content_events e where e.item_id = m.item_id and e.kind = 'submit'
          union all
          select ev.occurred_at, jsonb_build_object('event', 'review', 'decision', ev.payload ->> 'decision', 'at', ev.occurred_at,
              'seq', (select min(v.seq) from private.mcy_content_versions v where v.item_id = ev.candidate_id and v.content_hash = ev.content_version))
            from private.mcy_content_review_events ev where ev.candidate_id = m.item_id and ev.kind = 'review'
        ) x order by x.at desc limit 30) h), '[]'::jsonb),
    'courses', case when m.kind <> 'video_lesson' then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object(
        'item_id', c.item_id, 'title', c.title, 'own', c.own, 'shown', c.shown) order by c.title, c.item_id) from (
          select ci.item_id,
            (ci.author_kind = 'teacher' and ci.author_id = p_actor_id) as own,
            exists (select 1 from shown s where s.item_id = ci.item_id and jsonb_typeof(s.payload -> 'lessonIds') = 'array' and s.payload -> 'lessonIds' ? m.item_id) as shown,
            case when r = 'owner' or (ci.author_kind = 'teacher' and ci.author_id = p_actor_id) then lv.title
              else (select s.title from shown s where s.item_id = ci.item_id order by s.seq desc limit 1) end as title
          from private.mcy_content_items ci
          join lateral (select x.title, x.payload from private.mcy_content_versions x where x.item_id = ci.item_id order by x.seq desc limit 1) lv on true
          where ci.kind = 'course_group' and (
            ((r = 'owner' or (ci.author_kind = 'teacher' and ci.author_id = p_actor_id))
              and jsonb_typeof(lv.payload -> 'lessonIds') = 'array' and lv.payload -> 'lessonIds' ? m.item_id)
            or exists (select 1 from shown s where s.item_id = ci.item_id and jsonb_typeof(s.payload -> 'lessonIds') = 'array' and s.payload -> 'lessonIds' ? m.item_id))
        ) c), '[]'::jsonb) end
  ) order by m.created_at desc), '[]'::jsonb) into items
  from mine m;
  return jsonb_build_object('role', r, 'items', items);
end $$;

revoke all on function public.mcy_content_tracking(uuid) from public, anon, authenticated;
grant execute on function public.mcy_content_tracking(uuid) to service_role;
