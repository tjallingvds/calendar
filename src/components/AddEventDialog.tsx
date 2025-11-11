import { useState } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: {
    title: string;
    description: string;
    date: string;
    start_time?: string;
    end_time?: string;
    type: 'deadline' | 'meeting' | 'event';
    color: string;
  }) => void;
  initialDate?: string;
}

export function AddEventDialog({ isOpen, onClose, onSubmit, initialDate }: AddEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<'deadline' | 'meeting' | 'event'>('deadline');
  const [color, setColor] = useState('#ef4444');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert end time to next day format if it's before start time
    let finalEndTime = endTime;
    if (startTime && endTime && endTime < startTime) {
      const [hours, minutes] = endTime.split(':');
      const nextDayHours = parseInt(hours) + 24;
      finalEndTime = `${nextDayHours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    onSubmit({
      title,
      description,
      date,
      start_time: startTime || undefined,
      end_time: finalEndTime || undefined,
      type,
      color,
    });
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Add Event</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="deadline">Deadline</option>
              <option value="meeting">Meeting</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time (optional)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End Time (optional)
                {startTime && endTime && endTime < startTime && (
                  <span className="text-xs text-muted-foreground ml-2">(next day)</span>
                )}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex gap-2">
              {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#000' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Event</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

