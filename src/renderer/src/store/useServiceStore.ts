import { create } from 'zustand'

import {ServiceItem,ServiceData} from "@renderer/types/service"
interface ServiceState {
    services: any[]
    items: ServiceItem[]
    item: ServiceItem
    setItem: (item: any) => void
    setServices: (services: any) => void
    setItems: (item: any) => void
}

const defaultData = [
    {
        id: "1",
        name: "Sunday Morning Service Sunday Morning ServiceSunday Morning Service",
        date: "2025-02-23",
      }
] 
const defaultitems: ServiceItem[] = [
    {
      id: "1",
      type: "song",
      title: "Amazing Grace",
      content: [
          { index:1, type: "verse", lines: ["First verse line 1", "First verse line 2"], startTime: 10, endTime: 25 },
          {index:2,type: "chorus", lines: ["Chorus line 1", "Chorus line 2", "Chorus line 3"], startTime: 25, endTime: 40 },
          { index:3,type: "verse", lines: ["Second verse line 1", "Second verse line 2"], startTime: 40, endTime: 55 },
          {index:4, type: "bridge", lines: ["Bridge line 1", "Bridge line 2"], startTime: 55, endTime: 70 },
          { index:5,type: "chorus", lines: ["Chorus line 1", "Chorus line 2", "Chorus line 3"], startTime: 70, endTime: 85 },
          { index:5,type: "outro", lines: ["Outro line", "Fading out"], startTime: 85, endTime: 95 },
      ],
      fontSize: 24,
      fontPosition: "center",
      previewSettings: {
        fontFamily: "Arial",
        textEffect: "none",
        textColor: "#ffffff",
        highlightColor: "rgba(255,255,0,0.3)",
        videoSpeed: 1,
        videoMuted: false,
        background: {
          type: null,
          url: null,
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
      fontSize: 24,
      fontPosition: "center",
      content: [
        { type: "content", content: "Welcome to Youth Night!" },
        { type: "content", content: "Upcoming Events:" },
        { type: "content", content: "Summer camp registration is now open" },
        { type: "image", imageUrl: "/placeholder.svg?height=400&width=600", content: "Summer camp" },
      ],
      previewSettings: {
        fontFamily: "Arial",
        textEffect: "none",
        textColor: "#ffffff",
        highlightColor: "rgba(255,255,0,0.3)",
        videoSpeed: 1,
        videoMuted: false,
        background: {
          type: null,
          url: null,
        },
        textAlign: "center",
      },
      notes: "This is a test song for development purposes.",
      duration: 95,
    },
  ]

export const useServiceStore = create<ServiceState>((set) => ({
    services: defaultData,
    items: defaultitems,
    item: {} as ServiceItem,
    setServices: (services: any) => set({ services }),
    setItems: (item: any) => set({ items: [item] }),
    setItem: (item: any) => set({ item }),
}))