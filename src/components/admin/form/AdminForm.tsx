import React, { useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export interface AdminFormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  onCancel?: () => void
  onSaveDraft?: () => void | Promise<void>
  isSubmitting?: boolean
  isDirty?: boolean
  submitLabel?: string
  draftLabel?: string
  cancelLabel?: string
  stickyFooter?: boolean
  extraActions?: React.ReactNode
  className?: string
}

export const AdminForm: React.FC<AdminFormProps> = ({
  children,
  onSubmit,
  onCancel,
  onSaveDraft,
  isSubmitting = false,
  isDirty = false,
  submitLabel = 'Save changes',
  draftLabel = 'Save as draft',
  cancelLabel = 'Cancel',
  stickyFooter = true,
  extraActions,
  className,
}) => {
  const [showCancelPrompt, setShowCancelPrompt] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Trigger auto-focus to first invalid field if any
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    )
    if (firstInvalid) {
      firstInvalid.focus()
      return
    }

    await onSubmit(e)
  }

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelPrompt(true)
    } else if (onCancel) {
      onCancel()
    }
  }

  const handleConfirmCancel = () => {
    setShowCancelPrompt(false)
    if (onCancel) onCancel()
  }

  const handleDraftSubmit = async () => {
    if (!onSaveDraft) return
    setIsDrafting(true)
    try {
      await onSaveDraft()
    } finally {
      setIsDrafting(false)
    }
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        noValidate
      >
        <div className="space-y-6">{children}</div>

        {/* Footer actions */}
        <div
          className={cn(
            'flex items-center justify-between gap-4 py-4 border-t border-border bg-surface transition-all',
            stickyFooter &&
              'sticky bottom-0 z-20 px-4 sm:px-6 shadow-dropdown border-b-0 rounded-t-card'
          )}
        >
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCancelClick}
                disabled={isSubmitting || isDrafting}
              >
                {cancelLabel}
              </Button>
            )}
            {isDirty && (
              <span className="hidden sm:inline-flex text-xs text-amber-600 dark:text-amber-400 font-medium items-center gap-1.5 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {extraActions}

            {onSaveDraft && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleDraftSubmit}
                isLoading={isDrafting}
                disabled={isSubmitting}
              >
                {draftLabel}
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={isDrafting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>

      {/* Discard changes prompt dialog */}
      <Modal
        isOpen={showCancelPrompt}
        onClose={() => setShowCancelPrompt(false)}
        title="Discard unsaved changes?"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowCancelPrompt(false)}
            >
              Continue editing
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleConfirmCancel}
            >
              Discard changes
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 pt-1">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-status-warning flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-body text-text-secondary leading-relaxed">
            You have unsaved edits. If you leave now, any changes you made will be lost.
          </p>
        </div>
      </Modal>
    </>
  )
}
