import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { createStudentFormSchema, type CreateStudentFormValues } from '@/application/students/forms/student.form';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Button } from '@/shared/ui/button';

export interface StudentFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<CreateStudentFormValues>;
  onSubmit: (data: CreateStudentFormValues) => void;
  loading?: boolean;
}

/**
 * Component form học viên dùng chung cho Create/Edit
 */
export const StudentForm = ({ mode, initialValues, onSubmit, loading }: StudentFormProps) => {
  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentFormSchema),
    defaultValues: initialValues,
  });

  // Reset data khi initialValues đổi (lúc fetch data edit xong)
  useEffect(() => {
    if (initialValues) {
      reset(initialValues as CreateStudentFormValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="student-form-grid">
        <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Thông tin cơ bản
        </h3>
        
        <FormInput
          label="Họ và tên"
          placeholder="Nhập họ tên học viên"
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        <FormInput
          label="Ngày sinh"
          type="date"
          error={errors.dob?.message}
          {...register('dob')}
        />

        <FormSelect
          label="Giới tính"
          error={errors.gender?.message}
          options={[
            { label: 'Chọn giới tính', value: '' },
            { label: 'Nam', value: 'MALE' },
            { label: 'Nữ', value: 'FEMALE' },
            { label: 'Khác', value: 'OTHER' },
          ]}
          {...register('gender')}
        />

        <FormInput
          label="Số điện thoại"
          placeholder="Ví dụ: 0901234567"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="email@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          label="Địa chỉ cư trú"
          placeholder="Nhập địa chỉ"
          className="md:col-span-2"
          error={errors.address?.message}
          {...register('address')}
        />

        <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mt-2">
          Thông tin người giám hộ (nếu cần)
        </h3>

        <FormInput
          label="Họ tên người giám hộ"
          placeholder="Tên phụ huynh / người đại diện"
          error={errors.guardianName?.message}
          {...register('guardianName')}
        />

        <FormInput
          label="SĐT người giám hộ"
          placeholder="SĐT liên hệ"
          error={errors.guardianPhone?.message}
          {...register('guardianPhone')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo học viên' : 'Lưu cập nhật'}
        </Button>
      </div>
    </form>
  );
};
