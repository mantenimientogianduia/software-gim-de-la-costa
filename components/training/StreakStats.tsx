'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StreakStatsProps {
  streak: {
    current: number;
    best: number;
    activityHistory: string[];
  };
}

export default function StreakStats({ streak }: StreakStatsProps) {
  const currentWeek = useMemo(() => {
    const today = new Date();
    const days = [];
    // Start from Monday of current week
    const start = new Date(today);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="bg-surface-container-low rounded-[2rem] p-8 ghost-border relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 translate-x-4 -translate-y-4">
        <span className="material-symbols-outlined text-[120px] text-primary">local_fire_department</span>
      </div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="font-headline font-black text-2xl uppercase tracking-tighter italic">Racha de Fuego</h3>
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Actividad de esta semana</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <h4 className="font-headline text-4xl font-black text-primary italic drop-shadow-glow">{streak.current}</h4>
            <span className="material-symbols-outlined text-primary text-xl">local_fire_department</span>
          </div>
          <p className="font-label text-[10px] uppercase font-bold text-tertiary">Días seguidos</p>
        </div>
      </div>

      <div className="flex justify-between gap-2 mb-8 relative z-10">
        {currentWeek.map((date, i) => {
          const isTrained = streak.activityHistory?.includes(date);
          const isToday = new Date().toISOString().split('T')[0] === date;
          
          return (
            <motion.div 
              key={date}
              whileHover={{ y: -5 }}
              className="flex-1 flex flex-col items-center gap-3"
            >
              <div className={`w-full aspect-square rounded-2xl flex items-center justify-center border transition-all ${
                isTrained 
                  ? 'bg-primary/20 border-primary/40 text-primary shadow-glow-error' 
                  : 'bg-surface-container-highest/30 border-white/5 text-blue-300 opacity-30 shadow-inner'
              }`}>
                <span className="material-symbols-outlined text-lg">
                  {isTrained ? 'local_fire_department' : 'ac_unit'}
                </span>
              </div>
              <span className={`font-label text-[9px] font-black uppercase ${isToday ? 'text-primary underline underline-offset-4' : 'text-tertiary/60'}`}>
                {dayNames[i]}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 relative z-10">
        <div className="bg-surface-container-high/50 p-4 rounded-2xl">
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Mejor Racha</p>
          <p className="font-headline text-xl font-black">{streak.best} Días</p>
        </div>
        <div className="bg-surface-container-high/50 p-4 rounded-2xl">
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Total Entrenados</p>
          <p className="font-headline text-xl font-black">{streak.activityHistory?.length || 0}</p>
        </div>
      </div>

      {streak.current === 0 && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-4">
             <span className="material-symbols-outlined text-blue-400">ac_unit</span>
             <p className="font-body text-xs text-blue-200 italic">Hoy todavía no entrenaste. ¡Que no se apague el fuego!</p>
          </div>
      )}
    </div>
  );
}
