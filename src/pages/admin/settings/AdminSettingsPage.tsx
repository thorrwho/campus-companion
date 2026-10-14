import React, { useState, useRef } from 'react'
import {
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Calendar,
  Bell,
  Trash2,
  Plus,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import { useContentStore, CategoryItem } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import {
  ConfirmDialog,
  TextField,
  ColorDotPicker,
  IconPicker,
} from '@/components/admin'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export const AdminSettingsPage: React.FC = () => {
  const {
    eventCategories,
    announcementCategories,
    clubCategories,
    addEventCategory,
    removeEventCategory,
    addAnnouncementCategory,
    removeAnnouncementCategory,
    addClubCategory,
    removeClubCategory,
    exportStateJson,
    importStateJson,
    resetContentData,
    events,
    announcements,
    clubs,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Category Tab
  const [activeCategoryTab, setActiveCategoryTab] = useState<'event' | 'announcement' | 'club'>('event')

  // Add Category Modal State
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatColor, setNewCatColor] = useState('#2563eb')
  const [newCatIcon, setNewCatIcon] = useState('Tag')

  // Remove Category Confirmation State
  const [categoryToRemove, setCategoryToRemove] = useState<{
    id: string
    label: string
    type: 'event' | 'announcement' | 'club'
  } | null>(null)

  // Backup Import Preview Modal State
  const [importJsonString, setImportJsonString] = useState<string | null>(null)
  const [importSummary, setImportSummary] = useState<{
    version?: string
    exportedAt?: string
    departmentsCount: number
    eventsCount: number
    clubsCount: number
    locationsCount: number
    announcementsCount: number
    studentsCount: number
    slotsCount: number
  } | null>(null)

  // Reset Confirmation State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  // 1. Export JSON Backup
  const handleExportJson = () => {
    const jsonStr = exportStateJson()
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `campus_companion_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'department',
      itemId: `backup-export-${Date.now()}`,
      itemName: 'Full System Backup',
      summary: 'Exported full JSON state snapshot of all campus entities',
    })

    pushToast({
      type: 'success',
      message: 'Downloaded complete portal JSON backup file.',
    })
  }

  // 2. File Selected for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)

        if (!parsed || typeof parsed !== 'object') {
          pushToast({
            type: 'error',
            message: 'Invalid backup file: not valid JSON format.',
          })
          return
        }

        setImportJsonString(text)
        setImportSummary({
          version: parsed.version || 'v1',
          exportedAt: parsed.exportedAt,
          departmentsCount: Array.isArray(parsed.departments) ? parsed.departments.length : 0,
          eventsCount: Array.isArray(parsed.events) ? parsed.events.length : 0,
          clubsCount: Array.isArray(parsed.clubs) ? parsed.clubs.length : 0,
          locationsCount: Array.isArray(parsed.locations) ? parsed.locations.length : 0,
          announcementsCount: Array.isArray(parsed.announcements) ? parsed.announcements.length : 0,
          studentsCount: Array.isArray(parsed.students) ? parsed.students.length : 0,
          slotsCount: Array.isArray(parsed.timetableSlots) ? parsed.timetableSlots.length : 0,
        })
      } catch (err: any) {
        pushToast({
          type: 'error',
          message: `Could not parse JSON file: ${err.message}`,
        })
      }
    }
    reader.readAsText(file)

    // Reset input
    e.target.value = ''
  }

  // 3. Confirm Import
  const handleConfirmImport = () => {
    if (!importJsonString) return

    const result = importStateJson(importJsonString)
    if (result.success) {
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'restore',
        itemType: 'department',
        itemId: `backup-import-${Date.now()}`,
        itemName: 'System Restore from Backup',
        summary: 'Restored portal data state from external JSON backup',
      })

      pushToast({
        type: 'success',
        message: result.message,
      })
    } else {
      pushToast({
        type: 'error',
        message: result.message,
      })
    }

    setImportJsonString(null)
    setImportSummary(null)
  }

  // 4. Confirm Reset
  const handleConfirmReset = () => {
    resetContentData()

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'restore',
      itemType: 'department',
      itemId: `factory-reset-${Date.now()}`,
      itemName: 'Factory Demo Data Reset',
      summary: 'Restored all collections to factory seed demonstration state',
    })

    pushToast({
      type: 'success',
      message: 'Portal content successfully reset to initial seed data.',
    })

    setIsResetConfirmOpen(false)
  }

  // 5. Add Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatLabel.trim()) return

    const id = newCatLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const newCategory: CategoryItem = {
      id,
      label: newCatLabel.trim(),
      color: newCatColor,
      icon: newCatIcon,
    }

    if (activeCategoryTab === 'event') {
      addEventCategory(newCategory)
    } else if (activeCategoryTab === 'announcement') {
      addAnnouncementCategory(newCategory)
    } else {
      addClubCategory(newCategory)
    }

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: activeCategoryTab === 'event' ? 'event' : activeCategoryTab === 'announcement' ? 'announcement' : 'club',
      itemId: `cat-${id}`,
      itemName: newCategory.label,
      summary: `Created new ${activeCategoryTab} category "${newCategory.label}"`,
    })

    pushToast({
      type: 'success',
      message: `Created ${activeCategoryTab} category "${newCategory.label}".`,
    })

    setIsAddCategoryModalOpen(false)
    setNewCatLabel('')
    setNewCatColor('#2563eb')
    setNewCatIcon('Tag')
  }

  // 6. Delete Category
  const handleExecuteDeleteCategory = () => {
    if (!categoryToRemove) return

    if (categoryToRemove.type === 'event') {
      removeEventCategory(categoryToRemove.id)
    } else if (categoryToRemove.type === 'announcement') {
      removeAnnouncementCategory(categoryToRemove.id)
    } else {
      removeClubCategory(categoryToRemove.id)
    }

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: categoryToRemove.type === 'event' ? 'event' : categoryToRemove.type === 'announcement' ? 'announcement' : 'club',
      itemId: `cat-${categoryToRemove.id}`,
      itemName: categoryToRemove.label,
      summary: `Removed ${categoryToRemove.type} category "${categoryToRemove.label}"`,
    })

    pushToast({
      type: 'info',
      message: `Removed category "${categoryToRemove.label}".`,
    })

    setCategoryToRemove(null)
  }

  const currentCategories =
    activeCategoryTab === 'event'
      ? eventCategories
      : activeCategoryTab === 'announcement'
      ? announcementCategories
      : clubCategories

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h1 font-bold text-text-primary tracking-tight">
              Portal Settings & Maintenance
            </h1>
            <Badge variant="primary">Configuration</Badge>
          </div>
          <p className="text-small text-text-secondary mt-1">
            JSON content backup, restore, database factory reset, and global category customization.
          </p>
        </div>
      </div>

      {/* Grid: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Export */}
        <div className="bg-surface p-6 rounded-card border border-border shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-h3 font-bold text-text-primary">Export JSON Data Backup</h2>
            <p className="text-small text-text-secondary leading-relaxed">
              Export an offline JSON snapshot of all campus collections including announcements, events, societies, faculties, facilities, timetable slots, and students.
            </p>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-muted">Format: JSON v1</span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportJson}
              className="gap-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Backup</span>
            </Button>
          </div>
        </div>

        {/* Restore from Backup */}
        <div className="bg-surface p-6 rounded-card border border-border shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Upload className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-h3 font-bold text-text-primary">Restore from JSON Backup</h2>
            <p className="text-small text-text-secondary leading-relaxed">
              Upload a previously exported Campus Companion JSON file to restore portal data. You can preview the backup contents before overwriting current data.
            </p>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-xs text-text-muted">Requires .json file</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4 text-text-muted" aria-hidden="true" />
              <span>Select File to Restore</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Category Customization Manager */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-h2 font-bold text-text-primary">
              Category Customization
            </h2>
            <p className="text-caption text-text-secondary mt-0.5">
              Categories configured here dynamically appear across admin creation forms and student filter chips.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Category</span>
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveCategoryTab('event')}
            className={cn(
              'px-3.5 py-1.5 rounded-button text-xs font-semibold transition-colors inline-flex items-center gap-2',
              activeCategoryTab === 'event'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-canvas text-text-secondary hover:bg-surface border border-border'
            )}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Event Categories ({eventCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryTab('announcement')}
            className={cn(
              'px-3.5 py-1.5 rounded-button text-xs font-semibold transition-colors inline-flex items-center gap-2',
              activeCategoryTab === 'announcement'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-canvas text-text-secondary hover:bg-surface border border-border'
            )}
          >
            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Announcement Categories ({announcementCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryTab('club')}
            className={cn(
              'px-3.5 py-1.5 rounded-button text-xs font-semibold transition-colors inline-flex items-center gap-2',
              activeCategoryTab === 'club'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-canvas text-text-secondary hover:bg-surface border border-border'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Club Categories ({clubCategories.length})</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {currentCategories.map((cat) => {
            const usageCount =
              activeCategoryTab === 'event'
                ? events.filter((e) => e.category?.toLowerCase() === cat.id.toLowerCase() || e.category === cat.label).length
                : activeCategoryTab === 'announcement'
                ? announcements.filter((a) => a.category?.toLowerCase() === cat.id.toLowerCase()).length
                : clubs.filter((c) => c.category?.toLowerCase() === cat.id.toLowerCase()).length

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-card border border-border bg-canvas flex items-center justify-between gap-3 hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 border border-white/40 shadow-xs"
                    style={{ backgroundColor: cat.color || '#2563EB' }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-small text-text-primary truncate">
                      {cat.label}
                    </div>
                    <div className="text-[11px] text-text-muted font-mono">
                      id: {cat.id} | {usageCount} items
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCategoryToRemove({
                      id: cat.id,
                      label: cat.label,
                      type: activeCategoryTab,
                    })
                  }
                  className="h-7 w-7 p-0 text-status-error hover:bg-status-error-bg shrink-0"
                  title="Remove category"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="bg-red-50/50 border border-red-200 rounded-card p-6 space-y-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-status-error flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-h3 font-bold text-red-900">
              Reset Demo Data to Factory Seed State
            </h2>
            <p className="text-small text-red-800 leading-relaxed">
              Restores initial demonstration records across all campus collections (announcements, events, clubs, locations, facilities, faculty, timetable slots, and students). All administrative modifications, additions, and deletions will be permanently cleared.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-red-200/80 flex items-center justify-between">
          <span className="text-xs text-red-700 font-medium">Requires typing RESET to confirm</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-status-error hover:bg-red-100 hover:border-red-300"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>Reset Demo Data</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Add Category Modal                                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title={`Add New ${activeCategoryTab === 'event' ? 'Event' : activeCategoryTab === 'announcement' ? 'Announcement' : 'Club'} Category`}
        description="Create a dynamic category available across admin and student interfaces."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!newCatLabel.trim()}
              onClick={handleCreateCategory}
            >
              Create Category
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <TextField
            label="Category Name / Label"
            name="label"
            required
            placeholder="e.g. Robotics, Examination, Placement"
            value={newCatLabel}
            onChange={(e) => setNewCatLabel(e.target.value)}
            helperText="The public display title shown to students and administrators"
          />

          <ColorDotPicker
            label="Badge Color"
            value={newCatColor}
            onChange={setNewCatColor}
          />

          <IconPicker
            label="Category Icon"
            value={newCatIcon}
            onChange={setNewCatIcon}
          />
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* Backup Preview Modal                                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(importSummary)}
        onClose={() => {
          setImportSummary(null)
          setImportJsonString(null)
        }}
        title="Confirm Backup Restoration"
        description="Verify backup payload contents before overwriting active application database."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setImportSummary(null)
                setImportJsonString(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmImport}
            >
              Confirm & Restore Backup
            </Button>
          </div>
        }
      >
        {importSummary && (
          <div className="space-y-4 text-small">
            <div className="p-3.5 rounded-card bg-canvas border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Backup Version:</span>
                <span className="font-mono font-semibold">{importSummary.version}</span>
              </div>
              {importSummary.exportedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Exported Timestamp:</span>
                  <span className="font-mono">{importSummary.exportedAt.slice(0, 19).replace('T', ' ')}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-surface border border-border flex justify-between">
                <span>Announcements:</span>
                <strong className="font-mono">{importSummary.announcementsCount}</strong>
              </div>
              <div className="p-2 rounded bg-surface border border-border flex justify-between">
                <span>Events:</span>
                <strong className="font-mono">{importSummary.eventsCount}</strong>
              </div>
              <div className="p-2 rounded bg-surface border border-border flex justify-between">
                <span>Clubs & Societies:</span>
                <strong className="font-mono">{importSummary.clubsCount}</strong>
              </div>
              <div className="p-2 rounded bg-surface border border-border flex justify-between">
                <span>Campus Locations:</span>
                <strong className="font-mono">{importSummary.locationsCount}</strong>
              </div>
              <div className="p-2 rounded bg-surface border border-border flex justify-between">
                <span>Enrolled Students:</span>
                <strong className="font-mono">{importSummary.studentsCount}</strong>
              </div>
              <div className="p-2 rounded bg-surface border border-border flex justify-between">
                <span>Timetable Slots:</span>
                <strong className="font-mono">{importSummary.slotsCount}</strong>
              </div>
            </div>

            <div className="p-3 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                Warning: Restoring this backup will replace current local collections with the imported records.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* Delete Category Confirmation Dialog                                       */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(categoryToRemove)}
        onClose={() => setCategoryToRemove(null)}
        onConfirm={handleExecuteDeleteCategory}
        title={`Remove ${categoryToRemove?.type} Category`}
        message={`Are you sure you want to remove the category "${categoryToRemove?.label}"? Existing items using this category will remain, but the category pill will no longer appear in filter menus.`}
        confirmText="Remove Category"
        variant="danger"
      />

      {/* ========================================================================= */}
      {/* Reset Demo Data Confirmation Dialog                                       */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Factory Reset All Demo Data"
        message="Are you sure you want to restore the initial demo state? All custom created events, timetable slots, faculty, locations, and students will be permanently reset to factory seed values."
        requireConfirmationWord={true}
        confirmationWord="RESET"
        confirmText="Reset All Data"
        variant="danger"
      />
    </div>
  )
}
