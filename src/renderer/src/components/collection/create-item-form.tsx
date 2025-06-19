import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDatabase } from '@/hooks/use-database'
import { v4 as uuidv4 } from 'uuid'
import { SongItem, PresentationItem, PreviewSettings } from '@/types/service'
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PreviewSettingsForm from '@/components/preview/preview-settings-form'

interface CreateItemFormProps {
  type: 'song' | 'presentation'
  onSuccess: () => void
}

export function CreateItemForm({ type, onSuccess }: CreateItemFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    fontSize: 24,
    fontPosition: 'center',
    fontFamily: 'Arial',
    textEffect: 'none',
    textColor: '#ffffff',
    highlightColor: 'rgba(255,255,0,0.3)',
    videoSpeed: 1,
    videoMuted: false,
    background: {
      type: 'image',
      url: ''
    },
    textAlign: 'center'
  })
  const { saveItem } = useDatabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      const id = uuidv4()

      if (type === 'song') {
        const newSong: SongItem = {
          id,
          type: 'song',
          title: title.trim(),
          content: [
            {
              index: 1,
              type: 'verse',
              lines: '',
              startTime: 0,
              endTime: 0
            }
          ],
          previewSettings: previewSettings,
          notes: '',
          duration: 0
        }

        await saveItem(newSong)
      } else {
        const newPresentation: PresentationItem = {
          id,
          type: 'presentation',
          title: title.trim(),
          content: [{ type: 'content', content: '' }],
          previewSettings: previewSettings,
          notes: '',
          duration: 0
        }

        await saveItem(newPresentation)
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create New {type === 'song' ? 'Song' : 'Presentation'}</DialogTitle>
        <DialogDescription>
          Enter details for the new {type === 'song' ? 'song' : 'presentation'}.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${type} title`}
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="pt-4">
            <PreviewSettingsForm
              initialSettings={previewSettings}
              onChange={setPreviewSettings}
              compact={true}
            />
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (activeTab === 'basic') {
              // Already on first tab
            } else {
              setActiveTab('basic')
            }
          }}
          disabled={activeTab === 'basic'}
        >
          Back
        </Button>

        {activeTab === 'basic' ? (
          <Button type="button" onClick={() => setActiveTab('preview')} disabled={!title.trim()}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        )}
      </DialogFooter>
    </form>
  )
}

export default CreateItemForm
