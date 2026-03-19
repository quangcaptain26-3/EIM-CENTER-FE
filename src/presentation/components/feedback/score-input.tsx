/**
 * src/presentation/components/feedback/score-input.tsx
 * Component nhập điểm (0-100) và ghi chú điểm, chuyên dùng cho Quiz/Midterm/Final.
 */
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/input';

export interface ScoreValues {
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  total?: number | null;
}

export interface ScoreInputProps {
  values: ScoreValues;
  noteValue?: string | null;
  onChange: (field: keyof ScoreValues, value: number | null) => void;
  onNoteChange: (note: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export const ScoreInput = ({
  values,
  noteValue,
  onChange,
  onNoteChange,
  disabled,
  className
}: ScoreInputProps) => {
  // Tính điểm trung bình (Total)
  const skills = [values.listening, values.reading, values.writing, values.speaking];
  const validSkills = skills.filter((s): s is number => s !== null);
  const average = validSkills.length > 0 
    ? parseFloat((validSkills.reduce((a, b) => a + b, 0) / validSkills.length).toFixed(1))
    : null;

  const renderField = (label: string, field: keyof ScoreValues, color: string) => (
    <div className="flex flex-col gap-1 w-[70px]">
      <span className={cn("text-[10px] font-bold uppercase", color)}>{label}</span>
      <Input
        type="number"
        min={0}
        max={100}
        step={0.1}
        disabled={disabled}
        value={values[field] ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(field, val === '' ? null : Number(val));
        }}
        placeholder="0"
        className="h-8 pr-1 text-center text-sm border-gray-200 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
        {renderField('List', 'listening', 'text-blue-600')}
        {renderField('Read', 'reading', 'text-green-600')}
        {renderField('Write', 'writing', 'text-amber-600')}
        {renderField('Speak', 'speaking', 'text-purple-600')}
        
        <div className="flex flex-col gap-1 w-[70px] ml-2 border-l pl-3">
          <span className="text-[10px] font-bold uppercase text-gray-500">T.Bình</span>
          <div className="h-8 flex items-center justify-center font-bold text-gray-900 bg-gray-50 rounded border text-sm">
            {average ?? '--'}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <span className="text-xs font-semibold text-gray-700">Ghi chú điểm</span>
        <Input
          type="text"
          disabled={disabled}
          value={noteValue ?? ''}
          onChange={(e) => onNoteChange(e.target.value || null)}
          placeholder="Nhập ghi chú bài thi..."
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
};
