export type DepartmentCode = 'CSE' | 'CSE-AIML' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | (string & {})

export type UserRole = 'student' | 'admin'

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
  status?: 'Active' | 'Suspended'
  role?: UserRole
  joinedAt?: string
  registeredEventIds?: string[]
  joinedClubIds?: string[]
  savedLocationIds?: string[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export interface Department {
  id: string
  name: string
  code: DepartmentCode
  semestersOffered?: number // 1 to 8
  createdAt?: string
  updatedAt?: string
  createdBy?: string
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
  createdAt?: string
  updatedAt?: string
  createdBy?: string
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
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export type EventCategory =
  | 'workshop'
  | 'hackathon'
  | 'seminar'
  | 'cultural'
  | 'competition'
  | 'sports'
  | (string & {})

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
  status?: 'Draft' | 'Published' | 'Cancelled'
  bannerIcon?: string
  bannerColor?: string
  registrationOpen?: boolean
  cancellationReason?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export type ClubCategory = 'technical' | 'cultural' | 'sports' | 'social' | 'literary' | (string & {})

export interface ClubSocialLink {
  platform: string
  url: string
}

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
  icon?: string
  color?: string
  studentLeadName?: string
  socialLinks?: ClubSocialLink[]
  acceptingMembers?: boolean
  status?: 'Active' | 'Inactive'
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export type AnnouncementCategory =
  | 'academic'
  | 'examination'
  | 'placement'
  | 'event'
  | 'general'
  | (string & {})

export interface TargetAudience {
  type: 'all' | 'specific'
  departments?: DepartmentCode[]
  semesters?: number[]
}

export interface Announcement {
  id: string
  title: string
  category: AnnouncementCategory
  body: string[] | string // supports paragraphs array or markdown string
  postedBy: string
  postedAt: string // ISO date string
  isImportant: boolean
  attachmentName?: string
  pinned?: boolean
  targetAudience?: TargetAudience
  status?: 'Draft' | 'Published' | 'Scheduled' | 'Archived'
  publishDateTime?: string
  expiryDate?: string
  readCount?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
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
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export type FacilityStatus = 'open' | 'closed' | 'limited'

export interface FacilityDaySchedule {
  closed: boolean
  openTime: string
  closeTime: string
}

export interface Facility {
  id: string
  name: string
  type: string
  locationId: string
  openHours: Record<string, string> // e.g. { "Monday to Friday": "08:00 - 20:00" }
  weeklyHours?: Record<string, FacilityDaySchedule>
  services: string[]
  contact: string
  status: FacilityStatus
  statusOverride?: 'auto' | 'force_open' | 'force_closed' | 'limited'
  statusMessage?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
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

export interface BroadcastNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  link?: string
  audience: TargetAudience
  status: 'sent' | 'scheduled' | 'recalled'
  scheduledFor?: string // ISO date string
  sentAt?: string // ISO date string
  recipientsCount: number
  readCount: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export interface EventRegistration {
  id: string
  eventId: string
  studentId: string
  registeredAt: string
  attended: boolean
}

export interface ActivityLogItem {
  id: string
  timestamp: string
  userEmail: string
  userName: string
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'bulk_delete'
    | 'publish'
    | 'cancel'
    | 'suspend'
    | 'reactivate'
    | 'restore'
  itemType:
    | 'announcement'
    | 'event'
    | 'club'
    | 'notification'
    | 'location'
    | 'facility'
    | 'faculty'
    | 'department'
    | 'timetable'
    | 'student'
    | 'registration'
  itemId: string
  itemName: string
  summary: string
  previousData?: unknown
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

