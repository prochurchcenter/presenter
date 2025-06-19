import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, FileText, Music, Search, GripVertical } from 'lucide-react';
import { Button } from "@renderer/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@renderer/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@renderer/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@renderer/components/ui/tabs";
import { Input } from "@renderer/components/ui/input";
import { cn } from "@renderer/lib/utils";
import { Service, ServiceItem, ServiceItemReference } from "@renderer/types/service";
import { useServiceStore } from "@renderer/store/useServiceStore";
import { useDatabase } from "@renderer/hooks/use-database";
import { useToast } from "@renderer/components/ui/use-toast";
import { 
    DndContext, 
    DragEndEvent,
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    closestCenter
} from "@dnd-kit/core";
import { 
    SortableContext, 
    useSortable,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CollapsableItemsProps {
    service?: ServiceItem[];
    onSelectItem?: (item: ServiceItem) => void;
    className?: string;
}

// Component for adding items to a service
function AddItemToServiceDialog() {
    const [activeTab, setActiveTab] = useState<'songs' | 'presentations'>('songs');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [collections, setCollections] = useState<{songs: ServiceItem[], presentations: ServiceItem[]}>({
        songs: [],
        presentations: []
    });
    
    const { currentService, setCurrentService } = useServiceStore();
    const { getAllItems, saveItem } = useDatabase();
    const { toast } = useToast();
    
    // Load collections on mount
    useEffect(() => {
        async function loadCollections() {
            setIsLoading(true);
            try {
                const [songs, presentations] = await Promise.all([
                    getAllItems('song'),
                    getAllItems('presentation')
                ]);
                
                setCollections({
                    songs: songs || [],
                    presentations: presentations || []
                });
            } catch (error) {
                console.error('Failed to load collections:', error);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadCollections();
    }, [getAllItems]);
    
    // Filter items based on search query
    const filteredItems = (activeTab === 'songs' ? collections.songs : collections.presentations)
        .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Handle adding an item to the current service
    const handleAddItem = async (item: ServiceItem) => {
        if (!currentService) {
            toast({
                title: "Error",
                description: "No service selected to add to.",
                variant: "destructive"
            });
            return;
        }
        
        try {
            // Create item reference instead of copying the entire item
            const itemRef: ServiceItemReference = {
                id: item.id,
                type: item.type as 'song' | 'presentation'
            };
            
            // Create updated service with new item reference
            const updatedService: Service = {
                ...currentService,
                items: [...currentService.items, itemRef]
            };
            
            // Save updated service to database
            await saveItem({
                type: 'service',
                ...updatedService
            });
            
            // Update current service in state
            await setCurrentService(updatedService);
            
            // Show success message
            toast({
                title: "Success",
                description: `${item.title} added to service.`
            });
        } catch (error) {
            console.error('Error adding item to service:', error);
            toast({
                title: "Error",
                description: "Failed to add item to service.",
                variant: "destructive"
            });
        }
    };
    
    return (
        <div className="py-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'songs' | 'presentations')}>
                <TabsList className="w-full">
                    <TabsTrigger value="songs" className="flex-1">Songs</TabsTrigger>
                    <TabsTrigger value="presentations" className="flex-1">Presentations</TabsTrigger>
                </TabsList>
                
                <div className="mt-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                
                <div className="h-[300px] overflow-y-auto border rounded-md p-2 mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="space-y-1">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                                    onClick={() => handleAddItem(item)}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.type === 'song' ? (
                                            <Music className="h-4 w-4 text-blue-500" />
                                        ) : (
                                            <FileText className="h-4 w-4 text-amber-500" />
                                        )}
                                        <span>{item.title}</span>
                                    </div>
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            {searchQuery ? 'No matching items found' : 'No items found'}
                        </div>
                    )}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                    {!currentService ? (
                        <p className="text-destructive">No service selected to add items to.</p>
                    ) : (
                        <p>Adding to: <span className="font-medium">{currentService.name}</span></p>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

interface DraggableItemProps {
    item: ServiceItem;
    index: number;
    onClick: (item: ServiceItem) => void;
}

function DraggableServiceItem({ item, index, onClick }: DraggableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: index,
        data: {
            item,
            index,
        }
    });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 0,
    };
    
    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`flex items-center ${isDragging ? 'bg-muted' : ''}`}
        >
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "w-full justify-start pl-1 text-primary",
                    "group flex items-center hover:bg-muted"
                )}
                onClick={() => onClick(item)}
            >
                <div 
                    {...attributes} 
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 mr-1 opacity-30 hover:opacity-100 touch-none"
                >
                    <GripVertical className="h-4 w-4" />
                </div>
                
                {item.type === 'song' ? (
                    <Music className="h-5 w-5 mr-2" />
                ) : (
                    <FileText className="h-5 w-5 mr-2" />
                )}
                <span className="truncate">{item.title}</span>
            </Button>
        </div>
    );
}

export function CollapsableItems({ className }: CollapsableItemsProps) {
    const [isOpen, setIsOpen] = useState(true);
    const { 
        setActiveItem, 
        currentService, 
        setCurrentService, 
        resolvedItems 
    } = useServiceStore();
    const { saveItem } = useDatabase();
    const { toast } = useToast();
    
    // Create dnd sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleItemClick = (item: ServiceItem) => {
        setActiveItem(item);
    };
    
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id || !currentService) return;
        
        // Get current order of items
        const oldIndex = active.id as number;
        const newIndex = over.id as number;
        
        // Reorder items (these are references)
        const itemRefs = [...currentService.items];
        const [movedItemRef] = itemRefs.splice(oldIndex, 1);
        itemRefs.splice(newIndex, 0, movedItemRef);
        
        // Create updated service
        const updatedService: Service = {
            ...currentService,
            items: itemRefs
        };
        
        try {
            // Save to database
            await saveItem({
                type: 'service',
                ...updatedService
            });
            
            // Update current service in store
            await setCurrentService(updatedService);
            
            // Show success toast
            toast({
                title: "Order updated",
                description: "Item order has been updated"
            });
        } catch (error) {
            console.error('Failed to update item order:', error);
            toast({
                title: "Error",
                description: "Failed to update item order",
                variant: "destructive"
            });
        }
    };

    return (
        <div className={cn("flex flex-col w-full", className)}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                {/* Header with toggle and add button */}
                <div className="flex items-center justify-between py-2 px-4">
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center cursor-pointer hover:text-primary">
                            {isOpen ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
                            <Music className="h-5 w-5 mr-2" />
                            <h2 className="text-m font-semibold">Songs & Presentations</h2>
                        </div>
                    </CollapsibleTrigger>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Add Item to Service</DialogTitle>
                                <DialogDescription>
                                    Select a song or presentation to add to the current service.
                                </DialogDescription>
                            </DialogHeader>
                            <AddItemToServiceDialog />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Collapsible content */}
                <CollapsibleContent>
                    <div className="ml-4 space-y-1 pt-1">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={resolvedItems.map((_, index) => index)}
                                strategy={verticalListSortingStrategy}
                            >
                                {resolvedItems.map((item, index) => (
                                    <DraggableServiceItem
                                        key={`${item.id}-${index}`}
                                        item={item}
                                        index={index}
                                        onClick={handleItemClick}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        
                        {resolvedItems.length === 0 && (
                            <div className="text-center p-4 text-sm text-muted-foreground">
                                No items in this service. Click the + button to add items.
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}