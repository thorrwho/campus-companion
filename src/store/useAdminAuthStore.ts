import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin'
  avatarInitials: string
}

export const DEMO_ADMIN: AdminUser = {
  id: 'admin-1',
  name: 'Campus Administrator',
  email: 'admin@demo.edu',
  role: 'admin',
  avatarInitials: 'CA',
}

interface AdminAuthState {
  adminUser: AdminUser | null
  isAdminAuthenticated: boolean
  isViewingAsStudent: boolean
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logoutAdmin: () => void
  setViewAsStudent: (viewing: boolean) => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      adminUser: null,
      isAdminAuthenticated: false,
      isViewingAsStudent: false,

      loginAdmin: async (email: string, password: string) => {
        const cleanEmail = email.trim().toLowerCase()

        // Demo admin credentials check
        if (cleanEmail === 'admin@demo.edu') {
          if (password !== 'Admin@1234') {
            return {
              success: false,
              error: 'Invalid password. For demo admin, use Admin@1234',
            }
          }

          set({
            adminUser: DEMO_ADMIN,
            isAdminAuthenticated: true,
            isViewingAsStudent: false,
          })

          return { success: true }
        }

        // Generic admin simulation check
        if (cleanEmail.includes('admin') || cleanEmail.endsWith('@demo.edu')) {
          if (password.length < 6) {
            return {
              success: false,
              error: 'Password must be at least 6 characters long.',
            }
          }

          const initials = cleanEmail.substring(0, 2).toUpperCase()
          set({
            adminUser: {
              id: `admin-${Date.now()}`,
              name: cleanEmail.split('@')[0],
              email: cleanEmail,
              role: 'admin',
              avatarInitials: initials,
            },
            isAdminAuthenticated: true,
            isViewingAsStudent: false,
          })

          return { success: true }
        }

        return {
          success: false,
          error: 'Administrator account not found. Try admin@demo.edu with Admin@1234',
        }
      },

      logoutAdmin: () => {
        set({
          adminUser: null,
          isAdminAuthenticated: false,
          isViewingAsStudent: false,
        })
      },

      setViewAsStudent: (viewing: boolean) => {
        set({ isViewingAsStudent: viewing })
      },
    }),
    {
      name: 'campus-companion-admin-auth-v1',
    }
  )
)
