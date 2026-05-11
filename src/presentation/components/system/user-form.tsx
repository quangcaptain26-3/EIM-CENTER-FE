import { useMemo, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Button } from '@/shared/ui/button';
import { ROLES } from '@/shared/constants/roles';
import type { RoleCode } from '@/shared/types/auth.type';
import type { StaffUserDetail } from '@/shared/types/user.type';

const roleOptions = [
  { value: ROLES.ADMIN, label: 'Quản trị' },
  { value: ROLES.ACADEMIC, label: 'Đào tạo' },
  { value: ROLES.ACCOUNTANT, label: 'Kế toán' },
  { value: ROLES.TEACHER, label: 'Giáo viên' },
];

const userFormBaseSchema = z.object({
  email: z.union([z.string().email('Email không hợp lệ'), z.literal('')]).optional(),
  fullName: z.string().min(1, 'Nhập họ tên'),
  gender: z.string().optional(),
  dob: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  cccd: z.string().optional(),
  nationality: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  roleCode: z.enum(['ADMIN', 'ACADEMIC', 'ACCOUNTANT', 'TEACHER']),
  educationLevel: z.string().optional(),
  major: z.string().optional(),
  startDate: z.string().optional(),
  salaryPerSession: z.number().optional(),
  allowance: z.number().optional(),
});

export type UserFormValues = z.infer<typeof userFormBaseSchema>;

function buildUserFormSchema(canEditSalary: boolean) {
  return userFormBaseSchema.superRefine((data, ctx) => {
    if (!canEditSalary || data.roleCode !== 'TEACHER') return;
    const s = data.salaryPerSession;
    const a = data.allowance;
    if (s === undefined || Number.isNaN(s)) {
      ctx.addIssue({
        code: 'custom',
        path: ['salaryPerSession'],
        message: 'Nhập lương / buổi',
      });
    } else if (s < 0) {
      ctx.addIssue({ code: 'custom', path: ['salaryPerSession'], message: 'Không âm' });
    }
    if (a === undefined || Number.isNaN(a)) {
      ctx.addIssue({
        code: 'custom',
        path: ['allowance'],
        message: 'Nhập phụ cấp (có thể 0)',
      });
    } else if (a < 0) {
      ctx.addIssue({ code: 'custom', path: ['allowance'], message: 'Không âm' });
    }
  });
}

function toFormDefaults(u?: Partial<StaffUserDetail> & { email?: string | null }): UserFormValues {
  return {
    email: u?.email ?? '',
    fullName: u?.fullName ?? '',
    gender: u?.gender ?? '',
    dob: u?.dob ? String(u.dob).slice(0, 10) : '',
    phone: u?.phone ?? '',
    address: u?.address ?? '',
    cccd: u?.cccd ?? '',
    nationality: u?.nationality ?? '',
    ethnicity: u?.ethnicity ?? '',
    religion: u?.religion ?? '',
    roleCode: (u?.roleCode as RoleCode) ?? ROLES.TEACHER,
    educationLevel: u?.educationLevel ?? '',
    major: u?.major ?? '',
    startDate: u?.startDate ? String(u.startDate).slice(0, 10) : '',
    salaryPerSession: u?.salaryPerSession ?? 0,
    allowance: u?.allowance ?? 0,
  };
}

interface UserFormProps {
  defaultValues?: Partial<StaffUserDetail> & { email?: string | null };
  onSubmit: (payload: Record<string, unknown>) => void | Promise<void>;
  isSubmitting?: boolean;
  canEditSalary: boolean;
  submitLabel?: string;
}

export function UserForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  canEditSalary,
  submitLabel = 'Lưu',
}: UserFormProps) {
  const schema = useMemo(() => buildUserFormSchema(canEditSalary), [canEditSalary]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormDefaults(defaultValues),
  });

  const roleCode = useWatch({ control, name: 'roleCode' });
  const showSalary = canEditSalary && roleCode === 'TEACHER';

  const onValid = async (values: UserFormValues) => {
    const payload: Record<string, unknown> = {
      email: values.email || undefined,
      fullName: values.fullName,
      gender: values.gender || undefined,
      dob: values.dob || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      cccd: values.cccd || undefined,
      nationality: values.nationality || undefined,
      ethnicity: values.ethnicity || undefined,
      religion: values.religion || undefined,
      roleCode: values.roleCode,
      educationLevel: values.educationLevel || undefined,
      major: values.major || undefined,
      startDate: values.startDate || undefined,
    };
    if (showSalary) {
      payload.salaryPerSession = values.salaryPerSession;
      payload.allowance = values.allowance;
    }
    await onSubmit(payload);
  };

  const section = (title: string, children: ReactNode) => (
    <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
      <legend className="px-1 text-sm font-semibold text-gray-900">{title}</legend>
      {children}
    </fieldset>
  );

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      {section(
        'Thông tin cá nhân',
        <>
          <FormInput label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <FormInput label="Họ và tên" {...register('fullName')} error={errors.fullName?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Giới tính" {...register('gender')} error={errors.gender?.message} />
            <FormInput label="Ngày sinh" type="date" {...register('dob')} error={errors.dob?.message} />
          </div>
          <FormInput label="Số điện thoại" {...register('phone')} error={errors.phone?.message} />
          <FormInput label="Địa chỉ" {...register('address')} error={errors.address?.message} />
        </>
      )}

      {section(
        'Pháp lý',
        <>
          <FormInput label="CCCD / CMT" {...register('cccd')} error={errors.cccd?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Quốc tịch" {...register('nationality')} error={errors.nationality?.message} />
            <FormInput label="Dân tộc" {...register('ethnicity')} error={errors.ethnicity?.message} />
          </div>
          <FormInput label="Tôn giáo" {...register('religion')} error={errors.religion?.message} />
        </>
      )}

      {section(
        'Công tác',
        <>
          <FormSelect
            label="Vai trò"
            options={roleOptions}
            {...register('roleCode')}
            error={errors.roleCode?.message}
          />
          <FormInput
            label="Trình độ"
            {...register('educationLevel')}
            error={errors.educationLevel?.message}
          />
          <FormInput label="Chuyên ngành" {...register('major')} error={errors.major?.message} />
          <FormInput
            label="Ngày vào làm"
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
        </>
      )}

      {showSalary
        ? section(
            'Lương (chỉ giáo viên)',
            <>
              <FormInput
                label="Lương / buổi"
                type="number"
                step="0.01"
                {...register('salaryPerSession', { valueAsNumber: true })}
                error={errors.salaryPerSession?.message}
              />
              <FormInput
                label="Phụ cấp"
                type="number"
                step="0.01"
                {...register('allowance', { valueAsNumber: true })}
                error={errors.allowance?.message}
              />
            </>
          )
        : null}

      <div className="flex justify-end gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
