'use client';
import { useState } from 'react';
import { UserProfile, userService } from '@/services/user.service';
import { attendanceService } from '@/services/attendance.service';
import SocioRoutineView from '@/components/routines/SocioRoutineView';
import { motion } from 'motion/react';

export default function SessionView({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(false);

  const handleManualCheckout = async () => {
    if (!window.confirm('¿Deseas finalizar tu sesión de entrenamiento actual?')) return;
    
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
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="bg-primary/10 p-12 rounded-[3.5rem] border border-primary/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
         {/* Animated BG */}
         <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary blur-[100px]"></div>
         </div>
         
         <div className="relative z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
               <div className="w-3 h-3 rounded-full bg-primary animate-ping"></div>
               <span className="font-label text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sesión en Curso</span>
            </div>
            <h2 className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter text-on-surface italic leading-none mb-4">MODO <br/> ENTRENAMIENTO</h2>
            <p className="font-body text-tertiary uppercase tracking-widest font-light text-sm opacity-60">Enfócate en tu rendimiento. El tiempo es oro.</p>
         </div>

         <button 
           onClick={handleManualCheckout}
           disabled={loading}
           className="relative z-10 px-10 py-4 bg-surface-container-highest rounded-2xl font-label text-[10px] font-black uppercase tracking-widest hover:bg-error hover:text-white transition-all border border-white/5 active:scale-95"
         >
           {loading ? 'Saliendo...' : 'Finalizar Sesión'}
         </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
         <SocioRoutineView userId={profile.email} />
      </div>
    </div>
  );
}
