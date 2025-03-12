import { useEffect, useState } from "react"
import { PreviewSettings } from "@renderer/types/service";

export function Presenter() {
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [settings, setSettings] = useState<PreviewSettings>();
    const [fadeIn, setFadeIn] = useState(false);
    const [latency, setLatency] = useState<number>(0);
    useEffect(() => {
        if (window.electron) {
            window.electron.ipcRenderer.on('presenter-update', (_, data) => {
                const receivedTime = performance.now();
                const clickTime = data.timestamp || receivedTime;
                setLatency(receivedTime - clickTime);

                setFadeIn(false);
                setTimeout(() => {
                    setCurrentItem(data);
                    setFadeIn(true);
                }, 100);

            });
        }

        return () => {
            if (window.electron) {
                window.electron.ipcRenderer.removeAllListeners('presenter-update');
            }
        };
    }, []);

    useEffect(() => {
        // Initialize with default settings

        if (window.electron) {
            window.electron.ipcRenderer.on('settings-update', (_, data) => {
                if (data) {
                    setSettings(data);
                }
            });
        }

        return () => {
            window.electron?.ipcRenderer.removeAllListeners('settings-update');
        };
    }, []);

    const renderTextLine = (line: string, index: number) => (
        <div
            key={`line-${index}-${line.slice(0, 10)}`}
            className="block w-full text-white"
            style={{
                fontSize: `${settings?.fontSize || 24}px`,
                lineHeight: "1.2",
                padding: "0 5px",
                margin: "2px 0",
                backgroundColor: settings?.textEffect === "highlight"
                    ? settings.highlightColor
                    : "transparent",
                textAlign: settings?.textAlign || "center",
            }}
        >
            {line}
        </div>
    );

    const renderContent = () => {
        if (!currentItem) return null;

        if (["verse", "chorus", "bridge", "intro", "outro"].includes(currentItem.type)) {
            const lines = currentItem.lines;
            const index = currentItem.index;
            return (
                <div
                    className="absolute w-full h-full flex items-start justify-center overflow-hidden"
                    style={{
                        alignItems: settings?.fontPosition === "top"
                            ? "flex-start"
                            : settings?.fontPosition === "bottom"
                                ? "flex-end"
                                : "center",
                    }}
                >
                    <div
                        className="w-[80%] max-h-full overflow-hidden py-4"
                    >
                        {renderTextLine(lines, index)}
                    </div>
                </div>
            );
        }

        return null;
    };

    console.log(settings?.background.url)

    return (
        <div className="w-full h-screen bg-black">
            <div className="relative w-full h-full">
                {settings?.background?.type && settings?.background?.url && (
                    settings.background.type === "image" ? (
                        <img
                            src={settings.background.url}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <video
                            src={settings.background.url}
                            autoPlay
                            loop
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )
                )}
                <div className={`absolute inset-0 ${fadeIn ? 'fade-in' : 'fade-out'}`}>
                    {renderContent()}
                </div>
            </div>
            <div className="fixed bottom-4 right-4 text-white text-sm opacity-50">
                Latency: {latency.toFixed(2)}ms
            </div>
        </div>
    );
}