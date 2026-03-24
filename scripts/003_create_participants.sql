-- Create activity participants table
create table if not exists public.activity_participants (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(activity_id, user_id)
);

-- Enable RLS
alter table public.activity_participants enable row level security;

-- RLS policies for participants
create policy "participants_select_all" on public.activity_participants for select using (true);
create policy "participants_insert_auth" on public.activity_participants for insert with check (auth.uid() = user_id);
create policy "participants_delete_own" on public.activity_participants for delete using (auth.uid() = user_id);

-- Create indexes
create index if not exists participants_activity_idx on public.activity_participants(activity_id);
create index if not exists participants_user_idx on public.activity_participants(user_id);
