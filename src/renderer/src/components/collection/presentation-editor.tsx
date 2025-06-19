import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash, FileText, Image as ImageIcon, Settings, Video, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreviewSettingsForm } from '@/components/preview/preview-settings-form';
import { PreviewSettings } from '@/types/service';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SlideProps {
  slide: any;
  index: number;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

function Slide({ slide, index, onChange, onRemove }: SlideProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: index
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const handleVideoSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-video-file');
        onChange(index, 'videoUrl', filePath);
      } catch (err) {
        console.error("Error selecting video:", err);
      }
    }
  };

  const handleImageSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-image-file');
        onChange(index, 'imageUrl', filePath);
      } catch (err) {
        console.error("Error selecting image:", err);
      }
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="border rounded-lg mb-4"
    >
      <div className="flex items-center p-3 border-b bg-muted/20">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab mr-2 touch-none"
        >
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

        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {slide.type === 'content' ? (
          <Textarea
            placeholder="Enter slide content..."
            value={slide.content}
            onChange={(e) => onChange(index, 'content', e.target.value)}
            rows={4}
            className="resize-none focus-visible:ring-0"
          />
        ) : slide.type === 'image' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={`image-url-${index}`}>Image Source</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleImageSelect}
                >
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
              <Textarea
                id={`caption-${index}`}
                value={slide.content || ''}
                onChange={(e) => onChange(index, 'content', e.target.value)}
                placeholder="Enter image caption"
                rows={2}
                className="resize-none focus-visible:ring-0"
              />
            </div>
            {slide.imageUrl && (
              <div className="mt-2 border rounded overflow-hidden">
                <img 
                  src={slide.imageUrl} 
                  alt="Preview" 
                  className="max-h-[200px] mx-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>
            )}
          </div>
        ) : slide.type === 'video' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={`video-url-${index}`}>Video Source</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleVideoSelect}
                >
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
              <Textarea
                id={`caption-${index}`}
                value={slide.content || ''}
                onChange={(e) => onChange(index, 'content', e.target.value)}
                placeholder="Enter optional overlay text"
                rows={2}
                className="resize-none focus-visible:ring-0"
              />
            </div>
            
            {slide.videoUrl && (
              <div className="mt-2 border rounded overflow-hidden">
                <video 
                  src={slide.videoUrl}
                  controls
                  muted
                  className="max-h-[200px] w-full object-contain"
                />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface PresentationEditorProps {
  content: Array<
    { type: 'content', content: string, index?: number } | 
    { type: 'image', imageUrl: string, content: string, index?: number } |
    { type: 'video', videoUrl: string, videoSpeed?: number, videoMuted?: boolean, content?: string, index?: number }
  >;
  onChange: (content: any[]) => void;
  previewSettings?: PreviewSettings;
  onPreviewSettingsChange?: (settings: PreviewSettings) => void;
}

export function PresentationEditor({ 
  content, 
  onChange, 
  previewSettings, 
  onPreviewSettingsChange 
}: PresentationEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("slides");
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const updateSlide = (index: number, field: string, value: any) => {
    const updatedContent = [...content];
    updatedContent[index] = {
      ...updatedContent[index],
      [field]: value
    };
    onChange(updatedContent);
  };

  const addSlide = (type: 'content' | 'image' | 'video') => {
    const newSlide = 
      type === 'content' ? { 
        type: 'content', 
        content: '' 
      } : type === 'image' ? { 
        type: 'image', 
        imageUrl: '', 
        content: '' 
      } : { 
        type: 'video',
        videoUrl: '',
        videoSpeed: 1,
        videoMuted: false,
        content: ''
      };
    
    onChange([...content, newSlide]);
  };

  const removeSlide = (index: number) => {
    const updatedContent = [...content];
    updatedContent.splice(index, 1);
    onChange(updatedContent);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = active.id;
      const newIndex = over.id;
      
      const updatedContent = [...content];
      const [movedItem] = updatedContent.splice(oldIndex, 1);
      updatedContent.splice(newIndex, 0, movedItem);
      
      onChange(updatedContent);
    }
  };

  const handlePreviewSettingsChange = (settings: PreviewSettings) => {
    if (onPreviewSettingsChange) {
      onPreviewSettingsChange(settings);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="slides" className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Slides
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-sm">
            <Settings className="h-4 w-4 mr-2" />
            Preview Settings
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
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="flex gap-2">
            <Button 
              onClick={() => addSlide('content')}
              variant="outline"
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Text Slide
            </Button>
            <Button 
              onClick={() => addSlide('image')}
              variant="outline"
              className="flex-1"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image Slide
            </Button>
            <Button 
              onClick={() => addSlide('video')}
              variant="outline"
              className="flex-1"
            >
              <Video className="h-4 w-4 mr-2" />
              Add Video Slide
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          {previewSettings && onPreviewSettingsChange && (
            <PreviewSettingsForm
              initialSettings={previewSettings}
              onChange={handlePreviewSettingsChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PresentationEditor;