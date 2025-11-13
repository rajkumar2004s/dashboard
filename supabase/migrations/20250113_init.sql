-- Auto-generated migration combining schema and policy definitions for local dev

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Roles lookup table
create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null check (name in ('ceo', 'director', 'manager', 'employee')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.roles (name, description) values
  ('ceo', 'Executive administrator with full platform access'),
  ('director', 'Product director overseeing departments within a product'),
  ('manager', 'Department manager overseeing employees'),
  ('employee', 'Individual contributor')
on conflict (name) do nothing;

-- Products + departments
create table if not exists public.products (
  id text primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.departments (
  id text primary key,
  name text not null,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Users profile table
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  role text not null references public.roles (name),
  name text not null,
  email text not null unique,
  product_id text references public.products (id),
  department_id text references public.departments (id),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create unique index if not exists users_auth_user_id_idx on public.users (auth_user_id);

create or replace function public.handle_users_updated()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
before update on public.users
for each row execute procedure public.handle_users_updated();

-- Contribution enums + table
do $$
begin
  if not exists (select 1 from pg_type where typname = 'contribution_status') then
    create type public.contribution_status as enum (
      'submitted_to_manager',
      'approved_by_manager',
      'rejected_by_manager',
      'approved_by_director',
      'rejected_by_director',
      'approved_by_ceo',
      'overridden_by_ceo'
    );
  end if;
end
$$;

create table if not exists public.employee_contributions (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.users (id) on delete cascade,
  product_id text not null references public.products (id),
  department_id text not null references public.departments (id),
  contribution_percent integer not null check (contribution_percent between 0 and 100),
  status public.contribution_status not null default 'submitted_to_manager',
  rejection_comment text,
  manager_id uuid references public.users (id),
  director_id uuid references public.users (id),
  ceo_id uuid references public.users (id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create or replace function public.handle_contribution_updated()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists contribution_updated_at on public.employee_contributions;
create trigger contribution_updated_at
before update on public.employee_contributions
for each row execute procedure public.handle_contribution_updated();

-- Analytics view
create or replace view public.contribution_details as
select
  ec.id,
  ec.employee_id,
  u.name as employee_name,
  u.email as employee_email,
  ec.product_id,
  p.name as product_name,
  ec.department_id,
  d.name as department_name,
  ec.contribution_percent,
  ec.status,
  ec.rejection_comment,
  ec.manager_id,
  ec.director_id,
  ec.ceo_id,
  ec.created_at,
  ec.updated_at
from public.employee_contributions ec
left join public.users u on u.id = ec.employee_id
left join public.products p on p.id = ec.product_id
left join public.departments d on d.id = ec.department_id;

-- Analytics RPC
create or replace function public.get_top_contributors(limit_count integer default 5)
returns table (
  user_id uuid,
  contributor_name text,
  contribution_total integer,
  contribution_count integer
) as $$
  select
    ec.employee_id as user_id,
    coalesce(u.name, 'Unknown') as contributor_name,
    sum(ec.contribution_percent) as contribution_total,
    count(ec.id) as contribution_count
  from public.employee_contributions ec
  left join public.users u on u.id = ec.employee_id
  group by ec.employee_id, u.name
  order by sum(ec.contribution_percent) desc
  limit limit_count;
$$ language sql stable;

-- Row Level Security and policies
alter table public.users enable row level security;
alter table public.employee_contributions enable row level security;
alter table public.products enable row level security;
alter table public.departments enable row level security;

-- Users policies
drop policy if exists "Users are viewable by CEO" on public.users;
create policy "Users are viewable by CEO"
on public.users
for select
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'ceo'
  )
);

drop policy if exists "Directors can view product staff" on public.users;
create policy "Directors can view product staff"
on public.users
for select
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'director'
      and me.product_id = users.product_id
  )
  or exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'ceo'
  )
);

drop policy if exists "Managers can view department employees" on public.users;
create policy "Managers can view department employees"
on public.users
for select
using (
  role = 'employee'
  and exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'manager'
      and me.department_id = users.department_id
  )
);

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users
for select
using (auth_user_id = auth.uid());

drop policy if exists "CEO can upsert any profile" on public.users;
create policy "CEO can upsert any profile"
on public.users
for all
using (
  exists(
    select 1 from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'ceo'
  )
)
with check (true);

drop policy if exists "Self creation or update" on public.users;
create policy "Self creation or update"
on public.users
for insert
with check (auth_user_id = auth.uid());

drop policy if exists "Self update allowed" on public.users;
create policy "Self update allowed"
on public.users
for update
using (auth_user_id = auth.uid());

-- Products/Departments read policies
drop policy if exists "Everyone can read products" on public.products;
create policy "Everyone can read products"
on public.products
for select
using (true);

drop policy if exists "Everyone can read departments" on public.departments;
create policy "Everyone can read departments"
on public.departments
for select
using (true);

-- Contribution policies
drop policy if exists "Employees can view their submissions" on public.employee_contributions;
create policy "Employees can view their submissions"
on public.employee_contributions
for select
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'employee'
      and me.id = employee_id
  )
);

drop policy if exists "Employees can insert their submissions" on public.employee_contributions;
create policy "Employees can insert their submissions"
on public.employee_contributions
for insert
with check (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'employee'
      and me.id = employee_id
  )
);

drop policy if exists "Employees can edit submissions before approval" on public.employee_contributions;
create policy "Employees can edit submissions before approval"
on public.employee_contributions
for update
using (
  status = 'submitted_to_manager'
  and exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'employee'
      and me.id = employee_id
  )
);

drop policy if exists "Managers can review their department submissions" on public.employee_contributions;
create policy "Managers can review their department submissions"
on public.employee_contributions
for select
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'manager'
      and me.department_id = department_id
  )
);

drop policy if exists "Managers can update statuses" on public.employee_contributions;
create policy "Managers can update statuses"
on public.employee_contributions
for update
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'manager'
      and me.department_id = department_id
  )
)
with check (true);

drop policy if exists "Directors can review product submissions" on public.employee_contributions;
create policy "Directors can review product submissions"
on public.employee_contributions
for select
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'director'
      and me.product_id = product_id
  )
);

drop policy if exists "Directors can approve statuses" on public.employee_contributions;
create policy "Directors can approve statuses"
on public.employee_contributions
for update
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'director'
      and me.product_id = product_id
  )
)
with check (true);

drop policy if exists "CEO has full visibility" on public.employee_contributions;
create policy "CEO has full visibility"
on public.employee_contributions
for select
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'ceo'
  )
);

drop policy if exists "CEO can override" on public.employee_contributions;
create policy "CEO can override"
on public.employee_contributions
for update
using (
  exists(
    select 1
    from public.users me
    where me.auth_user_id = auth.uid()
      and me.role = 'ceo'
  )
)
with check (true);

