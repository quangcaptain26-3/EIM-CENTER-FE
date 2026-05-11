import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/shared/ui/modal';
import { UserAccountForm } from '@/presentation/components/system/user-account-form';
import { getUser } from '@/infrastructure/services/users.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseStaffUserDetail } from '@/infrastructure/services/user-detail.util';
import type { StaffUserDetail } from '@/shared/types/user.type';

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  /** Khi sửa: ưu tiên dùng nếu đã có đủ dữ liệu (vd. trang chi tiết) */
  user?: StaffUserDetail | null;
  /** Khi sửa từ danh sách — modal sẽ GET /users/:id */
  userId?: string | null;
  canEditSalary: boolean;
}

export function UserModal({ isOpen, onClose, mode, user, userId, canEditSalary }: UserModalProps) {
  const idForFetch = mode === 'edit' ? userId ?? user?.id ?? null : null;

  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.USERS.detail(idForFetch ?? ''),
    queryFn: () => getUser(idForFetch!),
    enabled: Boolean(isOpen && mode === 'edit' && idForFetch && !user),
  });

  const resolvedUser =
    mode === 'edit'
      ? user ?? parseStaffUserDetail(detailQuery.data)
      : null;

  const title = mode === 'create' ? 'Thêm nhân viên' : 'Chỉnh sửa nhân viên';
  const loadingEdit = mode === 'edit' && !user && Boolean(idForFetch) && detailQuery.isLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {loadingEdit ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">Đang tải hồ sơ…</p>
      ) : mode === 'edit' && !resolvedUser ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">Không tải được nhân viên.</p>
      ) : (
        <UserAccountForm
          mode={mode}
          userId={resolvedUser?.id ?? userId ?? undefined}
          defaultValues={resolvedUser ?? undefined}
          canEditSalary={canEditSalary}
          onSuccess={onClose}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
