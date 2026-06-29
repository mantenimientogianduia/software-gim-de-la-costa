'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, userService } from '@/services/user.service';
import { attendanceService } from '@/services/attendance.service';
import SocioRoutineView from '@/components/routines/SocioRoutineView';
import { motion, AnimatePresence } from 'framer-motion';

export default function SessionView({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showError = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleManualCheckout = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const user = await userService.getUserByEmail(profile.email);
      if (user) {
        await attendanceService.checkOut(profile.email, user.id);
        router.refresh();
      }
    } catch {
      showError('Error al finalizar la sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-error/20 border border-error/40 text-error font-label text-sm font-bold uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-lg">error</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-surface-container-low rounded-3xl ghost-border p-8 shadow-2xl text-center"
            >
              <span className="material-symbols-outlined text-5xl text-error mb-4">logout</span>
              <h3 className="font-headline font-black text-xl uppercase tracking-tight mb-2">¿Salir del gimnasio?</h3>
              <p className="font-body text-sm text-tertiary mb-8">Esto registrará tu salida. Podrás volver a ingresar escaneando tu QR.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 px-4 border border-outline-variant/30 text-tertiary rounded-2xl font-headline font-bold uppercase tracking-tight hover:bg-surface-container-high transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManualCheckout}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-error/20 border border-error/40 text-error rounded-2xl font-headline font-bold uppercase tracking-tight hover:bg-error/30 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saliendo...' : 'Confirmar salida'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header banner */}
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
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="relative z-10 px-8 py-3 bg-surface-container-highest rounded-xl font-label text-[10px] font-black uppercase tracking-widest hover:bg-error/10 hover:text-error transition-all border border-outline-variant/10 disabled:opacity-50"
        >
          {loading ? 'Saliendo...' : 'Forzar Salida'}
        </button>
      </div>

      <SocioRoutineView userId={profile.email} />
    </div>
  );
}
