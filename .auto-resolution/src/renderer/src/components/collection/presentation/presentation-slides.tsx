import { Button } from '@/components/ui/button'
import { PreviewSettings } from '@/types/service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FileText, ImageIcon, Video, LayoutTemplate } from 'lucide-react'
import { slideTemplates } from '../presentation-editor'
import { Slide } from './slide'
import { TemplateItem } from './template-item'

interface PresentationSlidesProps {
  content: any[]
  activeSlideIndex: number
  setActiveSlideIndex: (index: number) => void
  showTemplates: boolean
  setShowTemplates: (show: boolean) => void
  updateSlide: (index: number, field: string, value: any) => void
  removeSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  moveSlide: (index: number, direction: 'up' | 'down') => void
  handleDragEnd: (event: any) => void
  previewSettings?: PreviewSettings
  addSlide: (type: 'content' | 'image' | 'video', templateIndex?: number) => void
  applyTemplate: (templateIndex: number) => void
}

export function PresentationSlides({
  content,
  activeSlideIndex,
  setActiveSlideIndex,
  showTemplates,
  setShowTemplates,
  updateSlide,
  removeSlide,
  duplicateSlide,
  moveSlide,
  handleDragEnd,
  previewSettings,
  addSlide,
  applyTemplate
}: PresentationSlidesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor)
  )

  return (
    <>
      {content.length > 0 && content[activeSlideIndex]?.type === 'content' && (
        <div className="bg-muted/20 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Slide Templates
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-xs h-8"
            >
              {showTemplates ? 'Hide Templates' : 'Show Templates'}
            </Button>
          </div>

          {showTemplates && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-1">
              {slideTemplates.map((template, idx) => (
                <TemplateItem 
                  key={`template-${idx}`}
                  template={template}
                  index={idx}
                  onClick={applyTemplate}
                  size="sm"
                />
              ))}
            </div>
          )}

          {!showTemplates && (
            <p className="text-xs text-muted-foreground">
              Apply pre-designed templates to current slide for quick formatting.
            </p>
          )}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={content.map((_, index) => index)}
          strategy={verticalListSortingStrategy}
        >
          {content.map((slide, index) => (
            <Slide
              key={index}
              slide={slide}
              index={index}
              onChange={updateSlide}
              onRemove={removeSlide}
              onDuplicate={duplicateSlide}
              onMoveSlide={moveSlide}
              previewSettings={previewSettings}
              isActive={index === activeSlideIndex}
              onSelectSlide={setActiveSlideIndex}
              isFirst={index === 0}
              isLast={index === content.length - 1}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => addSlide('content')} variant="outline" className="flex-grow-1">
          <FileText className="h-4 w-4 mr-2" />
          Add Text Slide
        </Button>
        <Button onClick={() => addSlide('image')} variant="outline" className="flex-grow-1">
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Image Slide
        </Button>
        <Button onClick={() => addSlide('video')} variant="outline" className="flex-grow-1">
          <Video className="h-4 w-4 mr-2" />
          Add Video Slide
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="flex-grow-1 mt-2 sm:mt-0">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              New from Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Slide from Template</DialogTitle>
              <DialogDescription>
                Choose a pre-designed template to quickly create a new slide.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto pr-1">
              {slideTemplates.map((template, idx) => (
                <TemplateItem 
                  key={`new-template-${idx}`}
                  template={template}
                  index={idx}
                  onClick={(index) => {
                    addSlide('content', index)
                    document
                      .querySelector('[role="dialog"]')
                      ?.closest('div')
                      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
                  }}
                  size="lg"
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default PresentationSlides