-- Challenge Ideas & Idea Voting System

-- Ideas submitted under challenges
create table if not exists public.challenge_ideas (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.challenge_ideas enable row level security;

create policy "Ideas viewable by all authenticated"
  on public.challenge_ideas for select using (auth.role() = 'authenticated');
create policy "Users can create ideas"
  on public.challenge_ideas for insert with check (auth.uid() = author_id);
create policy "Authors can update own ideas"
  on public.challenge_ideas for update using (auth.uid() = author_id);
create policy "Authors can delete own ideas"
  on public.challenge_ideas for delete using (auth.uid() = author_id);

create index idx_challenge_ideas_challenge on public.challenge_ideas(challenge_id, created_at desc);

-- Idea vote sessions (per challenge)
create table if not exists public.idea_vote_sessions (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null default 'Idea Vote',
  status text not null default 'active' check (status in ('active', 'closed')),
  show_on_challenge boolean not null default false,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.idea_vote_sessions enable row level security;

create policy "Idea vote sessions viewable by all authenticated"
  on public.idea_vote_sessions for select using (auth.role() = 'authenticated');
create policy "Admins manage idea vote sessions"
  on public.idea_vote_sessions for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create index idx_idea_vote_sessions_challenge on public.idea_vote_sessions(challenge_id);

-- Idea votes
create table if not exists public.idea_votes (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.idea_vote_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  idea_id uuid references public.challenge_ideas(id) on delete cascade not null,
  points integer not null default 0 check (points >= 0 and points <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, user_id, idea_id)
);

alter table public.idea_votes enable row level security;

create policy "Idea votes viewable by all authenticated"
  on public.idea_votes for select using (auth.role() = 'authenticated');
create policy "Users manage own idea votes"
  on public.idea_votes for insert with check (auth.uid() = user_id);
create policy "Users update own idea votes"
  on public.idea_votes for update using (auth.uid() = user_id);
create policy "Users delete own idea votes"
  on public.idea_votes for delete using (auth.uid() = user_id);

create index idx_idea_votes_session on public.idea_votes(session_id);

-- Allow comments on ideas
alter table public.comments drop constraint if exists comments_parent_type_check;
alter table public.comments add constraint comments_parent_type_check
  check (parent_type in ('challenge', 'story', 'news', 'brainstorm', 'idea'));
