/**
 * audit-log-table.tsx
 * Bảng hiển thị nhật ký kiểm toán với khả năng lọc và xem chi tiết thay đổi.
 */

import React, { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  getExpandedRowModel,
  type ExpandedState
} from '@tanstack/react-table';
import { type AuditLogModel, AuditAction } from '@/domain/system/models/audit-log.model';
import { StatusBadge } from '@/presentation/components/common/status-badge';
import { formatDate } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { ChevronUp, Eye, FilterX } from 'lucide-react';
import { Select } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

/** Props cho AuditLogTable */
interface AuditLogTableProps {
  logs: AuditLogModel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  filters: {
    entityType?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
  };
  onFilterChange: (filters: any) => void;
  loading?: boolean;
}

/** Component hiển thị sự khác biệt giữa before và after data */
const DataDiffView = ({ before, after }: { before: any; after: any }) => {
  if (!before && !after) return <p className="text-slate-400 italic p-4">Không có dữ liệu chi tiết</p>;

  // Trường hợp tạo mới (before null)
  if (!before && after) {
    return (
      <div className="p-4 bg-emerald-50/30 border-t border-emerald-100 italic">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">Hành động: Tạo mới bản ghi</h5>
        <pre className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-emerald-100 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(after, null, 2)}
        </pre>
      </div>
    );
  }

  // Trường hợp xoá (after null)
  if (before && !after) {
    return (
      <div className="p-4 bg-rose-50/30 border-t border-rose-100 italic">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-2">Hành động: Xoá bản ghi</h5>
        <pre className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-rose-100 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(before, null, 2)}
        </pre>
      </div>
    );
  }

  // Trường hợp cập nhật: So sánh và highlight
  const allKeys = Array.from(new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {})
  ])).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');

  const changedKeys = allKeys.filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]));

  if (changedKeys.length === 0) {
    return <p className="text-slate-400 italic p-4 border-t border-slate-100">Không có thay đổi về giá trị dữ liệu</p>;
  }

  return (
    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chi tiết thay đổi các trường dữ liệu</h5>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
            <tr>
              <th className="px-4 py-2 border-r w-1/4">Trường (Field)</th>
              <th className="px-4 py-2 border-r w-3/8">Trước (Before)</th>
              <th className="px-4 py-2 w-3/8">Sau (After)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {changedKeys.map(key => (
              <tr key={key} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-4 py-2 font-bold border-r text-slate-600 bg-slate-50/30">{key}</td>
                <td className="px-4 py-2 border-r text-rose-600 whitespace-pre-wrap italic">
                  {before[key] === null ? 'null' : typeof before[key] === 'object' ? JSON.stringify(before[key], null, 2) : String(before[key])}
                </td>
                <td className="px-4 py-2 text-emerald-600 font-bold whitespace-pre-wrap bg-emerald-50/20">
                  {after[key] === null ? 'null' : typeof after[key] === 'object' ? JSON.stringify(after[key], null, 2) : String(after[key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 italic">Lưu ý: Chỉ hiển thị các trường có sự thay đổi giá trị.</p>
    </div>
  );
};

const columnHelper = createColumnHelper<AuditLogModel>();

export const AuditLogTable = ({ logs, pagination, filters, onFilterChange, loading }: AuditLogTableProps) => {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = [
    columnHelper.accessor('createdAt', {
      header: 'Thời gian',
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{formatDate(info.getValue())}</span>
          <span className="text-[10px] text-slate-400">
            {new Date(info.getValue()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('actorUserName', {
      header: 'Người thực hiện',
      cell: info => <span className="font-medium text-slate-600">{info.getValue() || 'Hệ thống'}</span>,
    }),
    columnHelper.accessor('action', {
      header: 'Hành động',
      cell: info => {
        const action = info.getValue() as AuditAction;
        let variant: any = 'info';
        if (action === AuditAction.CREATE) variant = 'active';
        if (action === AuditAction.DELETE) variant = 'error';
        if (action === AuditAction.UPDATE) variant = 'pending';
        
        return <StatusBadge status={variant} label={action} />;
      },
    }),
    columnHelper.accessor('entityType', {
      header: 'Đối tượng',
      cell: info => <span className="font-bold text-indigo-600 text-[11px] uppercase tracking-wide">{info.getValue()}</span>,
    }),
    columnHelper.accessor('entityId', {
      header: 'ID Bản ghi',
      cell: info => (
        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[100px] block" title={info.getValue() || ''}>
          {info.getValue()?.split('-')[0]}...
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => row.toggleExpanded()}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border",
            row.getIsExpanded() 
              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" 
              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
          )}
        >
          {row.getIsExpanded() ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          Chi tiết
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: logs,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4 items-end">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-slate-700">Hành động</label>
          <Select 
            placeholder="Tất cả hành động"
            options={Object.values(AuditAction).map(a => ({ label: a, value: a }))}
            value={filters.action || ''}
            onChange={(e) => onFilterChange({ ...filters, action: e.target.value })}
          />
        </div>
        <Input 
          label="Loại đối tượng (e.g. STUDENT)"
          placeholder="Tìm theo entity..."
          value={filters.entityType || ''}
          onChange={(e) => onFilterChange({ ...filters, entityType: e.target.value })}
        />
        <Input 
          label="Từ ngày"
          type="date"
          value={filters.fromDate || ''}
          onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })}
        />
        <div className="flex gap-2">
          <Input 
            label="Đến ngày"
            type="date"
            value={filters.toDate || ''}
            onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })}
          />
          <button 
            onClick={() => onFilterChange({})}
            className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition-all shrink-0"
            title="Xoá bộ lọc"
          >
            <FilterX className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <p className="text-sm font-medium text-slate-400 italic">Không có dữ liệu nhật ký nào khớp với bộ lọc</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr className={cn(
                      "group border-b border-slate-50 transition-colors hover:bg-indigo-50/20",
                      row.getIsExpanded() && "bg-indigo-50/50"
                    )}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <DataDiffView 
                            before={row.original.beforeData} 
                            after={row.original.afterData} 
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Trang {pagination.page} / {totalPages} (Tổng {pagination.total})
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Trước
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                disabled={pagination.page >= totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
