'use client';
import { useState, useEffect } from 'react';
import { 
  routineService, 
  Exercise, 
  TrainingPlan, 
  TrainingWeek, 
  DaySchema 
} from '@/services/routine.service';
import { userService, UserProfile } from '@/services/user.service';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

type Day = z.infer<typeof DaySchema>;

interface WeekState {
  order: number;
  type: 'base' | 'deload' | 'peak' | 'test';
  goal: string;
  days: Day[];
}

export default function RoutineEditor({ instructorId }: { instructorId: string }) {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'manage'>('build');
  const [myPlans, setMyPlans] = useState<TrainingPlan[]>([]);
  
  // Hierarchical State
  const [weeks, setWeeks] = useState<WeekState[]>([
    { order: 1, type: 'base', goal: '', days: [
      { order: 1, name: 'Día 1', blocks: [{ type: 'main', exercises: [] }] }
    ] }
  ]);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    userService.getAllUsers().then(data => setUsers(data as any));
    routineService.getAllExercises().then(setExerciseLibrary);
    routineService.getPlanTemplates().then(setMyPlans);
  }, [instructorId]);

  const addWeek = () => {
    const newOrder = weeks.length + 1;
    setWeeks([...weeks, { 
      order: newOrder, 
      type: 'base', 
      goal: '', 
      days: [{ order: 1, name: `Día 1`, blocks: [{ type: 'main', exercises: [] }] }] 
    }]);
    setActiveWeekIdx(weeks.length);
  };

  const addDay = (weekIdx: number) => {
    const updated = [...weeks];
    const newOrder = updated[weekIdx].days.length + 1;
    updated[weekIdx].days.push({
      order: newOrder,
      name: `Día ${newOrder}`,
      blocks: [{ type: 'main', exercises: [] }]
    });
    setWeeks(updated);
    setActiveDayIdx(newOrder - 1);
  };

  const addExercise = (weekIdx: number, dayIdx: number, blockIdx: number, ex: Exercise) => {
    const updated = [...weeks];
    updated[weekIdx].days[dayIdx].blocks[blockIdx].exercises.push({
      ...ex,
      prescribed: { sets: 3, reps: '10-12', load: 'RPE 8' }
    });
    setWeeks(updated);
  };

  const handleSave = async (asTemplate: boolean = true) => {
    if (!title) return alert('Título requerido');
    if (!asTemplate && !selectedUser) return alert('Selecciona un socio');

    setIsSaving(true);
    try {
      const planId = await routineService.createPlan({
        title,
        description,
        type: asTemplate ? 'template' : 'assignment',
        userId: asTemplate ? undefined : selectedUser,
        instructorId,
        status: asTemplate ? 'active' : 'active',
        weeksCount: weeks.length,
        level,
        tags: []
      });

      // Save each week
      for (const week of weeks) {
        await routineService.saveWeek({
          ...week,
          planId
        });
      }

      alert(asTemplate ? 'Plantilla guardada' : 'Plan asignado con éxito');
      setActiveTab('manage');
      routineService.getPlanTemplates().then(setMyPlans);
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
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
          Editor de Plan
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          className={`px-8 py-2 font-label text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all ${activeTab === 'manage' ? 'bg-primary text-white font-black' : 'text-tertiary hover:text-white'}`}
        >
          Mis Plantillas
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
            <div className="xl:col-span-8 space-y-6">
              <div className="bg-surface-container-low p-8 rounded-[2rem] ghost-border space-y-8">
                {/* Meta Config */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2 block">Título del Plan Maestro</label>
                    <input 
                      type="text"
                      placeholder="Ej: Periodización de Hipertrofia Fase 1"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-surface-container-high p-4 rounded-xl outline-none font-headline font-black text-2xl border border-outline-variant/10 focus:border-primary transition-all uppercase italic"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2 block">Nivel Sugerido</label>
                    <select 
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full bg-surface-container-high p-4 rounded-xl outline-none font-label text-xs uppercase tracking-widest font-black border border-outline-variant/10 focus:border-primary transition-all"
                    >
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>
                </div>

                {/* Week & Day Navigation PRO */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {weeks.map((week, idx) => (
                        <button 
                          key={idx}
                          onClick={() => { setActiveWeekIdx(idx); setActiveDayIdx(0); }}
                          className={`px-4 py-2 rounded-lg font-label text-[10px] uppercase tracking-widest transition-all ${activeWeekIdx === idx ? 'bg-primary text-white shadow-glow' : 'bg-surface-container-high text-tertiary hover:bg-surface-container-highest'}`}
                        >
                          Semana {week.order}
                        </button>
                      ))}
                      <button 
                        onClick={addWeek}
                        className="p-2 aspect-square rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-outline-variant/10">
                    {weeks[activeWeekIdx].days.map((day, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveDayIdx(idx)}
                        className={`px-6 py-3 rounded-xl font-headline text-xs font-black uppercase tracking-tight transition-all border ${activeDayIdx === idx ? 'border-primary text-primary bg-primary/5' : 'border-outline-variant/10 text-tertiary hover:bg-surface-container-high'}`}
                      >
                        {day.name}
                      </button>
                    ))}
                    <button 
                      onClick={() => addDay(activeWeekIdx)}
                      className="p-3 rounded-xl border border-dashed border-outline-variant/10 text-tertiary hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>

                {/* Exercise Editor for Active Day */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-xl font-black uppercase tracking-tight italic">
                      {weeks[activeWeekIdx].days[activeDayIdx].name} <span className="text-tertiary opacity-30">/</span> {weeks[activeWeekIdx].days[activeDayIdx].blocks[0].exercises.length} Ejercicios
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {weeks[activeWeekIdx].days[activeDayIdx].blocks[0].exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/5 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                          {exIdx + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                           <div className="md:col-span-2">
                             <p className="font-headline font-bold text-lg uppercase group-hover:text-primary transition-colors">{ex.name}</p>
                             <input 
                               type="text" 
                               value={ex.notes || ''} 
                               placeholder="Indicaciones técnicas..."
                               onChange={(e) => {
                                 const updated = [...weeks];
                                 updated[activeWeekIdx].days[activeDayIdx].blocks[0].exercises[exIdx].notes = e.target.value;
                                 setWeeks(updated);
                               }}
                               className="w-full bg-transparent border-b border-outline-variant/20 py-1 outline-none text-xs text-tertiary italic"
                             />
                           </div>
                           <div className="space-y-2">
                              <label className="font-label text-[8px] uppercase tracking-widest text-tertiary">Sets x Reps</label>
                              <input 
                                type="text"
                                value={ex.prescribed.reps}
                                onChange={(e) => {
                                  const updated = [...weeks];
                                  updated[activeWeekIdx].days[activeDayIdx].blocks[0].exercises[exIdx].prescribed.reps = e.target.value;
                                  setWeeks(updated);
                                }}
                                className="w-full bg-surface-container-lowest p-2 rounded-lg text-xs font-bold text-center"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="font-label text-[8px] uppercase tracking-widest text-tertiary">Carga / RPE</label>
                              <input 
                                type="text"
                                value={ex.prescribed.load || ''}
                                onChange={(e) => {
                                  const updated = [...weeks];
                                  updated[activeWeekIdx].days[activeDayIdx].blocks[0].exercises[exIdx].prescribed.load = e.target.value;
                                  setWeeks(updated);
                                }}
                                className="w-full bg-surface-container-lowest p-2 rounded-lg text-xs font-bold text-center"
                              />
                           </div>
                        </div>
                        <button 
                          onClick={() => {
                            const updated = [...weeks];
                            updated[activeWeekIdx].days[activeDayIdx].blocks[0].exercises.splice(exIdx, 1);
                            setWeeks(updated);
                          }}
                          className="p-3 text-error hover:bg-error/10 rounded-xl transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                    
                    {weeks[activeWeekIdx].days[activeDayIdx].blocks[0].exercises.length === 0 && (
                      <div className="py-20 border-2 border-dashed border-outline-variant/10 rounded-2xl text-center opacity-30">
                        <span className="material-symbols-outlined text-4xl mb-2">fitness_center</span>
                        <p className="font-label text-[10px] uppercase tracking-widest">Arrastra o elige ejercicios de la biblioteca</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row gap-4 items-end justify-between">
                   <div className="w-full md:max-w-xs">
                     <label className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2 block">Asignar a:</label>
                     <select 
                       value={selectedUser}
                       onChange={(e) => setSelectedUser(e.target.value)}
                       className="w-full bg-surface-container-high p-4 rounded-xl outline-none font-body text-sm"
                     >
                       <option value="">No asignar (Guardar como plantilla)</option>
                       {users.filter(u => u.role === 'socio').map(u => (
                         <option key={u.id} value={u.email}>{u.firstName} {u.lastName}</option>
                       ))}
                     </select>
                   </div>
                   <div className="flex gap-4">
                     <button 
                       onClick={() => handleSave(true)}
                       className="px-8 py-4 bg-surface-container-highest rounded-xl font-label text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all outline outline-1 outline-outline-variant/10"
                     >
                       Guardar Plantilla
                     </button>
                     <button 
                       onClick={() => handleSave(false)}
                       disabled={!selectedUser || isSaving}
                       className="px-12 py-4 bg-gradient-primary text-on-primary rounded-xl font-label text-xs font-black uppercase tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                     >
                       {isSaving ? 'Asignando...' : 'Asignar Socio'}
                     </button>
                   </div>
                </div>
              </div>
            </div>

            {/* LIBRARY SIDE */}
            <div className="xl:col-span-4 space-y-6">
               <div className="bg-surface-container-low p-8 rounded-[2rem] ghost-border sticky top-24">
                  <h3 className="font-headline text-lg font-black uppercase tracking-tight mb-6">Biblioteca Global</h3>
                  
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-tertiary text-lg">search</span>
                    <input 
                      type="text"
                      placeholder="Buscar ejercicios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-surface-container-high pl-12 pr-4 py-3 rounded-xl outline-none font-body text-sm border border-outline-variant/10 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredLibrary.map((ex, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => addExercise(activeWeekIdx, activeDayIdx, 0, ex)}
                        className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer group"
                      >
                        <p className="font-body font-bold text-sm uppercase tracking-tight">{ex.name}</p>
                        <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="manage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {myPlans.map(plan => (
              <div key={plan.id} className="bg-surface-container-low p-8 rounded-3xl ghost-border hover:shadow-xl transition-all group border-b-4 border-b-primary/40">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="font-headline font-black uppercase text-2xl group-hover:text-primary transition-colors italic">{plan.title}</h4>
                </div>
                <div className="flex gap-4 mb-8">
                   <div className="px-3 py-1 bg-surface-container-high rounded text-[10px] font-black uppercase tracking-widest text-tertiary">
                     {plan.weeksCount} Semanas
                   </div>
                   <div className="px-3 py-1 bg-surface-container-high rounded text-[10px] font-black uppercase tracking-widest text-primary">
                     {plan.level}
                   </div>
                </div>
                <div className="flex gap-3">
                   <button className="flex-1 py-4 bg-surface-container-highest rounded-xl font-label text-[10px] font-black uppercase hover:bg-primary transition-all">Ver Detalles</button>
                   <button className="flex-1 py-4 bg-primary text-white rounded-xl font-label text-[10px] font-black uppercase shadow-glow hover:scale-105 active:scale-95 transition-all">Asignar</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
