import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { WeekView } from './components/WeekView';
import { AddTaskDialog } from './components/AddTaskDialog';
import { AddEventDialog } from './components/AddEventDialog';
import { ReflectionDialog } from './components/ReflectionDialog';
import { TemplateManager } from './components/TemplateManager';
import { PomodoroTimer } from './components/PomodoroTimer';
import { WeeklyGoals } from './components/WeeklyGoals';
import { PulseNotes } from './components/PulseNotes';
import { Login } from './components/Login';
import { BlogPost } from './components/BlogPost';
import { BlogManager } from './components/BlogManager';
import { Button } from './components/ui/button';
import type { ScheduledTask, Event, PulseNote } from './lib/api';
import {
  getScheduledTasks,
  getEvents,
  createScheduledTask,
  createEvent,
  updateScheduledTask,
  updateEvent,
  deleteScheduledTask,
  deleteEvent,
  getPulseNotes,
  createPulseNote,
  deletePulseNote,
  login,
  verifyAuth,
} from './lib/api';
import { formatDate, getWeekStart, getWeekEnd } from './lib/dateUtils';
import { Plus, Sparkles, FileText, LogOut } from 'lucide-react';

type DialogType = 'task' | 'event' | 'reflection' | 'event-reflection' | 'template' | null;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [pulseNotes, setPulseNotes] = useState<PulseNote[]>([]);
  const [loginError, setLoginError] = useState('');

  // Check if already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await verifyAuth();
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadWeekData();
      loadPulseNotes();
    }
  }, [currentDate, isAuthenticated]);

  const loadPulseNotes = async () => {
    const notes = await getPulseNotes();
    setPulseNotes(notes);
  };

  const loadWeekData = async () => {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = getWeekEnd(currentDate);
    
    const [tasksData, eventsData] = await Promise.all([
      getScheduledTasks(formatDate(weekStart), formatDate(weekEnd)),
      getEvents(formatDate(weekStart), formatDate(weekEnd)),
    ]);

    setTasks(tasksData);
    setEvents(eventsData);
  };

  const handleTimeSlotClick = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setActiveDialog('task');
  };

  const handleTaskClick = async (task: ScheduledTask) => {
    setSelectedTask(task);
    setActiveDialog('reflection');
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setActiveDialog('event-reflection');
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(selectedEvent.id);
      await loadWeekData();
      setActiveDialog(null);
      setSelectedEvent(undefined);
    }
  };

  const handleAddTask = async (taskData: any) => {
    await createScheduledTask(taskData);
    await loadWeekData();
  };

  const handleAddEvent = async (eventData: any) => {
    await createEvent(eventData);
    await loadWeekData();
  };

  const handleSaveReflection = async (reflectionData: any) => {
    if (selectedTask) {
      await updateScheduledTask(selectedTask.id, reflectionData);
      await loadWeekData();
    }
    setSelectedTask(undefined);
  };

  const handleDeleteTask = async () => {
    if (selectedTask && confirm('Are you sure you want to delete this task?')) {
      await deleteScheduledTask(selectedTask.id);
      await loadWeekData();
      setActiveDialog(null);
      setSelectedTask(undefined);
    }
  };

  const handleTemplateApplied = async () => {
    await loadWeekData();
  };

  const handleCreatePulseNote = async (content: string) => {
    await createPulseNote(content);
    await loadPulseNotes();
  };

  const handleDeletePulseNote = async (id: number) => {
    await deletePulseNote(id);
    await loadPulseNotes();
  };

  const handleLogin = async (password: string) => {
    try {
      console.log('Attempting login...');
      const response = await login(password);
      console.log('Login response:', response);
      localStorage.setItem('auth_token', response.token);
      setIsAuthenticated(true);
      setLoginError('');
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Incorrect password');
      setTimeout(() => setLoginError(''), 5000);
    }
  };

  const [currentPage, setCurrentPage] = useState<'calendar' | 'goals' | 'notes' | 'focus' | 'blog'>('calendar');

  // Show loading or login screen if not authenticated
  if (isCheckingAuth) {
    return null; // or a loading spinner
  }

  return (
    <Routes>
      {/* Public blog post route */}
      <Route path="/blog/:id" element={<BlogPost />} />
      
      {/* Main app route */}
      <Route path="*" element={
        !isAuthenticated ? (
          <Login onLogin={handleLogin} error={loginError} />
        ) : (
          <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b border-border/20 bg-background sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant={currentPage === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('calendar')}
                className="h-8 px-3"
              >
                Calendar
              </Button>
              <Button
                variant={currentPage === 'goals' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('goals')}
                className="h-8 px-3"
              >
                Goals
              </Button>
              <Button
                variant={currentPage === 'notes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('notes')}
                className="h-8 px-3"
              >
                Notes
              </Button>
              <Button
                variant={currentPage === 'focus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('focus')}
                className="h-8 px-3"
              >
                Focus
              </Button>
              <Button
                variant={currentPage === 'blog' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage('blog')}
                className="h-8 px-3"
              >
                Blog
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('auth_token');
                setIsAuthenticated(false);
              }}
              className="h-8 px-3 text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      {currentPage === 'calendar' && (
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Weekly Schedule</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Plan and track your week
            </p>
          </div>
          <div className="flex gap-6">
            {/* Calendar */}
            <div className="flex-1 min-w-0">
              <WeekView
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                tasks={tasks}
                events={events}
                onTaskClick={handleTaskClick}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </div>

            {/* Sidebar Actions */}
            <div className="flex flex-col gap-3 w-[180px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveDialog('template')}
                className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Templates</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(formatDate(new Date()));
                  setActiveDialog('event');
                }}
                className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 justify-start"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Add Event</span>
              </Button>
              
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDate(formatDate(new Date()));
                  setSelectedTime('09:00');
                  setActiveDialog('task');
                }}
                className="h-9 px-3 bg-foreground text-background hover:bg-foreground/90 shadow-sm justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold">Add Task</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'goals' && (
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          <WeeklyGoals />
        </div>
      )}

      {currentPage === 'notes' && (
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Notes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              All your thoughts and reflections in one place
            </p>
          </div>
          <PulseNotes
            notes={pulseNotes}
            tasks={tasks}
            onSave={handleCreatePulseNote}
            onDelete={handleDeletePulseNote}
            onTaskClick={handleTaskClick}
          />
        </div>
      )}

      {currentPage === 'focus' && (
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Focus Timer</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Stay productive with the Pomodoro technique
            </p>
          </div>
          <PomodoroTimer />
        </div>
      )}

      {currentPage === 'blog' && (
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          <BlogManager />
        </div>
      )}

      {/* Dialogs */}
      <AddTaskDialog
        isOpen={activeDialog === 'task'}
        onClose={() => setActiveDialog(null)}
        onSubmit={handleAddTask}
        initialDate={selectedDate}
        initialTime={selectedTime}
      />

      <AddEventDialog
        isOpen={activeDialog === 'event'}
        onClose={() => setActiveDialog(null)}
        onSubmit={handleAddEvent}
        initialDate={selectedDate}
      />

      <ReflectionDialog
        isOpen={activeDialog === 'reflection'}
        onClose={() => {
          setActiveDialog(null);
          setSelectedTask(undefined);
        }}
        onSubmit={handleSaveReflection}
        onDelete={handleDeleteTask}
        task={selectedTask}
      />

      {/* Event Status Dialog */}
      {selectedEvent && activeDialog === 'event-reflection' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border/40 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selectedEvent.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedEvent.description || 'No description'}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    await updateEvent(selectedEvent.id, {
                      completed: true,
                      completed_at: new Date().toISOString(),
                    });
                    await loadWeekData();
                    setActiveDialog(null);
                    setSelectedEvent(undefined);
                  }}
                  className="flex-1"
                  variant={selectedEvent.completed ? 'default' : 'outline'}
                >
                  ✓ Complete
                </Button>
                <Button
                  onClick={async () => {
                    await updateEvent(selectedEvent.id, {
                      completed: false,
                      completed_at: undefined,
                    });
                    await loadWeekData();
                    setActiveDialog(null);
                    setSelectedEvent(undefined);
                  }}
                  className="flex-1"
                  variant="outline"
                >
                  Pending
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteEvent}
                  variant="destructive"
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    setActiveDialog(null);
                    setSelectedEvent(undefined);
                  }}
                  variant="ghost"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TemplateManager
        isOpen={activeDialog === 'template'}
        onClose={() => setActiveDialog(null)}
        currentWeekStart={getWeekStart(currentDate)}
        onTemplateApplied={handleTemplateApplied}
      />
    </div>
        )
      } />
    </Routes>
  );
}

export default App;
