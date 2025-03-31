import { Button } from '@/components/ui/button'
import { PreviewSettings } from '@/types/service'
import { useEffect, useState } from 'react'
import { PresentationSlides } from './presentation/presentation-slides'
import { PresentationDesignTab } from './presentation/presentation-design-tab'
import { PresentationPreview } from './presentation/presentation-preview'
import { PresentationSettingsTab } from './presentation/presentation-settings-tab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { FileText, Monitor, Eye, Settings, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define slide templates
export const slideTemplates = [
  {
    name: 'Title Slide',
    icon: 'Heading',
    content: '# Title\n## Subtitle',
    description: 'A title slide with heading and subtitle',
    type: 'content',
    settings: {
      textAlign: 'center',
      fontSize: 36,
      fontPosition: 'center'
    }
  },
  {
    name: 'Content',
    icon: 'FileText',
    content: 'Main content goes here.\nSecondary line of content.',
    description: 'Simple content slide with clear formatting',
    type: 'content',
    settings: {
      textAlign: 'center',
      fontSize: 28,
      fontPosition: 'center'
    }
  },
  {
    name: 'Bullet Points',
    icon: 'List',
    content: '• First point\n• Second point\n• Third point\n• Fourth point',
    description: 'Organized bullet points for lists and key points',
    type: 'content',
    settings: {
      textAlign: 'left',
      fontSize: 24,
      fontPosition: 'center'
    }
  },
  {
    name: 'Two Columns',
    icon: 'Columns',
    content:
      'Left column content here | Right column content here\nMore left content | More right content',
    description: 'Side-by-side content for comparisons',
    type: 'content',
    settings: {
      textAlign: 'left',
      fontSize: 22,
      fontPosition: 'center'
    }
  },
  {
    name: 'Quote',
    icon: 'TextQuote',
    content:
      '"The greatest glory in living lies not in never falling, but in rising every time we fall."\n\n— Nelson Mandela',
    description: 'Styled quote with attribution',
    type: 'content',
    settings: {
      textAlign: 'center',
      fontSize: 28,
      fontPosition: 'center',
      textEffect: 'shadow'
    }
  },
  {
    name: 'Section Break',
    icon: 'Rows',
    content: 'SECTION TITLE',
    description: 'Bold section divider for new topics',
    type: 'content',
    settings: {
      textAlign: 'center',
      fontSize: 42,
      fontPosition: 'center'
    }
  },
  {
    name: 'Question & Answer',
    icon: 'Heading',
    content: 'Question?\n\nAnswer goes here.',
    description: 'Q&A format for interactive presentations',
    type: 'content',
    settings: {
      textAlign: 'center',
      fontSize: 32,
      fontPosition: 'center'
    }
  },
  {
    name: 'Timeline',
    icon: 'FileText',
    content: '→ Event 1: Description\n→ Event 2: Description\n→ Event 3: Description',
    description: 'Sequential timeline for historical events',
    type: 'content',
    settings: {
      textAlign: 'left',
      fontSize: 24,
      fontPosition: 'center'
    }
  }
]

export interface PresentationEditorProps {
  content: Array<
    | { type: 'content'; content: string; index?: number }
    | { type: 'image'; imageUrl: string; content: string; index?: number }
    | {
        type: 'video'
        videoUrl: string
        videoSpeed?: number
        videoMuted?: boolean
        content?: string
        index?: number
      }
  >
  onChange: (content: any[]) => void
  previewSettings?: PreviewSettings
  onPreviewSettingsChange?: (settings: PreviewSettings) => void
}

