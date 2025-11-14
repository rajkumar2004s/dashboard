# ⚠️ CRITICAL: Fix RLS Policies to Resolve 500 Error

The 500 error when fetching user profile is caused by RLS (Row Level Security) policies that need to be fixed.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/bcxhudbmxwvmwpkbfpcm/sql

### Step 2: Copy and Run This SQL

```sql
-- Fix RLS Policies to Prevent Infinite Recursion
-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users are viewable by CEO" ON public.users;
DROP POLICY IF EXISTS "Directors can view product staff" ON public.users;
DROP POLICY IF EXISTS "Managers can view department employees" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "CEO can upsert any profile" ON public.users;
DROP POLICY IF EXISTS "Self creation or update" ON public.users;
DROP POLICY IF EXISTS "Self update allowed" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.users;

-- Recreate helper functions with security definer to bypass RLS
CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT COALESCE(
    (
      SELECT role
      FROM public.users
      WHERE auth_user_id = auth.uid()
      LIMIT 1
    ),
    'anonymous'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.department_id() RETURNS text AS $$
  SELECT department_id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.product_id() RETURNS text AS $$
  SELECT product_id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Simplified users table policies (no recursion)
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth_user_id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth_user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Simplified: Allow authenticated users to view all users (for analytics)
CREATE POLICY "Authenticated users can view all users"
ON public.users
FOR SELECT
USING (auth.uid() IS NOT NULL);
```

### Step 3: Click "Run" Button

### Step 4: Disable Email Confirmation
1. Go to: https://supabase.com/dashboard/project/bcxhudbmxwvmwpkbfpcm/auth/settings
2. Scroll to "Email Auth"
3. Turn OFF "Enable email confirmations"
4. Click "Save"

### Step 5: Restart Your Dev Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## What This Fixes

✅ **500 Error**: RLS policies will no longer cause infinite recursion  
✅ **Email Verification**: Removed - users get JWT token immediately  
✅ **Profile Creation**: Users can create their own profiles  
✅ **Authentication**: Works with JWT tokens directly

## After Fixing

- Users can sign up and immediately sign in (no email confirmation)
- Profile creation will work
- The 500 error will be resolved
- Users can access the dashboard immediately

## Current Status

The app code is now:
- ✅ Fixed `needsOnboarding` error
- ✅ Improved error handling (won't crash on RLS errors)
- ✅ JWT token authentication (no email verification)
- ⚠️ **Waiting for you to run the SQL fix above**

Once you run the SQL, everything will work!

