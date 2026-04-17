'use client';
import { useState } from 'react';
import { Routine, Exercise } from '@/services/routine.service';

interface RoutineFormProps {
  initialData?: Routine;
  onSave: (data: any) => Promise<void>;
  loading: boolean;
}

export default function RoutineForm({ initialData, onSave, loading }: RoutineFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    userId: initialData?.userId || '',
    description: initialData?.description || '',
    status: initialData?.status || 'active',
  });

  const [exercises, setExercises] = useState<Exercise[]>(
    initialData?.exercises || [{ name: '', sets: '', notes: '' }]
  );

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: '', notes: '' }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...formData, exercises });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="font-label text-tertiary text-xs uppercase tracking-widest block pl-1">Título de la Rutina</label>
          <input 
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-surface-container-low text-on-surface p-4 font-body border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary/40 focus:bg-surface-container-high transition-all outline-none" 
            placeholder="Ej: Acondicionamiento General"
          />
        </div>
        <div className="space-y-3">
          <label className="font-label text-tertiary text-xs uppercase tracking-widest block pl-1">Asignar a Usuario (Email/ID)</label>
          <input 
            required
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="w-full bg-surface-container-low text-on-surface p-4 font-body border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary/40 focus:bg-surface-container-high transition-all outline-none" 
            placeholder="gino.pieretti00@gmail.com"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="font-label text-tertiary text-xs uppercase tracking-widest block pl-1">Descripción / Objetivos</label>
        <textarea 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full bg-surface-container-low text-on-surface p-4 font-body border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary/40 focus:bg-surface-container-high transition-all outline-none" 
          placeholder="Describe la intención de esta rutina..."
        />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4">
          <h4 className="font-headline font-bold uppercase tracking-tight text-primary-container">Ejercicios</h4>
          <button 
            type="button"
            onClick={handleAddExercise}
            className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Añadir Ejercicio
          </button>
        </div>

        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div key={index} className="bg-surface-container-low p-6 rounded relative group ghost-border border-l-4 border-l-outline-variant/30 focus-within:border-l-primary transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                   <input 
                    required
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    placeholder="Nombre (Ej: Press de Banca)"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 p-2 font-body focus:border-primary outline-none"
                   />
                </div>
                <div className="md:col-span-3">
                   <input 
                    required
                    value={exercise.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    placeholder="Series x Reps"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 p-2 font-body focus:border-primary outline-none"
                   />
                </div>
                <div className="md:col-span-4 pr-10">
                   <input 
                    value={exercise.notes || ''}
                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                    placeholder="Notas (opcional)"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 p-2 font-body focus:border-primary outline-none"
                   />
                </div>
              </div>
              {exercises.length > 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveExercise(index)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-error opacity-30 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8 flex justify-end gap-4">
        <button 
          disabled={loading}
          type="submit" 
          className="bg-gradient-primary text-on-primary font-label text-sm font-bold uppercase tracking-[0.2em] py-4 px-12 rounded-sm shadow-glow hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Rutina'}
        </button>
      </div>
    </form>
  );
}
