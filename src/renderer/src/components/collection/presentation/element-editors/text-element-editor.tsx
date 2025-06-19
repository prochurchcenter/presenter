import React from 'react';
import { TextElement, ElementStyling } from '@/types/presentation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';

interface TextElementEditorProps {
  element: TextElement;
  onChange: (element: TextElement) => void;
}

export function TextElementEditor({ element, onChange }: TextElementEditorProps) {
  const styling = element.styling || {};
  
  const updateStyling = (updates: Partial<ElementStyling>) => {
    onChange({
      ...element,
      styling: {
        ...styling,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="element-text">Text Content</Label>
        <Textarea
          id="element-text"
          value={element.content}
          onChange={(e) => onChange({ ...element, content: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={styling.fontFamily || 'Arial'}
            onValueChange={(value) => updateStyling({ fontFamily: value })}
          >
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select font" />
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

        <div className="space-y-2">
          <Label htmlFor="font-size">Font Size: {styling.fontSize || 24}px</Label>
          <Slider
            id="font-size"
            min={8}
            max={100}
            step={1}
            value={[styling.fontSize || 24]}
            onValueChange={([value]) => updateStyling({ fontSize: value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex">
            <Input
              type="color"
              value={styling.textColor || '#ffffff'}
              onChange={(e) => updateStyling({ textColor: e.target.value })}
              className="w-10 h-9 p-1 rounded-l-md border-r-0"
            />
            <Input
              type="text"
              value={styling.textColor || '#ffffff'}
              onChange={(e) => updateStyling({ textColor: e.target.value })}
              className="rounded-l-none flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Text Effect</Label>
          <Select
            value={styling.textEffect || 'none'}
            onValueChange={(value: 'none' | 'shadow' | 'highlight') => {
              updateStyling({ textEffect: value });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select effect" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="shadow">Shadow</SelectItem>
              <SelectItem value="highlight">Highlight</SelectItem>
            </SelectContent>
          </Select>

          {styling.textEffect === 'highlight' && (
            <div className="mt-3">
              <Label>Highlight Color</Label>
              <div className="flex mt-1">
                <Input
                  type="color"
                  value={styling.highlightColor || '#ffff00'}
                  onChange={(e) => updateStyling({ highlightColor: e.target.value })}
                  className="w-10 h-9 p-1 rounded-l-md border-r-0"
                />
                <Input
                  type="text"
                  value={styling.highlightColor || '#ffff00'}
                  onChange={(e) => updateStyling({ highlightColor: e.target.value })}
                  className="rounded-l-none flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Text Style</Label>
        <div className="flex space-x-2">
          <Button
            type="button"
            size="sm"
            variant={styling.fontWeight === 'bold' ? 'default' : 'outline'}
            onClick={() => updateStyling({ 
              fontWeight: styling.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={styling.fontStyle === 'italic' ? 'default' : 'outline'}
            onClick={() => updateStyling({ 
              fontStyle: styling.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={styling.textDecoration === 'underline' ? 'default' : 'outline'}
            onClick={() => updateStyling({ 
              textDecoration: styling.textDecoration === 'underline' ? 'none' : 'underline' 
            })}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <div className="flex bg-muted rounded-md p-1">
          {[
            { value: 'left', icon: <AlignLeft className="h-4 w-4" /> },
            { value: 'center', icon: <AlignCenter className="h-4 w-4" /> },
            { value: 'right', icon: <AlignRight className="h-4 w-4" /> },
            { value: 'justify', icon: <AlignJustify className="h-4 w-4" /> }
          ].map((align) => (
            <Button
              key={align.value}
              type="button"
              variant={styling.textAlign === align.value ? 'default' : 'ghost'}
              className="flex-1 h-8"
              onClick={() => updateStyling({ textAlign: align.value as any })}
            >
              {align.icon}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Line Height: {styling.lineHeight || 1.5}</Label>
          <Slider
            min={0.5}
            max={3}
            step={0.1}
            value={[styling.lineHeight || 1.5]}
            onValueChange={([value]) => updateStyling({ lineHeight: value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Opacity: {styling.opacity !== undefined ? (styling.opacity * 100).toFixed(0) : 100}%</Label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[styling.opacity !== undefined ? styling.opacity : 1]}
            onValueChange={([value]) => updateStyling({ opacity: value })}
          />
        </div>
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
              onValueChange={([value]) => onChange({
                ...element,
                position: {
                  ...element.position || { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
                  x: value
                }
              })}
            />
          </div>
          <div>
            <Label className="text-xs">Y: {(element.position?.y || 0.1).toFixed(2)}</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[element.position?.y || 0.1]}
              onValueChange={([value]) => onChange({
                ...element,
                position: {
                  ...element.position || { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
                  y: value
                }
              })}
            />
          </div>
          <div>
            <Label className="text-xs">Width: {(element.position?.width || 0.8).toFixed(2)}</Label>
            <Slider
              min={0.1}
              max={1}
              step={0.01}
              value={[element.position?.width || 0.8]}
              onValueChange={([value]) => onChange({
                ...element,
                position: {
                  ...element.position || { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
                  width: value
                }
              })}
            />
          </div>
          <div>
            <Label className="text-xs">Height: {(element.position?.height || 0.8).toFixed(2)}</Label>
            <Slider
              min={0.1}
              max={1}
              step={0.01}
              value={[element.position?.height || 0.8]}
              onValueChange={([value]) => onChange({
                ...element,
                position: {
                  ...element.position || { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
                  height: value
                }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextElementEditor;