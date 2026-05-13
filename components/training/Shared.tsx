'use client';

import { motion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface CircularProgressProps {
  progress: number; // 0 to 1
  color?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function CircularProgress({ 
  progress, 
  color = 'stroke-orange-500', 
  size = 280, 
  strokeWidth = 8,
  children 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/5"
        />
        {/* Progress track */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.1, ease: 'linear' }}
          fill="transparent"
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  icon: typeof Play;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function ControlButton({ onClick, icon: Icon, label, variant = 'primary' }: ControlButtonProps) {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-500 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-full transition-all active:scale-95 flex items-center gap-2 font-mono text-xs uppercase tracking-wider ${variants[variant]}`}
    >
      <Icon size={20} />
      {label && <span>{label}</span>}
    </button>
  );
}
