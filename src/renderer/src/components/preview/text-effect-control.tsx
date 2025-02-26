
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useServiceStore } from "@renderer/store/useServiceStore"


export const TextEffectControl = () => {
    const {
        item,
        updatePreviewSettings,
    } = useServiceStore()

    if (!item || !item.previewSettings) {
        return null;
    }

    return (
        <>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground mb-1">Text Effect</Label>
                <Select
                    value={item.previewSettings.textEffect}
                    onValueChange={(value: "none" | "shadow" | "highlight") => updatePreviewSettings({ textEffect: value })}
                >
                    <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select effect" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="shadow">Shadow</SelectItem>
                        <SelectItem value="highlight">Highlight</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground mb-1">Text Color</Label>
                <div className="flex items-center space-x-1">
                    <Input
                        type="color"
                        value={item.previewSettings.textColor}
                        onChange={(e) => updatePreviewSettings({ textColor: e.target.value })}
                        className="w-6 h-6 p-0"
                    />
                    <Input
                        type="text"
                        value={item.previewSettings.textColor}
                        onChange={(e) => updatePreviewSettings({ textColor: e.target.value })}
                        className="flex-grow h-7 text-xs"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground mb-1">Highlight Color</Label>
                <div className="flex items-center space-x-1">
                    <Input
                        type="color"
                        value={item.previewSettings.highlightColor}
                        onChange={(e) => updatePreviewSettings({ highlightColor: e.target.value })}
                        className="w-6 h-6 p-0"
                    />
                    <Input
                        type="text"
                        value={item.previewSettings.highlightColor}
                        onChange={(e) => updatePreviewSettings({ highlightColor: e.target.value })}
                        className="flex-grow h-7 text-xs"
                    />
                </div>
            </div>
        </>
    )
}

