import { create } from 'zustand'

interface Slide {
  id: string
  content: string
}

interface PresentationState {
  slides: Slide[]
  currentSlideIndex: number
  addSlide: (slide: Slide) => void
  removeSlide: (id: string) => void
  setCurrentSlide: (index: number) => void
}

export const usePresentationStore = create<PresentationState>((set) => ({
  slides: [],
  currentSlideIndex: 0,
  addSlide: (slide) => set((state) => ({ 
    slides: [...state.slides, slide] 
  })),
  removeSlide: (id) => set((state) => ({ 
    slides: state.slides.filter(slide => slide.id !== id) 
  })),
  setCurrentSlide: (index) => set({ 
    currentSlideIndex: index 
  })
}))