import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  Users,
  Info,
  Trash2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { NotificationItemData, NotificationType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  event: Calendar,
  announcement: Bell,
  reminder: Clock,
  club: Users,
  system: Info,
}

const TYPE_VARIANTS: Record<NotificationType, 'primary' | 'warning' | 'info' | 'success' | 'default'> = {
  event: 'primary',
  announcement: 'warning',
  reminder: 'info',
  club: 'success',
  system: 'default',
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotification } = useUserStore()
  const { push: pushToast } = useToastStore()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read)
    }
    return notifications
  }, [notifications, filter])

  // Group by Today vs Earlier
  const { todayItems, earlierItems } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayList: NotificationItemData[] = []
    const earlierList: NotificationItemData[] = []

    filteredNotifications.forEach((item) => {
      const itemDate = item.createdAt.slice(0, 10)
      if (itemDate >= today) {
        todayList.push(item)
      } else {
        earlierList.push(item)
      }
    })

    return { todayItems: todayList, earlierItems: earlierList }
  }, [filteredNotifications])

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
    pushToast({
      type: 'success',
      message: 'All notifications marked as read.',
    })
  }

  const handleItemClick = (item: NotificationItemData) => {
    if (!item.read) {
      markNotificationRead(item.id)
    }
    if (item.link) {
      navigate(item.link)
    }
  }

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    clearNotification(id)
    pushToast({
      type: 'info',
      message: 'Notification removed.',
    })
  }

  const handleToggleRead = (e: React.MouseEvent, id: string, currentRead: boolean) => {
    e.stopPropagation()
    if (!currentRead) {
      markNotificationRead(id)
      pushToast({
        type: 'success',
        message: 'Notification marked as read.',
      })
    }
  }

  const renderNotificationCard = (item: NotificationItemData) => {
    const Icon = TYPE_ICONS[item.type] || Bell
    const badgeVariant = TYPE_VARIANTS[item.type] || 'default'

    return (
      <div
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={cn(
          'group relative p-4 rounded-card border transition-all cursor-pointer flex items-start gap-3.5',
          item.read
            ? 'bg-surface border-border hover:bg-canvas/60 text-text-secondary'
            : 'bg-primary-50/40 border-primary-200/80 shadow-xs hover:bg-primary-50/70 text-text-primary'
        )}
      >
        {/* Unread indicator dot */}
        {!item.read && (
          <span
            className="absolute top-4 left-2 w-2 h-2 rounded-full bg-primary-600 ring-2 ring-surface"
            title="Unread notification"
          />
        )}

        {/* Icon Avatar */}
        <div
          className={cn(
            'w-10 h-10 rounded-button flex items-center justify-center shrink-0 ml-1',
            item.read
              ? 'bg-neutral-100 text-text-muted'
              : 'bg-primary-100 text-primary-700'
          )}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={cn('text-small truncate font-semibold', item.read ? 'text-text-primary' : 'text-primary-950')}>
              {item.title}
            </span>
            <Badge variant={badgeVariant} size="sm" className="text-[10px] capitalize">
              {item.type}
            </Badge>
          </div>

          <p className="text-small text-text-secondary leading-relaxed line-clamp-2 mb-2">
            {item.body}
          </p>

          <div className="flex items-center gap-3 text-caption text-text-muted">
            <span>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
            {item.link && (
              <span className="inline-flex items-center gap-1 text-primary-600 font-medium hover:underline">
                <span>View destination</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {!item.read && (
            <button
              type="button"
              onClick={(e) => handleToggleRead(e, item.id, item.read)}
              className="p-1.5 text-text-muted hover:text-primary-600 hover:bg-surface rounded-button transition-colors"
              title="Mark as read"
              aria-label="Mark as read"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => handleDismiss(e, item.id)}
            className="p-1.5 text-text-muted hover:text-accent-red hover:bg-surface rounded-button transition-colors"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 text-left max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Notifications"
          subtitle="Stay updated on event deadlines, circulars, schedule alerts, and club announcements."
        />

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-4 h-4 text-primary-600" />}
            className="self-start sm:self-auto shrink-0"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-button text-small font-medium transition-colors',
              filter === 'all'
                ? 'bg-primary-900 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-neutral-100'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={cn(
              'px-3.5 py-1.5 rounded-button text-small font-medium transition-colors flex items-center gap-1.5',
              filter === 'unread'
                ? 'bg-primary-900 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-neutral-100'
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-primary-600 text-white text-[11px] rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-caption text-text-muted hidden sm:inline">
          Click an item to open target resource
        </span>
      </div>

      {/* Notifications List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <Card padding="lg" className="py-12">
          <EmptyState
            icon={<Bell className="w-7 h-7" aria-hidden="true" />}
            title={filter === 'unread' ? 'All caught up!' : 'No notifications'}
            description={
              filter === 'unread'
                ? 'You have read all received campus alerts and circulars.'
                : 'You have no campus notifications or reminders at this time.'
            }
            action={
              filter === 'unread' ? (
                <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                  View All Notifications
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {todayItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted px-1">
                Today
              </h2>
              <div className="space-y-2.5">
                {todayItems.map(renderNotificationCard)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlierItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted px-1">
                Earlier
              </h2>
              <div className="space-y-2.5">
                {earlierItems.map(renderNotificationCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
