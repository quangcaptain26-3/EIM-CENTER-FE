import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/shared/lib/cn';
import { RoutePaths } from '@/app/router/route-paths';
import { getClass } from '@/infrastructure/services/classes.api';
import { getStudent } from '@/infrastructure/services/students.api';
import { getUser } from '@/infrastructure/services/users.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseClassDetail } from '@/infrastructure/services/class-parse.util';
import { parseStudentDetail } from '@/infrastructure/services/student-parse.util';
import { parseStaffUserDetail } from '@/infrastructure/services/user-detail.util';

const STATIC: Record<string, string> = {
  [RoutePaths.DASHBOARD]: 'Dashboard',
  [RoutePaths.USERS]: 'Nhân sự',
  [RoutePaths.USER_CREATE]: 'Tạo mới',
  [RoutePaths.CLASSES]: 'Lớp học',
  [RoutePaths.CLASS_NEW]: 'Tạo lớp',
  enroll: 'Ghi danh học viên',
  [RoutePaths.STUDENTS]: 'Học viên',
  [RoutePaths.STUDENT_NEW]: 'Thêm học viên',
  [RoutePaths.PAUSE_REQUESTS]: 'Bảo lưu',
  [RoutePaths.MAKEUP_SESSIONS]: 'Học bù',
  [RoutePaths.MY_SESSIONS]: 'Lịch dạy',
  [RoutePaths.RECEIPTS]: 'Phiếu thu',
  [RoutePaths.RECEIPT_NEW]: 'Tạo phiếu thu',
  [RoutePaths.PAYMENT_STATUS]: 'Học phí',
  [RoutePaths.PAYROLL]: 'Chốt lương',
  [RoutePaths.PAYROLL_NEW]: 'Tạo bảng lương',
  [RoutePaths.REFUND_REQUESTS]: 'Hoàn học phí',
  [RoutePaths.FINANCE_DASHBOARD]: 'Tổng quan',
  [RoutePaths.AUDIT_LOGS]: 'Audit Log',
  [RoutePaths.SEARCH]: 'Tìm kiếm',
  '/finance': 'Học phí',
  '/curriculum': 'Chương trình',
  '/curriculum/programs': 'Chương trình học',
  '/system': 'Hệ thống',
  '/system/notifications': 'Thông báo',
  '/trials': 'Học thử',
};

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

