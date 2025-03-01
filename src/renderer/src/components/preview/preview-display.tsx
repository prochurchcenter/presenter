"use client"

import { useServiceStore } from "@renderer/store/useServiceStore"

export const PreviewDisplay = () => {
  const { currentItem, item } = useServiceStore()
  console.log(item.previewSettings)

  // Check if all required data is available
  if (!currentItem || !item) {
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

  const renderTextLine = (line, index) => (
    <div
      key={`line-${index}-${line.slice(0, 10)}`}
      className="block w-full"
      style={{
        fontSize: `${item.previewSettings?.fontSize || 24}px`,
        lineHeight: "1.2",
        padding: "0 5px",
        margin: "2px 0",
        backgroundColor: item.previewSettings?.textEffect === "highlight"
          ? item.previewSettings.highlightColor
          : "transparent",
        textAlign: item.previewSettings?.textAlign || "center",
      }}
    >
      {line}
    </div>
  )

  const renderContent = () => {
    if (["verse", "chorus", "bridge", "intro", "outro"].includes(currentItem.type)) {
      const currentLyric = currentItem.content || currentItem
      if (!currentLyric) return null;

      return (
        <div
          className="absolute w-full h-full flex items-start justify-center overflow-hidden"
          style={{
            alignItems: item.previewSettings?.fontPosition === "top"
              ? "flex-start"
              : item.previewSettings?.fontPosition === "bottom"
                ? "flex-end"
                : "center",
          }}
        >
          <div
            className="w-[80%] max-h-full overflow-hidden py-4"
            style={{
              textAlign: item.previewSettings?.textAlign || "center",
              fontFamily: item.previewSettings?.fontFamily || "sans-serif",
              color: item.previewSettings?.textColor || "#ffffff",
              textShadow: item.previewSettings?.textEffect === "shadow"
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
                alignItems: item.previewSettings.fontPosition === "top"
                  ? "flex-start"
                  : item.previewSettings.fontPosition === "bottom"
                    ? "flex-end"
                    : "center",
              }}
            >
              <div
                className="w-[80%] max-h-full overflow-hidden py-4"
                style={{
                  textAlign: item.previewSettings?.textAlign || "center",
                  fontFamily: item.previewSettings?.fontFamily || "sans-serif",
                  color: item.previewSettings?.textColor || "#ffffff",
                  textShadow: item.previewSettings?.textEffect === "shadow"
                    ? "2px 2px 4px rgba(0,0,0,0.5)"
                    : "none",
                }}
              >
                {(slide.content?.split("\n") || []).map((line, index) =>
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
        {item.previewSettings?.background?.type && (
          item.previewSettings.background.type === "image" ? (
            <img
              src={item.previewSettings.background.url || "/placeholder.svg"}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : item.previewSettings.background.type === "video" ? (
            <video
              src={item.previewSettings.background.url.startsWith('blob:')
                ? item.previewSettings.background.url.split('blob:file://')[1]
                : item.previewSettings.background.url}
              autoPlay
              loop
              muted
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                console.error('Video error:', e);
                const video = e.target as HTMLVideoElement;
                console.log('Attempted video URL:', video.src);
              }}
            />
          ) : null
        )}

        {renderContent()}
      </div>
    </div>
  )
}