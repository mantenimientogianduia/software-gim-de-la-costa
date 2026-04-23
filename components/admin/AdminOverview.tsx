'use client';
import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import LiveAttendance from '@/components/access/LiveAttendance';
import { motion } from 'framer-motion';

const data = [
  { day: 'Lun', users: 145 },
  { day: 'Mar', users: 132 },
  { day: 'Mié', users: 161 },
  { day: 'Jue', users: 120 },
  { day: 'Vie', users: 154 },
  { day: 'Sáb', users: 95 },
  { day: 'Dom', users: 45 },
];

export default function AdminOverview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface-container-low rounded-3xl p-8 ghost-border relative overflow-hidden group shadow-xl"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-9xl">group</span>
          </div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-4">Total Socios</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline text-6xl font-black tracking-tighter">482</h3>
            <span className="text-primary font-label text-sm font-bold">+5%</span>
          </div>
          <div className="mt-8 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
             <div className="h-full bg-primary w-3/4 shadow-glow"></div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-primary rounded-3xl p-8 relative overflow-hidden shadow-glow-error group"
        >
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-primary opacity-80 mb-4">Nuevos este mes</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline text-6xl font-black tracking-tighter text-on-primary-container">+12</h3>
          </div>
          <p className="mt-4 font-body text-xs text-on-primary/70 italic">3 registros en las últimas 24hs</p>
          <div className="absolute bottom-0 right-0 p-4 opacity-20 text-on-primary">
            <span className="material-symbols-outlined text-6xl">person_add</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface-container-low rounded-3xl p-8 ghost-border border-l-4 border-l-error relative overflow-hidden group shadow-xl"
        >
          <p className="font-label text-xs uppercase tracking-[0.2em] text-error mb-4">Membresías Vencidas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline text-6xl font-black tracking-tighter text-error">24</h3>
          </div>
          <button className="mt-6 flex items-center gap-2 font-label text-[10px] uppercase font-black tracking-widest text-on-surface hover:text-error transition-colors">
            Gestionar Morosos <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 bg-surface-container-low rounded-3xl p-8 ghost-border shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-headline text-2xl font-black uppercase tracking-tight italic">Actividad Semanal</h3>
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Promedio de ingresos por día</p>
            </div>
            <div className="flex bg-surface-container-lowest p-1 rounded-lg">
               <button className="px-4 py-2 font-label text-[10px] uppercase font-bold bg-primary text-white rounded-md shadow-md">Ingresos</button>
               <button className="px-4 py-2 font-label text-[10px] uppercase font-bold text-tertiary hover:text-white transition-colors">Clases</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1E1E', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  itemStyle={{ color: '#ff5722', fontSize: '12px', fontWeight: 800 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#ff5722" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-4 bg-surface-container-low rounded-3xl p-8 ghost-border border-t-4 border-t-primary shadow-2xl flex flex-col h-full">
           <LiveAttendance />
        </section>
      </div>
    </div>
  );
}
