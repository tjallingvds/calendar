import type { Event } from '@/lib/api';
import { Calendar, Clock, AlertCircle, Check } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'deadline':
        return <AlertCircle className="h-3 w-3" />;
      case 'meeting':
        return <Clock className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const isCompleted = Boolean(event.completed);

  return (
    <div
      className={`rounded-lg px-3 py-2 text-xs font-medium cursor-pointer hover:shadow-sm hover:scale-[1.01] transition-all flex items-center gap-2 border backdrop-blur-sm ${
        isCompleted ? 'opacity-60' : ''
      }`}
      style={{
        backgroundColor: isCompleted ? '#00ff0012' : event.color + '12',
        borderColor: isCompleted ? '#00ff0030' : event.color + '30',
        color: isCompleted ? '#00ff00' : event.color,
      }}
    >
      <div className="opacity-70 flex items-center gap-1">
        {isCompleted && <Check className="h-3 w-3" />}
        {getIcon()}
      </div>
      <span className={`truncate flex-1 ${isCompleted ? 'line-through' : ''}`}>{event.title}</span>
      {event.start_time && (
        <span className="text-[10px] opacity-50 tabular-nums">{event.start_time}</span>
      )}
    </div>
  );
}


