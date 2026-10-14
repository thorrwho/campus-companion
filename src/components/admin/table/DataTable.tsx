import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Inbox,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Popover } from '@/components/ui/Popover'

export type SortDirection = 'asc' | 'desc' | null

export interface DataTableColumn<T> {
  key: string
  header: string | React.ReactNode
  render?: (item: T, index: number) => React.ReactNode
  sortable?: boolean
  sortValue?: (item: T) => string | number | boolean | Date
  className?: string
  headerClassName?: string
  hideOnMobile?: boolean
  width?: string
}

export interface DataTableFilterOption {
  label: string
  value: string
}

export interface DataTableFilter {
  key: string
  label: string
  options: DataTableFilterOption[]
  value: string
  onChange: (val: string) => void
}

export interface DataTableBulkAction<T> {
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  onClick: (selectedItems: T[]) => void | Promise<void>
}

export interface DataTableRowAction<T> {
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'danger'
  onClick: (item: T) => void
  disabled?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyField: keyof T | ((item: T) => string | number)
  searchPlaceholder?: string
  searchFilter?: (item: T, query: string) => boolean
  filters?: DataTableFilter[]
  bulkActions?: DataTableBulkAction<T>[]
  rowActions?: (item: T) => DataTableRowAction<T>[]
  onRowClick?: (item: T) => void
  isLoading?: boolean
  emptyState?: {
    title?: string
    message?: string
    actionLabel?: string
    onAction?: () => void
  }
  defaultPageSize?: number
  pageSizeOptions?: number[]
  selectable?: boolean
  className?: string
  title?: string
  description?: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
}

interface DataTableRowActionsMenuProps<T> {
  item: T
  actions: DataTableRowAction<T>[]
}

