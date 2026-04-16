import { useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface ExpandableTextProps {
  text: string;
  /** Số dòng trước khi thu gọn */
  collapsedLines?: number;
  className?: string;
}

/** Text dài: 2 dòng + "Xem thêm" / "Thu gọn" inline */
export function ExpandableText({ text, collapsedLines = 2, className }: ExpandableTextProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!text.trim()) return null;
  const needsToggle = text.length > 120 || text.split('\n').length > collapsedLines;

  if (!needsToggle) {
    return <p className={cn('whitespace-pre-wrap break-words', className)}>{text}</p>;
  }

  return (
    <div className={className}>
      <p
        id={id}
        className={cn('whitespace-pre-wrap break-words', !open && collapsedLines === 2 && 'line-clamp-2')}
        style={
          !open && collapsedLines !== 2
            ? { WebkitLineClamp: collapsedLines, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }
            : undefined
        }
      >
        {text}
      </p>
      <button
        type="button"
        className="mt-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
      >
        {open ? 'Thu gọn' : 'Xem thêm'}
      </button>
    </div>
  );
}
