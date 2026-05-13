'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TimerService, TimerStatus } from '@/services/TimerService';

export function useStopwatch() {
  const [status, setStatus] = useState<TimerStatus>({ isRunning: false, elapsedMs: 0 });
  const timerRef = useRef<TimerService>(new TimerService());
  const requestRef = useRef<number>(null);

  const update = useCallback(() => {
    setStatus(timerRef.current.getStatus());
    if (timerRef.current.getStatus().isRunning) {
      requestRef.current = requestAnimationFrame(update);
    }
  }, []);

  const start = useCallback(() => {
    timerRef.current.start();
    update();
  }, [update]);

  const pause = useCallback(() => {
    timerRef.current.pause();
    setStatus(timerRef.current.getStatus());
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  const reset = useCallback(() => {
    timerRef.current.reset();
    setStatus(timerRef.current.getStatus());
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return {
    ...status,
    start,
    pause,
    reset,
  };
}
