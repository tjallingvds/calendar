import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            setIsActive(false);
            playSound();
            if (mode === 'work') {
              setMode('break');
              setMinutes(5);
            } else {
              setMode('work');
              setMinutes(25);
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
  }, [isActive, minutes, seconds, mode]);

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBy/LTgjMGHm7A7+OZTA0PVanm77BdGAg+ltryxnMkBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBSh4yO/hjkQLEFm07O2hURELTKXh8bllHAU2jdXwzn0pBQ==');
    audio.play().catch(() => {});
  };

  const toggle = () => setIsActive(!isActive);

  const reset = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  const formatTime = () => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progress = mode === 'work' 
    ? ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100
    : ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100;

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
        </div>
      </div>
    </div>
  );
}

