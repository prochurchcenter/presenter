import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useServiceStore } from "@renderer/store/useServiceStore"


export const BackgroundControl = () => {
    const {
        item,
        updatePreviewSettings,
    } = useServiceStore()

    if (!item || !item.previewSettings) {
        return null;
    }
    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground mb-1">Background</Label>
            <div className="flex items-center space-x-1">
                <Select
                    value={item.previewSettings.background.type || "none"}
                    onValueChange={(value: "image" | "video" | "none") =>
                        updatePreviewSettings({ background: { ...item.previewSettings.background, type: value === "none" ? null : value } })
                    }
                >
                    <SelectTrigger className="h-7 text-xs flex-grow">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {["none", "image", "video"].map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {item.previewSettings.background.type && (
                    <Input
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                const url = URL.createObjectURL(file)
                                updatePreviewSettings({
                                    background: { ...item.previewSettings.background, url },
                                })
                            }
                        }}
                        accept={item.previewSettings.background.type === "image" ? "image/*" : "video/*"}
                        className="h-7 text-xs flex-grow"
                    />
                )}
            </div>
        </div>
    )
}

