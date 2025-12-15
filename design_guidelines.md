# Design Guidelines - SICI Sistema Integral de Control de Inventario

## Design Approach

**Design System Selection**: Enterprise Data-Driven Approach
Drawing from Carbon Design System (IBM) and Fluent Design principles optimized for data-heavy, productivity-focused applications. This system prioritizes information clarity, workflow efficiency, and enterprise-grade usability.

**Core Principle**: Function-first design where every element serves the operational workflow of inventory management professionals.

---

## Typography System

**Font Family**: 
- Primary: 'Inter' or 'IBM Plex Sans' (Google Fonts CDN)
- Monospace: 'IBM Plex Mono' for codes, SKUs, and numerical data

**Hierarchy**:
- Page Titles: text-2xl font-semibold (Dashboard, Gestión de Productos)
- Section Headers: text-lg font-medium 
- Card/Panel Titles: text-base font-medium
- Table Headers: text-sm font-semibold uppercase tracking-wide
- Body/Table Data: text-sm font-normal
- Labels: text-xs font-medium uppercase tracking-wider
- Metadata/Helper: text-xs font-normal

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: mb-8, gap-6
- Card spacing: p-6
- Form field spacing: space-y-4
- Table cell padding: px-4 py-3

**Grid System**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Form layouts: grid-cols-1 md:grid-cols-2 gap-6
- Table-heavy pages: Single column with full-width tables
- Filters/Actions bar: flex justify-between items-center mb-6

**Container Strategy**:
- Main content area: max-w-7xl mx-auto px-6
- Modals/Dialogs: max-w-2xl for forms, max-w-4xl for data previews
- Sidebars: w-64 fixed navigation

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header (h-16) with logo left, user profile/notifications right
- Search bar center for quick product/warehouse lookup
- Breadcrumbs below for location context

**Sidebar Navigation**:
- Persistent left sidebar (w-64) with collapsible sections
- Icon + label navigation items
- Active state with border-l-4 accent indicator
- Grouped by modules: Catálogos, Movimientos, Consultas, Reportes, Administración

### Dashboard Components
**Stat Cards** (4-column grid on desktop):
- Large number display (text-3xl font-bold)
- Label below (text-sm)
- Trend indicator (small arrow icon + percentage)
- Icon top-right corner
- Border-l-4 accent for quick visual categorization

**Alert Panel**:
- Prominent warning section for stock mínimo alerts
- List format with product code, name, current stock, minimum stock
- Action button per row ("Ver Detalles")

**Recent Activity Feed**:
- Timeline-style list of recent movements
- Icon indicators for movement type (entrada/salida/transferencia)
- Timestamp, user, brief description

### Data Tables
**Standard Table Structure**:
- Sticky header row with sort indicators
- Alternating row backgrounds (stripe pattern)
- Hover state on rows
- Compact cells: px-4 py-3
- Action column right-aligned (icons for edit/view/delete)
- Pagination controls bottom: "Mostrando 1-20 de 157 registros"
- Bulk selection checkboxes when applicable

**Table Controls Bar**:
- Search/filter inputs left
- View options (density, columns) center
- Export/Add buttons right
- Filters as dropdown chips that show active state

### Forms
**Form Layout**:
- Vertical labels (label above input)
- Input groups: grid-cols-2 gap-6 for side-by-side fields
- Required field indicator (asterisk)
- Helper text below inputs (text-xs)
- Validation messages inline

**Form Sections**:
- Grouped with border-l-4 accent and section title
- Collapsible sections for advanced options
- Sticky action bar at bottom (Save, Cancel buttons)

**Movement Registration Form** (Critical):
- Two-column layout: metadata left, product details right
- Product line items as editable table within form
- Running total calculator visible
- "Agregar Producto" button to add rows
- Each row: Product selector, Quantity input, Unit cost, Subtotal (calculated)

### Modals & Dialogs
**Sizes**:
- Confirmation dialogs: max-w-md
- Form modals: max-w-2xl
- Detail views: max-w-4xl

**Structure**:
- Header with title and close button
- Content area with p-6
- Footer with action buttons right-aligned

### Filters & Search
**Filter Panel**:
- Slide-out drawer or collapsible section
- Stacked filter controls
- Clear/Apply buttons at bottom
- Active filter chips displayed above table

**Search**:
- Debounced search input with search icon
- Dropdown suggestions for products/warehouses
- Recent searches history

### Reports
**Report Builder Interface**:
- Stepped form: Select report type → Configure parameters → Preview → Export
- Parameter inputs in card layout
- Preview area shows sample data
- Export options: PDF, Excel, CSV buttons

---

## Interaction Patterns

**Loading States**:
- Skeleton screens for tables and cards
- Spinner for actions (small, inline with button)
- Progress bar for file uploads/exports

**Empty States**:
- Centered icon + message + CTA button
- Used when no data exists or search returns nothing

**Notifications/Toast**:
- Top-right corner, stacked
- Auto-dismiss after 5 seconds
- Success, warning, error, info variants
- Dismissible via close icon

**Confirmation Patterns**:
- Modal dialogs for destructive actions
- Inline confirmation for reversible actions
- Two-step confirmation for critical operations (ajustes, eliminar movimientos)

---

## Role-Based UI Adjustments

- **Administrador**: Full access, all action buttons visible
- **Supervisor**: View all, edit limited, no delete critical records
- **Operador**: Create movements, view assigned warehouses only
- **Consulta**: Read-only, no action buttons, reports only

Implement by conditionally hiding/disabling buttons and menu items based on user role.

---

## Icons

**Library**: Heroicons (via CDN)
- Navigation icons: 24x24 outline
- Table action icons: 20x20 solid
- Status indicators: 16x16 solid
- Dashboard stat icons: 32x32 outline

---

## Images

**Dashboard Hero**: No large hero image needed - this is an enterprise dashboard
**Product Images**: Small thumbnail previews in tables/cards (64x64), larger in detail modals (256x256)
**Empty States**: Simple illustrative icons (not photos)
**User Avatars**: Circular, 32x32 in header, 40x40 in user menus

---

## Responsive Behavior

- **Desktop (≥1024px)**: Sidebar always visible, multi-column layouts
- **Tablet (768-1023px)**: Collapsible sidebar, 2-column forms become single column
- **Mobile (<768px)**: Hamburger menu, all tables horizontally scrollable or card-based view, stacked forms

---

## Accessibility

- All interactive elements meet 44x44px touch target minimum
- Form inputs have associated labels (not just placeholders)
- Table data readable without color dependency
- Keyboard navigation support for all workflows
- ARIA labels for icon-only buttons
- Focus indicators visible on all interactive elements