import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plus, X, Check } from 'lucide-react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyNotesProps {
  date: Date;
  onSave?: (notes: string, goals: string) => void;
  initialNotes?: string;
  initialGoals?: string;
}

export function DailyNotes({ date, onSave, initialNotes = '', initialGoals = '' }: DailyNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [lastSaved, setLastSaved] = useState<string>('');

  useEffect(() => {
    setNotes(initialNotes);
    // Parse goals from JSON or comma-separated string
    try {
      const parsed = JSON.parse(initialGoals || '[]');
      setGoals(Array.isArray(parsed) ? parsed : []);
    } catch {
      // Legacy format: comma-separated or newline-separated
      if (initialGoals) {
        const goalsList = initialGoals.split(/[\n,]+/).filter(g => g.trim());
        setGoals(goalsList.map((text, i) => ({ id: Date.now() + i + '', text: text.trim(), completed: false })));
      } else {
        setGoals([]);
      }
    }
  }, [initialNotes, initialGoals, date]);

  const handleSave = async () => {
    if (onSave) {
      const goalsJson = JSON.stringify(goals);
      await onSave(notes, goalsJson);
      setLastSaved(new Date().toLocaleTimeString());
    }
  };

  const addGoal = () => {
    if (newGoalText.trim()) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        text: newGoalText.trim(),
        completed: false,
      };
      setGoals([...goals, newGoal]);
      setNewGoalText('');
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="space-y-6">
      {/* Weekly Goals Section */}
      <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Weekly Goals</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} of {goals.length} completed
            </p>
          </div>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {lastSaved}
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors group"
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  goal.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-muted-foreground/30 hover:border-green-500'
                }`}
              >
                {goal.completed && <Check className="h-3 w-3 text-white" />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  goal.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {goal.text}
              </span>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            placeholder="Add a new goal..."
            className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Button onClick={addGoal} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Notes & Thoughts Section */}
      <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Notes & Thoughts</h3>
          <p className="text-xs text-muted-foreground mt-1">{dateStr}</p>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[300px]"
          placeholder="Write your thoughts, reflections, and learnings here..."
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        Save All Changes
      </Button>
    </div>
  );
}

