/**
 * src/presentation/components/feedback/metric-input.tsx
 * Component nhập điểm đánh giá dạng 5 nút bấm (1-5).
 * Sử dụng cho các chỉ số như: Tham gia học, Hành vi, Sử dụng ngôn ngữ.
 */
import { cn } from '@/shared/lib/cn';
import type { FeedbackMetric } from '@/domain/feedback/models/feedback.model';

export interface MetricInputProps {
  label: string;
  value?: FeedbackMetric | null;
  onChange: (value: FeedbackMetric) => void;
  disabled?: boolean;
  className?: string;
}

const TOOLTIPS: Record<FeedbackMetric, string> = {
  1: '1 = Kém',
  2: '2 = Yếu',
  3: '3 = Trung bình',
  4: '4 = Khá',
  5: '5 = Tốt',
};

const METRICS: FeedbackMetric[] = [1, 2, 3, 4, 5];

export const MetricInput = ({ label, value, onChange, disabled, className }: MetricInputProps) => {
  return (
    <div className={cn('flex flex-col gap-1.5 min-w-[120px]', className)} role="group" aria-label={label}>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex items-center rounded-md border border-gray-200 overflow-hidden w-fit bg-white">
        {METRICS.map((num) => {
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              disabled={disabled}
              onClick={() => onChange(num)}
              title={TOOLTIPS[num]}
              aria-label={`${label} mức ${num}`}
              aria-pressed={isSelected}
              className={cn(
                'h-7 w-7 text-xs font-medium border-r border-gray-200 last:border-r-0 transition-colors',
                'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:z-10',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected 
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};
