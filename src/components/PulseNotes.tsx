import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Send, X, Calendar, Filter } from 'lucide-react';
import type { ScheduledTask } from '@/lib/api';

interface PulseNote {
  id: number;
  content: string;
  created_at: string;
}

interface UnifiedNote {
  id: string; // string to handle both number and composite keys
  content: string;
  created_at: string;
  type: 'pulse' | 'reflection';
  linkedTask?: ScheduledTask;
}

interface PulseNotesProps {
  onSave?: (content: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  notes: PulseNote[];
  tasks?: ScheduledTask[];
  onTaskClick?: (task: ScheduledTask) => void;
}

export function PulseNotes({ onSave, onDelete, notes, tasks = [], onTaskClick }: PulseNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pulse' | 'linked'>('all');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Combine pulse notes and reflection notes
  const unifiedNotes: UnifiedNote[] = [
    // Pulse notes
    ...notes.map(note => ({
      id: `pulse-${note.id}`,
      content: note.content,
      created_at: note.created_at,
      type: 'pulse' as const,
    })),
    // Reflection notes from tasks
    ...tasks
      .filter(task => task.reflection_notes && task.reflection_notes.trim())
      .map(task => ({
        id: `task-${task.id}`,
        content: task.reflection_notes!,
        created_at: task.completed_at || task.date,
        type: 'reflection' as const,
        linkedTask: task,
      }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter notes based on selected filter
  const filteredNotes = unifiedNotes.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'pulse') return note.type === 'pulse';
    if (filter === 'linked') return note.type === 'reflection';
    return true;
  });

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
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
          className="h-7 px-3 text-xs"
        >
          All Notes ({unifiedNotes.length})
        </Button>
        <Button
          variant={filter === 'pulse' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('pulse')}
          className="h-7 px-3 text-xs"
        >
          Quick Notes ({notes.length})
        </Button>
        <Button
          variant={filter === 'linked' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('linked')}
          className="h-7 px-3 text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Linked ({tasks.filter(t => t.reflection_notes).length})
        </Button>
      </div>

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
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {filter === 'all' && 'No notes yet. Write your first note above.'}
            {filter === 'pulse' && 'No quick notes yet.'}
            {filter === 'linked' && 'No reflection notes from calendar tasks yet.'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-border/40 bg-card shadow-sm group hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Note Type Badge */}
                    {note.type === 'reflection' && note.linkedTask && (
                      <div 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: note.linkedTask.color + '15',
                          color: note.linkedTask.color,
                        }}
                        onClick={() => onTaskClick?.(note.linkedTask!)}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>{note.linkedTask.title}</span>
                        <span className="opacity-60">• {note.linkedTask.date}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  {onDelete && note.type === 'pulse' && (
                    <button
                      onClick={() => onDelete(parseInt(note.id.split('-')[1]))}
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

