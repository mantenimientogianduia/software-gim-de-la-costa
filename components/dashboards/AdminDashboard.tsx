'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import UserManager from '@/components/admin/UserManager';
import ClassScheduler from '@/components/classes/ClassScheduler';

export default function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'finance'>('overview');

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      <aside className="hidden md:flex flex-col h-full w-80 bg-surface-container-low py-8 z-40 border-r border-outline-variant/15">
        <div className="px-6 mb-12">
          <h2 className="font-headline text-xl text-primary-container font-black tracking-tighter uppercase">GYM DE LA COSTA</h2>
          <div className="mt-4 font-label font-bold uppercase tracking-tight text-on-surface">ADMIN FUNCTIONS</div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'overview' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'overview' ? 'icon-fill' : ''}`}>dashboard</span>
            <span className="font-label font-bold uppercase text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'users' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'users' ? 'icon-fill' : ''}`}>group</span>
            <span className="font-label font-bold uppercase text-sm">Socios</span>
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'classes' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'classes' ? 'icon-fill' : ''}`}>calendar_today</span>
            <span className="font-label font-bold uppercase text-sm">Clases</span>
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === 'finance' ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'finance' ? 'icon-fill' : ''}`}>payments</span>
            <span className="font-label font-bold uppercase text-sm">Finanzas</span>
          </button>
        </nav>
      </aside>
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="bg-surface sticky top-0 z-50 px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
           <h1 className="font-headline text-2xl font-black uppercase tracking-tighter">{activeTab === 'overview' ? 'Panel de Control' : activeTab === 'users' ? 'Gestión de Socios' : 'Finanzas'}</h1>
           <div className="w-10 h-10 rounded-sm bg-surface-container-high flex items-center justify-center font-label font-bold text-primary">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
           </div>
        </header>
        
        <div className="p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto w-full">
           {activeTab === 'overview' && (
             <>
               <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-surface-container-low rounded-lg p-6 ghost-border relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-8xl">group</span></div>
                     <h3 className="font-label text-sm uppercase text-tertiary mb-2">Socios Activos</h3>
                     <div className="font-headline text-6xl font-black mb-2 tracking-tighter">482</div>
                     <div className="flex items-center gap-2 text-primary font-label text-sm"><span className="material-symbols-outlined text-sm">trending_up</span><span>Estable</span></div>
                  </div>
                  <div onClick={() => setActiveTab('users')} className="bg-gradient-primary rounded-lg p-6 relative overflow-hidden shadow-glow cursor-pointer hover:scale-[1.02] transition-transform">
                     <h3 className="font-label text-sm uppercase text-on-primary mb-2">Nuevos Socios</h3>
                     <div className="font-headline text-6xl font-black text-on-primary-container mb-2 tracking-tighter">+12</div>
                     <div className="font-label text-xs text-on-primary opacity-80 uppercase">Este Mes</div>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-6 ghost-border border-l-4 border-l-error relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 text-error"><span className="material-symbols-outlined text-8xl">warning</span></div>
                     <h3 className="font-label text-sm uppercase text-error mb-2">Pagos Vencidos</h3>
                     <div className="font-headline text-6xl font-black mb-2 tracking-tighter">24</div>
                     <div className="font-label text-xs text-error uppercase cursor-pointer hover:underline mt-4">Ver Lista Completa <span className="material-symbols-outlined text-xs">arrow_forward</span></div>
                  </div>
               </section>

               <section className="bg-surface-container-low rounded-lg p-6 ghost-border">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="font-headline text-xl font-bold uppercase tracking-tight">Últimos Ingresos</h2>
                     <button className="font-label text-sm text-primary uppercase hover:underline">Ver todos</button>
                  </div>
                  <div className="flex flex-col">
                     {[1,2,3].map((i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-surface-container-lowest last:border-0">
                           <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center font-headline font-bold">SOC</div>
                              <div>
                                 <p className="font-body font-bold text-on-surface">Juan Pérez</p>
                                 <p className="font-label text-xs text-tertiary uppercase">Musculación</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-label font-bold text-sm text-on-surface">Hace 10 min</p>
                              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded inline-block mt-1">Al Día</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
             </>
           )}

           {activeTab === 'users' && <UserManager />}

           {activeTab === 'classes' && <ClassScheduler instructorId={profile.email} />}

           {activeTab === 'finance' && (
              <div className="bg-surface-container-low p-24 rounded-lg ghost-border text-center opacity-50">
                <span className="material-symbols-outlined text-4xl mb-4">payments</span>
                <p className="font-label uppercase tracking-widest">Módulo de finanzas próximamente</p>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}
