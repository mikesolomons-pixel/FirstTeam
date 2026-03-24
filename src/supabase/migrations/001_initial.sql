-- First Team: Plant Leadership Collaboration Platform
-- Run this migration in your Supabase SQL editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  avatar_url text,
  plant_name text not null default '',
  role text not null default '',
  joined_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Challenges
create table if not exists public.challenges (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  tags text[] not null default '{}',
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.challenges enable row level security;

create policy "Challenges viewable by all authenticated users"
  on public.challenges for select using (auth.role() = 'authenticated');

create policy "Users can create challenges"
  on public.challenges for insert with check (auth.uid() = author_id);

create policy "Authors can update own challenges"
  on public.challenges for update using (auth.uid() = author_id);

create policy "Authors can delete own challenges"
  on public.challenges for delete using (auth.uid() = author_id);

-- Stories
create table if not exists public.stories (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null default '',
  category text not null default 'best_practice' check (category in ('best_practice', 'win', 'lesson_learned', 'case_study')),
  tags text[] not null default '{}',
  plant_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stories enable row level security;

create policy "Stories viewable by all authenticated users"
  on public.stories for select using (auth.role() = 'authenticated');

create policy "Users can create stories"
  on public.stories for insert with check (auth.uid() = author_id);

create policy "Authors can update own stories"
  on public.stories for update using (auth.uid() = author_id);

create policy "Authors can delete own stories"
  on public.stories for delete using (auth.uid() = author_id);

-- News Items
create table if not exists public.news_items (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text,
  body text not null default '',
  type text not null default 'article' check (type in ('article', 'announcement', 'resource')),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.news_items enable row level security;

create policy "News viewable by all authenticated users"
  on public.news_items for select using (auth.role() = 'authenticated');

create policy "Users can create news"
  on public.news_items for insert with check (auth.uid() = author_id);

create policy "Authors can update own news"
  on public.news_items for update using (auth.uid() = author_id);

create policy "Authors can delete own news"
  on public.news_items for delete using (auth.uid() = author_id);

-- Brainstorm Sessions
create table if not exists public.brainstorm_sessions (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.brainstorm_sessions enable row level security;

create policy "Sessions viewable by all authenticated users"
  on public.brainstorm_sessions for select using (auth.role() = 'authenticated');

create policy "Users can create sessions"
  on public.brainstorm_sessions for insert with check (auth.uid() = author_id);

create policy "Authors can update own sessions"
  on public.brainstorm_sessions for update using (auth.uid() = author_id);

-- Ideas (sticky notes)
create table if not exists public.ideas (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.brainstorm_sessions(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null default '',
  color text not null default '#FEF3C7',
  position_x float not null default 0,
  position_y float not null default 0,
  votes int not null default 0,
  cluster_label text,
  created_at timestamptz not null default now()
);

alter table public.ideas enable row level security;

create policy "Ideas viewable by all authenticated users"
  on public.ideas for select using (auth.role() = 'authenticated');

create policy "Users can create ideas"
  on public.ideas for insert with check (auth.uid() = author_id);

create policy "Authors can update own ideas"
  on public.ideas for update using (auth.uid() = author_id);

create policy "Authors can delete own ideas"
  on public.ideas for delete using (auth.uid() = author_id);

-- Comments (unified for all content types)
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_type text not null check (parent_type in ('challenge', 'story', 'news', 'brainstorm')),
  parent_id uuid not null,
  body text not null default '',
  reply_to_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Comments viewable by all authenticated users"
  on public.comments for select using (auth.role() = 'authenticated');

create policy "Users can create comments"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "Authors can update own comments"
  on public.comments for update using (auth.uid() = author_id);

create policy "Authors can delete own comments"
  on public.comments for delete using (auth.uid() = author_id);

-- Reactions
create table if not exists public.reactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_type text not null,
  target_id uuid not null,
  emoji text not null check (emoji in ('wrench', 'lightbulb', 'hardhat', 'fire', 'thumbsup')),
  created_at timestamptz not null default now(),
  unique(user_id, target_type, target_id, emoji)
);

alter table public.reactions enable row level security;

create policy "Reactions viewable by all authenticated users"
  on public.reactions for select using (auth.role() = 'authenticated');

create policy "Users can create reactions"
  on public.reactions for insert with check (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.reactions for delete using (auth.uid() = user_id);

-- Idea Votes (track who voted on which idea)
create table if not exists public.idea_votes (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(idea_id, user_id)
);

alter table public.idea_votes enable row level security;

create policy "Votes viewable by all authenticated users"
  on public.idea_votes for select using (auth.role() = 'authenticated');

create policy "Users can vote"
  on public.idea_votes for insert with check (auth.uid() = user_id);

create policy "Users can unvote"
  on public.idea_votes for delete using (auth.uid() = user_id);

-- AI Summaries cache
create table if not exists public.ai_summaries (
  id uuid default gen_random_uuid() primary key,
  target_type text not null,
  target_id uuid not null,
  summary text not null,
  generated_at timestamptz not null default now(),
  unique(target_type, target_id)
);

alter table public.ai_summaries enable row level security;

create policy "Summaries viewable by all authenticated users"
  on public.ai_summaries for select using (auth.role() = 'authenticated');

create policy "Summaries can be created by authenticated users"
  on public.ai_summaries for insert with check (auth.role() = 'authenticated');

create policy "Summaries can be updated by authenticated users"
  on public.ai_summaries for update using (auth.role() = 'authenticated');

-- Indexes for performance
create index if not exists idx_challenges_status on public.challenges(status);
create index if not exists idx_challenges_created on public.challenges(created_at desc);
create index if not exists idx_stories_category on public.stories(category);
create index if not exists idx_stories_created on public.stories(created_at desc);
create index if not exists idx_news_created on public.news_items(created_at desc);
create index if not exists idx_news_pinned on public.news_items(pinned) where pinned = true;
create index if not exists idx_brainstorm_status on public.brainstorm_sessions(status);
create index if not exists idx_ideas_session on public.ideas(session_id);
create index if not exists idx_comments_parent on public.comments(parent_type, parent_id);
create index if not exists idx_reactions_target on public.reactions(target_type, target_id);