export function PresentationEditor({
  content,
  onChange,
  previewSettings,
  onPreviewSettingsChange
}: PresentationEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('slides')
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPresentationView, setShowPresentationView] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (content.length > 0 && activeSlideIndex >= content.length) {
      setActiveSlideIndex(content.length - 1)
    }
  }, [content, activeSlideIndex])

  const updateSlide = (index: number, field: string, value: any) => {
    const updatedContent = [...content]
    updatedContent[index] = {
      ...updatedContent[index],
      [field]: value
    }
    onChange(updatedContent)
  }

  const addSlide = (type: 'content' | 'image' | 'video', templateIndex?: number) => {
    const newSlide =
      type === 'content'
        ? {
            type: 'content',
            content: templateIndex !== undefined ? slideTemplates[templateIndex].content : ''
          }
        : type === 'image'
          ? {
              type: 'image',
              imageUrl: '',
              content: ''
            }
          : {
              type: 'video',
              videoUrl: '',
              videoSpeed: 1,
              videoMuted: false,
              content: ''
            }

    onChange([...content, newSlide])
    // Select the newly added slide
    setActiveSlideIndex(content.length)

    // Apply template settings for new slides created from templates
    if (templateIndex !== undefined && type === 'content' && onPreviewSettingsChange) {
      const template = slideTemplates[templateIndex]

      // Apply template-specific settings while preserving other existing settings
      const updatedSettings = {
        ...previewSettings,
        ...template.settings
      }

      // Apply the updated settings
      onPreviewSettingsChange(updatedSettings)
    }
  }

  const removeSlide = (index: number) => {
    const updatedContent = [...content]
    updatedContent.splice(index, 1)
    onChange(updatedContent)

    // Adjust active slide index if needed
    if (activeSlideIndex >= updatedContent.length) {
      setActiveSlideIndex(Math.max(0, updatedContent.length - 1))
    }
  }

  const duplicateSlide = (index: number) => {
    const slideToDuplicate = content[index]
    if (!slideToDuplicate) return

    const newSlide = { ...slideToDuplicate }
    const updatedContent = [...content]
    updatedContent.splice(index + 1, 0, newSlide)

    onChange(updatedContent)
    setActiveSlideIndex(index + 1)
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === content.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1

    const updatedContent = [...content]
    const [movedSlide] = updatedContent.splice(index, 1)
    updatedContent.splice(newIndex, 0, movedSlide)

    onChange(updatedContent)
    setActiveSlideIndex(newIndex)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = active.id
      const newIndex = over.id

      const updatedContent = [...content]
      const [movedItem] = updatedContent.splice(oldIndex, 1)
      updatedContent.splice(newIndex, 0, movedItem)

      onChange(updatedContent)

      // Update the active slide index
      if (activeSlideIndex === oldIndex) {
        setActiveSlideIndex(newIndex)
      } else if (
        (activeSlideIndex > oldIndex && activeSlideIndex <= newIndex) ||
        (activeSlideIndex < oldIndex && activeSlideIndex >= newIndex)
      ) {
        setActiveSlideIndex(
          activeSlideIndex > oldIndex ? activeSlideIndex - 1 : activeSlideIndex + 1
        )
      }
    }
  }

  const handlePreviewSettingsChange = (settings: PreviewSettings) => {
    if (onPreviewSettingsChange) {
      onPreviewSettingsChange(settings)
    }
  }

  const goToNextSlide = () => {
    if (activeSlideIndex < content.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1)
    }
  }

  const goToPreviousSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      goToNextSlide()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      goToPreviousSlide()
    }
  }

  const applyTemplate = (templateIndex: number) => {
    if (activeSlideIndex === null || activeSlideIndex >= content.length) return
    if (content[activeSlideIndex].type !== 'content') return

    const template = slideTemplates[templateIndex]
    const updatedContent = [...content]
    updatedContent[activeSlideIndex] = {
      ...updatedContent[activeSlideIndex],
      content: template.content
    }

    // Apply template-specific settings while preserving other existing settings
    if (onPreviewSettingsChange) {
      const updatedSettings = {
        ...previewSettings,
        ...template.settings
      }

      onPreviewSettingsChange(updatedSettings)
    }

    onChange(updatedContent)
    setShowTemplates(false)
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className={cn('w-full space-y-4', isFullscreen ? 'hidden' : 'lg:w-4/6')}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="slides" className="text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Slides
            </TabsTrigger>
            <TabsTrigger value="design" className="text-sm">
              <Type className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slides" className="space-y-4">
            <PresentationSlides 
              content={content}
              activeSlideIndex={activeSlideIndex}
              setActiveSlideIndex={setActiveSlideIndex}
              showTemplates={showTemplates}
              setShowTemplates={setShowTemplates}
              updateSlide={updateSlide}
              removeSlide={removeSlide}
              duplicateSlide={duplicateSlide}
              moveSlide={moveSlide}
              handleDragEnd={handleDragEnd}
              previewSettings={previewSettings}
              addSlide={addSlide}
              applyTemplate={applyTemplate}
            />
          </TabsContent>

          <TabsContent value="design" className="space-y-4">
            <PresentationDesignTab 
              content={content}
              activeSlideIndex={activeSlideIndex}
              previewSettings={previewSettings}
              handlePreviewSettingsChange={handlePreviewSettingsChange}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <PresentationSettingsTab 
              previewSettings={previewSettings}
              onPreviewSettingsChange={handlePreviewSettingsChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PresentationPreview 
        content={content}
        activeSlideIndex={activeSlideIndex}
        setActiveSlideIndex={setActiveSlideIndex}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        previewSettings={previewSettings}
        goToNextSlide={goToNextSlide}
        goToPreviousSlide={goToPreviousSlide}
        showPresentationView={showPresentationView}
        setShowPresentationView={setShowPresentationView}
      />

      <Dialog open={showPresentationView} onOpenChange={setShowPresentationView}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Presentation Mode</DialogTitle>
            <DialogDescription>
              Use arrow keys or buttons to navigate between slides
            </DialogDescription>
          </DialogHeader>

          <div className="relative p-4" style={{ width: '100%', paddingTop: '56.25%' }}>
            <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
              {previewSettings?.background?.type &&
                (previewSettings.background.type === 'image' ? (
                  <img
                    src={previewSettings.background.url || '/placeholder.svg'}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : previewSettings.background.type === 'video' ? (
                  <video
                    key={previewSettings.background.url}
                    src={previewSettings.background.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null)}

              {content[activeSlideIndex] && (
                <>
                  {content[activeSlideIndex].type === 'content' ? (
                    <div
                      className="absolute w-full h-full flex items-start justify-center overflow-hidden"
                      style={{
                        alignItems:
                          previewSettings?.fontPosition === 'top'
                            ? 'flex-start'
                            : previewSettings?.fontPosition === 'bottom'
                              ? 'flex-end'
                              : 'center'
                      }}
                    >
                      <div
                        className="w-[80%] max-h-full overflow-hidden py-4"
                        style={{
                          textAlign: previewSettings?.textAlign || 'center',
                          fontFamily: previewSettings?.fontFamily || 'sans-serif',
                          color: previewSettings?.textColor || '#ffffff',
                          textShadow:
                            previewSettings?.textEffect === 'shadow'
                              ? '2px 2px 4px rgba(0,0,0,0.5)'
                              : 'none'
                        }}
                      >
                        {(content[activeSlideIndex].content?.split('\n') || []).map(
                          (line: string, idx: number) => (
                            <div
                              key={`presentation-line-${idx}`}
                              className="block w-full"
                              style={{
                                fontSize: `${previewSettings?.fontSize || 24}px`,
                                lineHeight: '1.2',
                                padding: '0 5px',
                                margin: '2px 0',
                                backgroundColor:
                                  previewSettings?.textEffect === 'highlight'
                                    ? previewSettings.highlightColor
                                    : 'transparent'
                              }}
                            >
                              {line}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : content[activeSlideIndex].type === 'image' ? (
                    <>
                      <img
                        src={content[activeSlideIndex].imageUrl || '/placeholder.svg'}
                        alt="Slide"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      {content[activeSlideIndex].content && (
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white"
                          style={{
                            textAlign: previewSettings?.textAlign || 'center',
                            fontFamily: previewSettings?.fontFamily || 'sans-serif'
                          }}
                        >
                          {content[activeSlideIndex].content}
                        </div>
                      )}
                    </>
                  ) : content[activeSlideIndex].type === 'video' ? (
                    <>
                      <video
                        src={content[activeSlideIndex].videoUrl}
                        autoPlay
                        loop
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ playbackRate: content[activeSlideIndex].videoSpeed || 1 }}
                        muted={content[activeSlideIndex].videoMuted}
                        controls={false}
                        playsInline
                      />
                      {content[activeSlideIndex].content && (
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white"
                          style={{
                            textAlign: previewSettings?.textAlign || 'center',
                            fontFamily: previewSettings?.fontFamily || 'sans-serif'
                          }}
                        >
                          {content[activeSlideIndex].content}
                        </div>
                      )}
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="p-4 flex justify-between items-center">
            <Button onClick={goToPreviousSlide} disabled={activeSlideIndex === 0}>
              Previous Slide
            </Button>

            <div className="text-sm font-medium">
              {activeSlideIndex + 1} / {content.length}
            </div>

            <Button onClick={goToNextSlide} disabled={activeSlideIndex === content.length - 1}>
              Next Slide
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PresentationEditor