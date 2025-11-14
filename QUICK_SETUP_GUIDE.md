# Quick Setup Guide - Fix Authentication Issues

Follow these steps to fix the authentication and RLS policy issues.

## Step 1: Fix RLS Policies (CRITICAL - Fixes Infinite Recursion Error)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/bcxhudbmxwvmwpkbfpcm/sql
   - Or navigate: Dashboard → SQL Editor

2. **Copy the SQL Script**
   - Open the file: `supabase/fix_auth_policies.sql`
   - Copy ALL the contents (or see below)

3. **Paste and Run**
   - Paste the SQL into the SQL Editor
   - Click the **"Run"** button (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

**Expected Result:** The infinite recursion error should be fixed.

---

## Step 2: Disable Email Confirmation (CRITICAL - Fixes "Email not confirmed" Error)

1. **Go to Authentication Settings**
   - Navigate to: https://supabase.com/dashboard/project/bcxhudbmxwvmwpkbfpcm/auth/settings
   - Or: Dashboard → Authentication → Settings

2. **Find Email Auth Section**
   - Scroll down to the **"Email Auth"** section

3. **Disable Email Confirmations**
   - Find the toggle: **"Enable email confirmations"**
   - **Turn it OFF** (toggle should be gray/unchecked)
   - Click **"Save"** button at the bottom

**Expected Result:** Users can sign up and immediately sign in without email verification.

---

## Step 3: Verify Your Environment Variables

Make sure your `.env` file exists in `Nxtwave-Dashboard/` directory with:

```env
VITE_SUPABASE_URL=https://bcxhudbmxwvmwpkbfpcm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjeGh1ZGJteHd2bXdwa2JmcGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTAyODcsImV4cCI6MjA3ODU4NjI4N30.cyWF20ufpvXdcWzE8rMNlIsW-kLiRzSNRWUVvTeh0aw
SUPABASE_PROJECT_ID=bcxhudbmxwvmwpkbfpcm
```

---

## Step 4: Test the Application

1. **Start the Dev Server** (if not already running)
   ```bash
   cd Nxtwave-Dashboard
   npm run dev
   ```

2. **Open the App**
   - Open: http://localhost:5173 (or the URL shown in terminal)

3. **Test Sign Up**
   - Click "Sign up" or "Create Account"
   - Enter:
     - Name: Test User
     - Email: test@example.com
     - Password: test123456
   - Click "Create Account"
   - **You should be automatically signed in** (no email confirmation needed)

4. **Test Sign In**
   - Sign out
   - Sign in with the same credentials
   - Should work immediately

---

## Troubleshooting

### Still getting "infinite recursion" error?
- Make sure you ran Step 1 (SQL script)
- Check Supabase logs for any SQL errors
- Verify the policies were created: Dashboard → Authentication → Policies

### Still getting "Email not confirmed" error?
- Make sure you completed Step 2 (disabled email confirmations)
- Clear browser cache and try again
- Check that the toggle is actually OFF in Supabase dashboard

### "vite is not recognized" error?
- Run `npm install` in the `Nxtwave-Dashboard` directory
- Make sure you're in the correct directory

### Can't connect to Supabase?
- Verify `.env` file exists and has correct values
- Restart dev server after creating/updating `.env`
- Check that Supabase project is active

---

## What Was Fixed

✅ **RLS Policies**: Fixed infinite recursion by using `security definer` functions  
✅ **Email Confirmation**: Removed requirement for email verification  
✅ **Auto Profile Creation**: Users automatically get "employee" role on signup  
✅ **Simplified Auth Flow**: Sign up → Immediate access (no email confirmation)

---

## Next Steps After Setup

Once authentication is working:
1. Users can sign up and are automatically assigned "employee" role
2. Users can complete onboarding to change role/product/department
3. All authenticated users can view analytics and dashboard

