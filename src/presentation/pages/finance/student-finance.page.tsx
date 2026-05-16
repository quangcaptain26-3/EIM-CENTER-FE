import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { Avatar } from '@/shared/ui/avatar';
import { DebtIndicator } from '@/presentation/components/finance/debt-indicator';
import { useDebt } from '@/presentation/hooks/finance/use-finance';
import { usePermission } from '@/presentation/hooks/use-permission';
import { RoutePaths } from '@/app/router/route-paths';
import { formatDate } from '@/shared/lib/date';
import { formatVnd } from '@/shared/utils/format-vnd';
import { displayText, EMPTY_PLACEHOLDER } from '@/shared/lib/display';
import { cn } from '@/shared/lib/cn';
import type { ReceiptRow } from '@/shared/types/finance.type';

function paymentMethodLabel(method: string | undefined): string {
  if (method === 'transfer' || method === 'bank_transfer') return 'Chuyển khoản';
  if (method === 'cash') return 'Tiền mặt';
  return method ?? '—';
}

function sortReceipts(receipts: ReceiptRow[]): ReceiptRow[] {
  return [...receipts].sort((a, b) => {
    const da = a.paymentDate ?? a.createdAt ?? '';
    const db = b.paymentDate ?? b.createdAt ?? '';
    return String(db).localeCompare(String(da));
  });
}

export default function StudentFinancePage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const { canCreateReceipt } = usePermission();
  const { debt, isLoading, error } = useDebt(enrollmentId);

  const receipts = useMemo(() => (debt?.receipts ? sortReceipts(debt.receipts) : []), [debt?.receipts]);

  const receiptNewHref =
    debt?.studentId && enrollmentId
      ? `${RoutePaths.RECEIPT_NEW}?studentId=${encodeURIComponent(debt.studentId)}&enrollmentId=${encodeURIComponent(enrollmentId)}`
      : null;

  const studentHref = debt?.studentId
    ? RoutePaths.STUDENT_DETAIL.replace(':id', debt.studentId)
    : null;

  if (!enrollmentId) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-secondary)]">Thiếu mã ghi danh trên URL.</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => navigate(RoutePaths.PAYMENT_STATUS)}>
          Về tình hình đóng học phí
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Tài chính học viên</p>
          {isLoading ? (
            <p className="mt-1 text-[var(--text-secondary)]">Đang tải…</p>
          ) : debt ? (
            <div className="mt-2 flex items-center gap-3">
              {debt.studentName ? <Avatar name={debt.studentName} size="md" /> : null}
              <div>
                {studentHref ? (
                  <Link
                    to={studentHref}
                    className="font-display text-xl font-semibold text-[var(--text-primary)] hover:text-brand-400"
                  >
                    {debt.studentName ?? 'Học viên'}
                  </Link>
                ) : (
                  <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                    {debt.studentName ?? 'Học viên'}
                  </h1>
                )}
                <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                  {debt.classCode ? `Lớp ${debt.classCode}` : '—'}
                  {debt.enrollmentStatus ? ` · ${debt.enrollmentStatus}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <h1 className="mt-1 font-display text-xl font-semibold text-[var(--text-primary)]">Tài chính ghi danh</h1>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
          {canCreateReceipt && receiptNewHref ? (
            <Button type="button" onClick={() => navigate(receiptNewHref)}>
              Tạo phiếu thu
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải học phí và phiếu thu…</p>
      ) : error ? (
        <EmptyState
          title="Không tải được dữ liệu"
          description={
            error instanceof Error ? error.message : 'Ghi danh không tồn tại hoặc bạn không có quyền xem.'
          }
          action={
            <Button type="button" variant="secondary" onClick={() => navigate(RoutePaths.PAYMENT_STATUS)}>
              Về danh sách công nợ
            </Button>
          }
        />
      ) : debt ? (
        <>
          <DebtIndicator tuitionFee={debt.tuitionFee} totalPaid={debt.totalPaid} debt={debt.debt} />

          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <h2 className="font-medium text-[var(--text-primary)]">Phiếu thu</h2>
            {receipts.length === 0 ? (
              <EmptyState
                className="py-8"
                title="Chưa có phiếu thu"
                description="Chưa có phiếu thu nào cho ghi danh này."
                action={
                  canCreateReceipt && receiptNewHref ? (
                    <Button type="button" onClick={() => navigate(receiptNewHref)}>
                      Tạo phiếu thu đầu tiên
                    </Button>
                  ) : null
                }
              />
            ) : (
              <ul className="mt-4 space-y-2">
                {receipts.map((r) => {
                  const voided = Boolean(r.voidedByReceiptId);
                  const pos = r.amount >= 0;
                  return (
                    <li
                      key={r.id}
                      className={cn(
                        'rounded-lg border border-[var(--border-subtle)] px-3 py-2',
                        voided && 'opacity-75',
                      )}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Link
                          to={RoutePaths.RECEIPT_DETAIL.replace(':id', r.id)}
                          className={cn(
                            'font-mono text-sm font-medium text-brand-400 hover:underline',
                            voided && 'line-through',
                          )}
                        >
                          {r.receiptCode}
                          {voided ? ' (Đã hủy)' : ''}
                        </Link>
                        <span
                          className={cn(
                            'font-semibold tabular-nums',
                            pos ? 'text-emerald-400' : 'text-red-400',
                          )}
                        >
                          {pos ? '+' : ''}
                          {formatVnd(r.amount)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {r.paymentDate ? formatDate(r.paymentDate) : displayText(r.createdAt, '—')} ·{' '}
                        {paymentMethodLabel(r.paymentMethod)} · Người lập:{' '}
                        {displayText(r.createdBy, EMPTY_PLACEHOLDER)}
                      </p>
                      {r.amountInWords ? (
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{r.amountInWords}</p>
                      ) : null}
                      {r.reason?.trim() ? (
                        <div className="mt-1">
                          <ExpandableText text={r.reason} className="text-xs text-[var(--text-secondary)]" />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Không có dữ liệu học phí"
          description="Không tìm thấy ghi danh hoặc chưa có thông tin công nợ."
          action={
            <Button type="button" variant="secondary" onClick={() => navigate(RoutePaths.PAYMENT_STATUS)}>
              Về danh sách công nợ
            </Button>
          }
        />
      )}
    </div>
  );
}
