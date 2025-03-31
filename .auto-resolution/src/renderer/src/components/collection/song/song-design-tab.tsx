import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PreviewSettings } from '@/types/service'
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react'

interface SongDesignTabProps {
  content: any[]
  selectedSectionIndex: number | null
  setSelectedSectionIndex: (index: number | null) => void
  previewSettings?: PreviewSettings
  handlePreviewSettingsChange: (settings: PreviewSettings) => void
}

export function SongDesignTab({
  content,
  selectedSectionIndex,
  setSelectedSectionIndex,
  previewSettings,
  handlePreviewSettingsChange
}: SongDesignTabProps) {
  return (
    <>
      <div className="bg-muted/20 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Text Styling</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label htmlFor="design-font-family" className="text-xs">
              Font
            </Label>
            <Select
              value={previewSettings?.fontFamily || 'Arial'}
              onValueChange={(val) =>
                handlePreviewSettingsChange({ ...previewSettings, fontFamily: val })
              }
            >
              <SelectTrigger id="design-font-family" className="h-9">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Arial',
                  'Verdana',
                  'Georgia',
                  'Times New Roman',
                  'Courier New',
                  'Tahoma',
                  'Trebuchet MS',
                  'Impact'
                ].map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="design-font-size" className="text-xs">
              Size: {previewSettings?.fontSize || 24}px
            </Label>
            <Slider
              id="design-font-size"
              min={12}
              max={72}
              step={1}
              value={[previewSettings?.fontSize || 24]}
              onValueChange={([val]) =>
                handlePreviewSettingsChange({ ...previewSettings, fontSize: val })
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <div className="flex items-center">
              <Input
                type="color"
                value={previewSettings?.textColor || '#ffffff'}
                onChange={(e) =>
                  handlePreviewSettingsChange({ ...previewSettings, textColor: e.target.value })
                }
                className="w-9 h-9 p-1 rounded-l-md border-r-0"
              />
              <Input
                type="text"
                value={previewSettings?.textColor || '#ffffff'}
                onChange={(e) =>
                  handlePreviewSettingsChange({ ...previewSettings, textColor: e.target.value })
                }
                className="rounded-l-none h-9 flex-1"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Effect</Label>
            <Select
              value={previewSettings?.textEffect || 'none'}
              onValueChange={(val) =>
                handlePreviewSettingsChange({ ...previewSettings, textEffect: val })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Effect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="shadow">Shadow</SelectItem>
                <SelectItem value="highlight">Highlight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {previewSettings?.textEffect === 'highlight' && (
          <div className="mt-3">
            <Label className="text-xs">Highlight Color</Label>
            <div className="flex items-center mt-1">
              <Input
                type="color"
                value={previewSettings?.highlightColor || 'rgba(255,255,0,0.3)'}
                onChange={(e) =>
                  handlePreviewSettingsChange({
                    ...previewSettings,
                    highlightColor: e.target.value
                  })
                }
                className="w-9 h-9 p-1 rounded-l-md border-r-0"
              />
              <Input
                type="text"
                value={previewSettings?.highlightColor || 'rgba(255,255,0,0.3)'}
                onChange={(e) =>
                  handlePreviewSettingsChange({
                    ...previewSettings,
                    highlightColor: e.target.value
                  })
                }
                className="rounded-l-none h-9 flex-1"
              />
            </div>
          </div>
        )}

        <div className="mt-3">
          <Label className="text-xs">Text Alignment</Label>
          <div className="flex bg-muted rounded-md p-1 mt-1">
            {(['left', 'center', 'right'] as const).map((align) => {
              const Icon =
                align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight
              return (
                <Button
                  key={align}
                  type="button"
                  variant={previewSettings?.textAlign === align ? 'default' : 'ghost'}
                  className="flex-1 h-8"
                  onClick={() =>
                    handlePreviewSettingsChange({ ...previewSettings, textAlign: align })
                  }
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
          </div>
        </div>

        <div className="mt-3">
          <Label className="text-xs">Vertical Position</Label>
          <div className="flex bg-muted rounded-md p-1 mt-1">
            {(['top', 'center', 'bottom'] as const).map((position) => (
              <Button
                key={position}
                type="button"
                variant={previewSettings?.fontPosition === position ? 'default' : 'ghost'}
                className="flex-1 h-8 capitalize"
                onClick={() =>
                  handlePreviewSettingsChange({ ...previewSettings, fontPosition: position })
                }
              >
                {position}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
        <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
          {previewSettings?.background?.type &&
            previewSettings?.background?.url &&
            (previewSettings.background.type === 'image' ? (
              <img
                src={previewSettings.background.url}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : previewSettings.background.type === 'video' ? (
              <video
                src={previewSettings.background.url}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null)}

          {selectedSectionIndex !== null && (
            <div
              className="absolute w-full h-full flex items-start justify-center overflow-hidden"
              style={{
                alignItems:
                  previewSettings?.fontPosition === 'top'
                    ? 'flex-start'
                    : previewSettings?.fontPosition === 'bottom'
                      ? 'flex-end'
                      : 'center'
              }}
            >
              <div
                className="w-[80%] max-h-full overflow-hidden py-4"
                style={{
                  textAlign: previewSettings?.textAlign || 'center',
                  fontFamily: previewSettings?.fontFamily || 'sans-serif',
                  color: previewSettings?.textColor || '#ffffff',
                  textShadow:
                    previewSettings?.textEffect === 'shadow'
                      ? '2px 2px 4px rgba(0,0,0,0.5)'
                      : 'none'
                }}
              >
                {(
                  content.find((s) => s.index === selectedSectionIndex)?.lines?.split('\n') ||
                  []
                ).map((line: string, idx: number) => (
                  <div
                    key={`preview-line-${idx}`}
                    className="block w-full"
                    style={{
                      fontSize: `${previewSettings?.fontSize || 24}px`,
                      lineHeight: '1.2',
                      padding: '0 5px',
                      margin: '2px 0',
                      backgroundColor:
                        previewSettings?.textEffect === 'highlight'
                          ? previewSettings.highlightColor
                          : 'transparent'
                    }}
                  >
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {content.map((section) => (
          <Button
            key={section.index}
            variant={selectedSectionIndex === section.index ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSectionIndex(section.index)}
            className="capitalize text-xs h-9"
          >
            {section.type}
          </Button>
        ))}
      </div>
    </>
  )
}

export default SongDesignTab