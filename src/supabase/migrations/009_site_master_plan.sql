-- Site Master Plan: plant goals, progress, and learnings

create table if not exists public.site_plan_goals (
  id uuid default gen_random_uuid() primary key,
  plant_name text not null,
  title text not null,
  category text not null check (category in ('safety','quality','delivery','cost','people','growth')),
  target_value text not null,
  current_value text not null default '',
  status text not null default 'on_track' check (status in ('on_track','at_risk','behind','achieved')),
  priority integer not null default 3 check (priority between 1 and 5),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_plan_updates (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.site_plan_goals(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null not null,
  body text not null,
  update_type text not null default 'progress' check (update_type in ('progress','learning','blocker')),
  created_at timestamptz not null default now()
);

alter table public.site_plan_goals enable row level security;
alter table public.site_plan_updates enable row level security;

create policy "spg_select" on public.site_plan_goals for select using (auth.role() = 'authenticated');
create policy "spg_insert" on public.site_plan_goals for insert with check (auth.uid() = author_id);
create policy "spg_update" on public.site_plan_goals for update using (auth.uid() = author_id);
create policy "spg_delete" on public.site_plan_goals for delete using (auth.uid() = author_id);

create policy "spu_select" on public.site_plan_updates for select using (auth.role() = 'authenticated');
create policy "spu_insert" on public.site_plan_updates for insert with check (auth.uid() = author_id);

create index idx_site_plan_goals_plant on public.site_plan_goals(plant_name);
create index idx_site_plan_updates_goal on public.site_plan_updates(goal_id, created_at desc);
