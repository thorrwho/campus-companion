import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  initials: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  name,
  size = 'md',
  className,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-caption',
    md: 'w-10 h-10 text-small font-semibold',
    lg: 'w-14 h-14 text-h3 font-bold',
  }

  return (
    <div
      title={name}
      aria-label={name ? `${name} avatar` : 'User avatar'}
      role="img"
      className={cn(
        'rounded-full bg-primary-100 text-primary-700 bg-accent-100 flex items-center justify-center font-medium border border-primary-600/20 shrink-0 select-none tracking-wider',
        sizeMap[size],
        className
      )}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}
