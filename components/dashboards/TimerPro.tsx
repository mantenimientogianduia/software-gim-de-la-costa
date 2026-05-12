'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2, 
  ChevronRight,
  Flame,
  Volume2
} from 'lucide-react';
import { Card, Button } from '@/components/ui/Base';
import { useGym } from '@/hooks/useGym.hooks';
import { TimerPreset } from '@/services/TimerService';
import { cn } from '@/lib/utils';

export const TimerPro = () => {
  const { presets, timerService } = useGym();
  const [activePreset, setActivePreset] = useState<TimerPreset | null>(null);
  const [timeLeft, setTimeLeft] = useState(0); // in ms
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [isResting, setIsResting] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    if (activePreset) {
      setTimeLeft(activePreset.workTime * 1000);
      setCurrentRound(1);
      setIsResting(false);
    } else {
      setTimeLeft(0);
    }
  }, [activePreset, pauseTimer]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 10));
      }, 10);
    } else if (timeLeft === 0 && isRunning) {
      // Round logic
      if (activePreset && activePreset.mode === 'tabata' || activePreset?.mode === 'hiit') {
        if (!isResting && activePreset.restTime > 0) {
          setIsResting(true);
          setTimeLeft(activePreset.restTime * 1000);
        } else {
          if (currentRound < activePreset.rounds) {
            setIsResting(false);
            setCurrentRound(prev => prev + 1);
            setTimeLeft(activePreset.workTime * 1000);
          } else {
            setIsRunning(false);
          }
        }
      } else {
        setIsRunning(false);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, activePreset, isResting, currentRound]);

  const handleSelectPreset = (preset: TimerPreset) => {
    setActivePreset(preset);
    setTimeLeft(preset.workTime * 1000);
    setCurrentRound(1);
    setIsResting(false);
    setIsRunning(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        <Card className={cn(
          "aspect-video lg:aspect-auto lg:h-[500px] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-700",
          isResting ? "bg-green-500" : (isRunning ? "bg-black" : "bg-zinc-100")
        )}>
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-white rounded-full" />
          </div>

          <div className="relative z-10 text-center">
            {activePreset && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-block shadow-lg",
                  isResting ? "bg-white text-green-600" : "bg-white/10 text-white/50"
                )}
              >
                {isResting ? 'DESCANSO' : `RONDA ${currentRound} / ${activePreset.rounds}`}
              </motion.div>
            )}

            <motion.h2 
              key={timeLeft}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={cn(
                "text-[100px] sm:text-[140px] font-display font-bold leading-none tracking-tight tabular-nums",
                isResting || isRunning ? "text-white" : "text-zinc-600"
              )}
            >
              {timerService.formatTime(timeLeft)}
            </motion.h2>

            <div className="flex items-center justify-center gap-6 mt-12">
               <Button 
                 variant="secondary" 
                 size="icon" 
                 className="w-14 h-14 rounded-full bg-white/20 border-white/20 text-white hover:bg-white/30 backdrop-blur-md"
                 onClick={resetTimer}
               >
                 <RotateCcw className="w-6 h-6" />
               </Button>
               <Button 
                  className={cn(
                    "w-24 h-24 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105",
                    isRunning ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white text-black hover:bg-zinc-100"
                  )}
                  onClick={isRunning ? pauseTimer : startTimer}
               >
                  {isRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
               </Button>
               <Button 
                variant="secondary" 
                size="icon" 
                className="w-14 h-14 rounded-full bg-white/20 border-white/20 text-white hover:bg-white/30 backdrop-blur-md"
              >
                 <Volume2 className="w-6 h-6" />
               </Button>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-12">
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Trabajo</p>
              <p className="text-white font-bold">{activePreset?.workTime || 0}s</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Descanso</p>
              <p className="text-white font-bold">{activePreset?.restTime || 0}s</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Rondas</p>
              <p className="text-white font-bold">{activePreset?.rounds || 0}</p>
            </div>
          </div>
        </Card>

        {activePreset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
             <div className="flex-1 p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                   <Flame className="text-white w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-orange-600 uppercase">Gasto Estimado</p>
                   <p className="text-xl font-bold">~120 kcal</p>
                </div>
             </div>
             <div className="flex-1 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                   <Settings2 className="text-white w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-blue-600 uppercase">Intensidad</p>
                   <p className="text-xl font-bold">Alta (HIIT)</p>
                </div>
             </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="font-display font-bold text-xl px-2">Presets Rápidos</h3>
        <div className="space-y-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                "w-full p-5 rounded-[24px] border transition-all duration-300 text-left group",
                activePreset?.id === preset.id 
                  ? "bg-white border-black ring-2 ring-black ring-offset-2" 
                  : "bg-white border-zinc-100 hover:border-zinc-300"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                 <div className={cn(
                   "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                   preset.mode === 'tabata' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                 )}>
                   {preset.mode}
                 </div>
                 <ChevronRight className={cn(
                   "w-4 h-4 transition-transform group-hover:translate-x-1",
                   activePreset?.id === preset.id ? "text-black" : "text-zinc-300"
                 )} />
              </div>
              <p className="font-bold text-zinc-900 mb-1">{preset.name}</p>
              <div className="flex gap-4 text-xs font-medium text-zinc-400">
                <span>{preset.workTime}s work</span>
                <span>{preset.restTime}s rest</span>
              </div>
            </button>
          ))}
          
          <Button variant="outline" className="w-full border-dashed py-8 border-2 text-zinc-400 hover:text-black">
            + Custom Preset
          </Button>
        </div>
      </div>
    </div>
  );
};
