import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Save } from 'lucide-react';

interface NotesSectionProps {
  date: Date;
  onSave?: (notes: string) => void;
  initialNotes?: string;
}

export function NotesSection({ date, onSave, initialNotes = '' }: NotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [lastSaved, setLastSaved] = useState<string>('');

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, date]);

  const handleSave = async () => {
    if (onSave) {
      await onSave(notes);
      setLastSaved(new Date().toLocaleTimeString());
    }
  };

  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/40 bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Notes & Thoughts</h2>
            <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
          </div>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {lastSaved}
            </span>
          )}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-4 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[400px] font-mono text-sm"
          placeholder="Write your thoughts, reflections, and learnings here..."
        />
      </div>

      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="h-4 w-4 mr-2" />
        Save Notes
      </Button>
    </div>
  );
}

