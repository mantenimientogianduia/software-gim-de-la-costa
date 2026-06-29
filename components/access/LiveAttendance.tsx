'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { attendanceService } from '@/services/attendance.service';
import { UserProfile } from '@/services/user.service';
import { isSessionOverLimit } from '@/services/access.service';

type PresentUser = UserProfile & { id: string };

export default function LiveAttendance() {
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [showMassConfirm, setShowMassConfirm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const autoClosedRef = useRef<Set<string>>(new Set());

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const unsub = attendanceService.getLiveAttendance((users) => {
      setPresentUsers(users as PresentUser[]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const expiredUsers = presentUsers.filter((user: any) => (
      isSessionOverLimit({ checkInAt: user.lastCheckIn }) && !autoClosedRef.current.has(user.id)
    ));

    if (expiredUsers.length === 0) return;

    let cancelled = false;

    (async () => {
      for (const user of expiredUsers as any[]) {
        if (cancelled) return;
        autoClosedRef.current.add(user.id);
        try {
          await attendanceService.checkOut(user.email, user.id);
        } catch (err) {
          console.error('Error al cerrar sesion extendida automaticamente', err);
          autoClosedRef.current.delete(user.id);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [presentUsers]);

  const handleManualCheckout = async (user: PresentUser) => {
    setProcessingUserId(user.id);
    try {
      await attendanceService.checkOut(user.email, user.id);
    } catch (err) {
      console.error(err);
      showToast('Error al registrar el egreso manual.', 'err');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleMassCheckout = async () => {
    const overstayers = presentUsers.filter((u: any) => isSessionOverLimit({ checkInAt: u.lastCheckIn }));

    if (overstayers.length === 0) {
      showToast('No hay sesiones de más de 3 horas para finalizar.', 'err');
      return;
    }

    setShowMassConfirm(true);
  };

  const confirmMassCheckout = async () => {
    const overstayers = presentUsers.filter((u: any) => isSessionOverLimit({ checkInAt: u.lastCheckIn }));
    setShowMassConfirm(false);
    setProcessing(true);
    try {
      for (const user of overstayers as any[]) {
        await attendanceService.checkOut(user.email, user.id);
      }
      showToast(`${overstayers.length} egresos registrados con éxito.`, 'ok');
    } catch (err) {
      console.error(err);
      showToast('Error al procesar los egresos masivos.', 'err');
    } finally {
      setProcessing(false);
    }
  };

  const isOverstaying = (lastCheckIn: any) => isSessionOverLimit({ checkInAt: lastCheckIn });

  const isMembershipOverdue = (membershipValidUntil: any) => {
    if (!membershipValidUntil?.toDate) return true;
    return membershipValidUntil.toDate() <= new Date();
  };

  return (
    <div className="bg-surface-container-low p-6 rounded-xl ghost-border h-full ring-1 ring-outline-variant/10 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl font-label text-xs font-bold uppercase tracking-widest whitespace-nowrap ${
              toast.type === 'ok'
                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                : 'bg-error/20 border border-error/40 text-error'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {toast.type === 'ok' ? 'check_circle' : 'error'}
            </span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

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
          presentUsers.map((user: any) => {
            const isAlert = isOverstaying(user.lastCheckIn) || isMembershipOverdue(user.membershipValidUntil);
            return (
              <div key={user.id} className={`group flex items-center justify-between gap-4 p-4 rounded-lg transition-all duration-300 border ${isAlert ? 'bg-error/5 border-error/20' : 'bg-surface-container-high border-outline-variant/5 hover:bg-surface-container-highest'}`}>
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black uppercase text-xs border transition-transform group-hover:scale-110 ${isAlert ? 'bg-error text-white border-error shadow-glow-error' : 'bg-primary/20 text-primary border-primary/10'}`}>
                    {user.firstName?.[0] || '?'}{user.lastName?.[0] || ''}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate font-body font-bold text-sm uppercase tracking-tight text-on-surface">
                      {user.firstName} {user.lastName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`material-symbols-outlined text-[12px] ${isAlert ? 'text-error animate-pulse' : 'text-primary'}`}>
                        {isAlert ? 'warning' : 'fitness_center'}
                      </span>
                      <p className="font-label text-[10px] uppercase tracking-wider text-tertiary">
                        {isMembershipOverdue(user.membershipValidUntil) ? 'Cuota morosa' : isOverstaying(user.lastCheckIn) ? 'Sesión prolongada' : (user.currentActivity || 'Entrenando')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-label text-[8px] uppercase tracking-widest text-tertiary mb-1">Ingreso</p>
                  <p className={`font-mono text-[11px] font-bold ${isAlert ? 'text-error' : 'text-on-surface'}`}>
                    {user.lastCheckIn?.toDate ? new Date(user.lastCheckIn.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleManualCheckout(user)}
                    disabled={processingUserId === user.id}
                    className="mt-2 rounded-md border border-outline-variant/20 px-3 py-1 font-label text-[8px] font-black uppercase tracking-widest text-tertiary transition-colors hover:border-error/40 hover:text-error disabled:opacity-40"
                  >
                    {processingUserId === user.id ? 'Cerrando...' : 'Marcar egreso'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {showMassConfirm ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center justify-between gap-3 p-4 rounded-xl bg-error/10 border border-error/30"
            >
              <span className="font-label text-[10px] uppercase tracking-widest text-error">
                ¿Finalizar sesiones antiguas?
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowMassConfirm(false)}
                  className="px-3 py-1.5 font-label text-[9px] uppercase tracking-widest text-tertiary hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmMassCheckout}
                  className="px-4 py-1.5 font-label text-[9px] uppercase tracking-widest font-bold text-white bg-error rounded-lg hover:bg-error/80 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleMassCheckout}
              disabled={processing || presentUsers.length === 0}
              className="w-full py-4 bg-surface-container-highest text-tertiary hover:text-white hover:bg-error/20 border border-outline-variant/10 rounded-xl font-label text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
            >
              {processing ? 'Procesando...' : 'Finalizar Sesiones Antiguas (+3h)'}
            </motion.button>
          )}
        </AnimatePresence>
        <p className="font-label text-[9px] uppercase tracking-[0.2em] text-tertiary text-center flex items-center justify-center gap-2">
          <span className="w-1 h-1 bg-tertiary rounded-full"></span>
          Panel de Control en Vivo
          <span className="w-1 h-1 bg-tertiary rounded-full"></span>
        </p>
      </div>
    </div>
  );
}
