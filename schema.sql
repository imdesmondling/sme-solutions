-- SME Solutions database schema for Supabase
-- Run this in the Supabase SQL Editor on a new project.
-- Authentication, email verification, forgotten-password, and password-reset emails
-- are provided by Supabase Auth. Configure their email templates and redirect URLs
-- in Authentication > URL Configuration.

create type public.account_type as enum ('sme_owner', 'student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id text not null unique check (char_length(trim(user_id)) between 3 and 50),
  account_type public.account_type not null,
  display_name text not null check (char_length(trim(display_name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 160),
  description text not null check (char_length(trim(description)) between 10 and 5000),
  image_reference text,
  assigned_proposal_id uuid,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (assigned_proposal_id is null and assigned_at is null)
    or (assigned_proposal_id is not null and assigned_at is not null)
  )
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 160),
  description text not null check (char_length(trim(description)) between 10 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, student_id),
  unique (id, project_id)
);

-- A project can point only to a proposal submitted for that same project.
alter table public.projects
  add constraint projects_assigned_proposal_fkey
  foreign key (assigned_proposal_id, id)
  references public.proposals (id, project_id)
  on delete restrict;

create index projects_owner_created_at_idx on public.projects (owner_id, created_at desc);
create index projects_created_at_idx on public.projects (created_at desc);
create index proposals_project_created_at_idx on public.proposals (project_id, created_at desc);
create index proposals_student_created_at_idx on public.proposals (student_id, created_at desc);

-- Automatically create the public profile when a Supabase Auth user signs up.
-- Send user_id, display_name, and account_type in auth.signUp({ options: { data: ... } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, user_id, display_name, account_type)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'user_id'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    case lower(new.raw_user_meta_data ->> 'account_type')
      when 'sme_owner' then 'sme_owner'::public.account_type
      else 'student'::public.account_type
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.proposals enable row level security;

-- Profiles are visible to signed-in users so project and proposal tables can show names.
create policy "Authenticated users can view profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Students can browse requests; SME owners can also see their own requests.
create policy "Authenticated users can view projects"
  on public.projects for select to authenticated using (true);

create policy "SME owners can create their projects"
  on public.projects for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and account_type = 'sme_owner'
    )
  );

create policy "SME owners can update their projects"
  on public.projects for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "SME owners can delete their projects"
  on public.projects for delete to authenticated
  using (owner_id = auth.uid());

create policy "Authenticated users can view proposals"
  on public.proposals for select to authenticated using (true);

create policy "Students can submit proposals"
  on public.proposals for insert to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and account_type = 'student'
    )
  );

create policy "Students can update their proposals"
  on public.proposals for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "Students can delete their proposals"
  on public.proposals for delete to authenticated
  using (student_id = auth.uid());
