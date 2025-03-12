import { useEffect } from "react"
import { ServiceItem } from "@renderer/types/service"
import { DraggableLyric } from "@renderer/components/draggable-lyric"
import { useState } from "react"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { FileText, Music, Plus } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { useNavigate } from "react-router-dom"

export function LyricsItem({ item }: { item: ServiceItem }) {
    const [lyrics, setLyrics] = useState<any[]>([])
    const navigate = useNavigate()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (item?.content && Array.isArray(item.content) && item.content.length > 0) {
            setLyrics(item.content)
        } else {
            setLyrics([])
        }
    }, [item])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || !active) return

        if (active.id !== over.id) {
            setLyrics((items) => {
                const oldIndex = items.findIndex((item: any) =>
                    typeof item.index === 'number' ? item.index === active.id : false
                )
                const newIndex = items.findIndex((item: any) =>
                    typeof item.index === 'number' ? item.index === over.id : false
                )

                if (oldIndex === -1 || newIndex === -1) return items

                const reorderedItems = arrayMove(items as any[], oldIndex, newIndex)
                // Update indices after reordering
                return reorderedItems.map((item: any, idx: number) => {
                    if (typeof item.index === 'number') {
                        return {
                            ...item,
                            index: idx
                        }
                    }
                    return item
                })
            })
        }
    }

    // Handle empty item or item without content
    if (!item || !item.id || item.id === '') {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No item selected</p>
            </div>
        )
    }

    // Handle empty lyrics list
    if (!lyrics.length) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">{item.title || 'Untitled Item'}</h2>
                {item.type === 'song' ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                        <Music className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center mb-4">This song has no lyrics</p>
                        <Button onClick={() => navigate('/collection')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Edit in Collection
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center mb-4">This presentation has no slides</p>
                        <Button onClick={() => navigate('/collection')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Edit in Collection
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    // Normal render with content
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{item.title || 'Untitled Item'}</h2>
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={lyrics.map((_, index) => index)}
                    strategy={verticalListSortingStrategy}
                >
                    {lyrics.map((contentItem, index) => (
                        <DraggableLyric
                            key={index}
                            content={contentItem}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    )
}