'use client';
import { UserProfile } from '@/services/user.service';
import { motion } from 'motion/react';
import StreakDisplay from '@/components/training/StreakDisplay';
import AttendanceHistory from '@/components/profesor/AttendanceHistory';

export default function StudentDetailView({ student, onBack }: { student: UserProfile & { id: string }, onBack: () => void }) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <header className="flex items-center justify-between bg-surface-container-low p-6 rounded-3xl ghost-border shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline font-black italic text-2xl text-primary tracking-tighter uppercase leading-none">
              {student.firstName} {student.lastName}
            </h2>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mt-1">Legajo del Socio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-on-primary rounded-full font-label text-[10px] font-black uppercase tracking-widest shadow-glow">
            Asignar Rutina
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Data & Medical */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-surface-container-low p-8 rounded-[2rem] ghost-border shadow-xl">
             <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_page</span>
              Datos Personales
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5">
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Email de Contacto</p>
                <p className="font-body text-sm font-bold">{student.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5">
                  <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">DNI</p>
                  <p className="font-body text-sm font-bold">{student.dni || 'No registrado'}</p>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5">
                  <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Peso</p>
                  <p className="font-body text-sm font-bold">{student.weight || '--'} KG</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low p-8 rounded-[2rem] ghost-border shadow-xl">
            <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">medical_information</span>
              Antecedentes
            </h3>
            <div className="space-y-6">
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-2">Historial Médico</p>
                <p className="font-body text-sm bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/5 italic">
                  {student.medicalHistory || 'Sin antecedentes reportados.'}
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-2">Experiencia Previa</p>
                <p className="font-body text-sm bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/5 italic">
                  {student.priorExperience || 'Sin experiencia previa reportada.'}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low p-8 rounded-[2rem] ghost-border shadow-xl">
            <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">target</span>
              Objetivos
            </h3>
            <p className="font-body text-sm bg-primary/5 text-primary p-4 rounded-xl border border-primary/10 italic font-medium">
              "{student.goals || 'El socio aún no ha definido sus metas.'}"
            </p>
          </section>
        </div>

        {/* Right Column: Activity & History */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border shadow-2xl">
             <StreakDisplay userId={student.email} weeklyTrainingGoal={student.weeklyTrainingGoal} />
          </div>
          
          <section className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border shadow-xl">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-headline font-bold text-lg uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">fitness_center</span>
                {student.hasRoutine ? 'Rutina Asignada' : 'Rutina No Asignada'}
               </h3>
               <button className="text-primary font-label text-[10px] font-black uppercase tracking-widest">
                 {student.hasRoutine ? 'Ver Rutina' : 'Configurar Ahora'}
               </button>
             </div>
             {student.hasRoutine ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-headline text-sm font-bold uppercase">Hipertrofia - Nivel 2</p>
                      <p className="font-body text-[10px] text-tertiary">Última actualización: Hace 2 días</p>
                    </div>
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  </div>
                </div>
             ) : (
                <div className="py-12 text-center bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/10">
                   <span className="material-symbols-outlined text-4xl text-tertiary/20 mb-3">list_alt</span>
                   <p className="font-body text-tertiary text-sm">Este socio no tiene una rutina activa.</p>
                </div>
             )}
          </section>

          <section className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border shadow-xl">
             <AttendanceHistory userEmail={student.email} />
          </section>
        </div>
      </div>
    </div>
  );
}
