'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerProps {
  onClose?: () => void;
}

type TimerMode = 'countdown' | 'stopwatch' | 'circuit';

export default function Timer({ onClose }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Circuit mode state
  const [circuitConfig, setCircuitConfig] = useState({
    work: 40,
    rest: 20,
    rounds: 5,
    currentRound: 1,
    isWork: true
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, isPaused, mode, circuitConfig]);

  const handleTimerEnd = () => {
    setIsActive(false);
    // Play sound notification
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.play().catch(() => console.log('Audio play failed'));

    if (mode === 'circuit') {
      if (circuitConfig.isWork) {
        // Switch to rest
        setCircuitConfig(prev => ({ ...prev, isWork: false }));
        setTimeLeft(circuitConfig.rest);
        setIsActive(true);
      } else {
        // Switch to work next round
        if (circuitConfig.currentRound < circuitConfig.rounds) {
          setCircuitConfig(prev => ({ ...prev, currentRound: prev.currentRound + 1, isWork: true }));
          setTimeLeft(circuitConfig.work);
          setIsActive(true);
        } else {
          // Finished all rounds
          alert('¡Circuito completado!');
        }
      }
    }
  };

  const startTimer = () => {
    if (mode === 'circuit') {
      setTimeLeft(circuitConfig.work);
      setCircuitConfig(prev => ({ ...prev, currentRound: 1, isWork: true }));
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presets = [30, 45, 60, 90, 120];

  return (
    <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/20 shadow-2xl space-y-8 relative overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/10">
          {(['countdown', 'stopwatch', 'circuit'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setIsActive(false); }}
              className={`px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all ${mode === m ? 'bg-primary text-white' : 'text-tertiary hover:bg-surface-container-highest'}`}
            >
              {m === 'countdown' ? 'Timer' : m === 'stopwatch' ? 'Cronos' : 'Circuito'}
            </button>
          ))}
        </div>
        {onClose && (
          <button onClick={onClose} className="material-symbols-outlined text-tertiary hover:text-white transition-colors">close</button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-10 gap-4">
        {mode === 'circuit' && isActive && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-xs font-black uppercase tracking-[0.3em] ${circuitConfig.isWork ? 'text-primary' : 'text-green-500'}`}
          >
            {circuitConfig.isWork ? `Trabajo - Ronda ${circuitConfig.currentRound}/${circuitConfig.rounds}` : 'Descanso'}
          </motion.div>
        )}
        <div className="text-8xl font-mono font-black italic tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,87,34,0.3)]">
          {formatTime(timeLeft)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {mode === 'countdown' && (
              <div className="flex flex-wrap gap-2 justify-center">
                {presets.map(s => (
                  <button 
                    key={s}
                    onClick={() => setTimeLeft(s)}
                    className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/10 font-label text-[10px] font-black uppercase flex items-center justify-center hover:border-primary transition-all"
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}

            {mode === 'circuit' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-tertiary ml-2">Trabajo (s)</label>
                  <input 
                    type="number" 
                    value={circuitConfig.work} 
                    onChange={e => setCircuitConfig({...circuitConfig, work: parseInt(e.target.value)})}
                    className="w-full bg-surface-container-high p-3 rounded-xl border border-outline-variant/10 outline-none focus:border-primary font-mono text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-tertiary ml-2">Descanso (s)</label>
                  <input 
                    type="number" 
                    value={circuitConfig.rest} 
                    onChange={e => setCircuitConfig({...circuitConfig, rest: parseInt(e.target.value)})}
                    className="w-full bg-surface-container-high p-3 rounded-xl border border-outline-variant/10 outline-none focus:border-primary font-mono text-center"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-tertiary ml-2">Rondas</label>
                  <input 
                    type="number" 
                    value={circuitConfig.rounds} 
                    onChange={e => setCircuitConfig({...circuitConfig, rounds: parseInt(e.target.value)})}
                    className="w-full bg-surface-container-high p-3 rounded-xl border border-outline-variant/10 outline-none focus:border-primary font-mono text-center"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={startTimer}
              className="w-full bg-gradient-primary text-white py-5 rounded-2xl font-label text-xs font-black uppercase tracking-[0.2em] shadow-glow"
            >
              Comenzar
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="bg-surface-container-highest text-white py-5 rounded-2xl font-label text-xs font-black uppercase tracking-[0.2em] border border-outline-variant/10"
            >
              {isPaused ? 'Reanudar' : 'Pausar'}
            </button>
            <button 
              onClick={() => { setIsActive(false); setTimeLeft(60); }}
              className="bg-error/10 text-error py-5 rounded-2xl font-label text-xs font-black uppercase tracking-[0.2em] border border-error/20"
            >
              Parar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
