'use client'

import React from 'react';
import { 
  Trophy, 
  Users, 
  Timer, 
  Grid,
  ChevronRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Card, Button } from '@/components/ui/Base';
import { motion } from 'framer-motion';

export function Overview() {
  return (
    <div className="space-y-12 pb-20">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2 p-10 border-zinc-900 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-32 h-32 text-brand-orange -rotate-12" />
           </div>
           <div className="relative z-10">
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Estado del Servidor</h3>
              <p className="text-4xl font-display font-bold text-white mb-6">Pico de <span className="text-brand-orange">Flujo</span></p>
              <div className="flex items-center gap-6">
                 <div>
                    <p className="text-2xl font-bold text-white">86</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold">Socios In</p>
                 </div>
                 <div className="w-px h-10 bg-zinc-900" />
                 <div>
                    <p className="text-2xl font-bold text-brand-orange">12</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold">New PRs</p>
                 </div>
              </div>
           </div>
        </Card>

        <Card className="p-10 border-zinc-900 flex flex-col justify-between">
           <Zap className="w-8 h-8 text-brand-orange mb-8" />
           <div>
              <p className="text-4xl font-bold text-white mb-2">Elite</p>
              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Tu Status de Plan</p>
           </div>
        </Card>

        <Card className="p-10 bg-brand-orange border-none flex flex-col justify-between text-white">
           <div className="p-2 bg-black/20 w-fit rounded-lg mb-8">
              <Trophy className="w-6 h-6" />
           </div>
           <div>
              <p className="text-4xl font-bold mb-2">#14</p>
              <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Ranking Mensual</p>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-display font-bold uppercase tracking-widest">Próximas Sesiones</h3>
             <Button variant="ghost" size="sm">Ver Calendario</Button>
          </div>
          <div className="space-y-4">
             {[
               { name: 'HIIT Explosive', time: '18:30', instructor: 'Coach Marco', intensity: 'High' },
               { name: 'Powerlifting Base', time: '19:45', instructor: 'Coach Elena', intensity: 'Medium' }
             ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-[28px] bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer group">
                   <div className="flex items-center gap-6">
                      <div className="text-center w-12">
                         <p className="text-sm font-bold text-white">{session.time}</p>
                         <p className="text-[8px] text-zinc-600 uppercase font-bold">PM</p>
                      </div>
                      <div>
                         <p className="font-bold text-zinc-200">{session.name}</p>
                         <p className="text-[10px] text-zinc-500">{session.instructor}</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-brand-orange transition-colors" />
                </div>
             ))}
          </div>
        </div>

        <div className="space-y-8">
           <h3 className="text-xl font-display font-bold uppercase tracking-widest">Logros de Comunidad</h3>
           <Card className="p-8 border-zinc-900 bg-zinc-950/80">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-zinc-900/50">
                 <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                 </div>
                 <div>
                    <h4 className="font-bold text-zinc-100 italic">"The Power Couple"</h4>
                    <p className="text-xs text-zinc-500">Desbloqueado por entrenar juntos 5 veces esta semana.</p>
                 </div>
              </div>
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(id => (
                    <div key={id} className="w-10 h-10 rounded-full border-4 border-black bg-zinc-800 overflow-hidden ring-1 ring-zinc-800">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} alt="user" />
                    </div>
                 ))}
                 <div className="w-10 h-10 rounded-full border-4 border-black bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-500">+12</div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
