'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-black text-white hover:bg-zinc-800 shadow-sm',
      secondary: 'bg-white text-black border border-zinc-200 hover:bg-zinc-50 shadow-sm',
      outline: 'bg-transparent border border-zinc-300 hover:bg-zinc-100',
      ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-600 hover:text-black',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-8 py-3.5 text-base rounded-2xl',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...(props as any)}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]', className)}>
    {children}
  </div>
);
