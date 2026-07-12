import { forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] text-[#f5f5f5] placeholder:text-white/25 px-4 py-2.5 text-sm',
          'focus-visible:outline-none focus-visible:border-primary-500/40 focus-visible:ring-1 focus-visible:ring-primary-500/20',
          'transition-all duration-200',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
