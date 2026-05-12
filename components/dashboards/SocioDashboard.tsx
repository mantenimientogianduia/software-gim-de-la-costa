'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import SocioRoutineView from '@/components/routines/SocioRoutineView';
import ClassBookingList from '@/components/classes/ClassBookingList';
import QRGenerator from '@/components/access/QRGenerator';
import SessionView from '@/components/routines/SessionView';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import StreakStats from '@/components/training/StreakStats';
import ProgressCharts from '@/components/training/ProgressCharts';
import AchievementGallery from '@/components/training/AchievementGallery';
import GymPlaylist from '@/components/training/GymPlaylist';
import { motion, AnimatePresence } from 'framer-motion';

type DashboardTab = 'home' | 'classes' | 'routine' | 'progress' | 'music';

export default function SocioDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [onboardingFinished, setOnboardingFinished] = useState(profile.onboardingCompleted);

  const navigation = [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'classes', label: 'Clases', icon: 'calendar_today' },
    { id: 'routine', label: 'Rutina', icon: 'fitness_center' },
    { id: 'progress', label: 'Progreso', icon: 'monitoring' },
    { id: 'music', label: 'Música', icon: 'music_note' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24 md:pb-0 flex flex-col md:flex-row">
      {!onboardingFinished && (
        <OnboardingForm 
          userId={profile.email} 
          onComplete={() => setOnboardingFinished(true)} 
        />
      )}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full flex justify-around items-center pt-2 pb-6 px-2 bg-surface/90 backdrop-blur-xl z-50 border-t border-outline-variant/15">
        {navigation.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as DashboardTab)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all ${activeTab === item.id ? 'text-primary' : 'text-tertiary shadow-none'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === item.id ? 'icon-fill' : ''}`}>{item.icon}</span>
            <span className="font-label text-[8px] uppercase font-bold mt-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-80 bg-surface-container-low ghost-border py-10 sticky top-0">
        <div className="px-8 mb-12">
          <h1 className="font-headline text-2xl text-primary font-black tracking-tighter uppercase italic leading-none">GYM<br/><span className="text-white">COSTA</span></h1>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-4">
          {navigation.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as DashboardTab)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-glow' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
            >
              <span className={`material-symbols-outlined ${activeTab === item.id ? 'icon-fill' : ''}`}>{item.icon}</span>
              <span className="font-label font-black uppercase text-xs tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="activeTabSide" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-glow-error" />
              )}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto px-6 py-6 border-t border-white/5">
           <div className="flex items-center gap-4 bg-surface-container-high p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-headline font-black italic">
                 {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                 <p className="font-label text-[10px] font-black uppercase text-white truncate">{profile.firstName} {profile.lastName}</p>
                 <p className="font-body text-[8px] text-tertiary uppercase tracking-widest">Socio Premium</p>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16">
         {profile.atGym ? (
            <SessionView profile={profile} />
         ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'home' && (
                  <div className="space-y-12">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                      <div>
                        <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter uppercase mb-4 italic leading-none">
                          ¿Qué rompemos <br/><span className="text-primary italic">hoy, {profile.firstName}?</span>
                        </h1>
                        <p className="font-body text-tertiary text-lg uppercase tracking-[0.2em]">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      </div>
                      <div className="flex bg-surface-container-low p-1 rounded-2xl border border-white/5">
                         <div className="px-6 py-4 text-center">
                            <p className="font-headline text-3xl font-black italic text-primary">{profile.onboardingData?.weight || '--'}</p>
                            <p className="font-label text-[8px] uppercase tracking-widest text-tertiary">Peso Actual</p>
                         </div>
                         <div className="w-px h-8 bg-white/10 self-center"></div>
                         <div className="px-6 py-4 text-center">
                            <p className="font-headline text-3xl font-black italic text-on-surface">{profile.streak?.current || 0}</p>
                            <p className="font-label text-[8px] uppercase tracking-widest text-tertiary">Días Racha</p>
                         </div>
                      </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       {/* Main Content Area */}
                       <div className="lg:col-span-8 space-y-8">
                           <section 
                             onClick={() => setActiveTab('routine')} 
                             className="cursor-pointer bg-gradient-to-br from-surface-container-low to-surface-container-high p-8 rounded-[2.5rem] relative overflow-hidden ghost-border group hover:shadow-glow-error transition-all"
                           >
                             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                               <div>
                                 <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label text-[9px] font-black uppercase tracking-widest mb-4 inline-block">Tu Rutina activa</span>
                                 <h2 className="font-headline font-black text-4xl md:text-5xl mb-2 italic tracking-tighter uppercase leading-none">CONTINUAR ENTRENANDO</h2>
                                 <p className="font-body text-tertiary text-sm italic">Fase de volumen • {profile.onboardingData?.goal || 'General'}</p>
                               </div>
                               <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                                 <span className="material-symbols-outlined text-3xl">play_arrow</span>
                               </div>
                             </div>
                           </section>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <StreakStats streak={{
                                current: profile.streak?.current || 0,
                                best: profile.streak?.best || 0,
                                activityHistory: profile.streak?.activityHistory || []
                              }} />
                              <AchievementGallery unlockedList={profile.achievements || []} />
                           </div>
                       </div>
                       
                       {/* Sidebar Content Area */}
                       <div className="lg:col-span-4 space-y-8">
                          <QRGenerator dni={profile.dni} />
                          
                          <section className="bg-surface-container-low p-8 rounded-[2rem] ghost-border relative overflow-hidden group">
                             <h3 className="font-headline font-black text-lg uppercase tracking-[0.1em] italic mb-6">Membresía</h3>
                             <div className="space-y-6">
                                {profile.membershipValidUntil ? (
                                   <>
                                      <div className="relative">
                                         <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-1">Tu cuenta vence el</p>
                                         <p className="font-headline text-4xl font-black italic tracking-tighter text-primary truncate">
                                            {profile.membershipValidUntil.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                         </p>
                                      </div>
                                      <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                         <div className="h-full bg-primary shadow-glow w-[85%]"></div>
                                      </div>
                                      <div className="flex items-center gap-2 text-primary">
                                         <span className="material-symbols-outlined text-sm">verified</span>
                                         <p className="font-label text-[10px] font-bold uppercase tracking-widest">Plan Activo</p>
                                      </div>
                                   </>
                                ) : (
                                   <div className="py-4 text-center opacity-30">
                                      <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                      <p className="font-label text-xs uppercase font-bold tracking-widest">Sin datos de membresía</p>
                                   </div>
                                )}
                             </div>
                          </section>

                          <GymPlaylist userId={profile.email} userName={profile.firstName} />
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'routine' && (
                  <div className="space-y-8">
                    <div className="flex items-end gap-6 mb-12">
                       <h2 className="font-headline font-black text-6xl uppercase tracking-tighter italic leading-none">MI RUTINA</h2>
                       <p className="font-label text-xs text-tertiary uppercase tracking-widest mb-2 border-l-2 border-primary/30 pl-4">Programada por el staff</p>
                    </div>
                    <SocioRoutineView userId={profile.email} />
                  </div>
                )}

                {activeTab === 'classes' && (
                  <div className="space-y-8">
                    <div className="flex items-end gap-6 mb-12">
                       <h2 className="font-headline font-black text-6xl uppercase tracking-tighter italic leading-none">MIS CLASES</h2>
                    </div>
                    <ClassBookingList userId={profile.email} />
                  </div>
                )}

                {activeTab === 'progress' && (
                  <div className="space-y-12">
                    <div className="flex items-end gap-6 mb-12">
                       <h2 className="font-headline font-black text-6xl uppercase tracking-tighter italic leading-none">MI PROGRESO</h2>
                    </div >
                    <ProgressCharts userId={profile.email} />
                  </div>
                )}

                {activeTab === 'music' && (
                  <div className="max-w-3xl mx-auto py-12">
                    <GymPlaylist userId={profile.email} userName={profile.firstName} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
         )}
      </main>
    </div>
  );
}
