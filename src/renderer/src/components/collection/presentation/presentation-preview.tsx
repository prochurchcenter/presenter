import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PreviewSettings } from '@/types/service'
import { cn } from '@/lib/utils'
import { Monitor, Eye } from 'lucide-react'

interface PresentationPreviewProps {
  content: any[]
  activeSlideIndex: number
  setActiveSlideIndex: (index: number) => void
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void
  previewSettings?: PreviewSettings
  goToNextSlide: () => void
  goToPreviousSlide: () => void
  showPresentationView: boolean
  setShowPresentationView: (show: boolean) => void
}

export function PresentationPreview({
  content,
  activeSlideIndex,
  setActiveSlideIndex,
  isFullscreen,
  setIsFullscreen,
  previewSettings,
  goToNextSlide,
  goToPreviousSlide,
  showPresentationView,
  setShowPresentationView
}: PresentationPreviewProps) {
  return (
    <div
      className={cn(
        'border rounded-lg transition-all',
        isFullscreen ? 'w-full p-0' : 'w-full lg:w-2/6 p-4'
      )}
    >
      {!isFullscreen && (
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-md font-medium">Live Preview</h3>
            <p className="text-xs text-muted-foreground">16:9 aspect ratio</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Fullscreen</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresentationView(true)}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Present</span>
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'relative',
          isFullscreen ? 'h-full' : 'w-full',
          !isFullscreen && "style={{ paddingTop: '56.25%' }}"
        )}
      >
        <div
          className={cn(
            'bg-black rounded-lg overflow-hidden',
            isFullscreen ? 'fixed inset-0 z-50' : 'absolute inset-0'
          )}
        >
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
              >
                Exit Fullscreen
              </Button>
            </div>
          )}

          {previewSettings?.background?.type &&
            (previewSettings.background.type === 'image' ? (
              <img
                src={previewSettings.background.url || '/placeholder.svg'}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : previewSettings.background.type === 'video' ? (
              <video
                key={previewSettings.background.url}
                src={previewSettings.background.url}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null)}

          {content[activeSlideIndex] && (
            <>
              {content[activeSlideIndex].type === 'content' ? (
                <div
                  className="absolute w-full h-full flex items-start justify-center overflow-hidden"
                  style={{
                    alignItems:
                      previewSettings?.fontPosition === 'top'
                        ? 'flex-start'
                        : previewSettings?.fontPosition === 'bottom'
                          ? 'flex-end'
                          : 'center'
                  }}
                >
                  <div
                    className="w-[80%] max-h-full overflow-hidden py-4"
                    style={{
                      textAlign: previewSettings?.textAlign || 'center',
                      fontFamily: previewSettings?.fontFamily || 'sans-serif',
                      color: previewSettings?.textColor || '#ffffff',
                      textShadow:
                        previewSettings?.textEffect === 'shadow'
                          ? '2px 2px 4px rgba(0,0,0,0.5)'
                          : 'none'
                    }}
                  >
                    {(content[activeSlideIndex].content?.split('\n') || []).map(
                      (line: string, idx: number) => (
                        <div
                          key={`preview-line-${idx}`}
                          className="block w-full"
                          style={{
                            fontSize: `${previewSettings?.fontSize || 24}px`,
                            lineHeight: '1.2',
                            padding: '0 5px',
                            margin: '2px 0',
                            backgroundColor:
                              previewSettings?.textEffect === 'highlight'
                                ? previewSettings.highlightColor
                                : 'transparent'
                          }}
                        >
                          {line}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : content[activeSlideIndex].type === 'image' ? (
                <>
                  <img
                    src={content[activeSlideIndex].imageUrl || '/placeholder.svg'}
                    alt="Slide"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {content[activeSlideIndex].content && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white"
                      style={{
                        textAlign: previewSettings?.textAlign || 'center',
                        fontFamily: previewSettings?.fontFamily || 'sans-serif'
                      }}
                    >
                      {content[activeSlideIndex].content}
                    </div>
                  )}
                </>
              ) : content[activeSlideIndex].type === 'video' ? (
                <>
                  <video
                    src={content[activeSlideIndex].videoUrl}
                    autoPlay
                    loop
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ playbackRate: content[activeSlideIndex].videoSpeed || 1 }}
                    muted={content[activeSlideIndex].videoMuted}
                    controls={false}
                    playsInline
                  />
                  {content[activeSlideIndex].content && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white"
                      style={{
                        textAlign: previewSettings?.textAlign || 'center',
                        fontFamily: previewSettings?.fontFamily || 'sans-serif'
                      }}
                    >
                      {content[activeSlideIndex].content}
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}

          {isFullscreen && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousSlide}
                disabled={activeSlideIndex === 0}
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
              >
                Previous
              </Button>
              <div className="bg-black/50 text-white px-3 py-1 rounded flex items-center">
                {activeSlideIndex + 1} / {content.length}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextSlide}
                disabled={activeSlideIndex === content.length - 1}
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isFullscreen && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <Label>Slide Navigation</Label>
            <div className="text-sm text-muted-foreground">
              {activeSlideIndex + 1} of {content.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousSlide}
              disabled={activeSlideIndex === 0}
            >
              Previous
            </Button>

            <div className="flex-1 overflow-x-auto py-1 flex gap-1 justify-center items-center">
              {content.map((_, idx) => (
                <Button
                  key={`nav-${idx}`}
                  variant={idx === activeSlideIndex ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveSlideIndex(idx)}
                  className="w-8 h-8 p-0 flex-shrink-0"
                >
                  {idx + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextSlide}
              disabled={activeSlideIndex === content.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PresentationPreview