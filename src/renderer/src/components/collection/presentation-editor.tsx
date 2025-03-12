import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash, FileText, Image as ImageIcon } from 'lucide-react';

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
          ) : (
            <ImageIcon className="h-4 w-4 mr-2" />
          )}
          <span>Slide {index + 1}</span>
        </div>

        <Select 
          value={slide.type} 
          onValueChange={(value) => onChange(index, 'type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="content">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
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
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`image-url-${index}`}>Image URL</Label>
              <Input
                id={`image-url-${index}`}
                value={slide.imageUrl || ''}
                onChange={(e) => onChange(index, 'imageUrl', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label htmlFor={`caption-${index}`}>Caption</Label>
              <Textarea
                id={`caption-${index}`}
                value={slide.content || ''}
                onChange={(e) => onChange(index, 'content', e.target.value)}
                placeholder="Enter image caption (optional)"
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
        )}
      </div>
    </div>
  );
}

interface PresentationEditorProps {
  content: Array<
    { type: 'content', content: string } | 
    { type: 'image', imageUrl: string, content: string }
  >;
  onChange: (content: any[]) => void;
}

export function PresentationEditor({ content, onChange }: PresentationEditorProps) {
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

  const addSlide = (type: 'content' | 'image') => {
    const newSlide = type === 'content'
      ? { type: 'content', content: '' }
      : { type: 'image', imageUrl: '', content: '' };
    
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

  return (
    <div className="space-y-4">
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
      </div>
    </div>
  );
}

export default PresentationEditor;