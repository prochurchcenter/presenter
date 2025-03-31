import { useState } from 'react'
import ContentEditable from 'react-contenteditable'
import { ChevronDown, ChevronRight, FileText } from 'lucide-react'

interface NotesSectionProps {
    notes: string;
    onNotesChange: (notes: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border-t">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-2 px-4 py-2 hover:bg-accent"
            >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Notes</span>
            </button>
            {isOpen && (
                <div className="p-4">
                    <ContentEditable
                        html={notes}
                        onChange={(evt) => onNotesChange(evt.target.value)}
                        className="min-h-[100px] rounded-md bg-card p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            )}
        </div>
    )
}