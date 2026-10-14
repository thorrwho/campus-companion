import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'

export const AccessDeniedPage: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-overlay border-border">
        <div className="w-16 h-16 rounded-full bg-status-error/10 text-status-error flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-h2 font-bold text-text-primary">Access Denied</h1>
          <p className="text-small text-text-secondary leading-relaxed">
            Administrator privileges are required to access this portal.
            {user && (
              <span className="block mt-1 font-medium text-text-primary">
                Current account: {user.name} ({user.email})
              </span>
            )}
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Link to="/" className="block">
            <Button variant="primary" size="lg" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Student Portal
            </Button>
          </Link>

          <Link to="/admin/login" className="block">
            <Button variant="outline" size="md" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In as Administrator
            </Button>
          </Link>
        </div>

        <p className="text-caption text-text-muted pt-2 border-t border-border">
          Prototype: admin access is simulated and separated from student sessions.
        </p>
      </Card>
    </div>
  )
}
