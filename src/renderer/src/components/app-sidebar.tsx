'use client'
import * as React from 'react'
import { Command, Presentation, Settings, ListMusic, FolderOpen } from 'lucide-react'
import { NavUser } from '@/components/nav-user'
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { CollapsableItems } from '@/components/collapsable-items'
import { useNavigate } from 'react-router-dom'
import { useServiceStore } from '@renderer/store/useServiceStore'
import { NotesSection } from './notes-section'

// This is sample data
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Presenter',
      url: '/',
      icon: Presentation,
      isActive: true
    },
    {
      title: 'Setlist',
      url: '/setlist',
      icon: ListMusic,
      isActive: false
    },
    {
      title: 'Collection',
      url: '/collection',
      icon: FolderOpen,
      isActive: false
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      isActive: false
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    services,
    resolvedItems: serviceItems,
    currentService,
    setCurrentService,
    loadActiveService
  } = useServiceStore()
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const [isLoading, setIsLoading] = React.useState(true)
  const { setOpen } = useSidebar()

  // Load active service on startup
  React.useEffect(() => {
    async function init() {
      setIsLoading(true)
      try {
        await loadActiveService()
      } catch (error) {
        console.error('Failed to load active service:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [loadActiveService])

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar collapsible="none" className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Pro Church Center</span>
                    <span className="truncate text-xs">Presenter</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        if (item.title === 'Presenter') {
                          navigate('/')
                        } else if (item.title === 'Collection') {
                          navigate('/collection')
                        } else if (item.title === 'Setlist') {
                          navigate('/setlist')
                        } else if (item.title === 'Settings') {
                          navigate('/settings')
                        }
                        setOpen(true)
                      }}
                      isActive={activeItem.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">{activeItem.title}</div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Setlist</span>
            </Label>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              Loading services...
            </div>
          ) : services.length > 0 ? (
            <div className="mt-2">
              <select
                className="w-full p-2 rounded-md border border-input bg-background text-sm"
                value={currentService?.id || ''}
                onChange={(e) => {
                  const selectedService = services.find((svc) => svc.id === e.target.value)
                  if (selectedService) {
                    setCurrentService(selectedService)
                  }
                }}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.date}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              No services found
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <CollapsableItems service={serviceItems} />
              <NotesSection
                notes={serviceItems?.[0]?.notes || ''}
                onNotesChange={(newNotes) => {
                  // Handle notes update through your store
                  console.log('Notes updated:', newNotes)
                }}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
