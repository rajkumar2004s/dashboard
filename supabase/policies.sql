-- =====================================================================
-- Row Level Security policies for NxtWave Workflow Platform
-- =====================================================================

alter table public.users enable row level security;
alter table public.employee_contributions enable row level security;
alter table public.products enable row level security;
alter table public.departments enable row level security;

-- -------------------------------------------------
-- Helper functions (using security definer to bypass RLS)
-- -------------------------------------------------
create or replace function auth.role() returns text as $$
  select coalesce(
    (
      select role
      from public.users
      where auth_user_id = auth.uid()
      limit 1
    ),
    'anonymous'
  );
$$ language sql stable security definer;

create or replace function auth.user_id() returns uuid as $$
  select auth.uid();
$$ language sql stable;

create or replace function auth.department_id() returns text as $$
  select department_id
  from public.users
  where auth_user_id = auth.uid()
  limit 1;
$$ language sql stable security definer;

create or replace function auth.product_id() returns text as $$
  select product_id
  from public.users
  where auth_user_id = auth.uid()
  limit 1;
$$ language sql stable security definer;

-- -------------------------------------------------
-- Users table policies (simplified to prevent recursion)
-- -------------------------------------------------
-- Drop existing policies if they exist
drop policy if exists "Users are viewable by CEO" on public.users;
drop policy if exists "Directors can view product staff" on public.users;
drop policy if exists "Managers can view department employees" on public.users;
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "CEO can upsert any profile" on public.users;
drop policy if exists "Self creation or update" on public.users;
drop policy if exists "Self update allowed" on public.users;

-- Allow users to view their own profile (no recursion)
create policy "Users can view own profile"
on public.users
for select
using (auth_user_id = auth.uid());

-- Allow users to insert their own profile
create policy "Users can insert own profile"
on public.users
for insert
with check (auth_user_id = auth.uid());

-- Allow users to update their own profile
create policy "Users can update own profile"
on public.users
for update
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

-- Simplified: Allow authenticated users to view all users (for now)
-- You can add role-based restrictions later if needed
create policy "Authenticated users can view all users"
on public.users
for select
using (auth.uid() is not null);

-- -------------------------------------------------
-- Products & Departments (read-only for non-CEO)
-- -------------------------------------------------
create policy "Everyone can read products"
on public.products
for select
using (true);

create policy "Everyone can read departments"
on public.departments
for select
using (true);

-- -------------------------------------------------
-- Employee Contributions
-- -------------------------------------------------
create policy "Employees can view their submissions"
on public.employee_contributions
for select
using (
  auth.role() = 'employee'
  and employee_id = (
    select id from public.users where auth_user_id = auth.user_id()
  )
);

create policy "Employees can insert their submissions"
on public.employee_contributions
for insert
with check (
  auth.role() = 'employee'
  and employee_id = (
    select id from public.users where auth_user_id = auth.user_id()
  )
);

create policy "Employees can edit submissions before approval"
on public.employee_contributions
for update
using (
  auth.role() = 'employee'
  and employee_id = (
    select id from public.users where auth_user_id = auth.user_id()
  )
  and status = 'submitted_to_manager'
);

create policy "Managers can review their department submissions"
on public.employee_contributions
for select
using (
  auth.role() = 'manager'
  and department_id = auth.department_id()
);

create policy "Managers can update statuses"
on public.employee_contributions
for update
using (
  auth.role() = 'manager'
  and department_id = auth.department_id()
)
with check (true);

create policy "Directors can review product submissions"
on public.employee_contributions
for select
using (
  auth.role() = 'director'
  and product_id = auth.product_id()
);

create policy "Directors can approve statuses"
on public.employee_contributions
for update
using (
  auth.role() = 'director'
  and product_id = auth.product_id()
)
with check (true);

create policy "CEO has full visibility"
on public.employee_contributions
for select
using (auth.role() = 'ceo');

create policy "CEO can override"
on public.employee_contributions
for update
using (auth.role() = 'ceo')
with check (true);

