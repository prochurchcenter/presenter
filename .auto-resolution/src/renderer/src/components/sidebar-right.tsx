import * as React from "react"
import { PreviewDisplay } from "./preview/preview-display"
import { TextAlignmentControl } from "./preview/text-alignment"
import { FontControl } from "./preview/font-control"
import { TextEffectControl } from "./preview/text-effect-control"
import { BackgroundControl } from "./preview/background-control"
import { useServiceStore } from "@renderer/store/useServiceStore"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SidebarRight({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const { setSettings, activeItem } = useServiceStore()
    const [newSettings, setNewSettings] = React.useState(activeItem?.previewSettings)


    React.useEffect(() => {
        if (!activeItem || !activeItem.previewSettings) {
            return
        }
        setNewSettings(activeItem.previewSettings)
    }, [activeItem])



    return (
        <Sidebar
            collapsible="none"
            className="sticky hidden lg:flex top-0 h-svh border-l"
            {...props}
        >
            <SidebarHeader className="h-ful border-b border-sidebar-border">
                <PreviewDisplay />
            </SidebarHeader>
            <SidebarContent className="p-4">
                <TextAlignmentControl />
                <FontControl />
                <TextEffectControl />
                <BackgroundControl />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => {
                                // Add your go live logic here
                                if (newSettings) {
                                    setSettings(newSettings)
                                }
                            }}
                            className="bg-green-500 hover:bg-red-600 text-white w-full justify-center"
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                <span>Go Live</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
