import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ContentType } from "@renderer/types/service"
import { useServiceStore } from "@renderer/store/useServiceStore"
import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card"
import { GripVertical, Copy, FileText, Image as ImageIcon, Video } from "lucide-react"

interface DraggableLyricProps {
    content: ContentType;
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

    const { setCurrentItem, activeItem } = useServiceStore()

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
            case 'content':
                return 'before:bg-amber-500'
            case 'image':
                return 'before:bg-emerald-500'
            case 'video':
                return 'before:bg-indigo-500'
            default:
                return 'before:bg-gray-500'
        }
    }

    const getIcon = () => {
        switch (content.type) {
            case 'content':
                return <FileText className="h-4 w-4 mr-2" />
            case 'image':
                return <ImageIcon className="h-4 w-4 mr-2" />
            case 'video':
                return <Video className="h-4 w-4 mr-2" />
            default:
                return null;
        }
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0
    }

    const handleClick = () => {
        // For presentation slides, we need to set currentSlide property
        if (content.type === 'content' || content.type === 'image' || content.type === 'video') {
            // Create a new object with the slide content and add currentSlide property
            const slideItem = {
                ...activeItem,  // Keep all properties of the active item
                currentSlide: content,  // Add the current slide
            };
            setCurrentItem(slideItem);
        } else {
            // For lyrics, continue with the existing behavior
            setCurrentItem(content);
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card
                className={`relative bg-card rounded-none before:absolute before:left-0 before:top-0 before:h-full before:w-[4px] ${getBorderColor()}`}
                onClick={handleClick}
            >
                <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
                    <CardTitle className="text-sm text-muted-primary uppercase tracking-wider flex items-center">
                        {getIcon()}
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
                        {content.type === 'verse' || content.type === 'chorus' || content.type === 'bridge' || 
                         content.type === 'intro' || content.type === 'outro' ? (
                            <p key={content.index} className="text-l text-primary leading-relaxed">
                                {'lines' in content ? content.lines : ''}
                            </p>
                        ) : content.type === 'content' ? (
                            <p key={content.index} className="text-l text-primary leading-relaxed">
                                {'content' in content ? content.content : ''}
                            </p>
                        ) : content.type === 'image' ? (
                            <div>
                                {'imageUrl' in content && content.imageUrl ? (
                                    <div className="mt-2 mb-2">
                                        <img 
                                            src={content.imageUrl} 
                                            alt="Slide Preview" 
                                            className="max-h-[100px] object-contain"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">No image</p>
                                )}
                                {'content' in content && content.content ? (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {content.content}
                                    </p>
                                ) : null}
                            </div>
                        ) : content.type === 'video' ? (
                            <div>
                                {'videoUrl' in content && content.videoUrl ? (
                                    <div className="mt-2 mb-2">
                                        <video 
                                            src={content.videoUrl}
                                            muted
                                            className="max-h-[100px] w-full object-contain"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {content.videoMuted ? 'Muted' : 'Sound On'} • {content.videoSpeed || 1}x speed
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">No video</p>
                                )}
                                {'content' in content && content.content ? (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {content.content}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}