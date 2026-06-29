'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import RoutineEditor from '@/components/routines/RoutineEditor';
import ClassScheduler from '@/components/classes/ClassScheduler';

const NAV_ITEMS = [
  { id: 'classes' as const, label: 'Mis Clases', icon: 'calendar_today' },
  { id: 'routines' as const, label: 'Rutinas', icon: 'fitness_center' },
];

export default function ProfesorDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'classes' | 'routines'>('classes');

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-full w-80 bg-surface-container-low py-8 z-40 border-r border-outline-variant/15">
        <div className="px-6 mb-12">
          <h2 className="font-headline text-xl text-primary-container font-black tracking-tighter uppercase">Gym de la Costa</h2>
          <div className="mt-4 font-label font-bold uppercase tracking-tight text-tertiary">Portal del Coach</div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-6 py-4 transition-all ${activeTab === item.id ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
            >
              <span className={`material-symbols-outlined ${activeTab === item.id ? 'icon-fill' : ''}`}>{item.icon}</span>
              <span className="font-label font-bold uppercase text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="bg-surface sticky top-0 z-50 px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h1 className="font-headline text-2xl font-black uppercase tracking-tighter">Hola, {profile.firstName}</h1>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary md:hidden">
              {NAV_ITEMS.find(i => i.id === activeTab)?.label}
            </p>
          </div>
        </header>

        <div className="p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto w-full pb-28 md:pb-10">
          {activeTab === 'classes' ? (
            <ClassScheduler instructorId={profile.email} />
          ) : (
            <RoutineEditor instructorId={profile.email} />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low border-t border-outline-variant/15 flex">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all ${activeTab === item.id ? 'text-primary' : 'text-tertiary'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === item.id ? 'icon-fill' : ''}`}>{item.icon}</span>
            <span className="font-label text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
