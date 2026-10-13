import React from 'react'
import { Location } from '@/types'
import { Compass, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CampusMapCanvasProps {
  locations: Location[]
  selectedLocationId: string | null
  onSelectLocation: (location: Location) => void
}

export const CampusMapCanvas: React.FC<CampusMapCanvasProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
}) => {
  const selectedLocation = locations.find((l) => l.id === selectedLocationId)

  // Color mapping by location type for pins
  const pinColorMap: Record<string, { fill: string; stroke: string; text: string }> = {
    department: { fill: '#1D4ED8', stroke: '#FFFFFF', text: '#FFFFFF' }, // Royal Blue
    lab: { fill: '#6366F1', stroke: '#FFFFFF', text: '#FFFFFF' },        // Indigo
    classroom: { fill: '#0B1F44', stroke: '#FFFFFF', text: '#FFFFFF' },  // Navy
    library: { fill: '#0284C7', stroke: '#FFFFFF', text: '#FFFFFF' },    // Sky
    canteen: { fill: '#D97706', stroke: '#FFFFFF', text: '#FFFFFF' },    // Amber
    medical: { fill: '#DC2626', stroke: '#FFFFFF', text: '#FFFFFF' },    // Red
    sports: { fill: '#16A34A', stroke: '#FFFFFF', text: '#FFFFFF' },     // Green
    auditorium: { fill: '#7C3AED', stroke: '#FFFFFF', text: '#FFFFFF' }, // Violet
    parking: { fill: '#475569', stroke: '#FFFFFF', text: '#FFFFFF' },    // Slate
    admin: { fill: '#0F172A', stroke: '#FFFFFF', text: '#FFFFFF' },      // Dark Slate
  }

  return (
    <div className="relative w-full h-full bg-[#EBF3FA] rounded-card border border-border shadow-card overflow-hidden select-none flex flex-col">
      {/* Top Bar Overlay: Disclaimer & Compass */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-surface/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full text-caption font-semibold text-text-primary shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-warning" aria-hidden="true" />
          <span>Simulated map: not live GPS</span>
        </div>

        <div className="bg-surface/90 backdrop-blur-sm border border-border px-2.5 py-1.5 rounded-full text-caption font-semibold text-text-secondary shadow-sm flex items-center gap-1">
          <Compass className="w-4 h-4 text-primary-600 animate-spin-slow" aria-hidden="true" />
          <span className="text-[11px] font-mono">NORTH</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full flex-1 relative min-h-[420px] sm:min-h-[560px]">
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full object-cover"
          aria-label="Campus Companion Interactive Map Canvas"
        >
          <defs>
            {/* Soft shadow for buildings */}
            <filter id="building-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
            </filter>
            {/* Pattern for lawns */}
            <pattern id="lawn-grass" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#E2F1E5" />
              <circle cx="10" cy="10" r="1.5" fill="#D3EAD8" />
            </pattern>
          </defs>

          {/* 1. Base Campus Terrain */}
          <rect width="1000" height="800" fill="#F0F4F8" />

          {/* 2. Green Areas & Parks */}
          {/* Central Lawn & Botanical Garden */}
          <rect x="220" y="240" width="160" height="130" rx="16" fill="url(#lawn-grass)" stroke="#C8E4CF" strokeWidth="2" />
          <rect x="400" y="420" width="200" height="90" rx="16" fill="url(#lawn-grass)" stroke="#C8E4CF" strokeWidth="2" />
          <rect x="620" y="200" width="180" height="150" rx="16" fill="url(#lawn-grass)" stroke="#C8E4CF" strokeWidth="2" />
          <rect x="80" y="580" width="260" height="160" rx="16" fill="url(#lawn-grass)" stroke="#C8E4CF" strokeWidth="2" />

          {/* Sports Oval with 400m Running Track */}
          <ellipse cx="760" cy="140" rx="120" ry="70" fill="#F87171" opacity="0.35" stroke="#EF4444" strokeWidth="3" />
          <ellipse cx="760" cy="140" rx="90" ry="46" fill="#86EFAC" stroke="#22C55E" strokeWidth="2" />

          {/* Basketball Courts */}
          <rect x="620" y="160" width="70" height="45" rx="4" fill="#38BDF8" opacity="0.4" stroke="#0284C7" strokeWidth="2" />

          {/* 3. Road Network & Walking Pathways */}
          {/* Perimeter Road */}
          <rect x="50" y="40" width="900" height="720" rx="36" fill="none" stroke="#D1D9E4" strokeWidth="16" />
          <rect x="50" y="40" width="900" height="720" rx="36" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="8 8" />

          {/* Central Avenue (Vertical spine from Main Gate to Central Quad) */}
          <path d="M 500 760 L 500 240" stroke="#CBD5E1" strokeWidth="24" strokeLinecap="round" />
          <path d="M 500 760 L 500 240" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="10 8" />

          {/* Cross avenues */}
          <path d="M 120 400 L 880 400" stroke="#CBD5E1" strokeWidth="18" strokeLinecap="round" />
          <path d="M 120 620 L 880 620" stroke="#CBD5E1" strokeWidth="18" strokeLinecap="round" />
          <path d="M 200 180 L 800 180" stroke="#CBD5E1" strokeWidth="16" strokeLinecap="round" />

          {/* Fountain Plaza Circle */}
          <circle cx="500" cy="510" r="32" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="3" />
          <circle cx="500" cy="510" r="14" fill="#0284C7" />

          {/* 4. Buildings (Labelled Rounded Rectangles with architectural styling) */}

          {/* Main Entrance Pavilion */}
          <g filter="url(#building-shadow)">
            <rect x="440" y="730" width="120" height="40" rx="8" fill="#0B1F44" stroke="#1D4ED8" strokeWidth="2" />
            <text x="500" y="755" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
              MAIN GATE
            </text>
          </g>

          {/* Administrative Bhavan */}
          <g filter="url(#building-shadow)">
            <rect x="410" y="580" width="180" height="90" rx="12" fill="#FFFFFF" stroke="#0B1F44" strokeWidth="2" />
            <rect x="440" y="580" width="120" height="15" rx="4" fill="#0B1F44" />
            <text x="500" y="625" fill="#0B1F44" fontSize="13" fontWeight="700" textAnchor="middle">
              ADMINISTRATIVE BHAVAN
            </text>
            <text x="500" y="645" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              Registrar / Admissions / Placement
            </text>
          </g>

          {/* Dr. APJ Abdul Kalam Central Library (Knowledge Center) */}
          <g filter="url(#building-shadow)">
            <rect x="220" y="420" width="170" height="100" rx="12" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
            <rect x="220" y="420" width="10" height="100" rx="4" fill="#0284C7" />
            <text x="310" y="465" fill="#0369A1" fontSize="12" fontWeight="700" textAnchor="middle">
              CENTRAL LIBRARY
            </text>
            <text x="310" y="485" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              Knowledge Center / 24-7 Hub
            </text>
          </g>

          {/* Turing Technology Complex (CSE & AI/ML) */}
          <g filter="url(#building-shadow)">
            <rect x="170" y="250" width="180" height="120" rx="12" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="2" />
            <rect x="170" y="250" width="180" height="12" rx="4" fill="#1D4ED8" />
            <text x="260" y="300" fill="#1E40AF" fontSize="12" fontWeight="700" textAnchor="middle">
              TURING TECH COMPLEX
            </text>
            <text x="260" y="320" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              Dept. of CSE & AI/ML / Labs
            </text>
          </g>

          {/* Tagore Memorial Central Auditorium */}
          <g filter="url(#building-shadow)">
            <rect x="420" y="300" width="160" height="95" rx="14" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" />
            <circle cx="500" cy="300" r="16" fill="#7C3AED" />
            <text x="500" y="345" fill="#6D28D9" fontSize="12" fontWeight="700" textAnchor="middle">
              CENTRAL AUDITORIUM
            </text>
            <text x="500" y="365" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              1,200 Seats / Convocation
            </text>
          </g>

          {/* J.C. Bose Academic Block (ECE) */}
          <g filter="url(#building-shadow)">
            <rect x="650" y="270" width="170" height="100" rx="12" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />
            <rect x="810" y="270" width="10" height="100" rx="4" fill="#6366F1" />
            <text x="735" y="315" fill="#4338CA" fontSize="12" fontWeight="700" textAnchor="middle">
              J.C. BOSE BLOCK
            </text>
            <text x="735" y="335" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              Dept. of ECE / VLSI Labs
            </text>
          </g>

          {/* Visvesvaraya Engineering Wing (MECH & Workshop) */}
          <g filter="url(#building-shadow)">
            <rect x="670" y="430" width="170" height="110" rx="12" fill="#FFFFFF" stroke="#D97706" strokeWidth="2" />
            <text x="755" y="475" fill="#B45309" fontSize="12" fontWeight="700" textAnchor="middle">
              VISVESVARAYA WING
            </text>
            <text x="755" y="495" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              MECH / Central Workshop
            </text>
          </g>

          {/* Sir Mokshagundam Complex (CIVIL) */}
          <g filter="url(#building-shadow)">
            <rect x="630" y="580" width="160" height="90" rx="12" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
            <text x="710" y="620" fill="#047857" fontSize="12" fontWeight="700" textAnchor="middle">
              MOKSHAGUNDAM HALL
            </text>
            <text x="710" y="640" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              Civil Engg & Soil Labs
            </text>
          </g>

          {/* Student Amenities & Food Court */}
          <g filter="url(#building-shadow)">
            <rect x="350" y="160" width="140" height="85" rx="12" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
            <text x="420" y="200" fill="#C2410C" fontSize="12" fontWeight="700" textAnchor="middle">
              FOOD COURT & CLINIC
            </text>
            <text x="420" y="220" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              Canteen / Health Center
            </text>
          </g>

          {/* Major Dhyan Chand Sports Complex */}
          <g filter="url(#building-shadow)">
            <rect x="520" y="100" width="120" height="80" rx="14" fill="#FFFFFF" stroke="#16A34A" strokeWidth="2" />
            <text x="580" y="140" fill="#15803D" fontSize="11" fontWeight="700" textAnchor="middle">
              SPORTS COMPLEX
            </text>
            <text x="580" y="160" fill="#64748B" fontSize="9" fontWeight="500" textAnchor="middle">
              Indoor Arena & Gym
            </text>
          </g>

          {/* Kaveri Residence Quad */}
          <g filter="url(#building-shadow)">
            <rect x="100" y="100" width="150" height="90" rx="12" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
            <text x="175" y="145" fill="#334155" fontSize="12" fontWeight="700" textAnchor="middle">
              KAVERI RESIDENCE
            </text>
            <text x="175" y="165" fill="#64748B" fontSize="10" fontWeight="500" textAnchor="middle">
              Student Hostels Office
            </text>
          </g>

          {/* Parking Bay Zones */}
          <rect x="330" y="680" width="90" height="50" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" />
          <text x="375" y="710" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">
            PARKING A
          </text>

          <rect x="580" y="680" width="90" height="50" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" />
          <text x="625" y="710" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">
            PARKING B
          </text>
        </svg>

        {/* 5. Interactive Pin Markers Layer */}
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocationId
          const pinColor = pinColorMap[loc.type] || { fill: '#1D4ED8', stroke: '#FFFFFF', text: '#FFFFFF' }

          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => onSelectLocation(loc)}
              aria-label={`${loc.name} located at ${loc.building}, ${loc.floor}`}
              title={`${loc.name} (${loc.building})`}
              style={{
                left: `${loc.mapX}%`,
                top: `${loc.mapY}%`,
              }}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 focus-visible:outline-none z-20 group',
                isSelected && 'z-30 scale-125'
              )}
            >
              {/* Highlight Pulse Ring when selected */}
              {isSelected && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: pinColor.fill }}
                  aria-hidden="true"
                />
              )}

              {/* Pin Icon Bubble */}
              <div
                style={{
                  backgroundColor: isSelected ? pinColor.fill : '#FFFFFF',
                  borderColor: pinColor.fill,
                  color: isSelected ? '#FFFFFF' : pinColor.fill,
                }}
                className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-card flex items-center justify-center transition-all',
                  'group-hover:scale-115 group-focus-visible:ring-2 group-focus-visible:ring-primary-600 group-focus-visible:ring-offset-2',
                  isSelected && 'ring-2 ring-primary-600 ring-offset-2 shadow-overlay'
                )}
              >
                <MapPin className="w-4 h-4 fill-current stroke-[2]" aria-hidden="true" />
              </div>

              {/* Hover/Selected Tooltip Label */}
              <div
                className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-primary-900 text-white text-[11px] font-semibold rounded shadow-overlay whitespace-nowrap pointer-events-none transition-opacity duration-150',
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                )}
                aria-hidden="true"
              >
                {loc.name}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom Bar: Selected location quick prompt if none selected */}
      {!selectedLocation && (
        <div className="p-3 bg-surface border-t border-border text-center text-caption text-text-muted">
          Select any building pin or list item on the left to view step by step walking directions.
        </div>
      )}
    </div>
  )
}
