import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DepartmentCode, Student } from '@/types'

export const DEMO_USER: Student = {
  id: 'student-demo',
  name: 'Aarav Sharma',
  email: 'demo@demo.edu',
  rollNo: '23CS1A0501',
  department: 'CSE-AIML',
  semester: 5,
  section: 'A',
  cgpa: '8.84',
  attendance: '91%',
  avatarInitials: 'AS',
  phone: '+91 98765 43210',
  bio: 'Pre-final year Artificial Intelligence and Machine Learning student passionate about computer vision, robotics, and campus open-source initiatives.',
  emergencyContactName: 'Rajesh Sharma (Parent)',
  emergencyContactPhone: '+91 98765 11223',
  interests: ['workshop', 'hackathon', 'cultural'],
}

interface AuthState {
  user: Student | null
  isAuthenticated: boolean
  hasOnboarded: boolean
  rememberMe: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  signup: (userData: { name: string; email: string; rollNo: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  completeOnboarding: (department: DepartmentCode, semester: number, interests: string[]) => void
  updateProfile: (updatedData: Partial<Student>) => void
  resetAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasOnboarded: false,
      rememberMe: false,

      login: async (email: string, password: string, rememberMe = false) => {
        const cleanEmail = email.trim().toLowerCase()

        if (password === 'wrongpass1') {
          return { success: false, error: 'Incorrect email or password. Please try again.' }
        }

        // Demo login or simulated matching user
        let loggedInUser = get().user
        if (!loggedInUser || loggedInUser.email.toLowerCase() !== cleanEmail) {
          const initials = cleanEmail
            .split('@')[0]
            .slice(0, 2)
            .toUpperCase()

          loggedInUser = {
            id: `student-${Date.now()}`,
            name: cleanEmail === 'demo@demo.edu' ? DEMO_USER.name : cleanEmail.split('@')[0],
            email: cleanEmail,
            rollNo: cleanEmail === 'demo@demo.edu' ? DEMO_USER.rollNo : '23CS1A0599',
            department: 'CSE-AIML',
            semester: 5,
            avatarInitials: cleanEmail === 'demo@demo.edu' ? DEMO_USER.avatarInitials : initials,
            interests: ['workshop', 'hackathon'],
          }
        }

        set({
          user: loggedInUser,
          isAuthenticated: true,
          hasOnboarded: get().hasOnboarded || cleanEmail === 'demo@demo.edu',
          rememberMe,
        })

        return { success: true }
      },

      signup: async (userData: { name: string; email: string; rollNo: string }) => {
        const cleanEmail = userData.email.trim().toLowerCase()

        if (cleanEmail === 'taken@demo.edu') {
          return {
            success: false,
            error: 'An account with this email already exists. Log in instead?',
          }
        }

        const nameParts = userData.name.trim().split(' ')
        const initials =
          nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : userData.name.slice(0, 2).toUpperCase()

        const newUser: Student = {
          id: `student-${Date.now()}`,
          name: userData.name.trim(),
          email: cleanEmail,
          rollNo: userData.rollNo.trim().toUpperCase(),
          department: 'CSE',
          semester: 1,
          avatarInitials: initials,
          interests: [],
        }

        set({
          user: newUser,
          isAuthenticated: true,
          hasOnboarded: false,
        })

        return { success: true }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      completeOnboarding: (department: DepartmentCode, semester: number, interests: string[]) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              department,
              semester,
              interests,
            },
            hasOnboarded: true,
          })
        } else {
          set({ hasOnboarded: true })
        }
      },

      updateProfile: (updatedData: Partial<Student>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updatedData,
            },
          })
        }
      },

      resetAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          hasOnboarded: false,
          rememberMe: false,
        })
      },
    }),
    {
      name: 'campus-companion-v1-auth',
    }
  )
)
