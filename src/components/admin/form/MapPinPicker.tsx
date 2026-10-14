import React, { useRef, useState, useCallback } from 'react'
import { MapPin, Compass, Crosshair, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Location } from '@/types'

export interface MapPinPickerProps {
  mapX: number
  mapY: number
  onChange: (coords: { mapX: number; mapY: number }) => void
  existingLocations?: Location[]
  currentLocationId?: string
  label?: string
  helperText?: string
  error?: string
  className?: string
}

export const MapPinPicker: React.FC<MapPinPickerProps> = ({
  mapX,
  mapY,
  onChange,
  existingLocations = [],
  currentLocationId,
  label = 'Map Pin Location',
  helperText = 'Click or drag on the campus map to place the building pin.',
  error,
  className,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Calculate percentage coordinates from mouse event
  const updateCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!mapContainerRef.current) return
      const rect = mapContainerRef.current.getBoundingClientRect()
      const rawX = ((clientX - rect.left) / rect.width) * 100
      const rawY = ((clientY - rect.top) / rect.height) * 100

      // Clamp coordinates to 2% to 98% for comfortable padding
      const clampedX = Math.max(2, Math.min(98, Math.round(rawX * 10) / 10))
      const clampedY = Math.max(2, Math.min(98, Math.round(rawY * 10) / 10))

      onChange({ mapX: clampedX, mapY: clampedY })
    },
    [onChange]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateCoordinates(e.clientX, e.clientY)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateCoordinates(moveEvent.clientX, moveEvent.clientY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Touch support for tablets/mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      updateCoordinates(touch.clientX, touch.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      updateCoordinates(touch.clientX, touch.clientY)
    }
  }

  return (
    <div className={cn('space-y-2 text-left', className)}>
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <label className="block text-caption font-medium text-text-primary">
              {label}
            </label>
          )}
          {helperText && <p className="text-xs text-text-muted mt-0.5">{helperText}</p>}
        </div>

        {/* Quick Zoom / Reset Controls */}
        <div className="flex items-center gap-1.5 bg-canvas border border-border p-1 rounded-card text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
            className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-surface transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1 text-text-muted select-none">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
            className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-surface transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1)
              onChange({ mapX: 50, mapY: 50 })
            }}
            className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-surface transition-colors ml-1"
            title="Reset to Campus Center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas Frame */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={cn(
          'relative w-full h-[360px] sm:h-[420px] bg-[#EBF3FA] rounded-card border-2 overflow-hidden cursor-crosshair select-none',
          error ? 'border-status-error' : isDragging ? 'border-primary-600 shadow-md' : 'border-border',
          'transition-colors duration-150'
        )}
      >
        {/* Top Floating Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-sm text-[11px] font-semibold text-text-primary flex items-center gap-1.5">
            <Crosshair className="w-3 h-3 text-primary-600" />
            <span>Click or drag to place pin</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-sm text-[11px] font-mono text-text-secondary">
            X: {mapX}% | Y: {mapY}%
          </div>
        </div>

        {/* Compass indicator */}
        <div className="absolute top-2.5 right-2.5 z-20 px-2 py-1 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-sm text-[10px] font-bold font-mono text-text-muted flex items-center gap-1 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-primary-600" />
          <span>NORTH</span>
        </div>

        {/* Scaled SVG Map Canvas */}
        <div
          className="w-full h-full transition-transform duration-150 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 1000 800"
            className="w-full h-full object-cover pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="picker-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D3E2F0" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="1000" height="800" fill="url(#picker-grid)" />

            {/* Campus Boundary & Lawns */}
            <rect x="40" y="40" width="920" height="720" rx="16" fill="#F4F8FB" stroke="#CBD5E1" strokeWidth="2" />
            <rect x="180" y="160" width="640" height="480" rx="12" fill="#E2E8F0" opacity="0.4" />

            {/* Primary Roadways */}
            <path d="M 500 40 L 500 760" stroke="#94A3B8" strokeWidth="18" strokeLinecap="round" />
            <path d="M 40 400 L 960 400" stroke="#94A3B8" strokeWidth="18" strokeLinecap="round" />
            <circle cx="500" cy="400" r="42" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="8" />

            {/* Main Campus Buildings (Reference Landmarks) */}
            {/* North-West: Engineering & Tech */}
            <rect x="120" y="100" width="160" height="120" rx="8" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
            <text x="200" y="165" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1E40AF">Tech Block</text>

            {/* North-East: Science & Labs */}
            <rect x="720" y="100" width="160" height="120" rx="8" fill="#E0E7FF" stroke="#6366F1" strokeWidth="2" />
            <text x="800" y="165" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3730A3">Science Center</text>

            {/* Center: Admin Building */}
            <rect x="420" y="240" width="160" height="90" rx="8" fill="#F1F5F9" stroke="#475569" strokeWidth="2" />
            <text x="500" y="290" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0F172A">Admin Block</text>

            {/* South-West: Library & Student Hub */}
            <rect x="120" y="520" width="180" height="140" rx="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
            <text x="210" y="595" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0369A1">Central Library</text>

            {/* South-East: Sports Complex & Auditorium */}
            <rect x="700" y="520" width="180" height="140" rx="8" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
            <text x="790" y="595" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#166534">Sports Arena</text>

            {/* South: Main Gate */}
            <rect x="440" y="720" width="120" height="40" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
            <text x="500" y="745" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400E">Main Gate</text>
          </svg>

          {/* Faint Existing Location Reference Pins */}
          {existingLocations
            .filter((l) => l.id !== currentLocationId)
            .map((loc) => (
              <div
                key={loc.id}
                style={{ left: `${loc.mapX}%`, top: `${loc.mapY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40 group"
                title={`${loc.name} (${loc.building})`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-400 border border-white flex items-center justify-center text-[10px] text-white">
                  <MapPin className="w-3 h-3 fill-current" />
                </div>
                <div className="text-[9px] font-medium text-slate-600 bg-white/80 px-1 rounded whitespace-nowrap -mt-1 scale-90">
                  {loc.name}
                </div>
              </div>
            ))}

          {/* Active Draggable Target Pin */}
          <div
            style={{ left: `${mapX}%`, top: `${mapY}%` }}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-transform cursor-grab active:cursor-grabbing',
              isDragging ? 'scale-125' : 'hover:scale-115'
            )}
          >
            {/* Animated Ripple Pulse */}
            <span className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-60 pointer-events-none" />

            {/* Main Pin Icon Bubble */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-600 text-white border-2 border-white shadow-overlay flex items-center justify-center">
              <MapPin className="w-5 h-5 fill-current stroke-[2]" />
            </div>

            {/* Pin Target Coordinates Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-primary-900 text-white text-[11px] font-mono font-bold shadow-md whitespace-nowrap pointer-events-none">
              {mapX}% , {mapY}%
            </div>
          </div>
        </div>
      </div>

      {/* Manual Numeric Inputs for Accessibility & Precision */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-text-secondary">
            X Coordinate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={mapX}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                onChange({ mapX: Math.max(0, Math.min(100, val)), mapY })
              }}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <span className="absolute right-3 top-1.5 text-xs text-text-muted pointer-events-none">
              %
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-text-secondary">
            Y Coordinate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={mapY}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                onChange({ mapX, mapY: Math.max(0, Math.min(100, val)) })
              }}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <span className="absolute right-3 top-1.5 text-xs text-text-muted pointer-events-none">
              %
            </span>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  )
}
