import { formatDate, parseTimeToMinutes } from '@/lib/dateUtils';
import type { ScheduledTask, Event } from '@/lib/api';
import { TaskCard } from './TaskCard';
import { EventCard } from './EventCard';

interface TimeGridProps {
  weekDays: Date[];
  timeSlots: string[];
  tasks: ScheduledTask[];
  events: Event[];
  onTaskClick?: (task: ScheduledTask) => void;
  onEventClick?: (event: Event) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
}

export function TimeGrid({
  weekDays,
  timeSlots,
  tasks,
  events,
  onTaskClick,
  onEventClick,
  onTimeSlotClick,
}: TimeGridProps) {
  // Get tasks for a specific day
  const getTasksForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return tasks.filter(task => task.date === dateStr);
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const getTaskHeight = (task: ScheduledTask) => {
    const start = parseTimeToMinutes(task.start_time);
    const end = parseTimeToMinutes(task.end_time);
    
    let duration;
    if (end < start) {
      // Task spans to next day
      duration = 1440 - start + end;
    } else {
      duration = end - start;
    }
    
    // Each 30-min slot is 72px, calculate proportional height
    return (duration / 30) * 72;
  };

  const getTaskTop = (task: ScheduledTask) => {
    const start = parseTimeToMinutes(task.start_time);
    const firstSlotTime = parseTimeToMinutes(timeSlots[0]);
    const offset = start - firstSlotTime;
    
    // Calculate exact pixel position based on minutes offset
    return (offset / 30) * 72;
  };

  return (
    <div className="overflow-auto max-h-[calc(100vh-300px)]">
      <div className="grid grid-cols-8">
        {/* Time column */}
        <div className="w-20">
          {timeSlots.map((time, timeIndex) => (
            <div
              key={timeIndex}
              className="flex items-start justify-end pr-5 pt-2 border-b border-border/30"
              style={{ height: '72px' }}
            >
              <span className="text-[11px] text-muted-foreground/60 font-medium tabular-nums">{time}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, dayIndex) => {
          const dayTasks = getTasksForDay(day);
          const dayEvents = getEventsForDay(day);
          const dateStr = formatDate(day);

          return (
            <div key={dayIndex} className="relative">
              {/* Time slots */}
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={timeIndex}
                  className="border-b border-l border-border/30 hover:bg-accent/[0.03] cursor-pointer transition-colors"
                  style={{ height: '72px' }}
                  onClick={() => onTimeSlotClick?.(dateStr, time)}
                />
              ))}

              {/* Events at top of day */}
              {dayEvents.map((event, eventIndex) => (
                <div
                  key={event.id}
                  className="absolute left-3 right-3 z-10 cursor-pointer"
                  style={{ top: `${12 + (eventIndex * 36)}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                >
                  <EventCard event={event} />
                </div>
              ))}

              {/* Tasks */}
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className="absolute left-3 right-3 z-20 cursor-pointer"
                  style={{
                    height: `${getTaskHeight(task)}px`,
                    top: `${getTaskTop(task)}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick?.(task);
                  }}
                >
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}


