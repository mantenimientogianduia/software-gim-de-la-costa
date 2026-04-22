'use client';
import { useState, useEffect } from 'react';
import { routineService, Routine } from '@/services/routine.service';
import { UserProfile, userService } from '@/services/user.service';
import { attendanceService } from '@/services/attendance.service';

export default function SessionView({ profile }: { profile: UserProfile }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    routineService.getUserRoutines(profile.email).then(data => {
      setRoutines(data);
      if (data.length > 0) setActiveRoutine(data[0]);
    });
  }, [profile.email]);

  const handleManualCheckout = async () => {
    if (!window.confirm('¿Estás seguro de que deseas finalizar tu sesión de entrenamiento?')) return;
    
    setLoading(true);
    try {
      const user = await userService.getUserByEmail(profile.email);
      if (user) {
        await attendanceService.checkOut(profile.email, user.id);
        window.location.reload(); // Refresh to go back to normal dashboard
      }
    } catch (err) {
      alert('Error al finalizar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-primary/10 p-8 rounded-2xl border border-primary/20 shadow-[0_0_40px_rgba(255,87,34,0.1)]">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
               <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Sesión de Entrenamiento Activa</span>
            </div>
            <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-on-surface">¡Dalo todo, {profile.firstName}!</h2>
            <p className="font-body text-tertiary mt-2">Tu disciplina es lo que te llevará a la meta.</p>
         </div>
         <div className="bg-surface-container-high p-4 px-6 rounded-xl ghost-border flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-primary">timer</span>
            <div>
               <p className="font-label text-[9px] uppercase tracking-[0.2em] text-tertiary">Estado</p>
               <p className="font-mono text-xl font-black text-primary">EN EL GYM</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {activeRoutine ? (
               <div className="bg-surface-container-low p-8 rounded-2xl ghost-border shadow-sm">
                  <div className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-6">
                    <h3 className="font-headline text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">fitness_center</span>
                      {activeRoutine.title}
                    </h3>
                    <div className="px-3 py-1 bg-surface-container-highest rounded text-[10px] font-bold uppercase tracking-widest text-tertiary italic">
                      Rutina de Hoy
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     {activeRoutine.exercises.map((ex, idx) => (
                        <div key={idx} className="group p-6 bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all duration-300 border border-outline-variant/5">
                           <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                 <span className="font-mono text-[10px] text-primary font-black opacity-30">0{idx + 1}</span>
                                 <div>
                                    <h4 className="font-body font-black uppercase tracking-tight text-lg group-hover:text-primary transition-colors">{ex.name}</h4>
                                    <div className="flex gap-4 mt-1">
                                      <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">{ex.sets}</p>
                                    </div>
                                 </div>
                              </div>
                              <button className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-primary hover:border-primary group-hover:scale-110 transition-all cursor-pointer">
                                 <span className="material-symbols-outlined text-sm group-hover:text-white transition-colors">done_all</span>
                              </button>
                           </div>
                           {ex.notes && (
                              <div className="mt-4 p-4 bg-black/10 rounded-lg text-xs italic text-tertiary border-l-2 border-primary/30">
                                 {ex.notes}
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            ) : (
               <div className="bg-surface-container-low p-12 rounded-2xl ghost-border text-center opacity-50 flex flex-col items-center">
                  <span className="material-symbols-outlined text-5xl mb-4 text-tertiary">history_edu</span>
                  <p className="font-label uppercase tracking-[0.2em] text-xs">Aún no tienes rutinas asignadas para esta sesión</p>
                  <p className="font-body text-sm mt-2">Consulta con tu profesor para que te asigne un plan.</p>
               </div>
            )}
         </div>
         
         <div className="space-y-6">
            <div className="bg-surface-container-low p-8 rounded-2xl ghost-border relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">tips_and_updates</span>
               </div>
               <h4 className="font-label text-xs font-black uppercase tracking-widest text-primary mb-4">Tip de Entrenamiento</h4>
               <p className="font-body text-sm text-on-surface leading-relaxed relative z-10">
                 "La técnica vence a la fuerza. Asegúrate de realizar cada movimiento con control total antes de subir el peso."
               </p>
            </div>
            
            <div className="bg-surface-container-low p-8 rounded-2xl ghost-border">
               <h4 className="font-label text-xs font-black uppercase tracking-widest text-tertiary mb-6">Tu Entrenador</h4>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">support_agent</span>
                  </div>
                  <div>
                    <p className="font-body font-bold text-sm uppercase tracking-tight">Staff Gym de la Costa</p>
                    <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mt-1">Soporte disponible en sala</p>
                  </div>
               </div>
            </div>
            
            <button 
              onClick={handleManualCheckout}
              disabled={loading}
              className="w-full py-4 bg-surface-container-highest rounded-xl font-label text-[10px] font-black uppercase tracking-[0.3em] text-tertiary hover:bg-error/10 hover:text-error transition-all duration-300 ghost-border disabled:opacity-50"
            >
               {loading ? 'Procesando...' : 'Finalizar Sesión Manualmente'}
            </button>
         </div>
      </div>
    </div>
  );
}
