// Enhanced Presentation Types

// Element styling
export interface ElementStyling {
  fontFamily?: string;
  textEffect?: 'none' | 'shadow' | 'highlight';
  textColor?: string;
  fontSize?: number;
  fontPosition?: 'top' | 'center' | 'bottom';
  highlightColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  opacity?: number;
}

// Background Settings for individual slides
export interface SlideBackground {
  type: 'color' | 'image' | 'video' | 'none';
  url?: string;
  color?: string;
  opacity?: number;
  fit?: 'cover' | 'contain' | 'fill';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  videoSpeed?: number;
  videoMuted?: boolean;
  blur?: number;
}

// Text Element for slide content
export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  styling: ElementStyling;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Image Element
export interface ImageElement {
  id: string;
  type: 'image';
  url: string;
  alt?: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Shape Element
export interface ShapeElement {
  id: string;
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Element type for slide
export type SlideElement = TextElement | ImageElement | ShapeElement;

// Slide layout template
export interface SlideLayout {
  id: string;
  name: string;
  elements: SlideElement[];
}

// Enhanced Slide interface
export interface EnhancedSlide {
  id: string;
  type: 'content' | 'image' | 'video';
  background: SlideBackground;
  elements: SlideElement[];
  layout?: string; // ID reference to a layout template
  transition?: {
    type: 'none' | 'fade' | 'slide' | 'zoom';
    duration: number;
  };
}

// Enhanced Presentation Item
export interface EnhancedPresentation {
  id: string;
  title: string;
  slides: EnhancedSlide[];
  defaultBackground?: SlideBackground;
  defaultElementStyling?: ElementStyling;
  layouts?: SlideLayout[]; // Available layout templates
}

// Pre-defined layouts
export const DEFAULT_LAYOUTS: SlideLayout[] = [
  {
    id: 'title-content',
    name: 'Title and Content',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: 'Title',
        styling: {
          fontSize: 48,
          fontWeight: 'bold',
          textAlign: 'center',
          fontPosition: 'top',
          textColor: '#ffffff'
        }
      },
      {
        id: 'content',
        type: 'text',
        content: 'Content',
        styling: {
          fontSize: 28,
          textAlign: 'center',
          fontPosition: 'center',
          textColor: '#ffffff'
        }
      }
    ]
  },
  {
    id: 'title-only',
    name: 'Title Only',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: 'Title',
        styling: {
          fontSize: 64,
          fontWeight: 'bold',
          textAlign: 'center',
          fontPosition: 'center',
          textColor: '#ffffff'
        }
      }
    ]
  },
  {
    id: 'two-columns',
    name: 'Two Columns',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: 'Title',
        styling: {
          fontSize: 42,
          fontWeight: 'bold',
          textAlign: 'center',
          fontPosition: 'top',
          textColor: '#ffffff'
        }
      },
      {
        id: 'left-column',
        type: 'text',
        content: 'Left Column',
        styling: {
          fontSize: 28,
          textAlign: 'left',
          fontPosition: 'center',
          textColor: '#ffffff'
        },
        position: {
          x: 0,
          y: 0.2,
          width: 0.48,
          height: 0.7
        }
      },
      {
        id: 'right-column',
        type: 'text',
        content: 'Right Column',
        styling: {
          fontSize: 28,
          textAlign: 'left',
          fontPosition: 'center',
          textColor: '#ffffff'
        },
        position: {
          x: 0.52,
          y: 0.2,
          width: 0.48,
          height: 0.7
        }
      }
    ]
  },
  {
    id: 'image-content',
    name: 'Image with Content',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: 'Title',
        styling: {
          fontSize: 42,
          fontWeight: 'bold',
          textAlign: 'center',
          fontPosition: 'top',
          textColor: '#ffffff'
        }
      },
      {
        id: 'image',
        type: 'image',
        url: '',
        position: {
          x: 0.05,
          y: 0.2,
          width: 0.4,
          height: 0.7
        }
      },
      {
        id: 'content',
        type: 'text',
        content: 'Content',
        styling: {
          fontSize: 28,
          textAlign: 'left',
          fontPosition: 'center',
          textColor: '#ffffff'
        },
        position: {
          x: 0.5,
          y: 0.2,
          width: 0.45,
          height: 0.7
        }
      }
    ]
  },
  {
    id: 'quote',
    name: 'Quote',
    elements: [
      {
        id: 'quote',
        type: 'text',
        content: '"Quote goes here"',
        styling: {
          fontSize: 36,
          fontStyle: 'italic',
          textAlign: 'center',
          fontPosition: 'center',
          textColor: '#ffffff',
          textEffect: 'shadow'
        }
      },
      {
        id: 'attribution',
        type: 'text',
        content: '— Attribution',
        styling: {
          fontSize: 24,
          textAlign: 'right',
          fontPosition: 'bottom',
          textColor: '#ffffff'
        }
      }
    ]
  }
];

