/**
 * src/presentation/components/feedback/attendance-select.tsx
 * Component Dropdown để chọn trạng thái điểm danh của học viên.
 * Tự động đổi màu nền dựa trên trạng thái đã chọn.
 */
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { AttendanceStatus } from '@/domain/feedback/models/feedback.model';

export interface AttendanceSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value?: AttendanceStatus | null;
  onChange: (value: AttendanceStatus | null) => void;
  disabled?: boolean;
}

/**
 * Lấy lớp CSS màu sắc tương ứng với trạng thái điểm danh
 */
const getColorClass = (status?: AttendanceStatus | null) => {
  switch (status) {
    case AttendanceStatus.PRESENT:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 focus:ring-emerald-500'; // Có mặt = Green
    case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800 border-red-200 focus:ring-red-500'; // Vắng mặt = Red
    case AttendanceStatus.LATE:
        return 'bg-amber-100 text-amber-800 border-amber-200 focus:ring-amber-500'; // Đi trễ = Amber
    default:
        return 'bg-gray-50 text-gray-500 border-gray-200 focus:ring-gray-500'; // Chưa chọn
  }
};

export const AttendanceSelect = forwardRef<HTMLSelectElement, AttendanceSelectProps>(
  ({ value, onChange, disabled, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        disabled={disabled}
        value={value || ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? (val as AttendanceStatus) : null);
        }}
        aria-label="Chọn trạng thái điểm danh"
        className={cn(
          'h-8 px-2 py-1 text-sm font-medium rounded border leading-none outline-none focus:ring-2 focus:ring-offset-1 transition-colors',
          'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 appearance-none', // Ẩn mũi tên mặc định để trông giống badge hơn nếu muốn, hoặc giữ lại
          getColorClass(value),
          className
        )}
        {...props}
      >
        <option value="" disabled className="text-gray-500 bg-white">-- Điểm danh --</option>
        <option value={AttendanceStatus.PRESENT} className="text-emerald-800 bg-white">Có mặt</option>
        <option value={AttendanceStatus.LATE} className="text-amber-800 bg-white">Đi trễ</option>
        <option value={AttendanceStatus.ABSENT} className="text-red-800 bg-white">Vắng mặt</option>
      </select>
    );
  }
);

AttendanceSelect.displayName = 'AttendanceSelect';
