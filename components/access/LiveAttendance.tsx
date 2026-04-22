'use client';
import { useEffect, useState } from 'react';
import { attendanceService } from '@/services/attendance.service';
import { UserProfile } from '@/services/user.service';

export default function LiveAttendance() {
  const [presentUsers, setPresentUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsub = attendanceService.getLiveAttendance((users) => {
      setPresentUsers(users);
    });
    return () => unsub();
  }, []);

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
               <div key={user.id} className="group flex items-center justify-between p-4 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-all duration-300 border border-outline-variant/5">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase text-xs border border-primary/10 group-hover:scale-110 transition-transform">
                        {user.firstName[0]}{user.lastName[0]}
                     </div>
                     <div>
                        <h4 className="font-body font-bold text-sm uppercase tracking-tight text-on-surface">
                           {user.firstName} {user.lastName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="material-symbols-outlined text-[12px] text-primary">fitness_center</span>
                           <p className="font-label text-[10px] uppercase tracking-wider text-tertiary">
                              {user.currentActivity || 'Entrenando'}
                           </p>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="font-label text-[8px] uppercase tracking-widest text-tertiary mb-1">Ingresó</p>
                     <p className="font-mono text-[11px] font-bold text-on-surface">
                        {user.lastCheckIn?.toDate ? new Date(user.lastCheckIn.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                     </p>
                  </div>
               </div>
            ))
         )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-outline-variant/10">
         <p className="font-label text-[9px] uppercase tracking-[0.2em] text-tertiary text-center flex items-center justify-center gap-2">
           <span className="w-1 h-1 bg-tertiary rounded-full"></span>
           Panel de Control en Vivo
           <span className="w-1 h-1 bg-tertiary rounded-full"></span>
         </p>
      </div>
    </div>
  );
}
