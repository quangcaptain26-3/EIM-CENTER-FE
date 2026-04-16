import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { FormField } from '@/shared/ui/form/form-field';
import { Button } from '@/shared/ui/button';
import { AccordionSection } from '@/shared/ui/accordion-section';
import { ROLES } from '@/shared/constants/roles';
import type { RoleCode } from '@/shared/types/auth.type';
import type { StaffUserDetail } from '@/shared/types/user.type';
import { useCreateUser, useUpdateUser } from '@/presentation/hooks/system/use-user-mutations';
import { handleUserFormApiError } from '@/presentation/utils/user-api-error.util';
import { toastApiError } from '@/presentation/hooks/toast-api-error';

const roleEnum = z.enum(['ADMIN', 'ACADEMIC', 'ACCOUNTANT', 'TEACHER']);

const roleSelectOptions = [
  { value: ROLES.ADMIN, label: '🛡️ Giám đốc' },
  { value: ROLES.ACADEMIC, label: '📚 Học vụ' },
  { value: ROLES.ACCOUNTANT, label: '🧮 Kế toán' },
  { value: ROLES.TEACHER, label: '✏️ Giáo viên' },
];

const baseFields = {
  email: z.string(),
  fullName: z.string().min(1, 'Nhập họ tên'),
  gender: z.string().optional(),
  dob: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  cccd: z.string().optional(),
  nationality: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  roleCode: roleEnum,
  educationLevel: z.string().optional(),
  major: z.string().optional(),
  startDate: z.string().optional(),
  salaryPerSession: z.number().optional(),
  allowance: z.number().optional(),
};

const userFormSchema = z.object(baseFields).superRefine((data, ctx) => {
  if (data.email.trim()) {
    const r = z.string().email('Email không hợp lệ').safeParse(data.email.trim());
    if (!r.success) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: r.error.flatten().formErrors[0] ?? 'Email không hợp lệ' });
    }
  }
});

export type UserAccountFormValues = z.infer<typeof userFormSchema>;

function refineSalary(canEditSalary: boolean, data: UserAccountFormValues, ctx: z.RefinementCtx) {
  if (!canEditSalary || data.roleCode !== 'TEACHER') return;
  const s = data.salaryPerSession;
  const a = data.allowance;
  if (s === undefined || Number.isNaN(s)) {
    ctx.addIssue({ code: 'custom', path: ['salaryPerSession'], message: 'Nhập lương / buổi' });
  } else if (s < 0) {
    ctx.addIssue({ code: 'custom', path: ['salaryPerSession'], message: 'Không âm' });
  }
  if (a === undefined || Number.isNaN(a)) {
    ctx.addIssue({ code: 'custom', path: ['allowance'], message: 'Nhập phụ cấp (có thể 0)' });
  } else if (a < 0) {
    ctx.addIssue({ code: 'custom', path: ['allowance'], message: 'Không âm' });
  }
}

function buildSchema(mode: 'create' | 'edit', canEditSalary: boolean) {
  return userFormSchema.superRefine((data, ctx) => {
    if (mode === 'create') {
      if (!data.email?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['email'], message: 'Nhập email' });
      } else {
        const r = z.string().email('Email không hợp lệ').safeParse(data.email.trim());
        if (!r.success) {
          ctx.addIssue({ code: 'custom', path: ['email'], message: 'Email không hợp lệ' });
        }
      }
    }
    refineSalary(canEditSalary, data, ctx);
  });
}

