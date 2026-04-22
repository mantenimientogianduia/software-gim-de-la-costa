'use client';
import { useState } from 'react';
import { useUserRoutine } from '@/hooks/use-user-routine';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocioRoutineView({ userId }: { userId: string }) {
  const { routines, loading, error } = useUserRoutine(userId);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="font-label text-tertiary uppercase tracking-[0.3em] text-xs">Construyendo tu plan...</div>
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="bg-surface-container-low p-12 rounded-3xl ghost-border flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-tertiary">history_edu</span>
        </div>
        <h3 className="font-headline font-black text-2xl uppercase tracking-tight mb-2">Sin plan asignado</h3>
        <p className="font-body text-tertiary max-w-sm mb-8">Parece que aún no tienes una rutina activa. Consulta con los profes en la sala para empezar.</p>
      </div>
    );
  }

  const routine = routines[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header PRO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-container-low p-8 md:p-12 ghost-border">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,87,34,1)]"></span>
                 <span className="font-label text-[10px] font-black uppercase tracking-[0.3em] text-primary">Plan de Alto Rendimiento</span>
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter text-on-surface leading-none mb-4 italic">
                {routine.title}
              </h2>
              {routine.description && (
                <p className="font-body text-tertiary text-lg max-w-2xl leading-relaxed">
                  {routine.description}
                </p>
              )}
           </div>
           <div className="flex flex-col items-end gap-2 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/5">
              <span className="font-label text-[10px] uppercase tracking-widest text-tertiary">Tu Objetivo</span>
              <span className="font-headline text-2xl font-black text-primary uppercase">HIPERTROFIA</span>
           </div>
        </div>
      </div>

      {/* Routine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {routine.exercises.map((exercise, i) => (
           <motion.div 
             key={i}
             layout
             onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
             className={`relative group cursor-pointer overflow-hidden p-6 rounded-2xl transition-all duration-500 border border-outline-variant/5 ${expandedIdx === i ? 'bg-primary/5 ring-2 ring-primary ring-inset' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
           >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <span className={`font-mono text-3xl font-black transition-colors duration-500 ${expandedIdx === i ? 'text-primary' : 'text-on-surface/10'}`}>
                     {String(i + 1).padStart(2, '0')}
                   </span>
                   <div>
                      <h4 className="font-headline text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                        {exercise.name}
                      </h4>
                      <p className="font-label text-[11px] uppercase tracking-[0.2em] text-tertiary mt-1 font-bold">
                        {exercise.sets}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden sm:flex flex-col items-end opacity-50">
                      <span className="font-label text-[8px] uppercase tracking-widest text-tertiary">Status</span>
                      <span className="font-mono text-[10px] text-on-surface">PENDIENTE</span>
                   </div>
                   <span className={`material-symbols-outlined transition-transform duration-500 text-primary ${expandedIdx === i ? 'rotate-180' : ''}`}>
                     expand_more
                   </span>
                </div>
              </div>

              <AnimatePresence>
                {expandedIdx === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 pt-6 border-t border-primary/20 space-y-4">
                       <div className="bg-black/20 p-5 rounded-xl">
                          <h5 className="font-label text-[9px] uppercase tracking-widest text-primary mb-3 font-black">Instrucciones & Notas</h5>
                          <p className="font-body text-sm text-on-surface opacity-90 leading-relaxed italic">
                            {exercise.notes || 'Realizar con control total de la fase negativa. Mantener la espalda recta en todo momento.'}
                          </p>
                       </div>
                       <div className="flex gap-4">
                          <button className="flex-1 py-3 bg-primary text-white rounded-lg font-label text-[10px] font-black uppercase tracking-widest shadow-glow active:scale-95 transition-all">Ver Técnica</button>
                          <button className="flex-1 py-3 bg-surface-container-highest text-white rounded-lg font-label text-[10px] font-black uppercase tracking-widest border border-outline-variant/10">Registrar Carga</button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </motion.div>
         ))}
      </div>

      <div className="bg-surface-container-low p-8 rounded-2xl ghost-border flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
               <span className="material-symbols-outlined text-3xl">emoji_events</span>
            </div>
            <div>
               <p className="font-headline text-lg font-black uppercase tracking-tight">Casi terminamos</p>
               <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Has completado 0 de {routine.exercises.length} bloques</p>
            </div>
         </div>
         <button className="w-full md:w-auto px-12 py-5 bg-gradient-primary text-on-primary font-label text-sm font-black uppercase tracking-[0.3em] rounded-xl shadow-glow hover:scale-105 active:scale-95 transition-all">
            Finalizar Entrenamiento
         </button>
      </div>
    </div>
  );
}
