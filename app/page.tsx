'use client';

import React, { useState } from 'react';
import { Shell } from '@/components/dashboards/Shell';
import { Overview } from '@/components/dashboards/Overview';
import { Community } from '@/components/dashboards/Community';
import { TimerPro } from '@/components/dashboards/TimerPro';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'community':
        return <Community />;
      case 'timer':
        return <TimerPro />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl font-bold italic text-zinc-300">PF</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Próximamente</h2>
            <p className="text-zinc-500 max-w-xs">Estamos trabajando duro para traerte esta funcionalidad increíble.</p>
          </div>
        );
    }
  };

  return (
    <Shell activeId={activeTab} onNavigate={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
