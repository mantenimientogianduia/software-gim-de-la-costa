'use client';
import { useStreak } from '@/hooks/useStreak';
import { motion } from 'motion/react';
import { useRef, useEffect } from 'react';

export default function StreakDisplay({ userId }: { userId: string }) {
  const { streakData, loading, error } = useStreak(userId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streakData && scrollRef.current) {
      // Scroll to the end (today) with a slight delay to ensure rendering is complete
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [streakData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error/20 p-8 rounded-[2rem] text-center">
        <span className="material-symbols-outlined text-4xl text-error mb-4">error</span>
        <h3 className="font-headline font-bold text-lg text-error uppercase mb-2">Error al cargar la racha</h3>
        <p className="font-body text-sm text-tertiary">{error}</p>
      </div>
    );
  }

  if (!streakData) return null;

  const todayStr = new Date().toDateString();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-6 rounded-3xl ghost-border flex items-center justify-between shadow-xl"
        >
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Racha Actual</p>
            <p className="font-headline text-4xl font-black italic text-primary">{streakData.currentStreak} DÍAS</p>
          </div>
          <motion.span 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="material-symbols-outlined text-5xl text-primary icon-fill drop-shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"
          >
            local_fire_department
          </motion.span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-low p-6 rounded-3xl ghost-border flex items-center justify-between md:col-span-2 shadow-xl"
        >
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Objetivo Semanal</p>
            <p className="font-headline text-xl font-bold uppercase tracking-tight">CUMPLISTE {streakData.weeklyGoals.filter(g => g.completed).length} DE LAS ÚLTIMAS 4 SEMANAS</p>
          </div>
          <div className="hidden sm:flex gap-2">
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
        </motion.div>
      </section>

      {/* Calendar Strip (Like Apple Fitness) */}
      <section className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline font-bold text-lg uppercase tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            Actividad Reciente
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-tertiary">chevron_left</span>
            </button>
            <button 
              onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-tertiary">chevron_right</span>
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto pb-6 gap-5 no-scrollbar scroll-smooth snap-x"
        >
          {streakData.history.slice().reverse().map((day, idx) => {
            const isToday = day.date.toDateString() === todayStr;
            return (
              <div key={idx} className="flex flex-col items-center min-w-[56px] gap-3 snap-center">
                <span className={`font-label text-[10px] uppercase font-bold tracking-tighter ${isToday ? 'text-primary' : 'text-tertiary/60'}`}>
                  {day.date.toLocaleDateString('es-ES', { weekday: 'narrow' })}
                </span>
                
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      day.hasWorkout 
                        ? 'bg-primary/10 border-2 border-primary/40 text-primary shadow-[0_0_15px_-5px_rgba(var(--color-primary),0.3)]' 
                        : 'bg-surface-container-high/30 border border-outline-variant/10 text-tertiary/20'
                    } ${isToday ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface-container-low' : ''}`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${day.hasWorkout ? 'icon-fill' : ''}`}>
                      {day.hasWorkout ? 'local_fire_department' : 'ac_unit'}
                    </span>
                  </motion.div>
                  {isToday && (
                    <motion.div 
                      layoutId="today-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                    />
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <span className={`font-label text-xs font-black ${isToday ? 'text-primary' : 'text-tertiary'}`}>
                    {day.date.getDate()}
                  </span>
                  {isToday && <span className="font-label text-[8px] font-black text-primary uppercase tracking-tighter">Hoy</span>}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Subtle Fade Overlays */}
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-surface-container-low to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-surface-container-low to-transparent pointer-events-none" />
      </section>

      {/* Training History (List) */}
      <section className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border shadow-xl">
         <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Entrenamientos Recientes
        </h3>
        <div className="space-y-3">
          {streakData.history.filter(d => d.hasWorkout).slice(0, 5).map((day, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container-high transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary transition-all group-hover:text-white">
                  <span className="material-symbols-outlined icon-fill">fitness_center</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm uppercase tracking-tight group-hover:text-primary transition-colors">Sesión Completada</p>
                  <p className="font-body text-xs text-tertiary capitalize">
                    {day.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-tertiary">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest hidden sm:block">Ver detalles</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </motion.div>
          ))}
          {streakData.history.filter(d => d.hasWorkout).length === 0 && (
            <div className="py-12 text-center bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/20">
               <span className="material-symbols-outlined text-4xl text-tertiary/20 mb-3">fitness_center</span>
               <p className="font-body text-tertiary italic text-sm">Empieza hoy tu racha de entrenamiento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
