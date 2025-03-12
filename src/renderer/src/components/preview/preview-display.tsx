"use client"

import { useServiceStore } from "@renderer/store/useServiceStore"

export const PreviewDisplay = () => {
  const { currentItem, activeItem } = useServiceStore()

  // Check if all required data is available
  if (!currentItem || !activeItem) {
    return (
      <div className="relative" style={{ width: "100%", paddingTop: "56.25%" }}>
        <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
            Select a slide or lyric to preview
          </div>
        </div>
      </div>
    )
  }

  const renderTextLine = (line: any, index: number) => (
    <div
      key={`line-${index}-${line.slice(0, 10)}`}
      className="block w-full"
      style={{
        fontSize: `${activeItem.previewSettings?.fontSize || 24}px`,
        lineHeight: "1.2",
        padding: "0 5px",
        margin: "2px 0",
        backgroundColor: activeItem.previewSettings?.textEffect === "highlight"
          ? activeItem.previewSettings.highlightColor
          : "transparent",
        textAlign: activeItem.previewSettings?.textAlign || "center",
      }}
    >
      {line}
    </div>
  )

  const renderContent = () => {
    if (["verse", "chorus", "bridge", "intro", "outro"].includes(currentItem.type)) {
      const currentLyric = currentItem.content || currentItem
      if (!currentLyric) return null;

      console.log(activeItem.previewSettings.background.url)

      return (
        <div
          className="absolute w-full h-full flex items-start justify-center overflow-hidden"
          style={{
            alignItems: activeItem.previewSettings?.fontPosition === "top"
              ? "flex-start"
              : activeItem.previewSettings?.fontPosition === "bottom"
                ? "flex-end"
                : "center",
          }}
        >
          <div
            className="w-[80%] max-h-full overflow-hidden py-4"
            style={{
              textAlign: activeItem.previewSettings?.textAlign || "center",
              fontFamily: activeItem.previewSettings?.fontFamily || "sans-serif",
              color: activeItem.previewSettings?.textColor || "#ffffff",
              textShadow: activeItem.previewSettings?.textEffect === "shadow"
                ? "2px 2px 4px rgba(0,0,0,0.5)"
                : "none",
            }}
          >
            {renderTextLine(currentLyric.lines, currentLyric.index)}
          </div>
        </div>
      )
    } else if (currentItem.type === "presentation") {
      // Use the current slide directly from currentItem
      const slide = currentItem.currentSlide || currentItem
      if (!slide) {
        console.log("No slide found in currentItem")
        return null
      }

      switch (slide.type) {
        case "content":
          return (
            <div
              className="absolute w-full h-full flex items-start justify-center overflow-hidden"
              style={{
                alignItems: activeItem.previewSettings.fontPosition === "top"
                  ? "flex-start"
                  : activeItem.previewSettings.fontPosition === "bottom"
                    ? "flex-end"
                    : "center",
              }}
            >
              <div
                className="w-[80%] max-h-full overflow-hidden py-4"
                style={{
                  textAlign: activeItem.previewSettings?.textAlign || "center",
                  fontFamily: activeItem.previewSettings?.fontFamily || "sans-serif",
                  color: activeItem.previewSettings?.textColor || "#ffffff",
                  textShadow: activeItem.previewSettings?.textEffect === "shadow"
                    ? "2px 2px 4px rgba(0,0,0,0.5)"
                    : "none",
                }}
              >
                {(slide.content?.split("\n") || []).map((line: string, index: number) =>
                  renderTextLine(line, index)
                )}
              </div>
            </div>
          )
        case "image":
          return (
            <img
              src={slide.imageUrl || "/placeholder.svg"}
              alt="Slide"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )
        case "video":
          return (
            <video
              src={slide.videoUrl}
              controls
              className="absolute inset-0 w-full h-full object-contain"
              style={{ "--video-speed": slide.videoSpeed || 1 } as React.CSSProperties}
              muted={slide.videoMuted}
            />
          )
        case "blank":
          return null
        default:
          console.log("Unknown slide type:", slide.type)
          return null
      }
    }

    return null
  }

  return (
    <div className="relative" style={{ width: "100%", paddingTop: "56.25%" }}>
      <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
        {activeItem.previewSettings?.background?.type && (
          activeItem.previewSettings.background.type === "image" ? (
            <img
              src={activeItem.previewSettings.background.url || "/placeholder.svg"}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : activeItem.previewSettings.background.type === "video" ? (
            <video
              key={activeItem.previewSettings.background.url}
              src={activeItem.previewSettings.background.url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log('Preview URL:', video.src);
                // Try alternative URL format if initial one fails
                if (video.src.startsWith('blob:')) {
                  video.src = video.src.split('blob:')[1];
                }
              }}
            />
          ) : null
        )}

        {renderContent()}
      </div>
    </div>
  )
}