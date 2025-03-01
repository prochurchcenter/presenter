import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useServiceStore } from "@renderer/store/useServiceStore"


export const FontControl = () => {
    const {
        item,
        updatePreviewSettings,
        setSettings
    } = useServiceStore()

    if (!item || !item.previewSettings) {
        return null;
    }

    const handleFontChange = (value: string) => {
        const newSettings = { ...item.previewSettings, fontFamily: value };
        updatePreviewSettings(newSettings);
        // setSettings(newSettings);
    }

    const handleFontSizeChange = (value: number) => {
        const newSettings = { ...item.previewSettings, fontSize: value };
        updatePreviewSettings(newSettings);
        // setSettings(newSettings);
    }

    const handlePositionChange = (value: "top" | "center" | "bottom") => {
        const newSettings = { ...item.previewSettings, fontPosition: value };
        updatePreviewSettings(newSettings);
        // setSettings(newSettings);
    }

    return (
        <>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground mb-1">Font</Label>
                <Select value={item.previewSettings.fontFamily} onValueChange={handleFontChange}>
                    <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground mb-1">Font Size</Label>
                <Input
                    type="number"
                    value={item.previewSettings.fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="h-7 text-xs"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground mb-1">Position</Label>
                <Select
                    value={item.previewSettings.fontPosition}
                    onValueChange={handlePositionChange}
                >
                    <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    )
}

