'use client';
import { useState, useEffect } from 'react';
import { routineService, Exercise, Routine } from '@/services/routine.service';
import { userService, UserProfile } from '@/services/user.service';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoutineEditor({ instructorId }: { instructorId: string }) {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'manage'>('build');
  const [myRoutines, setMyRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    userService.getAllUsers().then(data => setUsers(data as any));
    routineService.getAllExercises().then(setExerciseLibrary);
    routineService.getInstructorRoutines(instructorId).then(setMyRoutines);
  }, [instructorId]);

  const addExercise = (ex: Exercise) => {
    setCurrentExercises([...currentExercises, { ...ex }]);
  };

  const removeExercise = (index: number) => {
    setCurrentExercises(currentExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const updated = [...currentExercises];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentExercises(updated);
  };

  const handleSave = async () => {
    if (!selectedUser || !title || currentExercises.length === 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSaving(true);
    try {
      await routineService.createRoutine({
        userId: selectedUser,
        instructorId,
        title,
        description,
        exercises: currentExercises,
        status: 'active'
      });
      alert('Rutina creada con éxito');
      // Reset
      setTitle('');
      setDescription('');
      setCurrentExercises([]);
      setSelectedUser('');
      routineService.getInstructorRoutines(instructorId).then(setMyRoutines);
    } catch (err) {
      console.error(err);
      alert('Error al guardar rutina');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLibrary = exerciseLibrary.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-1 bg-surface-container-high p-1 rounded-sm w-fit">
        <button 
          onClick={() => setActiveTab('build')}
          className={`px-8 py-2 font-label text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all ${activeTab === 'build' ? 'bg-primary text-white font-black' : 'text-tertiary hover:text-white'}`}
        >
          Crear Nueva
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          className={`px-8 py-2 font-label text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all ${activeTab === 'manage' ? 'bg-primary text-white font-black' : 'text-tertiary hover:text-white'}`}
        >
          Mis Rutinas
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'build' ? (
          <motion.div 
            key="build"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* BUILDER SIDE */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-surface-container-low p-8 rounded-2xl ghost-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2 block">Socio Destinatario</label>
                    <select 
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full bg-surface-container-high p-4 rounded-xl outline-none font-body text-sm border border-outline-variant/10 focus:border-primary transition-all"
                    >
                      <option value="">Seleccionar Socio...</option>
                      {users.filter(u => u.role === 'socio').map(u => (
                        <option key={u.id} value={u.email}>{u.firstName} {u.lastName} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2 block">Título de la Rutina</label>
                    <input 
                      type="text"
                      placeholder="Ej: Empuje / Tracción / Piernas..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-surface-container-high p-4 rounded-xl outline-none font-body text-sm border border-outline-variant/10 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2 block">Descripción u Objetivos</label>
                  <textarea 
                    placeholder="Enfoque en hipertrofia, control de carga..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-surface-container-high p-4 rounded-xl outline-none font-body text-sm border border-outline-variant/10 focus:border-primary transition-all min-h-[80px]"
                  />
                </div>

                <div className="pt-6 border-t border-outline-variant/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-headline text-lg font-black uppercase tracking-tight">Ejercicios Seleccionados</h3>
                    <span className="font-label text-[10px] text-tertiary">{currentExercises.length} Total</span>
                  </div>

                  <div className="space-y-3">
                    {currentExercises.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-outline-variant/10 rounded-xl text-center opacity-30">
                        <p className="font-label text-[10px] uppercase tracking-widest">No hay ejercicios aún</p>
                        <p className="text-xs font-body mt-2">Agregalos desde la biblioteca de la derecha</p>
                      </div>
                    ) : (
                      currentExercises.map((ex, idx) => (
                        <div key={idx} className="bg-surface-container-high p-4 rounded-xl border border-outline-variant/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                            <input 
                              type="text" 
                              value={ex.name} 
                              onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                              placeholder="Nombre"
                              className="bg-transparent border-b border-outline-variant/20 py-1 outline-none text-sm font-bold uppercase"
                            />
                            <input 
                              type="text" 
                              value={ex.sets} 
                              onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                              placeholder="Sets x Reps"
                              className="bg-transparent border-b border-outline-variant/20 py-1 outline-none text-sm italic"
                            />
                            <input 
                              type="text" 
                              value={ex.notes || ''} 
                              onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                              placeholder="Notas opcionales"
                              className="bg-transparent border-b border-outline-variant/20 py-1 outline-none text-xs text-tertiary"
                            />
                          </div>
                          <button 
                            onClick={() => removeExercise(idx)}
                            className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-8 pt-6 border-t border-outline-variant/10 flex justify-end">
                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="bg-gradient-primary text-on-primary px-12 py-4 rounded-xl font-label text-sm font-black uppercase tracking-[0.2em] shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                   >
                     {isSaving ? 'Guardando...' : 'Publicar Rutina'}
                   </button>
                </div>
              </div>
            </div>

            {/* LIBRARY SIDE */}
            <div className="xl:col-span-5 space-y-6">
               <div className="bg-surface-container-low p-8 rounded-2xl ghost-border sticky top-24">
                  <h3 className="font-headline text-lg font-black uppercase tracking-tight mb-6">Biblioteca Global</h3>
                  
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-tertiary text-lg">search</span>
                    <input 
                      type="text"
                      placeholder="Buscar ejercicio en historial..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-surface-container-high pl-12 pr-4 py-3 rounded-xl outline-none font-body text-sm border border-outline-variant/10 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredLibrary.length > 0 ? (
                      filteredLibrary.map((ex, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => addExercise(ex)}
                          className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all cursor-pointer group"
                        >
                          <div>
                            <p className="font-body font-bold text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{ex.name}</p>
                            <p className="font-label text-[9px] text-tertiary uppercase mt-1">{ex.sets}</p>
                          </div>
                          <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center opacity-30 italic text-xs">
                        No se encontraron ejercicios previos.
                        <button 
                          onClick={() => addExercise({ name: searchTerm, sets: '4x12', notes: '' })}
                          className="block mx-auto mt-4 text-primary hover:underline not-italic"
                        >
                          + Crear "{searchTerm}" nuevo
                        </button>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="manage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {myRoutines.map(routine => (
              <div key={routine.id} className="bg-surface-container-low p-6 rounded-2xl ghost-border hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-headline font-black uppercase text-xl group-hover:text-primary transition-colors">{routine.title}</h4>
                  <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${routine.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-tertiary'}`}>
                    {routine.status}
                  </span>
                </div>
                <p className="font-body text-xs text-tertiary mb-6 line-clamp-2">Para: {routine.userId}</p>
                <div className="space-y-1 mb-8">
                  {routine.exercises.slice(0, 3).map((ex, i) => (
                    <p key={i} className="text-[10px] text-on-surface opacity-70">• {ex.name}</p>
                  ))}
                  {routine.exercises.length > 3 && <p className="text-[10px] text-tertiary">+{routine.exercises.length - 3} más...</p>}
                </div>
                <div className="flex gap-3">
                   <button className="flex-1 py-3 bg-surface-container-high rounded-xl font-label text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Editar</button>
                   <button className="p-3 bg-surface-container-high rounded-xl text-error hover:bg-error/10 transition-all">
                     <span className="material-symbols-outlined text-sm">archive</span>
                   </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
