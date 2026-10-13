# Campus Companion

> **"Your Campus. One Companion."**

An interactive, responsive web prototype for student campus life at **Campus Companion Demo College**. Built as a comprehensive academic UI/UX project emphasizing design polish, accessibility (WCAG AA compliance), responsive breakpoints, and complete interaction states.

---

## Quick Start & Demo Account

The application runs entirely in the browser with **no backend required**. All state (registrations, memberships, bookmarks, notifications, profile edits) automatically persists to browser `localStorage`.

### Local Development
```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Compile TypeScript and build production bundle
npm run build
```

The app will be available at `http://localhost:5173/`.

### Pre-configured Demo Login
- **Email**: `demo@demo.edu`
- **Password**: `Demo@1234`
- **Student Profile**: Aarav Sharma (Roll No: `23CS1A0501`, Department: `CSE-AIML`, Semester: 5)
- *Tip*: On the login screen, click the **"Use demo account"** button to auto-fill these credentials.

---

## Core Application Modules

### 1. Home Dashboard (`/`)
- **Smart Student Greeting**: Context-aware greeting based on local time of day with live date badge.
- **Interactive Daily Timetable**: Today's class schedule with live status badges ("Now", "Up Next", "Completed"), room numbers, and direct walking direction links. Day-of-week switcher to preview upcoming days.
- **48-Hour Event Alerts**: High-visibility reminder banner for events approaching within 48 hours.
- **Quick Action Grid**: One-tap shortcuts to Map, Events, Clubs, Notices, Faculty, and Facilities.
- **Operational Facility Status Strip**: Live ticker showing library, dining hall, and health center open/closed statuses.
- **Latest Official Circulars**: Recent announcements with unread indicators and quick mark-read actions.

### 2. Interactive Campus Map (`/map` & `/map/:locationId`)
- **Custom 2D SVG Campus Grounds**: Handcrafted scalable layout depicting campus roads, lawns, gates, and 25 labeled buildings.
- **Interactive Focusable Pins**: Keyboard-accessible pins categorized into departments, labs, libraries, dining halls, sports arenas, medical clinic, and auditorium.
- **Location Detail Panel**: Detailed floor info, description, building code, turn-by-turn walking directions from the Main Gate, and bookmarking.
- **Deep-linking Support**: Direct URL navigation to any campus location pin with automatic selection and center focusing.

### 3. Events Calendar & Registration (`/events` & `/events/:id`)
- **Event Catalog**: Filter by category (technical, workshop, cultural, sports, hackathon, seminar) and search query.
- **Capacity Meter**: Real-time progress bar showing registered count vs seat capacity.
- **Interactive Registration Modal**: Confirms seat registration and optimistic count increment.
- **ICS Calendar Generator**: One-click `.ics` download to add sessions directly to Google Calendar or Apple Calendar.
- **Pass Cancellation Flow**: Confirmation dialog allowing students to release registered seats.

### 4. Announcements & Circulars (`/announcements` & `/announcements/:id`)
- **Official Notices**: Filter by category (academic, examinations, administration, placement, sports) with unread toggle.
- **Pinned Important Notices**: High-priority circulars highlighted with distinct styling.
- **Full Circular Reader**: Structured announcement view with metadata, body copy, and simulated official attachment downloads.
- **Auto-mark Read**: Visiting an announcement automatically marks it as read across the platform.

### 5. Student Clubs & Societies (`/clubs` & `/clubs/:id`)
- **Club Directory**: Explore technical societies, robotics circles, cultural troupes, and literary associations.
- **Society Profiles**: Mission statement, weekly meeting schedules, faculty advisors, and linked upcoming events.
- **Membership Management**: One-click join and leave flows with confirmation modals and toast feedback.

### 6. Faculty Directory (`/faculty` & `/faculty/:id`)
- **Professor Profiles**: Browse teaching faculty across CSE, CSE-AIML, ECE, EEE, Mechanical, and Civil departments.
- **Office Consultation Hours**: Clear office timings and designated room locations with campus map links.
- **Contact Shortcuts**: One-click email copy button with instant toast confirmation.

### 7. Campus Facilities & Services (`/facilities` & `/facilities/:id`)
- **Real-Time Operational Calculator**: Automatic evaluation of facility operating hours based on local device time:
  - "Open until [time]" (success badge)
  - "Closes in [N]m" (warning badge)
  - "Closed today / Opens at [time]" (error badge)
  - "Open 24/7" (info badge)
- **Weekly Schedule Table**: Full Monday to Sunday operational schedule with the current day prominently highlighted.
- **Services & Amenities**: Checklist of amenities (book lending, Wi-Fi terminals, meal combos, sports equipment).

