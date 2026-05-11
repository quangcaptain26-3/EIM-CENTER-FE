import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks/use-click-outside';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';
import { RoutePaths } from '@/app/router/route-paths';
import type { UserListItem } from '@/shared/types/user.type';

export interface UserRowActionsProps {
  row: UserListItem;
  isAdmin: boolean;
  currentUserId: string | undefined;
  onEdit: (row: UserListItem) => void;
  onChangeSalary: (row: UserListItem) => void;
  onDelete: (row: UserListItem) => void;
}

export function UserRowActions({
  row,
  isAdmin,
  currentUserId,
  onEdit,
  onChangeSalary,
  onDelete,
}: UserRowActionsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open ? () => setOpen(false) : null, open);

  const canDelete = isAdmin && currentUserId !== row.id;

  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <div ref={ref} className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Thao tác"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MoreVertical className="size-4" strokeWidth={1.5} />
        </Button>
        {open ? (
          <div
            role="menu"
            className={cn(
              'absolute right-0 z-30 mt-1 min-w-[200px] rounded-xl border border-[var(--border-default)]/80 bg-[var(--bg-surface)] py-1 shadow-xl',
            )}
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              onClick={() => {
                setOpen(false);
                navigate(RoutePaths.USER_DETAIL.replace(':id', row.id));
              }}
            >
              Xem hồ sơ
            </button>
            {isAdmin ? (
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                onClick={() => {
                  setOpen(false);
                  onEdit(row);
                }}
              >
                Chỉnh sửa
              </button>
            ) : null}
            {isAdmin && row.roleCode === 'TEACHER' ? (
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                onClick={() => {
                  setOpen(false);
                  onChangeSalary(row);
                }}
              >
                Cập nhật lương
              </button>
            ) : null}
            {isAdmin ? (
              <>
                <div className="my-1 border-t border-[var(--border-subtle)]" />
                <button
                  type="button"
                  role="menuitem"
                  disabled={!canDelete}
                  title={!canDelete ? 'Không thể vô hiệu chính mình' : undefined}
                  className={cn(
                    'block w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-elevated)]',
                    canDelete ? 'text-red-400' : 'cursor-not-allowed text-[var(--text-muted)]',
                  )}
                  onClick={() => {
                    if (!canDelete) return;
                    setOpen(false);
                    onDelete(row);
                  }}
                >
                  Vô hiệu
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
