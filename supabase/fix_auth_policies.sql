-- =====================================================================
-- Fix RLS Policies to Prevent Infinite Recursion
-- Run this script in your Supabase SQL Editor
-- =====================================================================

-- First, drop all existing policies on users table
drop policy if exists "Users are viewable by CEO" on public.users;
drop policy if exists "Directors can view product staff" on public.users;
drop policy if exists "Managers can view department employees" on public.users;
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "CEO can upsert any profile" on public.users;
drop policy if exists "Self creation or update" on public.users;
drop policy if exists "Self update allowed" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Authenticated users can view all users" on public.users;

-- Recreate helper functions with security definer to bypass RLS
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

-- Simplified users table policies (no recursion)
-- Allow users to view their own profile
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

-- Simplified: Allow authenticated users to view all users (for analytics)
-- You can add role-based restrictions later if needed
create policy "Authenticated users can view all users"
on public.users
for select
using (auth.uid() is not null);

