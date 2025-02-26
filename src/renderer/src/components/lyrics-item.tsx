import { useEffect } from "react"
import { ServiceItem } from "@renderer/types/service"
import { DraggableLyric } from "@renderer/components/draggable-lyric"
import { useState } from "react"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"

export function LyricsItem({ item }: { item: ServiceItem }) {
    const [lyrics, setLyrics] = useState(item?.content || [])

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
        if (item?.content) {
            setLyrics(item.content)
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

                const reorderedItems = arrayMove(items as { index: number; type: "verse" | "chorus" | "bridge" | "outro"; lines: string[]; startTime: number; endTime: number; }[], oldIndex, newIndex)
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

    if (!item || !lyrics.length) {
        return null
    }

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">{item.title}</h2>
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