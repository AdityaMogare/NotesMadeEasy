import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer } from 'lucide-react';
import { formatTime, POMODORO_MODES, TIMER_DURATIONS } from '../lib/utils';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[POMODORO_MODES.POMODORO]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState(POMODORO_MODES.POMODORO);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(intervalRef.current);
            setIsRunning(false);
            
            // Play notification sound
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Pomodoro Timer', {
                body: `${currentMode === POMODORO_MODES.POMODORO ? 'Work session' : 'Break'} completed!`,
                icon: '/vite.svg'
              });
            }
            
            // Increment completed pomodoros
            if (currentMode === POMODORO_MODES.POMODORO) {
              setCompletedPomodoros(prev => prev + 1);
            }
            
            return TIMER_DURATIONS[currentMode];
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, currentMode]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[currentMode]);
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const getModeIcon = (mode) => {
    switch (mode) {
      case POMODORO_MODES.POMODORO:
        return <Timer className="w-5 h-5" />;
      case POMODORO_MODES.SHORT_BREAK:
      case POMODORO_MODES.LONG_BREAK:
        return <Coffee className="w-5 h-5" />;
      default:
        return <Timer className="w-5 h-5" />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case POMODORO_MODES.POMODORO:
        return 'bg-red-500 hover:bg-red-600';
      case POMODORO_MODES.SHORT_BREAK:
        return 'bg-green-500 hover:bg-green-600';
      case POMODORO_MODES.LONG_BREAK:
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
          {getModeIcon(currentMode)}
          Pomodoro Timer
        </h2>
        
        {/* Mode Selection */}
        <div className="flex gap-2 mb-6">
          {Object.values(POMODORO_MODES).map((mode) => (
            <button
              key={mode}
              onClick={() => switchMode(mode)}
              className={`btn btn-sm ${currentMode === mode ? getModeColor(mode) : 'btn-outline'}`}
            >
              {getModeIcon(mode)}
              {mode === POMODORO_MODES.POMODORO && 'Work'}
              {mode === POMODORO_MODES.SHORT_BREAK && 'Short Break'}
              {mode === POMODORO_MODES.LONG_BREAK && 'Long Break'}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="text-6xl font-mono font-bold text-primary mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-500">
            {currentMode === POMODORO_MODES.POMODORO ? 'Focus Time' : 'Break Time'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-4">
          {!isRunning ? (
            <button onClick={startTimer} className="btn btn-primary btn-lg">
              <Play className="w-5 h-5" />
              Start
            </button>
          ) : (
            <button onClick={pauseTimer} className="btn btn-secondary btn-lg">
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}
          
          <button onClick={resetTimer} className="btn btn-outline btn-lg">
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">
            Completed Pomodoros: {completedPomodoros}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((TIMER_DURATIONS[currentMode] - timeLeft) / TIMER_DURATIONS[currentMode]) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer; 