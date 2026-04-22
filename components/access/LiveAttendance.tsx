'use client';
import { useEffect, useState } from 'react';
import { attendanceService } from '@/services/attendance.service';
import { UserProfile } from '@/services/user.service';

export default function LiveAttendance() {
  const [presentUsers, setPresentUsers] = useState<UserProfile[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsub = attendanceService.getLiveAttendance((users) => {
      setPresentUsers(users);
    });
    return () => unsub();
  }, []);

  const handleMassCheckout = async () => {
    const hourAgo = new Date();
    hourAgo.setHours(hourAgo.getHours() - 1);

    const overstayers = presentUsers.filter((u: any) => {
      if (!u.lastCheckIn?.toDate) return false;
      return u.lastCheckIn.toDate() < hourAgo;
    });

    if (overstayers.length === 0) {
      alert('Sin sesiones antiguas (+1h) para finalizar.');
      return;
    }

    if (!window.confirm(`¿Finalizar sesión de ${overstayers.length} socios que ingresaron hace más de 1 hora?`)) return;

    setProcessing(true);
    try {
      for (const user of overstayers as any) {
        await attendanceService.checkOut(user.email, user.id);
      }
      alert('Egresos registrados con éxito.');
    } catch (err) {
      console.error(err);
      alert('Error al procesar egresos masivos.');
    } finally {
      setProcessing(false);
    }
  };

  const isOverstaying = (lastCheckIn: any) => {
    if (!lastCheckIn?.toDate) return false;
    const hourAgo = new Date();
    hourAgo.setHours(hourAgo.getHours() - 1);
    return lastCheckIn.toDate() < hourAgo;
  };

  return (
    <div className="bg-surface-container-low p-6 rounded-xl ghost-border h-full ring-1 ring-outline-variant/10">
      <div className="flex items-center justify-between mb-8">
         <h2 className="font-headline text-lg font-black uppercase tracking-tighter">En el Gimnasio</h2>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,87,34,0.6)]"></div>
            <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">{presentUsers.length} Presentes</span>
         </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
         {presentUsers.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-outline-variant/10 rounded-lg text-center opacity-40">
               <span className="material-symbols-outlined text-4xl mb-3">group_off</span>
               <p className="font-label text-[10px] uppercase tracking-widest">El gimnasio está vacío</p>
            </div>
         ) : (
            presentUsers.map((user: any) => (
               <div key={user.id} className={`group flex items-center justify-between p-4 rounded-lg transition-all duration-300 border ${isOverstaying(user.lastCheckIn) ? 'bg-error/5 border-error/20' : 'bg-surface-container-high border-outline-variant/5 hover:bg-surface-container-highest'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black uppercase text-xs border transition-transform group-hover:scale-110 ${isOverstaying(user.lastCheckIn) ? 'bg-error text-white border-error shadow-glow-error' : 'bg-primary/20 text-primary border-primary/10'}`}>
                        {user.firstName[0]}{user.lastName[0]}
                     </div>
                     <div>
                        <h4 className="font-body font-bold text-sm uppercase tracking-tight text-on-surface">
                           {user.firstName} {user.lastName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`material-symbols-outlined text-[12px] ${isOverstaying(user.lastCheckIn) ? 'text-error animate-pulse' : 'text-primary'}`}>
                             {isOverstaying(user.lastCheckIn) ? 'warning' : 'fitness_center'}
                           </span>
                           <p className="font-label text-[10px] uppercase tracking-wider text-tertiary">
                              {isOverstaying(user.lastCheckIn) ? 'SESIÓN PROLONGADA' : (user.currentActivity || 'Entrenando')}
                           </p>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="font-label text-[8px] uppercase tracking-widest text-tertiary mb-1">Ingresó</p>
                     <p className={`font-mono text-[11px] font-bold ${isOverstaying(user.lastCheckIn) ? 'text-error' : 'text-on-surface'}`}>
                        {user.lastCheckIn?.toDate ? new Date(user.lastCheckIn.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                     </p>
                  </div>
               </div>
            ))
         )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-col gap-4">
         <button 
           onClick={handleMassCheckout}
           disabled={processing || presentUsers.length === 0}
           className="w-full py-4 bg-surface-container-highest text-tertiary hover:text-white hover:bg-error/20 border border-outline-variant/10 rounded-xl font-label text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
         >
           {processing ? 'Procesando...' : 'Finalizar Sesiones Antiguas (+1h)'}
         </button>
         <p className="font-label text-[9px] uppercase tracking-[0.2em] text-tertiary text-center flex items-center justify-center gap-2">
           <span className="w-1 h-1 bg-tertiary rounded-full"></span>
           Panel de Control en Vivo
           <span className="w-1 h-1 bg-tertiary rounded-full"></span>
         </p>
      </div>
    </div>
  );
}
