import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Department,
  TimetableSlot,
  Location,
  Event,
  Club,
  Announcement,
  Faculty,
  Facility,
  BroadcastNotification,
  Student,
  EventRegistration,
} from '@/types'
import { DEPARTMENTS } from '@/data/departments'
import { TIMETABLE_SLOTS } from '@/data/timetable'
import { LOCATIONS } from '@/data/locations'
import { EVENTS } from '@/data/events'
import { CLUBS } from '@/data/clubs'
import { ANNOUNCEMENTS } from '@/data/announcements'
import { FACULTY } from '@/data/faculty'
import { FACILITIES } from '@/data/facilities'
import { SEED_STUDENTS, SEED_EVENT_REGISTRATIONS } from '@/data/students'
import { SEED_BROADCASTS } from '@/data/broadcasts'

export type ContentCollectionKey =
  | 'departments'
  | 'timetableSlots'
  | 'locations'
  | 'events'
  | 'clubs'
  | 'announcements'
  | 'faculty'
  | 'facilities'
  | 'notifications'
  | 'students'
  | 'eventRegistrations'

export interface CategoryItem {
  id: string
  label: string
  color?: string
  icon?: string
}

export interface DependentItem {
  id: string
  name: string
}

export interface DependentGroup {
  type: string
  label: string
  count: number
  items: DependentItem[]
}

export interface DependentsResult {
  hasDependents: boolean
  count: number
  groups: DependentGroup[]
  description: string
}

export interface ContentStoreState {
  departments: Department[]
  timetableSlots: TimetableSlot[]
  locations: Location[]
  events: Event[]
  clubs: Club[]
  announcements: Announcement[]
  faculty: Faculty[]
  facilities: Facility[]
  notifications: BroadcastNotification[]
  students: Student[]
  eventRegistrations: EventRegistration[]

  // Dynamic Category Configuration
  eventCategories: CategoryItem[]
  announcementCategories: CategoryItem[]
  clubCategories: CategoryItem[]

  // Generic CRUD
  createItem: <K extends ContentCollectionKey>(
    collection: K,
    itemData: Omit<ContentStoreState[K][number], 'id' | 'createdAt' | 'updatedAt'>,
    authorEmail?: string
  ) => ContentStoreState[K][number]

  updateItem: <K extends ContentCollectionKey>(
    collection: K,
    id: string,
    updates: Partial<ContentStoreState[K][number]>,
    updaterEmail?: string
  ) => void

  removeItem: <K extends ContentCollectionKey>(collection: K, id: string) => void

  bulkRemove: <K extends ContentCollectionKey>(collection: K, ids: string[]) => void

  duplicateItem: <K extends ContentCollectionKey>(
    collection: K,
    id: string,
    authorEmail?: string
  ) => ContentStoreState[K][number] | null

  reorderItems: <K extends ContentCollectionKey>(
    collection: K,
    orderedIds: string[]
  ) => void

  // Referential Integrity
  getDependents: (collection: ContentCollectionKey, id: string) => DependentsResult
  unlinkDependents: (collection: ContentCollectionKey, id: string) => void
  deleteWithIntegrity: (collection: ContentCollectionKey, id: string) => void

  // Category Actions
  addEventCategory: (category: CategoryItem) => void
  removeEventCategory: (categoryId: string) => void
  addAnnouncementCategory: (category: CategoryItem) => void
  removeAnnouncementCategory: (categoryId: string) => void
  addClubCategory: (category: CategoryItem) => void
  removeClubCategory: (categoryId: string) => void

  // Backup & Restore
  exportStateJson: () => string
  importStateJson: (jsonString: string) => { success: boolean; message: string }
  resetContentData: () => void
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch {
      // Fallback if randomUUID fails
    }
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9)
}

const DEFAULT_EVENT_CATEGORIES: CategoryItem[] = [
  { id: 'workshop', label: 'Workshops', color: '#2563EB', icon: 'Wrench' },
  { id: 'hackathon', label: 'Hackathons', color: '#7C3AED', icon: 'Laptop' },
  { id: 'seminar', label: 'Seminars', color: '#0284C7', icon: 'Presentation' },
  { id: 'cultural', label: 'Cultural', color: '#DB2777', icon: 'Music' },
  { id: 'competition', label: 'Competitions', color: '#EA580C', icon: 'Trophy' },
  { id: 'sports', label: 'Sports', color: '#16A34A', icon: 'Medal' },
]

