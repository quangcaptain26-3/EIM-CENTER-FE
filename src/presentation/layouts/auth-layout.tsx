import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Đăng nhập: panel trái branding + panel phải form (trái ẩn trên mobile).
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <div
        className="relative hidden w-1/2 flex-col justify-between border-r border-[var(--border-subtle)] p-10 lg:flex"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.25) 1px, transparent 0)
          `,
          backgroundSize: '24px 24px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-transparent to-[var(--bg-base)]" />
        <div className="relative z-[1] space-y-4">
          <p className="font-display text-3xl font-bold text-brand-600">EIM</p>
          <h1 className="max-w-md font-display text-2xl font-semibold leading-tight text-[var(--text-primary)]">
            Hệ thống quản lý trung tâm tiếng Anh
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
            Điểm danh, học phí, nhân sự và báo cáo — một nền tảng cho đội ngũ vận hành và giảng dạy.
          </p>
        </div>
        <p className="relative z-[1] text-xs text-[var(--text-muted)]">© EIM Center</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
