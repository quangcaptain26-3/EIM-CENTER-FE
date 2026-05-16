import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';

const schema = z.object({
  reasonDetail: z.string().min(1, 'Nhập lý do hủy giữ chỗ'),
});

type FormValues = z.infer<typeof schema>;

interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (body: { reasonDetail: string }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function CancelReservationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CancelReservationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reasonDetail: '' },
  });

  useEffect(() => {
    if (isOpen) reset({ reasonDetail: '' });
  }, [isOpen, reset]);

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Hủy giữ chỗ"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button type="submit" form="cancel-reservation-form" variant="danger" isLoading={isSubmitting}>
            Xác nhận hủy giữ chỗ
          </Button>
        </>
      }
    >
      <div className="mb-4 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-200/95">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          Phí giữ chỗ (20% học phí) <strong>không được hoàn</strong> khi hủy chủ quan. Trường hợp lỗi trung tâm
          (Q19) dùng quy trình hoàn phí riêng.
        </p>
      </div>
      <form
        id="cancel-reservation-form"
        onSubmit={handleSubmit((v) => onSubmit({ reasonDetail: v.reasonDetail.trim() }))}
      >
        <FormInput
          label="Lý do hủy"
          {...register('reasonDetail')}
          error={errors.reasonDetail?.message}
          placeholder="Ví dụ: Không còn nhu cầu học tại lớp này"
        />
      </form>
    </Modal>
  );
}
