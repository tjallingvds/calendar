import type { ScheduledTask } from '@/lib/api';

interface TaskCardProps {
  task: ScheduledTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const isCompleted = task.completed;
  const isNotCompleted = task.not_completed_reason && !task.completed;
  
  return (
    <div
      className={`h-full rounded-lg p-3 text-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all overflow-hidden border backdrop-blur-sm ${
        isCompleted ? 'opacity-60' : ''
      }`}
      style={{
        backgroundColor: isNotCompleted ? '#ff000012' : isCompleted ? '#00ff0012' : task.color + '12',
        borderColor: isNotCompleted ? '#ff000030' : isCompleted ? '#00ff0030' : task.color + '30',
      }}
    >
      <div className="flex items-start gap-2">
        {isCompleted && (
          <div className="text-green-600 dark:text-green-400 text-xs mt-0.5">✓</div>
        )}
        {isNotCompleted && (
          <div className="text-red-600 dark:text-red-400 text-xs mt-0.5">✗</div>
        )}
        <div className="flex-1 min-w-0">
          <div 
            className={`font-semibold truncate mb-1.5 text-[13px] ${isCompleted ? 'line-through' : ''}`} 
            style={{ color: isNotCompleted ? '#ff0000' : isCompleted ? '#00ff00' : task.color }}
          >
            {task.title}
          </div>
          <div className="text-[11px] opacity-50 truncate mb-2 tabular-nums">
            {task.start_time} - {task.end_time}
          </div>
          {task.description && (
            <div className="text-[11px] opacity-40 line-clamp-2 leading-relaxed">
              {task.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


