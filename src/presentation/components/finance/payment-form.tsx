/**
 * @file payment-form.tsx
 * @description Form ghi nhận thanh toán cho hóa đơn.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/shared/ui/form/form-input";
import { FormSelect } from "@/shared/ui/form/form-select";
import { Button } from "@/shared/ui/button";
import { formatVND } from "@/shared/lib/currency";
import { PaymentMethod } from "@/domain/finance/models/payment.model";

/**
 * Schema validation cho form thanh toán
 */
const createPaymentSchema = (maxAmount: number) => z.object({
  amount: z.coerce.number()
    .min(1000, "Số tiền tối thiểu là 1.000 ₫")
    .max(maxAmount, `Số tiền không được vượt quá số tiền còn lại (${formatVND(maxAmount)})`),
  method: z.nativeEnum(PaymentMethod),
  note: z.string().optional(),
});

type PaymentFormValues = {
  amount: number;
  method: PaymentMethod;
  note?: string;
};

export interface PaymentFormProps {
  invoiceId: string;
  remainingAmount: number;
  onSuccess: (values: PaymentFormValues) => void;
  isLoading?: boolean;
}

/**
 * Component Form ghi nhận thanh toán.
 */
export const PaymentForm = ({
  remainingAmount,
  onSuccess,
  isLoading,
}: PaymentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(createPaymentSchema(remainingAmount)) as any,
    defaultValues: {
      amount: remainingAmount,
      method: PaymentMethod.TRANSFER,
    },
  });

  const methodOptions = [
    { label: "Chuyển khoản", value: PaymentMethod.TRANSFER },
    { label: "Tiền mặt", value: PaymentMethod.CASH },
    { label: "Khác", value: PaymentMethod.OTHER },
  ];

  return (
    <form onSubmit={handleSubmit(onSuccess)} className="space-y-4">
      {/* Thông tin số tiền còn nợ */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex justify-between items-center">
        <span className="text-sm text-blue-700 font-medium">Số tiền còn lại cần đóng:</span>
        <span className="text-lg font-bold text-blue-800">{formatVND(remainingAmount)}</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Số tiền thanh toán"
          type="number"
          placeholder="Ví dụ: 1.500.000"
          {...register("amount")}
          error={errors.amount?.message}
          required
        />

        <FormSelect
          label="Phương thức thanh toán"
          options={methodOptions}
          {...register("method")}
          error={errors.method?.message}
          required
        />

        <FormInput
          label="Ghi chú"
          placeholder="Ví dụ: Đóng học phí đợt 1"
          {...register("note")}
          error={errors.note?.message}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" loading={isLoading}>
          Xác nhận thanh toán
        </Button>
      </div>
    </form>
  );
};
