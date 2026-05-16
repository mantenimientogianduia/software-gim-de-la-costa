'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import SocioRoutineView from '@/components/routines/SocioRoutineView';
import ClassBookingList from '@/components/classes/ClassBookingList';
import QRGenerator from '@/components/access/QRGenerator';
import SessionView from '@/components/routines/SessionView';
import { TrainingToolbox } from '@/components/training/TrainingToolbox';
import StreakDisplay from '@/components/training/StreakDisplay';
import PersonalInfo from '@/components/profile/PersonalInfo';

export default function SocioDashboard({ profile }: { profile: UserProfile & { id: string } }) {
  const [activeTab, setActiveTab] = useState<'home' | 'classes' | 'routine' | 'timer' | 'streak' | 'profile'>('home');
  const membershipDaysLeft = (() => {
    if (!profile.membershipValidUntil?.toDate) return null;
    return Math.ceil((profile.membershipValidUntil.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  })();

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
        <button 
          onClick={() => setActiveTab('streak')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all ${activeTab === 'streak' ? 'text-primary-container bg-surface-container-high' : 'text-tertiary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === 'streak' ? 'icon-fill' : ''}`}>local_fire_department</span>
          <span className="font-label text-[10px] uppercase font-bold mt-1">Racha</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all ${activeTab === 'profile' ? 'text-primary-container bg-surface-container-high' : 'text-tertiary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === 'profile' ? 'icon-fill' : ''}`}>person</span>
          <span className="font-label text-[10px] uppercase font-bold mt-1">Perfil</span>
        </button>
        <button 
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all ${activeTab === 'timer' ? 'text-primary-container bg-surface-container-high' : 'text-tertiary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined ${activeTab === 'timer' ? 'icon-fill' : ''}`}>timer</span>
          <span className="font-label text-[10px] uppercase font-bold mt-1">Reloj</span>
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
          <button 
            onClick={() => setActiveTab('streak')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'streak' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'streak' ? 'icon-fill' : ''}`}>local_fire_department</span>
            <span className="font-label font-bold uppercase text-sm">Racha de Entrenamiento</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'profile' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'profile' ? 'icon-fill' : ''}`}>person</span>
            <span className="font-label font-bold uppercase text-sm">Mi Información</span>
          </button>
          <button 
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'timer' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'timer' ? 'icon-fill' : ''}`}>timer</span>
            <span className="font-label font-bold uppercase text-sm">Cronómetro</span>
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
                    ¿{profile.gender === 'femenino' ? 'Lista' : 'Listo'}, <span className="text-primary-container">{profile.firstName}</span>?
                  </h1>
                  <p className="font-body text-tertiary text-lg uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                 <div className={`${(activeTab === 'routine' || activeTab === 'classes' || activeTab === 'timer') ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col gap-6`}>
                     {activeTab === 'home' && (
                       <>
                         <div className="md:hidden">
                           <QRGenerator dni={profile.dni} />
                         </div>

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
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div className="bg-surface-container-lowest p-4 rounded-sm flex flex-col justify-between border-b border-b-primary/30">
                               <span className="material-symbols-outlined text-primary mb-4">local_fire_department</span>
                               <div>
                                 <p className="font-label text-tertiary text-[10px] uppercase tracking-wider">Meta Semanal</p>
                                 <p className="font-headline font-bold text-2xl">
                                   {profile.weeklyTrainingGoal || 0}<span className="text-lg text-primary"> dias</span>
                                 </p>
                               </div>
                             </div>
                             <div className="bg-surface-container-lowest p-4 rounded-sm flex flex-col justify-between border-b border-b-primary/30">
                               <span className="material-symbols-outlined text-primary mb-4">assignment</span>
                               <div>
                                 <p className="font-label text-tertiary text-[10px] uppercase tracking-wider">Plan Actual</p>
                                 <p className="font-headline font-bold text-xl truncate">{profile.currentPlan || 'Sin asignar'}</p>
                               </div>
                             </div>
                             <div className="bg-surface-container-lowest p-4 rounded-sm flex flex-col justify-between border-b border-b-primary/30">
                               <span className="material-symbols-outlined text-primary mb-4">event_available</span>
                               <div>
                                 <p className="font-label text-tertiary text-[10px] uppercase tracking-wider">Membresia</p>
                                 <p className="font-headline font-bold text-2xl">
                                   {membershipDaysLeft === null ? 'Sin datos' : membershipDaysLeft < 0 ? 'Vencida' : `${membershipDaysLeft}d`}
                                 </p>
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

                     {activeTab === 'timer' && (
                       <TrainingToolbox />
                     )}

                     {activeTab === 'streak' && (
                       <StreakDisplay userId={profile.email} weeklyTrainingGoal={profile.weeklyTrainingGoal} />
                     )}

                     {activeTab === 'profile' && (
                       <PersonalInfo profile={profile} />
                     )}
                 </div>
                 
                 {activeTab !== 'routine' && activeTab !== 'classes' && activeTab !== 'timer' && (
                   <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
                      <section className="bg-surface-container-low p-8 rounded-[2rem] ghost-border relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                         <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-6">Membresía</h3>
                         
                         <div className="space-y-6 relative z-10">
                            {profile.membershipValidUntil ? (
                               <>
                                  <div>
                                     <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">Tu cuenta vence el</p>
                                     <p className="font-headline text-3xl font-black italic tracking-tighter text-primary">
                                        {profile.membershipValidUntil.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                     </p>
                                  </div>
                                  <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                                     <div className={`h-full bg-primary transition-all duration-1000 ${
                                        (profile.membershipValidUntil.toDate().getTime() - new Date().getTime()) < 0 ? 'bg-error w-full' : 'w-2/3'
                                     }`}></div>
                                  </div>
                                  <p className="font-body text-xs text-tertiary italic">
                                     {(profile.membershipValidUntil.toDate().getTime() - new Date().getTime()) < 0 
                                        ? 'Tu cuota está vencida. Por favor, regulariza tu situación en administración.' 
                                        : 'Tu membresía se encuentra activa y vigente.'}
                                  </p>
                               </>
                            ) : (
                               <div className="py-4 text-center">
                                  <span className="material-symbols-outlined text-4xl text-tertiary mb-2">event_busy</span>
                                  <p className="font-label text-xs uppercase tracking-widest text-tertiary">Sin datos de membresía</p>
                                  <p className="text-[10px] text-tertiary/50 mt-2 italic">Consulta en administración para activar tu plan.</p>
                               </div>
                            )}
                         </div>
                      </section>
                      <QRGenerator dni={profile.dni} />
                   </div>
                 )}
              </div>
            </>
         )}
      </main>
    </div>
  );
}
