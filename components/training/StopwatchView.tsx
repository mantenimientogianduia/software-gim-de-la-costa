'use client';

import { useStopwatch } from '@/hooks/useStopwatch';
import { formatMs } from '@/lib/utils/time';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { CircularProgress, ControlButton } from './Shared';

export function StopwatchView() {
  const { elapsedMs, isRunning, start, pause, reset } = useStopwatch();

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <CircularProgress progress={1}>
        <span className="text-5xl font-mono tracking-tighter tabular-nums text-white">
          {formatMs(elapsedMs, true)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2 font-mono">
          Cronómetro
        </span>
      </CircularProgress>

      <div className="flex gap-4">
        <ControlButton
          onClick={reset}
          icon={RotateCcw}
          variant="secondary"
          label="Reiniciar"
        />
        {isRunning ? (
          <ControlButton
            onClick={pause}
            icon={Pause}
            variant="danger"
            label="Pausa"
          />
        ) : (
          <ControlButton
            onClick={start}
            icon={Play}
            variant="primary"
            label="Iniciar"
          />
        )}
      </div>
    </div>
  );
}
