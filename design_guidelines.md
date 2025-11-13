# NxtWave Workflow Dashboard - Design Guidelines

## Design Approach
**System:** Material Design adapted for enterprise data applications
**Rationale:** Information-dense dashboard requiring clear hierarchy, consistent patterns, and professional aesthetic for multi-role workflow management.

## Core Design Principles
1. **Clarity First:** Every element serves data comprehension
2. **Role Distinction:** Visual consistency across roles with clear context indicators
3. **Workflow Transparency:** Status states always visible
4. **No Gradients:** Professional solid color palette only

## Typography
- **Primary Font:** Inter (Google Fonts)
- **Headings:** 
  - H1: 2xl, font-semibold (Dashboard titles)
  - H2: xl, font-semibold (Section headers)
  - H3: lg, font-medium (Card titles)
- **Body:** Base size, font-normal
- **Data/Numbers:** Base size, font-mono for metrics, font-semibold for emphasis

## Layout System
**Spacing Units:** Tailwind scale - primarily use 4, 6, 8, 12, 16, 24
- Component padding: p-6
- Card spacing: gap-6
- Section margins: mb-8
- Page containers: max-w-7xl mx-auto px-6

## Component Library

### Navigation
- **Top Bar:** Fixed header with NxtWave logo, role indicator badge, user dropdown
- **Role Badge:** Pill-shaped badge showing current role (Employee/Manager/Director/CEO)
- **Logout:** Icon button in top-right

### Dashboard Layout
- **Grid System:** Grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for cards
- **Sidebar:** None (top navigation only)
- **Content Area:** Full width with max-w-7xl constraint

### Cards
- **Structure:** White background, rounded-lg, shadow-sm, p-6
- **Header:** Flex justify-between with title and action button
- **Borders:** border border-gray-200 for subtle definition
- **Hover:** shadow-md transition (for interactive cards)

### Forms (Employee Contribution)
- **Layout:** Single column, max-w-2xl centered
- **Product Selection:** Checkbox group with labels, gap-4
- **Department Dropdowns:** Full width select elements per product
- **Percentage Inputs:** Number inputs with % suffix, validation indicator
- **Total Display:** Prominent card showing running total with success/error state
- **Submit Button:** Full width, primary action, disabled state when total ≠ 100%

### Data Tables (Manager/Director Dashboards)
- **Table Style:** Full width, striped rows (odd:bg-gray-50)
- **Headers:** bg-gray-100, font-semibold, text-sm uppercase tracking-wide
- **Row Actions:** Inline approve/reject buttons with icon + text
- **Status Badges:** Pill-shaped, solid background, white text, size-sm
- **Comment Input:** Inline textarea for rejection reasons, border-2 when active

### Charts (CEO Dashboard)
- **Container:** Grid lg:grid-cols-2 gap-8
- **Chart Cards:** White card, p-6, min-h-80
- **Chart Titles:** mb-4, text-lg font-semibold
- **Chart Types:**
  - Pie Chart: Product-wise contributions
  - Bar Chart: Department-wise breakdown (vertical bars)
  - Doughnut Chart: Approval status distribution
  - Line Chart: Monthly trend with solid line, point markers
- **Color Palette:** Solid colors only - blue-600, green-600, orange-500, purple-600, red-600, teal-600

### Status Indicators
- **Submitted:** blue-100 background, blue-800 text
- **Approved by Manager:** green-100 background, green-800 text
- **Approved by Director:** purple-100 background, purple-800 text
- **Rejected:** red-100 background, red-800 text

### Buttons
- **Primary:** bg-blue-600 text-white, px-6 py-2.5, rounded-md, hover:bg-blue-700
- **Secondary:** bg-gray-100 text-gray-800, hover:bg-gray-200
- **Approve:** bg-green-600 text-white, hover:bg-green-700
- **Reject:** bg-red-600 text-white, hover:bg-red-700
- **Icon Buttons:** Consistent size, p-2, rounded

### Toastify Notifications
- **Success:** Green solid background
- **Error:** Red solid background
- **Position:** top-right
- **Auto-close:** 4000ms

## Page-Specific Guidelines

### Login Page
- Centered card (max-w-md), NxtWave logo at top, email/password fields, full-width login button

### Employee Form Page
- Centered layout, clear instructions at top, visual total tracker, disabled submit until valid

### Manager/Director Dashboards
- Summary cards at top (pending count, approved count)
- Filterable table below
- Action buttons prominently placed per row

### CEO Dashboard
- 4-card metric summary at top (total contributions, pending approvals, etc.)
- Chart grid below
- Top contributors table at bottom

## Accessibility
- Proper label associations for all form inputs
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus visible states (ring-2 ring-blue-500)
- Sufficient contrast ratios (WCAG AA minimum)

## Images
**No hero images required.** This is a data-focused internal application. Use NxtWave logo in navigation only.