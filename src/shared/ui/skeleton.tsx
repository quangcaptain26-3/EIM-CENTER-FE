import { cn } from '@/shared/lib/cn';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer rounded-md bg-[var(--bg-subtle)]', className)}
      aria-hidden
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  /** Chiều cao mỗi dòng */
  lineClassName?: string;
}

export function SkeletonText({ lines = 3, className, lineClassName }: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3 w-full', i === lines - 1 && 'w-4/5', lineClassName)}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'space-y-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4',
        className,
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      <SkeletonText lines={2} />
    </div>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 6, columns = 5, className }: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'w-full space-y-2 overflow-hidden rounded-2xl border border-[var(--border-default)]',
        className,
      )}
    >
      <div className="flex gap-2 border-b border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="space-y-2 bg-[var(--bg-surface)] px-3 py-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-2">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-8 flex-1 rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface SkeletonAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const avatarSize: Record<NonNullable<SkeletonAvatarProps['size']>, string> = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-12',
};

export function SkeletonAvatar({ className, size = 'md' }: SkeletonAvatarProps) {
  return <Skeleton className={cn('rounded-full', avatarSize[size], className)} />;
}
