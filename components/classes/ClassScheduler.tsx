'use client';
import { useState } from 'react';
import { useClasses } from '@/hooks/use-classes';
import { classService, GymClass } from '@/services/class.service';
import WeeklyCalendar from '@/components/classes/WeeklyCalendar';
import { Timestamp } from 'firebase/firestore';

export default function ClassScheduler({ instructorId }: { instructorId: string }) {
  const { classes, refreshClasses } = useClasses();
  const [isCreating, setIsCreating] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    capacity: 20,
    date: '',
    time: ''
  });

  const handleCreate = async () => {
    try {
      const start = new Date(`${newClass.date}T${newClass.time}`);
      await classService.createClass({
        title: newClass.title,
        instructorId,
        capacity: newClass.capacity,
        enrolledCount: 0,
        startTime: Timestamp.fromDate(start),
        status: 'scheduled'
      });
      setIsCreating(false);
      refreshClasses();
    } catch (err) {
      alert('Error al crear clase');
    }
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight italic">Calendario de Clases</h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-primary text-white font-label text-[10px] font-black uppercase tracking-widest rounded-xl shadow-glow"
          >
            Nueva Sesión
          </button>
       </div>

       {isCreating && (
         <div className="bg-surface-container-low p-8 rounded-3xl ghost-border space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <input 
                 type="text" 
                 placeholder="Título de la clase (ej: HIIT)" 
                 className="bg-black/20 p-4 rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-primary"
                 onChange={e => setNewClass({...newClass, title: e.target.value})}
               />
               <input 
                 type="number" 
                 placeholder="Capacidad" 
                 defaultValue={20}
                 className="bg-black/20 p-4 rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-primary"
                 onChange={e => setNewClass({...newClass, capacity: parseInt(e.target.value)})}
               />
               <input 
                 type="date" 
                 className="bg-black/20 p-4 rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-primary"
                 onChange={e => setNewClass({...newClass, date: e.target.value})}
               />
               <input 
                 type="time" 
                 className="bg-black/20 p-4 rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-primary"
                 onChange={e => setNewClass({...newClass, time: e.target.value})}
               />
            </div>
            <div className="flex justify-end gap-4">
               <button onClick={() => setIsCreating(false)} className="px-6 py-3 text-tertiary font-label text-[10px] uppercase">Cancelar</button>
               <button onClick={handleCreate} className="px-6 py-3 bg-gradient-primary rounded-xl font-headline text-xs font-black uppercase tracking-widest">Crear Sesión</button>
            </div>
         </div>
       )}

       <WeeklyCalendar classes={classes} />
    </div>
  );
}
