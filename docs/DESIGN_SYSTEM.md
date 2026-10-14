# Campus Companion Design System

"Your Campus. One Companion."

---

## 1. Design Philosophy

Campus Companion is designed with clarity, accessibility, and modern visual polish at its center. The platform accommodates two distinct user contexts:
1. **Student Companion**: Designed for fast, friction-free daily tasks between classes, high readability in outdoor sunlight, and mobile-first responsive interactions.
2. **Administrative Portal**: Designed for high data density, structured CRUD workflows, bulk operations, referential integrity feedback, and conflict avoidance without visual clutter.

### Core Principles
- **Clarity and High Contrast**: Crisp typography with WCAG AA compliance (4.5:1 for body copy, 3:1 for large headings and UI icons).
- **Tactile Feedback**: Interactive elements feature smooth micro-animations, clear active states, and explicit keyboard focus rings.
- **Cognitive Simplicity**: Critical daily tasks (checking next class, viewing map directions, scanning urgent circulars) are one tap away from the home dashboard.
- **Safe Administrative Mutations**: High-risk mutations require explicit confirmation modals or safety text verification ("DELETE" or "RESET"). All deletions offer a persistent undo window.
- **Local Autonomy**: All data lives locally with instant optimistic responses and localStorage persistence.

---

## 2. Color Palette

### Primary Palette (Campus Navy & Blue)
- `primary-900` (`#0F1E36`): Dominant structural color for desktop sidebar, dark headers, and modal backdrops.
- `primary-800` (`#1A2E4C`): Interactive hover states on dark elements.
- `primary-700` (`#26436E`): Secondary container accents and borders.
- `primary-600` (`#3B82F6`): Primary call to action, active navigation tabs, interactive links.
- `primary-50` (`#EFF6FF`): Subtle selection highlights, active filter pills, timetable highlight cards.

### Neutrals and Surfaces
- `canvas` (`#F8FAFC`): Main application background (Slate-50 tone).
- `surface` (`#FFFFFF`): Pure white content cards, modal sheets, and dropdown panels.
- `border` (`#E2E8F0`): Clean subtle boundary dividers and input borders.

### Text Contrast
- `text-primary` (`#0F172A`): Headings, primary labels, and titles (contrast ratio > 12:1 against white).
- `text-secondary` (`#475569`): Body descriptions, secondary metrics, subtitles (contrast ratio > 5.5:1).
- `text-muted` (`#94A3B8`): Timestamps, inactive tabs, placeholder text, search hints.

### Semantic Status
- `status-success` (`#10B981`): Confirmed registrations, open facilities, active memberships, published content.
- `status-warning` (`#F59E0B`): Facilities closing soon, approaching deadlines, draft records, scheduled circulars.
- `status-error` (`#EF4444`): Closed facilities, capacity full events, cancelled events, suspended students, validation errors.
- `status-info` (`#3B82F6`): Neutral circulars, scheduled updates, system advisories.

---

## 3. Typography Scale

Font Family: **Inter** (`sans-serif`), loaded via Google Fonts with weights 400 (Regular), 500 (Medium), 600 (Semi-Bold), and 700 (Bold).

| Token | Size / Line Height | Tracking | Recommended Use |
| :--- | :--- | :--- | :--- |
| `display` | 32px / 38px | -0.02em | Hero headers, login greetings |
| `h1` | 24px / 30px | -0.015em | Top-level page headers, modal titles |
| `h2` | 20px / 26px | -0.01em | Section titles, dashboard cards |
| `h3` | 16px / 22px | -0.005em | Subsections, card headings, faculty names |
| `body` | 15px / 22px | normal | Default body paragraphs, announcement text |
| `small` | 13.5px / 19px | normal | Secondary descriptions, timetable meta |
| `caption` | 12px / 16px | +0.01em | Timestamps, tags, badges, input hints |

---

## 4. Spacing and Spatial System

Based on a strict 4px grid system:
- `space-1` (4px): Micro gap between badge icon and label.
- `space-2` (8px): Spacing inside compact buttons, tag chips.
- `space-3` (12px): Padding inside search inputs, table rows.
- `space-4` (16px): Standard card internal padding on mobile, item grid gap.
- `space-6` (24px): Standard card internal padding on desktop, layout row gap.
- `space-8` (32px): Section separation on primary views.

### Border Radii
- `rounded-button`: 10px (buttons, input fields, filter chips)
- `rounded-card`: 14px (content cards, timetable items)
- `rounded-modal`: 18px (dialog sheets, command palette)

### Elevation & Shadows
- `shadow-xs`: Subtle card hover feedback (`0 1px 2px rgba(0, 0, 0, 0.05)`).
- `shadow-card`: Default content elevation (`0 2px 4px rgba(15, 30, 54, 0.06)`).
- `shadow-overlay`: Floating bottom nav, sticky top bar (`0 4px 12px rgba(15, 30, 54, 0.08)`).
- `shadow-modal`: Dialog windows and CommandPalette (`0 20px 25px -5px rgba(15, 30, 54, 0.2)`).

---

## 5. UI Component Inventory

