-- Create activity photos table
create table if not exists public.activity_photos (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_url text not null,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activity_photos enable row level security;

-- RLS policies for photos
-- Anyone can view photos
create policy "photos_select_all" on public.activity_photos for select using (true);

-- Only participants can upload photos (check if user participated in the activity)
create policy "photos_insert_participant" on public.activity_photos for insert 
  with check (
    auth.uid() = user_id and 
    exists (
      select 1 from public.activity_participants 
      where activity_id = activity_photos.activity_id 
      and user_id = auth.uid()
    )
  );

-- Users can delete their own photos
create policy "photos_delete_own" on public.activity_photos for delete using (auth.uid() = user_id);

-- Create indexes
create index if not exists photos_activity_idx on public.activity_photos(activity_id);
create index if not exists photos_user_idx on public.activity_photos(user_id);
