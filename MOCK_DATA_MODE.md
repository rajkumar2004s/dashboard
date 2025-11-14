# Mock Data Mode - No Authentication Required

## ✅ Changes Made

### 1. **Removed Authentication**
- Removed Supabase authentication dependencies
- Removed login/signup pages
- Removed onboarding requirements
- All authentication replaced with mock user selection

### 2. **Created Mock Data**
- **Sample Users:**
  - 1 CEO: Sarah Johnson
  - 3 Directors: Michael Chen, Emily Rodriguez, David Kim
  - 4 Managers: James Wilson, Lisa Anderson, Robert Taylor, Jennifer Martinez
  - 7 Employees: Alex Thompson, Maria Garcia, John Smith, Sophie Brown, Daniel Lee, Emma Davis, Chris Miller

- **Sample Products:**
  - Cloud Platform
  - Mobile App
  - Web Dashboard

- **Sample Departments:**
  - Engineering, Design, QA (Cloud Platform)
  - iOS Development, Android Development (Mobile App)
  - Frontend, Backend (Web Dashboard)

- **Sample Contributions:**
  - 7 contributions in various states (submitted, approved, rejected)
  - Demonstrates full workflow from employee to CEO

### 3. **Updated Services**
All services now use mock data instead of Supabase:
- `contributionService.ts` - Uses mock contributions
- `catalogService.ts` - Uses mock products/departments
- `userService.ts` - Uses mock users
- `managementService.ts` - Mock user creation

### 4. **New Components**
- **UserSelector** - Dropdown to switch between different user roles
- Shows all available users with their roles
- Persists selection in localStorage

### 5. **Updated AuthContext**
- Simplified to use mock users
- No session management
- `currentUser` instead of `profile` (with alias for compatibility)
- `allUsers` array for user selection

## 🎯 How to Use

### Switching Users
1. **User Selector** appears at the top of every page
2. Select any user from the dropdown
3. Dashboard automatically updates based on selected user's role
4. Selection persists in localStorage

### Available Users

#### CEO
- **Sarah Johnson** - Full access to all contributions and analytics

#### Directors
- **Michael Chen** - Cloud Platform director
- **Emily Rodriguez** - Mobile App director
- **David Kim** - Web Dashboard director

#### Managers
- **James Wilson** - Engineering manager (Cloud Platform)
- **Lisa Anderson** - Design manager (Cloud Platform)
- **Robert Taylor** - iOS Development manager (Mobile App)
- **Jennifer Martinez** - Frontend manager (Web Dashboard)

#### Employees
- **Alex Thompson** - Engineering employee (Cloud Platform)
- **Maria Garcia** - Engineering employee (Cloud Platform)
- **John Smith** - Design employee (Cloud Platform)
- **Sophie Brown** - iOS Development employee (Mobile App)
- **Daniel Lee** - Android Development employee (Mobile App)
- **Emma Davis** - Frontend employee (Web Dashboard)
- **Chris Miller** - Backend employee (Web Dashboard)

## 📊 Sample Data

### Contributions Status
- **Submitted to Manager**: 2 contributions (Alex, Maria)
- **Approved by Manager**: 1 contribution (John)
- **Approved by Director**: 2 contributions (Sophie, Daniel)
- **Approved by CEO**: 1 contribution (Emma)
- **Rejected by Manager**: 1 contribution (Chris)

### Workflow Demonstration
1. Select an **Employee** → Submit contribution
2. Switch to their **Manager** → Review and approve/reject
3. Switch to **Director** → Review manager-approved contributions
4. Switch to **CEO** → See all contributions and analytics

## 🔧 Technical Details

### Files Modified
- `client/src/contexts/AuthContext.tsx` - Mock auth context
- `client/src/services/contributionService.ts` - Mock contributions
- `client/src/services/catalogService.ts` - Mock products/departments
- `client/src/services/userService.ts` - Mock users
- `client/src/services/managementService.ts` - Mock user creation
- `client/src/App.tsx` - Removed login routes, added UserSelector
- `client/src/components/Navbar.tsx` - Simplified for mock mode
- All dashboard pages - Updated to use `currentUser`

### Files Created
- `client/src/data/mockData.ts` - All mock data
- `client/src/components/UserSelector.tsx` - User selection component

### Files No Longer Used
- `client/src/pages/login.tsx` - Not needed (but kept for reference)
- `client/src/pages/onboarding.tsx` - Not needed (but kept for reference)

## 🚀 Benefits

1. **No Setup Required** - No Supabase configuration needed
2. **Instant Testing** - Switch users instantly
3. **Full Workflow** - Complete end-to-end flow with sample data
4. **Easy Demo** - Perfect for demonstrations
5. **No Database** - Everything runs in memory

## 📝 Notes

- All data is stored in memory (resets on page refresh)
- User selection persists in localStorage
- Contributions can be created, approved, rejected
- Analytics work with sample data
- Top contributors calculated from approved contributions

## 🔄 Switching Back to Real Auth

To restore authentication:
1. Restore original `AuthContext.tsx` from git
2. Restore original service files
3. Re-enable login routes in `App.tsx`
4. Remove `UserSelector` component
5. Restore Supabase configuration

