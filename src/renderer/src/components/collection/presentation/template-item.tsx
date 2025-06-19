import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Heading, FileText, List, Columns, TextQuote, Rows } from 'lucide-react'

interface TemplateItemProps {
  template: {
    name: string
    icon: string
    content: string
    description: string
    settings: {
      textAlign: string
      fontSize: number
      fontPosition: string
      textEffect?: string
    }
  }
  index: number
  onClick: (index: number) => void
  size?: 'sm' | 'lg'
}

export function TemplateItem({ template, index, onClick, size = 'sm' }: TemplateItemProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heading':
        return <Heading className="h-4 w-4" />
      case 'FileText':
        return <FileText className="h-4 w-4" />
      case 'List':
        return <List className="h-4 w-4" />
      case 'Columns':
        return <Columns className="h-4 w-4" />
      case 'TextQuote':
        return <TextQuote className="h-4 w-4" />
      case 'Rows':
        return <Rows className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Button
      key={`template-${index}`}
      variant="outline"
      size={size}
      onClick={() => onClick(index)}
      className={cn(
        'h-auto flex flex-col items-start justify-start gap-1 hover:bg-muted/50 text-left',
        size === 'sm' ? 'py-3 px-3' : 'py-4 px-4'
      )}
    >
      <div className="flex items-center w-full">
        <div className={cn('text-primary', size === 'lg' ? 'mr-2 bg-primary/10 p-2 rounded-full' : '')}>
          {getIcon(template.icon)}
        </div>
        <span className="font-medium">{template.name}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 w-full">{template.description}</p>
      <div
        className={cn(
          'mt-1 w-full bg-black/80 rounded overflow-hidden flex items-center justify-center',
          size === 'sm' ? 'p-1 min-h-[40px]' : 'p-2 min-h-[70px]'
        )}
      >
        <div
          className={cn(
            'text-white leading-tight overflow-hidden max-w-full',
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}
          style={{
            textAlign: template.settings.textAlign,
            fontSize: `${size === 'sm' ? Math.min(template.settings.fontSize / 3, 11) : Math.min(template.settings.fontSize / 2, 14)}px`,
            textShadow: template.settings.textEffect === 'shadow' ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
          }}
        >
          {template.content.split('\n').map((line, lineIdx) => (
            <div
              key={lineIdx}
              className={size === 'sm' ? 'whitespace-nowrap overflow-hidden text-ellipsis' : 'overflow-hidden text-ellipsis'}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      {size === 'lg' && (
        <div className="w-full flex flex-wrap gap-1 mt-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/30">
            {template.settings.fontSize}px
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/30 capitalize">
            {template.settings.textAlign}
          </span>
          {template.settings.textEffect && template.settings.textEffect !== 'none' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/30 capitalize">
              {template.settings.textEffect}
            </span>
          )}
        </div>
      )}
    </Button>
  )
}

export default TemplateItem