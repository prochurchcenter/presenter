import { useServiceStore } from "@renderer/store/useServiceStore"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { LyricsItem } from "@renderer/components/lyrics-item"
import { useEffect, useState } from "react"
import { Presentation, ListMusic, ArrowRight } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { useNavigate } from "react-router-dom"

export function Home() {
    const { activeItem, setSettings, loadActiveService, currentService, services } = useServiceStore()
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            try {
                // Try to load active service
                const loaded = await loadActiveService()
                // If successful and we have settings, apply them
                if (loaded && activeItem?.previewSettings) {
                    setSettings(activeItem.previewSettings)
                }
            } catch (error) {
                console.error('Error loading service:', error)
            } finally {
                setIsLoading(false)
            }
        }
        
        init()
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )
    
    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your service...</p>
                </div>
            </div>
        )
    }
    
    // Show empty state when no service is selected or there are no services
    if (!currentService || services.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-primary/10 p-6">
                            <Presentation className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No Active Service</h2>
                    <p className="text-muted-foreground mb-6">
                        {services.length === 0 
                            ? "You haven't created any services yet. Create your first service to get started."
                            : "Please select an existing service from the dropdown in the sidebar, or create a new one."}
                    </p>
                    <div className="flex flex-col gap-2 w-full">
                        <Button 
                            className="w-full"
                            onClick={() => navigate('/setlist')}
                        >
                            <ListMusic className="mr-2 h-4 w-4" />
                            {services.length === 0 ? 'Create your first service' : 'Manage services'}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
    
    // If we have content items, show them
    if (activeItem && activeItem.id && typeof activeItem.id === 'string') {
        return (
            <div className="p-4">
                <DndContext
                    key={activeItem.id}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                >
                    <LyricsItem item={activeItem} />
                </DndContext>
            </div>
        )
    }
    
    // Fallback for any other state
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <p className="text-muted-foreground">No content to display</p>
                <Button 
                    variant="link" 
                    onClick={() => navigate('/setlist')} 
                    className="mt-2"
                >
                    Go to Setlist Management
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}