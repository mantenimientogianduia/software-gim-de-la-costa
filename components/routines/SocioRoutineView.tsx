'use client';
import { useUserRoutine } from '@/hooks/use-user-routine';

export default function SocioRoutineView({ userId }: { userId: string }) {
  const { routines, loading, error } = useUserRoutine(userId);

  if (loading) {
    return (
      <div className="py-12 flex justify-center animate-pulse">
        <div className="font-label text-tertiary uppercase tracking-widest text-sm">Cargando tu entrenamiento...</div>
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="bg-surface-container-low p-8 rounded-lg ghost-border flex flex-col items-center justify-center text-center opacity-70">
        <span className="material-symbols-outlined text-4xl mb-3">event_busy</span>
        <h3 className="font-headline font-bold uppercase tracking-tight mb-2">No tienes rutinas activas</h3>
        <p className="font-body text-sm text-tertiary">Consulta con un profesor para que te asigne un plan de entrenamiento.</p>
      </div>
    );
  }

  const routine = routines[0]; // Display the main active routine

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface-container-low p-6 md:p-8 rounded-lg relative overflow-hidden ghost-border border-l-4 border-l-primary-container">
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-label text-primary text-xs uppercase tracking-widest mb-2 block">Rutina Actual</span>
              <h2 className="font-headline font-bold text-3xl md:text-5xl uppercase mb-2 tracking-tighter">{routine.title}</h2>
              {routine.description && <p className="font-body text-tertiary text-sm max-w-xl">{routine.description}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routine.exercises.map((exercise, i) => (
              <div key={i} className="bg-surface-container-medium p-4 rounded flex justify-between items-center group hover:bg-surface-container-highest transition-colors">
                <div className="flex flex-col">
                  <span className="font-headline font-bold uppercase tracking-tight text-sm md:text-base group-hover:text-primary-container transition-colors">
                    {exercise.name}
                  </span>
                  {exercise.notes && <span className="font-body text-[10px] text-tertiary mt-1 italic">{exercise.notes}</span>}
                </div>
                <div className="bg-surface-container-highest px-3 py-1 rounded font-label font-bold text-xs uppercase tracking-widest text-primary-container">
                  {exercise.sets}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 flex justify-between items-center">
             <div className="font-label text-[10px] text-tertiary uppercase tracking-widest">
               Actualizado el {routine.updatedAt?.toDate?.().toLocaleDateString() || 'recientemente'}
             </div>
             <button className="bg-gradient-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-sm shadow-glow flex items-center gap-2 hover:scale-[1.05] active:scale-[0.95] transition-all">
                Finalizar Sesión <span className="material-symbols-outlined text-sm">done_all</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
