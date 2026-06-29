'use client';
import { useState, useEffect } from 'react';
import { routineService, TrainingPlan, TrainingWeek } from '@/services/routine.service';
import { motion, AnimatePresence } from 'framer-motion';

function buildEmptyResults(week: TrainingWeek, dayIdx: number) {
  const day = week?.days[dayIdx];
  if (!day) return [];
  return day.blocks.flatMap(b =>
    b.exercises.map(ex => ({
      name: ex.name,
      sets: Array(ex.prescribed.sets).fill(null).map(() => ({ reps: 0, weight: 0, rpe: 0 })),
    }))
  );
}

export default function SocioRoutineView({ userId }: { userId: string }) {
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
  const [weeks, setWeeks] = useState<TrainingWeek[]>([]);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionResults, setSessionResults] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

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
          setSessionResults(buildEmptyResults(weeksData[0], 0));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  // Reset results whenever week or day changes
  useEffect(() => {
    if (weeks.length > 0) {
      setSessionResults(buildEmptyResults(weeks[activeWeekIdx], activeDayIdx));
    }
  }, [activeWeekIdx, activeDayIdx, weeks]);

  const updateSetResult = (exIdx: number, setIdx: number, field: string, value: number) => {
    setSessionResults(prev => {
      const updated = prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s: any, j: number) => j === setIdx ? { ...s, [field]: value } : s) }
          : ex
      );
      return updated;
    });
  };

  const handleFinishSession = async () => {
    if (!activePlan || saving) return;
    setSaving(true);
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
        notes: '',
      });
      showToast('¡Entrenamiento registrado! Tu profesor ya puede ver tu progreso.', 'ok');
    } catch (err) {
      console.error(err);
      showToast('Error al registrar el entrenamiento. Intenta de nuevo.', 'err');
    } finally {
      setSaving(false);
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32 md:pb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-label text-sm font-bold uppercase tracking-widest ${
              toast.type === 'ok'
                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                : 'bg-error/20 border border-error/40 text-error'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'ok' ? 'check_circle' : 'error'}
            </span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header PRO */}
      <div className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border flex flex-col md:flex-row justify-between items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-primary/5 blur-3xl rounded-full translate-x-1/2"></div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary text-white font-label text-[9px] font-black uppercase tracking-widest rounded">MASTER PLAN</span>
            <span className="px-3 py-1 bg-surface-container-high text-tertiary font-label text-[9px] font-black uppercase tracking-widest rounded">{activePlan.level}</span>
          </div>
          <h2 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic mb-4">{activePlan.title}</h2>
          <p className="font-body text-tertiary text-lg uppercase tracking-tight font-light">{weeks[activeWeekIdx]?.goal || 'Fase de hipertrofia muscular'}</p>
        </div>
        {/* Week selector */}
        {weeks.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0">
            <p className="font-label text-[9px] uppercase tracking-widest text-tertiary">Semana</p>
            <div className="flex gap-2 flex-wrap">
              {weeks.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveWeekIdx(idx); setActiveDayIdx(0); }}
                  className={`w-10 h-10 rounded-xl font-headline font-black text-sm transition-all ${
                    activeWeekIdx === idx
                      ? 'bg-primary text-white shadow-glow'
                      : 'bg-surface-container-high text-tertiary hover:bg-primary/20'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {weeks[activeWeekIdx]?.days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className={`min-w-[120px] p-6 rounded-2xl flex flex-col items-center gap-2 transition-all shrink-0 border ${
              activeDayIdx === idx
                ? 'bg-primary text-white border-primary shadow-glow'
                : 'bg-surface-container-low text-tertiary border-outline-variant/10'
            }`}
          >
            <span className="font-label text-[9px] uppercase tracking-widest opacity-60">Día 0{day.order}</span>
            <span className="font-headline text-lg font-black uppercase tracking-tight">{day.name}</span>
          </button>
        ))}
      </div>

      {/* Exercises */}
      {activeDay && (
        <div className="space-y-6">
          {activeDay.blocks.flatMap((block, blockIdx) =>
            block.exercises.map((ex, exIdx) => {
              const globalIdx = activeDay.blocks
                .slice(0, blockIdx)
                .reduce((acc, b) => acc + b.exercises.length, 0) + exIdx;
              return (
                <div key={`${blockIdx}-${exIdx}`} className="bg-surface-container-low rounded-3xl overflow-hidden ghost-border">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-primary font-mono text-4xl font-black opacity-30">{(exIdx + 1).toString().padStart(2, '0')}</span>
                        <h4 className="font-headline text-2xl font-black uppercase tracking-tight italic">{ex.name}</h4>
                      </div>
                      <p className="text-tertiary text-sm font-body mb-6 leading-relaxed bg-surface-container-high/50 p-4 rounded-xl border border-white/5">
                        {ex.notes || 'Controla el tempo 3:1:1.'}
                      </p>
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
                            <span className="text-center font-mono font-black text-xs opacity-30">#{setIdx + 1}</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={sessionResults[globalIdx]?.sets[setIdx]?.reps || ''}
                              onChange={e => updateSetResult(globalIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                              className="bg-surface-container-high p-2 rounded-lg font-mono text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                            />
                            <input
                              type="number"
                              placeholder="0"
                              value={sessionResults[globalIdx]?.sets[setIdx]?.weight || ''}
                              onChange={e => updateSetResult(globalIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                              className="bg-surface-container-high p-2 rounded-lg font-mono text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                            />
                            <input
                              type="number"
                              placeholder="-"
                              value={sessionResults[globalIdx]?.sets[setIdx]?.rpe || ''}
                              onChange={e => updateSetResult(globalIdx, setIdx, 'rpe', parseInt(e.target.value) || 0)}
                              className="bg-surface-container-high p-2 rounded-lg font-mono text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Floating Action */}
      <div className="sticky bottom-28 md:bottom-6 z-40 flex justify-center px-2">
        <button
          onClick={handleFinishSession}
          disabled={saving}
          className="w-full max-w-xl bg-gradient-primary text-on-primary px-6 md:px-16 py-4 md:py-5 rounded-[2rem] font-headline text-sm md:text-lg font-black uppercase tracking-[0.18em] md:tracking-[0.3em] shadow-[0_20px_50px_rgba(255,87,34,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-60 disabled:scale-100"
        >
          <span className="material-symbols-outlined text-3xl">{saving ? 'hourglass_empty' : 'task_alt'}</span>
          {saving ? 'Guardando...' : 'Finalizar Entrenamiento'}
        </button>
      </div>
    </div>
  );
}
