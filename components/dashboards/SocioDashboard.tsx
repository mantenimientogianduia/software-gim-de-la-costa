'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import QRGenerator from '@/components/access/QRGenerator';
import ClassBookingList from '@/components/classes/ClassBookingList';
import SocioRoutineView from '@/components/routines/SocioRoutineView';
import SessionView from '@/components/routines/SessionView';
import { motion, AnimatePresence } from 'motion/react';

export default function SocioDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'routine' | 'classes'>('overview');
  const [isTraining, setIsTraining] = useState(false); // In a real app, this would be fetched from attendance

  const tabs = [
    { id: 'overview', name: 'Inicio', icon: 'dashboard' },
    { id: 'routine', name: 'Entrenamiento', icon: 'fitness_center' },
    { id: 'classes', name: 'Clases', icon: 'calendar_today' },
  ];

  if (isTraining) {
      return <SessionView profile={profile} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
       {/* Header Socio */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
             <h1 className="font-headline text-5xl font-black uppercase tracking-tighter italic">HOLA, {profile.firstName}</h1>
             <p className="font-label text-xs uppercase tracking-[0.3em] text-tertiary mt-2">Membresía <span className="text-primary font-black">{profile.status}</span></p>
          </div>
          
          <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-white/5">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-3 px-6 py-3 rounded-xl font-label text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-on-primary shadow-glow font-black' : 'text-tertiary hover:text-white'}`}
               >
                 <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                 {tab.name}
               </button>
             ))}
          </div>
       </header>

       <main>
          <AnimatePresence mode="wait">
             {activeTab === 'overview' && (
               <motion.div 
                 key="overview"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="grid grid-cols-1 lg:grid-cols-3 gap-8"
               >
                  <div className="lg:col-span-2 space-y-8">
                     <div className="bg-surface-container-low p-8 rounded-3xl ghost-border h-[300px] flex flex-col justify-end relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h2 className="relative z-10 font-headline text-4xl font-black uppercase tracking-tight italic mb-4">Tu progreso esta semana</h2>
                        <div className="relative z-10 flex gap-2">
                           {[1,2,3,4,5,6,7].map(d => (
                             <div key={d} className="flex-1 h-32 bg-white/5 rounded-lg overflow-hidden flex flex-col justify-end">
                                <div className="bg-primary/50 w-full" style={{ height: `${Math.random() * 100}%` }}></div>
                             </div>
                           ))}
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-surface-container-low p-8 rounded-3xl ghost-border">
                            <h3 className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-6">Próxima Clase</h3>
                            <p className="font-headline text-2xl font-black uppercase italic mb-2">Power Lifting</p>
                            <p className="font-body text-primary text-sm font-bold">HOY - 19:30 HS</p>
                        </div>
                        <div className="bg-surface-container-low p-8 rounded-3xl ghost-border">
                            <h3 className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-6">Estado Cuenta</h3>
                            <p className="font-headline text-2xl font-black uppercase italic mb-2">Al día</p>
                            <p className="font-body text-tertiary text-sm opacity-60">Próximo vencimiento: 12/06</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <QRGenerator dni={profile.dni} />
                     <button 
                       onClick={() => setIsTraining(true)}
                       className="w-full py-8 bg-gradient-primary rounded-3xl shadow-glow text-on-primary font-headline text-2xl font-black uppercase tracking-widest italic flex flex-col items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
                     >
                        <span className="material-symbols-outlined text-4xl">play_circle</span>
                        ENTRENAR AHORA
                     </button>
                  </div>
               </motion.div>
             )}

             {activeTab === 'routine' && (
               <motion.div 
                 key="routine"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
               >
                  <SocioRoutineView userId={profile.email} />
               </motion.div>
             )}

             {activeTab === 'classes' && (
                <motion.div
                  key="classes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                   <ClassBookingList userId={profile.email} />
                </motion.div>
             )}
          </AnimatePresence>
       </main>
    </div>
  );
}
