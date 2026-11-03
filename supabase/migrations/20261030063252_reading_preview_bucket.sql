-- Private bucket for the reading-unit draft images used by the Owner/reviewer Preview.
-- The bucket is not public and gets no storage.objects policy, so only the service role (the
-- owner-control-plane Edge Function) can read or write it; learners and anon have no access.
-- Objects are named <sha256>.webp so an image can never be swapped without changing its hash.
-- Expand-only: creates one bucket row if missing; never touches other buckets or objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reading-preview', 'reading-preview', false, 1048576, array['image/webp'])
on conflict (id) do nothing;

do $$
begin
  if exists (select 1 from storage.buckets where id = 'reading-preview' and public) then
    raise exception 'reading-preview must stay a private bucket' using errcode = '42501';
  end if;
end $$;
