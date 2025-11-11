import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Send, X } from 'lucide-react';

interface PulseNote {
  id: number;
  content: string;
  created_at: string;
}

interface PulseNotesProps {
  onSave?: (content: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  notes: PulseNote[];
}

export function PulseNotes({ onSave, onDelete, notes }: PulseNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(newNote);
      setNewNote('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* New Note Input */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
        <div className="p-6">
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            className="w-full px-0 py-0 border-0 bg-transparent resize-none focus:outline-none min-h-[80px] max-h-[300px] text-sm"
            rows={1}
          />
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-border/40 bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Press ⌘+Enter to post
          </span>
          <Button 
            type="submit" 
            size="sm" 
            disabled={!newNote.trim() || isSaving}
            className="h-8"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Post
          </Button>
        </div>
      </form>

      {/* Notes Feed */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No notes yet. Write your first note above.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-border/40 bg-card shadow-sm group hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 self-start"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(note.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

