import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'bg-vercel-blue/10 text-vercel-blue border border-vercel-blue/20',
  secondary: 'bg-vercel-gray-800/60 text-vercel-gray-300 border border-vercel-gray-700',
  outline: 'border border-vercel-gray-700 text-vercel-gray-300',
  success: 'bg-green-500/10 text-green-400 border border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
} 