### 8. Student Profile & Edit Records (`/profile` & `/profile/edit`)
- **Academic Credentials**: Roll number, department, semester, section, CGPA (8.84), and attendance percentage (91%).
- **Locked Institutional Records**: Clear explanatory notice that primary academic records are synchronized with the Registrar.
- **Editable Student Information**: Validated form to update mobile phone number, about/bio statement, and emergency contact details.
- **Interest Tag Management**: Multi-select chip selector to personalize dashboard recommendations.
- **Unsaved Changes Guard**: Warning modal preventing accidental data loss when navigating away.

### 9. Notifications Center (`/notifications`)
- **Chronological Grouping**: Divided cleanly into "Today" and "Earlier" sections.
- **Category Icons**: Visual distinction for event updates, examination circulars, timetable reminders, and club notices.
- **Interactive Controls**: "Mark as read", "Dismiss / Remove", and "Mark all as read" buttons with counter synchronization.
- **Contextual Routing**: Clicking a notification opens the related campus destination.

### 10. Saved Library (`/saved`)
- **Tabbed Management**: 3 organized tabs for Registered Events, Joined Clubs, and Saved Locations.
- **Quick Actions**: Unregister from events, leave clubs, or remove location bookmarks directly from the list.
- **Tailored Empty States**: Contextual empty states with direct navigation buttons to explore relevant sections.

### 11. Settings & Prototype Controls (`/settings`)
- **Notification Alert Toggles**: Configurable switches for event reminders (48h/2h), circulars, club updates, and timetable alerts.
- **Theme Selection**: Light theme active by default (with notice regarding high-contrast dark theme scheduled for future release).
- **Reset Demo Data**: Confirmation modal allowing users to clear all custom modifications and restore original demo state.
- **Sign Out Flow**: Modal confirmation to terminate session and return to login.

### 12. Global Search Command Palette (`Cmd+K` / `Ctrl+K`)
- **Omni-Search Dialog**: Accessible floating command palette triggered via keyboard shortcut or top bar search bar.
- **Universal Index**: Live full-text search across locations, events, circulars, clubs, professors, and facilities.
- **Keyboard Navigation**: Use Arrow Up / Down to navigate search results, Enter to jump to the page, and Escape to dismiss.
- **Quick Destinations**: Displays suggested campus destinations when query is empty.

### 13. Component Styleguide (`/styleguide`)
- Dedicated living design system showcase displaying every UI primitive, color token, typography sample, and interaction pattern.

---

## Technical Stack & Architecture

- **Framework**: React 18 with TypeScript (Strict mode enabled)
- **Build Tool**: Vite v8
- **Styling**: Tailwind CSS v3 with customized design tokens (`tailwind.config.ts`)
- **Typography**: Inter (Google Fonts) with customized font sizes and line heights
- **Routing**: React Router v6 (`createBrowserRouter`) with `ProtectedRoute` guards and `AppShell` layout
- **State Management**: Zustand with `persist` middleware:
  - `useAuthStore` (`campus-companion-v1-auth`): User authentication, onboarding status, and profile edits
  - `useUserStore` (`campus-companion-v1-user`): Event registrations, club memberships, bookmarks, notifications, and alert settings
  - `useToastStore`: Global toast alert queue with auto-dismiss timers
- **Icons**: Lucide React
- **Date Utilities**: Native JavaScript Date with `date-fns` formatting

---

## Accessibility & Responsive Standards

- **WCAG AA Compliance**: High-contrast text colors meeting or exceeding 4.5:1 ratio for regular text and 3:1 for large text and icons.
- **Keyboard Accessibility**: Full tab navigation order, visible focus rings (`ring-2 ring-primary-600`), and standard ARIA roles (`role="dialog"`, `role="switch"`, `role="tablist"`).
- **Skip Link**: "Skip to main content" link accessible immediately on Tab key press.
- **Responsive Breakpoints**:
  - Mobile (< 768px): Fixed bottom navigation bar with 48px+ touch targets
  - Tablet (768px to 1024px): Compact icon-only navy sidebar
  - Desktop (> 1024px): Full 240px wide sidebar with descriptive labels and branding

---

## Project Documentation

- Design System Specification: [`docs/DESIGN_SYSTEM.md`](file:///x:/campus-companion/docs/DESIGN_SYSTEM.md)
- UI Styleguide: Navigate to `http://localhost:5173/styleguide` in the running prototype

---

## Academic UI/UX Disclaimer

Campus Companion is a simulated academic user interface and experience prototype developed for educational demonstration purposes. All institutional entities, faculty names, circulars, and events are mock data and do not represent a real university or operational system.
