import { create } from 'zustand'
import { ToastMessage, ToastType } from '@/types'

interface ToastState {
  toasts: ToastMessage[]
  push: (toast: { type: ToastType; message: string }) => void
  dismiss: (id: string) => void
}

let toastCounter = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ type, message }) => {
    const id = `toast-${Date.now()}-${++toastCounter}`
    set((state) => {
      // keep max 3 visible
      const updated = [...state.toasts, { id, type, message }]
      if (updated.length > 3) {
        return { toasts: updated.slice(updated.length - 3) }
      }
      return { toasts: updated }
    })

    // auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
