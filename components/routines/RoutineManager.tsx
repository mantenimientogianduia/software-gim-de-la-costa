'use client';
import { useState } from 'react';
import { useRoutines } from '@/hooks/use-routines';
import { Routine } from '@/services/routine.service';
import RoutineForm from './RoutineForm';

export default function RoutineManager({ instructorId }: { instructorId: string }) {
  const { routines, loading, error, saveRoutine } = useRoutines(instructorId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | undefined>();

  const handleCreate = () => {
    setEditingRoutine(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsFormOpen(true);
  };

  const handleSave = async (data: any) => {
    await saveRoutine({ ...data, instructorId }, editingRoutine?.id);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Gestión de Rutinas</h2>
        <button 
          onClick={handleCreate}
          className="bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-sm flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva Rutina
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-surface-container-high p-8 rounded-lg shadow-2xl ghost-border">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-xl font-bold uppercase tracking-tight">
              {editingRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-tertiary hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <RoutineForm 
            initialData={editingRoutine} 
            onSave={handleSave} 
            loading={loading} 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.map((routine) => (
            <div 
              key={routine.id} 
              className="bg-surface-container-low p-6 rounded-lg ghost-border hover:bg-surface-container-medium transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-headline text-lg font-bold uppercase tracking-tight leading-tight">{routine.title}</h4>
                  <span className={`font-label text-[10px] uppercase tracking-widest px-2 py-1 rounded ${routine.status === 'active' ? 'bg-primary/20 text-primary-container' : 'bg-surface-variant text-tertiary'}`}>
                    {routine.status}
                  </span>
                </div>
                <p className="font-body text-tertiary text-sm mb-6 line-clamp-2">{routine.description || 'Sin descripción'}</p>
                <div className="space-y-2">
                   <div className="font-label text-[10px] text-tertiary uppercase tracking-widest">Ejercicios: {routine.exercises.length}</div>
                   <div className="flex flex-wrap gap-2">
                      {routine.exercises.slice(0, 3).map((ex, i) => (
                        <span key={i} className="text-[10px] bg-surface-container-highest px-2 py-1 rounded text-on-surface opacity-70">
                          {ex.name}
                        </span>
                      ))}
                      {routine.exercises.length > 3 && <span className="text-[10px] opacity-40">+{routine.exercises.length - 3}</span>}
                   </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/15 flex justify-end">
                <button 
                  onClick={() => handleEdit(routine)}
                  className="font-label text-xs font-bold uppercase tracking-widest text-primary-container hover:text-white transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Editar
                </button>
              </div>
            </div>
          ))}
          
          {routines.length === 0 && !loading && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg border-2 border-dashed border-outline-variant/20 opacity-50">
               <span className="material-symbols-outlined text-6xl mb-4">fitness_center</span>
               <p className="font-label uppercase tracking-widest">No hay rutinas creadas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
