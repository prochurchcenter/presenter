import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef } from 'react'
import ContentEditable from 'react-contenteditable'
import { cn } from '@/lib/utils'
import { PreviewSettings } from '@/types/service'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  GripVertical,
  Trash,
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
  VolumeX,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

interface SlideProps {
  slide: any
  index: number
  onChange: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
  onDuplicate: (index: number) => void
  onMoveSlide: (index: number, direction: 'up' | 'down') => void
  previewSettings?: PreviewSettings
  isActive: boolean
  onSelectSlide: (index: number) => void
  isFirst: boolean
  isLast: boolean
}

export function Slide({
  slide,
  index,
  onChange,
  onRemove,
  onDuplicate,
  onMoveSlide,
  previewSettings,
  isActive,
  onSelectSlide,
  isFirst,
  isLast
}: SlideProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: index
  })
  const contentRef = useRef('')
  contentRef.current = slide.content || ''

  const handleContentChange = (evt: any) => {
    onChange(index, 'content', evt.target.value)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleVideoSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-video-file')
        onChange(index, 'videoUrl', filePath)
      } catch (err) {
        console.error('Error selecting video:', err)
      }
    }
  }

  const handleImageSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-image-file')
        onChange(index, 'imageUrl', filePath)
      } catch (err) {
        console.error('Error selecting image:', err)
      }
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border rounded-lg mb-4 transition-all hover:border-primary/50',
        isActive ? 'ring-2 ring-primary' : ''
      )}
      onClick={() => onSelectSlide(index)}
    >
      <div className="flex items-center p-3 border-b bg-muted/20">
        <div {...attributes} {...listeners} className="cursor-grab mr-2 touch-none">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex items-center">
          {slide.type === 'content' ? (
            <FileText className="h-4 w-4 mr-2" />
          ) : slide.type === 'image' ? (
            <ImageIcon className="h-4 w-4 mr-2" />
          ) : (
            <Video className="h-4 w-4 mr-2" />
          )}
          <span>Slide {index + 1}</span>
        </div>

        <Select
          value={slide.type}
          onValueChange={(value) => onChange(index, 'type', value)}
          className="ml-2"
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="content">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-1">
          {slide.type === 'content' && (
            <div className="flex border rounded mr-2">
              <Button
                variant={previewSettings?.textAlign === 'left' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const currentSettings = previewSettings || {
                    fontSize: 24,
                    fontPosition: 'center',
                    fontFamily: 'Arial',
                    textEffect: 'none',
                    textColor: '#ffffff',
                    textAlign: 'center'
                  }
                  const updatedSettings = { ...currentSettings, textAlign: 'left' }
                  onChange(index, 'previewSettings', updatedSettings)
                }}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={previewSettings?.textAlign === 'center' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const currentSettings = previewSettings || {
                    fontSize: 24,
                    fontPosition: 'center',
                    fontFamily: 'Arial',
                    textEffect: 'none',
                    textColor: '#ffffff',
                    textAlign: 'center'
                  }
                  const updatedSettings = { ...currentSettings, textAlign: 'center' }
                  onChange(index, 'previewSettings', updatedSettings)
                }}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={previewSettings?.textAlign === 'right' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const currentSettings = previewSettings || {
                    fontSize: 24,
                    fontPosition: 'center',
                    fontFamily: 'Arial',
                    textEffect: 'none',
                    textColor: '#ffffff',
                    textAlign: 'center'
                  }
                  const updatedSettings = { ...currentSettings, textAlign: 'right' }
                  onChange(index, 'previewSettings', updatedSettings)
                }}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex border rounded mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onDuplicate(index)}
              title="Duplicate slide"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onMoveSlide(index, 'up')}
              disabled={isFirst}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onMoveSlide(index, 'down')}
              disabled={isLast}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {slide.type === 'content' ? (
          <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
            <div className="absolute inset-0 bg-black/80 rounded overflow-hidden flex items-center justify-center">
              <div
                className={cn(
                  'w-[80%] max-h-full overflow-hidden',
                  isActive ? 'border-2 border-dashed border-primary/50' : ''
                )}
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
        ) : slide.type === 'image' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={`image-url-${index}`}>Image Source</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleImageSelect}>
                  Browse...
                </Button>
              </div>
              <Input
                id={`image-url-${index}`}
                value={slide.imageUrl || ''}
                onChange={(e) => onChange(index, 'imageUrl', e.target.value)}
                placeholder="Enter image URL or select file"
              />
            </div>
            <div>
              <Label htmlFor={`caption-${index}`}>Caption (optional)</Label>
              <ContentEditable
                html={slide.content || ''}
                onChange={(e) => onChange(index, 'content', e.target.value)}
                className="border rounded p-2 min-h-[60px] resize-none focus-visible:ring-0 outline-none"
                placeholder="Enter image caption"
              />
            </div>
            {slide.imageUrl && (
              <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
                <div className="absolute inset-0 bg-black/80 rounded overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain absolute inset-0 m-auto"
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+'
                    }}
                  />
                  {slide.content && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white"
                      style={{
                        fontSize: `${previewSettings?.fontSize || 18}px`,
                        fontFamily: previewSettings?.fontFamily || 'sans-serif',
                        textAlign: previewSettings?.textAlign || 'center'
                      }}
                    >
                      {slide.content}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : slide.type === 'video' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={`video-url-${index}`}>Video Source</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleVideoSelect}>
                  Browse...
                </Button>
              </div>
              <Input
                id={`video-url-${index}`}
                value={slide.videoUrl || ''}
                onChange={(e) => onChange(index, 'videoUrl', e.target.value)}
                placeholder="Enter video URL or select file"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Playback Speed: {slide.videoSpeed || 1}x</Label>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[slide.videoSpeed || 1]}
                  onValueChange={([val]) => onChange(index, 'videoSpeed', val)}
                />
              </div>

              <div className="space-y-2">
                <Label>Audio</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={slide.videoMuted || false}
                    onCheckedChange={(checked) => onChange(index, 'videoMuted', checked)}
                  />
                  <span className="flex items-center">
                    {slide.videoMuted ? (
                      <>
                        <VolumeX className="h-4 w-4 mr-1" />
                        <span>Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-1" />
                        <span>Sound On</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor={`caption-${index}`}>Caption/Overlay Text (optional)</Label>
              <ContentEditable
                html={slide.content || ''}
                onChange={(e) => onChange(index, 'content', e.target.value)}
                className="border rounded p-2 min-h-[60px] resize-none focus-visible:ring-0 outline-none"
                placeholder="Enter optional overlay text"
              />
            </div>

            {slide.videoUrl && (
              <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
                <div className="absolute inset-0 bg-black/80 rounded overflow-hidden">
                  <video
                    src={slide.videoUrl}
                    controls
                    muted
                    className="max-h-full max-w-full object-contain absolute inset-0 m-auto"
                  />
                  {slide.content && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white"
                      style={{
                        fontSize: `${previewSettings?.fontSize || 18}px`,
                        fontFamily: previewSettings?.fontFamily || 'sans-serif',
                        textAlign: previewSettings?.textAlign || 'center'
                      }}
                    >
                      {slide.content}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Slide
