import { useEffect } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import { useWakeLock } from '@/hooks/useWakeLock';

interface FocusTimerProps {
  onComplete: () => void;
}

export default function FocusTimer({ onComplete }: FocusTimerProps) {
  const { isRunning, remainingSeconds, totalSeconds, pause, resume, reset, tick } =
    useTimerStore();

  useWakeLock(isRunning);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  useEffect(() => {
    if (isRunning && remainingSeconds <= 0) {
      reset();
      onComplete();
    }
  }, [remainingSeconds, isRunning, reset, onComplete]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = 1 - remainingSeconds / totalSeconds;

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
      {/* Ring progress */}
      <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
          className="text-slate-800" strokeWidth="6" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
          className="text-emerald-400 transition-all duration-1000"
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`} />
      </svg>

      {/* Timer digits */}
      <p className="text-5xl font-mono font-bold tracking-widest tabular-nums">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>

      {/* Controls */}
      <div className="flex gap-3">
        {isRunning ? (
          <button onClick={pause} className="btn rounded-full !bg-amber-700 !text-amber-100 hover:!bg-amber-600 !border-amber-700">
            暂停
          </button>
        ) : remainingSeconds < totalSeconds ? (
          <button onClick={resume} className="btn btn-primary rounded-full">
            继续
          </button>
        ) : null}
        <button onClick={reset} className="btn btn-secondary rounded-full">
          结束
        </button>
      </div>
    </div>
  );
}
