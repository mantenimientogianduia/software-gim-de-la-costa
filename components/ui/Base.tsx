import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' | 'icon' }
>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: "bg-brand-orange text-white hover:bg-brand-orange-hover shadow-[0_0_20px_rgba(255,92,0,0.2)]",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
    outline: "border border-zinc-800 text-zinc-300 hover:border-brand-orange hover:text-brand-orange bg-transparent",
    ghost: "bg-transparent text-zinc-400 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-10 py-4 text-base font-bold",
    icon: "p-2"
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-[32px] bg-zinc-950/50 border border-zinc-900 backdrop-blur-xl overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-orange/50 transition-all",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' }) => {
  const variants = {
    default: "bg-zinc-800 text-zinc-400 border-zinc-700",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    warning: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20"
  };
  return (
    <span className={cn("px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", variants[variant])}>
      {children}
    </span>
  );
};
