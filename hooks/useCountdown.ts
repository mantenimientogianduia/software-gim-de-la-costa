'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CountdownService, CountdownState } from '@/services/CountdownService';
import { defaultAudioService } from '@/services/AudioService';

export function useCountdown(initialMs: number) {
  const [state, setState] = useState<CountdownState>({
    timeLeftMs: initialMs,
    isRunning: false,
    isFinished: false,
    totalTimeMs: initialMs
  });
  
  const serviceRef = useRef<CountdownService | null>(null);

  const init = useCallback((ms: number) => {
    if (serviceRef.current) serviceRef.current.cleanup();
    serviceRef.current = new CountdownService(ms, (s) => setState({ ...s }), defaultAudioService);
    setState(serviceRef.current.getState());
  }, []);

  useEffect(() => {
    init(initialMs);
    return () => serviceRef.current?.cleanup();
  }, [initialMs, init]);

  const start = useCallback(() => {
    defaultAudioService.unlock();
    serviceRef.current?.start();
  }, []);
  const pause = useCallback(() => {
    defaultAudioService.playTransition();
    serviceRef.current?.pause();
  }, []);
  const reset = useCallback(() => {
    serviceRef.current?.reset();
  }, []);
  const setTime = useCallback((ms: number) => serviceRef.current?.updateInitialTime(ms), []);

  return {
    ...state,
    start,
    pause,
    reset,
    setTime
  };
}
