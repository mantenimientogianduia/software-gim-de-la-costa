'use client'

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Timer, 
  ShieldCheck,
  Menu,
  X,
  Bell,
  Scan
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Shell({ children, activeTab, onTabChange }: ShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'community', label: 'Comunidad', icon: Users },
    { id: 'timer', label: 'Pro Timer', icon: Timer },
    { id: 'access', label: 'Ingresos', icon: Scan },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="glass-card h-full border-r border-zinc-900 border-none rounded-none relative z-50 flex flex-col pt-12 pb-12"
      >
        <div className={cn("px-8 mb-12 flex items-center", isSidebarOpen ? "justify-between" : "justify-center")}>
           {isSidebarOpen && (
             <h1 className="text-lg font-display font-bold uppercase tracking-[0.4em] text-white">
               F L O W <span className="text-brand-orange">P R O</span>
             </h1>
           )}
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-600 hover:text-white transition-colors">
             {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-brand-orange text-white shadow-[0_0_20px_rgba(255,92,0,0.2)]" 
                  : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50"
              )}
            >
              <item.icon size={22} className={cn("flex-shrink-0 transition-transform group-hover:scale-110", activeTab === item.id ? "scale-110" : "")} />
              {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-6 space-y-4 pt-12 border-t border-zinc-900">
          <div className={cn("flex items-center gap-4 text-zinc-500", isSidebarOpen ? "px-2" : "justify-center")}>
             <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <Bell size={18} />
             </div>
             {isSidebarOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Notificaciones</span>}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto pt-16 px-12">
        <div className="max-w-7xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed top-8 right-12 z-50 flex items-center gap-6">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Member Status</p>
              <p className="text-sm font-bold text-brand-orange italic tracking-tighter uppercase">Elite Prime</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden ring-4 ring-black">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Profile" />
           </div>
        </div>
      </main>
    </div>
  );
}
