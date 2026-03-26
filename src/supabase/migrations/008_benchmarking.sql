-- Benchmarking: plant metrics comparison

create table if not exists public.benchmark_entries (
  id uuid default gen_random_uuid() primary key,
  plant_name text not null,
  metric_key text not null,
  period text not null,
  value numeric not null,
  target numeric,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(plant_name, metric_key, period)
);

alter table public.benchmark_entries enable row level security;
create policy "be_select" on public.benchmark_entries for select using (auth.role() = 'authenticated');
create policy "be_insert" on public.benchmark_entries for insert with check (auth.uid() = author_id);
create policy "be_update" on public.benchmark_entries for update using (auth.uid() = author_id);
create index idx_benchmark_entries_period on public.benchmark_entries(period, metric_key);

create table if not exists public.benchmark_comments (
  id uuid default gen_random_uuid() primary key,
  plant_name text not null,
  metric_key text not null,
  period text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  comment_type text not null default 'general' check (comment_type in ('uplift', 'downlift', 'general')),
  created_at timestamptz not null default now()
);

alter table public.benchmark_comments enable row level security;
create policy "bc_select" on public.benchmark_comments for select using (auth.role() = 'authenticated');
create policy "bc_insert" on public.benchmark_comments for insert with check (auth.uid() = author_id);
create index idx_benchmark_comments_lookup on public.benchmark_comments(metric_key, period);
