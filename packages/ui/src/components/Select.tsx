import { forwardRef } from 'react';
import { cn } from '../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-2xl px-4 py-2.5 text-sm text-white/80',
          'bg-white/[0.04] border border-white/[0.07] appearance-none',
          'focus-visible:outline-none focus-visible:border-primary-500/40 focus-visible:bg-white/[0.06]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          error && 'border-red-500/40',
          className,
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-opacity='0.4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.25em 1.25em',
          paddingRight: '2.75rem',
        }}
        {...props}
      >
        {placeholder && <option value="" className="bg-[#06060e]">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#06060e] text-white/80">
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
