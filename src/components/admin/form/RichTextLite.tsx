import React, { useState, useRef } from 'react'
import {
  Bold,
  Italic,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Eye,
  Edit3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RichTextLiteProps {
  id?: string
  label?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  helperText?: string
  error?: string
  required?: boolean
  maxLength?: number
  rows?: number
  className?: string
  disabled?: boolean
}

export const RichTextLite: React.FC<RichTextLiteProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Write content in Markdown...',
  helperText,
  error,
  required,
  maxLength,
  rows = 6,
  className,
  disabled,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = 'text') => {
    if (disabled || !textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)
    const content = selected || defaultText

    const before = value.substring(0, start)
    const after = value.substring(end)
    const newText = `${before}${prefix}${content}${suffix}${after}`

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newCursorStart = start + prefix.length
      const newCursorEnd = newCursorStart + content.length
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
    }, 10)
  }

  const renderSimpleMarkdown = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-text-muted italic text-sm">
          No content to preview yet.
        </p>
      )
    }

    // Split lines for rendering
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let inList = false
    let listType: 'ul' | 'ol' = 'ul'
    let listItems: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 space-y-1 text-sm">
              {listItems.map((item, idx) => (
                <li key={idx}>{parseInline(item)}</li>
              ))}
            </ul>
          )
        } else {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-2 space-y-1 text-sm">
              {listItems.map((item, idx) => (
                <li key={idx}>{parseInline(item)}</li>
              ))}
            </ol>
          )
        }
        listItems = []
        inList = false
      }
    }

    const parseInline = (line: string): React.ReactNode => {
      // Very simple inline parser for bold, italic, and links
      // Note: avoid external heavy parser, render clean HTML safely
      const parts: React.ReactNode[] = []
      // Replace markdown link [text](url)
      const linkRegex = /\[(.*?)\]\((.*?)\)/g
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = linkRegex.exec(line)) !== null) {
        const textBefore = line.substring(lastIndex, match.index)
        if (textBefore) parts.push(parseEmphasis(textBefore))
        const linkText = match[1]
        const linkUrl = match[2]
        parts.push(
          <a
            key={`link-${lastIndex}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 underline hover:text-primary-700"
          >
            {linkText}
          </a>
        )
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < line.length) {
        parts.push(parseEmphasis(line.substring(lastIndex)))
      }

      return parts.length > 0 ? parts : parseEmphasis(line)
    }

    const parseEmphasis = (text: string): React.ReactNode => {
      // Bold **bold**
      const boldParts = text.split(/(\*\*.*?\*\*)/g)
      return boldParts.map((chunk, i) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={i} className="font-semibold text-text-primary">{chunk.slice(2, -2)}</strong>
        }
        // Italic *italic*
        const italicParts = chunk.split(/(\*.*?\*)/g)
        return italicParts.map((sub, j) => {
          if (sub.startsWith('*') && sub.endsWith('*')) {
            return <em key={j} className="italic text-text-primary">{sub.slice(1, -1)}</em>
          }
          return sub
        })
      })
    }

    lines.forEach((rawLine, lineIdx) => {
      const line = rawLine.trim()

      if (line.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={lineIdx} className="text-base font-bold text-text-primary mt-3 mb-1">
            {parseInline(line.slice(4))}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={lineIdx} className="text-lg font-bold text-text-primary mt-3 mb-1">
            {parseInline(line.slice(3))}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        flushList()
        elements.push(
          <h1 key={lineIdx} className="text-xl font-bold text-text-primary mt-3 mb-1">
            {parseInline(line.slice(2))}
          </h1>
        )
      } else if (line.startsWith('> ')) {
        flushList()
        elements.push(
          <blockquote
            key={lineIdx}
            className="border-l-4 border-primary-500 pl-3 py-1 my-2 text-text-secondary italic text-sm bg-accent-50/40 rounded-r"
          >
            {parseInline(line.slice(2))}
          </blockquote>
        )
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          flushList()
          inList = true
          listType = 'ul'
        }
        listItems.push(line.slice(2))
      } else if (/^\d+\.\s/.test(line)) {
        if (!inList || listType !== 'ol') {
          flushList()
          inList = true
          listType = 'ol'
        }
        const textAfterNumber = line.replace(/^\d+\.\s/, '')
        listItems.push(textAfterNumber)
      } else if (line === '') {
        flushList()
        elements.push(<div key={lineIdx} className="h-2" />)
      } else {
        flushList()
        elements.push(
          <p key={lineIdx} className="text-body text-text-secondary leading-relaxed">
            {parseInline(line)}
          </p>
        )
      }
    })

    flushList()
    return <div className="space-y-1">{elements}</div>
  }

  const isInvalid = Boolean(error)

  return (
    <div className={cn('w-full space-y-1.5 text-left', className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-caption font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        <div className="flex items-center gap-3">
          {maxLength && (
            <span
              className={cn(
                'text-xs font-mono select-none',
                value.length > maxLength
                  ? 'text-status-error font-medium'
                  : 'text-text-muted'
              )}
            >
              {value.length} / {maxLength}
            </span>
          )}

          <div className="inline-flex rounded-button border border-border p-0.5 bg-canvas">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded transition-colors',
                activeTab === 'write'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded transition-colors',
                activeTab === 'preview'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'rounded-card border bg-surface overflow-hidden transition-all duration-180',
          isInvalid
            ? 'border-status-error ring-1 ring-status-error'
            : 'border-border focus-within:ring-2 focus-within:ring-primary-600 focus-within:border-transparent'
        )}
      >
        {/* Toolbar */}
        {activeTab === 'write' && (
          <div className="flex items-center flex-wrap gap-1 px-2.5 py-1.5 border-b border-border bg-canvas text-text-secondary">
            <button
              type="button"
              disabled={disabled}
              onClick={() => insertFormatting('**', '**', 'bold text')}
              title="Bold"
              className="p-1.5 rounded hover:bg-surface hover:text-text-primary transition-colors text-xs"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => insertFormatting('*', '*', 'italic text')}
              title="Italic"
              className="p-1.5 rounded hover:bg-surface hover:text-text-primary transition-colors text-xs"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-border mx-1" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => insertFormatting('### ', '', 'Heading')}
              title="Heading"
              className="p-1.5 rounded hover:bg-surface hover:text-text-primary transition-colors text-xs"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => insertFormatting('> ', '', 'Quote')}
              title="Quote"
              className="p-1.5 rounded hover:bg-surface hover:text-text-primary transition-colors text-xs"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-border mx-1" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => insertFormatting('- ', '', 'List item')}
              title="Bulleted List"
              className="p-1.5 rounded hover:bg-surface hover:text-text-primary transition-colors text-xs"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => insertFormatting('1. ', '', 'Numbered item')}
              title="Numbered List"
              className="p-1.5 rounded hover:bg-surface hover:text-text-primary transition-colors text-xs"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
              title="Link"
              className="p-1.5 rounded hover:bg-surface hover:text-text-primary transition-colors text-xs"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content area */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            id={inputId}
            rows={rows}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className="w-full px-3.5 py-2.5 text-body bg-transparent text-text-primary placeholder:text-text-muted resize-y focus:outline-none min-h-[120px]"
          />
        ) : (
          <div className="p-3.5 min-h-[148px] max-h-[320px] overflow-y-auto bg-surface prose-sm">
            {renderSimpleMarkdown(value)}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-caption text-status-error font-medium">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-caption text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}
