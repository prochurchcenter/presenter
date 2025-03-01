import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ContentType } from "@renderer/types/service"
import { useServiceStore } from "@renderer/store/useServiceStore"
import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card"
import { GripVertical, Copy } from "lucide-react"

interface DraggableLyricProps {
    content: ContentType
}

export function DraggableLyric({ content }: DraggableLyricProps) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: content.index,
        data: {
            index: content.index,
            type: content.type
        }
    })

    const { setCurrentItem } = useServiceStore()


    const getBorderColor = () => {
        switch (content.type) {
            case 'intro':
                return 'before:bg-red-500'
            case 'verse':
                return 'before:bg-blue-500'
            case 'chorus':
                return 'before:bg-green-500'
            case 'bridge':
                return 'before:bg-purple-500'
            default:
                return 'before:bg-gray-500'
        }
    }

    const handleOnSelect = () => {
        setCurrentItem(content)

    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card
                className={`relative bg-card rounded-none before:absolute before:left-0 before:top-0 before:h-full before:w-[4px] ${getBorderColor()}`}
                onClick={() => setCurrentItem(content)}
            >
                <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
                    <CardTitle className="text-sm text-muted-primary uppercase tracking-wider">
                        {content.type}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <button className="hover:text-primary">
                            <Copy className="h-5 w-5 text-muted-foreground" />
                        </button>
                        <button
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing hover:text-primary touch-none"
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {'lines' in content ?
                            <p key={content.index} className="text-l text-primary leading-relaxed">
                                {content.lines}
                            </p>
                            : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}