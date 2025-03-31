import { PreviewSettings } from '@/types/service'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SongSection } from './song-section'

interface SongSectionsProps {
  content: any[]
  showPreview: boolean
  selectedSectionIndex: number | null
  setSelectedSectionIndex: (index: number | null) => void
  previewSettings?: PreviewSettings
  updateSection: (id: number, field: string, value: any) => void
  removeSection: (id: number) => void
  handleDragEnd: (event: any) => void
}

export function SongSections({
  content,
  showPreview,
  selectedSectionIndex,
  setSelectedSectionIndex,
  previewSettings,
  updateSection,
  removeSection,
  handleDragEnd
}: SongSectionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor)
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={content.map((section) => section.index)}
        strategy={verticalListSortingStrategy}
      >
        {content.map((section) => (
          <SongSection
            key={section.index}
            section={section}
            onChange={updateSection}
            onRemove={removeSection}
            previewSettings={previewSettings}
            isSelected={showPreview && selectedSectionIndex === section.index}
            onSelect={setSelectedSectionIndex}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

export default SongSections