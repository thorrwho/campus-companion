import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null> | React.MutableRefObject<HTMLElement | null> | any
  children: React.ReactNode
  className?: string
  width?: 'trigger' | 'auto' | string | number
  placement?: 'bottom' | 'top' | 'auto'
  align?: 'start' | 'end' | 'center'
  maxHeight?: number
  zIndex?: number
  returnFocusOnClose?: boolean
}

export interface PopoverCoords {
  top?: number
  bottom?: number
  left?: number
  right?: number
  width?: number | string
  maxHeight: number
  placement: 'top' | 'bottom'
}

export const Popover: React.FC<PopoverProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  className,
  width = 'trigger',
  placement = 'auto',
  align = 'start',
  maxHeight = 280,
  zIndex = 9999,
  returnFocusOnClose = true,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<PopoverCoords | null>(null)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // Vertical placement
    let effectivePlacement: 'top' | 'bottom' = 'bottom'
    if (placement === 'auto') {
      effectivePlacement = spaceBelow < maxHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'
    } else {
      effectivePlacement = placement
    }

    // Width
    let effectiveWidth: number | string | undefined = undefined
    if (width === 'trigger') {
      effectiveWidth = rect.width
    } else if (typeof width === 'number') {
      effectiveWidth = width
    } else if (typeof width === 'string' && width !== 'auto') {
      effectiveWidth = width
    }

    // Horizontal placement / alignment
    let left: number | undefined = undefined
    let right: number | undefined = undefined

    if (align === 'end') {
      right = Math.max(8, viewportWidth - rect.right)
    } else if (align === 'center') {
      const calcWidth = typeof effectiveWidth === 'number' ? effectiveWidth : rect.width
      left = Math.max(8, Math.min(viewportWidth - calcWidth - 8, rect.left + rect.width / 2 - calcWidth / 2))
    } else {
      // align === 'start'
      const calcWidth = typeof effectiveWidth === 'number' ? effectiveWidth : rect.width
      left = Math.max(8, Math.min(viewportWidth - calcWidth - 8, rect.left))
    }

    if (effectivePlacement === 'top') {
      const calculatedMaxHeight = Math.min(maxHeight, Math.max(120, spaceAbove - 16))
      setCoords({
        bottom: viewportHeight - rect.top + 4,
        left,
        right,
        width: effectiveWidth,
        maxHeight: calculatedMaxHeight,
        placement: 'top',
      })
    } else {
      const calculatedMaxHeight = Math.min(maxHeight, Math.max(120, spaceBelow - 16))
      setCoords({
        top: rect.bottom + 4,
        left,
        right,
        width: effectiveWidth,
        maxHeight: calculatedMaxHeight,
        placement: 'bottom',
      })
    }
  }, [triggerRef, placement, align, width, maxHeight])

  useEffect(() => {
    if (!isOpen) {
      setCoords(null)
      return
    }

    updatePosition()

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      onClose()
      if (returnFocusOnClose) {
        triggerRef.current?.focus()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        if (returnFocusOnClose) {
          triggerRef.current?.focus()
        }
      }
    }

    const handleScrollOrResize = () => {
      updatePosition()
    }

    window.addEventListener('resize', handleScrollOrResize)
    // Capture phase so any scroll container (cards, modal body, page) updates position
    window.addEventListener('scroll', handleScrollOrResize, true)
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, updatePosition, onClose, returnFocusOnClose, triggerRef])

  if (!isOpen || !coords) return null

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: coords.top !== undefined ? `${coords.top}px` : 'auto',
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
        left: coords.left !== undefined ? `${coords.left}px` : 'auto',
        right: coords.right !== undefined ? `${coords.right}px` : 'auto',
        width: typeof coords.width === 'number' ? `${coords.width}px` : coords.width,
        maxHeight: `${coords.maxHeight}px`,
        maxWidth: 'calc(100vw - 16px)',
        zIndex,
      }}
      className={cn(
        'rounded-card border border-border bg-surface shadow-2xl overflow-y-auto flex flex-col animate-fade-in',
        className
      )}
    >
      {children}
    </div>,
    document.body
  )
}
