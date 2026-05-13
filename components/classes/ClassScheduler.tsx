'use client';
import { useState } from 'react';
import { classService, GymClass } from '@/services/class.service';
import { useClasses } from '@/hooks/use-classes';
import { Timestamp } from 'firebase/firestore';

import WeeklyCalendar from '@/components/classes/WeeklyCalendar';

export default function ClassScheduler({ instructorId }: { instructorId: string }) {
  const { classes, loading, refreshClasses } = useClasses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('calendar');
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    capacity: 20,
    date: '',
    time: '',
    weeksCount: 4,
    days: [] as number[],
  });

  const daysOfWeek = [
    { label: 'L', value: 1 },
    { label: 'M', value: 2 },
    { label: 'M', value: 3 },
    { label: 'J', value: 4 },
    { label: 'V', value: 5 },
    { label: 'S', value: 6 },
    { label: 'D', value: 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRecurring) {
        if (formData.days.length === 0) {
          alert('Selecciona al menos un día para la recurrencia.');
          return;
        }
        await classService.createRecurringClasses({
          title: formData.title,
          instructorId,
          capacity: Number(formData.capacity),
          status: 'active'
        }, {
          days: formData.days,
          startTimeStr: formData.time,
          durationMin: 60
        }, formData.weeksCount);
      } else {
        const start = new Date(`${formData.date}T${formData.time}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour
        
        await classService.createClass({
          title: formData.title,
          instructorId,
          startTime: Timestamp.fromDate(start),
          endTime: Timestamp.fromDate(end),
          capacity: Number(formData.capacity),
          status: 'active'
        });
      }
      
      setIsFormOpen(false);
      refreshClasses();
      alert('Clase(s) publicada(s) con éxito.');
    } catch (err) {
      console.error(err);
      alert('Error al publicar clases');
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
           <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Agenda de Clases</h2>
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
                Cuadrícula
              </button>
           </div>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-sm hover:scale-105 active:scale-95 transition-all"
        >
          Crear Clase
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-surface-container-high p-8 rounded-lg shadow-2xl ghost-border mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex bg-surface-container-low p-1 rounded-sm gap-1 mb-8 max-w-xs mx-auto">
              <button 
                onClick={() => setIsRecurring(false)}
                className={`flex-1 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${!isRecurring ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
              >
                Individual
              </button>
              <button 
                onClick={() => setIsRecurring(true)}
                className={`flex-1 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${isRecurring ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
              >
                Recurrente
              </button>
           </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input 
                required
                placeholder="Título de la Clase (ej: Crossfit Nivel 2)"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary uppercase text-sm"
              />
            </div>
            {!isRecurring && (
              <input 
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
              />
            )}
            <input 
              required
              type="time"
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
              className="bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
            />
            <input 
              required
              type="number"
              placeholder="Cupo Máximo"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
              className="bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
            />
            {isRecurring && (
               <div className="md:col-span-2 space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`w-12 h-12 rounded-full font-label text-xs font-bold transition-all border ${formData.days.includes(day.value) ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-container-low text-tertiary border-outline-variant/10'}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-label text-xs uppercase tracking-widest text-tertiary">Semanas a generar:</span>
                     <input 
                        type="number"
                        min="1"
                        max="12"
                        value={formData.weeksCount}
                        onChange={e => setFormData({...formData, weeksCount: Number(e.target.value)})}
                        className="bg-surface-container-low p-2 w-20 rounded font-mono text-sm text-center outline-none border border-outline-variant/10"
                     />
                  </div>
               </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="font-label text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity px-6">Cancelar</button>
              <button type="submit" className="bg-gradient-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest px-10 py-4 rounded-sm shadow-glow">
                {isRecurring ? 'Generar Cronograma' : 'Publicar Clase'}
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <WeeklyCalendar classes={classes} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => (
            <div key={c.id} className="bg-surface-container-low p-6 rounded-lg ghost-border relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-headline font-bold text-lg uppercase tracking-tight">{c.title}</h4>
                  <div className="bg-primary/20 text-primary-container px-2 py-1 rounded font-label text-[9px] uppercase font-black">
                    {c.enrolledCount} / {c.capacity}
                  </div>
                </div>
                <p className="font-label text-xs text-tertiary uppercase tracking-widest mb-4">
                  {c.startTime.toDate().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })} | {c.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="pt-4 border-t border-outline-variant/15 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-label text-[10px] text-tertiary uppercase italic">Coach: {c.instructorId}</span>
                  <button className="text-error font-label text-[10px] uppercase font-bold hover:underline">Cancelar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
