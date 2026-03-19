/**
 * Form tạo mới / chỉnh sửa Trial Lead
 * Dùng React Hook Form + Zod validation
 * Ánh xạ chính xác với CreateTrialSchema / UpdateTrialSchema của backend
 * Dùng được cả trong modal tạo mới lẫn trang chi tiết để cập nhật
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { z } from 'zod';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Button } from '@/shared/ui/button';
import { TRIAL_STATUS_VALUES, TRIAL_STATUS_LABELS } from '@/domain/trials/models/trial-lead.model';
import type { TrialStatus } from '@/domain/trials/models/trial-lead.model';

// ===================================================
// ZOD SCHEMA — EXPORT ĐỂ TÁI SỬ DỤNG
// ===================================================

/**
 * Schema validation cho form Trial Lead
 * Ánh xạ từ CreateTrialSchema + UpdateTrialSchema của backend
 * Được export để tái sử dụng ở các component hoặc test khác
 */
export const trialFormSchema = z.object({
  /** Họ và tên khách hàng tiềm năng (bắt buộc) */
  fullName: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(255, 'Họ tên quá dài'),

  /**
   * Số điện thoại liên hệ (bắt buộc)
   * Regex: đúng định dạng số VN — 10 chữ số, bắt đầu bằng 0
   */
  phone: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số, bắt đầu bằng 0'),

  /** Địa chỉ email (tùy chọn) */
  email: z
    .string()
    .email('Email không đúng định dạng')
    .optional()
    .or(z.literal('')),

  /** Nguồn tiếp cận (tùy chọn) */
  source: z
    .string()
    .max(100, 'Nguồn tối đa 100 ký tự')
    .optional()
    .or(z.literal('')),

  /** Ghi chú nội bộ (tùy chọn) */
  note: z
    .string()
    .max(1000, 'Ghi chú tối đa 1000 ký tự')
    .optional()
    .or(z.literal('')),

  /** Trạng thái của lead — chỉ hiển thị khi chỉnh sửa */
  status: z
    .enum(TRIAL_STATUS_VALUES as [TrialStatus, ...TrialStatus[]])
    .optional(),
});

/** Kiểu dữ liệu trung gian cho Form UI */
export type TrialFormValues = z.infer<typeof trialFormSchema>;

/** Kiểu dữ liệu kết quả sau khi xử lý null để gửi cho API */
export type TrialFormSubmitData = Omit<TrialFormValues, 'email' | 'source' | 'note'> & {
  email: string | null;
  source: string | null;
  note: string | null;
};

// ===================================================
// DANH SÁCH NGUỒN TIẾP CẬN GỢI Ý
// ===================================================

/** Các nguồn tiếp cận phổ biến dùng cho select dropdown */
const SOURCE_OPTIONS = [
  { label: 'Chọn nguồn...', value: '' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Zalo', value: 'Zalo' },
  { label: 'Website', value: 'Website' },
  { label: 'Giới thiệu', value: 'Giới thiệu' },
  { label: 'Walk-in', value: 'Walk-in' },
  { label: 'Khác', value: 'Khác' },
];

// ===================================================
// PROPS
// ===================================================

export interface TrialFormProps {
  /** Dữ liệu mặc định khi edit */
  defaultValues?: Partial<TrialFormValues>;
  /** Callback gọi khi submit, đã được chuẩn hóa chuỗi rỗng -> null */
  onSubmit: (data: TrialFormSubmitData) => void;
  /** Trạng thái loading của nút submit */
  isLoading?: boolean;
  /** Chế độ create hoặc edit */
  mode?: 'create' | 'edit';
}

// ===================================================
// COMPONENT
// ===================================================

/**
 * Form tạo mới hoặc chỉnh sửa Trial Lead
 */
export const TrialForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode = 'create',
}: TrialFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrialFormValues>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      source: '',
      note: '',
      ...defaultValues,
    },
  });

  // Reset form khi defaultValues thay đổi
  useEffect(() => {
    if (defaultValues) {
      reset({
        fullName: '',
        phone: '',
        email: '',
        source: '',
        note: '',
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  /**
   * Hàm xử lý submit nội bộ: Chuyển đổi chuỗi rỗng thành null trước khi trả về parent
   */
  const handleInternalSubmit = (data: TrialFormValues) => {
    const sanitizedData: TrialFormSubmitData = {
      ...data,
      email: data.email || null,
      source: data.source || null,
      note: data.note || null,
    };
    onSubmit(sanitizedData);
  };

  return (
    <form onSubmit={handleSubmit(handleInternalSubmit)} className="space-y-5" noValidate>
      {/* ---- Họ tên (bắt buộc) ---- */}
      <FormInput
        id="trial-fullName"
        label="Họ và tên khách hàng"
        placeholder="Ví dụ: Nguyễn Thị Mai"
        required
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      {/* ---- Số điện thoại (bắt buộc, 10 số VN) ---- */}
      <FormInput
        id="trial-phone"
        label="Số điện thoại liên hệ"
        placeholder="Ví dụ: 0912345678"
        type="tel"
        required
        error={errors.phone?.message}
        {...register('phone')}
      />

      {/* ---- Email (tùy chọn) ---- */}
      <FormInput
        id="trial-email"
        label="Email"
        placeholder="email@example.com"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />

      {/* ---- Nguồn tiếp cận (select gợi ý) ---- */}
      <FormSelect
        id="trial-source"
        label="Nguồn tiếp cận"
        error={errors.source?.message}
        options={SOURCE_OPTIONS}
        {...register('source')}
      />

      {/* ---- Trạng thái — chỉ hiển thị khi edit ---- */}
      {mode === 'edit' && (
        <FormSelect
          id="trial-status"
          label="Trạng thái"
          error={errors.status?.message}
          options={[
            { label: 'Chọn trạng thái...', value: '' },
            ...TRIAL_STATUS_VALUES.map((s) => ({
              label: TRIAL_STATUS_LABELS[s],
              value: s,
            })),
          ]}
          {...register('status')}
        />
      )}

      {/* ---- Ghi chú nội bộ (textarea) ---- */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="trial-note"
          className="text-sm font-medium text-[var(--color-text)]"
        >
          Ghi chú
        </label>
        <textarea
          id="trial-note"
          rows={3}
          placeholder="Ghi chú về khách hàng, nhu cầu học, thời gian rảnh..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
          {...register('note')}
        />
        {errors.note?.message && (
          <span className="text-xs text-red-500">{errors.note.message}</span>
        )}
      </div>

      {/* ---- Nút submit ---- */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="min-w-[140px]"
        >
          {mode === 'create' ? 'Thêm Lead' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
};
