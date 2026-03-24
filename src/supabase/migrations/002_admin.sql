-- Add admin flag to profiles
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Allow admins to update any profile
create policy "Admins can update any profile"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to delete any profile
create policy "Admins can delete any profile"
  on public.profiles for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
