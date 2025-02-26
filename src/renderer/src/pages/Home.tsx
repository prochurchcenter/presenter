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


export function Home() {
    const { item } = useServiceStore()


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    return (
        <div className="p-4">
            <DndContext
                key={item.id}
                sensors={sensors}
                collisionDetection={closestCenter}
            >
                <LyricsItem item={item} />
            </DndContext>
        </div>
    )
}