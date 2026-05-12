'use client';
import { useState } from 'react';
import { useClasses, useUserBookings } from '@/hooks/use-classes';
import { classService } from '@/services/class.service';
import WeeklyCalendar from '@/components/classes/WeeklyCalendar';

export default function ClassBookingList({ userId }: { userId: string }) {
  const { classes, loading: classesLoading, refreshClasses } = useClasses();
  const { bookings, loading: bookingsLoading, refreshBookings } = useUserBookings(userId);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('calendar');

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
      <div className="flex justify-between items-center">
        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Reservar Clases</h2>
        <div className="flex bg-surface-container-low p-1.5 rounded-xl gap-1 border border-white/5">
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 font-label text-[10px] uppercase tracking-widest rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">calendar_view_week</span>
            Calendario
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 font-label text-[10px] uppercase tracking-widest rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            Cuadrícula
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <WeeklyCalendar 
          classes={classes} 
          onClassClick={(c) => {
            const booked = isBooked(c.id!);
            const isFull = c.enrolledCount >= c.capacity;
            if (!booked && !isFull) {
              if (confirm(`¿Quieres reservar tu lugar en ${c.title}?`)) {
                handleBooking(c.id!);
              }
            } else if (booked) {
              alert('Ya estás anotado en esta clase.');
            } else {
              alert('Esta clase está completa.');
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map(c => {
            const booked = isBooked(c.id!);
            const isFull = c.enrolledCount >= c.capacity;
            
            return (
              <div key={c.id} className={`bg-surface-container-low p-8 rounded-3xl ghost-border flex flex-col justify-between transition-all ${booked ? 'border-primary border-2 shadow-glow' : ''}`}>
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-headline font-black text-2xl uppercase tracking-tight italic">{c.title}</h3>
                    <div className={`font-label text-[10px] font-black px-3 py-1 rounded-full ${isFull ? 'bg-error/20 text-error' : 'bg-surface-container-highest text-tertiary'}`}>
                      {c.enrolledCount} / {c.capacity}
                    </div>
                  </div>
                  <p className="font-label text-xs text-tertiary uppercase tracking-[0.2em] mb-8 leading-relaxed">
                    { (c.startTime.toDate ? c.startTime.toDate() : new Date(c.startTime)).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}<br/>
                    <span className="text-primary font-black text-xl">{(c.startTime.toDate ? c.startTime.toDate() : new Date(c.startTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HS</span>
                  </p>
                </div>
                
                <button 
                  onClick={() => !booked && !isFull && handleBooking(c.id!)}
                  disabled={booked || isFull || bookingInProgress === c.id}
                  className={`w-full py-5 px-6 font-headline text-xs font-black uppercase tracking-widest transition-all rounded-xl ${
                    booked 
                    ? 'bg-primary/20 text-primary cursor-default' 
                    : isFull 
                    ? 'bg-surface-container-highest text-tertiary cursor-not-allowed opacity-50' 
                    : 'bg-gradient-primary text-on-primary shadow-glow hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {bookingInProgress === c.id ? 'Sincronizando...' : booked ? 'Confirmado' : isFull ? 'Completo' : 'Reservar'}
                </button>
              </div>
            );
          })}

          {classes.length === 0 && (
            <div className="col-span-full py-32 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-white/5">
              <span className="material-symbols-outlined text-5xl mb-6 opacity-20">event_busy</span>
              <p className="font-label uppercase tracking-widest opacity-40">No hay clases programadas esta semana</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
