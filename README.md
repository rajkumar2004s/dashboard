## NxtWave Workflow Dashboard

Full-stack internal workflow and analytics portal for NxtWave built with React, TypeScript, Vite, Tailwind, TanStack Query, and Supabase. The application delivers employee contribution tracking, multi-level approvals (Employee → Manager → Director → CEO), and executive analytics powered by Chart.js.

### Key Features
- Supabase Auth email/password onboarding with role assignment wizard.
- Role-based access control enforced through Supabase row-level security and client-side guards.
- Management consoles for managers/directors to approve contributions and manage teams.
- CEO dashboard with product/department/status analytics, trend visualizations, and override controls.
- Mock seed data plus Supabase SQL schema, policies, and seed scripts for quick provisioning.

### Repo Layout
```
client/                # React + Vite application
  src/
    components/        # UI primitives and shared layout
    contexts/          # Auth context backed by Supabase session
    data/              # Static demo datasets
    pages/             # Role dashboards + onboarding + auth
    services/          # Supabase wrappers for domain actions
    types/             # Supabase DB contract + domain helpers
supabase/
  schema.sql           # Database tables, enums, and RPC functions
  policies.sql         # Row-level security policies
  seed.sql             # Demo data aligned with product brief
  functions/           # Edge functions (create-managed-user)
env.example            # Required environment variables
package.json           # Vite scripts and dependencies
vite.config.ts         # Client-only Vite config (no Express)
```

### Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**  
   Copy `.env.example` to `.env` (or `.env.local`) and ensure the Supabase URL, anon key, and project id are set.

3. **Run development servers**
   ```bash
   npm run dev
   ```
   Vite runs on `http://localhost:5173` and communicates directly with Supabase through the browser SDK.

4. **Type checking**
   ```bash
   npm run check
   ```

### Supabase Setup
1. Create a new Supabase project and load the schema:
   ```bash
   supabase db push supabase/schema.sql
   supabase db push supabase/policies.sql
   supabase db push supabase/seed.sql
   ```

2. Deploy the Edge Function to enable manager/employee invitations:
   ```bash
   supabase functions deploy create-managed-user --no-verify-jwt
   ```
   Configure the function URL in Supabase dashboard (Auth → Settings) if you prefer HTTP call restrictions.

3. (Optional) Generate typed definitions once the database is provisioned:
   ```bash
   SUPABASE_PROJECT_ID=<project-id> npm run supabase:types
   ```

### Production Build
```bash
npm run build   # Generates Vite build in client/dist
npm run preview # Preview the static build locally
```

Deploy the `client/dist` folder to your hosting provider (e.g., Vercel, Netlify). All Supabase calls are executed client-side via the browser SDK; ensure the required Supabase environment variables are injected during build/deploy.

### Authentication Matrix
| Role      | Capabilities                                                                 |
|-----------|-------------------------------------------------------------------------------|
| CEO       | Full visibility, override approvals, create directors/managers/employees      |
| Director  | Manage managers in assigned product, approve escalations, view product data   |
| Manager   | Manage department employees, approve/reject contributions                     |
| Employee  | Submit/edit personal contributions, track status                              |

Refer to `supabase/policies.sql` for exact row-level security logic and to `client/src/services/` for corresponding client helpers.

