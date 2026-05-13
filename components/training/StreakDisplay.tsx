'use client';
import { useStreak } from '@/hooks/useStreak';
import { motion } from 'motion/react';

export default function StreakDisplay({ userId }: { userId: string }) {
  const { streakData, loading } = useStreak(userId);

  if (loading || !streakData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-2xl ghost-border flex items-center justify-between">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Racha Actual</p>
            <p className="font-headline text-4xl font-black italic text-primary">{streakData.currentStreak} DÍAS</p>
          </div>
          <motion.span 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="material-symbols-outlined text-5xl text-primary icon-fill"
          >
            local_fire_department
          </motion.span>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl ghost-border flex items-center justify-between md:col-span-2">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Objetivo Semanal</p>
            <p className="font-headline text-xl font-bold uppercase tracking-tight">CUMPLISTE {streakData.weeklyGoals.filter(g => g.completed).length} DE LAS ÚLTIMAS 4 SEMANAS</p>
          </div>
          <div className="flex gap-2">
            {streakData.weeklyGoals.map((goal, idx) => (
              <div 
                key={idx} 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  goal.completed 
                    ? 'bg-primary/20 border-primary text-primary shadow-glow' 
                    : 'bg-surface-container-high border-outline-variant text-tertiary/50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{goal.completed ? 'check' : 'close'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Strip (Like Apple Fitness) */}
      <section className="bg-surface-container-low p-8 rounded-[2rem] ghost-border overflow-hidden">
        <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          Actividad Reciente
        </h3>
        
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
          {streakData.history.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[50px] gap-2">
              <span className="font-label text-[10px] uppercase text-tertiary">
                {day.date.toLocaleDateString('es-ES', { weekday: 'narrow' })}
              </span>
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  day.hasWorkout 
                    ? 'bg-primary/10 border border-primary/30 text-primary' 
                    : 'bg-surface-container-high/50 border border-outline-variant/10 text-tertiary/20'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${day.hasWorkout ? 'icon-fill' : ''}`}>
                  {day.hasWorkout ? 'local_fire_department' : 'ac_unit'}
                </span>
              </div>
              <span className="font-label text-[10px] font-bold text-tertiary">
                {day.date.getDate()}
              </span>
            </div>
          )).reverse()}
        </div>
      </section>

      {/* Training History (List) */}
      <section className="bg-surface-container-low p-8 rounded-[2rem] ghost-border">
         <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Historial de Entrenamientos
        </h3>
        <div className="space-y-4">
          {streakData.history.filter(d => d.hasWorkout).slice(0, 5).map((day, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">fitness_center</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm uppercase tracking-tight">Entrenamiento de Fuerza</p>
                  <p className="font-body text-xs text-tertiary capitalize">
                    {day.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
          ))}
          {streakData.history.filter(d => d.hasWorkout).length === 0 && (
            <div className="py-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/20">
               <p className="font-body text-tertiary italic text-sm">Aún no hay entrenamientos registrados este mes.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
