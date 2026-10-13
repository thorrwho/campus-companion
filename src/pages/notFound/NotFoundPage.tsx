import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Home, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-20 h-20 rounded-modal bg-accent-100 text-primary-600 flex items-center justify-center mb-6 shadow-card">
        <Compass className="w-10 h-10 stroke-[1.75]" aria-hidden="true" />
      </div>

      <span className="text-caption font-semibold uppercase tracking-wider text-primary-600 bg-accent-100/70 px-3 py-1 rounded-full mb-3">
        Error 404
      </span>

      <h1 className="text-display text-text-primary font-bold">Page Not Found</h1>

      <p className="text-body text-text-secondary max-w-md mt-2 mb-8">
        We could not find the campus resource you were looking for. It may have moved or the link might be broken.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/map">
          <Button variant="outline" size="md" leftIcon={<MapPin className="w-4 h-4" />}>
            Explore Campus Map
          </Button>
        </Link>
        <Link to="/events">
          <Button variant="ghost" size="md" leftIcon={<Calendar className="w-4 h-4" />}>
            View Events
          </Button>
        </Link>
      </div>
    </div>
  )
}
