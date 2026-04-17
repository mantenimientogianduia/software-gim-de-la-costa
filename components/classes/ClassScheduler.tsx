'use client';
import { useState } from 'react';
import { classService, GymClass } from '@/services/class.service';
import { useClasses } from '@/hooks/use-classes';
import { Timestamp } from 'firebase/firestore';

export default function ClassScheduler({ instructorId }: { instructorId: string }) {
  const { classes, loading, refreshClasses } = useClasses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    capacity: 20,
    date: '',
    time: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    
    setIsFormOpen(false);
    refreshClasses();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Agenda de Clases</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-sm hover:scale-105 active:scale-95 transition-all"
        >
          Crear Clase
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-surface-container-high p-8 rounded-lg shadow-2xl ghost-border mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input 
                required
                placeholder="Título de la Clase (ej: Crossfit Nivel 2)"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
              />
            </div>
            <input 
              required
              type="date"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
            />
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
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="font-label text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity px-6">Cancelar</button>
              <button type="submit" className="bg-gradient-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest px-10 py-4 rounded-sm shadow-glow">Publicar Horario</button>
            </div>
          </form>
        </div>
      )}

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
    </div>
  );
}