### Core Primitives (`src/components/ui/`)
1. **Button**: Variants (`primary`, `outline`, `ghost`, `secondary`), sizes (`sm`, `md`, `lg`), with loading spinner and icon support.
2. **Input & PasswordInput**: Floating focus ring, clear error state, hint slot, left/right icon slots, password visibility toggle.
3. **SearchBar**: Debounced search input with leading search icon and instant clear button.
4. **Checkbox**: Keyboard-accessible checkbox with checkmark animation and label pairing.
5. **Toggle**: Accessible switch (`role="switch"`) with label and description slots.
6. **Badge**: High-contrast indicator pills with optional leading status dot.
7. **Chip**: Interactive toggleable selection pills for multi-select filters.
8. **Tabs**: Accessible tab list (`role="tablist"`) with `underline` and `pill` variants.
9. **Modal**: Accessible modal dialog (`role="dialog"`, `aria-modal="true"`) with backdrop blur and escape key listener.
10. **Toast**: Transient toast alerts (`success`, `warning`, `error`, `info`) with auto-dismiss timer.
11. **Avatar**: Initials-based avatar circles with distinct sizes (`sm`, `md`, `lg`).
12. **Card**: Surface wrapper with optional interactive hover lift and padding variations.
13. **EmptyState & ErrorState**: Dedicated empty and failure illustrations with retry / navigation action triggers.
14. **Skeleton**: Content placeholder loaders for text, circles, and cards.

### Student Domain Components (`src/components/domain/`)
1. **TimetableItem**: Period cards with status ("Now", "Up Next", "Completed") and room directions link.
2. **EventCard**: Calendar date badge, capacity meter, registered tag, and registration actions.
3. **AnnouncementRow**: Official circulars with important pin, unread dot, and date stamp.
4. **CampusMapCanvas**: Custom interactive SVG campus layout with 25 clickable pins and road networks.
5. **LocationCard & LocationDetailPanel**: Venue summary with walking directions and bookmarking.
6. **ClubCard**: Society card with member count, category tag, and join/leave status.
7. **FacultyCard**: Professor directory card with email copy button, office hours, and subjects.
8. **FacilityCard**: Real-time status calculator ("Open until 20:00", "Closed", "Closes in 45m"), schedule table, and amenities.
9. **SearchModal**: Global CommandPalette (`Cmd+K` / `Ctrl+K`) with live indexing across 6 entity types.

### Shared Admin Components (`src/components/admin/`)

1. **Layout & Containers**:
   - `AdminLayout`: Sticky desktop sidebar, top header with breadcrumbs, role badge, quick search launcher, and quick logout.
   - `AdminForm`: Card-wrapped structured form layout with header title, description, and sticky bottom action toolbar with cancel/submit/delete buttons.
   - `FormSection`: Clean bordered grouping container supporting optional collapsible toggle and description.

2. **Form Input Primitives**:
   - `TextField`: Validated single-line input with optional prefix icon, helper text, and error states.
   - `TextArea`: Multi-line text field with auto-resize and character limit guidance.
   - `RichTextLite`: Markdown editor equipped with formatting toolbar (H3, Bold, Italic, Bullet List, Link), word count, and split-view student preview mode.
   - `SelectField`: Native styled dropdown select with custom focus rings.
   - `SearchableSelect`: Combobox with integrated filter search, sub-labels, and category badges (ideal for selecting campus locations or faculties).
   - `MultiSelectField`: Multi-item picker with toggleable chips and item counters.
   - `DatePickerField` & `TimePickerField`: Native HTML5 pickers styled with custom icons and clear states.
   - `NumberField`: Numeric input with min, max, step controls, and unit badges.
   - `ToggleField`: Card-style boolean toggle switch with title and explanatory helper text.
   - `TagInputField`: Pill-based tag editor supporting Enter-to-add, duplicate prevention, and one-click removal.
   - `ListEditor`: Reorderable item list editor with add, edit, and trash actions.
   - `ColorDotPicker`: Curated hex palette picker with active ring indicator.
   - `IconPicker`: Curated Lucide icon grid with visual preview and selection rings.
   - `MapPinPicker`: Interactive 2D campus ground map canvas where admins click to visually place map pins and capture percentage coordinates (`mapX`, `mapY`).

3. **Data Display & Interaction**:
   - `DataTable`: Generic data grid with column sorting, client search filter, multi-field dropdown filters, checkbox selection, bulk actions toolbar, pagination, custom row actions dropdown, and empty states.
   - `StatusBadge`: Semantic status pill supporting Published, Scheduled, Draft, Archived, Active, Suspended, Open, Closed, Limited, Attended, and Cancelled.
   - `ConfirmDialog`: High-safety confirmation modal supporting danger, warning, and info variants, with support for required confirmation words (e.g. typing "DELETE" or "RESET").
   - `PreviewPanel`: Slide-out panel simulating the student-facing view in real time as administrators draft or edit content.
   - `AdminSearchModal`: Administrative Command Palette (`Ctrl+K` / `Cmd+K`) indexing all administrative routes, quick actions, and content collections.

---

## 6. Accessibility & Compliance Standards

- **WCAG AA Compliance**: High-contrast ratios guaranteed for all text and UI boundaries.
- **Focus Rings**: Standardized outline using `focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2`.
- **Keyboard Navigation**: All interactive elements (table headers, combobox items, map pins, modals, and switches) are fully navigable via standard keyboard controls (Tab, Arrow keys, Enter, Space, Escape).
- **Accessible Data Tables**: Complex visual charts in the Admin Dashboard provide toggleable accessible data table alternatives for screen readers.
