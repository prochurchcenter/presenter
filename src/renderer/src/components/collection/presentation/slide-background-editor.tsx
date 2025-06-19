import React from 'react';
import { SlideBackground } from '@/types/presentation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Image, Video, Palette } from 'lucide-react';

interface SlideBackgroundEditorProps {
  background: SlideBackground;
  onChange: (background: SlideBackground) => void;
}

export function SlideBackgroundEditor({ background, onChange }: SlideBackgroundEditorProps) {
  const handleVideoSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-video-file');
        onChange({
          ...background,
          url: filePath
        });
      } catch (err) {
        console.error('Error selecting video:', err);
      }
    }
  };

  const handleImageSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-image-file');
        onChange({
          ...background,
          url: filePath
        });
      } catch (err) {
        console.error('Error selecting image:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Background Type</Label>
        <Select
          value={background.type}
          onValueChange={(value: 'color' | 'image' | 'video' | 'none') => {
            onChange({
              ...background,
              type: value,
              // Set appropriate defaults for each type
              ...(value === 'color' && !background.color ? { color: '#000000' } : {}),
              ...(value === 'video' && !background.videoMuted ? { videoMuted: true } : {}),
              ...(value === 'video' && !background.videoSpeed ? { videoSpeed: 1 } : {})
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select background type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="color">Color</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {background.type === 'color' && (
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="flex items-center">
            <Input
              type="color"
              value={background.color || '#000000'}
              onChange={(e) => onChange({ ...background, color: e.target.value })}
              className="w-12 h-10 p-1 rounded-l-md border-r-0"
            />
            <Input
              type="text"
              value={background.color || '#000000'}
              onChange={(e) => onChange({ ...background, color: e.target.value })}
              className="rounded-l-none flex-1"
            />
          </div>

          <div className="space-y-2 mt-4">
            <Label>Opacity: {background.opacity !== undefined ? (background.opacity * 100).toFixed(0) : 100}%</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[background.opacity !== undefined ? background.opacity : 1]}
              onValueChange={([val]) => onChange({ ...background, opacity: val })}
            />
          </div>
        </div>
      )}

      {background.type === 'image' && (
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
              value={background.url || ''}
              onChange={(e) => onChange({ ...background, url: e.target.value })}
              placeholder="Enter image URL or select file"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fit</Label>
              <Select
                value={background.fit || 'cover'}
                onValueChange={(value: 'cover' | 'contain' | 'fill') => {
                  onChange({ ...background, fit: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={background.position || 'center'}
                onValueChange={(value: 'center' | 'top' | 'bottom' | 'left' | 'right') => {
                  onChange({ ...background, position: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Blur: {background.blur || 0}px</Label>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[background.blur || 0]}
              onValueChange={([val]) => onChange({ ...background, blur: val })}
            />
          </div>

          <div className="space-y-2">
            <Label>Opacity: {background.opacity !== undefined ? (background.opacity * 100).toFixed(0) : 100}%</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[background.opacity !== undefined ? background.opacity : 1]}
              onValueChange={([val]) => onChange({ ...background, opacity: val })}
            />
          </div>

          {background.url && (
            <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
              <div className="absolute inset-0 bg-black/80 rounded overflow-hidden">
                <img
                  src={background.url}
                  alt="Background Preview"
                  className="w-full h-full"
                  style={{
                    objectFit: background.fit || 'cover',
                    objectPosition: background.position || 'center',
                    filter: `blur(${background.blur || 0}px)`,
                    opacity: background.opacity !== undefined ? background.opacity : 1
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {background.type === 'video' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="video-url">Video Source</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleVideoSelect}>
                <Video className="h-4 w-4 mr-2" />
                Browse...
              </Button>
            </div>
            <Input
              id="video-url"
              value={background.url || ''}
              onChange={(e) => onChange({ ...background, url: e.target.value })}
              placeholder="Enter video URL or select file"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fit</Label>
              <Select
                value={background.fit || 'cover'}
                onValueChange={(value: 'cover' | 'contain' | 'fill') => {
                  onChange({ ...background, fit: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Playback Speed: {background.videoSpeed || 1}x</Label>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={[background.videoSpeed || 1]}
                onValueChange={([val]) => onChange({ ...background, videoSpeed: val })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={background.videoMuted || false}
              onCheckedChange={(checked) => onChange({ ...background, videoMuted: checked })}
            />
            <Label>Mute Video</Label>
          </div>

          <div className="space-y-2">
            <Label>Opacity: {background.opacity !== undefined ? (background.opacity * 100).toFixed(0) : 100}%</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[background.opacity !== undefined ? background.opacity : 1]}
              onValueChange={([val]) => onChange({ ...background, opacity: val })}
            />
          </div>

          {background.url && (
            <div className="relative" style={{ width: '100%', paddingTop: '56.25%' }}>
              <div className="absolute inset-0 bg-black/80 rounded overflow-hidden">
                <video
                  src={background.url}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full"
                  style={{
                    objectFit: background.fit || 'cover',
                    opacity: background.opacity !== undefined ? background.opacity : 1
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SlideBackgroundEditor;