export function getSectionColor(type: string): string {
  switch (type) {
    case 'verse':
      return 'border-blue-500/20 bg-blue-500/5'
    case 'chorus':
      return 'border-amber-500/20 bg-amber-500/5'
    case 'bridge':
      return 'border-purple-500/20 bg-purple-500/5'
    case 'intro':
      return 'border-green-500/20 bg-green-500/5'
    case 'outro':
      return 'border-red-500/20 bg-red-500/5'
    default:
      return 'border-gray-200'
  }
}

export function getSectionColorClass(type: string): string {
  switch (type) {
    case 'verse':
      return 'text-blue-500'
    case 'chorus':
      return 'text-amber-500'
    case 'bridge':
      return 'text-purple-500'
    case 'intro':
      return 'text-green-500'
    case 'outro':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}