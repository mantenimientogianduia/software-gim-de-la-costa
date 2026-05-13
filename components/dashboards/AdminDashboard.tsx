'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import UserManager from '@/components/admin/UserManager';
import FinanceManager from '@/components/admin/FinanceManager';
import AdminOverview from '@/components/admin/AdminOverview';
import ClassScheduler from '@/components/classes/ClassScheduler';
import QRScanner from '@/components/access/QRScanner';
import LiveAttendance from '@/components/access/LiveAttendance';
import RoutineEditor from '@/components/routines/RoutineEditor';

export default function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'finance' | 'access' | 'routines'>('overview');

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      <aside className="hidden md:flex flex-col h-full w-72 bg-surface-container-low py-10 z-40 border-r border-outline-variant/10 relative">
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-30"></div>
        <div className="px-8 mb-16">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg font-black">fitness_center</span>
             </div>
             <h2 className="font-headline text-lg text-primary-container font-black tracking-tighter uppercase italic">COSTA GYM</h2>
          </div>
          <div className="font-label text-[10px] font-black uppercase tracking-[0.3em] text-tertiary opacity-50">Control Central</div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === 'overview' ? 'bg-primary text-on-primary shadow-glow ring-1 ring-white/20' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'overview' ? 'icon-fill' : 'group-hover:scale-110 transition-transform'}`}>dashboard</span>
            <span className="font-label font-black uppercase text-[11px] tracking-widest">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === 'users' ? 'bg-primary text-on-primary shadow-glow ring-1 ring-white/20' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'users' ? 'icon-fill' : 'group-hover:scale-110 transition-transform'}`}>group</span>
            <span className="font-label font-black uppercase text-[11px] tracking-widest">Socios</span>
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === 'classes' ? 'bg-primary text-on-primary shadow-glow ring-1 ring-white/20' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'classes' ? 'icon-fill' : 'group-hover:scale-110 transition-transform'}`}>calendar_today</span>
            <span className="font-label font-black uppercase text-[11px] tracking-widest">Clases</span>
          </button>
          <button 
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === 'access' ? 'bg-primary text-on-primary shadow-glow ring-1 ring-white/20' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'access' ? 'icon-fill' : 'group-hover:scale-110 transition-transform'}`}>qr_code_scanner</span>
            <span className="font-label font-black uppercase text-[11px] tracking-widest">Control</span>
          </button>
          <button 
            onClick={() => setActiveTab('routines')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === 'routines' ? 'bg-primary text-on-primary shadow-glow ring-1 ring-white/20' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'routines' ? 'icon-fill' : 'group-hover:scale-110 transition-transform'}`}>fitness_center</span>
            <span className="font-label font-black uppercase text-[11px] tracking-widest">Rutinas</span>
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === 'finance' ? 'bg-primary text-on-primary shadow-glow ring-1 ring-white/20' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'finance' ? 'icon-fill' : 'group-hover:scale-110 transition-transform'}`}>payments</span>
            <span className="font-label font-black uppercase text-[11px] tracking-widest">Finanzas</span>
          </button>
        </nav>
        
        <div className="mt-auto px-8 py-6 border-t border-outline-variant/10">
           <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs ring-1 ring-outline-variant/20">
                 {profile.firstName.charAt(0)}
              </div>
              <div>
                 <p className="font-label text-[10px] font-black uppercase leading-tight">{profile.firstName}</p>
                 <p className="font-label text-[8px] uppercase tracking-tighter text-tertiary">Administrador</p>
              </div>
           </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="bg-surface sticky top-0 z-50 px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
           <h1 className="font-headline text-2xl font-black uppercase tracking-tighter">
             {activeTab === 'overview' ? 'Panel de Control' : 
              activeTab === 'users' ? 'Gestión de Socios' : 
              activeTab === 'access' ? 'Scanner de Entrada' :
              activeTab === 'classes' ? 'Agenda de Clases' :
              activeTab === 'routines' ? 'Editor de Rutinas' :
              'Finanzas'}
           </h1>
           <div className="w-10 h-10 rounded-sm bg-surface-container-high flex items-center justify-center font-label font-bold text-primary">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
           </div>
        </header>
        <div className="p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto w-full">
           {activeTab === 'overview' && <AdminOverview />}

           {activeTab === 'access' && (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
               <QRScanner />
               <LiveAttendance />
            </div>
          )}

           {activeTab === 'users' && <UserManager />}

           {activeTab === 'routines' && <RoutineEditor instructorId={profile.email} />}

           {activeTab === 'classes' && <ClassScheduler instructorId={profile.email} />}

           {activeTab === 'finance' && <FinanceManager />}
        </div>
      </main>
    </div>
  );
}
