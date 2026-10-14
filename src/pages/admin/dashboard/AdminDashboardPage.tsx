import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Calendar,
  Sparkles,
  Bell,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  History,
  Info,
  BarChart3,
  Table as TableIcon,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    students,
    events,
    clubs,
    announcements,
    facilities,
    departments,
    eventRegistrations,
  } = useContentStore()

  const { activities } = useActivityLogStore()
  const { adminUser } = useAdminAuthStore()

  // Chart view toggles (Chart vs Accessible Table)
  const [showCategoryTable, setShowCategoryTable] = useState(false)
  const [showDeptTable, setShowDeptTable] = useState(false)
  const [showTimelineTable, setShowTimelineTable] = useState(false)

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const in3DaysStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().slice(0, 10)
  }, [])
  const in7DaysStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().slice(0, 10)
  }, [])

  // 1. Stat Cards
  const stats = useMemo(() => {
    const totalStudents = students.length
    const activeClubs = clubs.filter((c) => c.status === 'Active').length
    const upcomingEvents = events.filter((e) => e.date >= todayStr).length
    const publishedAnnouncements = announcements.filter((a) => a.status === 'Published').length

    // Latest important announcement unread rate
    const importantAnnouncements = announcements
      .filter((a) => a.isImportant && a.status === 'Published')
      .sort((a, b) => {
        const timeB = b.publishDateTime || b.postedAt || ''
        const timeA = a.publishDateTime || a.postedAt || ''
        return timeB.localeCompare(timeA)
      })

    const latestImportant = importantAnnouncements[0] || null
    let unreadRate = 0
    if (latestImportant && totalStudents > 0) {
      const read = latestImportant.readCount || 0
      const unreadPct = Math.max(0, 100 - Math.round((read / totalStudents) * 100))
      unreadRate = unreadPct
    }

    return {
      totalStudents,
      activeClubs,
      upcomingEvents,
      publishedAnnouncements,
      latestImportant,
      unreadRate,
    }
  }, [students, clubs, events, announcements, todayStr])

  // 2. Needs Attention Items
  const needsAttention = useMemo(() => {
    const items: {
      id: string
      type: 'under_capacity' | 'full' | 'scheduled_today' | 'facility_override' | 'expiring_announcement'
      title: string
      subtitle: string
      badge: string
      badgeVariant: 'warning' | 'error' | 'info'
      link: string
      actionText: string
    }[] = []

    // Events within 7 days under 25% full
    events.forEach((ev) => {
      if (ev.date >= todayStr && ev.date <= in7DaysStr && ev.capacity > 0) {
        const pct = (ev.registeredCount / ev.capacity) * 100
        if (pct < 25) {
          items.push({
            id: `att-low-${ev.id}`,
            type: 'under_capacity',
            title: `Low Enrollment: ${ev.title}`,
            subtitle: `Only ${ev.registeredCount} of ${ev.capacity} seats filled (${Math.round(pct)}%) with event on ${ev.date}.`,
            badge: `${Math.round(pct)}% Filled`,
            badgeVariant: 'warning',
            link: `/admin/events/${ev.id}/edit`,
            actionText: 'Review Event',
          })
        }
      }
    })

    // Events that are completely full
    events.forEach((ev) => {
      if (ev.capacity > 0 && ev.registeredCount >= ev.capacity && ev.date >= todayStr) {
        items.push({
          id: `att-full-${ev.id}`,
          type: 'full',
          title: `Capacity Reached: ${ev.title}`,
          subtitle: `Event has reached 100% capacity (${ev.registeredCount}/${ev.capacity} students registered).`,
          badge: 'At Capacity',
          badgeVariant: 'info',
          link: `/admin/events/${ev.id}/registrations`,
          actionText: 'View Roster',
        })
      }
    })

    // Scheduled announcements going live today
    announcements.forEach((ann) => {
      const pubDate = ann.publishDateTime || ann.postedAt || ''
      if (ann.status === 'Scheduled' && pubDate.slice(0, 10) === todayStr) {
        items.push({
          id: `att-sched-${ann.id}`,
          type: 'scheduled_today',
          title: `Scheduled Live Today: ${ann.title}`,
          subtitle: `Circular is scheduled to be published to students today at ${pubDate.slice(11, 16) || 'scheduled time'}.`,
          badge: 'Going Live',
          badgeVariant: 'info',
          link: `/admin/announcements/${ann.id}/edit`,
          actionText: 'Edit Circular',
        })
      }
    })

    // Facilities with manual status override
    facilities.forEach((fac) => {
      if (fac.statusOverride && fac.statusOverride !== 'auto') {
        items.push({
          id: `att-fac-${fac.id}`,
          type: 'facility_override',
          title: `Manual Facility Override: ${fac.name}`,
          subtitle: `Operating status is manually forced to "${fac.statusOverride}"${
            fac.statusMessage ? `: ${fac.statusMessage}` : '.'
          }`,
          badge: `Forced ${fac.statusOverride}`,
          badgeVariant: 'warning',
          link: `/admin/facilities/${fac.id}/edit`,
          actionText: 'Adjust Hours',
        })
      }
    })

    // Announcements expiring within 3 days
    announcements.forEach((ann) => {
      if (ann.expiryDate && ann.expiryDate >= todayStr && ann.expiryDate <= in3DaysStr) {
        items.push({
          id: `att-exp-${ann.id}`,
          type: 'expiring_announcement',
          title: `Expiring Soon: ${ann.title}`,
          subtitle: `Circular will automatically expire and be hidden from student app on ${ann.expiryDate}.`,
          badge: 'Expiring in < 3 Days',
          badgeVariant: 'warning',
          link: `/admin/announcements/${ann.id}/edit`,
          actionText: 'Extend Expiry',
        })
      }
    })

    return items
  }, [events, announcements, facilities, todayStr, in7DaysStr, in3DaysStr])

  // 3. Chart Data A: Registrations by Event Category
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    eventRegistrations.forEach((reg) => {
      const ev = events.find((e) => e.id === reg.eventId)
      const cat = ev?.category || 'general'
      counts[cat] = (counts[cat] || 0) + 1
    })

    const categories = Object.keys(counts)
    const maxCount = Math.max(...Object.values(counts), 1)

    const colors: Record<string, string> = {
      workshop: '#2563EB',
      hackathon: '#7C3AED',
      cultural: '#DB2777',
      seminar: '#0284C7',
      sports: '#059669',
      general: '#4B5563',
    }

    return categories.map((cat) => ({
      category: cat,
      count: counts[cat] || 0,
      pct: Math.round(((counts[cat] || 0) / maxCount) * 100),
      color: colors[cat.toLowerCase()] || '#2563EB',
    }))
  }, [eventRegistrations, events])

  // 4. Chart Data B: Students by Department
  const deptChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    students.forEach((s) => {
      counts[s.department] = (counts[s.department] || 0) + 1
    })

    const depts = departments.map((d) => d.code)
    const maxCount = Math.max(...Object.values(counts), 1)

    return depts.map((code) => {
      const count = counts[code] || 0
      const deptObj = departments.find((d) => d.code === code)
      return {
        code,
        name: deptObj?.name || code,
        count,
        pct: Math.round((count / maxCount) * 100),
      }
    })
  }, [students, departments])

  // 5. Chart Data C: New Registrations over Last 14 Days
  const timelineChartData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = []
    const now = new Date()

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const count = eventRegistrations.filter((r) => r.registeredAt?.slice(0, 10) === dateStr).length
      days.push({ date: dateStr, label, count })
    }

    const maxCount = Math.max(...days.map((d) => d.count), 5)
    return { days, maxCount }
  }, [eventRegistrations])

  // 6. Recent Activity
  const recentActivities = useMemo(() => {
    return activities.slice(0, 8)
  }, [activities])

  return (
    <div className="space-y-6">
      {/* Top Welcome & Disclaimers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-h1 font-bold text-text-primary tracking-tight">
              Administrative Control Center
            </h1>
            <Badge variant="primary">Campus Portal</Badge>
          </div>
          <p className="text-small text-text-secondary mt-1">
            Real-time status overview, enrollment metrics, scheduling audits, and system notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/activity"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-button text-xs font-semibold border border-border bg-canvas hover:bg-surface text-text-primary transition-colors"
          >
            <History className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Audit Trail</span>
          </Link>

          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-button text-xs font-semibold border border-border bg-canvas hover:bg-surface text-text-primary transition-colors"
          >
            <Building2 className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Settings & Backups</span>
          </Link>
        </div>
      </div>

      {/* Local Demo Data Notice Banner */}
      <div className="p-3.5 rounded-card bg-accent-100/40 border border-primary-500/20 text-text-secondary text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
          <span>
            <strong>Local Demonstration Environment:</strong> All statistical metrics, student rosters, and schedules are computed from client-side Zustand persistence in localStorage. No real server backend is connected.
          </span>
        </div>
        <span className="font-mono text-[11px] text-text-muted shrink-0 hidden sm:inline">
          Session: {adminUser?.email || 'admin@demo.edu'}
        </span>
      </div>

      {/* 5 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Students */}
        <div
          onClick={() => navigate('/admin/students')}
          className="bg-surface p-4 rounded-card border border-border shadow-card hover:border-primary-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-muted font-medium">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-h2 font-bold text-text-primary mt-2">{stats.totalStudents}</div>
          <div className="text-[11px] text-primary-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
            <span>Manage students</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </div>
        </div>

        {/* Active Clubs */}
        <div
          onClick={() => navigate('/admin/clubs')}
          className="bg-surface p-4 rounded-card border border-border shadow-card hover:border-primary-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-muted font-medium">Active Clubs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-h2 font-bold text-text-primary mt-2">{stats.activeClubs}</div>
          <div className="text-[11px] text-primary-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
            <span>View societies</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </div>
        </div>

        {/* Upcoming Events */}
        <div
          onClick={() => navigate('/admin/events')}
          className="bg-surface p-4 rounded-card border border-border shadow-card hover:border-primary-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-muted font-medium">Upcoming Events</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-h2 font-bold text-text-primary mt-2">{stats.upcomingEvents}</div>
          <div className="text-[11px] text-primary-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
            <span>Event schedules</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </div>
        </div>

        {/* Published Circulars */}
        <div
          onClick={() => navigate('/admin/announcements')}
          className="bg-surface p-4 rounded-card border border-border shadow-card hover:border-primary-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-muted font-medium">Announcements</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-h2 font-bold text-text-primary mt-2">{stats.publishedAnnouncements}</div>
          <div className="text-[11px] text-primary-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
            <span>Official circulars</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </div>
        </div>

        {/* Latest Important Circular Unread Rate */}
        <div
          onClick={() => stats.latestImportant && navigate(`/admin/announcements/${stats.latestImportant.id}/edit`)}
          className="bg-surface p-4 rounded-card border border-border shadow-card hover:border-primary-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-muted font-medium">Important Unread</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-status-error flex items-center justify-center">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-h2 font-bold text-text-primary mt-2">
            {stats.unreadRate}%
          </div>
          <div className="text-[11px] text-text-muted mt-1 truncate" title={stats.latestImportant?.title || 'No important broadcast'}>
            {stats.latestImportant ? stats.latestImportant.title : 'No active alerts'}
          </div>
        </div>
      </div>

      {/* Quick Action Create Row */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-card space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Quick Content Creation
          </span>
          <span className="text-[11px] text-text-muted">Shortcuts for administrators</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/announcements/new')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Announcement</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/events/new')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Event</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/clubs/new')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Club</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/notifications/new')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Broadcast</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/locations/new')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Map Location</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/facilities/new')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Facility</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/faculty/new')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Faculty</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/timetable')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Schedule Slot</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/students')}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>Enroll Student</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column: Needs Attention (Left) & Recent Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Needs Attention List (7 cols) */}
        <div className="lg:col-span-7 bg-surface p-6 rounded-card border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <h2 className="text-small font-bold text-text-primary uppercase tracking-wider">
                Needs Immediate Attention ({needsAttention.length})
              </h2>
            </div>
            <span className="text-caption text-text-muted">Automated campus monitors</span>
          </div>

          {needsAttention.length === 0 ? (
            <div className="p-8 text-center bg-canvas rounded-card border border-dashed border-border">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
              <div className="font-semibold text-text-primary text-small">All Systems Operational</div>
              <p className="text-caption text-text-secondary mt-0.5">
                No capacity alerts, expiring announcements, or pending scheduled items require review.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-card overflow-hidden">
              {needsAttention.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-canvas hover:bg-surface transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-small text-text-primary truncate block" title={item.title}>
                        {item.title}
                      </span>
                      <Badge
                        variant={item.badgeVariant === 'error' ? 'error' : item.badgeVariant === 'warning' ? 'warning' : 'primary'}
                        className="text-[10px] shrink-0"
                      >
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-caption text-text-secondary line-clamp-1">{item.subtitle}</p>
                  </div>

                  <Link
                    to={item.link}
                    className="shrink-0 px-2.5 py-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-surface border border-border hover:border-primary-500 rounded-button transition-colors"
                  >
                    {item.actionText}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Log (5 cols) */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-card border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary-600" aria-hidden="true" />
              <h2 className="text-small font-bold text-text-primary uppercase tracking-wider">
                Recent Admin Activity
              </h2>
            </div>
            <Link
              to="/admin/activity"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Full Log
            </Link>
          </div>

          <div className="divide-y divide-border text-small">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge variant="neutral" className="text-[10px] uppercase font-mono px-1.5 py-0">
                      {act.action}
                    </Badge>
                    <span className="font-semibold text-text-primary truncate text-xs" title={act.itemName}>
                      {act.itemName}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted shrink-0 font-mono">
                    {act.timestamp.slice(11, 16)}
                  </span>
                </div>
                <p className="text-caption text-text-secondary line-clamp-1">{act.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts Section (Plain SVG without chart libraries) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 font-bold text-text-primary">
              Operational Analytics & Trends
            </h2>
            <p className="text-caption text-text-secondary">
              Pure vector SVG charts with complete keyboard accessibility and tabular data views.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Registrations by Category */}
          <div className="bg-surface p-5 rounded-card border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-small text-text-primary">
                  Registrations by Category
                </h3>
                <span className="text-caption text-text-muted">Event participation share</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCategoryTable(!showCategoryTable)}
                className="text-[11px] h-7 px-2"
                title="Toggle accessible data table"
              >
                {showCategoryTable ? <BarChart3 className="w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {showCategoryTable ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <caption className="sr-only">Event registrations count by category</caption>
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th scope="col" className="py-1.5">Category</th>
                      <th scope="col" className="py-1.5 text-right">Registrations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {categoryChartData.map((d) => (
                      <tr key={d.category}>
                        <td className="py-1.5 font-medium capitalize">{d.category}</td>
                        <td className="py-1.5 text-right font-mono">{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {categoryChartData.map((d) => (
                  <div key={d.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text-primary capitalize">{d.category}</span>
                      <span className="text-text-muted font-mono">{d.count} registrations</span>
                    </div>
                    <div className="w-full h-2.5 bg-canvas rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(d.pct, 4)}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart 2: Students by Department */}
          <div className="bg-surface p-5 rounded-card border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-small text-text-primary">
                  Students by Department
                </h3>
                <span className="text-caption text-text-muted">Curriculum distribution</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeptTable(!showDeptTable)}
                className="text-[11px] h-7 px-2"
                title="Toggle accessible data table"
              >
                {showDeptTable ? <BarChart3 className="w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {showDeptTable ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <caption className="sr-only">Enrolled students distribution by department</caption>
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th scope="col" className="py-1.5">Branch Code</th>
                      <th scope="col" className="py-1.5 text-right">Enrolled Students</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {deptChartData.map((d) => (
                      <tr key={d.code}>
                        <td className="py-1.5 font-medium">{d.code}</td>
                        <td className="py-1.5 text-right font-mono">{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {deptChartData.map((d) => (
                  <div key={d.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text-primary">{d.code}</span>
                      <span className="text-text-muted font-mono">{d.count} students</span>
                    </div>
                    <div className="w-full h-2.5 bg-canvas rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(d.pct, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart 3: Registrations over 14 Days (Plain SVG Line) */}
          <div className="bg-surface p-5 rounded-card border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-small text-text-primary">
                  Registrations (14 Days)
                </h3>
                <span className="text-caption text-text-muted">Daily participation activity</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTimelineTable(!showTimelineTable)}
                className="text-[11px] h-7 px-2"
                title="Toggle accessible data table"
              >
                {showTimelineTable ? <BarChart3 className="w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {showTimelineTable ? (
              <div className="overflow-x-auto max-h-[160px]">
                <table className="w-full text-xs text-left">
                  <caption className="sr-only">14-day daily registration trend</caption>
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th scope="col" className="py-1">Date</th>
                      <th scope="col" className="py-1 text-right">Signups</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {timelineChartData.days.map((d) => (
                      <tr key={d.date}>
                        <td className="py-1">{d.label}</td>
                        <td className="py-1 text-right font-mono">{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="pt-2">
                <svg
                  viewBox="0 0 280 120"
                  className="w-full h-32 overflow-visible"
                  role="img"
                  aria-label="14-day registration trajectory line graph"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="100" x2="280" y2="100" stroke="#E2E8F0" strokeWidth="1" />
                  <line x1="0" y1="60" x2="280" y2="60" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="20" x2="280" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Area fill under curve */}
                  <polygon
                    points={`0,100 ${timelineChartData.days
                      .map((d, i) => {
                        const x = (i / 13) * 280
                        const y = 100 - (d.count / timelineChartData.maxCount) * 80
                        return `${x},${y}`
                      })
                      .join(' ')} 280,100`}
                    fill="url(#chartGradient)"
                  />

                  {/* Polyline */}
                  <polyline
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={timelineChartData.days
                      .map((d, i) => {
                        const x = (i / 13) * 280
                        const y = 100 - (d.count / timelineChartData.maxCount) * 80
                        return `${x},${y}`
                      })
                      .join(' ')}
                  />

                  {/* Data Points */}
                  {timelineChartData.days.map((d, i) => {
                    const x = (i / 13) * 280
                    const y = 100 - (d.count / timelineChartData.maxCount) * 80
                    return (
                      <circle
                        key={d.date}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#2563EB"
                        strokeWidth="2"
                      >
                        <title>{`${d.label}: ${d.count} signups`}</title>
                      </circle>
                    )
                  })}
                </svg>

                <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 font-mono">
                  <span>{timelineChartData.days[0].label}</span>
                  <span>{timelineChartData.days[6].label}</span>
                  <span>Today ({timelineChartData.days[13].label})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
