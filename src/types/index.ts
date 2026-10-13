export type DepartmentCode = 'CSE' | 'CSE-AIML' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL'

export interface Student {
  id: string
  name: string
  email: string
  rollNo: string
  department: DepartmentCode
  semester: number
  avatarInitials: string
  phone?: string
  interests?: string[]
  bio?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  cgpa?: string
  attendance?: string
  section?: string
}

export interface Department {
  id: string
  name: string
  code: DepartmentCode
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export interface TimetableSlot {
  id: string
  day: DayOfWeek
  start: string
  end: string
  subject: string
  code: string
  room: string
  locationId: string
  faculty: string
  department: DepartmentCode
  semester: number
}

export type LocationType =
  | 'department'
  | 'classroom'
  | 'lab'
  | 'library'
  | 'canteen'
  | 'auditorium'
  | 'parking'
  | 'admin'
  | 'medical'
  | 'sports'

export interface Location {
  id: string
  name: string
  type: LocationType
  building: string
  floor: string
  description: string
  mapX: number // percentage (0 to 100)
  mapY: number // percentage (0 to 100)
  directions: string[]
  openHours?: string
}

export type EventCategory =
  | 'workshop'
  | 'hackathon'
  | 'seminar'
  | 'cultural'
  | 'competition'
  | 'sports'

export interface Event {
  id: string
  title: string
  category: EventCategory
  date: string // ISO date YYYY-MM-DD
  startTime: string
  endTime: string
  locationId: string
  organizerClubId?: string
  description: string
  capacity: number
  registeredCount: number
  tags: string[]
  registrationDeadline: string // ISO date string
}

export type ClubCategory = 'technical' | 'cultural' | 'sports' | 'social' | 'literary'

export interface Club {
  id: string
  name: string
  category: ClubCategory
  shortDescription: string
  description: string
  activities: string[]
  memberCount: number
  meetingSchedule: string
  coordinator: string
  upcomingEventIds: string[]
}

export type AnnouncementCategory =
  | 'academic'
  | 'examination'
  | 'placement'
  | 'event'
  | 'general'

export interface Announcement {
  id: string
  title: string
  category: AnnouncementCategory
  body: string[] // 2 to 4 paragraphs
  postedBy: string
  postedAt: string // ISO date string
  isImportant: boolean
  attachmentName?: string
}

export interface Faculty {
  id: string
  name: string
  designation: string
  departmentId: DepartmentCode
  officeLocationId: string
  email: string
  officeHours: string
  subjects: string[]
  initials: string
}

export type FacilityStatus = 'open' | 'closed' | 'limited'

export interface Facility {
  id: string
  name: string
  type: string
  locationId: string
  openHours: Record<string, string> // e.g. { "Monday to Friday": "08:00 - 20:00", ... }
  services: string[]
  contact: string
  status: FacilityStatus
  notes?: string
}

export type NotificationType = 'event' | 'announcement' | 'club' | 'reminder' | 'system'

export interface NotificationItemData {
  id: string
  type: NotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  link: string
}

export interface NotificationPrefs {
  events: boolean
  announcements: boolean
  clubs: boolean
  reminders: boolean
  email: boolean
}

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}
