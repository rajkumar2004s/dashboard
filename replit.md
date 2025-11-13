# NxtWave Workflow Dashboard

## Overview

NxtWave Workflow Dashboard is an internal contribution tracking and approval management system built for a company with three products (NIAT, Intensive, Academy). The application automates a multi-level approval workflow where employees submit contribution percentages across products and departments, which then flow through manager → director → CEO approval chains.

The system is built as a full-stack TypeScript application with React + Vite on the frontend and Express on the backend, using static seed data for demonstration purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, bundled using Vite

**Routing**: Wouter (lightweight client-side routing)

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- React Context API for authentication state (AuthContext)
- Local component state for forms

**UI Component Library**: 
- Shadcn/ui components based on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Material Design principles adapted for enterprise data applications
- No gradients policy - solid colors only as per design guidelines

**Design System**:
- Typography: Inter font family from Google Fonts
- Color scheme: Neutral base with role-specific badge colors
- Component spacing: Tailwind scale (4, 6, 8, 12, 16, 24)
- Layout: Responsive grid system with max-width constraints (max-w-7xl)

**Data Visualization**: Chart.js with react-chartjs-2 wrapper for analytics dashboards (Pie, Bar, Doughnut, Line charts)

**Notifications**: React-Toastify for user feedback on actions

### Backend Architecture

**Runtime**: Node.js with Express.js

**API Design**: RESTful endpoints with JSON payloads

**Request Handling**:
- JSON body parsing with raw body preservation for webhooks
- URL-encoded form support
- Request/response logging middleware

**Data Layer**: In-memory storage implementation (MemStorage) with interface-based design for future database migration

**Authentication**: Simple email-based lookup without passwords (demo/internal use)

**Code Organization**:
- `/server/routes.ts`: API endpoint definitions
- `/server/storage.ts`: Data access layer with IStorage interface
- `/shared/schema.ts`: Shared TypeScript types and Zod schemas
- `/shared/seedData.ts`: Static demo data shared between client and server

### Role-Based Access Control

**User Roles**:
1. **Employee**: Submit contribution forms
2. **Manager**: Approve/reject contributions for their department
3. **Director**: Approve/reject manager-approved contributions for their product
4. **CEO**: Final approval and view all analytics

**Workflow States**:
- `submitted_to_manager`: Initial submission
- `manager_approved`: Approved by department manager
- `director_approved`: Approved by product director
- `ceo_approved`: Final approval
- `rejected_by_manager/director/ceo`: Rejection at any level

**Route Protection**: Custom ProtectedRoute component validates user role and authentication status before rendering pages

### Database Design

**Schema**: Drizzle ORM with PostgreSQL dialect (configured but using in-memory storage for demo)

**Core Tables**:
- `products`: Product catalog (NIAT, Intensive, Academy)
- `departments`: Departments linked to products and managers
- `employees`: Employee records with department assignments
- `managers`: Manager records with department assignments
- `directors`: Directors assigned to products
- `ceo`: Single CEO record
- `employee_contributions`: Contribution records with status workflow tracking

**Relationships**:
- Departments belong to products and have one manager
- Employees belong to one department but can contribute across multiple products
- Directors oversee products
- Contributions link employees to products and departments with percentage allocations

### Form Validation

**Library**: Zod for runtime schema validation

**Validation Rules**:
- Email format validation on login
- Contribution percentages must total 100%
- Required department selection for each chosen product
- Status transition validation on approval/rejection actions

### Page Structure

**Public Routes**:
- `/login`: Email-based authentication

**Protected Routes**:
- `/employee/contribute`: Employee contribution form
- `/manager/dashboard`: Manager approval dashboard with table view
- `/director/dashboard`: Director approval dashboard with table view
- `/`: CEO analytics dashboard with comprehensive charts and metrics

**Dynamic Routing**: Role-based redirect from home page to appropriate dashboard

## External Dependencies

### Core Framework Dependencies
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Wouter**: Lightweight routing (alternative to React Router)
- **TypeScript**: Type safety across the stack

### UI Component Libraries
- **Radix UI**: Headless UI primitives (accordion, dialog, dropdown, select, checkbox, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant styling
- **tailwind-merge**: Merge Tailwind classes without conflicts
- **Lucide React**: Icon library

### Data & State Management
- **TanStack Query (React Query)**: Server state management, caching, and data fetching
- **React Hook Form**: Form state management
- **Zod**: Schema validation and type inference
- **@hookform/resolvers**: Zod integration with React Hook Form

### Visualization & Feedback
- **Chart.js**: Data visualization library
- **react-chartjs-2**: React wrapper for Chart.js
- **React-Toastify**: Toast notification system

### Backend Infrastructure
- **Express.js**: Web server framework
- **Drizzle ORM**: TypeScript ORM with PostgreSQL support
- **drizzle-kit**: Migration toolkit
- **@neondatabase/serverless**: Serverless PostgreSQL driver (Neon Database)

### Development Tools
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit integration
- **postcss & autoprefixer**: CSS processing

### Authentication (Configured but Simplified)
- **@supabase/supabase-js**: Authentication and database client (configured for future use, currently using simple email lookup)

### Notable Configuration
- **Database**: Configured for PostgreSQL via Drizzle, but currently using in-memory storage with seed data for demo purposes
- **Session Management**: Client-side localStorage for user session persistence
- **Environment Variables**: DATABASE_URL configured in drizzle.config.ts but not required for demo mode