import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { SkeletonTable } from '@/shared/ui/skeleton';

function buildPageList(current: number, totalPages: number, max = 7): number[] {
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = start + max - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - max + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export interface DataTableProps<TData> {
  /** TanStack v8: cột có thể có accessor type cụ thể (string, number, …) */
  columns: ColumnDef<TData, any>[];
  data: TData[];
  total: number;
  /** Trang hiện tại (bắt đầu từ 1) */
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  getRowId?: (original: TData, index: number) => string;
  className?: string;
  /** "Hiển thị X–Y của Z" + "Trang p/P" (mặc định bật khi có dữ liệu) */
  showPaginationSummary?: boolean;
  /** Ô nhảy nhanh tới trang (danh sách dài) */
  showJumpToPage?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading = false,
  onRowClick,
  emptyMessage = 'Không có dữ liệu.',
  getRowId,
  className,
  showPaginationSummary = true,
  showJumpToPage = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [jumpDraft, setJumpDraft] = useState('');
  const jumpInputId = useId();

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData, any>[],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageList = useMemo(() => buildPageList(page, totalPages, 7), [page, totalPages]);

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min((page - 1) * pageSize + data.length, total);

  useEffect(() => {
    setJumpDraft(String(page));
  }, [page]);

  if (isLoading) {
    return <SkeletonTable className={className} columns={columns.length} />;
  }

  const showEmpty = data.length === 0;

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-[var(--border-default)] bg-[var(--bg-subtle)]"
              >
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]',
                        canSort &&
                          'cursor-pointer select-none hover:text-[var(--text-secondary)]',
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort ? (
                          sorted === 'asc' ? (
                            <ArrowUp className="size-3.5 shrink-0" strokeWidth={1.5} />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3.5 shrink-0" strokeWidth={1.5} />
                          ) : (
                            <ArrowUpDown className="size-3.5 shrink-0 opacity-50" strokeWidth={1.5} />
                          )
                        ) : null}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {showEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-16">
                  <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <Inbox
                      className="size-12 text-[var(--border-strong)]"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <DataTableRow
                  key={row.id}
                  row={row}
                  index={i}
                  onRowClick={onRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!showEmpty && showPaginationSummary && total > 0 ? (
        <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Hiển thị{' '}
              <span className="font-medium text-[var(--text-primary)]">
                {rangeStart}–{rangeEnd}
              </span>
              <span className="text-[var(--text-muted)]"> / </span>
              <span className="font-medium text-[var(--text-primary)]">{total}</span>
              <span className="text-[var(--text-muted)]"> · </span>
              <span>
                Trang{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  {page}/{totalPages}
                </span>
              </span>
            </span>
            {showJumpToPage && totalPages > 1 ? (
              <span className="inline-flex items-center gap-1">
                <label htmlFor={jumpInputId} className="sr-only">
                  Nhảy tới trang
                </label>
                <input
                  id={jumpInputId}
                  type="number"
                  min={1}
                  max={totalPages}
                  className="h-8 w-14 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 text-center text-sm text-[var(--text-primary)]"
                  value={jumpDraft}
                  onChange={(e) => setJumpDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const n = parseInt(jumpDraft, 10);
                      if (!Number.isFinite(n)) return;
                      onPageChange(Math.min(totalPages, Math.max(1, n)));
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    const n = parseInt(jumpDraft, 10);
                    if (!Number.isFinite(n)) return;
                    onPageChange(Math.min(totalPages, Math.max(1, n)));
                  }}
                >
                  Đi
                </Button>
              </span>
            ) : null}
          </p>
        </div>
      ) : null}

      {!showEmpty && totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-1 text-[var(--text-secondary)] sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Trang trước"
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} />
          </Button>
          {pageList.map((p) => (
            <Button
              key={p}
              type="button"
              variant={p === page ? 'primary' : 'ghost'}
              size="sm"
              className={cn(
                'min-w-8 px-2',
                p === page && 'pointer-events-none',
                p !== page &&
                  'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Trang sau"
          >
            <ChevronRight className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function DataTableRow<TData>({
  row,
  index,
  onRowClick,
}: {
  row: Row<TData>;
  index: number;
  onRowClick?: (row: TData) => void;
}) {
  const clickable = Boolean(onRowClick);
  return (
    <tr
      className={cn(
        'border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-colors duration-100 last:border-0 animate-slide-up',
        'hover:bg-[var(--bg-subtle)]',
        clickable && 'cursor-pointer',
      )}
      style={{ animationDelay: `${index * 35}ms` }}
      onClick={clickable ? () => onRowClick?.(row.original) : undefined}
    >
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="px-3 py-2.5 text-[var(--text-primary)]">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
