create table if not exists public.user_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  tool_type text not null, -- 'mockup', 'banner', 'privacy', 'icon'
  data jsonb not null default '{}'::jsonb,
  preview_image_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast user queries
create index if not exists idx_user_projects_user_id on public.user_projects(user_id);
create index if not exists idx_user_projects_tool_type on public.user_projects(tool_type);

-- Row Level Security
alter table public.user_projects enable row level security;

-- Policy: Users can manage their own projects
drop policy if exists "Users can manage their own projects" on public.user_projects;
create policy "Users can manage their own projects"
on public.user_projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
