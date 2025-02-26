// Types for Service and Presentation Items

// Background Settings
interface BackgroundSettings {
    type: string | null;
    url: string | null;
  }
  
  // Preview Settings
  interface PreviewSettings {
    fontFamily: string;
    textEffect: string;
    textColor: string;
    highlightColor: string;
    videoSpeed: number;
    videoMuted: boolean;
    background: BackgroundSettings;
    textAlign: string;
  }
  
  // Content Types for Presentations and Songs
  type ContentType = 
    | { index:number, type: 'verse' | 'chorus' | 'bridge' | 'outro' |'intro', lines: string[], startTime: number, endTime: number }
    | { index:number,type: 'content', content: string }
    | {index:number,type: 'image', imageUrl: string, content: string };
  
  // Base Item Interface
  interface BaseItem {
    id: string;
    type: string;
    title: string;
    fontSize: number;
    fontPosition: string;
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
      lines: string[];
      startTime: number;
      endTime: number;
    }>;
  }
  
  // Presentation Item Interface
  interface PresentationItem extends BaseItem {
    type: 'presentation';
    content: Array<
      { type: 'content', content: string } | 
      { type: 'image', imageUrl: string, content: string }
    >;
  }
  
  // Service Item Type
  type ServiceItem = SongItem | PresentationItem;
  
  // Service Interface
  interface Service {
    id: string;
    name: string;
    date: string;
    items: ServiceItem[];
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
    Service
}
