'use client';
import { useState, useEffect } from 'react';
import { streakService, StreakData } from '@/services/streak.service';
import { motion } from 'motion/react';

export default function StreakDisplay({ userId, weeklyTrainingGoal = 3 }: { userId: string, weeklyTrainingGoal?: number }) {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const streakData = await streakService.getStreakData(userId);
        setData(streakData);
      } catch (error) {
        console.error('Error loading streak:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <div className="animate-pulse h-24 bg-surface-container-highest rounded-3xl" />;

  const currentStreak = data?.currentStreak || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
               <span className="material-symbols-outlined text-4xl icon-fill animate-pulse">local_fire_department</span>
            </div>
            {currentStreak > 0 && (
               <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black italic px-2 py-1 rounded-lg shadow-glow">
                 {currentStreak}D
               </div>
            )}
          </div>
          <div>
            <h4 className="font-headline font-black italic text-xl uppercase tracking-tighter text-primary">Racha de Entrenamiento</h4>
            <p className="font-label text-xs text-tertiary uppercase tracking-widest">{currentStreak === 0 ? '¡Comienza hoy!' : '¡Sigue así!'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-headline font-black text-3xl italic text-primary leading-none">{data?.totalCheckIns || 0}</p>
          <p className="font-label text-[8px] text-tertiary uppercase tracking-widest">Total Visitas</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${data?.weeklyProgress[i] ? 'bg-primary border-primary shadow-glow text-on-primary' : 'border-outline-variant/20 bg-surface-container-lowest text-tertiary/20'}`}>
              <span className="material-symbols-outlined text-sm">{data?.weeklyProgress[i] ? 'check' : 'close'}</span>
            </div>
            <span className="font-label text-[8px] uppercase font-black text-tertiary/40">{day}</span>
          </div>
        ))}
      </div>

      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-label text-[8px] uppercase tracking-widest text-tertiary">Meta Semanal</span>
          <p className="font-body text-xs font-bold text-primary">{Math.min(data?.totalCheckIns || 0, weeklyTrainingGoal)} de {weeklyTrainingGoal} sesiones</p>
        </div>
        <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(data?.totalCheckIns || 0, weeklyTrainingGoal) / weeklyTrainingGoal) * 100}%` }}
            className="h-full bg-primary shadow-glow"
          />
        </div>
      </div>
    </div>
  );
}
