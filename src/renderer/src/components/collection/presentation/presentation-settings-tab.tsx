import { PreviewSettingsForm } from '@/components/preview/preview-settings-form'
import { PreviewSettings } from '@/types/service'

interface PresentationSettingsTabProps {
  previewSettings?: PreviewSettings
  onPreviewSettingsChange?: (settings: PreviewSettings) => void
}

export function PresentationSettingsTab({
  previewSettings,
  onPreviewSettingsChange
}: PresentationSettingsTabProps) {
  return (
    <>
      {previewSettings && onPreviewSettingsChange && (
        <PreviewSettingsForm
          initialSettings={previewSettings}
          onChange={onPreviewSettingsChange}
        />
      )}
    </>
  )
}

export default PresentationSettingsTab