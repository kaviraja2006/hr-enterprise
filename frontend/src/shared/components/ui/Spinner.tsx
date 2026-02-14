import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-primary',
        {
          'w-4 h-4': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-8 h-8': size === 'lg',
        },
        className
      )}
    />
  );
}

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = 'Loading...', className }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}