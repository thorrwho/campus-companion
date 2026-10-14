import React, { useState, useEffect } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message?: string
  itemName?: string
  itemCount?: number
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'primary'
  requireConfirmationWord?: boolean
  confirmationWord?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemCount,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
  requireConfirmationWord = false,
  confirmationWord = 'DELETE',
}) => {
  const [confirmationInput, setConfirmationInput] = useState('')

  // Determine if typed confirmation is required: explicitly requested OR count > 5
  const isHighRisk = requireConfirmationWord || (itemCount !== undefined && itemCount > 5)

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('')
    }
  }, [isOpen])

  const defaultTitle = React.useMemo(() => {
    if (title) return title
    if (itemCount && itemCount > 1) {
      return `Delete ${itemCount} items?`
    }
    if (itemName) {
      return `Delete "${itemName}"?`
    }
    return 'Confirm Action'
  }, [title, itemCount, itemName])

  const defaultMessage = React.useMemo(() => {
    if (message) return message
    if (itemCount && itemCount > 1) {
      return `This will permanently remove ${itemCount} items from the system. This action cannot be undone.`
    }
    if (itemName) {
      return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    }
    return 'Are you sure you want to proceed? This action cannot be undone.'
  }, [message, itemCount, itemName])

  const isConfirmDisabled = isHighRisk
    ? confirmationInput.trim().toUpperCase() !== confirmationWord.toUpperCase()
    : false

  const handleConfirm = async () => {
    if (isConfirmDisabled || isLoading) return
    await onConfirm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={defaultTitle}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isConfirmDisabled}
            leftIcon={variant === 'danger' ? <Trash2 className="w-4 h-4" /> : undefined}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3">
          <div
            className={
              variant === 'danger'
                ? 'w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-status-error flex items-center justify-center shrink-0'
                : 'w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-status-warning flex items-center justify-center shrink-0'
            }
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <p className="text-body text-text-secondary leading-relaxed">
              {defaultMessage}
            </p>
          </div>
        </div>

        {isHighRisk && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-card p-3 space-y-2">
            <p className="text-xs font-semibold text-red-800 dark:text-red-300">
              High Risk Action: Type <span className="font-mono bg-red-100 dark:bg-red-900/60 px-1 py-0.5 rounded">{confirmationWord}</span> to confirm
            </p>
            <Input
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={`Type ${confirmationWord}`}
              aria-label={`Type ${confirmationWord} to confirm action`}
              className="bg-white dark:bg-surface text-sm"
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
