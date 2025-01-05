import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-4 w-4 border',
  md: 'h-6 w-6 border',
  lg: 'h-8 w-8 border',
};

export function Loading({ className, size = 'md' }: LoadingProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-vercel-blue/20 border-r-vercel-blue',
        sizeStyles[size],
        className
      )}
    />
  );
}

interface LoadingPageProps {
  className?: string;
  message?: string;
}

export function LoadingPage({ className, message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className={cn('flex min-h-[400px] flex-col items-center justify-center gap-3', className)}>
      <Loading size="lg" />
      <p className="text-sm text-vercel-gray-300 animate-pulse">{message}</p>
    </div>
  );
} 