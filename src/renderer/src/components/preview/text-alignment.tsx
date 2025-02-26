import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import { useServiceStore } from "@renderer/store/useServiceStore"
import { cn } from "@/lib/utils"

export const TextAlignmentControl = () => {
    const {
        item,
        updatePreviewSettings
    } = useServiceStore()

    // Add null check for item and previewSettings
    if (!item || !item.previewSettings) {
        return null;
    }

    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground mb-1">Text Alignment</Label>
            <div className="grid grid-cols-4 gap-1">
                {[
                    { value: "left", icon: AlignLeft },
                    { value: "center", icon: AlignCenter },
                    { value: "right", icon: AlignRight },
                    { value: "justify", icon: AlignJustify },
                ].map(({ value, icon: Icon }) => (
                    <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        className={cn("h-6 w-6 p-0",
                            (item.previewSettings?.textAlign || 'center') === value &&
                            "bg-accent text-accent-foreground"
                        )}
                        onClick={() => updatePreviewSettings({ textAlign: value as "left" | "center" | "right" | "justify" })}
                    >
                        <Icon className="h-3 w-3" />
                    </Button>
                ))}
            </div>
        </div>
    )
}

