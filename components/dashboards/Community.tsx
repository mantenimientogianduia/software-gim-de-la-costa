'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  MapPin, 
  MessageCircle, 
  Heart,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';
import { Card, Button } from '@/components/ui/Base';
import { useGym } from '@/hooks/useGym.hooks';
import { cn } from '@/lib/utils';

export const Community = () => {
  const { usersInGym, toggleVisibility } = useGym();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Comunidad en Vivo</h2>
          <p className="text-zinc-500 text-sm">Conecta con los socios que están entrenando ahora.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" size="sm">
             <Filter className="w-4 h-4 mr-2" />
             Filtrar
           </Button>
           <Button size="sm">
             Modo Invisible
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersInGym.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-6 hover:shadow-2xl transition-shadow duration-500 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden ring-4 ring-zinc-50">
                    <img src={user.avatarUrl} alt={user.name} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{user.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <MapPin className="w-3 h-3 text-red-400" />
                    Zona de Cardio
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 mb-4">
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Estado actual</p>
                 <p className="text-sm font-medium italic">"Dándolo todo en el remo hoje 🚣‍♀️"</p>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-zinc-500">
                      <Heart className="w-4 h-4 text-zinc-300" />
                      12
                    </div>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black"
                   onClick={() => toggleVisibility(user.id, user.isProfileVisible)}
                 >
                   {user.isProfileVisible ? (
                     <><Eye className="w-3 h-3 mr-1.5" /> Visible</>
                   ) : (
                     <><EyeOff className="w-3 h-3 mr-1.5" /> Oculto</>
                   )}
                 </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {usersInGym.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-zinc-300" />
           </div>
           <h3 className="font-display font-bold text-xl mb-2">No hay nadie por aquí...</h3>
           <p className="text-zinc-500 max-w-sm mx-auto">Parece que eres el primero en llegar o todos los perfiles son privados.</p>
        </div>
      )}
    </div>
  );
};
