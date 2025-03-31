
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useServiceStore } from "@renderer/store/useServiceStore"


export const TextEffectControl = () => {
    const {
        activeItem,
        updatePreviewSettings,
    } = useServiceStore()

    if (!activeItem?.previewSettings) {
        return null;
    }

    const handleEffectChange = (value: "none" | "shadow" | "highlight") => {
        const newSettings = {
            ...activeItem.previewSettings,
            textEffect: value,
            highlightColor: value === "highlight" ? (activeItem.previewSettings.highlightColor || "rgba(255,255,0,0.3)") : undefined
        };
        updatePreviewSettings(newSettings);
        // setSettings(newSettings);
    }

    const handleColorChange = (color: string) => {
        const newSettings = {
            ...activeItem.previewSettings,
            highlightColor: color
        };
        updatePreviewSettings(newSettings);
        // setSettings(newSettings);
    }

    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground mb-1">Text Effect</Label>
            <div className="flex items-center gap-2">
                <Select
                    value={activeItem.previewSettings.textEffect || "none"}
                    onValueChange={handleEffectChange}
                >
                    <SelectTrigger className="h-7 text-xs flex-grow">
                        <SelectValue placeholder="Select effect" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="shadow">Shadow</SelectItem>
                        <SelectItem value="highlight">Highlight</SelectItem>
                    </SelectContent>
                </Select>
                {activeItem.previewSettings.textEffect === "highlight" && (
                    <Input
                        type="color"
                        value={activeItem.previewSettings.highlightColor || "#FFFF00"}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-7 w-14 p-0 cursor-pointer"
                    />
                )}
            </div>
        </div>
    )
}

