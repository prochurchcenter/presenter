import React, { useState, useEffect } from 'react'
import {
  EnhancedPresentation,
  EnhancedSlide,
  SlideBackground,
  SlideLayout,
  DEFAULT_LAYOUTS,
  createSlideFromLayout,
  convertOldPresentation
} from '@/types/presentation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FileText,
  ImageIcon,
  Video,
  LayoutTemplate,
  Plus,
  Settings,
  Monitor,
  Eye
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { EnhancedSlideEditor } from './enhanced-slide'
import { SlideBackgroundEditor } from './slide-background-editor'
import { cn } from '@/lib/utils'
import { PreviewSettings } from '@/types/service'

interface EnhancedPresentationEditorProps {
  content: any[]
  onChange: (content: any[]) => void
  previewSettings?: PreviewSettings
  onPreviewSettingsChange?: (settings: PreviewSettings) => void
}

export function EnhancedPresentationEditor({
  content,
  onChange,
  previewSettings,
  onPreviewSettingsChange
}: EnhancedPresentationEditorProps) {
  // Convert old format to new format if needed
  const [presentation, setPresentation] = useState<EnhancedPresentation>(() => {
    return convertOldPresentation(content, previewSettings)
  })

  const [activeTab, setActiveTab] = useState<string>('slides')
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    presentation.slides.length > 0 ? presentation.slides[0].id : null
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPresentationView, setShowPresentationView] = useState(false)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor)
  )

  // Effect to sync state with parent component on initial load
  useEffect(() => {
    // Initial conversion from old format to new format
    const convertedPresentation = convertOldPresentation(content, previewSettings)
    setPresentation(convertedPresentation)

    if (convertedPresentation.slides.length > 0 && !activeSlideId) {
      setActiveSlideId(convertedPresentation.slides[0].id)
    }
  }, [])

  // Effect to sync state with parent component when presentation changes
  useEffect(() => {
    // Convert new format back to old format for parent component
    const convertedContent = presentation.slides
      .map((slide) => {
        if (slide.type === 'content') {
          // Find first text element or use empty string
          const textElement = slide.elements.find((e) => e.type === 'text')
          return {
            type: 'content',
            content: textElement ? textElement.content : '',
            index: presentation.slides.indexOf(slide)
          }
        } else if (slide.type === 'image') {
          // Extract image URL and caption if any
          const textElement = slide.elements.find((e) => e.type === 'text')
          return {
            type: 'image',
            imageUrl: slide.background.type === 'image' ? slide.background.url : '',
            content: textElement ? textElement.content : '',
            index: presentation.slides.indexOf(slide)
          }
        } else if (slide.type === 'video') {
          // Extract video URL, settings and caption if any
          const textElement = slide.elements.find((e) => e.type === 'text')
          return {
            type: 'video',
            videoUrl: slide.background.type === 'video' ? slide.background.url : '',
            videoSpeed: slide.background.videoSpeed,
            videoMuted: slide.background.videoMuted,
            content: textElement ? textElement.content : '',
            index: presentation.slides.indexOf(slide)
          }
        }
        return null
      })
      .filter(Boolean) // Remove any null values

    onChange(convertedContent)

    // Update preview settings from default element styling
    if (onPreviewSettingsChange && presentation.defaultElementStyling) {
      const newPreviewSettings: PreviewSettings = {
        fontFamily: presentation.defaultElementStyling.fontFamily || 'Arial',
        textEffect: presentation.defaultElementStyling.textEffect || 'none',
        textColor: presentation.defaultElementStyling.textColor || '#ffffff',
        fontSize: presentation.defaultElementStyling.fontSize || 24,
        fontPosition: presentation.defaultElementStyling.fontPosition || 'center',
        highlightColor: presentation.defaultElementStyling.highlightColor || 'rgba(255,255,0,0.3)',
        videoSpeed: 1,
        videoMuted: false,
        textAlign: presentation.defaultElementStyling.textAlign || 'center',
        background: {
          type: presentation.defaultBackground?.type || 'none',
          url: presentation.defaultBackground?.url || ''
        }
      }
      onPreviewSettingsChange(newPreviewSettings)
    }
  }, [presentation])

  // Create a new slide
  const addSlide = (type: 'content' | 'image' | 'video', layoutId?: string) => {
    let newSlide: EnhancedSlide

    if (layoutId) {
      // Create from template
      const layout = presentation.layouts?.find((l) => l.id === layoutId) || DEFAULT_LAYOUTS[0]
      newSlide = createSlideFromLayout(layout, presentation.defaultBackground)
      newSlide.type = type
    } else {
      // Create basic slide
      newSlide = {
        id: `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        background: { ...presentation.defaultBackground } || { type: 'none' },
        elements: []
      }

      // Add default elements based on type
      if (type === 'content') {
        newSlide.elements.push({
          id: `text-${Date.now()}`,
          type: 'text',
          content: 'New Slide',
          styling: { ...presentation.defaultElementStyling } || {
            fontSize: 24,
            textAlign: 'center',
            textColor: '#ffffff',
            fontFamily: 'Arial'
          }
        })
      } else if (type === 'image') {
        newSlide.background = {
          type: 'image',
          url: ''
        }
      } else if (type === 'video') {
        newSlide.background = {
          type: 'video',
          url: '',
          videoSpeed: 1,
          videoMuted: true
        }
      }
    }

    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide]
    })

    setActiveSlideId(newSlide.id)
  }

  // Update a slide
  const updateSlide = (slideId: string, updatedSlide: EnhancedSlide) => {
    const updatedSlides = presentation.slides.map((slide) =>
      slide.id === slideId ? updatedSlide : slide
    )

    setPresentation({
      ...presentation,
      slides: updatedSlides
    })
  }

  // Remove a slide
  const removeSlide = (slideId: string) => {
    const updatedSlides = presentation.slides.filter((slide) => slide.id !== slideId)

    setPresentation({
      ...presentation,
      slides: updatedSlides
    })

    // Update active slide if needed
    if (activeSlideId === slideId) {
      setActiveSlideId(updatedSlides.length > 0 ? updatedSlides[0].id : null)
    }
  }

  // Duplicate a slide
  const duplicateSlide = (slideId: string) => {
    const slideToDuplicate = presentation.slides.find((slide) => slide.id === slideId)
    if (!slideToDuplicate) return

    const newSlide: EnhancedSlide = {
      ...JSON.parse(JSON.stringify(slideToDuplicate)), // Deep copy
      id: `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }

    // Ensure all elements have unique IDs
    newSlide.elements = newSlide.elements.map((element) => ({
      ...element,
      id: `${element.id.split('-')[0]}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }))

    const slideIndex = presentation.slides.findIndex((slide) => slide.id === slideId)
    const updatedSlides = [...presentation.slides]
    updatedSlides.splice(slideIndex + 1, 0, newSlide)

    setPresentation({
      ...presentation,
      slides: updatedSlides
    })

    setActiveSlideId(newSlide.id)
  }

  // Move a slide
  const moveSlide = (slideId: string, direction: 'up' | 'down') => {
    const slideIndex = presentation.slides.findIndex((slide) => slide.id === slideId)
    if (slideIndex === -1) return

    if (direction === 'up' && slideIndex === 0) return
    if (direction === 'down' && slideIndex === presentation.slides.length - 1) return

    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1
    const updatedSlides = [...presentation.slides]
    const [movedSlide] = updatedSlides.splice(slideIndex, 1)
    updatedSlides.splice(newIndex, 0, movedSlide)

    setPresentation({
      ...presentation,
      slides: updatedSlides
    })
  }

  // Handle drag end for reordering slides
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = presentation.slides.findIndex((slide) => slide.id === active.id)
      const newIndex = presentation.slides.findIndex((slide) => slide.id === over.id)

      const updatedSlides = [...presentation.slides]
      const [movedSlide] = updatedSlides.splice(oldIndex, 1)
      updatedSlides.splice(newIndex, 0, movedSlide)

      setPresentation({
        ...presentation,
        slides: updatedSlides
      })
    }
  }

  // Apply a layout to a slide
  const applyLayout = (slideId: string, layoutId: string) => {
    const layout =
      presentation.layouts?.find((l) => l.id === layoutId) ||
      DEFAULT_LAYOUTS.find((l) => l.id === layoutId)
    if (!layout) return

    const slideToUpdate = presentation.slides.find((slide) => slide.id === slideId)
    if (!slideToUpdate) return

    // Create new elements from layout template while preserving slide background
    const updatedSlide: EnhancedSlide = {
      ...slideToUpdate,
      elements: layout.elements.map((element) => ({
        ...element,
        id: `${element.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      })),
      layout: layout.id
    }

    updateSlide(slideId, updatedSlide)
  }

  // Update default background for all slides
  const updateDefaultBackground = (background: SlideBackground) => {
    setPresentation({
      ...presentation,
      defaultBackground: background
    })
  }

  // Navigation functions
  const goToNextSlide = () => {
    const currentIndex = presentation.slides.findIndex((slide) => slide.id === activeSlideId)
    if (currentIndex < presentation.slides.length - 1) {
      setActiveSlideId(presentation.slides[currentIndex + 1].id)
    }
  }

  const goToPreviousSlide = () => {
    const currentIndex = presentation.slides.findIndex((slide) => slide.id === activeSlideId)
    if (currentIndex > 0) {
      setActiveSlideId(presentation.slides[currentIndex - 1].id)
    }
  }

  // Calculate slide index for display
  const getSlideIndex = (slideId: string) => {
    return presentation.slides.findIndex((slide) => slide.id === slideId)
  }

  const activeSlide = presentation.slides.find((slide) => slide.id === activeSlideId)

  return (
    <div
      className="flex flex-col lg:flex-row h-full gap-4"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
          goToNextSlide()
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
          goToPreviousSlide()
        }
      }}
    >
      <div className={cn('w-full space-y-4', isFullscreen ? 'hidden' : 'lg:w-4/6')}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="slides" className="text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Slides
            </TabsTrigger>
            <TabsTrigger value="global" className="text-sm">
              <Settings className="h-4 w-4 mr-2" />
              Global Settings
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-sm">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slides" className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={presentation.slides.map((slide) => slide.id)}
                strategy={verticalListSortingStrategy}
              >
                {presentation.slides.map((slide, index) => (
                  <EnhancedSlideEditor
                    key={slide.id}
                    slide={slide}
                    index={index}
                    onUpdateSlide={updateSlide}
                    onRemoveSlide={removeSlide}
                    onDuplicateSlide={duplicateSlide}
                    onMoveSlide={moveSlide}
                    isActive={slide.id === activeSlideId}
                    onSelectSlide={setActiveSlideId}
                    isFirst={index === 0}
                    isLast={index === presentation.slides.length - 1}
                    onApplyLayout={applyLayout}
                    availableLayouts={presentation.layouts || DEFAULT_LAYOUTS}
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

              <Button
                variant="default"
                className="flex-grow-1 mt-2 sm:mt-0"
                onClick={() => addSlide('content', 'title-content')}
              >
                <LayoutTemplate className="h-4 w-4 mr-2" />
                New from Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="global" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Default Background</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  This background will be applied to all new slides and can be overridden on
                  individual slides.
                </p>

                <SlideBackgroundEditor
                  background={presentation.defaultBackground || { type: 'none' }}
                  onChange={updateDefaultBackground}
                />
              </div>

              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Presentation Settings</h3>

                <div className="space-y-4">
                  <div>
                    <Label>Presentation Title</Label>
                    <Input
                      value={presentation.title}
                      onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                      placeholder="Enter presentation title"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Slide Templates</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Apply these templates to create new slides with pre-defined layouts.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {(presentation.layouts || DEFAULT_LAYOUTS).map((layout) => (
                  <Button
                    key={layout.id}
                    variant="outline"
                    className="h-auto flex flex-col items-start p-3 text-left"
                    onClick={() => addSlide('content', layout.id)}
                  >
                    <span className="font-medium">{layout.name}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {layout.elements.length} elements
                    </p>
                    <div className="w-full h-16 bg-black/50 mt-2 relative rounded overflow-hidden">
                      {/* Layout preview visualization */}
                      {layout.elements.map((element, idx) => {
                        if (element.type === 'text') {
                          return (
                            <div
                              key={idx}
                              className="absolute bg-white/20 rounded"
                              style={{
                                left: element.position
                                  ? `${element.position.x * 100}%`
                                  : idx * 10 + 10 + '%',
                                top: element.position ? `${element.position.y * 100}%` : '20%',
                                width: element.position
                                  ? `${element.position.width * 100}%`
                                  : '80%',
                                height: element.position
                                  ? `${element.position.height * 100}%`
                                  : '20%'
                              }}
                            />
                          )
                        }
                        return null
                      })}
                    </div>
                  </Button>
                ))}

                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-3 border-dashed"
                  onClick={() => {
                    // TODO: Implement custom template creation
                    alert('Custom template creation will be implemented in a future update.')
                  }}
                >
                  <Plus className="h-10 w-10 text-muted-foreground" />
                  <span className="font-medium mt-2">Create Custom Template</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview panel */}
      <div
        className={cn(
          'border rounded-lg transition-all',
          isFullscreen ? 'w-full p-0' : 'w-full lg:w-2/6 p-4'
        )}
      >
        {!isFullscreen && (
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-md font-medium">Live Preview</h3>
              <p className="text-xs text-muted-foreground">16:9 aspect ratio</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1"
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresentationView(true)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Present</span>
              </Button>
            </div>
          </div>
        )}

        <div
          className={cn(
            'relative',
            isFullscreen ? 'h-full' : 'w-full'
          )}
          style={!isFullscreen ? { paddingTop: '56.25%' } : undefined}
        >
          <div
            className={cn(
              'bg-black rounded-lg overflow-hidden',
              isFullscreen ? 'fixed inset-0 z-50' : 'absolute inset-0'
            )}
          >
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  Exit Fullscreen
                </Button>
              </div>
            )}

            {/* Render active slide */}
            {activeSlide && (
              <div className="relative w-full h-full">
                {/* Background */}
                {activeSlide.background.type === 'image' && activeSlide.background.url && (
                  <img
                    src={activeSlide.background.url}
                    alt="Background"
                    className="absolute inset-0 w-full h-full"
                    style={{
                      objectFit: activeSlide.background.fit || 'cover',
                      objectPosition: activeSlide.background.position || 'center',
                      filter: `blur(${activeSlide.background.blur || 0}px)`,
                      opacity:
                        activeSlide.background.opacity !== undefined
                          ? activeSlide.background.opacity
                          : 1
                    }}
                  />
                )}

                {activeSlide.background.type === 'video' && activeSlide.background.url && (
                  <video
                    src={activeSlide.background.url}
                    autoPlay
                    loop
                    muted={activeSlide.background.videoMuted}
                    playsInline
                    className="absolute inset-0 w-full h-full"
                    style={{
                      objectFit: activeSlide.background.fit || 'cover',
                      opacity:
                        activeSlide.background.opacity !== undefined
                          ? activeSlide.background.opacity
                          : 1
                    }}
                  />
                )}

                {activeSlide.background.type === 'color' && activeSlide.background.color && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: activeSlide.background.color,
                      opacity:
                        activeSlide.background.opacity !== undefined
                          ? activeSlide.background.opacity
                          : 1
                    }}
                  />
                )}

                {/* Elements */}
                {activeSlide.elements.map((element) => {
                  if (element.type === 'text') {
                    const styling = element.styling || {}

                    return (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: element.position ? `${element.position.x * 100}%` : '10%',
                          top: element.position ? `${element.position.y * 100}%` : '10%',
                          width: element.position ? `${element.position.width * 100}%` : '80%',
                          height: element.position ? `${element.position.height * 100}%` : 'auto',
                          textAlign: styling.textAlign || 'center',
                          fontFamily: styling.fontFamily || 'Arial',
                          color: styling.textColor || '#ffffff',
                          fontSize: `${styling.fontSize || 24}px`,
                          fontWeight: styling.fontWeight || 'normal',
                          fontStyle: styling.fontStyle || 'normal',
                          textDecoration: styling.textDecoration || 'none',
                          lineHeight: styling.lineHeight || 1.5,
                          padding: `${styling.padding || 0}px`,
                          opacity: styling.opacity !== undefined ? styling.opacity : 1,
                          textShadow:
                            styling.textEffect === 'shadow'
                              ? '2px 2px 4px rgba(0,0,0,0.5)'
                              : 'none',
                          backgroundColor:
                            styling.textEffect === 'highlight'
                              ? styling.highlightColor || 'rgba(255,255,0,0.3)'
                              : 'transparent'
                        }}
                      >
                        {element.content.split('\n').map((line, i) => (
                          <div key={i}>{line || '\u00A0'}</div>
                        ))}
                      </div>
                    )
                  } else if (element.type === 'image') {
                    return (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: element.position ? `${element.position.x * 100}%` : '10%',
                          top: element.position ? `${element.position.y * 100}%` : '10%',
                          width: element.position ? `${element.position.width * 100}%` : '30%',
                          height: element.position ? `${element.position.height * 100}%` : '30%'
                        }}
                      >
                        <img
                          src={element.url || '/placeholder.svg'}
                          alt={element.alt || ''}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )
                  } else if (element.type === 'shape') {
                    return (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: element.position ? `${element.position.x * 100}%` : '10%',
                          top: element.position ? `${element.position.y * 100}%` : '10%',
                          width: element.position ? `${element.position.width * 100}%` : '20%',
                          height: element.position ? `${element.position.height * 100}%` : '20%',
                          backgroundColor: element.fill || 'transparent',
                          border: `${element.strokeWidth || 1}px solid ${element.stroke || 'white'}`,
                          borderRadius: element.shapeType === 'circle' ? '50%' : '0',
                          transform:
                            element.shapeType === 'line'
                              ? `rotate(${Math.atan2(element.position?.height || 0.2, element.position?.width || 0.2) * (180 / Math.PI)}deg)`
                              : 'none',
                          transformOrigin: 'left center'
                        }}
                      />
                    )
                  }
                  return null
                })}
              </div>
            )}

            {isFullscreen && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousSlide}
                  disabled={!activeSlideId || getSlideIndex(activeSlideId) === 0}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  Previous
                </Button>
                <div className="bg-black/50 text-white px-3 py-1 rounded flex items-center">
                  {activeSlideId ? getSlideIndex(activeSlideId) + 1 : 0} /{' '}
                  {presentation.slides.length}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextSlide}
                  disabled={
                    !activeSlideId ||
                    getSlideIndex(activeSlideId) === presentation.slides.length - 1
                  }
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isFullscreen && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <Label>Slide Navigation</Label>
              <div className="text-sm text-muted-foreground">
                {activeSlideId ? getSlideIndex(activeSlideId) + 1 : 0} of{' '}
                {presentation.slides.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousSlide}
                disabled={!activeSlideId || getSlideIndex(activeSlideId) === 0}
              >
                Previous
              </Button>

              <div className="flex-1 overflow-x-auto py-1 flex gap-1 justify-center items-center">
                {presentation.slides.map((slide, idx) => (
                  <Button
                    key={`nav-${slide.id}`}
                    variant={slide.id === activeSlideId ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveSlideId(slide.id)}
                    className="w-8 h-8 p-0 flex-shrink-0"
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextSlide}
                disabled={
                  !activeSlideId || getSlideIndex(activeSlideId) === presentation.slides.length - 1
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Presentation mode dialog - simplified for this example */}
      {showPresentationView && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="w-full max-w-6xl p-4">
            <div className="bg-black w-full" style={{ paddingTop: '56.25%', position: 'relative' }}>
              {/* Simplified presentation view - would be similar to fullscreen preview */}
              <Button
                className="absolute top-4 right-4 bg-black/50 text-white"
                onClick={() => setShowPresentationView(false)}
              >
                Close Presentation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedPresentationEditor
