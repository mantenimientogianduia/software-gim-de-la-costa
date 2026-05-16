'use client';

import { useState } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { formatMs } from '@/lib/utils/time';
import { Play, Pause, RotateCcw, BellRing, ChevronUp, ChevronDown, Music2 } from 'lucide-react';
import { CircularProgress, ControlButton } from './Shared';
import { motion, AnimatePresence } from 'motion/react';
import { AlarmType, defaultAudioService } from '@/services/AudioService';

export function CountdownView() {
  const [setupMode, setSetupMode] = useState(true);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [alarmType, setAlarmType] = useState<AlarmType>(defaultAudioService.getAlarmType());

  const totalRequestedMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  
  const { timeLeftMs, isRunning, isFinished, totalTimeMs, start, pause, reset, setTime } = useCountdown(totalRequestedMs);

  const handleStart = () => {
    if (totalRequestedMs === 0) return;
    defaultAudioService.unlock();
    defaultAudioService.setAlarmType(alarmType);
    setTime(totalRequestedMs);
    setSetupMode(false);
    start();
  };

  const handleTestAlarm = (type: AlarmType) => {
    defaultAudioService.unlock();
    defaultAudioService.setAlarmType(type);
    defaultAudioService.playFinish();
    // Restore after delay or just leave it set if we're in setup
    setAlarmType(type);
  };

  const handleReset = () => {
    defaultAudioService.stopAll();
    reset();
    setSetupMode(true);
  };

  const getProgress = () => {
    if (totalTimeMs === 0) return 0;
    return timeLeftMs / totalTimeMs;
  };

  if (setupMode) {
    return (
      <div className="flex flex-col gap-8 max-w-sm mx-auto py-8">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/60 text-center">Set Timer</h3>
        
        <div className="flex justify-center items-center gap-4">
          <TimeAdjuster label="H" value={hours} onChange={setHours} max={23} />
          <span className="text-2xl font-mono text-white/20">:</span>
          <TimeAdjuster label="M" value={minutes} onChange={setMinutes} max={59} />
          <span className="text-2xl font-mono text-white/20">:</span>
          <TimeAdjuster label="S" value={seconds} onChange={setSeconds} max={59} />
        </div>

        <div className="flex flex-col gap-3">
          <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
            <Music2 size={12} />
            Alarm Sound
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.values(AlarmType) as AlarmType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleTestAlarm(type)}
                className={`
                  py-2 px-1 rounded-md border font-mono text-[10px] uppercase transition-all
                  ${alarmType === type 
                    ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'}
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleStart}
          disabled={totalRequestedMs === 0}
          className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono uppercase tracking-[0.2em] py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Play size={18} />
          Start Timer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <AnimatePresence mode="wait">
        {isFinished ? (
          <motion.div 
            key="alarm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.1, 1],
              transition: { repeat: Infinity, duration: 1 } 
            }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-40 h-40 rounded-full bg-red-600/20 border-4 border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
              <BellRing size={80} className="animate-bounce" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-mono text-white tracking-widest">TIME'S UP!</h2>
              <button 
                onClick={handleReset}
                className="mt-6 font-mono text-xs text-red-400 hover:text-red-300 uppercase tracking-widest underline underline-offset-4"
              >
                Dismiss Alarm
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <CircularProgress progress={getProgress()} color="stroke-orange-500">
              <div className="text-center">
                <div className="text-6xl font-mono tracking-tighter tabular-nums text-white">
                  {formatMs(timeLeftMs)}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 font-mono">
                  Counting Down
                </div>
              </div>
            </CircularProgress>

            <div className="flex gap-4">
              <ControlButton onClick={handleReset} icon={RotateCcw} variant="secondary" label="Reset" />
              {isRunning ? (
                <ControlButton onClick={pause} icon={Pause} variant="danger" label="Pause" />
              ) : (
                <ControlButton onClick={start} icon={Play} variant="primary" label="Resume" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimeAdjuster({ label, value, onChange, max }: { label: string, value: number, onChange: (v: number) => void, max: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button onClick={() => onChange(value < max ? value + 1 : 0)} className="text-white/20 hover:text-white transition-colors">
        <ChevronUp size={24} />
      </button>
      <div className="bg-white/5 border border-white/10 rounded-lg w-16 h-20 flex flex-col items-center justify-center">
        <span className="text-3xl font-mono text-white leading-none">{value.toString().padStart(2, '0')}</span>
        <span className="text-[8px] font-mono text-white/20 absolute -bottom-4">{label}</span>
      </div>
      <button onClick={() => onChange(value > 0 ? value - 1 : max)} className="text-white/20 hover:text-white transition-colors">
        <ChevronDown size={24} />
      </button>
    </div>
  );
}
