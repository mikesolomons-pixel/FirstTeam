-- Challenge Priority Voting System
-- Admins can start a vote session; users rank challenges by importance

-- Vote sessions (admin-created)
create table if not exists public.challenge_vote_sessions (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null default 'Priority Vote',
  description text not null default 'Rank the challenges that matter most to you.',
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.challenge_vote_sessions enable row level security;

create policy "Vote sessions are viewable by everyone"
  on public.challenge_vote_sessions for select using (true);

create policy "Admins can create vote sessions"
  on public.challenge_vote_sessions for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update vote sessions"
  on public.challenge_vote_sessions for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Individual votes (each user assigns points to challenges)
-- Uses a points-allocation system: each user gets N points to distribute
create table if not exists public.challenge_votes (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.challenge_vote_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  points integer not null default 0 check (points >= 0 and points <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, user_id, challenge_id)
);

alter table public.challenge_votes enable row level security;

create policy "Users can view all votes"
  on public.challenge_votes for select using (true);

create policy "Users can insert own votes"
  on public.challenge_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.challenge_votes for update
  using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.challenge_votes for delete
  using (auth.uid() = user_id);
