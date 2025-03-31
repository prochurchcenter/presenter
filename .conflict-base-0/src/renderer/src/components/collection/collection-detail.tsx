import { useState, useEffect } from 'react'
import { Trash, Save, Music, FileText } from 'lucide-react'
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

interface CollectionDetailProps {
  item: ServiceItem
  onDelete: () => void
  onUpdate: () => void
}

export function CollectionDetail({ item, onDelete, onUpdate }: CollectionDetailProps) {
  const [editedItem, setEditedItem] = useState<ServiceItem>(JSON.parse(JSON.stringify(item)))
  const { saveItem, saveResult } = useDatabase()
  const { refreshCurrentService } = useServiceStore()

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

  return (
    <Card className="border-0 rounded-none h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {editedItem.type === 'song' ? (
            <Music className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-primary" />
          )}
          <CardTitle>{editedItem.type === 'song' ? 'Song' : 'Presentation'} Details</CardTitle>
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

      <CardContent className="space-y-4">
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

        <div className="pt-4">
          <Label>Content</Label>
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
