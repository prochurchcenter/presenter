/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { PreviewSettings } from '@renderer/types/service'

export function Presenter() {
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [settings, setSettings] = useState<PreviewSettings>()
  const [fadeIn, setFadeIn] = useState(false)
  const [latency, setLatency] = useState<number>(0)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [textScale, setTextScale] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle window resize and container size changes
  useLayoutEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setContainerSize({ width, height })
      }
    }

    // Initialize sizes
    updateContainerSize()

    // Update on window resize
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [])

  // Calculate text scaling based on content size and container size
  useLayoutEffect(() => {
    if (contentRef.current && containerSize.width > 0 && containerSize.height > 0) {
      const containerWidth = containerSize.width * 0.8 // Content usually has 80% width
      const containerHeight = containerSize.height * 0.9 // Allow some margin

      const contentWidth = contentRef.current.scrollWidth
      const contentHeight = contentRef.current.scrollHeight

      const widthScale = containerWidth / contentWidth
      const heightScale = containerHeight / contentHeight

      // Use the smaller scale factor to ensure content fits within container
      const scale = Math.min(widthScale, heightScale, 1) // Never scale up beyond original size

      if (scale < 1) {
        setTextScale(scale)
      } else {
        setTextScale(1)
      }
    }
  }, [containerSize, currentItem, settings])

  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.on('presenter-update', (_, data) => {
        console.log('Presenter received update:', data)
        const receivedTime = performance.now()
        const clickTime = data.timestamp || receivedTime
        setLatency(receivedTime - clickTime)

        setFadeIn(false)
        setTimeout(() => {
          setCurrentItem(data)
          setFadeIn(true)
        }, 100)
      })
    }

    return () => {
      if (window.electron) {
        window.electron.ipcRenderer.removeAllListeners('presenter-update')
      }
    }
  }, [])

  useEffect(() => {
    // Initialize with default settings
    if (window.electron) {
      window.electron.ipcRenderer.on('settings-update', (_, data) => {
        if (data) {
          setSettings(data)
        }
      })
    }

    return () => {
      window.electron?.ipcRenderer.removeAllListeners('settings-update')
    }
  }, [])

  // Control video playback speed when the property changes
  useEffect(() => {
    if (
      videoRef.current &&
      currentItem?.currentSlide?.type === 'video' &&
      currentItem?.currentSlide?.videoSpeed
    ) {
      videoRef.current.playbackRate = currentItem.currentSlide.videoSpeed
    }
  }, [currentItem?.currentSlide?.videoSpeed, currentItem?.currentSlide?.type])

  // Auto-play video when it loads
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => console.warn('Auto-play prevented:', err))
    }
  }, [currentItem?.currentSlide?.videoUrl])

  const renderTextLine = (line: string, index: number) => (
    <div
      key={`line-${index}-${line.slice(0, 10)}`}
      className="block w-full text-white"
      style={{
        fontSize: `${settings?.fontSize || 24}px`,
        lineHeight: '1.2',
        padding: '0 5px',
        margin: '2px 0',
        backgroundColor:
          settings?.textEffect === 'highlight' ? settings.highlightColor : 'transparent',
        textAlign: settings?.textAlign || 'center'
      }}
    >
      {line}
    </div>
  )

  const renderContent = () => {
    if (!currentItem) return null

    console.log('Rendering content item:', currentItem)

    // Handle song lyrics sections
    if (['verse', 'chorus', 'bridge', 'intro', 'outro'].includes(currentItem.type)) {
      const lines = currentItem.lines
      const index = currentItem.index
      return (
        <div
          className="absolute w-full h-full flex items-start justify-center overflow-hidden"
          style={{
            alignItems:
              settings?.fontPosition === 'top'
                ? 'flex-start'
                : settings?.fontPosition === 'bottom'
                  ? 'flex-end'
                  : 'center'
          }}
        >
          <div
            ref={contentRef}
            className="w-[80%] max-h-full overflow-hidden py-4"
            style={{
              transform: `scale(${textScale})`,
              transformOrigin:
                settings?.fontPosition === 'top'
                  ? 'top center'
                  : settings?.fontPosition === 'bottom'
                    ? 'bottom center'
                    : 'center',
              fontFamily: settings?.fontFamily || 'sans-serif',
              color: settings?.textColor || '#ffffff',
              textShadow: settings?.textEffect === 'shadow' ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
            }}
          >
            {renderTextLine(lines, index)}
          </div>
        </div>
      )
    }

    // Handle presentation slides
    if (currentItem.currentSlide) {
      const slide = currentItem.currentSlide
      console.log('Rendering slide:', slide)

      switch (slide.type) {
        case 'content':
          return (
            <div
              className="absolute w-full h-full flex items-start justify-center overflow-hidden"
              style={{
                alignItems:
                  settings?.fontPosition === 'top'
                    ? 'flex-start'
                    : settings?.fontPosition === 'bottom'
                      ? 'flex-end'
                      : 'center'
              }}
            >
              <div
                ref={contentRef}
                className="w-[80%] max-h-full overflow-hidden py-4"
                style={{
                  transform: `scale(${textScale})`,
                  transformOrigin:
                    settings?.fontPosition === 'top'
                      ? 'top center'
                      : settings?.fontPosition === 'bottom'
                        ? 'bottom center'
                        : 'center',
                  textAlign: settings?.textAlign || 'center',
                  fontFamily: settings?.fontFamily || 'sans-serif',
                  color: settings?.textColor || '#ffffff',
                  textShadow:
                    settings?.textEffect === 'shadow' ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {(slide.content?.split('\n') || []).map((line: string, index: number) =>
                  renderTextLine(line, index)
                )}
              </div>
            </div>
          )

        case 'image':
          return (
            <>
              <img
                src={slide.imageUrl || '/placeholder.svg'}
                alt="Slide"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {slide.content && (
                <div className="absolute bottom-0 left-0 w-full bg-black/50 p-4">
                  <div
                    ref={contentRef}
                    style={{
                      transform: `scale(${textScale})`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <p
                      className="text-white text-center"
                      style={{
                        fontSize: `${settings?.fontSize || 24}px`,
                        fontFamily: settings?.fontFamily || 'sans-serif'
                      }}
                    >
                      {slide.content}
                    </p>
                  </div>
                </div>
              )}
            </>
          )

        case 'video':
          return (
            <>
              <video
                ref={videoRef}
                src={slide.videoUrl}
                autoPlay
                loop
                muted={slide.videoMuted}
                className="absolute inset-0 w-full h-full object-contain"
                playsInline
                onLoadedData={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch((e) => console.warn("Couldn't autoplay:", e))
                  }
                }}
              />
              {slide.content && (
                <div
                  className="absolute w-full h-full flex items-start justify-center overflow-hidden"
                  style={{
                    alignItems:
                      settings?.fontPosition === 'top'
                        ? 'flex-start'
                        : settings?.fontPosition === 'bottom'
                          ? 'flex-end'
                          : 'center'
                  }}
                >
                  <div
                    ref={contentRef}
                    className="w-[80%] max-h-full overflow-hidden py-4"
                    style={{
                      transform: `scale(${textScale})`,
                      transformOrigin:
                        settings?.fontPosition === 'top'
                          ? 'top center'
                          : settings?.fontPosition === 'bottom'
                            ? 'bottom center'
                            : 'center',
                      textAlign: settings?.textAlign || 'center',
                      fontFamily: settings?.fontFamily || 'sans-serif',
                      color: settings?.textColor || '#ffffff',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {(slide.content?.split('\n') || []).map((line: string, index: number) =>
                      renderTextLine(line, index)
                    )}
                  </div>
                </div>
              )}
            </>
          )
        default:
          return null
      }
    }

    return null
  }

  return (
    <div className="w-full h-screen bg-black">
      <div ref={containerRef} className="relative w-full h-full">
        {/* Skip background rendering if we're showing a video slide */}
        {!(currentItem?.currentSlide?.type === 'video') &&
          settings?.background?.type &&
          settings?.background?.url &&
          (settings.background.type === 'image' ? (
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
          ))}
        <div className={`absolute inset-0 ${fadeIn ? 'fade-in' : 'fade-out'}`}>
          {renderContent()}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 text-white text-sm opacity-50">
        Latency: {latency.toFixed(2)}ms{' '}
        {currentItem?.currentSlide?.type && `• Type: ${currentItem.currentSlide.type}`}
      </div>
    </div>
  )
}
