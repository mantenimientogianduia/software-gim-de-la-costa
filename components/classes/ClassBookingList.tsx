'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClasses, useUserBookings } from '@/hooks/use-classes';
import { classService, GymClass } from '@/services/class.service';
import WeeklyCalendar from '@/components/classes/WeeklyCalendar';

export default function ClassBookingList({ userId }: { userId: string }) {
  const { classes, loading: classesLoading, refreshClasses } = useClasses();
  const { bookings, loading: bookingsLoading, refreshBookings } = useUserBookings(userId);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('calendar');
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getBookingForClass = (classId: string) => bookings.find(b => b.classId === classId);
  const isBooked = (classId: string) => bookings.some(b => b.classId === classId);
  const bookedClassIds = bookings.map(b => b.classId);

  const handleBooking = async (classId: string) => {
    setActionInProgress(classId);
    try {
      await classService.bookClass(classId, userId);
      await Promise.all([refreshClasses(), refreshBookings()]);
      showToast('¡Reserva confirmada! Nos vemos en clase.', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Error al reservar. Intenta de nuevo.', 'err');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = async (classId: string) => {
    const booking = getBookingForClass(classId);
    if (!booking?.id) return;
    setActionInProgress(classId);
    try {
      await classService.cancelBooking(booking.id, classId);
      await Promise.all([refreshClasses(), refreshBookings()]);
      showToast('Reserva cancelada.', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Error al cancelar. Intenta de nuevo.', 'err');
    } finally {
      setActionInProgress(null);
    }
  };

  if (classesLoading || bookingsLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-label uppercase tracking-widest text-tertiary text-xs">Consultando horarios disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Reservar Clases</h2>
          {bookings.length > 0 && (
            <p className="mt-1 font-label text-[10px] text-primary uppercase tracking-widest">
              {bookings.length} {bookings.length === 1 ? 'clase reservada' : 'clases reservadas'}
            </p>
          )}
        </div>
        <div className="flex bg-surface-container-low p-1 rounded-sm gap-1 border border-outline-variant/10">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${viewMode === 'calendar' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">calendar_view_week</span>
            Calendario
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${viewMode === 'grid' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            Cuadricula
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <WeeklyCalendar
          classes={classes}
          onClassClick={setSelectedClass}
          bookedClassIds={bookedClassIds}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map(c => {
            const booked = isBooked(c.id!);
            const isFull = c.enrolledCount >= c.capacity && !booked;
            const inProgress = actionInProgress === c.id;
            const start = c.startTime.toDate();
            const end = c.endTime?.toDate?.();
            const durationMin = end
              ? Math.round((end.getTime() - start.getTime()) / 60000)
              : null;
            const spotsLeft = c.capacity - c.enrolledCount;

            return (
              <div
                key={c.id}
                className={`bg-surface-container-low p-6 rounded-lg ghost-border flex flex-col justify-between transition-all ${booked ? 'border-l-4 border-l-primary shadow-[0_0_20px_rgba(255,87,34,0.1)]' : ''}`}
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-headline font-bold text-xl uppercase tracking-tight">{c.title}</h3>
                    <div className="flex items-center gap-2">
                      {booked && (
                        <span className="flex items-center gap-1 font-label text-[8px] font-bold px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Anotado
                        </span>
                      )}
                      <div className={`font-label text-[10px] font-bold px-2 py-1 rounded ${isFull ? 'bg-error/20 text-error' : 'bg-surface-container-highest text-tertiary'}`}>
                        {c.enrolledCount} / {c.capacity}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                    <div className="flex items-center gap-1.5 text-tertiary">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      <span className="font-label text-[10px] uppercase tracking-widest">
                        {start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                      <span className="font-label text-[10px] uppercase tracking-widest font-black">
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                        {durationMin ? ` · ${durationMin} min` : ''}
                      </span>
                    </div>
                    {!booked && !isFull && (
                      <div className="flex items-center gap-1.5 text-tertiary">
                        <span className="material-symbols-outlined text-sm">group</span>
                        <span className="font-label text-[10px] uppercase tracking-widest">
                          {spotsLeft} {spotsLeft === 1 ? 'lugar libre' : 'lugares libres'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {booked ? (
                  <button
                    onClick={() => handleCancel(c.id!)}
                    disabled={inProgress}
                    className="w-full py-3 px-4 font-label text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm border border-outline-variant/20 text-tertiary hover:border-error/40 hover:text-error disabled:opacity-50"
                  >
                    {inProgress ? 'Procesando...' : 'Cancelar reserva'}
                  </button>
                ) : (
                  <button
                    onClick={() => !isFull && handleBooking(c.id!)}
                    disabled={isFull || inProgress}
                    className={`w-full py-4 px-6 font-label text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                      isFull
                        ? 'bg-surface-container-highest text-tertiary cursor-not-allowed opacity-50'
                        : 'bg-gradient-primary text-on-primary shadow-glow hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {inProgress ? 'Procesando...' : isFull ? 'Clase Completa' : 'Reservar Lugar'}
                  </button>
                )}
              </div>
            );
          })}

          {classes.length === 0 && (
            <div className="col-span-full py-24 text-center bg-surface-container-lowest rounded-lg border-2 border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-20">calendar_month</span>
              <p className="font-label uppercase tracking-widest opacity-50">No hay clases programadas por ahora</p>
            </div>
          )}
        </div>
      )}

      {selectedClass && (
        <ClassDetailDialog
          gymClass={selectedClass}
          booked={isBooked(selectedClass.id!)}
          inProgress={actionInProgress === selectedClass.id}
          onClose={() => setSelectedClass(null)}
          onBook={async () => {
            await handleBooking(selectedClass.id!);
            setSelectedClass(null);
          }}
          onCancel={async () => {
            await handleCancel(selectedClass.id!);
            setSelectedClass(null);
          }}
        />
      )}
    </div>
  );
}

function ClassDetailDialog({
  gymClass,
  booked,
  inProgress,
  onClose,
  onBook,
  onCancel,
}: {
  gymClass: GymClass;
  booked: boolean;
  inProgress: boolean;
  onClose: () => void;
  onBook: () => Promise<void>;
  onCancel: () => Promise<void>;
}) {
  const isFull = gymClass.enrolledCount >= gymClass.capacity && !booked;
  const start = gymClass.startTime.toDate();
  const end = gymClass.endTime?.toDate?.();
  const durationMin = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar detalle" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg bg-surface-container-low rounded-2xl ghost-border p-6 shadow-2xl"
      >
        <div className="flex justify-between gap-4 mb-6">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary font-black">Detalle de clase</p>
            <h3 className="mt-2 font-headline text-3xl font-black uppercase tracking-tight">{gymClass.title}</h3>
            {booked && (
              <span className="inline-flex items-center gap-1.5 mt-2 font-label text-[9px] font-bold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Ya estás anotado
              </span>
            )}
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded bg-surface-container-high flex items-center justify-center shrink-0" aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <DetailItem label="Fecha" value={start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} />
          <DetailItem
            label="Horario"
            value={`${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}${durationMin ? ` (${durationMin} min)` : ''}`}
          />
          <DetailItem label="Anotados" value={`${gymClass.enrolledCount}`} />
          <DetailItem label="Capacidad" value={`${gymClass.capacity}`} />
        </div>

        {booked ? (
          <button
            onClick={onCancel}
            disabled={inProgress}
            className="w-full py-4 px-6 font-label text-xs font-bold uppercase tracking-widest transition-all rounded-sm border border-outline-variant/20 text-tertiary hover:border-error/40 hover:text-error disabled:opacity-50"
          >
            {inProgress ? 'Procesando...' : 'Cancelar mi reserva'}
          </button>
        ) : (
          <button
            onClick={onBook}
            disabled={isFull || inProgress}
            className={`w-full py-4 px-6 font-label text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
              isFull
                ? 'bg-surface-container-highest text-tertiary cursor-not-allowed opacity-50'
                : 'bg-gradient-primary text-on-primary shadow-glow hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {inProgress ? 'Procesando...' : isFull ? 'Clase Completa' : 'Reservar Lugar'}
          </button>
        )}
      </motion.div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-high p-4 rounded">
      <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-1">{label}</p>
      <p className="font-body text-sm font-bold capitalize">{value}</p>
    </div>
  );
}
