import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plus, X, Check } from 'lucide-react';
import { getWeeklyGoals, createWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal } from '@/lib/api';
import { getWeekStart } from '@/lib/dateUtils';

interface Goal {
  id: number;
  text: string;
  completed: boolean;
}

export function WeeklyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [lastSaved, setLastSaved] = useState<string>('');
  const currentWeekStart = getWeekStart(new Date()).toISOString().split('T')[0];

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart]);

  const loadGoals = async () => {
    try {
      const fetchedGoals = await getWeeklyGoals(currentWeekStart);
      setGoals(fetchedGoals.map(g => ({ id: g.id, text: g.text, completed: !!g.completed })));
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const addGoal = async () => {
    if (newGoalText.trim()) {
      try {
        const newGoal = await createWeeklyGoal(newGoalText.trim(), currentWeekStart);
        setGoals([...goals, { id: newGoal.id, text: newGoal.text, completed: false }]);
        setNewGoalText('');
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to create goal:', error);
      }
    }
  };

  const toggleGoal = async (id: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newCompleted = !goal.completed;
    setGoals(goals.map(g => g.id === id ? { ...g, completed: newCompleted } : g));
    
    try {
      await updateWeeklyGoal(id, goal.text, newCompleted);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to update goal:', error);
      // Revert on error
      setGoals(goals.map(g => g.id === id ? { ...g, completed: !newCompleted } : g));
    }
  };

  const deleteGoal = async (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
    try {
      await deleteWeeklyGoal(id);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to delete goal:', error);
      await loadGoals(); // Reload on error
    }
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Weekly Goals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} of {goals.length} completed
          </p>
        </div>
        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Saved {lastSaved}
          </span>
        )}
      </div>

      {/* Goals List */}
      <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
        <div className="divide-y divide-border/40">
          {goals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No goals yet. Add your first goal below.
            </div>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 px-6 py-4 hover:bg-accent/5 transition-colors group"
              >
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    goal.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-muted-foreground/30 hover:border-green-500'
                  }`}
                >
                  {goal.completed && <Check className="h-3.5 w-3.5 text-white" />}
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
            ))
          )}
        </div>
      </div>

      {/* Add New Goal */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Add a new goal..."
          className="flex-1 px-4 py-2.5 border border-border/40 rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <Button onClick={addGoal} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add
        </Button>
      </div>
    </div>
  );
}

