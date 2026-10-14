# Campus Companion

> **"Your Campus. One Companion."**

An interactive, responsive web prototype for student campus life and administrative management at **Campus Companion Demo College**. Built as a comprehensive academic UI/UX project emphasizing design polish, accessibility (WCAG AA compliance), responsive breakpoints, complete interaction states, and instant reactive synchronization between student and administrator experiences.

---

## Quick Start and Demo Accounts

The application runs entirely in the browser with **no backend required**. All state (content catalogs, registrations, memberships, bookmarks, notifications, student profiles, audit history, and administrative settings) automatically persists to browser `localStorage`.

### Local Development
```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Compile TypeScript and build production bundle
npm run build

# Run linter
npm run lint
```

The app will be available at `http://localhost:5173/`.

### Pre-configured Demo Accounts

| Portal | Role | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Student Portal** | Student | `demo@demo.edu` | `Demo@1234` | Aarav Sharma (Roll No: `23CS1A0501`, Department: `CSE-AIML`, Semester: 5) |
| **Admin Portal** | Super Admin | `admin@demo.edu` | `Admin@1234` | Full access to manage all campus collections, circulars, timetables, and students |

*Tip*: On both login screens, click the **"Use demo account"** button to auto-fill these credentials instantly.

---

## Architecture: Simulated vs Real System

Campus Companion is an advanced browser-based prototype. The table below details how each capability is handled in this demonstration versus a production enterprise backend.

| Architectural Area | Campus Companion Prototype (Simulated) | Enterprise Production Equivalent (Real) |
| :--- | :--- | :--- |
| **Data Storage** | Persisted browser `localStorage` across keys: `campus-companion-content-v1`, `campus-companion-admin-auth-v1`, `campus-companion-activity-log-v1`, `campus-companion-v1-auth`, `campus-companion-v1-user`. | Relational database (PostgreSQL) or document store with replication, connection pooling, and automated backups. |
| **Authentication** | Simulated JWT tokens and role verification (`student`, `admin`) stored in client state. Passwords verified against local store. | OAuth2 / OIDC server, secure HTTP-only cookies, salted argon2/bcrypt password hashing, multi-factor authentication (MFA). |
| **Real-time Sync** | Synchronous state updates via Zustand stores. Any edit made in the Admin Portal triggers immediate re-renders in the student views without page reloads. | WebSockets, Server-Sent Events (SSE), or Firebase / Supabase change subscriptions with optimistic client caching. |
| **File Attachments & Uploads** | Simulated metadata objects, client-generated downloadable blobs, and mock file names. | Cloud object storage (AWS S3, Google Cloud Storage) with presigned upload URLs and CDN distribution. |
| **Audit Log and Safety** | In-browser append-only ring buffer in `useActivityLogStore` with one-click snapshot undo for deleted items. | Immutable write-ahead audit logs, change data capture (CDC), Kafka events, and database soft deletes with point-in-time recovery. |
| **Backup and Migration** | Client-side JSON file export and schema-validated JSON file import with instant store rehydration. | Database dumps (`pg_dump`), distributed object backups, automated disaster recovery, and blue-green migration pipelines. |

---

## Administrative Portal (`/admin`)

The Admin Portal offers institutional staff, faculty coordinators, and campus directors a single control plane to create, inspect, update, and manage every facet of campus operations.

### Key Capabilities and Managed Entities

1. **Executive Dashboard (`/admin/dashboard`)**
   - High-level metric cards: Total Enrolled Students, Active Student Clubs, Upcoming Events, Published Circulars, and Unread Notice Rate.
   - Intelligent "Needs Attention" alert queue: Highlights events under 25% capacity within 7 days, events at 100% capacity, circulars scheduled to go live today, facilities with active manual overrides, and circulars expiring in under 3 days.
   - Interactive Analytics Charts: Event registrations by category, student enrollment distribution across academic departments, and rolling 7-day registration activity timeline (with accessible table data toggle).
   - Quick administrative creation shortcuts and recent audit activity stream.

