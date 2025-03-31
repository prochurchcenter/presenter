import { useState, useEffect } from "react";
import { PreviewSettings, BackgroundSettings } from "@/types/service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, Palette, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Wand2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PreviewSettingsFormProps {
  initialSettings?: Partial<PreviewSettings>;
  onChange: (settings: PreviewSettings) => void;
  compact?: boolean;
}

const defaultSettings: PreviewSettings = {
  fontSize: 24,
  fontPosition: "center",
  fontFamily: "Arial",
  textEffect: "none",
  textColor: "#ffffff",
  highlightColor: "rgba(255,255,0,0.3)",
  videoSpeed: 1,
  videoMuted: false,
  background: {
    type: "image",
    url: "",
  },
  textAlign: "center",
};

export function PreviewSettingsForm({ initialSettings, onChange, compact = false }: PreviewSettingsFormProps) {
  const [settings, setSettings] = useState<PreviewSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({
        ...prev,
        ...initialSettings,
        background: {
          ...prev.background,
          ...initialSettings.background,
        }
      }));
    }
  }, [initialSettings]);

  const updateSettings = (partial: Partial<PreviewSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    onChange(updated);
  };

  const updateBackgroundSettings = (partial: Partial<BackgroundSettings>) => {
    const updatedBackground = { ...settings.background, ...partial };
    updateSettings({ background: updatedBackground });
  };

  const handleVideoSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-video-file');
        updateBackgroundSettings({
          type: "video",
          url: filePath
        });
      } catch (err) {
        console.error("Error selecting video:", err);
      }
    }
  };

  const handleImageSelect = async () => {
    if (window.electron) {
      try {
        const filePath = await window.electron.ipcRenderer.invoke('select-image-file');
        updateBackgroundSettings({
          type: "image",
          url: filePath
        });
      } catch (err) {
        console.error("Error selecting image:", err);
      }
    }
  };

  return compact ? (
    <CompactPreviewSettingsForm 
      settings={settings} 
      updateSettings={updateSettings}
      updateBackgroundSettings={updateBackgroundSettings}
      handleImageSelect={handleImageSelect}
      handleVideoSelect={handleVideoSelect}
    />
  ) : (
    <FullPreviewSettingsForm 
      settings={settings} 
      updateSettings={updateSettings}
      updateBackgroundSettings={updateBackgroundSettings}
      handleImageSelect={handleImageSelect}
      handleVideoSelect={handleVideoSelect}
    />
  );
}

interface PreviewSettingsFormChildProps {
  settings: PreviewSettings;
  updateSettings: (partial: Partial<PreviewSettings>) => void;
  updateBackgroundSettings: (partial: Partial<BackgroundSettings>) => void;
  handleImageSelect: () => Promise<void>;
  handleVideoSelect: () => Promise<void>;
}

