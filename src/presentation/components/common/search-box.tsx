import type { ChangeEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { Search } from 'lucide-react'; // Có thể dùng icon tương tự

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Component ô tìm kiếm chung
 */
export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
}: SearchBoxProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
          'bg-white text-gray-900 transition-shadow'
        )}
      />
    </div>
  );
};
