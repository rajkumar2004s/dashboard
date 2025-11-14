# End-to-End Workflow: Employee → Manager → Director → CEO

## Overview
This document describes the complete workflow for employee contributions through the approval chain.

## Workflow Steps

### 1. Employee Submits Contribution
**Location:** `/employee/contribute`

**Process:**
- Employee selects one or more products
- Allocates contribution percentages (must total 100%)
- Submits the form

**Status After Submission:** `submitted_to_manager`

**What Happens:**
- Contribution is created in `employee_contributions` table
- Status is set to `submitted_to_manager`
- Employee can see their submission in their dashboard

---

### 2. Manager Reviews
**Location:** `/manager/dashboard`

**Process:**
- Manager sees all contributions with status `submitted_to_manager` from their department
- Manager can:
  - **Approve** → Status changes to `approved_by_manager`
  - **Reject** → Status changes to `rejected_by_manager` (requires rejection comment)

**Status After Approval:** `approved_by_manager`
**Status After Rejection:** `rejected_by_manager`

**What Happens:**
- If approved: Contribution moves to Director's queue
- If rejected: Employee is notified (can resubmit after fixing issues)

---

### 3. Director Reviews
**Location:** `/director/dashboard`

**Process:**
- Director sees all contributions with status `approved_by_manager` from their product
- Director can:
  - **Approve** → Status changes to `approved_by_director`
  - **Reject** → Status changes to `rejected_by_director` (requires rejection comment)

**Status After Approval:** `approved_by_director`
**Status After Rejection:** `rejected_by_director`

**What Happens:**
- If approved: Contribution moves to CEO's queue
- If rejected: Contribution is sent back to Manager (who can notify employee)

---

### 4. CEO Final Approval
**Location:** `/ceo/dashboard`

**Process:**
- CEO sees all contributions with status `approved_by_director`
- CEO can:
  - **Approve** → Status changes to `approved_by_ceo`
  - **Override** → Status changes to `overridden_by_ceo`

**Status After Approval:** `approved_by_ceo`
**Status After Override:** `overridden_by_ceo`

**What Happens:**
- Contribution is finalized
- Included in analytics and top contributors calculations

---

## Status Flow Diagram

```
Employee Submission
    ↓
submitted_to_manager
    ↓
Manager Review
    ├─→ approved_by_manager ──→ Director Review
    │                              ├─→ approved_by_director ──→ CEO Review
    │                              │                              ├─→ approved_by_ceo ✅
    │                              │                              └─→ overridden_by_ceo ✅
    │                              └─→ rejected_by_director ──→ Back to Manager
    └─→ rejected_by_manager ──→ Back to Employee
```

## Database Schema

### Contribution Status Enum
```sql
- submitted_to_manager
- approved_by_manager
- rejected_by_manager
- approved_by_director
- rejected_by_director
- approved_by_ceo
- overridden_by_ceo
```

### Key Fields
- `employee_id`: The employee who submitted
- `manager_id`: Manager who reviewed (if applicable)
- `director_id`: Director who reviewed (if applicable)
- `ceo_id`: CEO who reviewed (if applicable)
- `rejection_comment`: Reason for rejection (if rejected)
- `status`: Current status in workflow

## Testing the Flow

### Test Scenario 1: Happy Path
1. **Employee** (employee@nxtwave.com) submits contribution
   - Select products, allocate 100%
   - Submit → Status: `submitted_to_manager`

2. **Manager** (manager@nxtwave.com) reviews
   - See contribution in "Pending Review"
   - Click "Approve" → Status: `approved_by_manager`

3. **Director** (director@nxtwave.com) reviews
   - See contribution in "Awaiting Review"
   - Click "Approve" → Status: `approved_by_director`

4. **CEO** (ceo@nxtwave.com) reviews
   - See contribution in "Director Escalations"
   - Click "Approve" → Status: `approved_by_ceo` ✅

### Test Scenario 2: Rejection Flow
1. **Employee** submits contribution
2. **Manager** rejects with comment
   - Status: `rejected_by_manager`
   - Employee can see rejection reason and resubmit

### Test Scenario 3: Director Rejection
1. **Employee** submits → **Manager** approves
2. **Director** rejects with comment
   - Status: `rejected_by_director`
   - Manager is notified, can work with employee to fix

## Key Features

### Role-Based Access
- **Employee**: Can only see and submit their own contributions
- **Manager**: Can see all contributions from their department
- **Director**: Can see all contributions from their product
- **CEO**: Can see all contributions across the organization

### Analytics
- CEO dashboard shows:
  - Total contributions
  - Status breakdown
  - Product/department breakdowns
  - Top contributors
  - Monthly trends

### Notifications
- Toast notifications for all actions
- Status badges show current state
- Rejection comments provide feedback

## Files Modified

1. ✅ `client/src/pages/employee-form.tsx` - Employee submission form
2. ✅ `client/src/pages/manager-dashboard.tsx` - Manager review interface
3. ✅ `client/src/pages/director-dashboard.tsx` - Director review interface
4. ✅ `client/src/pages/ceo-dashboard.tsx` - CEO analytics and final approval
5. ✅ `client/src/services/contributionService.ts` - Service functions for CRUD operations
6. ✅ `client/src/contexts/AuthContext.tsx` - Authentication and user profile
7. ✅ `client/src/App.tsx` - Routing and protected routes

## Next Steps

1. Run the SQL fix script in Supabase (`supabase/fix_auth_policies.sql`)
2. Disable email confirmation in Supabase dashboard
3. Test the complete flow with different user roles
4. Verify analytics are calculating correctly
5. Check that top contributors function works

## Troubleshooting

### Contribution not showing in Manager dashboard?
- Check that employee's `department_id` matches manager's `department_id`
- Verify contribution status is `submitted_to_manager`

### Contribution not showing in Director dashboard?
- Check that contribution status is `approved_by_manager`
- Verify product_id matches director's product_id

### Contribution not showing in CEO dashboard?
- Check that contribution status is `approved_by_director`
- CEO should see all contributions regardless of product/department

### Status not updating?
- Check browser console for errors
- Verify RLS policies allow updates
- Check that user has correct role permissions

