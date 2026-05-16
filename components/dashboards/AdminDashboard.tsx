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

type AdminTab = 'overview' | 'users' | 'classes' | 'finance' | 'access' | 'routines';

const navItems: Array<{ id: AdminTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Panel', icon: 'dashboard' },
  { id: 'users', label: 'Socios', icon: 'group' },
  { id: 'classes', label: 'Clases', icon: 'calendar_today' },
  { id: 'access', label: 'Control', icon: 'qr_code_scanner' },
  { id: 'routines', label: 'Rutinas', icon: 'fitness_center' },
  { id: 'finance', label: 'Pagos', icon: 'payments' },
];

export default function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [financeInitialTab, setFinanceInitialTab] = useState<'history' | 'expiring'>('history');

  const openTab = (tab: AdminTab) => {
    if (tab === 'finance') setFinanceInitialTab('history');
    setActiveTab(tab);
  };

  const openExpiringMemberships = () => {
    setFinanceInitialTab('expiring');
    setActiveTab('finance');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      <aside className="hidden md:flex flex-col h-full w-72 bg-surface-container-low py-10 z-40 border-r border-outline-variant/10 relative">
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-30" />
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
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => openTab(item.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${activeTab === item.id ? 'bg-primary text-on-primary shadow-glow ring-1 ring-white/20' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === item.id ? 'icon-fill' : 'group-hover:scale-110 transition-transform'}`}>{item.icon}</span>
              <span className="font-label font-black uppercase text-[11px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto px-8 py-6 border-t border-outline-variant/10">
          <div className="flex items-center gap-4 opacity-70">
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
        <header className="bg-surface sticky top-0 z-50 px-4 md:px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <h1 className="font-headline text-xl md:text-2xl font-black uppercase tracking-tighter">
            {activeTab === 'overview' ? 'Panel de Control'
              : activeTab === 'users' ? 'Gestion de Socios'
              : activeTab === 'access' ? 'Scanner de Entrada'
              : activeTab === 'classes' ? 'Agenda de Clases'
              : activeTab === 'routines' ? 'Editor de Rutinas'
              : 'Finanzas'}
          </h1>
          <div className="w-10 h-10 rounded-sm bg-surface-container-high flex items-center justify-center font-label font-bold text-primary">
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
        </header>

        <nav className="md:hidden sticky top-[73px] z-40 flex gap-2 overflow-x-auto border-b border-outline-variant/15 bg-surface/95 px-4 py-3 backdrop-blur-xl no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => openTab(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 transition-all ${activeTab === item.id ? 'bg-primary text-on-primary shadow-glow' : 'bg-surface-container-low text-tertiary'}`}
              aria-label={item.label}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'icon-fill' : ''}`}>{item.icon}</span>
              <span className="font-label text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && <AdminOverview onManageExpired={openExpiringMemberships} />}

          {activeTab === 'access' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <QRScanner />
              <LiveAttendance />
            </div>
          )}

          {activeTab === 'users' && <UserManager />}
          {activeTab === 'routines' && <RoutineEditor instructorId={profile.email} />}
          {activeTab === 'classes' && <ClassScheduler instructorId={profile.email} />}
          {activeTab === 'finance' && <FinanceManager initialTab={financeInitialTab} />}
        </div>
      </main>

    </div>
  );
}
