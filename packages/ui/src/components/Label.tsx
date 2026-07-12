import { forwardRef } from 'react';
import { cn } from '../lib/utils';

const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-sm font-semibold text-white/40 tracking-tight', className)}
        {...props}
      />
    );
  },
);

Label.displayName = 'Label';

export { Label };
