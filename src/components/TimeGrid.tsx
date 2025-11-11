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
  const getTasksForDayAndTime = (date: Date, time: string) => {
    const dateStr = formatDate(date);
    const timeMinutes = parseTimeToMinutes(time);
    
    return tasks.filter(task => {
      if (task.date !== dateStr) return false;
      const taskStart = parseTimeToMinutes(task.start_time);
      const taskEnd = parseTimeToMinutes(task.end_time);
      return timeMinutes >= taskStart && timeMinutes < taskEnd;
    });
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const getTaskHeight = (task: ScheduledTask) => {
    const start = parseTimeToMinutes(task.start_time);
    const end = parseTimeToMinutes(task.end_time);
    const duration = end - start;
    // Each 30-min slot is ~72px
    return (duration / 30) * 72;
  };

  const getTaskTop = (task: ScheduledTask, firstSlotTime: string) => {
    const taskStart = parseTimeToMinutes(task.start_time);
    const slotStart = parseTimeToMinutes(firstSlotTime);
    const offset = taskStart - slotStart;
    return (offset / 30) * 72;
  };

  return (
    <div className="overflow-auto max-h-[calc(100vh-300px)]">
      <div className="relative">
        {timeSlots.map((time, timeIndex) => (
          <div key={timeIndex} className="grid grid-cols-8 border-b border-border/30 last:border-b-0" style={{ height: '72px' }}>
            {/* Time label */}
            <div className="w-20 flex items-start justify-end pr-5 pt-2">
              <span className="text-[11px] text-muted-foreground/60 font-medium tabular-nums">{time}</span>
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dateStr = formatDate(day);
              const dayTasks = getTasksForDayAndTime(day, time);
              const dayEvents = timeIndex === 0 ? getEventsForDay(day) : [];
              
              return (
                <div
                  key={dayIndex}
                  className="hover:bg-accent/[0.03] cursor-pointer transition-colors relative group"
                  onClick={() => onTimeSlotClick?.(dateStr, time)}
                >
                  {/* Show events at top of day */}
                  {timeIndex === 0 && dayEvents.map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className="absolute left-3 right-3 z-10"
                      style={{ top: `${12 + (eventIndex * 36)}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <EventCard event={event} />
                    </div>
                  ))}

                  {/* Show tasks that start in this time slot */}
                  {dayTasks.map((task) => {
                    const isTaskStart = task.start_time === time;
                    if (!isTaskStart) return null;
                    
                    return (
                      <div
                        key={task.id}
                        className="absolute left-3 right-3 z-20"
                        style={{
                          height: `${getTaskHeight(task)}px`,
                          top: `${getTaskTop(task, time)}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task);
                        }}
                      >
                        <TaskCard task={task} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


