'use client';
import { useState } from 'react';
import { UserProfile, userService } from '@/services/user.service';
import { attendanceService } from '@/services/attendance.service';
import SocioRoutineView from '@/components/routines/SocioRoutineView';

export default function SessionView({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(false);

  const handleManualCheckout = async () => {
    if (!window.confirm('¿Estás seguro de que deseas finalizar tu sesión de entrenamiento?')) return;
    
    setLoading(true);
    try {
      const user = await userService.getUserByEmail(profile.email);
      if (user) {
        await attendanceService.checkOut(profile.email, user.id);
        window.location.reload(); 
      }
    } catch (err) {
      alert('Error al finalizar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-primary/10 p-8 rounded-[2rem] border border-primary/20 shadow-[0_0_40px_rgba(255,87,34,0.1)] relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-10 w-20 h-20 bg-primary/20 blur-[60px]"></div>
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
               <span className="font-label text-[10px] font-black uppercase tracking-[0.3em] text-primary">Estás en el gimnasio</span>
            </div>
            <h2 className="font-headline text-5xl font-black uppercase tracking-tighter text-on-surface italic leading-none">MODO ENTRENAMIENTO</h2>
         </div>
         <button 
           onClick={handleManualCheckout}
           disabled={loading}
           className="relative z-10 px-8 py-3 bg-surface-container-highest rounded-xl font-label text-[10px] font-black uppercase tracking-widest hover:bg-error/10 hover:text-error transition-all border border-outline-variant/10"
         >
           {loading ? 'Saliendo...' : 'Forzar Salida'}
         </button>
      </div>

      <SocioRoutineView userId={profile.email} />
    </div>
  );
}
