import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useServiceStore } from "@renderer/store/useServiceStore"


export const BackgroundControl = () => {
    const {
        item,
        updatePreviewSettings,
    } = useServiceStore()

    if (!item?.previewSettings?.background) {
        return null;
    }

    const backgroundType = item.previewSettings.background.type || "none"

    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground mb-1">Background</Label>
            <div className="flex items-center space-x-1">
                <Select
                    value={backgroundType}
                    onValueChange={(value: "image" | "video" | "none") => {
                        updatePreviewSettings({
                            background: {
                                ...item.previewSettings.background,
                                type: value === "none" ? null : value,
                                url: null
                            }
                        })
                    }}
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
                {backgroundType !== "none" && (
                    <>
                        <Input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    if (backgroundType === "video") {
                                        const url = URL.createObjectURL(file)
                                        updatePreviewSettings({
                                            background: {
                                                ...item.previewSettings.background,
                                                type: backgroundType,
                                                url: url
                                            }
                                        })
                                    } else {
                                        const reader = new FileReader()
                                        reader.onload = (event) => {
                                            updatePreviewSettings({
                                                background: {
                                                    ...item.previewSettings.background,
                                                    type: backgroundType,
                                                    url: event.target?.result as string
                                                }
                                            })
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }
                            }}
                            accept={backgroundType === "image" ? "image/*" : "video/*"}
                            className="h-7 text-xs flex-grow"
                        />
                    </>
                )}
            </div>
        </div>
    )
}

