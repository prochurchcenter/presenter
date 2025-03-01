import { create } from 'zustand'

import {ServiceItem} from "@renderer/types/service"
interface ServiceState {
  currentItem: any,
    currentSection: any,
    services: any[]
    items: ServiceItem[]
    item: ServiceItem
    settings: any
    setItem: (item: any) => void
    setServices: (services: any) => void
    setItems: (item: ServiceItem) => void
    setCurrentItem: (item: any) => void
    updatePreviewSettings: (settings: any) => void
    updateSettings: (settings: any) => void
    setSettings: (settings: any) => void
}

const defaultData = [
    {
        id: "1",
        name: "Sunday Morning Service",
        date: "2025-02-23",
      }
] 
const defaultitems: ServiceItem[] = [
    {
      id: "1",
      type: "song",
      title: "Amazing Grace",
      content: [
          { index:1, type: "verse", lines:"First verse line 1 First verse line 2", startTime: 10, endTime: 25 },
          {index:2,type: "chorus", lines: "Chorus line 1 Chorus line 2 Chorus line 3", startTime: 25, endTime: 40 },
          { index:3,type: "verse", lines: "Second verse line 1 Second verse line 2", startTime: 40, endTime: 55 },
          {index:4, type: "bridge", lines: "Bridge line 1 Bridge line 2", startTime: 55, endTime: 70 },
          { index:5,type: "chorus", lines: "Chorus line 1 Chorus line 2 Chorus line 3", startTime: 70, endTime: 85 },
          ],
     
      previewSettings: {
        fontSize: 24,
        fontPosition: "center",
        fontFamily: "Arial",
        textEffect: "none",
        textColor: "#ffffff",
        highlightColor: "rgba(255,255,0,0.3)",
        videoSpeed: 1,
        videoMuted: false,
        background: {
          type: "video",
          url: "blob:file:///918ce711-c32a-4130-ad8e-d8bde940051b",
        },
        textAlign: "center",
      },
      notes: "This is a test song for development purposes.",
      duration: 95,
    },
    {
      id: "2",
      type: "presentation",
      title: "Youth Group Announcements",

      content: [
        { type: "content", content: "Welcome to Youth Night!" },
        { type: "content", content: "Upcoming Events:" },
        { type: "content", content: "Summer camp registration is now open" },
        { type: "image", imageUrl: "", content: "Summer camp" },
      ],
      previewSettings: {
        fontSize: 24,
        fontPosition: "center",
        fontFamily: "Arial",
        textEffect: "none",
        textColor: "#ffffff",
        highlightColor: "rgba(255,255,0,0.3)",
        videoSpeed: 1,
        videoMuted: false,
        background: {
          type: 'video',
          url: "blob:file:///918ce711-c32a-4130-ad8e-d8bde940051b",
        },
        textAlign: "center",
      },
      notes: "This is a test song for development purposes.",
      duration: 95,
    }
  ]

export const useServiceStore = create<ServiceState>((set) => ({
    services: defaultData,
    currentItem: defaultitems[0],
    currentSection: defaultitems[0]?.content[0] || {},
    items: defaultitems,
    item: defaultitems[0] || {},
    settings: defaultitems[0].previewSettings,
    setSettings: (settings: any) => {
        set((state) => ({ 
            settings,
            item: { ...state.item, previewSettings: settings }
        }))
        window.electron?.ipcRenderer.send('settings-update', settings)
    },
    setServices: (services: any) => set({ services }),
    setItems: (item: any) => set({ items: [item] }),
    setItem: (item: any) => set({ item }),
    setNote: (note: any) => set((state) => ({ 
        item: { ...state.item, note }
    })),  
    setCurrentItem: (item: any) => {
        set({ currentItem: item })
        window.electron?.ipcRenderer.send('update-presenter', {
          ...item,
          timestamp: performance.now()
        })
      },
    updatePreviewSettings: (settings: any) => set((state) => {
          // If there's a video background, ensure proper URL format
          if (settings.background?.type === 'video' && settings.background.url?.startsWith('blob:')) {
            settings.background.url = settings.background.url.split('blob:file://')[1];
          }
          return {
            item: { ...state.item, previewSettings: { ...state.item.previewSettings, ...settings } }
          }
        }),
    updateSettings: (settings: any) => set((state) => ({
        item: { ...state.item, ...settings }
    })),
}))