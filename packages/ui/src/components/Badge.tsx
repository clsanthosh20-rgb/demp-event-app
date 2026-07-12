import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase',
  {
    variants: {
      variant: {
        default: 'bg-white/[0.05] text-white/40 border border-white/[0.05]',
        primary: 'bg-primary-500/10 text-primary-300 border border-primary-500/10',
        success: 'bg-green-500/10 text-green-300 border border-green-500/10',
        warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/10',
        danger: 'bg-red-500/10 text-red-300 border border-red-500/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
export type { BadgeProps };
