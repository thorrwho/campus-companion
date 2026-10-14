import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { useAuthStore } from '@/store/useAuthStore'
import { AccessDeniedPage } from '@/pages/admin/auth/AccessDeniedPage'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation()
  const { isAdminAuthenticated } = useAdminAuthStore()
  const { isAuthenticated: isStudentAuthenticated } = useAuthStore()

  // 1. If logged in as admin, allow access
  if (isAdminAuthenticated) {
    return <>{children}</>
  }

  // 2. If logged in as student without admin rights, show styled Access Denied page
  if (isStudentAuthenticated) {
    return <AccessDeniedPage />
  }

  // 3. If unauthenticated, redirect to admin login
  return <Navigate to="/admin/login" state={{ from: location }} replace />
}
