import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../lib/utils';

const spinnerVariants = cva('animate-spin text-primary-400', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-7 w-7',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface SpinnerProps extends React.SVGAttributes<SVGSVGElement>, VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <svg
      className={cn(spinnerVariants({ size }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export { Spinner, spinnerVariants };
export type { SpinnerProps };
