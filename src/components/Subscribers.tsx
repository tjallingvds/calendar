import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { getSubscribers, deleteSubscriber } from '@/lib/api';
import type { EmailSubscriber } from '@/lib/api';

export function Subscribers() {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getSubscribers();
      setSubscribers(data);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this subscriber?')) return;
    await deleteSubscriber(id);
    await load();
  };

  const handleCopyAll = async () => {
    const emails = subscribers.map((s) => s.email).join(', ');
    await navigator.clipboard.writeText(emails);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Subscribers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {subscribers.length} {subscribers.length === 1 ? 'person has' : 'people have'} signed up
          </p>
        </div>
        {subscribers.length > 0 && (
          <Button onClick={handleCopyAll} size="sm" variant="outline">
            Copy all emails
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No subscribers yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card shadow-sm divide-y divide-border/40">
          {subscribers.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between px-4 py-3 group hover:bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{sub.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Subscribed {new Date(sub.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(sub.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
