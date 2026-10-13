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

  // Onboarding (Protected, but before full app shell)
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },

  // Protected App Routes wrapped in AppShell
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
