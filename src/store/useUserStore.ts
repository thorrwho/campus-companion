import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Event,
  Club,
  NotificationItemData,
  NotificationPrefs,
  Student,
} from '@/types'
import { useContentStore } from './useContentStore'

interface UserStoreState {
  // Dynamic entities whose counts change (mirrored from content store)
  events: Event[]
  clubs: Club[]

  // User engagement
  registeredEventIds: string[]
  joinedClubIds: string[]
  savedLocationIds: string[]
  readAnnouncementIds: string[]
  readNotificationIds: string[]
  clearedNotificationIds: string[]

  // Notifications
  notifications: NotificationItemData[]
  notificationPrefs: NotificationPrefs

  // Actions
  registerEvent: (eventId: string, student?: Student | null) => { success: boolean; message: string }
  cancelEvent: (eventId: string, student?: Student | null) => { success: boolean; message: string }

  joinClub: (clubId: string, student?: Student | null) => { success: boolean; message: string }
  leaveClub: (clubId: string, student?: Student | null) => { success: boolean; message: string }

  toggleSaveLocation: (locationId: string, student?: Student | null) => { saved: boolean }

  markAnnouncementRead: (announcementId: string) => void
  markAllAnnouncementsRead: (allIds: string[]) => void

  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  clearNotification: (notificationId: string) => void
  addNotification: (notif: NotificationItemData) => void

  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void

  resetUserData: () => void
}

