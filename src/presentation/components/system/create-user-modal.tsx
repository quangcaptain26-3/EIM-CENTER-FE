import { UserModal } from '@/presentation/components/system/user-modal';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  canEditSalary?: boolean;
}

export function CreateUserModal({ isOpen, onClose, canEditSalary = true }: CreateUserModalProps) {
  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      mode="create"
      canEditSalary={canEditSalary}
    />
  );
}