const DEFAULT_ANNOUNCEMENT_CATEGORIES: CategoryItem[] = [
  { id: 'academic', label: 'Academic', color: '#2563EB', icon: 'GraduationCap' },
  { id: 'examination', label: 'Examination', color: '#DC2626', icon: 'FileText' },
  { id: 'placement', label: 'Placement', color: '#16A34A', icon: 'Briefcase' },
  { id: 'event', label: 'Events', color: '#9333EA', icon: 'Calendar' },
  { id: 'general', label: 'General', color: '#4B5563', icon: 'Info' },
]

const DEFAULT_CLUB_CATEGORIES: CategoryItem[] = [
  { id: 'technical', label: 'Technical', color: '#2563EB', icon: 'Laptop' },
  { id: 'cultural', label: 'Cultural', color: '#DB2777', icon: 'Music' },
  { id: 'sports', label: 'Sports', color: '#16A34A', icon: 'Award' },
  { id: 'social', label: 'Social', color: '#7C3AED', icon: 'Heart' },
  { id: 'literary', label: 'Literary', color: '#EA580C', icon: 'BookOpen' },
]

export const getSeedDepartments = (): Department[] =>
  DEPARTMENTS.map((d) => ({
    ...d,
    semestersOffered: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  }))

export const getSeedTimetableSlots = (): TimetableSlot[] =>
  TIMETABLE_SLOTS.map((t) => ({
    ...t,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  }))

export const getSeedLocations = (): Location[] =>
  LOCATIONS.map((l) => ({
    ...l,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  }))

export const getSeedEvents = (): Event[] =>
  EVENTS.map((e) => ({
    ...e,
    status: (e.status as any) || 'Published',
    registrationOpen: e.registrationOpen ?? true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  }))

export const getSeedClubs = (): Club[] =>
  CLUBS.map((c) => ({
    ...c,
    status: (c.status as any) || 'Active',
    acceptingMembers: c.acceptingMembers ?? true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  }))

export const getSeedAnnouncements = (): Announcement[] =>
  ANNOUNCEMENTS.map((a) => ({
    ...a,
    status: (a.status as any) || 'Published',
    targetAudience: a.targetAudience || { type: 'all' },
    readCount: a.readCount ?? 142,
    createdAt: a.postedAt,
    updatedAt: a.postedAt,
    createdBy: a.postedBy,
  }))

export const getSeedFaculty = (): Faculty[] =>
  FACULTY.map((f) => ({
    ...f,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  }))

export const getSeedFacilities = (): Facility[] =>
  FACILITIES.map((fc) => ({
    ...fc,
    statusOverride: (fc.statusOverride as any) || 'auto',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  }))

export function ensureSeeds(state: any): any {
  if (!state || typeof state !== 'object') return state
  const seeded = { ...state }

  if (!Array.isArray(seeded.departments) || seeded.departments.length === 0) {
    seeded.departments = getSeedDepartments()
  }
  if (!Array.isArray(seeded.timetableSlots) || seeded.timetableSlots.length === 0) {
    seeded.timetableSlots = getSeedTimetableSlots()
  }
  if (!Array.isArray(seeded.locations) || seeded.locations.length === 0) {
    seeded.locations = getSeedLocations()
  }
  if (!Array.isArray(seeded.events) || seeded.events.length === 0) {
    seeded.events = getSeedEvents()
  }
  if (!Array.isArray(seeded.clubs) || seeded.clubs.length === 0) {
    seeded.clubs = getSeedClubs()
  }
  if (!Array.isArray(seeded.announcements) || seeded.announcements.length === 0) {
    seeded.announcements = getSeedAnnouncements()
  }
  if (!Array.isArray(seeded.faculty) || seeded.faculty.length === 0) {
    seeded.faculty = getSeedFaculty()
  }
  if (!Array.isArray(seeded.facilities) || seeded.facilities.length === 0) {
    seeded.facilities = getSeedFacilities()
  }
  if (!Array.isArray(seeded.notifications) || seeded.notifications.length === 0) {
    seeded.notifications = SEED_BROADCASTS
  }
  if (!Array.isArray(seeded.students) || seeded.students.length === 0) {
    seeded.students = SEED_STUDENTS
  }
  if (!Array.isArray(seeded.eventRegistrations) || seeded.eventRegistrations.length === 0) {
    seeded.eventRegistrations = SEED_EVENT_REGISTRATIONS
  }
  if (!Array.isArray(seeded.eventCategories) || seeded.eventCategories.length === 0) {
    seeded.eventCategories = DEFAULT_EVENT_CATEGORIES
  }
  if (!Array.isArray(seeded.announcementCategories) || seeded.announcementCategories.length === 0) {
    seeded.announcementCategories = DEFAULT_ANNOUNCEMENT_CATEGORIES
  }
  if (!Array.isArray(seeded.clubCategories) || seeded.clubCategories.length === 0) {
    seeded.clubCategories = DEFAULT_CLUB_CATEGORIES
  }

  return seeded
}

