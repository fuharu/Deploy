-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 4.1 Users (Managed by Supabase Auth, but we can add profile table if needed)
-- For this app, we might want to store additional user profile info in a separate table or just use metadata.
-- Let's create a profiles table that links to auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  nickname text,
  university text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create a trigger to automatically create a profile entry when a new user signs up via Supabase Auth.
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4.2 Companies (企業)
create type company_status as enum ('Interested', 'Entry', 'ES_Submit', 'Interview', 'Offer', 'Rejected');

create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  url text,
  login_id text,
  login_password_encrypted text, -- Backend側で暗号化して保存
  status company_status default 'Interested',
  motivation_level int check (motivation_level >= 1 and motivation_level <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.companies enable row level security;

create policy "Users can view their own companies"
  on public.companies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own companies"
  on public.companies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own companies"
  on public.companies for update
  using (auth.uid() = user_id);

create policy "Users can delete their own companies"
  on public.companies for delete
  using (auth.uid() = user_id);


-- 4.3 Events (イベント)
create type event_type as enum ('Interview', 'Deadline', 'Seminar', 'Other');

create table public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  company_id uuid references public.companies on delete cascade, -- 企業削除時にイベントも削除するかは要件次第だが、一旦Cascade
  title text not null,
  type event_type default 'Other',
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  google_calendar_event_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;

create policy "Users can view their own events"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Users can insert their own events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);


-- 4.4 ES_Entries (エントリーシート)
create type es_status as enum ('Draft', 'Completed');

create table public.es_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null, -- RLSのためにuser_idも持たせる
  company_id uuid references public.companies on delete cascade,
  question text not null,
  answer text,
  max_chars int,
  status es_status default 'Draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.es_entries enable row level security;

create policy "Users can view their own es entries"
  on public.es_entries for select
  using (auth.uid() = user_id);

create policy "Users can manage their own es entries"
  on public.es_entries for all
  using (auth.uid() = user_id);


-- 4.5 Reflections (振り返り)
create table public.reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  event_id uuid references public.events on delete cascade unique, -- One-to-One
  content text,
  bad_points text,
  next_action text,
  score int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reflections enable row level security;

create policy "Users can manage their own reflections"
  on public.reflections for all
  using (auth.uid() = user_id);


-- 4.6 Tasks (Todo)
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  company_id uuid references public.companies on delete set null, -- 企業が消えてもタスクは残す（またはCascade）
  title text not null,
  due_date timestamp with time zone,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

create policy "Users can manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

