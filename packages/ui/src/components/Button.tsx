import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 rounded-full px-5 py-2.5 text-sm shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)]',
        secondary: 'bg-white/[0.06] text-white/70 hover:text-[#f5f5f5] hover:bg-white/[0.1] rounded-full px-5 py-2.5 text-sm',
        outline: 'border border-white/[0.1] bg-transparent text-white/60 hover:text-[#f5f5f5] hover:bg-white/[0.06] rounded-full px-5 py-2.5 text-sm',
        ghost: 'text-white/40 hover:text-[#f5f5f5] hover:bg-white/[0.06] rounded-full px-4 py-2 text-sm',
        danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 rounded-full px-5 py-2.5 text-sm shadow-[0_4px_14px_rgba(220,38,38,0.25)]',
      },
      size: {
        sm: 'px-4 py-2 text-xs min-h-[36px]',
        md: 'px-5 py-2.5 text-sm min-h-[44px]',
        lg: 'px-7 py-3.5 text-base min-h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
