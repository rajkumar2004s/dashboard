-- =====================================================================
-- Supabase Schema for NxtWave Workflow Platform
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -------------------------------------------------
-- Roles
-- -------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null check (name in ('ceo', 'director', 'manager', 'employee')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.roles (name, description)
values
  ('ceo', 'Executive administrator with full platform access'),
  ('director', 'Product director overseeing departments within a product'),
  ('manager', 'Department manager overseeing employees'),
  ('employee', 'Individual contributor')
on conflict (name) do nothing;

-- -------------------------------------------------
-- Products
-- -------------------------------------------------
create table if not exists public.products (
  id text primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- -------------------------------------------------
-- Departments
-- -------------------------------------------------
create table if not exists public.departments (
  id text primary key,
  name text not null,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- -------------------------------------------------
-- Users (application-level profile)
-- -------------------------------------------------
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

create function public.handle_users_updated()
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

-- -------------------------------------------------
-- Employee Contributions
-- -------------------------------------------------
create type public.contribution_status as enum (
  'submitted_to_manager',
  'approved_by_manager',
  'rejected_by_manager',
  'approved_by_director',
  'rejected_by_director',
  'approved_by_ceo',
  'overridden_by_ceo'
);

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

create function public.handle_contribution_updated()
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

-- -------------------------------------------------
-- Analytics View
-- -------------------------------------------------
create view public.contribution_details as
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

-- -------------------------------------------------
-- Analytics RPC
-- -------------------------------------------------
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

