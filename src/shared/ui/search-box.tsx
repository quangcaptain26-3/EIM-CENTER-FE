import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

export interface SearchBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /** Giá trị gõ — controlled */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Gọi sau debounce (mặc định 300ms) */
  onSearch?: (debouncedValue: string) => void;
  delay?: number;
  isLoading?: boolean;
  inputClassName?: string;
}

export function SearchBox({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSearch,
  delay = 300,
  isLoading = false,
  placeholder = 'Tìm kiếm…',
  className,
  inputClassName,
  disabled,
  ...rest
}: SearchBoxProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolled;

  const debounced = useDebounce(value, delay);
  const skipFirstSearch = useRef(true);

  useEffect(() => {
    if (skipFirstSearch.current) {
      skipFirstSearch.current = false;
      return;
    }
    onSearch?.(debounced);
  }, [debounced, onSearch]);

  const setValue = (v: string) => {
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  };

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <Input
        {...rest}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        leftIcon={<Search className="text-[var(--text-muted)]" strokeWidth={1.5} />}
        rightIcon={
          isLoading ? (
            <Loader2 className="animate-spin text-[var(--text-muted)]" strokeWidth={1.5} aria-hidden />
          ) : value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-7 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Xóa tìm kiếm"
              onClick={() => setValue('')}
            >
              <X className="size-4" strokeWidth={1.5} />
            </Button>
          ) : null
        }
        className={cn('pr-2', inputClassName)}
      />
    </div>
  );
}
