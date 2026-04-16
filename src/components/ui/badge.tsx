import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger';

const variants: Record<Variant, string> = {
  default: 'bg-muted text-foreground',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-600 text-white',
  danger: 'bg-red-600 text-white',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

