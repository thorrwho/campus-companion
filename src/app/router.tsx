import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { HomePage } from '@/pages/home/HomePage'
import { MapPage } from '@/pages/map/MapPage'
import { EventsPage } from '@/pages/events/EventsPage'
import { EventDetailPage } from '@/pages/events/EventDetailPage'
import { AnnouncementsPage } from '@/pages/announcements/AnnouncementsPage'
import { AnnouncementDetailPage } from '@/pages/announcements/AnnouncementDetailPage'
import { ClubsPage } from '@/pages/clubs/ClubsPage'
import { ClubDetailPage } from '@/pages/clubs/ClubDetailPage'
import { FacultyPage } from '@/pages/faculty/FacultyPage'
import { FacultyDetailPage } from '@/pages/faculty/FacultyDetailPage'
import { FacilitiesPage } from '@/pages/facilities/FacilitiesPage'
import { FacilityDetailPage } from '@/pages/facilities/FacilityDetailPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { EditProfilePage } from '@/pages/profile/EditProfilePage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { SavedPage } from '@/pages/saved/SavedPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { NotFoundPage } from '@/pages/notFound/NotFoundPage'
import { StyleguidePage } from '@/pages/styleguide/StyleguidePage'
import { ProtectedRoute } from './ProtectedRoute'

// Admin Layout and Auth
import { AdminProtectedRoute } from './AdminProtectedRoute'
import { AdminLoginPage } from '@/pages/admin/auth/AdminLoginPage'
import { AdminShell } from '@/components/admin/layout/AdminShell'
import { AdminDashboardPage } from '@/pages/admin/dashboard/AdminDashboardPage'
import { ActivityLogPage } from '@/pages/admin/activity/ActivityLogPage'
import { AdminSettingsPage } from '@/pages/admin/settings/AdminSettingsPage'
import { AnnouncementsListPage } from '@/pages/admin/announcements/AnnouncementsListPage'
import { AnnouncementEditorPage } from '@/pages/admin/announcements/AnnouncementEditorPage'
import { NotificationsListPage } from '@/pages/admin/notifications/NotificationsListPage'
import { BroadcastComposerPage } from '@/pages/admin/notifications/BroadcastComposerPage'
import { EventsListPage } from '@/pages/admin/events/EventsListPage'
import { EventEditorPage } from '@/pages/admin/events/EventEditorPage'
import { EventRegistrationsPage } from '@/pages/admin/events/EventRegistrationsPage'
import { ClubsListPage } from '@/pages/admin/clubs/ClubsListPage'
import { ClubEditorPage } from '@/pages/admin/clubs/ClubEditorPage'
import { ClubMembersPage } from '@/pages/admin/clubs/ClubMembersPage'
import { LocationsListPage } from '@/pages/admin/locations/LocationsListPage'
import { LocationEditorPage } from '@/pages/admin/locations/LocationEditorPage'
import { FacilitiesListPage } from '@/pages/admin/facilities/FacilitiesListPage'
import { FacilityEditorPage } from '@/pages/admin/facilities/FacilityEditorPage'
import { FacultyListPage } from '@/pages/admin/faculty/FacultyListPage'
import { FacultyEditorPage } from '@/pages/admin/faculty/FacultyEditorPage'
import { DepartmentsPage } from '@/pages/admin/departments/DepartmentsPage'
import { TimetablePage } from '@/pages/admin/timetable/TimetablePage'
import { StudentsListPage } from '@/pages/admin/students/StudentsListPage'
import { StudentDetailPage } from '@/pages/admin/students/StudentDetailPage'
import { RegistrationsOverviewPage } from '@/pages/admin/registrations/RegistrationsOverviewPage'

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: '/login',
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthLayout>
        <SignupPage />
      </AuthLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <ForgotPasswordPage />
      </AuthLayout>
    ),
  },

  // Admin Auth Route
  {
    path: '/admin/login',
    element: (
      <AuthLayout>
        <AdminLoginPage />
      </AuthLayout>
    ),
  },

  // Onboarding (Protected, but before full app shell)
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },

  // Protected Admin Routes wrapped in AdminProtectedRoute and AdminShell
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminShell />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'announcements',
        element: <AnnouncementsListPage />,
      },
      {
        path: 'announcements/new',
        element: <AnnouncementEditorPage />,
      },
      {
        path: 'announcements/:id/edit',
        element: <AnnouncementEditorPage />,
      },
      {
        path: 'events',
        element: <EventsListPage />,
      },
      {
        path: 'events/new',
        element: <EventEditorPage />,
      },
      {
        path: 'events/:id/edit',
        element: <EventEditorPage />,
      },
      {
        path: 'events/:id/registrations',
        element: <EventRegistrationsPage />,
      },
      {
        path: 'clubs',
        element: <ClubsListPage />,
      },
      {
        path: 'clubs/new',
        element: <ClubEditorPage />,
      },
      {
        path: 'clubs/:id/edit',
        element: <ClubEditorPage />,
      },
      {
        path: 'clubs/:id/members',
        element: <ClubMembersPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsListPage />,
      },
      {
        path: 'notifications/new',
        element: <BroadcastComposerPage />,
      },
      {
        path: 'locations',
        element: <LocationsListPage />,
      },
      {
        path: 'locations/new',
        element: <LocationEditorPage />,
      },
      {
        path: 'locations/:id/edit',
        element: <LocationEditorPage />,
      },
      {
        path: 'facilities',
        element: <FacilitiesListPage />,
      },
      {
        path: 'facilities/new',
        element: <FacilityEditorPage />,
      },
      {
        path: 'facilities/:id/edit',
        element: <FacilityEditorPage />,
      },
      {
        path: 'faculty',
        element: <FacultyListPage />,
      },
      {
        path: 'faculty/new',
        element: <FacultyEditorPage />,
      },
      {
        path: 'faculty/:id/edit',
        element: <FacultyEditorPage />,
      },
      {
        path: 'departments',
        element: <DepartmentsPage />,
      },
      {
        path: 'timetable',
        element: <TimetablePage />,
      },
      {
        path: 'students',
        element: <StudentsListPage />,
      },
      {
        path: 'students/:id',
        element: <StudentDetailPage />,
      },
      {
        path: 'registrations',
        element: <RegistrationsOverviewPage />,
      },
      {
        path: 'activity',
        element: <ActivityLogPage />,
      },
      {
        path: 'settings',
        element: <AdminSettingsPage />,
      },
    ],
  },

  // Protected Student App Routes wrapped in AppShell
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'map',
        element: <MapPage />,
      },
      {
        path: 'map/:locationId',
        element: <MapPage />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'events/:id',
        element: <EventDetailPage />,
      },
      {
        path: 'clubs',
        element: <ClubsPage />,
      },
      {
        path: 'clubs/:id',
        element: <ClubDetailPage />,
      },
      {
        path: 'announcements',
        element: <AnnouncementsPage />,
      },
      {
        path: 'announcements/:id',
        element: <AnnouncementDetailPage />,
      },
      {
        path: 'faculty',
        element: <FacultyPage />,
      },
      {
        path: 'faculty/:id',
        element: <FacultyDetailPage />,
      },
      {
        path: 'facilities',
        element: <FacilitiesPage />,
      },
      {
        path: 'facilities/:id',
        element: <FacilityDetailPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'profile/edit',
        element: <EditProfilePage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'saved',
        element: <SavedPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'styleguide',
        element: <StyleguidePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