export function AppBreadcrumb({ className }: { className?: string }) {
  const location = useLocation();
  const pathname = normalizePath(location.pathname);

  /** Chi tiết lớp: /classes/:id */
  const classDetailId = useMemo(() => {
    const m = pathname.match(/^\/classes\/([^/]+)$/);
    if (!m?.[1] || m[1] === 'create') return null;
    return m[1];
  }, [pathname]);

  /** Ghi danh vào lớp: /classes/:id/enroll */
  const classEnrollId = useMemo(() => {
    const m = pathname.match(/^\/classes\/([^/]+)\/enroll$/);
    return m?.[1] ?? null;
  }, [pathname]);

  const classIdForFetch = classEnrollId ?? classDetailId;

  const studentId = useMemo(() => {
    const m = pathname.match(/^\/students\/([^/]+)$/);
    if (!m?.[1] || m[1] === 'create') return null;
    return m[1];
  }, [pathname]);

  const userId = useMemo(() => {
    const m = pathname.match(/^\/users\/([^/]+)$/);
    if (!m?.[1] || m[1] === 'create') return null;
    return m[1];
  }, [pathname]);

  const sessionId = useMemo(() => {
    const m = pathname.match(/^\/sessions\/([^/]+)$/);
    return m?.[1] ?? null;
  }, [pathname]);

  const classQ = useQuery({
    queryKey: QUERY_KEYS.CLASSES.detail(classIdForFetch ?? ''),
    queryFn: () => getClass(classIdForFetch!),
    enabled: Boolean(classIdForFetch),
  });
  const classDetail = classQ.data ? parseClassDetail(classQ.data) : null;

  const studentQ = useQuery({
    queryKey: QUERY_KEYS.STUDENTS.detail(studentId ?? ''),
    queryFn: () => getStudent(studentId!),
    enabled: Boolean(studentId),
  });
  const student = studentQ.data ? parseStudentDetail(studentQ.data) : null;

  const userQ = useQuery({
    queryKey: QUERY_KEYS.USERS.detail(userId ?? ''),
    queryFn: () => getUser(userId!),
    enabled: Boolean(userId),
  });
  const staffUser = userQ.data ? parseStaffUserDetail(userQ.data) : null;

  const crumbs = useMemo(() => {
    const out: { label: string; to?: string }[] = [];

    if (pathname === '/' || pathname === '') {
      return [{ label: 'Dashboard' }];
    }

    if (classEnrollId) {
      const classLabel = classQ.isLoading
        ? 'Đang tải…'
        : classQ.isError
          ? 'Không tìm thấy lớp'
          : classDetail?.classCode?.trim() || `Lớp ${classEnrollId.slice(0, 8)}…`;
      out.push({ label: 'Lớp học', to: RoutePaths.CLASSES });
      out.push({
        label: classLabel,
        to: RoutePaths.CLASS_DETAIL.replace(':classId', classEnrollId),
      });
      out.push({ label: STATIC.enroll });
      return out;
    }

    if (classDetailId) {
      const classLabel = classQ.isLoading
        ? 'Đang tải…'
        : classQ.isError
          ? 'Không tìm thấy lớp'
          : classDetail?.classCode?.trim() || `Lớp ${classDetailId.slice(0, 8)}…`;
      out.push({ label: 'Lớp học', to: RoutePaths.CLASSES });
      out.push({
        label: classLabel,
      });
      return out;
    }

    if (studentId) {
      out.push({ label: 'Học viên', to: RoutePaths.STUDENTS });
      out.push({
        label: student?.studentCode ?? student?.fullName ?? 'Đang tải…',
      });
      return out;
    }

    if (userId) {
      out.push({ label: 'Nhân sự', to: RoutePaths.USERS });
      out.push({
        label: staffUser?.fullName ?? 'Đang tải…',
      });
      return out;
    }

    if (sessionId && pathname.startsWith('/sessions/')) {
      out.push({ label: 'Buổi học' });
      out.push({ label: sessionId.slice(0, 8) + '…' });
      return out;
    }

    const label = STATIC[pathname];
    if (label) return [{ label }];

    const parts = pathname.split('/').filter(Boolean);
    const built: string[] = [];
    for (let i = 0; i < parts.length; i += 1) {
      built.push(parts[i]);
      const p = '/' + built.join('/');
      const staticLabel = STATIC[p];
      if (staticLabel) {
        out.push({
          label: staticLabel,
          to: i < parts.length - 1 ? p : undefined,
        });
      } else if (i === parts.length - 1) {
        out.push({ label: parts[i] });
      }
    }

    return out.length ? out : [{ label: 'Trang' }];
  }, [
    pathname,
    classDetailId,
    classEnrollId,
    studentId,
    userId,
    sessionId,
    classDetail?.classCode,
    student?.studentCode,
    student?.fullName,
    staffUser?.fullName,
    classQ.isLoading,
    classQ.isError,
  ]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex min-w-0 items-center gap-2 text-sm text-[var(--text-secondary)]',
        className,
      )}
    >
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-2">
          {i > 0 ? (
            <span className="shrink-0 text-[var(--text-muted)]" aria-hidden>
              /
            </span>
          ) : null}
          {c.to && i < crumbs.length - 1 ? (
            <Link
              to={c.to}
              className="truncate text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              {c.label}
            </Link>
          ) : (
            <span
              className={cn(
                'truncate',
                i === crumbs.length - 1
                  ? 'font-medium text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)]',
              )}
            >
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
