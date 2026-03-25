import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { Search } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/use-debounce';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Debounce ms trước khi gọi onChange — mặc định 300 để tránh gọi API mỗi keystroke */
  debounceMs?: number;
}

/**
 * Component ô tìm kiếm chung.
 * Khi debounceMs > 0: debounce trước khi trigger onChange (tránh gọi API mỗi keystroke).
 */
export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
  debounceMs = 300,
}: SearchBoxProps) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Đồng bộ từ value prop khi parent reset
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Gọi onChange khi giá trị debounced thay đổi
  useEffect(() => {
    if (debounceMs > 0 && debouncedValue !== undefined) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, debounceMs]); // eslint-disable-line react-hooks/exhaustive-deps -- onChange stable, chỉ cần debouncedValue

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    if (debounceMs <= 0) {
      onChange(newVal);
    }
  }, [onChange, debounceMs]);

  const displayValue = debounceMs > 0 ? localValue : value;

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'bg-white text-gray-900 transition-shadow'
        )}
      />
    </div>
  );
};
