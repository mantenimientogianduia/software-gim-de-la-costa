'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Flame, 
  Calendar, 
  Clock,
  ArrowUpRight,
  Dumbbell,
  ChevronRight
} from 'lucide-react';
import { Card, Button } from '@/components/ui/Base';
import { cn } from '@/lib/utils';

export const Overview = () => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Entrenamientos', value: '18', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', trend: '+3 este mes' },
          { label: 'Tiempo Total', value: '24.5h', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'Promedio 1.2h/sesión' },
          { label: 'Racha Actual', value: '5 días', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50', trend: 'Racha récord: 12' },
          { label: 'Próxima Clase', value: 'Yoga Flow', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50', trend: 'Hoy, 18:00' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-display font-bold leading-none">{stat.value}</p>
                <p className="mt-3 text-[10px] font-medium text-zinc-400">{stat.trend}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts / Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-xl">Actividad Semanal</h3>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <div className="w-2 h-2 bg-black rounded-full" />
                  Actual
               </div>
               <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <div className="w-2 h-2 bg-zinc-200 rounded-full" />
                  Anterior
               </div>
            </div>
          </div>
          
          <div className="h-64 mt-4 flex items-end justify-between gap-4">
             {[
               { d: 'Lun', v1: 60, v2: 40 },
               { d: 'Mar', v1: 85, v2: 55 },
               { d: 'Mié', v1: 45, v2: 70 },
               { d: 'Jue', v1: 100, v2: 60 },
               { d: 'Vie', v1: 75, v2: 45 },
               { d: 'Sáb', v1: 30, v2: 80 },
               { d: 'Dom', v1: 20, v2: 30 },
             ].map((item, i) => (
               <div key={item.d} className="flex-1 flex flex-col items-center gap-3">
                  <div className="relative w-full h-full min-h-[150px] flex items-end justify-center gap-1">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${item.v2}%` }}
                       className="w-2 bg-zinc-100 rounded-t-full transition-all duration-1000"
                     />
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${item.v1}%` }}
                       className="w-2.5 bg-black rounded-t-full transition-all duration-1000 delay-300"
                     />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{item.d}</span>
               </div>
             ))}
          </div>
        </Card>

        <Card className="p-8 bg-black text-white border-none shadow-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Misión del Día</h3>
          <div className="space-y-6">
            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
               <p className="text-zinc-500 text-[10px] font-bold uppercase mb-2">Objetivo Calorías</p>
               <p className="text-2xl font-display font-bold mb-3">640 <span className="text-sm font-light text-zinc-500">/ 800 kcal</span></p>
               <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '80%' }}
                   className="h-full bg-white rounded-full"
                 />
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Hoy toca</p>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Hipertrofia - Pecho</p>
                    <p className="text-xs text-zinc-500 font-medium">16:30 - Zona Pesas</p>
                  </div>
                  <Button variant="secondary" size="icon" className="ml-auto w-8 h-8 rounded-full">
                    <ChevronRight className="w-4 h-5" />
                  </Button>
               </div>
            </div>
            
            <div className="pt-6">
               <Button className="w-full bg-white text-black hover:bg-zinc-100 py-6 text-base shadow-lg shadow-white/5">
                 Empezar Sesión
               </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
