'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import RoutineManager from '@/components/routines/RoutineManager';

export default function ProfesorDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'classes' | 'routines'>('classes');

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      <aside className="hidden md:flex flex-col h-full w-80 bg-surface-container-low py-8 z-40 border-r border-outline-variant/15">
        <div className="px-6 mb-12">
          <h2 className="font-headline text-xl text-primary-container font-black tracking-tighter uppercase">GYM DE LA COSTA</h2>
          <div className="mt-4 font-label font-bold uppercase tracking-tight text-tertiary">COACH PORTAL</div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'classes' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'classes' ? 'icon-fill' : ''}`}>calendar_today</span>
            <span className="font-label font-bold uppercase text-sm">Mis Clases</span>
          </button>
          <button 
            onClick={() => setActiveTab('routines')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'routines' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'routines' ? 'icon-fill' : ''}`}>fitness_center</span>
            <span className="font-label font-bold uppercase text-sm">Rutinas</span>
          </button>
        </nav>
      </aside>
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="bg-surface sticky top-0 z-50 px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
            <h1 className="font-headline text-2xl font-black uppercase tracking-tighter">Hola, {profile.firstName}</h1>
        </header>
        
        <div className="p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto w-full">
           {activeTab === 'classes' ? (
             <section className="bg-surface-container-low p-6 rounded-lg ghost-border">
                <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6">Próxima Clase</h2>
                <div className="bg-surface-container-highest p-6 rounded border-l-4 border-l-primary-container">
                   <h3 className="font-headline text-3xl font-black uppercase tracking-tight">Crossfit Nivel 2</h3>
                   <p className="font-label text-tertiary mt-2">Hoy, 18:00 - 19:00 hrs | <span className="text-primary font-bold">12/20 Inscriptos</span></p>
                   <div className="mt-6 flex gap-4">
                      <button className="bg-gradient-primary text-on-primary font-label font-bold uppercase px-6 py-2 rounded-sm shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform">Pasar Asistencia</button>
                      <button className="bg-surface border border-outline font-label uppercase px-6 py-2 rounded-sm hover:bg-surface-container-low transition-colors">Ver Alumnos</button>
                   </div>
                </div>
             </section>
           ) : (
             <RoutineManager instructorId={profile.email} /> 
           )}
        </div>
      </main>
    </div>
  );
}
