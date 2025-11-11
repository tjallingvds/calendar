import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Trash2 } from 'lucide-react';
import type { ScheduledTask } from '@/lib/api';

interface ReflectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    completed?: boolean;
    completed_at?: string;
    not_completed_reason?: string;
    reflection_notes?: string;
  }) => void;
  onDelete?: () => void;
  task?: ScheduledTask;
}

export function ReflectionDialog({ isOpen, onClose, onSubmit, onDelete, task }: ReflectionDialogProps) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'not-completed'>('pending');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [notCompletedReason, setNotCompletedReason] = useState('');

  useEffect(() => {
    if (task) {
      if (task.completed) {
        setStatus('completed');
      } else if (task.not_completed_reason) {
        setStatus('not-completed');
      } else {
        setStatus('pending');
      }
      setReflectionNotes(task.reflection_notes || '');
      setNotCompletedReason(task.not_completed_reason || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      reflection_notes: reflectionNotes || null,
    };
    
    if (status === 'completed') {
      data.completed = true;
      data.completed_at = new Date().toISOString();
      data.not_completed_reason = null;
    } else if (status === 'not-completed') {
      data.completed = false;
      data.completed_at = null;
      data.not_completed_reason = notCompletedReason || null;
    } else {
      data.completed = false;
      data.completed_at = null;
      data.not_completed_reason = null;
    }
    
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-lg w-full mx-4 border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Task Status</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {task.title} • {task.date}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Status</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                  status === 'pending'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-border hover:border-blue-300'
                }`}
              >
                <div className="font-medium">Pending</div>
                <div className="text-xs text-muted-foreground">Not completed yet</div>
              </button>
              
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                  status === 'completed'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-border hover:border-green-300'
                }`}
              >
                <div className="font-medium">Completed</div>
                <div className="text-xs text-muted-foreground">Task was completed successfully</div>
              </button>
              
              <button
                type="button"
                onClick={() => setStatus('not-completed')}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                  status === 'not-completed'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-border hover:border-red-300'
                }`}
              >
                <div className="font-medium">Not Completed</div>
                <div className="text-xs text-muted-foreground">Task was not completed</div>
              </button>
            </div>
          </div>

          {/* Not Completed Reason */}
          {status === 'not-completed' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Why wasn't this completed?
              </label>
              <textarea
                value={notCompletedReason}
                onChange={(e) => setNotCompletedReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
                rows={3}
                placeholder="Explain what prevented you from completing this task..."
                required={status === 'not-completed'}
              />
            </div>
          )}

          {/* Reflection Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reflection Notes (Optional)
            </label>
            <textarea
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              rows={4}
              placeholder="Any thoughts, learnings, or observations..."
            />
          </div>

          <div className="flex gap-2 justify-between pt-4 border-t">
            <Button 
              type="button" 
              variant="destructive" 
              size="sm"
              onClick={onDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Task
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

