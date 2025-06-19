import React from 'react'
import { ShapeElement } from '@/types/presentation'
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

interface ShapeElementEditorProps {
  element: ShapeElement
  onChange: (element: ShapeElement) => void
}

export function ShapeElementEditor({ element, onChange }: ShapeElementEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Shape Type</Label>
        <Select
          value={element.shapeType}
          onValueChange={(value: 'rectangle' | 'circle' | 'line') => {
            onChange({
              ...element,
              shapeType: value
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select shape type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">Rectangle</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="line">Line</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fill Color</Label>
          <div className="flex">
            <Input
              type="color"
              value={element.fill || '#ffffff'}
              onChange={(e) => onChange({ ...element, fill: e.target.value })}
              className="w-10 h-9 p-1 rounded-l-md border-r-0"
            />
            <Input
              type="text"
              value={element.fill || '#ffffff'}
              onChange={(e) => onChange({ ...element, fill: e.target.value })}
              className="rounded-l-none flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Border Color</Label>
          <div className="flex">
            <Input
              type="color"
              value={element.stroke || '#000000'}
              onChange={(e) => onChange({ ...element, stroke: e.target.value })}
              className="w-10 h-9 p-1 rounded-l-md border-r-0"
            />
            <Input
              type="text"
              value={element.stroke || '#000000'}
              onChange={(e) => onChange({ ...element, stroke: e.target.value })}
              className="rounded-l-none flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Border Width: {element.strokeWidth || 1}px</Label>
        <Slider
          min={0}
          max={20}
          step={1}
          value={[element.strokeWidth || 1]}
          onValueChange={([value]) => onChange({ ...element, strokeWidth: value })}
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
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.2, height: 0.2 }),
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
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.2, height: 0.2 }),
                    y: value
                  }
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Width: {(element.position?.width || 0.2).toFixed(2)}</Label>
            <Slider
              min={0.01}
              max={1}
              step={0.01}
              value={[element.position?.width || 0.2]}
              onValueChange={([value]) =>
                onChange({
                  ...element,
                  position: {
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.2, height: 0.2 }),
                    width: value
                  }
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs">
              Height: {(element.position?.height || 0.2).toFixed(2)}
            </Label>
            <Slider
              min={0.01}
              max={1}
              step={0.01}
              value={[element.position?.height || 0.2]}
              onValueChange={([value]) =>
                onChange({
                  ...element,
                  position: {
                    ...(element.position || { x: 0.1, y: 0.1, width: 0.2, height: 0.2 }),
                    height: value
                  }
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-4 border rounded p-4">
        <div className="relative" style={{ height: '100px' }}>
          {element.shapeType === 'rectangle' && (
            <div
              className="absolute"
              style={{
                left: `${(element.position?.x || 0.1) * 100}%`,
                top: `${(element.position?.y || 0.1) * 100}%`,
                width: `${(element.position?.width || 0.2) * 100}%`,
                height: `${(element.position?.height || 0.2) * 100}%`,
                backgroundColor: element.fill || '#ffffff',
                border: `${element.strokeWidth || 1}px solid ${element.stroke || '#000000'}`
              }}
            />
          )}

          {element.shapeType === 'circle' && (
            <div
              className="absolute rounded-full"
              style={{
                left: `${(element.position?.x || 0.1) * 100}%`,
                top: `${(element.position?.y || 0.1) * 100}%`,
                width: `${(element.position?.width || 0.2) * 100}%`,
                height: `${(element.position?.height || 0.2) * 100}%`,
                backgroundColor: element.fill || '#ffffff',
                border: `${element.strokeWidth || 1}px solid ${element.stroke || '#000000'}`
              }}
            />
          )}

          {element.shapeType === 'line' && (
            <div
              className="absolute"
              style={{
                left: `${(element.position?.x || 0.1) * 100}%`,
                top: `${(element.position?.y || 0.1) * 100}%`,
                width: `${(element.position?.width || 0.2) * 100}%`,
                height: `${element.strokeWidth || 1}px`,
                backgroundColor: element.stroke || '#000000',
                transform: `rotate(${
                  Math.atan2(element.position?.height || 0.2, element.position?.width || 0.2) *
                  (180 / Math.PI)
                }deg)`,
                transformOrigin: 'left center'
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ShapeElementEditor