function DataTableRowActionsMenu<T>({
  item,
  actions,
}: DataTableRowActionsMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  if (actions.length === 0) return null

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <IconButton
        ref={buttonRef}
        icon={<MoreVertical className="w-4 h-4" />}
        aria-label="Actions"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        className="h-8 w-8 text-text-muted hover:text-text-primary"
      />

      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={buttonRef}
        width="auto"
        align="end"
        className="w-44 py-1"
      >
        {actions.map((act, actIdx) => (
          <button
            key={actIdx}
            type="button"
            disabled={act.disabled}
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
              act.onClick(item)
            }}
            className={cn(
              'w-full px-3.5 py-2 text-left flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm',
              act.variant === 'danger'
                ? 'text-status-error hover:bg-rose-50 dark:hover:bg-rose-950/40'
                : 'text-text-primary hover:bg-canvas'
            )}
          >
            {act.icon && <span className="shrink-0">{act.icon}</span>}
            <span className="truncate">{act.label}</span>
          </button>
        ))}
      </Popover>
    </div>
  )
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  searchPlaceholder = 'Search records...',
  searchFilter,
  filters = [],
  bulkActions = [],
  rowActions,
  onRowClick,
  isLoading = false,
  emptyState,
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  selectable = true,
  className,
  title,
  description,
  primaryAction,
}: DataTableProps<T>) {
  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Sorting state
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  // Selection state
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set())

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput)
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Helper to extract key
  const getItemKey = React.useCallback(
    (item: T): string | number => {
      if (typeof keyField === 'function') {
        return keyField(item)
      }
      return item[keyField] as unknown as string | number
    },
    [keyField]
  )

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply text search
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      if (searchFilter) {
        result = result.filter((item) => searchFilter(item, q))
      } else {
        result = result.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(q)
        )
      }
    }

    // Apply sorting
    if (sortKey && sortDir) {
      const col = columns.find((c) => c.key === sortKey)
      if (col) {
        result.sort((a, b) => {
          let valA: unknown = col.sortValue ? col.sortValue(a) : (a as Record<string, unknown>)[col.key]
          let valB: unknown = col.sortValue ? col.sortValue(b) : (b as Record<string, unknown>)[col.key]

          if (valA === undefined || valA === null) valA = ''
          if (valB === undefined || valB === null) valB = ''

          const strA = typeof valA === 'string' ? valA.toLowerCase() : valA
          const strB = typeof valB === 'string' ? valB.toLowerCase() : valB

          if ((strA as string | number) < (strB as string | number)) return sortDir === 'asc' ? -1 : 1
          if ((strA as string | number) > (strB as string | number)) return sortDir === 'asc' ? 1 : -1
          return 0
        })
      }
    }

    return result
  }, [data, debouncedQuery, searchFilter, sortKey, sortDir, columns])

  // Total pages
  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  // Slice for current page
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, safePage, pageSize])

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else if (sortDir === 'desc') {
        setSortDir(null)
        setSortKey(null)
      }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Selection handlers
  const pageKeys = useMemo(
    () => paginatedData.map(getItemKey),
    [paginatedData, getItemKey]
  )

  const isAllPageSelected =
    pageKeys.length > 0 && pageKeys.every((k) => selectedKeys.has(k))

  const isSomePageSelected =
    pageKeys.some((k) => selectedKeys.has(k)) && !isAllPageSelected

  const toggleSelectAllPage = () => {
    const updated = new Set(selectedKeys)
    if (isAllPageSelected) {
      pageKeys.forEach((k) => updated.delete(k))
    } else {
      pageKeys.forEach((k) => updated.add(k))
    }
    setSelectedKeys(updated)
  }

  const toggleSelectRow = (key: string | number, e?: React.SyntheticEvent) => {
    e?.stopPropagation()
    const updated = new Set(selectedKeys)
    if (updated.has(key)) {
      updated.delete(key)
    } else {
      updated.add(key)
    }
    setSelectedKeys(updated)
  }

  const clearSelection = () => {
    setSelectedKeys(new Set())
  }

  // Selected items objects for bulk actions
  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedKeys.has(getItemKey(item)))
  }, [data, selectedKeys, getItemKey])

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {/* Table Header: Title, Description, and Primary Action */}
      {(title || primaryAction) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            )}
            {description && (
              <p className="text-caption text-text-secondary mt-0.5">
                {description}
              </p>
            )}
          </div>

          {primaryAction && (
            <Button
              variant="primary"
              size="md"
              onClick={primaryAction.onClick}
              leftIcon={primaryAction.icon || <Plus className="w-4 h-4" />}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Toolbar: Search, Filters, Bulk Action Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search records"
              className="w-full pl-9 pr-8 py-2 text-sm bg-surface border border-border rounded-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs text-text-muted flex items-center gap-1 font-medium">
                <Filter className="w-3.5 h-3.5" />
                Filters:
              </span>
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  value={filter.value}
                  onChange={(e) => {
                    filter.onChange(e.target.value)
                    setPage(1)
                  }}
                  aria-label={`Filter by ${filter.label}`}
                  className="text-xs py-1.5 px-2.5 bg-surface border border-border rounded-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-600 cursor-pointer"
                >
                  <option value="all">All {filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectable && selectedKeys.size > 0 && (
          <div className="flex items-center justify-between gap-3 p-2.5 px-4 rounded-card bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/80 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary-900 dark:text-primary-100">
                {selectedKeys.size} {selectedKeys.size === 1 ? 'item' : 'items'} selected
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-primary-700 dark:text-primary-300 hover:underline font-medium ml-1"
              >
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2">
              {bulkActions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={action.variant || 'secondary'}
                  onClick={() => action.onClick(selectedItems)}
                  leftIcon={action.icon}
                  className="text-xs h-8"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Table Container (Desktop + Tablet) */}
      <div className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
        {/* Loading Skeleton View */}
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/3" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-card animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-canvas text-text-muted flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text-primary">
                {emptyState?.title || 'No records found'}
              </h3>
              <p className="text-caption text-text-secondary max-w-sm mx-auto">
                {emptyState?.message ||
                  (debouncedQuery
                    ? 'No results match your search query. Try adjusting your filters or keywords.'
                    : 'Get started by creating your first entry.')}
              </p>
            </div>
            {emptyState?.actionLabel && emptyState?.onAction && (
              <Button
                variant="primary"
                size="sm"
                onClick={emptyState.onAction}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-2"
              >
                {emptyState.actionLabel}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-text-secondary text-xs uppercase tracking-wider font-semibold select-none">
                    {selectable && (
                      <th className="w-12 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isAllPageSelected}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = isSomePageSelected
                            }
                          }}
                          onChange={toggleSelectAllPage}
                          aria-label="Select all on current page"
                          className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-600 cursor-pointer"
                        />
                      </th>
                    )}

                    {columns.map((col) => {
                      const isSorted = sortKey === col.key
                      const ariaSort = !col.sortable
                        ? undefined
                        : isSorted
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'

                      return (
                        <th
                          key={col.key}
                          aria-sort={ariaSort}
                          style={col.width ? { width: col.width } : undefined}
                          className={cn(
                            'px-4 py-3 font-semibold',
                            col.sortable &&
                              'cursor-pointer hover:text-text-primary transition-colors',
                            col.headerClassName
                          )}
                          onClick={() => col.sortable && handleSort(col.key)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{col.header}</span>
                            {col.sortable && (
                              <span className="text-text-muted">
                                {isSorted ? (
                                  sortDir === 'asc' ? (
                                    <ArrowUp className="w-3.5 h-3.5 text-primary-600" />
                                  ) : (
                                    <ArrowDown className="w-3.5 h-3.5 text-primary-600" />
                                  )
                                ) : (
                                  <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      )
                    })}

                    {rowActions && (
                      <th className="w-14 px-4 py-3 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                  {paginatedData.map((item, idx) => {
                    const itemKey = getItemKey(item)
                    const isSelected = selectedKeys.has(itemKey)
                    const actions = rowActions ? rowActions(item) : []

                    return (
                      <tr
                        key={itemKey}
                        onClick={() => onRowClick && onRowClick(item)}
                        className={cn(
                          'transition-colors duration-150',
                          onRowClick && 'cursor-pointer',
                          isSelected
                            ? 'bg-primary-50/50 dark:bg-primary-950/20'
                            : 'hover:bg-canvas/50'
                        )}
                      >
                        {selectable && (
                          <td
                            className="px-4 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectRow(itemKey, e)}
                              aria-label={`Select item ${itemKey}`}
                              className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-600 cursor-pointer"
                            />
                          </td>
                        )}

                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={cn('px-4 py-3 text-body', col.className)}
                          >
                            {col.render
                              ? col.render(item, idx)
                              : String((item as Record<string, unknown>)[col.key] ?? '')}
                          </td>
                        ))}

                        {rowActions && (
                          <td
                            className="px-4 py-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DataTableRowActionsMenu item={item} actions={actions} />
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (< 768px) */}
            <div className="block md:hidden divide-y divide-border">
              {paginatedData.map((item, idx) => {
                const itemKey = getItemKey(item)
                const isSelected = selectedKeys.has(itemKey)
                const actions = rowActions ? rowActions(item) : []

                return (
                  <div
                    key={itemKey}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      'p-4 space-y-3 transition-colors',
                      isSelected ? 'bg-primary-50/50 dark:bg-primary-950/20' : 'bg-surface'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {selectable && (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelectRow(itemKey, e)}
                            aria-label={`Select item ${itemKey}`}
                            className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-600"
                          />
                          <span className="text-xs text-text-muted font-mono">
                            #{idx + 1 + (safePage - 1) * pageSize}
                          </span>
                        </div>
                      )}

                      {rowActions && (
                        <div
                          className="ml-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DataTableRowActionsMenu item={item} actions={actions} />
                        </div>
                      )}
                    </div>

                    {/* Columns rendered as key-value rows */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {columns.map((col) => (
                        <div
                          key={col.key}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-xs text-text-muted font-medium">
                            {col.header}:
                          </span>
                          <span className="text-text-primary text-right font-medium">
                            {col.render
                              ? col.render(item, idx)
                              : String((item as Record<string, unknown>)[col.key] ?? '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {filteredData.length > 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-canvas/30 text-xs text-text-secondary select-none">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <span className="font-semibold text-text-primary">
                  {(safePage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-text-primary">
                  {Math.min(safePage * pageSize, totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-text-primary">
                  {totalItems}
                </span>{' '}
                results
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-text-muted">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  aria-label="Results per page"
                  className="bg-surface border border-border rounded px-1.5 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-600 cursor-pointer"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prev / Page / Next */}
            <div className="flex items-center gap-1">
              <IconButton
                icon={<ChevronLeft className="w-4 h-4" />}
                aria-label="Previous page"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage(Math.max(1, safePage - 1))}
                className="h-8 w-8 text-text-muted hover:text-text-primary disabled:opacity-40"
              />

              <span className="px-2 py-1 font-medium text-text-primary">
                Page {safePage} of {totalPages}
              </span>

              <IconButton
                icon={<ChevronRight className="w-4 h-4" />}
                aria-label="Next page"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                className="h-8 w-8 text-text-muted hover:text-text-primary disabled:opacity-40"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
