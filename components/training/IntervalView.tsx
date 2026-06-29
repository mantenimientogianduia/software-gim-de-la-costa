'use client';

import { useState } from 'react';
import { useIntervalWorkout } from '@/hooks/useIntervalWorkout';
import { IntervalConfig, WorkoutPhase } from '@/services/IntervalService';
import { formatMs } from '@/lib/utils/time';
import { Play, Pause, RotateCcw, Settings, CheckCircle2 } from 'lucide-react';
import { CircularProgress, ControlButton } from './Shared';
import { motion, AnimatePresence } from 'motion/react';
import { defaultAudioService } from '@/services/AudioService';

export function IntervalView() {
  const [config, setConfig] = useState<IntervalConfig | null>(null);
  const [tempConfig, setTempConfig] = useState<IntervalConfig>({
    rounds: 8,
    workMs: 20000,
    restMs: 10000,
    prepareMs: 5000
  });

  const { state, start, pause, reset } = useIntervalWorkout(config);

  const handleStartWorkout = () => {
    defaultAudioService.unlock();
    setConfig({ ...tempConfig });
  };

  const handleReset = () => {
    reset();
    setConfig(null);
  };

  const getPhaseColor = (phase: WorkoutPhase) => {
    switch (phase) {
      case WorkoutPhase.WORK: return 'stroke-orange-500';
      case WorkoutPhase.REST: return 'stroke-emerald-500';
      case WorkoutPhase.PREPARE: return 'stroke-blue-500';
      default: return 'stroke-white/20';
    }
  };

  const getProgress = () => {
    if (!state || !config) return 0;
    const total = state.phase === WorkoutPhase.WORK ? config.workMs : 
                  state.phase === WorkoutPhase.REST ? config.restMs : 
                  state.phase === WorkoutPhase.PREPARE ? (config.prepareMs ?? 5000) : 1;
    return state.timeLeftMs / total;
  };

  if (!state || !config) {
    return (
      <div className="flex flex-col gap-6 max-w-sm mx-auto py-8">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/60 mb-2">Configurar Sesión</h3>

        <div className="space-y-4">
          <InputGroup label="Rondas" value={tempConfig.rounds} onChange={(v) => setTempConfig(p => ({ ...p, rounds: v }))} min={1} />
          <InputGroup label="Trabajo (seg)" value={tempConfig.workMs / 1000} onChange={(v) => setTempConfig(p => ({ ...p, workMs: v * 1000 }))} min={1} />
          <InputGroup label="Descanso (seg)" value={tempConfig.restMs / 1000} onChange={(v) => setTempConfig(p => ({ ...p, restMs: v * 1000 }))} min={0} />
          <InputGroup label="Preparación (seg)" value={(tempConfig.prepareMs ?? 0) / 1000} onChange={(v) => setTempConfig(p => ({ ...p, prepareMs: v * 1000 }))} min={0} />
        </div>

        <button
          onClick={handleStartWorkout}
          className="mt-8 bg-orange-600 hover:bg-orange-500 text-white font-mono uppercase tracking-[0.2em] py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Play size={18} />
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <AnimatePresence mode="wait">
        {state.phase === WorkoutPhase.FINISHED ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={64} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-mono text-white">SESIÓN COMPLETA</h2>
              <p className="text-white/40 font-mono text-xs mt-1">¡Excelente trabajo!</p>
            </div>
            <ControlButton onClick={handleReset} icon={RotateCcw} label="Finalizar" variant="secondary" />
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <CircularProgress progress={getProgress()} color={getPhaseColor(state.phase)}>
              <div className="text-center">
                <div className="text-6xl font-mono tracking-tighter tabular-nums text-white">
                  {Math.ceil(state.timeLeftMs / 1000)}s
                </div>
                <div className="mt-2 flex flex-col items-center">
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${state.phase === WorkoutPhase.WORK ? 'text-orange-500' : 'text-blue-500'}`}>
                    {({ WORK: 'TRABAJO', REST: 'DESCANSO', PREPARE: 'PREPARACIÓN' } as Record<string, string>)[String(state.phase)] ?? String(state.phase)}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/40 mt-0.5">
                    Ronda {state.currentRound} / {config.rounds}
                  </span>
                </div>
              </div>
            </CircularProgress>

            <div className="flex gap-4">
              <ControlButton onClick={handleReset} icon={Settings} variant="secondary" label="Salir" />
              {state.isRunning ? (
                <ControlButton onClick={pause} icon={Pause} variant="danger" label="Pausa" />
              ) : (
                <ControlButton onClick={start} icon={Play} variant="primary" label="Continuar" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, value, onChange, min }: { label: string, value: number, onChange: (v: number) => void, min: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
      <span className="font-mono text-xs text-white/60 uppercase">{label}</span>
      <div className="flex items-center gap-4">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="text-white/40 hover:text-white">-</button>
        <span className="font-mono text-lg text-white w-8 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)} className="text-white/40 hover:text-white">+</button>
      </div>
    </div>
  );
}
