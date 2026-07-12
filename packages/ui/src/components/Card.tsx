import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
}

function Card({ className, variant = 'glass', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.5rem]',
        variant === 'glass' && 'ios-card',
        variant === 'default' && 'bg-white/[0.03] border border-white/[0.06]',
        'animate-fade-in-up',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1 px-5 pt-5 pb-3 border-b border-white/[0.04]', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center px-5 py-4 border-t border-white/[0.04]', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps };
