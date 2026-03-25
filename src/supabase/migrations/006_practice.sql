-- Practice Communication: roleplay sessions and messages

create table if not exists public.practice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null,
  scenario_title text not null,
  scenario_prompt text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  feedback text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.practice_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.practice_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.practice_sessions enable row level security;
alter table public.practice_messages enable row level security;

create policy "Users manage own practice sessions"
  on public.practice_sessions for all using (auth.uid() = user_id);

create policy "Users manage own practice messages"
  on public.practice_messages for all
  using (session_id in (select id from public.practice_sessions where user_id = auth.uid()));

create index idx_practice_sessions_user on public.practice_sessions(user_id, created_at desc);
create index idx_practice_messages_session on public.practice_messages(session_id, created_at);
