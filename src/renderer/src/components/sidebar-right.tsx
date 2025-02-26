import * as React from "react"
import { Plus } from "lucide-react"
import { PreviewDisplay } from "./preview/preview-display"
import { TextAlignmentControl } from "./preview/text-alignment"
import { FontControl } from "./preview/font-control"
import { TextEffectControl } from "./preview/text-effect-control"
import { BackgroundControl } from "./preview/background-control"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    calendars: [
        {
            name: "My Calendars",
            items: ["Personal", "Work", "Family"],
        },
        {
            name: "Favorites",
            items: ["Holidays", "Birthdays"],
        },
        {
            name: "Other",
            items: ["Travel", "Reminders", "Deadlines"],
        },
    ],
}

export function SidebarRight({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
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
                                console.log('Going live...')
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white w-full justify-center"
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
