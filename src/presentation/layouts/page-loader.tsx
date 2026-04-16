import { SkeletonText } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/cn';

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-3xl space-y-4 p-4 md:p-6', className)} aria-busy="true">
      <div className="animate-shimmer h-10 w-48 rounded-lg" />
      <SkeletonText lines={4} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="animate-shimmer h-32 rounded-xl" />
        <div className="animate-shimmer h-32 rounded-xl" />
      </div>
    </div>
  );
}
