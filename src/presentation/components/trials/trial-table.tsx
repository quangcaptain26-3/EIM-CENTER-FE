/**
 * Bảng danh sách Trial Leads với filter theo trạng thái và tìm kiếm
 * Hiển thị thông tin liên hệ, trạng thái badge, lịch học thử, và row actions
 * Filter state được quản lý tại component này (controlled)
 */

import { useState } from 'react';
import { Plus, Eye, Pencil, CalendarClock } from 'lucide-react';
import { SearchBox } from '@/presentation/components/common/search-box';
import { TrialStatusBadge } from './trial-status-badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { Loading } from '@/shared/ui/feedback/loading';
import type { TrialLeadModel, TrialStatus } from '@/domain/trials/models/trial-lead.model';
import { TRIAL_STATUS_VALUES, TRIAL_STATUS_LABELS } from '@/domain/trials/models/trial-lead.model';
import { canEdit } from '@/domain/trials/rules/trial.rule';

// ===================================================
// PROPS
// ===================================================

export interface TrialTableProps {
  /** Danh sách trial leads từ API */
  items: TrialLeadModel[];
  /** Đang load dữ liệu */
  loading?: boolean;
  /** Callback khi bấm nút xem chi tiết */
  onView?: (id: string) => void;
  /** Callback khi bấm nút chỉnh sửa */
  onEdit?: (id: string) => void;
  /** Callback khi bấm nút đặt lịch */
  onSchedule?: (id: string) => void;
  /** Callback khi bấm nút thêm lead mới */
  onAdd?: () => void;
  /** Hiển thị nút "Thêm lead" (chỉ role SALES / ACADEMIC / ROOT) */
  canAdd?: boolean;
  /** Quyền thực hiện action ghi (schedule/edit) trên từng dòng */
  canWriteActions?: boolean;
  /** Callback khi filter thay đổi — để page truyền lên query hook */
  onFilterChange?: (params: { search?: string; status?: TrialStatus }) => void;
}

// ===================================================
// COMPONENT CHÍNH
// ===================================================

/**
 * Bảng danh sách Trial Leads với toolbar filter tích hợp
 *
 * @example
 * <TrialTable
 *   items={data?.items ?? []}
 *   loading={isLoading}
 *   canAdd={hasRole(['SALES', 'ROOT'])}
 *   onView={(id) => navigate(RoutePaths.TRIAL_DETAIL.replace(':id', id))}
 *   onAdd={() => setShowCreateModal(true)}
 *   onFilterChange={setParams}
 * />
 */
export const TrialTable = ({
  items,
  loading,
  onView,
  onEdit,
  onSchedule,
  onAdd,
  canAdd = false,
  canWriteActions = false,
  onFilterChange,
}: TrialTableProps) => {
  // State filter nội bộ — đồng bộ lên parent qua onFilterChange
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrialStatus | ''>('');

  /** Xử lý thay đổi ô tìm kiếm */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange?.({ search: value || undefined, status: statusFilter || undefined });
  };

  /** Xử lý thay đổi dropdown filter trạng thái */
  const handleStatusChange = (value: string) => {
    const status = value as TrialStatus | '';
    setStatusFilter(status);
    onFilterChange?.({ search: search || undefined, status: status || undefined });
  };

  // ===================================================
  // RENDER LOADING
  // ===================================================
  if (loading) {
    return <Loading text="Đang tải danh sách học thử..." className="py-20" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ---- TOOLBAR: Tìm kiếm + Filter + Nút thêm ---- */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:max-w-xl">
          {/* Ô tìm kiếm theo tên hoặc SĐT */}
          <SearchBox
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm tên, số điện thoại..."
            className="flex-1"
          />

          {/* Dropdown filter theo trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            {TRIAL_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {TRIAL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Nút thêm lead mới — chỉ hiển thị nếu có quyền */}
        {canAdd && (
          <Button
            size="sm"
            onClick={onAdd}
            className="whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm lead
          </Button>
        )}
      </div>

      {/* ---- BẢNG DỮ LIỆU ---- */}
      {!items || items.length === 0 ? (
        <EmptyState
          title="Chưa có khách hàng học thử nào"
          description="Bạn có thể thêm lead mới để bắt đầu theo dõi."
          className="bg-white rounded-lg shadow-sm border border-gray-100"
        />
      ) : (
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                {/* Cột thông tin liên hệ */}
                <th className="px-5 py-3">Họ tên / SĐT</th>
                {/* Cột nguồn tiếp cận */}
                <th className="px-5 py-3">Nguồn</th>
                {/* Cột lịch học thử */}
                <th className="px-5 py-3">Lịch học thử</th>
                {/* Cột trạng thái */}
                <th className="px-5 py-3">Trạng thái</th>
                {/* Cột ngày tạo */}
                <th className="px-5 py-3">Ngày tạo</th>
                {/* Cột hành động */}
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {items.map((trial) => (
                <tr
                  key={trial.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* ---- Họ tên + SĐT ---- */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{trial.fullName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{trial.phone}</div>
                    {trial.email && (
                      <div className="text-xs text-gray-400 mt-0.5">{trial.email}</div>
                    )}
                  </td>

                  {/* ---- Nguồn tiếp cận ---- */}
                  <td className="px-5 py-4">
                    {trial.source ? (
                      <span className="text-gray-700">{trial.source}</span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Chưa rõ</span>
                    )}
                  </td>

                  {/* ---- Lịch học thử ---- */}
                  <td className="px-5 py-4">
                    {trial.schedule ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <CalendarClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                          {new Date(trial.schedule.trialDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Chưa đặt lịch</span>
                    )}
                  </td>

                  {/* ---- Trạng thái badge ---- */}
                  <td className="px-5 py-4">
                    <TrialStatusBadge status={trial.status} size="sm" />
                  </td>

                  {/* ---- Ngày tạo ---- */}
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {new Date(trial.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* ---- Row actions ---- */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Nút xem chi tiết — luôn hiển thị */}
                      <button
                        type="button"
                        onClick={() => onView?.(trial.id)}
                        title="Xem chi tiết"
                        className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Nút đặt lịch — ẩn nếu đã CONVERTED hoặc CLOSED */}
                      {canWriteActions && canEdit(trial.status) && (
                        <button
                          type="button"
                          onClick={() => onSchedule?.(trial.id)}
                          title="Đặt lịch học thử"
                          className="p-1.5 rounded-md text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </button>
                      )}

                      {/* Nút chỉnh sửa — ẩn nếu đã CONVERTED hoặc CLOSED */}
                      {canWriteActions && canEdit(trial.status) && (
                        <button
                          type="button"
                          onClick={() => onEdit?.(trial.id)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
