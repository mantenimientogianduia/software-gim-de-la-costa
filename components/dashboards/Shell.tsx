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
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar Desktop */}
      <aside className="w-72 hidden lg:flex flex-col border-r border-zinc-100 bg-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Dumbbell className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">GymFlow <span className="text-zinc-400 font-light">Pro</span></span>
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
                    ? "bg-black text-white shadow-xl shadow-zinc-200" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-black"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-400 group-hover:text-black")} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto"
                  >
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-3 p-2 bg-zinc-50 rounded-2xl mb-4">
            <div className="w-10 h-10 bg-zinc-200 rounded-full overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Alex Martínez</p>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Plan Elite</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-zinc-400 hover:text-red-500 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between">
           <div className="lg:hidden flex items-center gap-2">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Dumbbell className="text-white w-5 h-5" />
             </div>
             <span className="font-display font-bold text-lg">GymFlow</span>
           </div>
           
           <h1 className="text-lg font-bold hidden lg:block">
            {navItems.find(n => n.id === activeId)?.label || 'Escritorio'}
           </h1>

           <div className="flex items-center gap-4">
              <div className="flex -space-x-2 mr-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden ring-1 ring-zinc-100">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=u${i}`} alt="User" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                  +12
                </div>
              </div>
              <div className="h-8 w-px bg-zinc-100 mx-2 hidden sm:block" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold ring-1 ring-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>En el gym</span>
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
