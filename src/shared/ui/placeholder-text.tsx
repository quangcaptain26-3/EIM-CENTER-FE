import { cn } from '@/shared/lib/cn';
import { displayText, isEmptyDisplay, EMPTY_PLACEHOLDER, placeholderClassName } from '@/shared/lib/display';

export function PlaceholderText({
  value,
  empty = EMPTY_PLACEHOLDER,
  className,
}: {
  value: unknown;
  empty?: string;
  className?: string;
}) {
  const emptyVal = isEmptyDisplay(value);
  const text = emptyVal ? empty : displayText(value, empty);
  return <span className={cn(placeholderClassName(emptyVal), className)}>{text}</span>;
}
