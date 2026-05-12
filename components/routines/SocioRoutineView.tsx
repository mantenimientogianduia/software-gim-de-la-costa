'use client';
import { useState, useEffect } from 'react';
import { routineService, TrainingPlan, TrainingWeek, WorkoutSession } from '@/services/routine.service';
import { motion, AnimatePresence } from 'motion/react';

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
          
          setActiveWeekIdx(0);
          setActiveDayIdx(0);
          
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
        energy: 8,
        duration: 0,
        notes: ''
      });
      alert('¡Entrenamiento registrado con éxito!');
    } catch (err) {
      console.error(err);
      alert('Error al registrar');
    }
  };

  if (loading) return (
    <div className="py-24 flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="font-label text-tertiary uppercase tracking-[0.3em] text-xs">Sincronizando...</div>
    </div>
  );

  if (!activePlan) return (
    <div className="bg-surface-container-low p-16 rounded-[3rem] ghost-border flex flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-6xl text-tertiary mb-8">fitness_center</span>
      <h3 className="font-headline font-black text-3xl uppercase tracking-tight mb-4">Sin Plan Activo</h3>
      <p className="font-body text-tertiary max-w-sm mb-12 text-lg">Tu instructor aún no ha asignado tu rutina personalizada.</p>
    </div>
  );

  const activeDay = weeks[activeWeekIdx]?.days[activeDayIdx];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      {/* Header Plan */}
      <div className="bg-surface-container-low p-10 rounded-[3rem] ghost-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-primary text-white font-label text-[10px] font-black uppercase tracking-widest rounded-full">PLAN ACTUAL</span>
              <span className="px-4 py-1.5 bg-surface-container-highest text-tertiary font-label text-[10px] font-black uppercase tracking-widest rounded-full">{activePlan.level}</span>
            </div>
            <h2 className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] italic mb-6">{activePlan.title}</h2>
            <p className="font-body text-tertiary text-xl uppercase tracking-tight font-light">{weeks[activeWeekIdx].goal}</p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {weeks[activeWeekIdx]?.days.map((day, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className={`min-w-[160px] p-8 rounded-[2rem] flex flex-col items-center gap-3 transition-all shrink-0 border ${activeDayIdx === idx ? 'bg-primary text-on-primary border-primary shadow-glow' : 'bg-surface-container-low text-tertiary border-white/5'}`}
          >
            <span className="font-label text-[10px] uppercase tracking-[0.2em] opacity-60">BLOQUE 0{day.order}</span>
            <span className="font-headline text-2xl font-black uppercase tracking-tight italic">{day.name}</span>
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div className="grid grid-cols-1 gap-8">
        {activeDay?.blocks.flatMap((block, blockIdx) => block.exercises.map((ex, exIdx) => (
          <motion.div 
            key={`${blockIdx}-${exIdx}`} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: exIdx * 0.1 }}
            className="bg-surface-container-low rounded-[2.5rem] overflow-hidden ghost-border"
          >
            <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-start">
               <div className="flex-1">
                  <div className="flex items-center gap-6 mb-8">
                    <span className="text-primary font-mono text-5xl font-black opacity-20">{(exIdx + 1).toString().padStart(2, '0')}</span>
                    <h4 className="font-headline text-4xl font-black uppercase tracking-tight italic leading-none">{ex.name}</h4>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-10">
                     <p className="font-label text-[10px] uppercase tracking-widest text-primary mb-2">Instrucciones</p>
                     <p className="text-tertiary text-lg font-body leading-relaxed">{ex.notes || 'Foco en la fase excéntrica del movimiento.'}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-surface-container-highest px-6 py-3 rounded-xl">
                      <p className="font-label text-[8px] uppercase tracking-widest text-tertiary mb-1">Volumen</p>
                      <p className="font-headline text-2xl font-black italic">{ex.prescribed.sets} x {ex.prescribed.reps}</p>
                    </div>
                    {ex.prescribed.load && (
                      <div className="bg-primary/20 px-6 py-3 rounded-xl border border-primary/30">
                        <p className="font-label text-[8px] uppercase tracking-widest text-primary mb-1">Objetivo</p>
                        <p className="font-headline text-2xl font-black text-primary italic">{ex.prescribed.load}</p>
                      </div>
                    )}
                  </div>
               </div>

               {/* Logging Table */}
               <div className="w-full lg:w-[450px] bg-black/40 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                 <div className="grid grid-cols-4 gap-4 mb-6 opacity-30">
                   <span className="font-label text-[10px] uppercase tracking-widest text-center">Set</span>
                   <span className="font-label text-[10px] uppercase tracking-widest text-center">Reps</span>
                   <span className="font-label text-[10px] uppercase tracking-widest text-center">Peso</span>
                   <span className="font-label text-[10px] uppercase tracking-widest text-center">RPE</span>
                 </div>
                 <div className="space-y-4">
                   {Array(ex.prescribed.sets).fill(0).map((_, setIdx) => (
                     <div key={setIdx} className="grid grid-cols-4 gap-4 items-center">
                       <span className="text-center font-mono font-black text-sm opacity-20">#{setIdx+1}</span>
                       <input 
                         type="number"
                         placeholder="0"
                         onChange={(e) => updateSetResult(exIdx, setIdx, 'reps', parseInt(e.target.value))}
                         className="bg-surface-container-highest p-3 rounded-xl font-mono text-lg text-center outline-none focus:ring-2 focus:ring-primary transition-all"
                       />
                       <input 
                         type="number"
                         placeholder="0"
                         onChange={(e) => updateSetResult(exIdx, setIdx, 'weight', parseFloat(e.target.value))}
                         className="bg-surface-container-highest p-3 rounded-xl font-mono text-lg text-center outline-none focus:ring-2 focus:ring-primary transition-all"
                       />
                       <input 
                         type="number"
                         placeholder="-"
                         onChange={(e) => updateSetResult(exIdx, setIdx, 'rpe', parseInt(e.target.value))}
                         className="bg-surface-container-highest p-3 rounded-xl font-mono text-lg text-center outline-none focus:ring-2 focus:ring-primary transition-all"
                       />
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        )))}
      </div>

      {/* Footer Finish */}
      <div className="flex justify-center pt-8">
         <button 
           onClick={handleFinishSession}
           className="bg-gradient-primary text-on-primary px-20 py-6 rounded-full font-headline text-xl font-black uppercase tracking-[0.3em] shadow-[0_30px_60px_rgba(255,87,34,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-6"
         >
           <span className="material-symbols-outlined text-4xl">check_circle</span>
           Guardar Sesión
         </button>
      </div>
    </div>
  );
}
