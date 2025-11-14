# Authentication Fix Instructions

This guide will help you fix the authentication issues and simplify the signup process.

## Issues Fixed

1. **Infinite Recursion in RLS Policies** - Fixed by using `security definer` functions and simplifying policies
2. **Email Confirmation Requirement** - Needs to be disabled in Supabase dashboard
3. **Simplified Signup Flow** - Auto-creates user profile with default "employee" role

## Step 1: Fix RLS Policies

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (https://supabase.com/dashboard/project/_/sql)
3. Copy and paste the contents of `supabase/fix_auth_policies.sql`
4. Click **Run** to execute the script

This will:
- Drop the problematic policies causing infinite recursion
- Recreate helper functions with `security definer` to bypass RLS
- Create simplified policies that allow users to manage their own profiles

## Step 2: Disable Email Confirmation

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Email Auth** section
4. Find **"Enable email confirmations"** toggle
5. **Turn OFF** the toggle (disable email confirmations)
6. Click **Save**

This allows users to sign up and immediately sign in without needing to confirm their email.

## Step 3: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Click "Sign up" and create a new account
4. You should be able to sign in immediately without email confirmation
5. The user profile will be automatically created with "employee" role

## What Changed

### Code Changes:
- **AuthContext.tsx**: Simplified signup to auto-create profile with "employee" role
- **login.tsx**: Cleaned up merge conflicts, simplified UI
- **supabase.ts**: Removed merge conflicts

### Database Changes:
- RLS policies simplified to prevent infinite recursion
- Helper functions now use `security definer` to bypass RLS when checking roles

## Notes

- New users will be created with "employee" role by default
- Users can complete their profile during onboarding to change role/product/department
- The simplified RLS allows all authenticated users to view all users (for analytics)
- You can add role-based restrictions later if needed for production

## Troubleshooting

### Still getting "Email not confirmed" error?
- Make sure you disabled email confirmations in Supabase dashboard (Step 2)
- Clear your browser cache and try again
- Check that you're using the correct Supabase project

### Still getting "infinite recursion" error?
- Make sure you ran the `fix_auth_policies.sql` script (Step 1)
- Verify the policies were dropped and recreated correctly
- Check the Supabase logs for any errors

### User profile not created?
- Check browser console for errors
- Verify RLS policies allow users to insert their own profile
- Check that the `users` table exists and has the correct schema

