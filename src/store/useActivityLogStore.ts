import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ActivityLogItem } from '@/types'
import { useContentStore, ContentCollectionKey } from './useContentStore'

interface DeletedSnapshot {
  itemType: ContentCollectionKey
  itemData: any
  dependentsSnapshot?: any
  timestamp: number
}

interface ActivityLogState {
  activities: ActivityLogItem[]
  lastDeleted: DeletedSnapshot | null

  addActivity: (activity: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void
  setLastDeleted: (snapshot: DeletedSnapshot | null) => void
  undoLastDelete: () => { success: boolean; message: string }
  clearActivities: () => void
}

const INITIAL_ACTIVITIES: ActivityLogItem[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'publish',
    itemType: 'announcement',
    itemId: 'ann-midterm-schedule',
    itemName: 'Mid-Semester Examination Schedule for Odd Semesters',
    summary: 'Published circular targeting Semesters 3, 5, and 7 students',
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55m ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'update',
    itemType: 'event',
    itemId: 'event-ai-hackathon',
    itemName: 'Nexus 48-Hour AI/ML Hackathon 2026',
    summary: 'Increased attendee capacity from 80 to 100 seats',
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 130).toISOString(), // ~2h ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'create',
    itemType: 'notification',
    itemId: 'notif-1',
    itemName: 'Reminder: Nexus 48-Hour AI/ML Hackathon Starts Tomorrow',
    summary: 'Broadcast sent to all campus students',
  },
  {
    id: 'act-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4h ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'update',
    itemType: 'facility',
    itemId: 'fac-central-library',
    itemName: 'Dr. APJ Abdul Kalam Central Library',
    summary: 'Updated study floor opening hours to 24/7',
  },
  {
    id: 'act-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(), // 7h ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'create',
    itemType: 'faculty',
    itemId: 'fac-priya-ramanathan',
    itemName: 'Dr. Priya Ramanathan',
    summary: 'Added faculty member in Artificial Intelligence & Machine Learning',
  },
  {
    id: 'act-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10h ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'update',
    itemType: 'timetable',
    itemId: 'slot-1',
    itemName: 'Deep Learning Practical Lab',
    summary: 'Assigned Turing Complex Room 204 for Monday slot',
  },
  {
    id: 'act-7',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'suspend',
    itemType: 'student',
    itemId: 'student-9',
    itemName: 'Aditya Joshi',
    summary: 'Placed student account on temporary disciplinary hold',
  },
  {
    id: 'act-8',
    timestamp: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), // 2 days ago
    userEmail: 'admin@demo.edu',
    userName: 'Campus Administrator',
    action: 'create',
    itemType: 'club',
    itemId: 'club-ai-robotics',
    itemName: 'Nexus AI & Robotics Society',
    summary: 'Created campus innovation club record',
  },
]

export const useActivityLogStore = create<ActivityLogState>()(
  persist(
    (set, get) => ({
      activities: INITIAL_ACTIVITIES,
      lastDeleted: null,

      addActivity: (activityData) => {
        const id = 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
        const newActivity: ActivityLogItem = {
          ...activityData,
          id,
          timestamp: new Date().toISOString(),
        }

        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 300), // maintain last 300
        }))
      },

      setLastDeleted: (snapshot) => {
        set({ lastDeleted: snapshot })
      },

      undoLastDelete: () => {
        const { lastDeleted } = get()
        if (!lastDeleted) {
          return { success: false, message: 'Nothing to undo.' }
        }

        const elapsed = Date.now() - lastDeleted.timestamp
        if (elapsed > 30000) { // 30 second safety margin for undo
          set({ lastDeleted: null })
          return { success: false, message: 'Undo window has expired.' }
        }

        const { itemType, itemData } = lastDeleted
        const contentStore = useContentStore.getState()

        // Restore item in collection
        const existing = (contentStore[itemType] as any[]).find((it) => it.id === itemData.id)
        if (!existing) {
          useContentStore.setState((state) => ({
            ...state,
            [itemType]: [itemData, ...(state[itemType] as any[])],
          }))
        }

        // Add restore activity log
        get().addActivity({
          userEmail: 'admin@demo.edu',
          userName: 'Campus Administrator',
          action: 'restore',
          itemType: itemType as any,
          itemId: itemData.id,
          itemName: itemData.title || itemData.name || itemData.subject || 'Record',
          summary: `Restored deleted ${itemType.slice(0, -1) || itemType} record`,
        })

        set({ lastDeleted: null })

        return {
          success: true,
          message: `Restored ${itemData.title || itemData.name || 'item'} successfully.`,
        }
      },

      clearActivities: () => {
        set({ activities: [], lastDeleted: null })
      },
    }),
    {
      name: 'campus-companion-activity-v1',
    }
  )
)