function CompactPreviewSettingsForm({ 
  settings, 
  updateSettings, 
  updateBackgroundSettings, 
  handleImageSelect, 
  handleVideoSelect 
}: PreviewSettingsFormChildProps) {
  const [activeTab, setActiveTab] = useState("typography");
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="typography" className="text-xs">
            <Type className="h-4 w-4 mr-1" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-xs">
            <Wand2 className="h-4 w-4 mr-1" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="background" className="text-xs">
            <Palette className="h-4 w-4 mr-1" />
            Background
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="typography" className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="font-family" className="text-xs">Font Family</Label>
              <Select 
                value={settings.fontFamily} 
                onValueChange={val => updateSettings({ fontFamily: val })}
              >
                <SelectTrigger id="font-family" className="h-8 text-xs">
                  <SelectValue placeholder="Select Font" />
                </SelectTrigger>
                <SelectContent>
                  {["Arial", "Verdana", "Georgia", "Times New Roman", "Courier New"].map(font => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="font-position" className="text-xs">Position</Label>
              <Select 
                value={settings.fontPosition} 
                onValueChange={val => updateSettings({ fontPosition: val })}
              >
                <SelectTrigger id="font-position" className="h-8 text-xs">
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label htmlFor="font-size" className="text-xs">Font Size: {settings.fontSize}px</Label>
            </div>
            <Slider 
              id="font-size" 
              min={12} 
              max={72} 
              step={1} 
              value={[settings.fontSize]} 
              onValueChange={([val]) => updateSettings({ fontSize: val })}
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Text Alignment</Label>
            <div className="flex bg-muted rounded-md p-1">
              {(["left", "center", "right", "justify"] as const).map(align => {
                const Icon = align === "left" ? AlignLeft : 
                            align === "center" ? AlignCenter : 
                            align === "right" ? AlignRight : AlignJustify;
                return (
                  <Button
                    key={align}
                    type="button"
                    variant={settings.textAlign === align ? "default" : "ghost"}
                    className="flex-1 h-8"
                    onClick={() => updateSettings({ textAlign: align })}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="effects" className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="text-effect" className="text-xs">Text Effect</Label>
              <Select 
                value={settings.textEffect} 
                onValueChange={val => updateSettings({ textEffect: val })}
              >
                <SelectTrigger id="text-effect" className="h-8 text-xs">
                  <SelectValue placeholder="Select Effect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="shadow">Shadow</SelectItem>
                  <SelectItem value="highlight">Highlight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="text-color" className="text-xs">Text Color</Label>
              <div className="flex h-8">
                <Input
                  id="text-color"
                  type="color"
                  value={settings.textColor}
                  onChange={e => updateSettings({ textColor: e.target.value })}
                  className="p-1 w-8 h-8"
                />
                <Input
                  type="text"
                  value={settings.textColor}
                  onChange={e => updateSettings({ textColor: e.target.value })}
                  className="text-xs h-8 flex-1 ml-2"
                />
              </div>
            </div>
          </div>
          
          {settings.textEffect === "highlight" && (
            <div className="space-y-1">
              <Label htmlFor="highlight-color" className="text-xs">Highlight Color</Label>
              <div className="flex h-8">
                <Input
                  id="highlight-color"
                  type="color"
                  value={settings.highlightColor.replace(/[^#\d]/g, '')}
                  onChange={e => updateSettings({ highlightColor: e.target.value })}
                  className="p-1 w-8 h-8"
                />
                <Input
                  type="text"
                  value={settings.highlightColor}
                  onChange={e => updateSettings({ highlightColor: e.target.value })}
                  className="text-xs h-8 flex-1 ml-2"
                />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="background" className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Background Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={settings.background.type === "image" ? "default" : "outline"}
                className="flex-1 h-8 text-xs"
                onClick={() => updateBackgroundSettings({ type: "image" })}
              >
                <Image className="h-3 w-3 mr-1" />
                Image
              </Button>
              <Button
                type="button"
                variant={settings.background.type === "video" ? "default" : "outline"}
                className="flex-1 h-8 text-xs"
                onClick={() => updateBackgroundSettings({ type: "video" })}
              >
                <Video className="h-3 w-3 mr-1" />
                Video
              </Button>
              <Button
                type="button"
                variant={!settings.background.type ? "default" : "outline"}
                className="flex-1 h-8 text-xs"
                onClick={() => updateBackgroundSettings({ type: "" })}
              >
                None
              </Button>
            </div>
          </div>
          
          {settings.background.type === "image" && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-8 text-xs"
              onClick={handleImageSelect}
            >
              {settings.background.url ? 'Change Image' : 'Select Image'}
            </Button>
          )}
          
          {settings.background.type === "video" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-8 text-xs"
                onClick={handleVideoSelect}
              >
                {settings.background.url ? 'Change Video' : 'Select Video'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Video Speed: {settings.videoSpeed}x</Label>
                  <Slider 
                    min={0.5} 
                    max={2} 
                    step={0.1} 
                    value={[settings.videoSpeed]} 
                    onValueChange={([val]) => updateSettings({ videoSpeed: val })}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant={settings.videoMuted ? "default" : "outline"}
                    className="flex-1 h-8 text-xs"
                    onClick={() => updateSettings({ videoMuted: !settings.videoMuted })}
                  >
                    {settings.videoMuted ? 'Unmute' : 'Mute'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FullPreviewSettingsForm({ 
  settings,
  updateSettings,
  updateBackgroundSettings,
  handleImageSelect,
  handleVideoSelect
}: PreviewSettingsFormChildProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Typography</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select 
              value={settings.fontFamily} 
              onValueChange={val => updateSettings({ fontFamily: val })}
            >
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                {["Arial", "Verdana", "Georgia", "Times New Roman", "Courier New"].map(font => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font-position">Position</Label>
            <Select 
              value={settings.fontPosition} 
              onValueChange={val => updateSettings({ fontPosition: val })}
            >
              <SelectTrigger id="font-position">
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="font-size">Font Size</Label>
            <span className="text-sm">{settings.fontSize}px</span>
          </div>
          <Slider 
            id="font-size" 
            min={12} 
            max={72} 
            step={1} 
            value={[settings.fontSize]} 
            onValueChange={([val]) => updateSettings({ fontSize: val })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Text Alignment</Label>
          <div className="flex bg-muted rounded-md p-1">
            {(["left", "center", "right", "justify"] as const).map(align => {
              const Icon = align === "left" ? AlignLeft : 
                          align === "center" ? AlignCenter : 
                          align === "right" ? AlignRight : AlignJustify;
              return (
                <Button
                  key={align}
                  type="button"
                  variant={settings.textAlign === align ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => updateSettings({ textAlign: align })}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Text Effects</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="text-effect">Effect Type</Label>
            <Select 
              value={settings.textEffect} 
              onValueChange={val => updateSettings({ textEffect: val })}
            >
              <SelectTrigger id="text-effect">
                <SelectValue placeholder="Select Effect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="shadow">Shadow</SelectItem>
                <SelectItem value="highlight">Highlight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-10 p-0 h-10"
                    style={{ backgroundColor: settings.textColor }}
                  >
                    <span className="sr-only">Pick a color</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <Input
                    type="color"
                    value={settings.textColor}
                    onChange={e => updateSettings({ textColor: e.target.value })}
                    className="w-32 h-32 cursor-pointer"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={settings.textColor}
                onChange={e => updateSettings({ textColor: e.target.value })}
                className="flex-1 ml-2"
              />
            </div>
          </div>
        </div>
        
        {settings.textEffect === "highlight" && (
          <div className="space-y-2">
            <Label htmlFor="highlight-color">Highlight Color</Label>
            <div className="flex">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-10 p-0 h-10"
                    style={{ backgroundColor: settings.highlightColor }}
                  >
                    <span className="sr-only">Pick a color</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <Input
                    type="color"
                    value={settings.highlightColor.replace(/[^#\d]/g, '')}
                    onChange={e => updateSettings({ highlightColor: e.target.value })}
                    className="w-32 h-32 cursor-pointer"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={settings.highlightColor}
                onChange={e => updateSettings({ highlightColor: e.target.value })}
                className="flex-1 ml-2"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Background</h3>
        <div className="space-y-2">
          <Label>Background Type</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={settings.background.type === "image" ? "default" : "outline"}
              className="flex-1"
              onClick={() => updateBackgroundSettings({ type: "image" })}
            >
              <Image className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button
              type="button"
              variant={settings.background.type === "video" ? "default" : "outline"}
              className="flex-1"
              onClick={() => updateBackgroundSettings({ type: "video" })}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button
              type="button"
              variant={!settings.background.type ? "default" : "outline"}
              className="flex-1"
              onClick={() => updateBackgroundSettings({ type: "" })}
            >
              None
            </Button>
          </div>
        </div>
        
        {settings.background.type === "image" && (
          <div className="space-y-2">
            <Label>Image Source</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleImageSelect}
            >
              {settings.background.url ? 'Change Image' : 'Select Image'}
            </Button>
            
            {settings.background.url && (
              <div className="mt-2 border rounded overflow-hidden">
                <img 
                  src={settings.background.url} 
                  alt="Preview" 
                  className="max-h-[100px] mx-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {settings.background.type === "video" && (
          <div className="space-y-2">
            <Label>Video Source</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleVideoSelect}
            >
              {settings.background.url ? 'Change Video' : 'Select Video'}
            </Button>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label>Video Speed</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    min={0.5} 
                    max={2} 
                    step={0.1} 
                    value={[settings.videoSpeed]} 
                    onValueChange={([val]) => updateSettings({ videoSpeed: val })}
                    className="flex-1"
                  />
                  <span className="text-sm">{settings.videoSpeed}x</span>
                </div>
              </div>
              
              <div className="flex items-end">
                <Button
                  type="button"
                  variant={settings.videoMuted ? "default" : "outline"}
                  className="w-full"
                  onClick={() => updateSettings({ videoMuted: !settings.videoMuted })}
                >
                  {settings.videoMuted ? 'Unmute' : 'Mute'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewSettingsForm;