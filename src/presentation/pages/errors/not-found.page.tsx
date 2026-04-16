import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { RoutePaths } from '@/app/router/route-paths';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4">
      <p
        className="font-display text-[96px] font-bold leading-none text-brand-500/20 select-none"
        aria-hidden
      >
        404
      </p>
      <h1 className="mt-4 font-display text-xl font-semibold text-[var(--text-primary)]">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--text-secondary)]">
        Đường dẫn không tồn tại hoặc đã được đổi. Kiểm tra URL hoặc quay về trang chủ.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Button type="button" onClick={() => navigate(RoutePaths.DASHBOARD, { replace: true })}>
          Về Dashboard
        </Button>
      </div>
    </div>
  );
}
