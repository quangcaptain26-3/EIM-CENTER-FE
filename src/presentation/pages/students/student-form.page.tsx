import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Button } from '@/shared/ui/button';
import { AccordionSection } from '@/shared/ui/accordion-section';
import { useStudent } from '@/presentation/hooks/students/use-students';
import { useCreateStudent, useUpdateStudent } from '@/presentation/hooks/students/use-student-mutations';
import { parseCreatedId } from '@/infrastructure/services/class-parse.util';
import { RoutePaths } from '@/app/router/route-paths';
import { applyValidationErrorsFromForm, toastApiError } from '@/presentation/hooks/toast-api-error';

const phoneDigits = (s: string) => s.replace(/\D/g, '');

const schema = z.object({
  fullName: z.string().min(1, 'Nhập họ tên học viên'),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  schoolName: z.string().optional(),
  testResult: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z
    .string()
    .min(1, 'Nhập SĐT phụ huynh')
    .refine((v) => {
      const d = phoneDigits(v);
      return d.length >= 10 && d.length <= 11;
    }, 'SĐT phải có 10–11 chữ số'),
  parentPhone2: z.string().optional(),
  parentZalo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const GENDER_OPTIONS = [
  { value: '', label: '—' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { student, isLoading } = useStudent(isEdit ? id : undefined);
  const createM = useCreateStudent();
  const updateM = useUpdateStudent();

  const [openSections, setOpenSections] = useState({ student: true, parent: true });
  const toggle = (k: keyof typeof openSections) => setOpenSections((s) => ({ ...s, [k]: !s[k] }));

  const defaults = useMemo<FormValues>(
    () => ({
      fullName: student?.fullName ?? '',
      dob: student?.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : '',
      gender: student?.gender ?? '',
      address: student?.address ?? '',
      schoolName: student?.schoolName ?? '',
      testResult: student?.testResult ?? '',
      parentName: student?.parentName ?? '',
      parentPhone: student?.parentPhone ?? '',
      parentPhone2: student?.parentPhone2 ?? '',
      parentZalo: student?.parentZalo ?? '',
    }),
    [student],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (student) reset(defaults);
  }, [student, defaults, reset]);

  const onValid = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      fullName: values.fullName,
      dob: values.dob || undefined,
      gender: values.gender || undefined,
      address: values.address || undefined,
      schoolName: values.schoolName || undefined,
      testResult: values.testResult || undefined,
      parentName: values.parentName || undefined,
      parentPhone: phoneDigits(values.parentPhone),
      parentPhone2: values.parentPhone2 ? phoneDigits(values.parentPhone2) : undefined,
      parentZalo: values.parentZalo?.trim() || undefined,
    };

    try {
      if (isEdit && id) {
        await updateM.mutateAsync({ id, data: payload });
        navigate(RoutePaths.STUDENT_DETAIL.replace(':id', id));
        return;
      }

      const res = await createM.mutateAsync(payload);
      const newId = parseCreatedId(res as unknown);
      if (newId) {
        navigate(RoutePaths.STUDENT_DETAIL.replace(':id', newId));
      } else {
        navigate(RoutePaths.STUDENTS);
      }
    } catch (e) {
      if (!applyValidationErrorsFromForm(e, setError)) {
        toastApiError(e);
      }
    }
  };

  if (isEdit && isLoading && !student) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-muted)]">Đang tải…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <h1 className="mb-6 text-xl font-semibold text-[var(--text-primary)]">
        {isEdit ? 'Cập nhật học viên' : 'Tạo học viên mới'}
      </h1>

      <form onSubmit={handleSubmit(onValid)} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4">
        <AccordionSection
          title="Thông tin học viên"
          open={openSections.student}
          onToggle={() => toggle('student')}
        >
          <FormInput label="Họ tên *" {...register('fullName')} error={errors.fullName?.message} />
          <FormInput label="Ngày sinh" type="date" {...register('dob')} error={errors.dob?.message} />
          <FormSelect label="Giới tính" options={GENDER_OPTIONS} {...register('gender')} />
          <FormInput label="Địa chỉ" {...register('address')} error={errors.address?.message} />
          <FormInput label="Trường đang học" {...register('schoolName')} error={errors.schoolName?.message} />
          <FormInput label="Kết quả test (nếu có)" {...register('testResult')} error={errors.testResult?.message} />
        </AccordionSection>

        <AccordionSection
          title="Thông tin phụ huynh"
          open={openSections.parent}
          onToggle={() => toggle('parent')}
        >
          <FormInput label="Họ tên phụ huynh" {...register('parentName')} error={errors.parentName?.message} />
          <FormInput
            label="Số điện thoại *"
            {...register('parentPhone')}
            error={errors.parentPhone?.message}
            placeholder="10–11 chữ số"
          />
          <FormInput
            label="SĐT phụ (tuỳ chọn)"
            {...register('parentPhone2')}
            error={errors.parentPhone2?.message}
          />
          <FormInput label="Zalo" {...register('parentZalo')} error={errors.parentZalo?.message} />
        </AccordionSection>

        <div className="flex gap-3 py-6">
          <Button type="submit" isLoading={createM.isPending || updateM.isPending}>
            {isEdit ? 'Lưu' : 'Tạo mới'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
