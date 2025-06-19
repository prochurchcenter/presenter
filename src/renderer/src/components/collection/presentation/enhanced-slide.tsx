import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import {
  GripVertical,
  Trash,
  FileText,
  Image as ImageIcon,
  Video,
  Copy,
  ChevronUp,
  ChevronDown,
  Palette,
  LayoutGrid,
  Type,
  Settings,
  Layers,
  Plus
} from 'lucide-react'
import { EnhancedSlide, SlideElement, SlideBackground, TextElement } from '@/types/presentation'
import { SlideBackgroundEditor } from './slide-background-editor'
import { TextElementEditor } from './element-editors/text-element-editor'
import { ImageElementEditor } from './element-editors/image-element-editor'
import { ShapeElementEditor } from './element-editors/shape-element-editor'

interface EnhancedSlideEditorProps {
  slide: EnhancedSlide
  index: number
  onUpdateSlide: (slideId: string, updatedSlide: EnhancedSlide) => void
  onRemoveSlide: (slideId: string) => void
  onDuplicateSlide: (slideId: string) => void
  onMoveSlide: (slideId: string, direction: 'up' | 'down') => void
  isActive: boolean
  onSelectSlide: (slideId: string) => void
  isFirst: boolean
  isLast: boolean
  onApplyLayout: (slideId: string, layoutId: string) => void
  availableLayouts: any[]
}

