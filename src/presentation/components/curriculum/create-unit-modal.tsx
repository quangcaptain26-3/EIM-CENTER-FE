import { Modal } from "../../../shared/ui/modal";
import { UnitForm } from "./unit-form";
import { useCreateUnit } from "../../hooks/curriculum/use-unit-mutations";
import type { CreateUnitFormValues } from "../../../application/curriculum/forms/unit.form";

export interface CreateUnitModalProps {
  open: boolean;
  onClose: () => void;
  programId: string;
}

/**
 * Modal bọc UnitForm và kết nối logic create mutation
 */
export const CreateUnitModal = ({
  open,
  onClose,
  programId,
}: CreateUnitModalProps) => {
  const { mutateAsync: createUnit, isPending } = useCreateUnit(programId);

  const handleSubmit = async (values: CreateUnitFormValues) => {
    try {
      await createUnit(values);
      onClose();
    } catch (error) {
      // Lỗi đã được mutate bắt và hiển thị toast trong hooks
      console.error("Failed to create unit", error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm Unit mới"
      closeOnOutsideClick={!isPending}
    >
      <div className="mt-2">
        <p className="text-sm text-slate-500 mb-6">
          Nhập thông tin cho Unit (học phần) mới thuộc chương trình này.
        </p>

        {/* Render Form, logic submit nội bộ Form -> gọi hàm submit bên ngoài */}
        <UnitForm onSubmit={handleSubmit} loading={isPending} />
      </div>
    </Modal>
  );
};
