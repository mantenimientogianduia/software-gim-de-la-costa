'use client'

import React, { useState } from 'react';
import { 
  Scan, 
  LogIn, 
  LogOut, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Input } from '@/components/ui/Base';
import { useAccess } from '@/hooks/useAccess.hooks';
import { motion, AnimatePresence } from 'framer-motion';

export function AccessControl() {
  const { logs, inGymCount, handleCheckIn, handleCheckOut } = useAccess();
  const [memberId, setMemberId] = useState('');
  const [lastAction, setLastAction] = useState<{ type: 'in' | 'out', name: string } | null>(null);

  const processScan = async (type: 'in' | 'out') => {
    if (!memberId) return;
    if (type === 'in') await handleCheckIn(memberId);
    else await handleCheckOut(memberId);
    
    setLastAction({ type, name: memberId });
    setMemberId('');
    setTimeout(() => setLastAction(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-display font-bold uppercase tracking-[0.3em] text-white">
          Access <span className="text-brand-orange">Control</span>
        </h2>
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-4">Punto de Control de Flujo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="p-10 border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-orange/5 animate-pulse-orange pointer-events-none" />
          
          <div className="w-24 h-24 rounded-[32px] bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
            <Scan className="w-10 h-10 text-brand-orange animate-pulse" />
          </div>

          <div className="w-full space-y-4 relative z-10">
            <Input 
              placeholder="Escanea o ingresa ID de Socio" 
              className="text-center text-xl h-16 border-zinc-800 focus:border-brand-orange"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processScan('in')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" className="h-16 rounded-2xl" onClick={() => processScan('in')}>
                <LogIn className="w-5 h-5 mr-3" /> Entrar
              </Button>
              <Button size="lg" variant="secondary" className="h-16 rounded-2xl" onClick={() => processScan('out')}>
                <LogOut className="w-5 h-5 mr-3" /> Salir
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {lastAction && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 text-green-500 font-bold uppercase text-[10px] tracking-widest"
              >
                <CheckCircle2 className="w-4 h-4" />
                {lastAction.type === 'in' ? 'Entrada' : 'Salida'} Registrada: {lastAction.name}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500">Actividad Reciente</h3>
            <div className="flex items-center gap-2 text-brand-orange">
              <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
              <span className="text-xs font-bold">{inGymCount} En Sala</span>
            </div>
          </div>

          <div className="space-y-4">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${log.type === 'in' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {log.type === 'in' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{log.userId}</p>
                    <p className="text-[10px] text-zinc-600 font-medium">Socio Verificado</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold tabular-nums">
                      {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {logs.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[32px]">
                <AlertCircle className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Sin registros recientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
