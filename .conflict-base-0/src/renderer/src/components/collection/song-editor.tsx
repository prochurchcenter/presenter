import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, GripVertical, Trash, Edit, Settings } from 'lucide-react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PreviewSettingsForm } from '@/components/preview/preview-settings-form';
import { PreviewSettings } from '@/types/service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SongSectionProps {
  section: any;
  onChange: (id: number, field: string, value: any) => void;
  onRemove: (id: number) => void;
}

function SongSection({ section, onChange, onRemove }: SongSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.index
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'verse': return 'border-blue-500/20 bg-blue-500/5';
      case 'chorus': return 'border-amber-500/20 bg-amber-500/5';
      case 'bridge': return 'border-purple-500/20 bg-purple-500/5';
      case 'intro': return 'border-green-500/20 bg-green-500/5';
      case 'outro': return 'border-red-500/20 bg-red-500/5';
      default: return 'border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg mb-4 ${getSectionColor(section.type)}`}
    >
      <div className="flex items-center p-3 border-b bg-muted/20">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab mr-2 touch-none"
        >
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

        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(section.index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Textarea
          placeholder="Enter lyrics..."
          value={section.lines}
          onChange={(e) => onChange(section.index, 'lines', e.target.value)}
          rows={4}
          className="resize-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

interface SongEditorProps {
  content: Array<{
    index: number;
    type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
    lines: string;
    startTime: number;
    endTime: number;
  }>;
  onChange: (content: any[]) => void;
  previewSettings?: PreviewSettings;
  onPreviewSettingsChange?: (settings: PreviewSettings) => void;
}

export function SongEditor({
  content,
  onChange,
  previewSettings,
  onPreviewSettingsChange
}: SongEditorProps) {
  const [isRichEditorOpen, setIsRichEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("lyrics");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const updateSection = (id: number, field: string, value: any) => {
    const updatedContent = content.map(section => {
      if (section.index === id) {
        return { ...section, [field]: value };
      }
      return section;
    });
    onChange(updatedContent);
  };

  const addSection = () => {
    const maxIndex = content.length > 0
      ? Math.max(...content.map(section => section.index)) + 1
      : 1;

    const newSection = {
      index: maxIndex,
      type: 'verse' as const,
      lines: '',
      startTime: 0,
      endTime: 0
    };

    onChange([...content, newSection]);
  };

  const removeSection = (id: number) => {
    const updatedContent = content.filter(section => section.index !== id);
    onChange(updatedContent);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const originalIndex = content.findIndex(item => item.index === active.id);
      const newIndex = content.findIndex(item => item.index === over.id);

      const reordered = [...content];
      const [movedItem] = reordered.splice(originalIndex, 1);
      reordered.splice(newIndex, 0, movedItem);

      onChange(reordered);
    }
  };

  const handleRichEditorUpdates = (sections: any[]) => {
    // Update the indices to maintain continuity
    const updatedSections = sections.map((section, idx) => ({
      ...section,
      index: idx + 1
    }));

    onChange(updatedSections);
    setIsRichEditorOpen(false);
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
          <TabsTrigger value="lyrics" className="text-sm">
            <Edit className="h-4 w-4 mr-2" />
            Lyrics
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-sm">
            <Settings className="h-4 w-4 mr-2" />
            Preview Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lyrics" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsRichEditorOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span>Rich Editor</span>
            </Button>
          </div>

          <Dialog open={isRichEditorOpen} onOpenChange={setIsRichEditorOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Rich Lyrics Editor</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={content.map(section => section.index)}
              strategy={verticalListSortingStrategy}
            >
              {content.map(section => (
                <SongSection
                  key={section.index}
                  section={section}
                  onChange={updateSection}
                  onRemove={removeSection}
                />
              ))}
            </SortableContext>
          </DndContext>

          <Button
            onClick={addSection}
            variant="outline"
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Section
          </Button>
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

export default SongEditor;