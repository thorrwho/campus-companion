import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Event,
  Club,
  NotificationItemData,
  NotificationPrefs,
} from '@/types'
import { EVENTS } from '@/data/events'
import { CLUBS } from '@/data/clubs'
import { NOTIFICATIONS } from '@/data/notifications'

interface UserStoreState {
  // Dynamic entities whose counts change
  events: Event[]
  clubs: Club[]

  // User engagement
  registeredEventIds: string[]
  joinedClubIds: string[]
  savedLocationIds: string[]
  readAnnouncementIds: string[]

  // Notifications
  notifications: NotificationItemData[]
  notificationPrefs: NotificationPrefs

  // Actions
  registerEvent: (eventId: string) => { success: boolean; message: string }
  cancelEvent: (eventId: string) => { success: boolean; message: string }

  joinClub: (clubId: string) => { success: boolean; message: string }
  leaveClub: (clubId: string) => { success: boolean; message: string }

  toggleSaveLocation: (locationId: string) => { saved: boolean }

  markAnnouncementRead: (announcementId: string) => void
  markAllAnnouncementsRead: (allIds: string[]) => void

  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  clearNotification: (notificationId: string) => void

  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void

  resetUserData: () => void
}

const INITIAL_REGISTERED_EVENTS = ['event-ai-hackathon', 'event-cv-workshop']
const INITIAL_JOINED_CLUBS = ['club-ai-robotics', 'club-coding']
const INITIAL_SAVED_LOCATIONS = ['loc-ai-research-lab', 'loc-central-library', 'loc-canteen-main']
const INITIAL_READ_ANNOUNCEMENTS = ['ann-library-extended-hours', 'ann-techfest-call-for-volunteers']

const INITIAL_NOTIFICATION_PREFS: NotificationPrefs = {
  events: true,
  announcements: true,
  clubs: true,
  reminders: true,
  email: false,
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      events: EVENTS,
      clubs: CLUBS,

      registeredEventIds: INITIAL_REGISTERED_EVENTS,
      joinedClubIds: INITIAL_JOINED_CLUBS,
      savedLocationIds: INITIAL_SAVED_LOCATIONS,
      readAnnouncementIds: INITIAL_READ_ANNOUNCEMENTS,

      notifications: NOTIFICATIONS,
      notificationPrefs: INITIAL_NOTIFICATION_PREFS,

      registerEvent: (eventId: string) => {
        const { registeredEventIds, events } = get()
        if (registeredEventIds.includes(eventId)) {
          return { success: false, message: 'You are already registered for this event.' }
        }

        const targetEvent = events.find((e) => e.id === eventId)
        if (!targetEvent) {
          return { success: false, message: 'Event not found.' }
        }

        // Check capacity
        if (targetEvent.registeredCount >= targetEvent.capacity) {
          return { success: false, message: 'This event is full. Registration is closed.' }
        }

        // Check deadline
        const deadline = new Date(targetEvent.registrationDeadline)
        if (new Date() > deadline) {
          return { success: false, message: 'Registration deadline has passed.' }
        }

        // Update state
        set({
          registeredEventIds: [...registeredEventIds, eventId],
          events: events.map((e) =>
            e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
          ),
        })

        return { success: true, message: `Registered successfully for ${targetEvent.title}` }
      },

      cancelEvent: (eventId: string) => {
        const { registeredEventIds, events } = get()
        if (!registeredEventIds.includes(eventId)) {
          return { success: false, message: 'You are not registered for this event.' }
        }

        const targetEvent = events.find((e) => e.id === eventId)

        set({
          registeredEventIds: registeredEventIds.filter((id) => id !== eventId),
          events: events.map((e) =>
            e.id === eventId
              ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) }
              : e
          ),
        })

        return {
          success: true,
          message: targetEvent ? `Registration cancelled for ${targetEvent.title}` : 'Registration cancelled',
        }
      },

      joinClub: (clubId: string) => {
        const { joinedClubIds, clubs } = get()
        if (joinedClubIds.includes(clubId)) {
          return { success: false, message: 'You are already a member of this club.' }
        }

        const targetClub = clubs.find((c) => c.id === clubId)

        set({
          joinedClubIds: [...joinedClubIds, clubId],
          clubs: clubs.map((c) =>
            c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c
          ),
        })

        return {
          success: true,
          message: targetClub ? `Joined ${targetClub.name}` : 'Joined club successfully',
        }
      },

      leaveClub: (clubId: string) => {
        const { joinedClubIds, clubs } = get()
        if (!joinedClubIds.includes(clubId)) {
          return { success: false, message: 'You are not a member of this club.' }
        }

        const targetClub = clubs.find((c) => c.id === clubId)

        set({
          joinedClubIds: joinedClubIds.filter((id) => id !== clubId),
          clubs: clubs.map((c) =>
            c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
          ),
        })

        return {
          success: true,
          message: targetClub ? `Left ${targetClub.name}` : 'Left club successfully',
        }
      },

      toggleSaveLocation: (locationId: string) => {
        const { savedLocationIds } = get()
        const isSaved = savedLocationIds.includes(locationId)
        if (isSaved) {
          set({ savedLocationIds: savedLocationIds.filter((id) => id !== locationId) })
          return { saved: false }
        } else {
          set({ savedLocationIds: [...savedLocationIds, locationId] })
          return { saved: true }
        }
      },

      markAnnouncementRead: (announcementId: string) => {
        const { readAnnouncementIds } = get()
        if (!readAnnouncementIds.includes(announcementId)) {
          set({ readAnnouncementIds: [...readAnnouncementIds, announcementId] })
        }
      },

      markAllAnnouncementsRead: (allIds: string[]) => {
        set({ readAnnouncementIds: Array.from(new Set([...get().readAnnouncementIds, ...allIds])) })
      },

      markNotificationRead: (notificationId: string) => {
        const { notifications } = get()
        set({
          notifications: notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        })
      },

      markAllNotificationsRead: () => {
        const { notifications } = get()
        set({
          notifications: notifications.map((n) => ({ ...n, read: true })),
        })
      },

      clearNotification: (notificationId: string) => {
        const { notifications } = get()
        set({
          notifications: notifications.filter((n) => n.id !== notificationId),
        })
      },

      updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => {
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, ...prefs },
        }))
      },

      resetUserData: () => {
        set({
          events: EVENTS,
          clubs: CLUBS,
          registeredEventIds: INITIAL_REGISTERED_EVENTS,
          joinedClubIds: INITIAL_JOINED_CLUBS,
          savedLocationIds: INITIAL_SAVED_LOCATIONS,
          readAnnouncementIds: INITIAL_READ_ANNOUNCEMENTS,
          notifications: NOTIFICATIONS,
          notificationPrefs: INITIAL_NOTIFICATION_PREFS,
        })
      },
    }),
    {
      name: 'campus-companion-v1-user',
    }
  )
)
