'use client'

import React from 'react';
import { 
  Heart, 
  MapPin, 
  MessageCircle, 
  Eye, 
  EyeOff,
  Filter,
  Users
} from 'lucide-react';
import { Card, Button } from '@/components/ui/Base';
import { useGym } from '@/hooks/useGym.hooks';
import { motion } from 'framer-motion';

export function Community() {
  const { usersInGym, loading, toggleVisibility } = useGym();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Comunidad <span className="text-brand-orange">Sync</span></h2>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider mt-1">Sintoniza con el flujo local</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400">
             <Filter className="w-4 h-4 mr-2" />
             Filtrar
           </Button>
           <Button variant="secondary" size="sm">
             Modo Ghost
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {usersInGym.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-8 border-zinc-900 bg-black hover:border-brand-orange/40 transition-all duration-700 group relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[28px] bg-zinc-900 overflow-hidden ring-1 ring-zinc-800 group-hover:ring-brand-orange/50 transition-all duration-500">
                    <img src={user.avatarUrl} alt={user.name} className="grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-orange border-4 border-black rounded-full shadow-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl text-zinc-100 truncate tracking-tight">{user.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                    <MapPin className="w-3 h-3 text-brand-orange" />
                    {user.lastActivity || 'SALA DE FUERZA'}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 mb-8">
                 <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-3">Sintonía Actual</p>
                 <p className="text-sm font-medium italic text-zinc-400 leading-relaxed">"Rompiendo récords personales hoy 💪🔥"</p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-6">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                      <Heart className="w-4 h-4 text-brand-orange/40 fill-brand-orange/10 group-hover:fill-brand-orange group-hover:text-brand-orange transition-all" />
                      24
                    </div>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-10 text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-600 hover:text-brand-orange bg-zinc-900/50"
                   onClick={() => toggleVisibility(user.id, user.isProfileVisible)}
                 >
                   {user.isProfileVisible ? (
                     <><Eye className="w-3.5 h-3.5 mr-2" /> Visible</>
                   ) : (
                     <><EyeOff className="w-3.5 h-3.5 mr-2" /> Ghost</>
                   )}
                 </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {usersInGym.length === 0 && !loading && (
        <div className="py-32 flex flex-col items-center justify-center text-center">
           <div className="w-24 h-24 bg-zinc-950 border border-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <Users className="w-12 h-12 text-zinc-800" />
           </div>
           <h3 className="font-display font-bold text-2xl mb-3 text-white uppercase tracking-widest">Silencio en la sala</h3>
           <p className="text-zinc-600 max-w-sm mx-auto font-medium">El flujo de la comunidad está en pausa. Sé el primero en activar tu visibilidad.</p>
        </div>
      )}
    </div>
  );
}
