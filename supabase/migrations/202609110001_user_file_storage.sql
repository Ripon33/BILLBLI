-- Private storage for profile photos and chat attachments.
insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', false)
on conflict (id) do update
set public = false;

-- Users may upload only into their own top-level folder:
-- <auth.uid()>/profile/*
-- <auth.uid()>/chat/*
create policy "Users can upload their own files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Users may read only their own files.
create policy "Users can read their own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Users may update only their own files.
create policy "Users can update their own files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Users may delete only their own files.
create policy "Users can delete their own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
