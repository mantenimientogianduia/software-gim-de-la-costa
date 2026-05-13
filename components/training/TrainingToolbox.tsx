'use client';

import { useState } from 'react';
import { StopwatchView } from './StopwatchView';
import { IntervalView } from './IntervalView';
import { Timer, Repeat, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ToolType = 'STOPWATCH' | 'INTERVAL' | 'HISTORY';

export function TrainingToolbox() {
  const [activeTool, setActiveTool] = useState<ToolType>('STOPWATCH');

  const tabs = [
    { id: 'STOPWATCH' as ToolType, label: 'Stopwatch', icon: Timer },
    { id: 'INTERVAL' as ToolType, label: 'Interval', icon: Repeat },
//    { id: 'HISTORY' as ToolType, label: 'Logs', icon: History },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#151619] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
      {/* Header Tabs */}
      <div className="flex border-b border-white/5 bg-black/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTool(tab.id)}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all relative ${
              activeTool === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon size={18} />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em]">{tab.label}</span>
            {activeTool === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-8 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTool === 'STOPWATCH' && <StopwatchView />}
            {activeTool === 'INTERVAL' && <IntervalView />}
            {activeTool === 'HISTORY' && (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <History size={48} />
                <span className="font-mono text-xs uppercase mt-4">No history recorded</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="px-8 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/20">GYM DE LA COSTA // TRAINING CORE V1.0</span>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
        </div>
      </div>
    </div>
  );
}
