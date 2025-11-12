import { generateTimeSlots, getWeekStart, getDayName } from '@/lib/dateUtils';
import type { ScheduledTask, Event } from '@/lib/api';
import { TimeGrid } from './TimeGrid';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface WeekViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  tasks: ScheduledTask[];
  events: Event[];
  onTaskClick?: (task: ScheduledTask) => void;
  onEventClick?: (event: Event) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
}

export function WeekView({
  currentDate,
  onDateChange,
  tasks,
  events,
  onTaskClick,
  onEventClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const timeSlots = generateTimeSlots(0, 24, 30);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center text-sm font-medium">
            {formatWeekRange()}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} className="h-8">
          Today
        </Button>
      </div>

      {/* Calendar Card */}
      <div className="border border-border/40 rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-border/40">
          <div className="w-20" /> {/* Time column */}
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={index}
                className={`px-3 py-5 text-center ${isToday ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
              >
                <div className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium mb-1.5">
                  {getDayName(day.getDay()).slice(0, 3)}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <TimeGrid
          weekDays={weekDays}
          timeSlots={timeSlots}
          tasks={tasks}
          events={events}
          onTaskClick={onTaskClick}
          onEventClick={onEventClick}
          onTimeSlotClick={onTimeSlotClick}
        />
      </div>
    </div>
  );
}