export function EnhancedSlideEditor({
  slide,
  index,
  onUpdateSlide,
  onRemoveSlide,
  onDuplicateSlide,
  onMoveSlide,
  isActive,
  onSelectSlide,
  isFirst,
  isLast,
  onApplyLayout,
  availableLayouts
}: EnhancedSlideEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('content')
  const [activeElementId, setActiveElementId] = useState<string | null>(
    slide.elements.length > 0 ? slide.elements[0].id : null
  )

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: slide.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleUpdateBackground = (background: SlideBackground) => {
    onUpdateSlide(slide.id, {
      ...slide,
      background
    })
  }

  const handleUpdateElement = (elementId: string, updatedElement: SlideElement) => {
    const updatedElements = slide.elements.map((element) =>
      element.id === elementId ? updatedElement : element
    )

    onUpdateSlide(slide.id, {
      ...slide,
      elements: updatedElements
    })
  }

  const handleAddElement = (type: 'text' | 'image' | 'shape') => {
    const newId = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    let newElement: SlideElement

    if (type === 'text') {
      newElement = {
        id: newId,
        type: 'text',
        content: 'New Text',
        styling: {
          fontSize: 24,
          textAlign: 'center',
          textColor: '#ffffff',
          fontFamily: 'Arial'
        }
      }
    } else if (type === 'image') {
      newElement = {
        id: newId,
        type: 'image',
        url: '',
        alt: 'Image'
      }
    } else {
      newElement = {
        id: newId,
        type: 'shape',
        shapeType: 'rectangle',
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1
      }
    }

    onUpdateSlide(slide.id, {
      ...slide,
      elements: [...slide.elements, newElement]
    })

    setActiveElementId(newId)
  }

  const handleRemoveElement = (elementId: string) => {
    const updatedElements = slide.elements.filter((element) => element.id !== elementId)

    onUpdateSlide(slide.id, {
      ...slide,
      elements: updatedElements
    })

    if (activeElementId === elementId) {
      setActiveElementId(updatedElements.length > 0 ? updatedElements[0].id : null)
    }
  }

  const activeElement = slide.elements.find((element) => element.id === activeElementId)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border rounded-lg mb-4 transition-all hover:border-primary/50',
        isActive ? 'ring-2 ring-primary' : ''
      )}
      onClick={() => onSelectSlide(slide.id)}
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
          onValueChange={(value: 'content' | 'image' | 'video') => {
            onUpdateSlide(slide.id, {
              ...slide,
              type: value
            })
          }}
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
          <div className="flex border rounded mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onDuplicateSlide(slide.id)}
              title="Duplicate slide"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onMoveSlide(slide.id, 'up')}
              disabled={isFirst}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onMoveSlide(slide.id, 'down')}
              disabled={isLast}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveSlide(slide.id)}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="content" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="background" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Background
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              <LayoutGrid className="h-3 w-3 mr-1" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                Elements
              </h3>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() => handleAddElement('text')}
                >
                  <Plus className="h-3 w-3 mr-1" /> Text
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() => handleAddElement('image')}
                >
                  <Plus className="h-3 w-3 mr-1" /> Image
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() => handleAddElement('shape')}
                >
                  <Plus className="h-3 w-3 mr-1" /> Shape
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-2 border rounded-md p-2 max-h-[300px] overflow-y-auto">
                {slide.elements.length > 0 ? (
                  <div className="space-y-1">
                    {slide.elements.map((element) => (
                      <div
                        key={element.id}
                        className={cn(
                          'p-2 rounded cursor-pointer flex items-center justify-between',
                          activeElementId === element.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted'
                        )}
                        onClick={() => setActiveElementId(element.id)}
                      >
                        <div className="flex items-center">
                          {element.type === 'text' ? (
                            <Type className="h-4 w-4 mr-2" />
                          ) : element.type === 'image' ? (
                            <ImageIcon className="h-4 w-4 mr-2" />
                          ) : (
                            <div className="h-4 w-4 mr-2 border" />
                          )}
                          <span className="text-sm">
                            {element.type === 'text'
                              ? (element as TextElement).content.slice(0, 15) +
                                ((element as TextElement).content.length > 15 ? '...' : '')
                              : element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveElement(element.id)
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground">
                    <p className="text-sm">No elements</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddElement('text')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Text
                    </Button>
                  </div>
                )}
              </div>

              <div className="col-span-3 border rounded-md p-3">
                {activeElement ? (
                  <>
                    <h4 className="text-sm font-medium mb-3">
                      Edit{' '}
                      {activeElement.type.charAt(0).toUpperCase() + activeElement.type.slice(1)}
                    </h4>

                    {activeElement.type === 'text' && (
                      <TextElementEditor
                        element={activeElement as TextElement}
                        onChange={(updatedElement) =>
                          handleUpdateElement(activeElement.id, updatedElement)
                        }
                      />
                    )}

                    {activeElement.type === 'image' && (
                      <ImageElementEditor
                        element={activeElement}
                        onChange={(updatedElement) =>
                          handleUpdateElement(activeElement.id, updatedElement)
                        }
                      />
                    )}

                    {activeElement.type === 'shape' && (
                      <ShapeElementEditor
                        element={activeElement}
                        onChange={(updatedElement) =>
                          handleUpdateElement(activeElement.id, updatedElement)
                        }
                      />
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    <p>Select an element to edit</p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
              <div className="absolute inset-0 bg-black/80 rounded overflow-hidden">
                {/* Background display */}
                {slide.background.type === 'image' && slide.background.url && (
                  <img
                    src={slide.background.url}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {slide.background.type === 'video' && slide.background.url && (
                  <video
                    src={slide.background.url}
                    autoPlay
                    loop
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {slide.background.type === 'color' && slide.background.color && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: slide.background.color }}
                  />
                )}

                {/* Elements preview */}
                {slide.elements.map((element) => {
                  if (element.type === 'text') {
                    const textElement = element as TextElement
                    const styling = textElement.styling

                    return (
                      <div
                        key={element.id}
                        className={cn(
                          'absolute',
                          element.id === activeElementId ? 'outline outline-2 outline-primary' : ''
                        )}
                        style={{
                          left: element.position ? `${element.position.x * 100}%` : '10%',
                          top: element.position ? `${element.position.y * 100}%` : '10%',
                          width: element.position ? `${element.position.width * 100}%` : '80%',
                          height: element.position ? `${element.position.height * 100}%` : 'auto',
                          textAlign: styling?.textAlign || 'center',
                          fontFamily: styling?.fontFamily || 'Arial',
                          color: styling?.textColor || '#ffffff',
                          fontSize: `${styling?.fontSize || 24}px`,
                          fontWeight: styling?.fontWeight || 'normal',
                          fontStyle: styling?.fontStyle || 'normal',
                          textDecoration: styling?.textDecoration || 'none',
                          lineHeight: styling?.lineHeight || 1.5,
                          padding: `${styling?.padding || 0}px`,
                          opacity: styling?.opacity !== undefined ? styling.opacity : 1
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveElementId(element.id)
                        }}
                      >
                        {textElement.content}
                      </div>
                    )
                  } else if (element.type === 'image') {
                    return (
                      <div
                        key={element.id}
                        className={cn(
                          'absolute',
                          element.id === activeElementId ? 'outline outline-2 outline-primary' : ''
                        )}
                        style={{
                          left: element.position ? `${element.position.x * 100}%` : '10%',
                          top: element.position ? `${element.position.y * 100}%` : '10%',
                          width: element.position ? `${element.position.width * 100}%` : '30%',
                          height: element.position ? `${element.position.height * 100}%` : '30%'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveElementId(element.id)
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
                        className={cn(
                          'absolute',
                          element.id === activeElementId ? 'outline outline-2 outline-primary' : ''
                        )}
                        style={{
                          left: element.position ? `${element.position.x * 100}%` : '10%',
                          top: element.position ? `${element.position.y * 100}%` : '10%',
                          width: element.position ? `${element.position.width * 100}%` : '20%',
                          height: element.position ? `${element.position.height * 100}%` : '20%',
                          backgroundColor: element.fill || 'transparent',
                          border: `${element.strokeWidth || 1}px solid ${element.stroke || 'white'}`,
                          borderRadius: element.shapeType === 'circle' ? '50%' : '0'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveElementId(element.id)
                        }}
                      />
                    )
                  }
                  return null
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <SlideBackgroundEditor
              background={slide.background}
              onChange={handleUpdateBackground}
            />
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Choose a Layout Template</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Applying a layout will replace the current elements with the layout template
              </p>

              <div className="grid grid-cols-2 gap-2">
                {availableLayouts.map((layout) => (
                  <Button
                    key={layout.id}
                    variant="outline"
                    className="h-auto flex flex-col items-start p-3 text-left"
                    onClick={() => onApplyLayout(slide.id, layout.id)}
                  >
                    <span className="font-medium">{layout.name}</span>
                    <div className="w-full h-12 bg-black/50 mt-2 relative rounded overflow-hidden">
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Slide Transition</Label>
                <Select
                  value={slide.transition?.type || 'none'}
                  onValueChange={(value: 'none' | 'fade' | 'slide' | 'zoom') => {
                    onUpdateSlide(slide.id, {
                      ...slide,
                      transition: {
                        type: value,
                        duration: slide.transition?.duration || 0.5
                      }
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {slide.transition && slide.transition.type !== 'none' && (
                <div className="space-y-2">
                  <Label>Transition Duration: {slide.transition.duration}s</Label>
                  <Slider
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={[slide.transition.duration]}
                    onValueChange={([val]) => {
                      onUpdateSlide(slide.id, {
                        ...slide,
                        transition: {
                          ...slide.transition,
                          duration: val
                        }
                      })
                    }}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default EnhancedSlideEditor
