'use client';

import React from 'react';
import { 
  Dumbbell, 
  Users, 
  Timer, 
  Calendar, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Base';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: Activity, label: 'Resumen', id: 'overview' },
  { icon: Dumbbell, label: 'Entrenamientos', id: 'workouts' },
  { icon: Timer, label: 'Reloj Pro', id: 'timer' },
  { icon: Users, label: 'Comunidad', id: 'community' },
  { icon: Trophy, label: 'Desafíos', id: 'challenges' },
  { icon: Settings, label: 'Ajustes', id: 'settings' },
];

export const Shell = ({ activeId, onNavigate, children }: { activeId: string; onNavigate: (id: string) => void; children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white">
      {/* Sidebar Desktop */}
      <aside className="w-72 hidden lg:flex flex-col border-r border-zinc-900 bg-black p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,92,0,0.4)]">
            <Dumbbell className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight uppercase">GymFlow <span className="text-brand-orange">Pro</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-zinc-900 text-white shadow-lg border border-zinc-800" 
                    : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-brand-orange" : "text-zinc-600 group-hover:text-zinc-400")} />
                <span className={cn("font-bold text-xs uppercase tracking-widest", isActive ? "text-white" : "text-zinc-500")}>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-[0_0_10px_rgba(255,92,0,0.8)]" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-900/50">
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl mb-4 border border-zinc-800">
            <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden ring-2 ring-brand-orange/20">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Alex Martínez</p>
              <p className="text-[9px] text-brand-orange font-bold uppercase tracking-[0.1em]">Socio Elite</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 border-b border-zinc-900 bg-black/80 backdrop-blur-xl sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between">
           <div className="lg:hidden flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center shadow-lg">
              <Dumbbell className="text-white w-5 h-5" />
             </div>
             <span className="font-display font-bold text-lg uppercase tracking-tight">GymFlow</span>
           </div>
           
           <h1 className="text-sm font-bold tracking-[0.2em] uppercase hidden lg:block text-zinc-500">
            {navItems.find(n => n.id === activeId)?.label || 'Escritorio'}
           </h1>

           <div className="flex items-center gap-4">
              <div className="flex -space-x-3 mr-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-900 overflow-hidden shadow-xl ring-1 ring-zinc-800">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=u${i}`} alt="User" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-black bg-brand-orange flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                  +24
                </div>
              </div>
              <div className="h-8 w-px bg-zinc-900 mx-2 hidden sm:block" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-bold ring-1 ring-brand-orange/20">
                <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse shadow-[0_0_8px_rgba(255,92,0,1)]" />
                <span className="uppercase tracking-wider">On Air</span>
              </div>
           </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