2. **Official Announcements and Circulars (`/admin/announcements`)**
   - Comprehensive data table with status filters (Draft, Scheduled, Published, Archived), search, and bulk operations.
   - Rich Text Editor: Markdown support with quick toolbar, character counters, and live split preview.
   - Publishing Workflows: Immediate publishing, scheduled future release dates, and automated expiry dates.
   - Target Audience Filtering: Restrict circular visibility to specific academic departments or semester cohorts.
   - Pinning and High Priority flags: Pin urgent notices to the top of student dashboards.

3. **Broadcast Notifications (`/admin/notifications`)**
   - History of all administrative alerts delivered directly to students.
   - Broadcast Composer (`/admin/notifications/broadcast`): Send campus-wide or targeted alerts with priority levels (Low, Normal, Urgent), category tags, and direct destination deep-links.

4. **Events and Registrations (`/admin/events`)**
   - Event catalog manager with capacity controls, date and time pickers, location references, and organizing club links.
   - Status tracking: Draft, Published, and Cancelled (with mandatory public cancellation reason).
   - Dedicated Event Registrations Roster (`/admin/events/:id/registrations`): Searchable student attendee list, real-time check-in attendance toggles, and one-click CSV export.

5. **Clubs and Student Societies (`/admin/clubs`)**
   - Society directory with category tagging, faculty coordinator assignment, meeting schedules, and social links.
   - Club Roster Manager (`/admin/clubs/:id/members`): Review enrolled student members, join dates, and administrative member removal.

6. **Campus Locations and Map Pins (`/admin/locations`)**
   - Visual Campus Pin Picker: Click directly on the interactive 2D campus ground map to set exact percentage coordinates (`mapX`, `mapY`).
   - Building codes, floor levels, opening hours, and step-by-step turn-by-turn walking directions.

7. **Campus Facilities and Operating Hours (`/admin/facilities`)**
   - Operating schedule editor: Monday to Sunday opening and closing hours.
   - Real-time Override System: Instantly force facility status to "Open", "Closed", or "Limited" with custom administrative broadcast notes (e.g., "Closed for emergency maintenance until 14:00").

8. **Faculty Directory (`/admin/faculty`)**
   - Faculty management across all academic departments with designations, office locations, email addresses, office consultation hours, and subjects taught.

9. **Academic Departments (`/admin/departments`)**
   - Department directory supporting creation, editing, and deletion with cascading referential integrity checks against faculty, timetable slots, and student enrollments.

10. **Weekly Timetable Grid Matrix (`/admin/timetable`)**
    - Multi-mode schedule editor: Interactive Weekly Grid Matrix, Day-by-Day Timeline, and Tabular View.
    - Department and semester filtering (Semesters 1 to 8 across all branches).
    - Intelligent Conflict Detection: Visual warnings for overlapping class periods and campus-wide classroom double-booking clashes.
    - Schedule Tools: Duplicate / copy day schedule across other weekdays, and clear day schedule with safety confirmation.

11. **Student Records and Enrollment (`/admin/students`)**
    - Searchable student directory with department, semester, and account status filters.
    - Manual Student Enrollment Modal: Create new student accounts with automatic roll number and avatar generation, presenting a one-time login credentials popup.
    - Student Detail Inspection (`/admin/students/:id`): Academic standing, joined societies, registered events with attendance toggles, status suspension/reactivation, and record deletion.

12. **Consolidated Registrations Overview (`/admin/registrations`)**
    - Campus-wide unified registry of all event registrations.
    - Filter by specific event or attendance status (Attended vs Registered).
    - Batch Operations: Bulk mark attended or unmark selected registrations.
    - Roster export to formatted CSV.

13. **Administrative Audit Log and Safety Undo (`/admin/activity`)**
    - Chronological log of every content mutation, creation, publishing action, and account change.
    - Filterable by admin action, entity type, and date range.
    - One-Click Undo: Recently deleted records can be restored immediately from the persistent activity buffer.
    - Clear log tool with safety confirmation dialog.

