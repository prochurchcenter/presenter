import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useServiceStore } from "@renderer/store/useServiceStore"
import { Button } from "@/components/ui/button"


export const BackgroundControl = () => {
    const {
        activeItem,
        updatePreviewSettings,
    } = useServiceStore()

    if (!activeItem?.previewSettings?.background) {
        return null;
    }

    const backgroundType = activeItem.previewSettings.background.type || "none"

    const handleVideoSelect = async () => {
        if (window.electron) {
            try {
                const filePath = await window.electron.ipcRenderer.invoke('select-video-file');
                console.log("Selected video path:", filePath);

                updatePreviewSettings({
                    background: {
                        ...activeItem.previewSettings.background,
                        type: "video",
                        url: filePath
                    }
                });
            } catch (err) {
                console.error("Error selecting video:", err);
            }
        }
    };

    const handleImageSelect = async () => {
        if (window.electron) {
            try {
                const filePath = await window.electron.ipcRenderer.invoke('select-image-file');
                console.log("Selected image path:", filePath);

                updatePreviewSettings({
                    background: {
                        ...activeItem.previewSettings.background,
                        type: "image",
                        url: filePath
                    }
                });
            } catch (err) {
                console.error("Error selecting image:", err);
            }
        }
    };

    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground mb-1">Background</Label>
            <div className="flex items-center space-x-1">
                <Select
                    value={backgroundType}
                    onValueChange={(value: "image" | "video" | "none") => {
                        updatePreviewSettings({
                            background: {
                                ...activeItem.previewSettings.background,
                                type: value === "none" ? "" : value,
                                url: ""
                            }
                        });

                        if (value === "video" && window.electron) {
                            handleVideoSelect();
                        } else if (value === "image" && window.electron) {
                            handleImageSelect();
                        }
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

                {backgroundType === "image" && (
                    <Button
                        className="h-7 text-xs"
                        onClick={handleImageSelect}
                        variant="outline"
                    >
                        Select Image
                    </Button>
                )}

                {backgroundType === "video" && (
                    <Button
                        className="h-7 text-xs"
                        onClick={handleVideoSelect}
                        variant="outline"
                    >
                        Select Video
                    </Button>
                )}
            </div>
        </div>
    )
}