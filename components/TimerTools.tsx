"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Hash, Watch } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Combined Timer Tools Component
export function TimerTools() {
  const [activeTab, setActiveTab] = useState<'chrono' | 'rounds' | 'timer'>('chrono');

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        {[
          { id: 'chrono', icon: Watch, label: 'Cronómetro' },
          { id: 'rounds', icon: Hash, label: 'Rondas' },
          { id: 'timer', icon: TimerIcon, label: 'Timer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-colors",
              activeTab === tab.id ? "bg-gray-50 text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-8 h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'chrono' && <Stopwatch key="chrono" />}
          {activeTab === 'rounds' && <IntervalTimer key="rounds" />}
          {activeTab === 'timer' && <Countdown key="timer" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setTime((t) => t + 10), 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const mss = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${mss.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center w-full">
      <div className="text-6xl font-mono font-black tracking-tighter text-gray-900 mb-8 tabular-nums">
        {formatTime(time)}
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all", isRunning ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
          {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <button onClick={() => { setTime(0); setIsRunning(false); }} className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-all">
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}

function IntervalTimer() {
  const [rounds, setRounds] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center w-full">
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Ronda Actual</p>
      <div className="text-8xl font-black text-gray-900 mb-8">{rounds}</div>
      <div className="flex justify-center gap-4 items-center">
        <button onClick={() => setRounds(Math.max(1, rounds - 1))} className="w-12 h-12 rounded-full border-2 border-gray-200 text-gray-400 font-bold text-2xl">-</button>
        <button onClick={() => setIsRunning(!isRunning)} className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all", isRunning ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
           {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <button onClick={() => setRounds(rounds + 1)} className="w-12 h-12 rounded-full border-2 border-gray-200 text-gray-400 font-bold text-2xl">+</button>
      </div>
    </motion.div>
  );
}

function Countdown() {
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (seconds === 0) setIsRunning(false);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center w-full">
       <div className="text-7xl font-mono font-black text-gray-900 mb-8 tabular-nums">
        {formatTime(seconds)}
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all", isRunning ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
          {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <button onClick={() => { setSeconds(60); setIsRunning(false); }} className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-all">
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}
