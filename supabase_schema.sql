-- Create Timers Table
create table public.timers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  tags text[] default '{}',
  image_url text,
  color text,
  repetitions int default 1,
  steps jsonb default '[]'::jsonb,
  "order" int default 0,
  is_preset boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (Security)
alter table public.timers enable row level security;

-- Policy: Users can only see their own timers
create policy "Users can view their own timers"
  on public.timers for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own timers
create policy "Users can insert their own timers"
  on public.timers for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own timers
create policy "Users can update their own timers"
  on public.timers for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own timers
create policy "Users can delete their own timers"
  on public.timers for delete
  using (auth.uid() = user_id);