function toFormDefaults(
  mode: 'create' | 'edit',
  u?: Partial<StaffUserDetail> & { email?: string | null },
): UserAccountFormValues {
  return {
    email: mode === 'edit' ? (u?.email ?? '') : (u?.email ?? ''),
    fullName: u?.fullName ?? '',
    gender: u?.gender ?? '',
    dob: u?.dob ? String(u.dob).slice(0, 10) : '',
    phone: u?.phone ?? '',
    address: u?.address ?? '',
    cccd: u?.cccd ?? '',
    nationality: u?.nationality?.trim() ? u.nationality : 'Việt Nam',
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

function buildPayload(values: UserAccountFormValues, mode: 'create' | 'edit', showSalary: boolean) {
  const payload: Record<string, unknown> = {
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
  if (mode === 'create') {
    payload.email = values.email.trim();
  }
  if (showSalary) {
    payload.salaryPerSession = values.salaryPerSession;
    payload.allowance = values.allowance;
  }
  return payload;
}

export interface UserAccountFormProps {
  mode: 'create' | 'edit';
  userId?: string;
  defaultValues?: Partial<StaffUserDetail> & { email?: string | null };
  canEditSalary: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserAccountForm({
  mode,
  userId,
  defaultValues,
  canEditSalary,
  onSuccess,
  onCancel,
}: UserAccountFormProps) {
  const schema = useMemo(() => buildSchema(mode, canEditSalary), [mode, canEditSalary]);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [openSections, setOpenSections] = useState({
    personal: true,
    legal: false,
    job: false,
    salary: false,
  });

  const toggle = (k: keyof typeof openSections) => {
    setOpenSections((s) => ({ ...s, [k]: !s[k] }));
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserAccountFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormDefaults(mode, defaultValues),
  });

  useEffect(() => {
    reset(toFormDefaults(mode, defaultValues));
  }, [mode, defaultValues, reset]);

  const roleCode = useWatch({ control, name: 'roleCode' });
  const showSalary = canEditSalary && roleCode === 'TEACHER';

  const pending = createUser.isPending || updateUser.isPending;

  const onValid = async (values: UserAccountFormValues) => {
    const payload = buildPayload(values, mode, showSalary);
    try {
      if (mode === 'create') {
        await createUser.mutateAsync(payload);
      } else if (userId) {
        await updateUser.mutateAsync({ id: userId, data: payload });
      }
      onSuccess?.();
    } catch (e) {
      if (!handleUserFormApiError(e, setError)) {
        toastApiError(e);
      }
    }
  };

  const textareaClass =
    'min-h-[88px] w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--text-muted)] hover:border-[var(--border-strong)] focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)]';

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-1">
      <AccordionSection
        title="Thông tin cá nhân"
        open={openSections.personal}
        onToggle={() => toggle('personal')}
      >
        {mode === 'create' ? (
          <FormInput
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />
        ) : (
          <FormInput
            label="Email"
            type="email"
            readOnly
            className="opacity-80"
            {...register('email')}
            error={errors.email?.message}
          />
        )}
        <FormInput label="Họ và tên" {...register('fullName')} error={errors.fullName?.message} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Giới tính" {...register('gender')} error={errors.gender?.message} />
          <FormInput label="Ngày sinh" type="date" {...register('dob')} error={errors.dob?.message} />
        </div>
        <FormInput label="Số điện thoại" {...register('phone')} error={errors.phone?.message} />
        <FormField label="Địa chỉ" htmlFor="user-address" error={errors.address?.message}>
          <textarea id="user-address" className={textareaClass} {...register('address')} rows={3} />
        </FormField>
      </AccordionSection>

      <AccordionSection title="Pháp lý" open={openSections.legal} onToggle={() => toggle('legal')}>
        <FormInput label="CCCD / CMT" {...register('cccd')} error={errors.cccd?.message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Quốc tịch" {...register('nationality')} error={errors.nationality?.message} />
          <FormInput label="Dân tộc" {...register('ethnicity')} error={errors.ethnicity?.message} />
        </div>
        <FormInput label="Tôn giáo" {...register('religion')} error={errors.religion?.message} />
      </AccordionSection>

      <AccordionSection title="Công tác" open={openSections.job} onToggle={() => toggle('job')}>
        <FormSelect
          label="Vai trò"
          options={roleSelectOptions}
          {...register('roleCode')}
          error={errors.roleCode?.message}
        />
        <FormInput label="Trình độ" {...register('educationLevel')} error={errors.educationLevel?.message} />
        <FormInput label="Chuyên ngành" {...register('major')} error={errors.major?.message} />
        <FormInput label="Ngày vào làm" type="date" {...register('startDate')} error={errors.startDate?.message} />
      </AccordionSection>

      {showSalary ? (
        <AccordionSection title="Lương" open={openSections.salary} onToggle={() => toggle('salary')}>
          <p className="text-xs text-[var(--text-muted)]">Đơn vị VND — áp dụng cho giáo viên.</p>
          <FormInput
            label="Lương / buổi"
            type="number"
            step="1"
            {...register('salaryPerSession', { valueAsNumber: true })}
            error={errors.salaryPerSession?.message}
          />
          <FormInput
            label="Phụ cấp"
            type="number"
            step="1"
            {...register('allowance', { valueAsNumber: true })}
            error={errors.allowance?.message}
          />
        </AccordionSection>
      ) : null}

      <div className="flex justify-end gap-2 pt-4">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Hủy
          </Button>
        ) : null}
        <Button type="submit" isLoading={pending}>
          {mode === 'create' ? 'Tạo nhân viên' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
}
