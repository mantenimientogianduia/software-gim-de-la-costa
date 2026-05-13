"use client";

import React from "react";
import { Flame, Snowflake, Target } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { TrainingDay } from "@/services/StreakService";

interface StreakWidgetProps {
  streak: number;
  maxStreak: number;
  history: (TrainingDay | { date: string, type: 'none' })[];
  onManualMark?: () => void;
}

export function StreakWidget({ streak, maxStreak, history, onManualMark }: StreakWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Racha Actual</h3>
            <p className="text-3xl font-bold text-gray-900">{streak} días</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Récord</p>
          <div className="flex items-center gap-1 justify-end text-gray-600">
            <Target className="w-4 h-4" />
            <span className="font-bold">{maxStreak}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {history.slice(0, 7).reverse().map((day, idx) => {
          const isFire = day.type === "training";
          const isIce = day.type === "rest" || (day.type === "none" && idx < 6); // Simplified logic
          
          return (
            <div key={day.date} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {new Date(day.date).toLocaleDateString('es', { weekday: 'short' }).charAt(0)}
              </span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isFire ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : 
                  isIce ? "bg-blue-100 text-blue-500" : "bg-gray-100 text-gray-300"
                )}
              >
                {isFire ? <Flame className="w-6 h-6 fill-white" /> : <Snowflake className="w-6 h-6" />}
              </motion.div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onManualMark}
        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        <Flame className="w-5 h-5" />
        ¡Completar Día de Hoy!
      </button>
    </motion.div>
  );
}
