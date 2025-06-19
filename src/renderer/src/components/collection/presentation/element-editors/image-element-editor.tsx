import React from 'react'
import { ImageElement } from '@/types/presentation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Image, RefreshCw } from 'lucide-react'

interface ImageElementEditorProps {
  element: ImageElement
  onChange: (element: ImageElement) => void
}

export function ImageElementEditor({ element, onChange }: ImageElementEditorProps) {
  const handleImageSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-image-file')
        onChange({
          ...element,
          url: filePath
        })
      } catch (err) {
        console.error('Error selecting image:', err)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="image-url">Image Source</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleImageSelect}>
            <Image className="h-4 w-4 mr-2" />
            Browse...
          </Button>
        </div>
        <Input
          id="image-url"
          value={element.url || ''}
          onChange={(e) => onChange({ ...element, url: e.target.value })}
          placeholder="Enter image URL or select file"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-alt">Alternative Text</Label>
        <Input
          id="image-alt"
          value={element.alt || ''}
          onChange={(e) => onChange({ ...element, alt: e.target.value })}
          placeholder="Describe the image (for accessibility)"
        />
      </div>

      <div className="space-y-2">
        <Label>Element Position</Label>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="text-xs">X: {(element.position?.x || 0.1).toFixed(2)}</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[element.position?.x || 0.1]}
              onValueChange={([value]) =>
                onChange({
                  ...element,
                  position: {
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.3, height: 0.3 }),
                    x: value
                  }
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Y: {(element.position?.y || 0.1).toFixed(2)}</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[element.position?.y || 0.1]}
              onValueChange={([value]) =>
                onChange({
                  ...element,
                  position: {
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.3, height: 0.3 }),
                    y: value
                  }
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Width: {(element.position?.width || 0.3).toFixed(2)}</Label>
            <Slider
              min={0.1}
              max={1}
              step={0.01}
              value={[element.position?.width || 0.3]}
              onValueChange={([value]) =>
                onChange({
                  ...element,
                  position: {
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.3, height: 0.3 }),
                    width: value
                  }
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs">
              Height: {(element.position?.height || 0.3).toFixed(2)}
            </Label>
            <Slider
              min={0.1}
              max={1}
              step={0.01}
              value={[element.position?.height || 0.3]}
              onValueChange={([value]) =>
                onChange({
                  ...element,
                  position: {
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.3, height: 0.3 }),
                    height: value
                  }
                })
              }
            />
          </div>
        </div>
      </div>

      {element.url && (
        <div className="mt-4">
          <img
            src={element.url}
            alt={element.alt || 'Preview'}
            className="max-h-[150px] mx-auto border rounded object-contain"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='
            }}
          />
          <div className="flex justify-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImageSelect}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Change Image
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageElementEditor
