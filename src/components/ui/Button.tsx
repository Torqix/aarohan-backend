import { ComponentPropsWithoutRef, ElementType } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-vercel-blue text-white hover:bg-vercel-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vercel-blue',
        secondary: 'bg-vercel-gray-800 text-white hover:bg-vercel-gray-700',
        outline: 'border border-vercel-gray-700 text-white hover:border-vercel-gray-600 hover:bg-vercel-gray-800/40',
        ghost: 'text-vercel-gray-300 hover:text-white hover:bg-vercel-gray-800/40',
        destructive: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

type ButtonProps<C extends ElementType = 'button'> = {
  as?: C;
} & ComponentPropsWithoutRef<C> &
  VariantProps<typeof buttonVariants>;

const Button = <C extends ElementType = 'button'>({
  className,
  variant,
  size,
  fullWidth,
  as,
  ...props
}: ButtonProps<C>) => {
  const Component = as || 'button';
  return (
    <Component
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
};

Button.displayName = 'Button';

export { Button, buttonVariants }; 