const INITIAL_REGISTERED_EVENTS = ['event-ai-hackathon', 'event-cv-workshop']
const INITIAL_JOINED_CLUBS = ['club-ai-robotics', 'club-coding']
const INITIAL_SAVED_LOCATIONS = ['loc-ai-research-lab', 'loc-central-library', 'loc-canteen-main']
const INITIAL_READ_ANNOUNCEMENTS = ['ann-library-extended-hours', 'ann-techfest-call-for-volunteers']
const INITIAL_READ_NOTIFICATIONS = ['notif-4', 'notif-5', 'notif-6']

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
      get events() {
        return useContentStore.getState().events
      },
      get clubs() {
        return useContentStore.getState().clubs
      },

      registeredEventIds: INITIAL_REGISTERED_EVENTS,
      joinedClubIds: INITIAL_JOINED_CLUBS,
      savedLocationIds: INITIAL_SAVED_LOCATIONS,
      readAnnouncementIds: INITIAL_READ_ANNOUNCEMENTS,
      readNotificationIds: INITIAL_READ_NOTIFICATIONS,
      clearedNotificationIds: [],

      get notifications() {
        const broadcasts = useContentStore.getState().notifications
        const readIds = get().readNotificationIds
        const clearedIds = get().clearedNotificationIds
        const now = new Date()

        return broadcasts
          .filter((b) => {
            if (b.status === 'recalled') return false
            if (clearedIds.includes(b.id)) return false
            if (b.status === 'sent') return true
            if (b.status === 'scheduled' && b.scheduledFor) {
              return new Date(b.scheduledFor) <= now
            }
            return false
          })
          .map((b) => ({
            id: b.id,
            type: b.type,
            title: b.title,
            body: b.message,
            createdAt: b.sentAt || b.createdAt || new Date().toISOString(),
            read: readIds.includes(b.id),
            link: b.link || '#',
          }))
      },

      notificationPrefs: INITIAL_NOTIFICATION_PREFS,

      registerEvent: (eventId: string, currentStudent?: Student | null) => {
        const { registeredEventIds } = get()
        const contentStore = useContentStore.getState()
        const targetEvent = contentStore.events.find((e) => e.id === eventId)

        if (!targetEvent) {
          return { success: false, message: 'Event not found.' }
        }

        if (registeredEventIds.includes(eventId)) {
          return { success: false, message: 'You are already registered for this event.' }
        }

        if (targetEvent.registeredCount >= targetEvent.capacity) {
          return { success: false, message: 'This event is full. Registration is closed.' }
        }

        const deadline = new Date(targetEvent.registrationDeadline)
        if (new Date() > deadline) {
          return { success: false, message: 'Registration deadline has passed.' }
        }

        // Update student state
        const updatedRegistered = [...registeredEventIds, eventId]
        set({ registeredEventIds: updatedRegistered })

        // Update content store event
        contentStore.updateItem('events', eventId, {
          registeredCount: targetEvent.registeredCount + 1,
        })

        // Add event registration entry
        const studentId = currentStudent?.id || 'student-demo'
        contentStore.createItem('eventRegistrations', {
          eventId,
          studentId,
          registeredAt: new Date().toISOString(),
          attended: false,
        })

        // Sync with student record in content store
        const existingStudent = contentStore.students.find((s) => s.id === studentId)
        if (existingStudent) {
          contentStore.updateItem('students', studentId, {
            registeredEventIds: Array.from(new Set([...(existingStudent.registeredEventIds || []), eventId])),
          })
        }

        return { success: true, message: `Registered successfully for ${targetEvent.title}` }
      },

      cancelEvent: (eventId: string, currentStudent?: Student | null) => {
        const { registeredEventIds } = get()
        const contentStore = useContentStore.getState()
        const targetEvent = contentStore.events.find((e) => e.id === eventId)

        if (!registeredEventIds.includes(eventId)) {
          return { success: false, message: 'You are not registered for this event.' }
        }

        // Update student state
        set({
          registeredEventIds: registeredEventIds.filter((id) => id !== eventId),
        })

        // Update content store event
        if (targetEvent) {
          contentStore.updateItem('events', eventId, {
            registeredCount: Math.max(0, targetEvent.registeredCount - 1),
          })
        }

        // Remove registration entry
        const studentId = currentStudent?.id || 'student-demo'
        const regToRemove = contentStore.eventRegistrations.find(
          (r) => r.eventId === eventId && r.studentId === studentId
        )
        if (regToRemove) {
          contentStore.removeItem('eventRegistrations', regToRemove.id)
        }

        // Sync with student record in content store
        const existingStudent = contentStore.students.find((s) => s.id === studentId)
        if (existingStudent) {
          contentStore.updateItem('students', studentId, {
            registeredEventIds: (existingStudent.registeredEventIds || []).filter((id) => id !== eventId),
          })
        }

        return {
          success: true,
          message: targetEvent ? `Registration cancelled for ${targetEvent.title}` : 'Registration cancelled',
        }
      },

      joinClub: (clubId: string, currentStudent?: Student | null) => {
        const { joinedClubIds } = get()
        const contentStore = useContentStore.getState()
        const targetClub = contentStore.clubs.find((c) => c.id === clubId)

        if (joinedClubIds.includes(clubId)) {
          return { success: false, message: 'You are already a member of this club.' }
        }

        // Update student state
        set({
          joinedClubIds: [...joinedClubIds, clubId],
        })

        // Update content store club
        if (targetClub) {
          contentStore.updateItem('clubs', clubId, {
            memberCount: targetClub.memberCount + 1,
          })
        }

        // Sync with student record
        const studentId = currentStudent?.id || 'student-demo'
        const existingStudent = contentStore.students.find((s) => s.id === studentId)
        if (existingStudent) {
          contentStore.updateItem('students', studentId, {
            joinedClubIds: Array.from(new Set([...(existingStudent.joinedClubIds || []), clubId])),
          })
        }

        return {
          success: true,
          message: targetClub ? `Joined ${targetClub.name}` : 'Joined club successfully',
        }
      },

      leaveClub: (clubId: string, currentStudent?: Student | null) => {
        const { joinedClubIds } = get()
        const contentStore = useContentStore.getState()
        const targetClub = contentStore.clubs.find((c) => c.id === clubId)

        if (!joinedClubIds.includes(clubId)) {
          return { success: false, message: 'You are not a member of this club.' }
        }

        // Update student state
        set({
          joinedClubIds: joinedClubIds.filter((id) => id !== clubId),
        })

        // Update content store club
        if (targetClub) {
          contentStore.updateItem('clubs', clubId, {
            memberCount: Math.max(0, targetClub.memberCount - 1),
          })
        }

        // Sync with student record
        const studentId = currentStudent?.id || 'student-demo'
        const existingStudent = contentStore.students.find((s) => s.id === studentId)
        if (existingStudent) {
          contentStore.updateItem('students', studentId, {
            joinedClubIds: (existingStudent.joinedClubIds || []).filter((id) => id !== clubId),
          })
        }

        return {
          success: true,
          message: targetClub ? `Left ${targetClub.name}` : 'Left club successfully',
        }
      },

      toggleSaveLocation: (locationId: string, currentStudent?: Student | null) => {
        const { savedLocationIds } = get()
        const isSaved = savedLocationIds.includes(locationId)
        const contentStore = useContentStore.getState()
        const studentId = currentStudent?.id || 'student-demo'
        const existingStudent = contentStore.students.find((s) => s.id === studentId)

        if (isSaved) {
          const nextSaved = savedLocationIds.filter((id) => id !== locationId)
          set({ savedLocationIds: nextSaved })
          if (existingStudent) {
            contentStore.updateItem('students', studentId, { savedLocationIds: nextSaved })
          }
          return { saved: false }
        } else {
          const nextSaved = [...savedLocationIds, locationId]
          set({ savedLocationIds: nextSaved })
          if (existingStudent) {
            contentStore.updateItem('students', studentId, { savedLocationIds: nextSaved })
          }
          return { saved: true }
        }
      },

      markAnnouncementRead: (announcementId: string) => {
        const { readAnnouncementIds } = get()
        if (!readAnnouncementIds.includes(announcementId)) {
          set({ readAnnouncementIds: [...readAnnouncementIds, announcementId] })
          const contentStore = useContentStore.getState()
          const ann = contentStore.announcements.find((a) => a.id === announcementId)
          if (ann) {
            contentStore.updateItem('announcements', announcementId, {
              readCount: (ann.readCount || 0) + 1,
            })
          }
        }
      },

      markAllAnnouncementsRead: (allIds: string[]) => {
        const currentRead = get().readAnnouncementIds
        const newRead = Array.from(new Set([...currentRead, ...allIds]))
        set({ readAnnouncementIds: newRead })
      },

      markNotificationRead: (notificationId: string) => {
        const { readNotificationIds } = get()
        if (!readNotificationIds.includes(notificationId)) {
          set({ readNotificationIds: [...readNotificationIds, notificationId] })
          const contentStore = useContentStore.getState()
          const notif = contentStore.notifications.find((n) => n.id === notificationId)
          if (notif) {
            contentStore.updateItem('notifications', notificationId, {
              readCount: (notif.readCount || 0) + 1,
            })
          }
        }
      },

      markAllNotificationsRead: () => {
        const visibleNotifications = get().notifications
        const visibleIds = visibleNotifications.map((n) => n.id)
        set({
          readNotificationIds: Array.from(new Set([...get().readNotificationIds, ...visibleIds])),
        })
      },

      clearNotification: (notificationId: string) => {
        const { clearedNotificationIds } = get()
        if (!clearedNotificationIds.includes(notificationId)) {
          set({
            clearedNotificationIds: [...clearedNotificationIds, notificationId],
          })
        }
      },

      addNotification: (notif: NotificationItemData) => {
        set((state) => ({
          notifications: [notif, ...state.notifications],
        }))
      },

      updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => {
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, ...prefs },
        }))
      },

      resetUserData: () => {
        set({
          registeredEventIds: INITIAL_REGISTERED_EVENTS,
          joinedClubIds: INITIAL_JOINED_CLUBS,
          savedLocationIds: INITIAL_SAVED_LOCATIONS,
          readAnnouncementIds: INITIAL_READ_ANNOUNCEMENTS,
          readNotificationIds: INITIAL_READ_NOTIFICATIONS,
          clearedNotificationIds: [],
          notificationPrefs: INITIAL_NOTIFICATION_PREFS,
        })
      },
    }),
    {
      name: 'campus-companion-v1-user',
    }
  )
)