14. **System Settings, Backups, and Reset (`/admin/settings`)**
    - Offline JSON State Export: Download a snapshot of all collections with one click.
    - Schema-Validated JSON Import: Preview file version, export timestamp, and exact record counts before confirming import.
    - Dynamic Category Management: Add or remove event, circular, and club categories with custom color dot and icon pickers.
    - Factory Demo Reset: Restore initial demonstration records with safety confirmation word verification ("RESET").

---

## Student Application Modules

1. **Home Dashboard (`/`)**: Contextual greeting, live class timetable tracker ("Now", "Up Next", "Completed"), 48-hour event alerts, facility status strip, and urgent announcements.
2. **Interactive Campus Map (`/map`)**: 2D SVG campus map with 25 labeled buildings, focusable pins, walking directions, and location bookmarks.
3. **Events Catalog (`/events`)**: Browse workshops, hackathons, and sports tournaments with capacity tracking, ICS calendar download, and instant seat reservation.
4. **Official Circulars (`/announcements`)**: Searchable notices with unread markers, pinned urgent circulars, and simulated attachment downloads.
5. **Student Clubs (`/clubs`)**: Technical societies and cultural clubs with one-click membership joining and meeting details.
6. **Faculty Directory (`/faculty`)**: Professor profiles, consultation timings, office locations, and email copy shortcuts.
7. **Campus Facilities (`/facilities`)**: Live open/closed calculations based on local device time, weekly schedules, and amenity checklists.
8. **Student Profile (`/profile`)**: Academic credentials, editable personal bio and emergency contact info, and interest tags.
9. **Notifications Center (`/notifications`)**: Grouped campus alerts with mark-read and dismiss tools.
10. **Saved Library (`/saved`)**: Quick access to registered events, joined clubs, and bookmarked campus locations.
11. **Settings (`/settings`)**: Configurable notification preferences, theme selection, and demo data reset.
12. **Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Universal full-text search across all campus entities.

---

## Technical Stack

- **Framework**: React 18 with TypeScript (Strict mode enabled)
- **Build Tool**: Vite v8
- **Styling**: Tailwind CSS v3 with customized design tokens (`tailwind.config.ts`)
- **Typography**: Inter (Google Fonts)
- **Routing**: React Router v6 (`createBrowserRouter`) with role-based route guards
- **State Management**: Zustand with `persist` middleware:
  - `useContentStore`: Central source of truth for all campus entities and categories
  - `useAdminAuthStore`: Admin authentication session and permissions
  - `useActivityLogStore`: Administrative audit trail and deletion undo buffer
  - `useAuthStore`: Student authentication and profile
  - `useUserStore`: Student bookmarks, registered events, joined clubs, and personal settings
  - `useToastStore`: Global toast alert queue
- **Icons**: Lucide React
- **Date Utilities**: Native JavaScript Date with `date-fns` formatting

---

## Accessibility and Responsive Standards

- **WCAG AA Compliance**: High-contrast text colors meeting or exceeding 4.5:1 ratio for regular text and 3:1 for large text and UI icons.
- **Keyboard Navigation**: Full tab sequence, focus rings (`ring-2 ring-primary-600`), and semantic ARIA attributes.
- **Data Denseness**: Admin tables feature accessible alternate table toggles, column sorting, and responsive wrappers.
- **Responsive Layout**:
  - Mobile (< 768px): Touch-optimized bottom navigation bar and mobile drawer menus.
  - Tablet (768px to 1024px): Compact icon-based navigation.
  - Desktop (> 1024px): Full multi-level sidebars with quick action links and breadcrumb navigation.

---

## Project Documentation

- Design System Specification: [`docs/DESIGN_SYSTEM.md`](file:///x:/campus-companion/docs/DESIGN_SYSTEM.md)
- Living Component Styleguide: Navigate to `/styleguide` in the running application

---

## Academic UI/UX Disclaimer

Campus Companion is a simulated academic user interface and experience prototype developed for educational demonstration purposes. All institutional entities, faculty names, circulars, and events are mock data and do not represent a real university or operational system.
