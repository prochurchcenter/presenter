import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, FileText, Music } from 'lucide-react';
import { Button } from "@renderer/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@renderer/components/ui/collapsible";
import { cn } from "@renderer/lib/utils";
import { ServiceItem } from "@renderer/types/service";
import { useServiceStore } from "@renderer/store/useServiceStore"

interface CollapsableItemsProps {
    service: ServiceItem[];
    onAddItem?: () => void;
    onSelectItem?: (item: ServiceItem) => void;
    className?: string;
}

export function CollapsableItems({ service, onAddItem, className }: CollapsableItemsProps) {
    const [isOpen, setIsOpen] = useState(true);
    const { setItem } = useServiceStore();

    const handleItemClick = (item: ServiceItem) => {
        setItem(item);
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

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={onAddItem}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>

                {/* Collapsible content */}
                <CollapsibleContent>
                    <div className="ml-4 space-y-1">
                        {service.map((item) => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "w-full justify-start pl-6 text-primary",
                                )}
                                onClick={() => handleItemClick(item)}
                            >
                                {item.type === 'song' ? (
                                    <Music className="h-5 w-5 mr-2" />
                                ) : (
                                    <FileText className="h-5 w-5 mr-2" />
                                )}
                                {item.title}
                            </Button>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}