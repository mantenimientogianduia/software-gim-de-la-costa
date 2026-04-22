'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import SocioRoutineView from '@/components/routines/SocioRoutineView';
import ClassBookingList from '@/components/classes/ClassBookingList';
import QRGenerator from '@/components/access/QRGenerator';
import SessionView from '@/components/routines/SessionView';

export default function SocioDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'home' | 'classes' | 'routine'>('home');

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24 md:pb-0 flex flex-col md:flex-row">
      <nav className="md:hidden fixed bottom-0 w-full flex justify-around items-center pt-2 pb-6 px-4 bg-surface/90 backdrop-blur-xl z-50 border-t border-outline-variant/15">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all ${activeTab === 'home' ? 'text-primary-container bg-surface-container-high' : 'text-tertiary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === 'home' ? 'icon-fill' : ''}`}>home</span>
          <span className="font-label text-[10px] uppercase font-bold mt-1">Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('classes')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all ${activeTab === 'classes' ? 'text-primary-container bg-surface-container-high' : 'text-tertiary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === 'classes' ? 'icon-fill' : ''}`}>calendar_today</span>
          <span className="font-label text-[10px] uppercase font-bold mt-1">Clases</span>
        </button>
        <button 
          onClick={() => setActiveTab('routine')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all ${activeTab === 'routine' ? 'text-primary-container bg-surface-container-high' : 'text-tertiary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === 'routine' ? 'icon-fill' : ''}`}>fitness_center</span>
          <span className="font-label text-[10px] uppercase font-bold mt-1">Rutina</span>
        </button>
      </nav>

      <aside className="hidden md:flex flex-col h-screen w-80 bg-surface-container-low ghost-border py-8 sticky top-0">
        <div className="px-6 mb-12">
          <h1 className="font-headline text-xl text-primary-container font-black tracking-tighter uppercase">GYM DE LA COSTA</h1>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'home' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'home' ? 'icon-fill' : ''}`}>home</span>
            <span className="font-label font-bold uppercase text-sm">Inicio</span>
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'classes' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'classes' ? 'icon-fill' : ''}`}>calendar_today</span>
            <span className="font-label font-bold uppercase text-sm">Mis Clases</span>
          </button>
          <button 
            onClick={() => setActiveTab('routine')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'routine' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'routine' ? 'icon-fill' : ''}`}>fitness_center</span>
            <span className="font-label font-bold uppercase text-sm">Mi Rutina</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {profile.atGym ? (
            <SessionView profile={profile} />
         ) : (
            <>
              <header className="flex justify-between items-end mb-12">
                <div>
                  <h1 className="font-headline font-black text-4xl md:text-6xl tracking-tight uppercase mb-2">
                    ¿Listo, <span className="text-primary-container">{profile.firstName}</span>?
                  </h1>
                  <p className="font-body text-tertiary text-lg uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                 <div className="lg:col-span-8 flex flex-col gap-6">
                     {activeTab === 'home' && (
                       <>
                         <section onClick={() => setActiveTab('routine')} className="cursor-pointer bg-surface-container-low p-6 md:p-8 rounded-lg relative overflow-hidden ghost-border hover:bg-surface-container-high transition-all">
                           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                             <div>
                               <span className="font-label text-primary text-sm uppercase tracking-widest mb-2 block">Acceso Rápido</span>
                               <h2 className="font-headline font-bold text-3xl md:text-4xl mb-2 italic">VER MI RUTINA</h2>
                             </div>
                             <button className="bg-gradient-primary text-on-primary font-label text-sm font-bold uppercase tracking-wider py-3 px-8 rounded-sm shadow-glow flex items-center gap-2 hover:scale-[1.02] transition-transform">
                               Comenzar <span className="material-symbols-outlined">arrow_forward</span>
                             </button>
                           </div>
                         </section>

                         <section className="bg-surface-container-low p-6 md:p-8 rounded-lg ghost-border">
                           <div className="flex justify-between items-center mb-6">
                             <h3 className="font-headline font-bold text-xl uppercase tracking-tight">Tu Progreso</h3>
                           </div>
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                             <div className="bg-surface-container-lowest p-4 rounded-sm flex flex-col justify-between border-b border-b-primary/30">
                               <span className="material-symbols-outlined text-primary mb-4">local_fire_department</span>
                               <div>
                                 <p className="font-label text-tertiary text-[10px] uppercase tracking-wider">Entrenamientos</p>
                                 <p className="font-headline font-bold text-2xl">--<span className="text-lg text-primary">/--</span></p>
                               </div>
                             </div>
                             <div className="bg-surface-container-lowest p-4 rounded-sm flex flex-col justify-between border-b border-b-primary/30">
                               <span className="material-symbols-outlined text-primary mb-4">timer</span>
                               <div>
                                 <p className="font-label text-tertiary text-[10px] uppercase tracking-wider">Tiempo Total</p>
                                 <p className="font-headline font-bold text-2xl">--h<span className="text-lg text-primary">--m</span></p>
                               </div>
                             </div>
                           </div>
                         </section>
                       </>
                     )}

                     {activeTab === 'routine' && (
                       <SocioRoutineView userId={profile.email} />
                     )}

                     {activeTab === 'classes' && (
                       <ClassBookingList userId={profile.email} />
                     )}
                 </div>
                 
                 <div className="lg:col-span-4 flex flex-col gap-6">
                    <QRGenerator userId={profile.email} />
                 </div>
              </div>
            </>
         )}
      </main>
    </div>
  );
}
