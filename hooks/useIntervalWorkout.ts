'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IntervalService, IntervalConfig, IntervalState, WorkoutPhase } from '@/services/IntervalService';
import { defaultAudioService } from '@/services/AudioService';

export function useIntervalWorkout(config: IntervalConfig | null) {
  const [state, setState] = useState<IntervalState | null>(null);
  const serviceRef = useRef<IntervalService | null>(null);

  const init = useCallback((newConfig: IntervalConfig) => {
    if (serviceRef.current) serviceRef.current.cleanup();
    
    const service = new IntervalService(newConfig, (s) => {
      setState({ ...s });
    }, defaultAudioService);
    serviceRef.current = service;
    setState(service.getState());
  }, []);

  useEffect(() => {
    if (config) {
      init(config);
    }
    return () => {
      if (serviceRef.current) serviceRef.current.cleanup();
    };
  }, [config, init]);

  const start = useCallback(() => {
    serviceRef.current?.start();
  }, []);

  const pause = useCallback(() => {
    serviceRef.current?.pause();
  }, []);

  const reset = useCallback(() => {
    serviceRef.current?.reset();
  }, []);

  return {
    state,
    start,
    pause,
    reset,
    WorkoutPhase
  };
}
