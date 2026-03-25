-- Badges & Achievements System
-- Badge definitions live in application code; this table stores earned instances

create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_key text not null,
  awarded_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.user_badges enable row level security;

-- Everyone can see badges
create policy "Badges viewable by all authenticated users"
  on public.user_badges for select using (auth.role() = 'authenticated');

-- Auto-earned: users insert their own badges
create policy "Users can earn their own badges"
  on public.user_badges for insert
  with check (auth.uid() = user_id and awarded_by is null);

-- Peer-awarded: any authenticated user can give a badge to someone else
create policy "Users can award badges to others"
  on public.user_badges for insert
  with check (auth.uid() = awarded_by and user_id != awarded_by);

-- Unique indexes
create unique index idx_user_badges_auto_unique
  on public.user_badges(user_id, badge_key)
  where awarded_by is null;

create unique index idx_user_badges_peer_unique
  on public.user_badges(user_id, badge_key, awarded_by)
  where awarded_by is not null;

-- Performance indexes
create index idx_user_badges_user on public.user_badges(user_id);
create index idx_user_badges_recent on public.user_badges(created_at desc);
