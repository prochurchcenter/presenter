import { useState, useEffect } from 'react'
import { Trash, Save, Music, FileText, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SongEditor } from './song-editor'
import { PresentationEditor } from './presentation-editor'
import { ServiceItem, SongItem, PresentationItem, PreviewSettings } from '@/types/service'
import { useDatabase } from '@/hooks/use-database'
import { useServiceStore } from '@renderer/store/useServiceStore'
import { useMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface CollectionDetailProps {
  item: ServiceItem
  onDelete: () => void
  onUpdate: () => void
}

export function CollectionDetail({ item, onDelete, onUpdate }: CollectionDetailProps) {
  const [editedItem, setEditedItem] = useState<ServiceItem>(JSON.parse(JSON.stringify(item)))
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true)
  const { saveItem, saveResult } = useDatabase()
  const { refreshCurrentService } = useServiceStore()
  const { isMobile } = useMobile()

  useEffect(() => {
    setEditedItem(JSON.parse(JSON.stringify(item)))
  }, [item])

  const handleSave = async () => {
    await saveItem(editedItem)

    // After saving, refresh the service to update any references to this item
    await refreshCurrentService()

    // Call the onUpdate callback to notify parent components
    onUpdate()
  }

  const updateField = (field: string, value: any) => {
    setEditedItem((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const updateContent = (content: any[]) => {
    setEditedItem((prev) => ({
      ...prev,
      content
    }))
  }

  const updatePreviewSettings = (settings: PreviewSettings) => {
    setEditedItem((prev) => ({
      ...prev,
      previewSettings: settings
    }))
  }

  const toggleMetadata = () => {
    setIsMetadataExpanded(!isMetadataExpanded)
  }

  return (
    <Card className="border-0 rounded-none h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between sticky top-0 bg-background z-10 border-b">
        <div className="flex items-center gap-2">
          {editedItem.type === 'song' ? (
            <Music className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-primary" />
          )}
          <CardTitle className="text-lg truncate max-w-[400px]">
            {editedItem.title || 'Untitled'}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={saveResult.loading}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        <div
          className={cn(
            'bg-muted/20 transition-all duration-300 overflow-hidden',
            isMetadataExpanded ? 'max-h-[200px]' : 'max-h-[40px]'
          )}
        >
          <div className="p-4 flex flex-row items-center cursor-pointer" onClick={toggleMetadata}>
            <ChevronLeft
              className={cn(
                'h-4 w-4 mr-2 transition-transform',
                isMetadataExpanded ? 'rotate-90' : 'rotate-0'
              )}
            />
            <p className="text-sm font-medium">Item Metadata</p>
          </div>

          {isMetadataExpanded && (
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedItem.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedItem.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Add notes..."
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {editedItem.type === 'song' ? (
            <SongEditor
              content={(editedItem as SongItem).content}
              onChange={updateContent}
              previewSettings={editedItem.previewSettings}
              onPreviewSettingsChange={updatePreviewSettings}
            />
          ) : (
            <PresentationEditor
              content={(editedItem as PresentationItem).content}
              onChange={updateContent}
              previewSettings={editedItem.previewSettings}
              onPreviewSettingsChange={updatePreviewSettings}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CollectionDetail