// Helper function to create a new slide from a layout
export function createSlideFromLayout(layout: SlideLayout, background?: SlideBackground): EnhancedSlide {
  return {
    id: `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: 'content',
    background: background || {
      type: 'color',
      color: '#000000'
    },
    elements: layout.elements.map(element => ({
      ...element,
      id: `${element.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    })),
    layout: layout.id
  };
}

// Helper function to convert from old presentation format to new
export function convertOldPresentation(
  oldContent: Array<any>,
  oldPreviewSettings?: any
): EnhancedPresentation {
  const defaultBackground: SlideBackground = {
    type: 'none'
  };
  
  if (oldPreviewSettings?.background) {
    defaultBackground.type = oldPreviewSettings.background.type === 'image' ? 'image' : 
                            oldPreviewSettings.background.type === 'video' ? 'video' : 'color';
    defaultBackground.url = oldPreviewSettings.background.url;
  }
  
  const defaultElementStyling: ElementStyling = {
    fontFamily: oldPreviewSettings?.fontFamily || 'Arial',
    textEffect: oldPreviewSettings?.textEffect || 'none',
    textColor: oldPreviewSettings?.textColor || '#ffffff',
    fontSize: oldPreviewSettings?.fontSize || 24,
    fontPosition: oldPreviewSettings?.fontPosition || 'center',
    highlightColor: oldPreviewSettings?.highlightColor,
    textAlign: oldPreviewSettings?.textAlign || 'center'
  };
  
  const slides: EnhancedSlide[] = oldContent.map((slide, index) => {
    const slideId = `slide-${Date.now()}-${index}`;
    let newSlide: EnhancedSlide;
    
    if (slide.type === 'content') {
      newSlide = {
        id: slideId,
        type: 'content',
        background: { ...defaultBackground },
        elements: [{
          id: `text-${Date.now()}-${index}`,
          type: 'text',
          content: slide.content || '',
          styling: { ...defaultElementStyling }
        }]
      };
    } else if (slide.type === 'image') {
      newSlide = {
        id: slideId,
        type: 'image',
        background: { 
          type: 'image',
          url: slide.imageUrl || ''
        },
        elements: []
      };
      
      if (slide.content) {
        newSlide.elements.push({
          id: `caption-${Date.now()}-${index}`,
          type: 'text',
          content: slide.content,
          styling: { 
            ...defaultElementStyling,
            fontPosition: 'bottom'
          }
        });
      }
    } else if (slide.type === 'video') {
      newSlide = {
        id: slideId,
        type: 'video',
        background: {
          type: 'video',
          url: slide.videoUrl || '',
          videoSpeed: slide.videoSpeed,
          videoMuted: slide.videoMuted
        },
        elements: []
      };
      
      if (slide.content) {
        newSlide.elements.push({
          id: `caption-${Date.now()}-${index}`,
          type: 'text',
          content: slide.content,
          styling: {
            ...defaultElementStyling,
            fontPosition: 'bottom'
          }
        });
      }
    } else {
      // Default to empty content slide
      newSlide = {
        id: slideId,
        type: 'content',
        background: { ...defaultBackground },
        elements: [{
          id: `text-${Date.now()}-${index}`,
          type: 'text',
          content: '',
          styling: { ...defaultElementStyling }
        }]
      };
    }
    
    return newSlide;
  });
  
  return {
    id: `presentation-${Date.now()}`,
    title: 'Presentation',
    slides,
    defaultBackground,
    defaultElementStyling,
    layouts: DEFAULT_LAYOUTS
  };
}