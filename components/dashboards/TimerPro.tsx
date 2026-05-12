'use client'

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2, 
  Flame,
  Volume2,
  Clock
} from 'lucide-react';
import { Card, Button } from '@/components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Preset {
  id: string;
  name: string;
  workTime: number;
  restTime: number;
  rounds: number;
  mode: 'tabata' | 'hiit';
}

const presets: Preset[] = [
  { id: '1', name: 'Tabata Brutal', workTime: 20, restTime: 10, rounds: 8, mode: 'tabata' },
  { id: '2', name: 'Elite HIIT', workTime: 40, restTime: 20, rounds: 5, mode: 'hiit' },
  { id: '3', name: 'Combat Ready', workTime: 60, restTime: 30, rounds: 10, mode: 'hiit' },
];

export function TimerPro() {
  const [activePreset, setActivePreset] = useState<Preset>(presets[0]);
  const [timeLeft, setTimeLeft] = useState(activePreset.workTime * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 10));
      }, 10);
    } else if (timeLeft === 0 && isRunning) {
      if (isResting) {
        setIsResting(false);
        if (currentRound < activePreset.rounds) {
          setCurrentRound((prev) => prev + 1);
          setTimeLeft(activePreset.workTime * 1000);
        } else {
          setIsRunning(false);
        }
      } else if (activePreset.restTime > 0) {
        setIsResting(true);
        setTimeLeft(activePreset.restTime * 1000);
      } else {
        if (currentRound < activePreset.rounds) {
          setCurrentRound((prev) => prev + 1);
          setTimeLeft(activePreset.workTime * 1000);
        } else {
          setIsRunning(false);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isResting, currentRound, activePreset]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setIsResting(false);
    setCurrentRound(1);
    setTimeLeft(activePreset.workTime * 1000);
  };

  const selectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setIsRunning(false);
    setIsResting(false);
    setCurrentRound(1);
    setTimeLeft(preset.workTime * 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <Card className={cn(
          "aspect-video lg:aspect-auto lg:h-[550px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 border-zinc-900 group",
          isResting ? "bg-zinc-900" : (isRunning ? "bg-zinc-950" : "bg-black")
        )}>
          {isRunning && (
            <div className="absolute inset-0 pointer-events-none">
               <div className={cn(
                 "absolute inset-0 opacity-20 transition-colors duration-1000",
                 isResting ? "bg-green-500" : "bg-brand-orange"
               )} />
            </div>
          )}

          <div className="relative z-10 text-center">
            <motion.div
              key={isResting ? 'rest' : 'work'}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] mb-6 inline-block border border-zinc-800 backdrop-blur-md",
                isResting ? "text-green-400 border-green-500/30 bg-green-500/5" : "text-brand-orange border-brand-orange/30 bg-brand-orange/5"
              )}
            >
              {isResting ? 'DEEP BREATH / REST' : `COMBAT ROUND ${currentRound} / ${activePreset.rounds}`}
            </motion.div>

            <motion.div
              key={timeLeft}
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              className={cn(
                "text-[100px] sm:text-[180px] font-display font-bold leading-none tracking-tighter tabular-nums drop-shadow-[0_0_50px_rgba(255,92,0,0.1)]",
                isResting ? "text-green-400" : "text-white"
              )}
            >
              {formatTime(timeLeft)}
            </motion.div>

            <div className="flex items-center justify-center gap-8 mt-12">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white"
                 onClick={resetTimer}
               >
                 <RotateCcw className="w-8 h-8" />
               </Button>
               <Button 
                  className={cn(
                    "w-32 h-32 rounded-full shadow-[0_0_40px_rgba(255,92,0,0.2)] transition-all duration-500 transform hover:scale-105 active:scale-95 group/play",
                    isRunning ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-brand-orange hover:bg-brand-orange-hover text-white"
                  )}
                  onClick={isRunning ? pauseTimer : startTimer}
               >
                  {isRunning ? (
                    <Pause className="w-12 h-12 fill-current" />
                  ) : (
                    <Play className="w-12 h-12 fill-current ml-2 animate-pulse" />
                  )}
               </Button>
               <Button 
                variant="ghost" 
                size="icon" 
                className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white"
              >
                 <Volume2 className="w-8 h-8" />
               </Button>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 flex gap-12">
            <div className="text-left">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Work</p>
              <p className="text-zinc-200 font-bold text-xl">{activePreset?.workTime || 0}s</p>
            </div>
            <div className="text-left border-l border-zinc-900 pl-8">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Rest</p>
              <p className="text-zinc-200 font-bold text-xl">{activePreset?.restTime || 0}s</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <h3 className="font-display font-bold text-xl uppercase tracking-[0.2em] px-2 text-zinc-500">Presets Pro</h3>
        <div className="space-y-5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset)}
              className={cn(
                "w-full p-6 rounded-[32px] border transition-all duration-500 text-left group relative overflow-hidden",
                activePreset?.id === preset.id 
                  ? "bg-zinc-950 border-brand-orange shadow-[0_0_20px_rgba(255,92,0,0.1)]" 
                  : "bg-black border-zinc-900 hover:border-zinc-700"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                 <div className={cn(
                   "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                   preset.mode === 'tabata' ? "bg-brand-orange/5 text-brand-orange border-brand-orange/20" : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                 )}>
                   {preset.mode}
                 </div>
                 <Settings2 className={cn(
                   "w-5 h-5 transition-transform group-hover:translate-x-1",
                   activePreset?.id === preset.id ? "text-brand-orange" : "text-zinc-800"
                 )} />
              </div>
              <p className="font-bold text-zinc-100 text-lg mb-2">{preset.name}</p>
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {preset.workTime}s work</span>
                <span className="flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> {preset.rounds} rounds</span>
              </div>
            </button>
          ))}
          <Button variant="outline" className="w-full border-dashed py-10 border-2 border-zinc-900 text-zinc-600 hover:text-brand-orange hover:bg-brand-orange/5 hover:border-brand-orange/50 transition-all">
            + Custom Engine
          </Button>
        </div>
      </div>
    </div>
  );
}
