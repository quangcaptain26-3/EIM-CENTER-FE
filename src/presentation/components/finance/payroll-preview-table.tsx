import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { PayrollSessionPreviewRow } from '@/shared/types/finance.type';
import { formatDate } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { DataTable } from '@/shared/ui/data-table';

export type SessionRowKind = 'main' | 'cover' | 'covered';

export interface PayrollPreviewTableRow extends PayrollSessionPreviewRow {
  kind: SessionRowKind;
}

interface PayrollPreviewTableProps {
  rows: PayrollPreviewTableRow[];
  className?: string;
  /** Trang chi tiết bảng lương / in: bảng không ép min-width 640px, ẩn dòng phân trang dư. */
  embedInDocument?: boolean;
}

function KindBadge({ kind }: { kind: SessionRowKind }) {
  const map: Record<SessionRowKind, { label: string; className: string }> = {
    main: { label: 'Dạy chính', className: 'border-blue-500/40 bg-blue-500/15 text-blue-200' },
    cover: { label: 'Cover', className: 'border-amber-500/40 bg-amber-500/15 text-amber-200' },
    covered: { label: 'Bị cover', className: 'border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]' },
  };
  const x = map[kind];
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', x.className)}>
      {x.label}
    </span>
  );
}

const colHelper = createColumnHelper<PayrollPreviewTableRow>();

export function PayrollPreviewTable({ rows, className = '', embedInDocument = false }: PayrollPreviewTableProps) {
  const columns = useMemo(
    () => [
      colHelper.accessor((r) => r.sessionDate, {
        id: 'sessionDate',
        header: 'Ngày',
        cell: (ctx) => {
          const d = ctx.getValue();
          return (
            <span className="whitespace-nowrap text-[var(--text-primary)]">{d ? formatDate(String(d).slice(0, 10)) : '—'}</span>
          );
        },
      }),
      colHelper.accessor('classCode', {
        header: 'Lớp',
        cell: (ctx) => <span className="text-[var(--text-secondary)]">{ctx.getValue()}</span>,
      }),
      colHelper.display({
        id: 'kind',
        header: 'Loại',
        cell: (ctx) => <KindBadge kind={ctx.row.original.kind} />,
      }),
    ],
    [],
  );

  const pageSize = Math.max(rows.length, 1);

  return (
    <div className={cn('w-full min-w-0', className)}>
      <DataTable
        columns={columns}
        data={rows}
        total={rows.length}
        page={1}
        pageSize={pageSize}
        onPageChange={() => {}}
        getRowId={(r) => `${r.sessionId}-${r.kind}`}
        emptyMessage="Không có buổi trong kỳ"
        className="border-0"
        embedInDocument={embedInDocument}
      />
    </div>
  );
}
