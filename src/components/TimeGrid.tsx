import { formatDate, parseTimeToMinutes } from '@/lib/dateUtils';
import type { ScheduledTask, Event } from '@/lib/api';
import { TaskCard } from './TaskCard';
import { EventCard } from './EventCard';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

interface TimeGridProps {
  weekDays: Date[];
  timeSlots: string[];
  tasks: ScheduledTask[];
  events: Event[];
  onTaskClick?: (task: ScheduledTask) => void;
  onEventClick?: (event: Event) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
  onTaskDrop?: (taskId: number, newDate: string, newTime: string) => void;
}

// Draggable Task Wrapper
function DraggableTask({ task, children, onClick }: { task: ScheduledTask; children: React.ReactNode; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  } : { cursor: 'grab' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  );
}

// Droppable Time Slot
function DroppableSlot({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative ${isOver ? 'bg-blue-500/10' : ''}`}
      style={{ minHeight: '72px' }}
    >
      {children}
    </div>
  );
}

export function TimeGrid({
  weekDays,
  timeSlots,
  tasks,
  events,
  onTaskClick,
  onEventClick,
  onTimeSlotClick,
  onTaskDrop,
}: TimeGridProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !onTaskDrop) return;
    
    const taskData = active.data.current?.task as ScheduledTask;
    const slotId = over.id as string; // format: "slot-YYYY-MM-DD-HH:MM"
    
    const [_, date, time] = slotId.split('-');
    const fullDate = `${date}`;
    
    if (taskData && fullDate && time) {
      onTaskDrop(taskData.id, fullDate, time);
    }
  };
  const getTasksForDayAndTime = (date: Date, time: string) => {
    const dateStr = formatDate(date);
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = formatDate(prevDate);
    const timeMinutes = parseTimeToMinutes(time);
    
    return tasks.filter(task => {
      // Check if task is on this day
      if (task.date === dateStr) {
        const taskStart = parseTimeToMinutes(task.start_time);
        const taskEnd = parseTimeToMinutes(task.end_time);
        
        // Task spans to next day if end < start
        if (taskEnd < taskStart) {
          return timeMinutes >= taskStart; // Only show up to midnight
        }
        return timeMinutes >= taskStart && timeMinutes < taskEnd;
      }
      
      // Check if task from previous day spans into this day
      if (task.date === prevDateStr) {
        const taskStart = parseTimeToMinutes(task.start_time);
        const taskEnd = parseTimeToMinutes(task.end_time);
        
        // If end < start, task spans to next day (this day)
        if (taskEnd < taskStart) {
          return timeMinutes < taskEnd; // Show from midnight to end time
        }
      }
      
      return false;
    });
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const getTaskHeight = (task: ScheduledTask, date: Date) => {
    const dateStr = formatDate(date);
    const start = parseTimeToMinutes(task.start_time);
    const end = parseTimeToMinutes(task.end_time);
    
    // Task spans to next day
    if (end < start) {
      if (task.date === dateStr) {
        // First day: from start to midnight (24:00 = 1440 minutes)
        const duration = 1440 - start;
        return (duration / 30) * 72;
      } else {
        // Next day: from midnight to end
        const duration = end;
        return (duration / 30) * 72;
      }
    }
    
    const duration = end - start;
    // Each 30-min slot is ~72px
    return (duration / 30) * 72;
  };

  const getTaskTop = (task: ScheduledTask, firstSlotTime: string, date: Date) => {
    const dateStr = formatDate(date);
    const start = parseTimeToMinutes(task.start_time);
    const end = parseTimeToMinutes(task.end_time);
    const slotStart = parseTimeToMinutes(firstSlotTime);
    
    // If task spans to next day and we're showing the next day portion
    if (end < start && task.date !== dateStr) {
      // Next day portion starts at 00:00
      const offset = 0 - slotStart;
      return Math.max(0, (offset / 30) * 72);
    }
    
    const offset = start - slotStart;
    // Calculate exact pixel position based on minutes offset
    return Math.max(0, (offset / 30) * 72);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
              const slotId = `slot-${dateStr}-${time}`;
              
              return (
                <DroppableSlot key={dayIndex} id={slotId}>
                  <div
                    className="hover:bg-accent/[0.03] cursor-pointer transition-colors relative group h-full"
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

                  {/* Show tasks that start in or before this time slot (but only render once) */}
                  {dayTasks.map((task) => {
                    const taskStart = parseTimeToMinutes(task.start_time);
                    const taskEnd = parseTimeToMinutes(task.end_time);
                    const spansNextDay = taskEnd < taskStart;
                    
                    // Find which slot should render this task (earliest slot it appears in)
                    const firstSlot = timeSlots.find((slot) => {
                      const slotMinutes = parseTimeToMinutes(slot);
                      if (task.date === dateStr) {
                        // Task on this day: show in first slot that task appears in
                        return taskStart < slotMinutes + 30 && taskStart >= slotMinutes;
                      } else if (spansNextDay && task.date !== dateStr && slot === '00:00') {
                        // Next-day portion of spanning task
                        return true;
                      }
                      return false;
                    });
                    
                    // Only render in the first slot where this task appears
                    if (firstSlot !== time) return null;
                    
                    return (
                      <div
                        key={task.id}
                        className="absolute left-3 right-3 z-20"
                        style={{
                          height: `${getTaskHeight(task, day)}px`,
                          top: `${getTaskTop(task, time, day)}px`,
                        }}
                      >
                        <DraggableTask task={task} onClick={() => onTaskClick?.(task)}>
                          <TaskCard task={task} />
                        </DraggableTask>
                      </div>
                    );
                  })}
                  </div>
                </DroppableSlot>
              );
            })}
          </div>
        ))}
        </div>
      </div>
    </DndContext>
  );
}


