'use client';
import { useState } from 'react';
import { useClasses, useUserBookings } from '@/hooks/use-classes';
import { classService, GymClass } from '@/services/class.service';
import WeeklyCalendar from '@/components/classes/WeeklyCalendar';

export default function ClassBookingList({ userId }: { userId: string }) {
  const { classes, loading: classesLoading, refreshClasses } = useClasses();
  const { bookings, loading: bookingsLoading, refreshBookings } = useUserBookings(userId);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('calendar');
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);

  const isBooked = (classId: string) => bookings.some(b => b.classId === classId);

  const handleBooking = async (classId: string) => {
    setBookingInProgress(classId);
    try {
      await classService.bookClass(classId, userId);
      await Promise.all([refreshClasses(), refreshBookings()]);
    } catch (err: any) {
      alert(err.message || 'Error al reservar');
    } finally {
      setBookingInProgress(null);
    }
  };

  if (classesLoading || bookingsLoading) {
    return (
      <div className="py-24 text-center animate-pulse">
        <p className="font-label uppercase tracking-widest text-tertiary">Consultando horarios disponibles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Reservar Clases</h2>
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
        <WeeklyCalendar classes={classes} onClassClick={setSelectedClass} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map(c => {
            const booked = isBooked(c.id!);
            const isFull = c.enrolledCount >= c.capacity;

            return (
              <div key={c.id} className={`bg-surface-container-low p-6 rounded-lg ghost-border flex flex-col justify-between transition-all ${booked ? 'border-l-4 border-l-primary shadow-glow' : ''}`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline font-bold text-xl uppercase tracking-tight">{c.title}</h3>
                    <div className={`font-label text-[10px] font-bold px-2 py-1 rounded ${isFull ? 'bg-error/20 text-error' : 'bg-surface-container-highest text-tertiary'}`}>
                      {c.enrolledCount} / {c.capacity}
                    </div>
                  </div>
                  <p className="font-label text-sm text-tertiary uppercase tracking-widest mb-6">
                    {c.startTime.toDate().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}<br />
                    <span className="text-on-surface font-black">{c.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HS</span>
                  </p>
                </div>

                <button
                  onClick={() => !booked && !isFull && handleBooking(c.id!)}
                  disabled={booked || isFull || bookingInProgress === c.id}
                  className={`w-full py-4 px-6 font-label text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                    booked
                      ? 'bg-primary/20 text-primary cursor-default'
                      : isFull
                        ? 'bg-surface-container-highest text-tertiary cursor-not-allowed opacity-50'
                        : 'bg-gradient-primary text-on-primary shadow-glow hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {bookingInProgress === c.id ? 'Procesando...' : booked ? 'Ya estas anotado' : isFull ? 'Clase Completa' : 'Reservar Lugar'}
                </button>
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
          bookingInProgress={bookingInProgress === selectedClass.id}
          onClose={() => setSelectedClass(null)}
          onBook={async () => {
            await handleBooking(selectedClass.id!);
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
  bookingInProgress,
  onClose,
  onBook,
}: {
  gymClass: GymClass;
  booked: boolean;
  bookingInProgress: boolean;
  onClose: () => void;
  onBook: () => Promise<void>;
}) {
  const isFull = gymClass.enrolledCount >= gymClass.capacity;
  const start = gymClass.startTime.toDate();
  const end = gymClass.endTime?.toDate?.();

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar detalle" />
      <div className="relative w-full max-w-lg bg-surface-container-low rounded-2xl ghost-border p-6 shadow-2xl">
        <div className="flex justify-between gap-4 mb-6">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary font-black">Detalle de clase</p>
            <h3 className="mt-2 font-headline text-3xl font-black uppercase tracking-tight">{gymClass.title}</h3>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded bg-surface-container-high flex items-center justify-center" aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <DetailItem label="Fecha" value={start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} />
          <DetailItem label="Horario" value={`${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`} />
          <DetailItem label="Anotados" value={`${gymClass.enrolledCount}`} />
          <DetailItem label="Capacidad" value={`${gymClass.capacity}`} />
        </div>

        <button
          onClick={onBook}
          disabled={booked || isFull || bookingInProgress}
          className={`w-full py-4 px-6 font-label text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
            booked
              ? 'bg-primary/20 text-primary cursor-default'
              : isFull
                ? 'bg-surface-container-highest text-tertiary cursor-not-allowed opacity-50'
                : 'bg-gradient-primary text-on-primary shadow-glow hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {bookingInProgress ? 'Procesando...' : booked ? 'Ya estas anotado' : isFull ? 'Clase Completa' : 'Reservar Lugar'}
        </button>
      </div>
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
