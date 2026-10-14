import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Location, LocationType } from '@/types'
import {
  AdminForm,
  FormSection,
  TextField,
  TextArea,
  SelectField,
  ListEditor,
  MapPinPicker,
  PreviewPanel,
} from '@/components/admin'
import { LocationDetailPanel } from '@/components/domain/LocationDetailPanel'

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'department', label: 'Academic Department' },
  { value: 'classroom', label: 'Lecture Classroom' },
  { value: 'lab', label: 'Laboratory / Research Center' },
  { value: 'library', label: 'Library & Reading Room' },
  { value: 'canteen', label: 'Cafeteria / Canteen' },
  { value: 'auditorium', label: 'Auditorium / Amphitheater' },
  { value: 'parking', label: 'Vehicle Parking Zone' },
  { value: 'admin', label: 'Administrative Office' },
  { value: 'medical', label: 'Health Center & Clinic' },
  { value: 'sports', label: 'Sports Complex & Grounds' },
]

export const LocationEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { locations, createItem, updateItem } = useContentStore()
  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  const [isPreviewOpen, setIsPreviewOpen] = useState(true)

  // Find existing location
  const existingLocation = useMemo(() => {
    if (!id) return null
    return locations.find((l) => l.id === id) || null
  }, [id, locations])

  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState<LocationType>('department')
  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')
  const [description, setDescription] = useState('')
  const [openHours, setOpenHours] = useState('')
  const [mapX, setMapX] = useState(50)
  const [mapY, setMapY] = useState(50)
  const [directions, setDirections] = useState<string[]>([])

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Initialize or populate form
  useEffect(() => {
    if (isEditMode && existingLocation) {
      setName(existingLocation.name)
      setType(existingLocation.type)
      setBuilding(existingLocation.building)
      setFloor(existingLocation.floor)
      setDescription(existingLocation.description)
      setOpenHours(existingLocation.openHours || '')
      setMapX(existingLocation.mapX)
      setMapY(existingLocation.mapY)
      setDirections(existingLocation.directions || [])
      setIsFormDirty(false)
    } else if (!isEditMode) {
      setName('')
      setType('department')
      setBuilding('Main Academic Block')
      setFloor('Ground Floor')
      setDescription('')
      setOpenHours('08:00 AM to 08:00 PM')
      setMapX(50)
      setMapY(40)
      setDirections([
        'Enter through Main Campus Gate',
        'Proceed along central walkway toward Academic Quad',
        'Locate entrance sign on the ground floor foyer',
      ])
      setIsFormDirty(false)
    }
  }, [isEditMode, existingLocation])

  const handleFieldChange = (setter: (val: any) => void, val: any) => {
    setter(val)
    setIsFormDirty(true)
  }

  // Live Preview Object
  const previewLocation: Location = useMemo(() => {
    return {
      id: existingLocation?.id || 'preview-loc-id',
      name: name.trim() || 'Location Name Preview',
      type,
      building: building.trim() || 'Main Campus Building',
      floor: floor.trim() || 'Ground Floor',
      description: description.trim() || 'Location overview and facilities description.',
      mapX,
      mapY,
      directions: directions.length > 0 ? directions : ['Step 1: Follow campus directional signs'],
      openHours: openHours.trim() || undefined,
    }
  }, [existingLocation, name, type, building, floor, description, mapX, mapY, directions, openHours])

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Location name is required'
    }

    if (!type) {
      newErrors.type = 'Location type is required'
    }

    if (!building.trim()) {
      newErrors.building = 'Building name is required'
    }

    if (!floor.trim()) {
      newErrors.floor = 'Floor is required'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      pushToast({
        type: 'error',
        message: 'Please resolve the highlighted errors.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const locationPayload: Omit<Location, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        type,
        building: building.trim(),
        floor: floor.trim(),
        description: description.trim(),
        openHours: openHours.trim() || undefined,
        mapX,
        mapY,
        directions: directions.filter((d) => Boolean(d.trim())),
      }

      if (isEditMode && existingLocation) {
        updateItem('locations', existingLocation.id, locationPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'update',
          itemType: 'location',
          itemId: existingLocation.id,
          itemName: name.trim(),
          summary: `Updated location "${name.trim()}" at (${mapX}%, ${mapY}%)`,
        })
        pushToast({
          type: 'success',
          message: `Saved changes to "${name.trim()}".`,
        })
      } else {
        const created = createItem('locations', locationPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'create',
          itemType: 'location',
          itemId: created.id,
          itemName: created.name,
          summary: `Created new location "${created.name}" on campus map`,
        })
        pushToast({
          type: 'success',
          message: `Created location "${created.name}".`,
        })
      }

      setIsFormDirty(false)
      navigate('/admin/locations')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/locations"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Locations
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isEditMode ? `Edit Location: ${existingLocation?.name || ''}` : 'Add New Location'}
          </h1>
        </div>

        {isEditMode && existingLocation && (
          <a
            href={`/map?location=${existingLocation.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-card border border-border bg-surface hover:bg-canvas text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on Student Map
          </a>
        )}
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 xl:col-span-8">
          <AdminForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/locations')}
            isSubmitting={isSubmitting}
            isDirty={isFormDirty}
            submitLabel={isEditMode ? 'Save Location' : 'Create Location'}
          >
            {/* Section 1: Basic Identity */}
            <FormSection
              title="Location Details"
              description="Basic building identity, category, and floor placement."
            >
              <TextField
                label="Location Name"
                value={name}
                onChange={(val) => handleFieldChange(setName, val)}
                placeholder="e.g. Department of Computer Science & Engineering"
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField
                  label="Type"
                  value={type}
                  onChange={(e) => handleFieldChange(setType, e.target.value as LocationType)}
                  options={LOCATION_TYPES}
                  error={errors.type}
                  required
                />

                <TextField
                  label="Building"
                  value={building}
                  onChange={(val) => handleFieldChange(setBuilding, val)}
                  placeholder="e.g. Main Academic Block"
                  error={errors.building}
                  required
                />

                <TextField
                  label="Floor"
                  value={floor}
                  onChange={(val) => handleFieldChange(setFloor, val)}
                  placeholder="e.g. 2nd Floor, Wing B"
                  error={errors.floor}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Operating Hours (Optional)"
                  value={openHours}
                  onChange={(val) => handleFieldChange(setOpenHours, val)}
                  placeholder="e.g. 08:30 AM to 05:30 PM (Mon to Fri)"
                  helperText="Displayed to students when viewing location info."
                />
              </div>

              <TextArea
                label="Description"
                value={description}
                onChange={(val) => handleFieldChange(setDescription, val)}
                placeholder="Key facilities, lab equipment, office contact info, or access guidelines..."
                error={errors.description}
                required
                rows={3}
              />
            </FormSection>

            {/* Section 2: Interactive SVG Map Pin Picker */}
            <FormSection
              title="Interactive Campus Map Pin"
              description="Position the pin on the campus map canvas. Drag or click anywhere on the canvas to place coordinates."
            >
              <MapPinPicker
                mapX={mapX}
                mapY={mapY}
                onChange={({ mapX: x, mapY: y }) => {
                  handleFieldChange(setMapX, x)
                  handleFieldChange(setMapY, y)
                }}
                existingLocations={locations}
                currentLocationId={existingLocation?.id}
                error={errors.mapCoordinates}
              />
            </FormSection>

            {/* Section 3: Walking Directions from Main Campus Gate */}
            <FormSection
              title="Walking Directions from Main Gate"
              description="Step by step navigation guide for new students and visitors arriving on campus."
            >
              <ListEditor
                items={directions}
                onChange={(val) => handleFieldChange(setDirections, val)}
                placeholder="e.g. Take the right elevator to 2nd floor and turn left..."
                helperText="Numbered in sequential order. Reorder items with up/down arrows."
              />
            </FormSection>
          </AdminForm>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <PreviewPanel
            title="Student Detail Panel Preview"
            isOpen={isPreviewOpen}
            onToggle={() => setIsPreviewOpen((prev) => !prev)}
          >
            <div className="space-y-4 text-left">
              <div className="bg-canvas p-2 rounded-card">
                <LocationDetailPanel
                  location={previewLocation}
                  onClose={() => {}}
                  onSelectLocation={() => {}}
                />
              </div>

              {/* Pin Coordinates Card */}
              <div className="p-4 rounded-card border border-border bg-surface text-xs space-y-2">
                <div className="font-semibold text-text-primary flex items-center justify-between">
                  <span>Coordinates Summary</span>
                  <span className="font-mono text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded">
                    X: {mapX}% | Y: {mapY}%
                  </span>
                </div>
                <div className="text-text-muted">
                  Building: {building || 'Not set'} • Floor: {floor || 'Not set'}
                </div>
              </div>
            </div>
          </PreviewPanel>
        </div>
      </div>
    </div>
  )
}
