import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef } from 'react'
import { PreviewSettings } from '@/types/service'
import { cn } from '@/lib/utils'
import ContentEditable from 'react-contenteditable'
import { getSectionColor } from './utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GripVertical, Trash } from 'lucide-react'

interface SongSectionProps {
  section: any
  onChange: (id: number, field: string, value: any) => void
  onRemove: (id: number) => void
  previewSettings?: PreviewSettings
  isSelected: boolean
  onSelect: (id: number) => void
}

export function SongSection({
  section,
  onChange,
  onRemove,
  previewSettings,
  isSelected,
  onSelect
}: SongSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.index
  })

  const contentRef = useRef(section.lines || '')
  contentRef.current = section.lines || ''

  const handleContentChange = (evt: any) => {
    onChange(section.index, 'lines', evt.target.value)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        `border rounded-lg mb-4 ${getSectionColor(section.type)}`,
        isSelected ? 'ring-2 ring-primary' : ''
      )}
      onClick={() => onSelect(section.index)}
    >
      <div className="flex items-center p-3 border-b bg-muted/20">
        <div {...attributes} {...listeners} className="cursor-grab mr-2 touch-none">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <Select
          value={section.type}
          onValueChange={(value) => onChange(section.index, 'type', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Section Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="verse">Verse</SelectItem>
            <SelectItem value="chorus">Chorus</SelectItem>
            <SelectItem value="bridge">Bridge</SelectItem>
            <SelectItem value="intro">Intro</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onRemove(section.index)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isSelected ? (
          <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
            <div className="absolute inset-0 bg-black/80 rounded overflow-hidden flex items-center justify-center">
              <div
                className="w-[80%] max-h-full overflow-hidden"
                style={{
                  textAlign: previewSettings?.textAlign || 'center',
                  color: previewSettings?.textColor || '#ffffff'
                }}
              >
                <ContentEditable
                  html={contentRef.current}
                  onChange={handleContentChange}
                  className="outline-none p-2 min-h-[100px] break-words"
                  style={{
                    fontSize: `${previewSettings?.fontSize || 24}px`,
                    fontFamily: previewSettings?.fontFamily || 'sans-serif',
                    textShadow:
                      previewSettings?.textEffect === 'shadow'
                        ? '2px 2px 4px rgba(0,0,0,0.5)'
                        : 'none',
                    backgroundColor:
                      previewSettings?.textEffect === 'highlight'
                        ? previewSettings?.highlightColor || 'transparent'
                        : 'transparent'
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <Textarea
            placeholder="Enter lyrics..."
            value={section.lines}
            onChange={(e) => onChange(section.index, 'lines', e.target.value)}
            rows={4}
            className="resize-none focus-visible:ring-0"
          />
        )}
      </div>
    </div>
  )
}

export default SongSection