export const useContentStore = create<ContentStoreState>()(
  persist(
    (set, get) => ({
      departments: getSeedDepartments(),
      timetableSlots: getSeedTimetableSlots(),
      locations: getSeedLocations(),
      events: getSeedEvents(),
      clubs: getSeedClubs(),
      announcements: getSeedAnnouncements(),
      faculty: getSeedFaculty(),
      facilities: getSeedFacilities(),
      notifications: SEED_BROADCASTS,
      students: SEED_STUDENTS,
      eventRegistrations: SEED_EVENT_REGISTRATIONS,

      eventCategories: DEFAULT_EVENT_CATEGORIES,
      announcementCategories: DEFAULT_ANNOUNCEMENT_CATEGORIES,
      clubCategories: DEFAULT_CLUB_CATEGORIES,

      createItem: (collection, itemData, authorEmail = 'admin@demo.edu') => {
        const id = generateUuid()
        const now = new Date().toISOString()
        const newItem = {
          ...itemData,
          id,
          createdAt: now,
          updatedAt: now,
          createdBy: authorEmail,
        }

        set((state) => ({
          ...state,
          [collection]: [newItem, ...(state[collection] as any[])],
        }))

        return newItem as any
      },

      updateItem: (collection, id, updates, updaterEmail = 'admin@demo.edu') => {
        const now = new Date().toISOString()
        set((state) => ({
          ...state,
          [collection]: (state[collection] as any[]).map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  updatedAt: now,
                  updatedBy: updaterEmail,
                }
              : item
          ),
        }))
      },

      removeItem: (collection, id) => {
        // Run referential unlinking automatically
        get().unlinkDependents(collection, id)

        set((state) => ({
          ...state,
          [collection]: (state[collection] as any[]).filter((item) => item.id !== id),
        }))
      },

      bulkRemove: (collection, ids) => {
        const idSet = new Set(ids)
        // Unlink each
        for (const id of ids) {
          get().unlinkDependents(collection, id)
        }

        set((state) => ({
          ...state,
          [collection]: (state[collection] as any[]).filter((item) => !idSet.has(item.id)),
        }))
      },

      duplicateItem: (collection, id, authorEmail = 'admin@demo.edu') => {
        const collectionItems = get()[collection] as any[]
        const target = collectionItems.find((item) => item.id === id)
        if (!target) return null

        const newId = generateUuid()
        const now = new Date().toISOString()
        const duplicated = {
          ...target,
          id: newId,
          title: target.title ? `${target.title} (Copy)` : undefined,
          name: target.name ? `${target.name} (Copy)` : undefined,
          createdAt: now,
          updatedAt: now,
          createdBy: authorEmail,
        }

        // Specific cleanups for duplicates
        if (collection === 'events') {
          duplicated.registeredCount = 0
        } else if (collection === 'clubs') {
          duplicated.memberCount = 0
          duplicated.upcomingEventIds = []
        } else if (collection === 'announcements') {
          duplicated.readCount = 0
          duplicated.status = 'Draft'
        } else if (collection === 'notifications') {
          duplicated.recipientsCount = 0
          duplicated.readCount = 0
          duplicated.status = 'scheduled'
        }

        set((state) => ({
          ...state,
          [collection]: [duplicated, ...(state[collection] as any[])],
        }))

        return duplicated
      },

      reorderItems: (collection, orderedIds) => {
        const items = get()[collection] as any[]
        const map = new Map(items.map((it) => [it.id, it]))
        const reordered = orderedIds.map((id) => map.get(id)).filter(Boolean) as any[]
        // Append any items not in orderedIds to preserve data
        for (const it of items) {
          if (!orderedIds.includes(it.id)) {
            reordered.push(it)
          }
        }
        set((state) => ({
          ...state,
          [collection]: reordered,
        }))
      },

      getDependents: (collection, id) => {
        const {
          events,
          timetableSlots,
          facilities,
          faculty,
          clubs,
          students,
          eventRegistrations,
        } = get()
        const groups: DependentGroup[] = []

        if (collection === 'locations') {
          const usedEvents = events.filter((e) => e.locationId === id)
          if (usedEvents.length > 0) {
            groups.push({
              type: 'events',
              label: 'Events',
              count: usedEvents.length,
              items: usedEvents.map((e) => ({ id: e.id, name: e.title })),
            })
          }

          const usedSlots = timetableSlots.filter((t) => t.locationId === id)
          if (usedSlots.length > 0) {
            groups.push({
              type: 'timetableSlots',
              label: 'Timetable Slots',
              count: usedSlots.length,
              items: usedSlots.map((t) => ({ id: t.id, name: `${t.subject} (${t.day} ${t.start})` })),
            })
          }

          const usedFacilities = facilities.filter((f) => f.locationId === id)
          if (usedFacilities.length > 0) {
            groups.push({
              type: 'facilities',
              label: 'Facilities',
              count: usedFacilities.length,
              items: usedFacilities.map((f) => ({ id: f.id, name: f.name })),
            })
          }

          const usedFaculty = faculty.filter((f) => f.officeLocationId === id)
          if (usedFaculty.length > 0) {
            groups.push({
              type: 'faculty',
              label: 'Faculty Offices',
              count: usedFaculty.length,
              items: usedFaculty.map((f) => ({ id: f.id, name: f.name })),
            })
          }

          const savedStudents = students.filter((s) => s.savedLocationIds?.includes(id))
          if (savedStudents.length > 0) {
            groups.push({
              type: 'students',
              label: 'Students Saved Map Pins',
              count: savedStudents.length,
              items: savedStudents.map((s) => ({ id: s.id, name: s.name })),
            })
          }
        } else if (collection === 'clubs') {
          const usedEvents = events.filter((e) => e.organizerClubId === id)
          if (usedEvents.length > 0) {
            groups.push({
              type: 'events',
              label: 'Organized Events',
              count: usedEvents.length,
              items: usedEvents.map((e) => ({ id: e.id, name: e.title })),
            })
          }

          const memberStudents = students.filter((s) => s.joinedClubIds?.includes(id))
          if (memberStudents.length > 0) {
            groups.push({
              type: 'students',
              label: 'Enrolled Members',
              count: memberStudents.length,
              items: memberStudents.map((s) => ({ id: s.id, name: s.name })),
            })
          }
        } else if (collection === 'events') {
          const organizingClubs = clubs.filter((c) => c.upcomingEventIds?.includes(id))
          if (organizingClubs.length > 0) {
            groups.push({
              type: 'clubs',
              label: 'Clubs Featuring Event',
              count: organizingClubs.length,
              items: organizingClubs.map((c) => ({ id: c.id, name: c.name })),
            })
          }

          const registeredStudents = students.filter((s) => s.registeredEventIds?.includes(id))
          if (registeredStudents.length > 0) {
            groups.push({
              type: 'students',
              label: 'Registered Students',
              count: registeredStudents.length,
              items: registeredStudents.map((s) => ({ id: s.id, name: s.name })),
            })
          }
        } else if (collection === 'departments') {
          const dept = get().departments.find((d) => d.id === id)
          const deptCode = dept?.code || ''

          const deptStudents = students.filter((s) => s.department === deptCode)
          if (deptStudents.length > 0) {
            groups.push({
              type: 'students',
              label: 'Enrolled Students',
              count: deptStudents.length,
              items: deptStudents.map((s) => ({ id: s.id, name: s.name })),
            })
          }

          const deptFaculty = faculty.filter((f) => f.departmentId === deptCode)
          if (deptFaculty.length > 0) {
            groups.push({
              type: 'faculty',
              label: 'Faculty Members',
              count: deptFaculty.length,
              items: deptFaculty.map((f) => ({ id: f.id, name: f.name })),
            })
          }

          const deptSlots = timetableSlots.filter((t) => t.department === deptCode)
          if (deptSlots.length > 0) {
            groups.push({
              type: 'timetableSlots',
              label: 'Timetable Slots',
              count: deptSlots.length,
              items: deptSlots.map((t) => ({ id: t.id, name: `${t.subject} (${t.day} Sem ${t.semester})` })),
            })
          }
        } else if (collection === 'faculty') {
          const facultyMember = get().faculty.find((f) => f.id === id)
          const facultyName = facultyMember?.name || ''

          const taughtSlots = timetableSlots.filter(
            (t) => t.faculty === facultyName || (t as any).facultyId === id
          )
          if (taughtSlots.length > 0) {
            groups.push({
              type: 'timetableSlots',
              label: 'Assigned Timetable Slots',
              count: taughtSlots.length,
              items: taughtSlots.map((t) => ({ id: t.id, name: `${t.subject} (${t.day} ${t.start})` })),
            })
          }

          const coordinatedClubs = clubs.filter((c) => c.coordinator === facultyName)
          if (coordinatedClubs.length > 0) {
            groups.push({
              type: 'clubs',
              label: 'Coordinated Clubs',
              count: coordinatedClubs.length,
              items: coordinatedClubs.map((c) => ({ id: c.id, name: c.name })),
            })
          }
        } else if (collection === 'students') {
          const studentRegs = eventRegistrations.filter((r) => r.studentId === id)
          if (studentRegs.length > 0) {
            groups.push({
              type: 'eventRegistrations',
              label: 'Event Registrations',
              count: studentRegs.length,
              items: studentRegs.map((r) => ({ id: r.id, name: `Event Registration (${r.eventId})` })),
            })
          }
        }

        const totalCount = groups.reduce((acc, g) => acc + g.count, 0)
        const summaryDesc = groups.map((g) => `${g.count} ${g.label.toLowerCase()}`).join(', ')

        return {
          hasDependents: totalCount > 0,
          count: totalCount,
          groups,
          description: totalCount > 0 ? `This record is used by ${summaryDesc}.` : 'No dependent records found.',
        }
      },

      unlinkDependents: (collection, id) => {
        set((state) => {
          let {
            events,
            timetableSlots,
            facilities,
            faculty,
            clubs,
            students,
            eventRegistrations,
          } = state

          if (collection === 'locations') {
            events = events.map((e) =>
              e.locationId === id ? { ...e, locationId: '' } : e
            )
            timetableSlots = timetableSlots.map((t) =>
              t.locationId === id ? { ...t, locationId: '', room: 'Location not set' } : t
            )
            facilities = facilities.map((f) =>
              f.locationId === id ? { ...f, locationId: '' } : f
            )
            faculty = faculty.map((f) =>
              f.officeLocationId === id ? { ...f, officeLocationId: '' } : f
            )
            students = students.map((s) => ({
              ...s,
              savedLocationIds: s.savedLocationIds?.filter((locId) => locId !== id),
            }))
          } else if (collection === 'clubs') {
            events = events.map((e) =>
              e.organizerClubId === id ? { ...e, organizerClubId: undefined } : e
            )
            students = students.map((s) => ({
              ...s,
              joinedClubIds: s.joinedClubIds?.filter((clubId) => clubId !== id),
            }))
          } else if (collection === 'events') {
            clubs = clubs.map((c) => ({
              ...c,
              upcomingEventIds: c.upcomingEventIds?.filter((eventId) => eventId !== id),
            }))
            students = students.map((s) => ({
              ...s,
              registeredEventIds: s.registeredEventIds?.filter((eventId) => eventId !== id),
            }))
            eventRegistrations = eventRegistrations.filter((r) => r.eventId !== id)
          } else if (collection === 'faculty') {
            const member = faculty.find((f) => f.id === id)
            const name = member?.name || ''
            timetableSlots = timetableSlots.map((t) =>
              t.faculty === name ? { ...t, faculty: 'Faculty unassigned' } : t
            )
          } else if (collection === 'students') {
            eventRegistrations = eventRegistrations.filter((r) => r.studentId !== id)
          }

          return {
            events,
            timetableSlots,
            facilities,
            faculty,
            clubs,
            students,
            eventRegistrations,
          }
        })
      },

      deleteWithIntegrity: (collection, id) => {
        get().removeItem(collection, id)
      },

      addEventCategory: (category) => {
        set((state) => ({
          eventCategories: [...state.eventCategories, category],
        }))
      },

      removeEventCategory: (categoryId) => {
        set((state) => ({
          eventCategories: state.eventCategories.filter((c) => c.id !== categoryId),
        }))
      },

      addAnnouncementCategory: (category) => {
        set((state) => ({
          announcementCategories: [...state.announcementCategories, category],
        }))
      },

      removeAnnouncementCategory: (categoryId) => {
        set((state) => ({
          announcementCategories: state.announcementCategories.filter((c) => c.id !== categoryId),
        }))
      },

      addClubCategory: (category) => {
        set((state) => ({
          clubCategories: [...state.clubCategories, category],
        }))
      },

      removeClubCategory: (categoryId) => {
        set((state) => ({
          clubCategories: state.clubCategories.filter((c) => c.id !== categoryId),
        }))
      },

      exportStateJson: () => {
        const state = get()
        const exportData = {
          version: 'campus-companion-v1',
          exportedAt: new Date().toISOString(),
          departments: state.departments,
          timetableSlots: state.timetableSlots,
          locations: state.locations,
          events: state.events,
          clubs: state.clubs,
          announcements: state.announcements,
          faculty: state.faculty,
          facilities: state.facilities,
          notifications: state.notifications,
          students: state.students,
          eventRegistrations: state.eventRegistrations,
          eventCategories: state.eventCategories,
          announcementCategories: state.announcementCategories,
          clubCategories: state.clubCategories,
        }
        return JSON.stringify(exportData, null, 2)
      },

      importStateJson: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString)
          if (!parsed || typeof parsed !== 'object') {
            return { success: false, message: 'Invalid JSON format in backup file.' }
          }

          if (
            !Array.isArray(parsed.departments) ||
            !Array.isArray(parsed.events) ||
            !Array.isArray(parsed.locations)
          ) {
            return {
              success: false,
              message: 'JSON file is missing required campus data collections.',
            }
          }

          set({
            departments: parsed.departments || [],
            timetableSlots: parsed.timetableSlots || [],
            locations: parsed.locations || [],
            events: parsed.events || [],
            clubs: parsed.clubs || [],
            announcements: parsed.announcements || [],
            faculty: parsed.faculty || [],
            facilities: parsed.facilities || [],
            notifications: parsed.notifications || [],
            students: parsed.students || [],
            eventRegistrations: parsed.eventRegistrations || [],
            eventCategories: parsed.eventCategories || DEFAULT_EVENT_CATEGORIES,
            announcementCategories: parsed.announcementCategories || DEFAULT_ANNOUNCEMENT_CATEGORIES,
            clubCategories: parsed.clubCategories || DEFAULT_CLUB_CATEGORIES,
          })

          return { success: true, message: 'Campus Companion data restored successfully from backup.' }
        } catch (err: any) {
          return { success: false, message: `Failed to import JSON: ${err.message}` }
        }
      },

      resetContentData: () => {
        set({
          departments: getSeedDepartments(),
          timetableSlots: getSeedTimetableSlots(),
          locations: getSeedLocations(),
          events: getSeedEvents(),
          clubs: getSeedClubs(),
          announcements: getSeedAnnouncements(),
          faculty: getSeedFaculty(),
          facilities: getSeedFacilities(),
          notifications: SEED_BROADCASTS,
          students: SEED_STUDENTS,
          eventRegistrations: SEED_EVENT_REGISTRATIONS,
          eventCategories: DEFAULT_EVENT_CATEGORIES,
          announcementCategories: DEFAULT_ANNOUNCEMENT_CATEGORIES,
          clubCategories: DEFAULT_CLUB_CATEGORIES,
        })
      },
    }),
    {
      name: 'campus-companion-content-v1',
      version: 2,
      migrate: (persistedState: any, _version: number) => {
        return ensureSeeds(persistedState)
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const updated = ensureSeeds(state)
          let hasDiff = false
          for (const key of Object.keys(updated)) {
            if ((state as any)[key] !== updated[key]) {
              hasDiff = true
              break
            }
          }
          if (hasDiff) {
            useContentStore.setState(updated)
          }
        }
      },
    }
  )
)
