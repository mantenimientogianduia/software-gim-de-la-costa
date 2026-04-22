'use client';
import { useState, useEffect } from 'react';
import { routineService, TrainingPlan, TrainingWeek, WorkoutSession } from '@/services/routine.service';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocioRoutineView({ userId }: { userId: string }) {
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
  const [weeks, setWeeks] = useState<TrainingWeek[]>([]);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Execution state for the current session
  const [sessionResults, setSessionResults] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const plan = await routineService.getUserActivePlan(userId);
        if (plan) {
          setActivePlan(plan);
          const weeksData = await routineService.getPlanWeeks(plan.id!);
          setWeeks(weeksData);
          
          // Basic auto-selection: find current day if possible, or default to 0
          setActiveWeekIdx(0);
          setActiveDayIdx(0);
          
          // Init empty results for the active day
          const day = weeksData[0]?.days[0];
          if (day) {
            const initialResults = day.blocks.flatMap(b => b.exercises.map(ex => ({
              name: ex.name,
              sets: Array(ex.prescribed.sets).fill({ reps: 0, weight: 0, rpe: 0 })
            })));
            setSessionResults(initialResults);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const updateSetResult = (exIdx: number, setIdx: number, field: string, value: number) => {
    const updated = [...sessionResults];
    updated[exIdx].sets[setIdx] = { ...updated[exIdx].sets[setIdx], [field]: value };
    setSessionResults(updated);
  };

  const handleFinishSession = async () => {
    if (!activePlan) return;
    try {
      await routineService.recordSession({
        userId,
        planId: activePlan.id!,
        weekOrder: weeks[activeWeekIdx].order,
        dayOrder: weeks[activeWeekIdx].days[activeDayIdx].order,
        date: new Date().toISOString(),
        exercises: sessionResults,
        feeling: 'good',
        energy: 8
      });
      alert('¡Entrenamiento registrado con éxito! Tu profesor ya puede ver tu progreso.');
    } catch (err) {
      console.error(err);
      alert('Error al registrar');
    }
  };

  if (loading) return (
    <div className="py-24 flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="font-label text-tertiary uppercase tracking-[0.3em] text-xs">Sincronizando con la nube...</div>
    </div>
  );

  if (!activePlan) return (
    <div className="bg-surface-container-low p-12 rounded-3xl ghost-border flex flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-5xl text-tertiary mb-6">history_edu</span>
      <h3 className="font-headline font-black text-2xl uppercase tracking-tight mb-2">Plan no disponible</h3>
      <p className="font-body text-tertiary max-w-sm mb-8">Pide a tu profesor que te asigne un Plan de Entrenamiento Personalizado.</p>
    </div>
  );

  const activeDay = weeks[activeWeekIdx]?.days[activeDayIdx];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Header PRO */}
      <div className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border flex flex-col md:flex-row justify-between items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-primary/5 blur-3xl rounded-full translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary text-white font-label text-[9px] font-black uppercase tracking-widest rounded">MASTER PLAN</span>
            <span className="px-3 py-1 bg-surface-container-high text-tertiary font-label text-[9px] font-black uppercase tracking-widest rounded">{activePlan.level}</span>
          </div>
          <h2 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic mb-4">{activePlan.title}</h2>
          <p className="font-body text-tertiary text-lg uppercase tracking-tight font-light">{weeks[activeWeekIdx].goal || 'Fase de hipertrofia muscular'}</p>
        </div>
      </div>

      {/* Week & Day Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {weeks[activeWeekIdx].days.map((day, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className={`min-w-[120px] p-6 rounded-2xl flex flex-col items-center gap-2 transition-all shrink-0 border ${activeDayIdx === idx ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-container-low text-tertiary border-outline-variant/10'}`}
          >
            <span className="font-label text-[9px] uppercase tracking-widest opacity-60">Día 0{day.order}</span>
            <span className="font-headline text-lg font-black uppercase tracking-tight">{day.name}</span>
          </button>
        ))}
      </div>

      {/* Exercises List Mode Live */}
      <div className="space-y-6">
        {activeDay.blocks.flatMap((block, blockIdx) => block.exercises.map((ex, exIdx) => (
          <div key={`${blockIdx}-${exIdx}`} className="bg-surface-container-low rounded-3xl overflow-hidden ghost-border">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
               <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-primary font-mono text-4xl font-black opacity-30">{(exIdx + 1).toString().padStart(2, '0')}</span>
                    <h4 className="font-headline text-2xl font-black uppercase tracking-tight italic">{ex.name}</h4>
                  </div>
                  <p className="text-tertiary text-sm font-body mb-6 leading-relaxed bg-surface-container-high/50 p-4 rounded-xl border border-white/5">{ex.notes || 'Controla el tempo 3:1:1.'}</p>
                  
                  <div className="flex gap-4 mb-8">
                    <div className="bg-surface-container-high px-4 py-2 rounded-lg">
                      <p className="font-label text-[8px] uppercase tracking-widest text-tertiary">Prescrito</p>
                      <p className="font-headline text-lg font-black">{ex.prescribed.sets} x {ex.prescribed.reps}</p>
                    </div>
                    <div className="bg-surface-container-high px-4 py-2 rounded-lg">
                      <p className="font-label text-[8px] uppercase tracking-widest text-tertiary">Objetivo</p>
                      <p className="font-headline text-lg font-black text-primary">{ex.prescribed.load}</p>
                    </div>
                  </div>
               </div>

               {/* Log Grid */}
               <div className="w-full md:w-[400px] bg-black/20 p-6 rounded-2xl border border-white/5">
                 <div className="grid grid-cols-4 gap-4 mb-4 opacity-50">
                   <span className="font-label text-[8px] uppercase tracking-widest text-center">Set</span>
                   <span className="font-label text-[8px] uppercase tracking-widest text-center">Reps</span>
                   <span className="font-label text-[8px] uppercase tracking-widest text-center">Kg</span>
                   <span className="font-label text-[8px] uppercase tracking-widest text-center">RPE</span>
                 </div>
                 <div className="space-y-3">
                   {Array(ex.prescribed.sets).fill(0).map((_, setIdx) => (
                     <div key={setIdx} className="grid grid-cols-4 gap-2 items-center">
                       <span className="text-center font-mono font-black text-xs opacity-30">#{setIdx+1}</span>
                       <input 
                         type="number"
                         placeholder="0"
                         onChange={(e) => updateSetResult(exIdx, setIdx, 'reps', parseInt(e.target.value))}
                         className="bg-surface-container-high p-2 rounded-lg font-mono text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                       />
                       <input 
                         type="number"
                         placeholder="0"
                         onChange={(e) => updateSetResult(exIdx, setIdx, 'weight', parseFloat(e.target.value))}
                         className="bg-surface-container-high p-2 rounded-lg font-mono text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                       />
                       <input 
                         type="number"
                         placeholder="-"
                         onChange={(e) => updateSetResult(exIdx, setIdx, 'rpe', parseInt(e.target.value))}
                         className="bg-surface-container-high p-2 rounded-lg font-mono text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                       />
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )))}
      </div>

      {/* Floating Action PRO */}
      <div className="fixed bottom-10 left-10 right-10 z-50 flex justify-center">
         <button 
           onClick={handleFinishSession}
           className="bg-gradient-primary text-on-primary px-16 py-5 rounded-[2rem] font-headline text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,87,34,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
         >
           <span className="material-symbols-outlined text-3xl">task_alt</span>
           Finalizar Entrenamiento
         </button>
      </div>
    </div>
  );
}
