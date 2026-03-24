-- Create activities table
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  sport_type text not null check (sport_type in ('cycling', 'hiking')),
  meeting_time timestamp with time zone not null,
  meeting_location text not null,
  estimated_duration integer not null, -- in minutes
  max_participants integer not null default 10,
  difficulty integer not null check (difficulty >= 1 and difficulty <= 5),
  items_to_prepare text,
  route_file_url text,
  organizer_phone text not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activities enable row level security;

-- RLS policies for activities
create policy "activities_select_all" on public.activities for select using (true);
create policy "activities_insert_auth" on public.activities for insert with check (auth.uid() = organizer_id);
create policy "activities_update_own" on public.activities for update using (auth.uid() = organizer_id);
create policy "activities_delete_own" on public.activities for delete using (auth.uid() = organizer_id);

-- Create index for faster queries
create index if not exists activities_meeting_time_idx on public.activities(meeting_time);
create index if not exists activities_sport_type_idx on public.activities(sport_type);
create index if not exists activities_status_idx on public.activities(status);
