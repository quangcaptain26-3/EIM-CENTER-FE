import { useNavigate } from 'react-router-dom';
import { UserAccountForm } from '@/presentation/components/system/user-account-form';
import { RoutePaths } from '@/app/router/route-paths';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/presentation/hooks/auth/use-auth';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">Thêm nhân viên</h1>
        <Button type="button" variant="ghost" onClick={() => navigate(RoutePaths.USERS)}>
          Quay lại
        </Button>
      </div>
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6">
        <UserAccountForm
          mode="create"
          canEditSalary={isAdmin}
          onSuccess={() => navigate(RoutePaths.USERS)}
          onCancel={() => navigate(RoutePaths.USERS)}
        />
      </div>
    </div>
  );
}
