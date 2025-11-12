import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

export function PomodoroTimer() {
  // Load from localStorage or use defaults
  const [workDuration, setWorkDuration] = useState(() => {
    const saved = localStorage.getItem('pomodoro_work');
    return saved ? parseInt(saved) : 25;
  });
  const [breakDuration, setBreakDuration] = useState(() => {
    const saved = localStorage.getItem('pomodoro_break');
    return saved ? parseInt(saved) : 5;
  });
  const [minutes, setMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoro_minutes');
    return saved ? parseInt(saved) : workDuration;
  });
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem('pomodoro_seconds');
    return saved ? parseInt(saved) : 0;
  });
  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem('pomodoro_active');
    return saved === 'true';
  });
  const [mode, setMode] = useState<'work' | 'break'>(() => {
    const saved = localStorage.getItem('pomodoro_mode');
    return (saved as 'work' | 'break') || 'work';
  });
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pomodoro_work', workDuration.toString());
    localStorage.setItem('pomodoro_break', breakDuration.toString());
    localStorage.setItem('pomodoro_minutes', minutes.toString());
    localStorage.setItem('pomodoro_seconds', seconds.toString());
    localStorage.setItem('pomodoro_active', isActive.toString());
    localStorage.setItem('pomodoro_mode', mode);
  }, [workDuration, breakDuration, minutes, seconds, isActive, mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            setIsActive(false);
            playBetterSound();
            // Show notification
            if (Notification.permission === 'granted') {
              new Notification(mode === 'work' ? 'Work session complete!' : 'Break complete!', {
                body: mode === 'work' ? 'Time for a break!' : 'Time to get back to work!',
                icon: '/vite.svg',
              });
            }
            if (mode === 'work') {
              setMode('break');
              setMinutes(breakDuration);
            } else {
              setMode('work');
              setMinutes(workDuration);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds, mode, workDuration, breakDuration]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playBetterSound = () => {
    // Create AudioContext if it doesn't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    // Create a pleasant bell-like tone
    const now = ctx.currentTime;
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Two frequencies for a pleasant bell sound
    oscillator1.frequency.value = 800;
    oscillator2.frequency.value = 1000;
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 1.5);
    oscillator2.stop(now + 1.5);
    
    // Repeat the sound 3 times
    setTimeout(() => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.frequency.value = 800;
      osc2.frequency.value = 1000;
      osc1.type = 'sine';
      osc2.type = 'sine';
      const time = ctx.currentTime;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);
      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 1.5);
      osc2.stop(time + 1.5);
    }, 500);
    
    setTimeout(() => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.frequency.value = 800;
      osc2.frequency.value = 1000;
      osc1.type = 'sine';
      osc2.type = 'sine';
      const time = ctx.currentTime;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);
      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 1.5);
      osc2.stop(time + 1.5);
    }, 1000);
  };

  const toggle = () => setIsActive(!isActive);

  const reset = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? workDuration : breakDuration);
    setSeconds(0);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === 'work' ? workDuration : breakDuration);
    setSeconds(0);
  };

  const saveSettings = (work: number, breakTime: number) => {
    setWorkDuration(work);
    setBreakDuration(breakTime);
    if (!isActive) {
      setMinutes(mode === 'work' ? work : breakTime);
      setSeconds(0);
    }
    setShowSettings(false);
  };

  const formatTime = () => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progress = mode === 'work' 
    ? ((workDuration * 60 - (minutes * 60 + seconds)) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - (minutes * 60 + seconds)) / (breakDuration * 60)) * 100;

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
      {/* Mode Selector */}
      <div className="flex border-b border-border/40 bg-muted/30">
        <button
          onClick={() => switchMode('work')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
            mode === 'work'
              ? 'bg-card border-b-2 border-purple-500 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
            mode === 'break'
              ? 'bg-card border-b-2 border-green-500 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Break
        </button>
      </div>

      {/* Timer Display */}
      <div className="p-12">
        <div className="relative">
          <div className="text-8xl font-bold text-center tabular-nums py-12">
            {formatTime()}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                mode === 'work' ? 'bg-purple-500' : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-12 pb-12">
        <div className="flex gap-3">
          <Button
            onClick={toggle}
            className="flex-1 h-14 text-base"
            variant={isActive ? 'secondary' : 'default'}
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button onClick={reset} variant="outline" size="icon" className="h-14 w-14">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button onClick={() => setShowSettings(true)} variant="outline" size="icon" className="h-14 w-14">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal 
        workDuration={workDuration}
        breakDuration={breakDuration}
        onSave={saveSettings}
        onClose={() => setShowSettings(false)}
      />}
    </div>
  );
}

function SettingsModal({ 
  workDuration, 
  breakDuration, 
  onSave, 
  onClose 
}: { 
  workDuration: number; 
  breakDuration: number; 
  onSave: (work: number, breakTime: number) => void;
  onClose: () => void;
}) {
  const [work, setWork] = useState(workDuration);
  const [breakTime, setBreakTime] = useState(breakDuration);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border/40 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-6">Timer Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">Work Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={work}
              onChange={(e) => setWork(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Break Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={() => onSave(work, breakTime)} className="flex-1">
            Save
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
