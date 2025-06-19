import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Edit, Type, Settings, PlusCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PreviewSettings } from '@/types/service'
import { SongSections } from './song/song-sections'
import { SongDesignTab } from './song/song-design-tab'
import { PreviewSettingsForm } from '@/components/preview/preview-settings-form'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSectionColorClass } from './song/utils'

interface SongEditorProps {
  content: Array<{
    index: number
    type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro'
    lines: string
    startTime: number
    endTime: number
  }>
  onChange: (content: any[]) => void
  previewSettings?: PreviewSettings
  onPreviewSettingsChange?: (settings: PreviewSettings) => void
}

export function SongEditor({
  content,
  onChange,
  previewSettings,
  onPreviewSettingsChange
}: SongEditorProps) {
  const [isRichEditorOpen, setIsRichEditorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('lyrics')
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [sectionStyles, setSectionStyles] = useState<{ [key: number]: Partial<PreviewSettings> }>({})
  const [showPreview, setShowPreview] = useState(false)
  const [richEditorText, setRichEditorText] = useState('')

  useEffect(() => {
    if (content.length > 0 && selectedSectionIndex === null) {
      setSelectedSectionIndex(content[0].index)
    }

    // Set rich editor text
    const text = content.map((section) => `[${section.type}]\n${section.lines}`).join('\n\n')
    setRichEditorText(text)
  }, [content, selectedSectionIndex])

  const updateSection = (id: number, field: string, value: any) => {
    const updatedContent = content.map((section) => {
      if (section.index === id) {
        return { ...section, [field]: value }
      }
      return section
    })
    onChange(updatedContent)
  }

  const addSection = () => {
    const maxIndex =
      content.length > 0 ? Math.max(...content.map((section) => section.index)) + 1 : 1

    const newSection = {
      index: maxIndex,
      type: 'verse' as const,
      lines: '',
      startTime: 0,
      endTime: 0
    }

    onChange([...content, newSection])
    // Select the newly added section
    setSelectedSectionIndex(maxIndex)
  }

  const removeSection = (id: number) => {
    const updatedContent = content.filter((section) => section.index !== id)
    onChange(updatedContent)

    // Update selected section if needed
    if (selectedSectionIndex === id) {
      setSelectedSectionIndex(updatedContent.length > 0 ? updatedContent[0].index : null)
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const originalIndex = content.findIndex((item) => item.index === active.id)
      const newIndex = content.findIndex((item) => item.index === over.id)

      const reordered = [...content]
      const [movedItem] = reordered.splice(originalIndex, 1)
      reordered.splice(newIndex, 0, movedItem)

      onChange(reordered)
    }
  }

  const handleRichEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRichEditorText(e.target.value)
  }

  const handleRichEditorSave = () => {
    // Parse the rich editor text into sections
    const sections: any[] = []
    let currentType = ''
    let currentLines: string[] = []
    let sectionIndex = 1

    richEditorText.split('\n').forEach((line) => {
      if (line.trim() === '') {
        if (currentType && currentLines.length > 0) {
          sections.push({
            index: sectionIndex++,
            type: currentType,
            lines: currentLines.join('\n'),
            startTime: 0,
            endTime: 0
          })
          currentLines = []
        }
      } else if (line.match(/^\[(verse|chorus|bridge|intro|outro)\]$/i)) {
        if (currentType && currentLines.length > 0) {
          sections.push({
            index: sectionIndex++,
            type: currentType,
            lines: currentLines.join('\n'),
            startTime: 0,
            endTime: 0
          })
          currentLines = []
        }
        currentType = line.replace(/^\[|\]$/g, '').toLowerCase()
      } else {
        currentLines.push(line)
      }
    })

    // Add the last section if there is one
    if (currentType && currentLines.length > 0) {
      sections.push({
        index: sectionIndex++,
        type: currentType,
        lines: currentLines.join('\n'),
        startTime: 0,
        endTime: 0
      })
    }

    onChange(sections)
    setIsRichEditorOpen(false)
  }

  const handlePreviewSettingsChange = (settings: PreviewSettings) => {
    if (onPreviewSettingsChange) {
      onPreviewSettingsChange(settings)
    }
  }

  const duplicateSection = (id: number) => {
    const sectionToDuplicate = content.find((section) => section.index === id)
    if (!sectionToDuplicate) return

    const maxIndex = Math.max(...content.map((section) => section.index)) + 1

    const newSection = {
      ...sectionToDuplicate,
      index: maxIndex
    }

    const sectionIndex = content.findIndex((section) => section.index === id)
    const updatedContent = [...content]
    updatedContent.splice(sectionIndex + 1, 0, newSection)

    onChange(updatedContent)
    setSelectedSectionIndex(maxIndex)
  }

  const moveSection = (id: number, direction: 'up' | 'down') => {
    const sectionIndex = content.findIndex((section) => section.index === id)
    if (sectionIndex === -1) return

    if (direction === 'up' && sectionIndex === 0) return
    if (direction === 'down' && sectionIndex === content.length - 1) return

    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1

    const updatedContent = [...content]
    const [movedSection] = updatedContent.splice(sectionIndex, 1)
    updatedContent.splice(newIndex, 0, movedSection)

    onChange(updatedContent)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="lyrics" className="text-sm">
            <Edit className="h-4 w-4 mr-2" />
            Lyrics
          </TabsTrigger>
          <TabsTrigger value="design" className="text-sm">
            <Type className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lyrics" className="space-y-4">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <Switch checked={showPreview} onCheckedChange={setShowPreview} />
              <Label>Live preview mode</Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsRichEditorOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span>Rich Editor</span>
              </Button>

              {selectedSectionIndex !== null && (
                <Button
                  onClick={() => duplicateSection(selectedSectionIndex)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Duplicate</span>
                </Button>
              )}
            </div>
          </div>

          <Dialog open={isRichEditorOpen} onOpenChange={setIsRichEditorOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Rich Lyrics Editor</DialogTitle>
                <DialogDescription>
                  Use this editor to format and organize your lyrics.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <h3 className="font-medium mb-2">Editor</h3>
                    <Textarea
                      value={richEditorText}
                      onChange={handleRichEditorChange}
                      className="h-[300px] font-mono text-sm"
                      placeholder="[verse]
Your lyrics here

[chorus]
Chorus lyrics here"
                    />
                  </div>
                  <div className="border rounded-md p-3">
                    <h3 className="font-medium mb-2">Preview</h3>
                    <div className="h-[300px] overflow-y-auto">
                      {content.map((section, idx) => (
                        <div key={idx} className="mb-4">
                          <div
                            className={`text-sm font-medium mb-1 ${getSectionColorClass(section.type)}`}
                          >
                            {section.type.toUpperCase()}
                          </div>
                          <p className="whitespace-pre-line">{section.lines}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRichEditorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRichEditorSave}>Apply Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <SongSections 
            content={content}
            showPreview={showPreview}
            selectedSectionIndex={selectedSectionIndex}
            setSelectedSectionIndex={setSelectedSectionIndex}
            previewSettings={previewSettings}
            updateSection={updateSection}
            removeSection={removeSection}
            handleDragEnd={handleDragEnd}
          />

          <Button onClick={addSection} variant="outline" className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <SongDesignTab 
            content={content}
            selectedSectionIndex={selectedSectionIndex}
            setSelectedSectionIndex={setSelectedSectionIndex}
            previewSettings={previewSettings}
            handlePreviewSettingsChange={handlePreviewSettingsChange}
          />
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
  )
}

export default SongEditor