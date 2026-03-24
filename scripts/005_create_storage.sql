-- Create public storage buckets for avatars and activity photos
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('activity-photos', 'activity-photos', true)
on conflict (id) do nothing;

-- Enable read access for everyone
drop policy if exists "avatars_select_all" on storage.objects;
create policy "avatars_select_all"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "activity_photos_select_all" on storage.objects;
create policy "activity_photos_select_all"
on storage.objects for select
using (bucket_id = 'activity-photos');

-- Allow public upload for current custom-login flow.
-- The app does not use Supabase Auth sessions, so auth.uid() is null on client.
-- Restrict by key prefix instead of auth.uid():
-- avatars/profiles/<user_id>/...
drop policy if exists "avatars_insert_own_folder" on storage.objects;
drop policy if exists "avatars_insert_public_prefix" on storage.objects;
create policy "avatars_insert_public_prefix"
on storage.objects for insert
to public
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'profiles'
  and split_part(name, '/', 2) <> ''
);

-- activity-photos/activities/<user_id>/...
drop policy if exists "activity_photos_insert_own_folder" on storage.objects;
drop policy if exists "activity_photos_insert_public_prefix" on storage.objects;
create policy "activity_photos_insert_public_prefix"
on storage.objects for insert
to public
with check (
  bucket_id = 'activity-photos'
  and split_part(name, '/', 1) = 'activities'
  and split_part(name, '/', 2) <> ''
);

