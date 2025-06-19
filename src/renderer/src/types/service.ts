// Types for Service and Presentation Items

// Background Settings
interface BackgroundSettings {
    type: string;
    url: string;
  }
  
  // Preview Settings
  interface PreviewSettings {
    fontFamily: string;
    textEffect: string;
    textColor: string;
    fontSize: number;
    fontPosition: string;
    highlightColor: string;
    videoSpeed: number;
    videoMuted: boolean;
    background: BackgroundSettings;
    textAlign:  "left" | "center" | "right" | "justify";
  }
  
  // Content Types for Presentations and Songs
  type ContentType = 
    | { index:number, type: 'verse' | 'chorus' | 'bridge' | 'outro' |'intro', lines: string, startTime: number, endTime: number }
    | { index:number, type: 'content', content: string }
    | { index:number, type: 'image', imageUrl: string, content: string }
    | { index:number, type: 'video', videoUrl: string, videoSpeed?: number, videoMuted?: boolean, content?: string };
  
  // Base Item Interface
  interface BaseItem {
    id: string;
    type: string;
    title: string;
   
    previewSettings: PreviewSettings;
    notes: string;
    duration: number;
  }
  
  // Song Item Interface
  interface SongItem extends BaseItem {
    type: 'song';
    content: Array<{
      index:number;
      type: 'verse' | 'chorus' | 'bridge' | 'outro';
      lines: string;
      startTime: number;
      endTime: number;
    }>;
  }
  
  // Presentation Item Interface
  interface PresentationItem extends BaseItem {
    type: 'presentation';
    content: Array<
      { type: 'content', content: string, index?: number } | 
      { type: 'image', imageUrl: string, content: string, index?: number } |
      { type: 'video', videoUrl: string, videoSpeed?: number, videoMuted?: boolean, content?: string, index?: number }
    >;
  }
  
  // Service Item Type
  type ServiceItem = SongItem | PresentationItem;
  
  // Service Item Reference
  interface ServiceItemReference {
    id: string;
    type: 'song' | 'presentation';
    // Optional custom settings that can override the original item's settings
    customSettings?: Partial<PreviewSettings>;
  }
  
  // Service Interface
  interface Service {
    id: string;
    name: string;
    date: string;
    items: ServiceItemReference[];
  }
  
  // Type for the entire data structure
  type ServiceData = Service[];
  
export type {
    ServiceItem,
    ServiceData,
    SongItem,
    PresentationItem,
    ContentType,
    BackgroundSettings,
    PreviewSettings,
    BaseItem,
    Service,
    ServiceItemReference
}
