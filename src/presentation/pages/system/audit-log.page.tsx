import { Fragment, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { ChevronDown, ChevronRight, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { useAuditLogsList } from '@/presentation/hooks/system/use-audit-logs';
import { exportAuditLogs } from '@/infrastructure/services/system.api';
import {
  AUDIT_ACTION_GROUPS,
  AUDIT_ENTITY_TYPES,
  type AuditLogRow,
} from '@/shared/types/audit-log.type';
import { cn } from '@/shared/lib/cn';
import { formatDateTimeUtc7 } from '@/shared/lib/date';

dayjs.extend(relativeTime);
dayjs.locale('vi');

function diffKeys(oldV: Record<string, unknown> | null | undefined, newV: Record<string, unknown> | null | undefined) {
  const a = oldV ?? {};
  const b = newV ?? {};
  return Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
}

function formatVal(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v, null, 0);
  return String(v);
}

function AuditDiffPanel({ row }: { row: AuditLogRow }) {
  const oldV = row.oldValues ?? undefined;
  const newV = row.newValues ?? undefined;
  if (!oldV && !newV) {
    return <p className="text-sm text-[var(--text-muted)]">Không có dữ liệu thay đổi.</p>;
  }
  const keys = diffKeys(oldV, newV);
  if (keys.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">Không có trường diff.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {keys.map((k) => {
        const before = oldV?.[k];
        const after = newV?.[k];
        const added = before === undefined && after !== undefined;
        const removed = before !== undefined && after === undefined;
        const changed =
          before !== undefined && after !== undefined && JSON.stringify(before) !== JSON.stringify(after);
        return (
          <div key={k} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3 text-sm">
            <p className="font-mono text-xs text-brand-400">{k}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase text-[var(--text-muted)]">Trước</p>
                <p className={cn('break-all', removed || changed ? 'text-red-400' : 'text-[var(--text-muted)]')}>
                  {formatVal(before)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--text-muted)]">Sau</p>
                <p className={cn('break-all', added || changed ? 'text-green-400' : 'text-[var(--text-muted)]')}>
                  {formatVal(after)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit,
      actor: actor || undefined,
      action: action || undefined,
      entityType: entityType || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [page, limit, actor, action, entityType, dateFrom, dateTo],
  );

  const { rows, total, isLoading, refetch } = useAuditLogsList(params);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (actor.trim()) n += 1;
    if (action) n += 1;
    if (entityType) n += 1;
    if (dateFrom) n += 1;
    if (dateTo) n += 1;
    return n;
  }, [actor, action, entityType, dateFrom, dateTo]);

  const downloadExport = async () => {
    setExporting(true);
    try {
      const blob = await exportAuditLogs({
        actor: actor || undefined,
        action: action || undefined,
        entityType: entityType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Đã tải CSV');
    } catch {
      toast.error('Không tải được file');
    } finally {
      setExporting(false);
    }
  };

  const filterFields = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <FormInput label="Actor (tên / mã)" value={actor} onChange={(e) => { setActor(e.target.value); setPage(1); }} />
      <div>
        <label className="mb-1 block text-xs text-[var(--text-muted)]">Loại hành động</label>
        <select
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả</option>
          {AUDIT_ACTION_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--text-muted)]">Entity</label>
        <select
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
        >
          {AUDIT_ENTITY_TYPES.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <FormInput
        label="Từ ngày"
        type="date"
        value={dateFrom}
        onChange={(e) => {
          setDateFrom(e.target.value);
          setPage(1);
        }}
      />
      <FormInput
        label="Đến ngày"
        type="date"
        value={dateTo}
        onChange={(e) => {
          setDateTo(e.target.value);
          setPage(1);
        }}
      />
    </div>
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Nhật ký hệ thống</h1>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void refetch()}>
            Làm mới
          </Button>
          <Button type="button" isLoading={exporting} onClick={() => void downloadExport()}>
            <Download className="mr-1.5 size-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      <div className="md:hidden">
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-between"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <span className="flex items-center gap-2">
            <Filter className="size-4" />
            Bộ lọc
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>
            ) : null}
          </span>
          <ChevronDown className={cn('size-4 transition', filtersOpen && 'rotate-180')} />
        </Button>
        {filtersOpen ? <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">{filterFields}</div> : null}
      </div>

      <div className="hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 md:block">{filterFields}</div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
        <table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
          <thead className="bg-[var(--bg-surface)]">
            <tr>
              <th className="w-10 px-2 py-3" />
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Thời gian</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Actor</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Hành động</th>
              <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:table-cell">
                Đối tượng
              </th>
              <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] lg:table-cell">
                Mô tả
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  Đang tải…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  Không có bản ghi
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const open = expandedId === r.id;
                const d = r.createdAt ? dayjs(r.createdAt) : null;
                return (
                  <Fragment key={r.id}>
                    <tr
                      className="cursor-pointer hover:bg-[var(--bg-elevated)]/40"
                      onClick={() => setExpandedId((id) => (id === r.id ? null : r.id))}
                    >
                      <td className="px-2 py-2">
                        <span className="inline-flex rounded p-1 text-[var(--text-muted)]">
                          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2 align-top text-[var(--text-secondary)]"
                        title={r.createdAt ? formatDateTimeUtc7(r.createdAt) : ''}
                      >
                        {d ? (
                          <span className="flex flex-col gap-0.5">
                            <span>{d.format('DD/MM/YYYY HH:mm')}</span>
                            <span className="text-[11px] text-[var(--text-muted)]">{d.fromNow()}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.actorName ?? r.actorCode ?? r.actorId ?? '?'} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-[var(--text-primary)]">
                              {r.actorName ?? r.actorCode ?? r.actorId ?? '—'}
                            </p>
                            {r.actorCode ? <p className="font-mono text-xs text-[var(--text-muted)]">{r.actorCode}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <Badge variant="brand" className="font-mono text-[10px]">
                          {r.action}
                        </Badge>
                      </td>
                      <td className="hidden px-3 py-2 align-top text-[var(--text-secondary)] sm:table-cell">
                        {r.entityType ?? '—'}{' '}
                        {r.entityId ? <span className="font-mono text-[var(--text-muted)]">· {r.entityId.slice(0, 8)}…</span> : null}
                      </td>
                      <td className="hidden max-w-xs px-3 py-2 align-top text-[var(--text-secondary)] lg:table-cell">
                        <span className="line-clamp-2">{r.description ?? '—'}</span>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="bg-[var(--bg-base)]/50">
                        <td colSpan={6} className="px-4 py-4">
                          <AuditDiffPanel row={r} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between text-sm text-[var(--text-muted)]">
        <span>
          Trang {page} / {totalPages} · {total} bản ghi
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
