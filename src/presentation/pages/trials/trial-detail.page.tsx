/**
 * Trang chi tiết Trial Lead
 * Hiển thị toàn bộ thông tin, quản lý đặt lịch, cập nhật kết quả và chuyển đổi thành học viên
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  User, 
  Clock, 
  ArrowRight, 
  Edit3,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

import { TrialStatusBadge } from '@/presentation/components/trials/trial-status-badge';
import { ConvertTrialModal } from '@/presentation/components/trials/convert-trial-modal';
import { ScheduleTrialModal } from '@/presentation/components/trials/schedule-trial-modal';
import { Button } from '@/shared/ui/button';
import { Loading } from '@/shared/ui/feedback/loading';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { useTrial } from '@/presentation/hooks/trials/use-trials';
import { useUpdateTrial } from '@/presentation/hooks/trials/use-trial-mutations';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { canEdit, isConverted } from '@/domain/trials/rules/trial.rule';
import { TRIAL_STATUS_LABELS } from '@/domain/trials/models/trial-lead.model';
import { RoutePaths } from '@/app/router/route-paths';

const TrialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  
  // ---- STATE ----
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState('');

  // ---- HOOKS ----
  const { data: trial, isLoading, error } = useTrial(id!);
  const { mutate: updateTrial, isPending: isUpdating } = useUpdateTrial(id!);

  // ---- HANDLERS ----
  const handleUpdateNote = () => {
    updateTrial({ note: noteValue }, {
      onSuccess: () => setIsEditNoteOpen(false)
    });
  };

  const handleConvertSuccess = (studentId: string) => {
    // Điều hướng sang trang chi tiết học viên mới tạo
    navigate(RoutePaths.STUDENT_DETAIL.replace(':id', studentId));
  };

  if (isLoading) return <Loading text="Đang tải thông tin chi tiết..." className="py-20" />;
  if (error || !trial) return <EmptyState title="Không tìm thấy thông tin" description="Dữ liệu lead không tồn tại hoặc đã bị xóa." />;

  /** Kiểm tra quyền thực hiện các hành động nhạy cảm */
  const canConvert = hasAnyRole(['SALES', 'ROOT']) && !isConverted(trial);
  const canWriteLead = hasAnyRole(['SALES', 'ROOT']);
  const canSchedule = hasAnyRole(['SALES', 'ROOT']) && trial.status !== 'CLOSED' && !isConverted(trial);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ---- BACK BUTTON & ACTIONS ---- */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
        </button>
        
        <div className="flex gap-2">
          {isConverted(trial) ? (
            <Link 
              to={RoutePaths.STUDENT_DETAIL.replace(':id', trial.conversion?.studentId as string)} 
              className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Xem hồ sơ học viên
            </Link>
          ) : (
            <>
              {canWriteLead && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(RoutePaths.TRIAL_EDIT.replace(':id', trial.id))}
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa lead
                </Button>
              )}
              {canConvert && (
                <Button variant="primary" size="sm" onClick={() => setIsConvertModalOpen(true)}>
                  Convert sang học viên <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---- HEADER SECTION ---- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex gap-5 items-start">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary shrink-0">
              <User size={32} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{trial.fullName}</h1>
                <TrialStatusBadge status={trial.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Phone size={14} /> {trial.phone}</span>
                {trial.email && <span className="flex items-center gap-1.5"><Mail size={14} /> {trial.email}</span>}
                <span className="flex items-center gap-1.5"><Clock size={14} /> Ngày tạo: {new Date(trial.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden gap-8 px-6 border-l border-gray-100 md:grid md:grid-cols-2">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Nguồn</div>
              <div className="font-medium text-gray-700">{trial.source || 'Chưa rõ'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Ghi chú</div>
              <div className="font-medium text-gray-700 truncate max-w-[150px]">{trial.note || '---'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- LEFT COLUMN: THÔNG TIN CHI TIẾT ---- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lịch học thử */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-amber-500" /> Lịch học thử
              </h3>
              {canSchedule && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-600 hover:text-amber-700"
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  {trial.schedule ? 'Cập nhật lịch' : 'Đặt lịch ngay'}
                </Button>
              )}
            </div>
            <div className="p-6">
              {trial.schedule ? (
                <div className="flex items-center gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {new Date(trial.schedule.trialDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      Giờ học: {new Date(trial.schedule.trialDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 italic">Khách hàng chưa được đặt lịch học thử.</p>
                </div>
              )}
            </div>
          </div>

          {/* Ghi chú & Đánh giá */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> Nhật ký & Ghi chú
              </h3>
              {!isEditNoteOpen && canWriteLead && canEdit(trial.status) && (
                <button 
                  onClick={() => { setNoteValue(trial.note || ''); setIsEditNoteOpen(true); }}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Cập nhật
                </button>
              )}
            </div>
            {isEditNoteOpen ? (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <textarea 
                  className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Nhập ghi chú hoặc kết quả buổi học thử..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditNoteOpen(false)}>Hủy</Button>
                  <Button size="sm" onClick={handleUpdateNote} loading={isUpdating}>Lưu ghi chú</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl whitespace-pre-wrap min-h-[100px]">
                {trial.note || 'Chưa có ghi chú nào được lưu lại.'}
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT COLUMN: SIDEBAR ---- */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
            {/* Decorative background circle */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-wider mb-4">Thông tin bổ sung</h4>
            <div className="space-y-4">
              <div>
                <div className="text-white/60 text-[10px] mb-0.5">NGUỒN TIẾP CẬN</div>
                <div className="text-sm font-semibold">{trial.source || 'N/A'}</div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="text-white/60 text-[10px] mb-0.5">TRẠNG THÁI HIỆN TẠI</div>
                <div className="text-sm font-semibold">{TRIAL_STATUS_LABELS[trial.status]}</div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-white/60 text-xs italic mb-4">
                "Việc chuyển đổi học viên sẽ tự động tạo hồ sơ và ghi danh vào lớp học tương ứng."
              </div>
              {canConvert && (
                <button 
                  onClick={() => setIsConvertModalOpen(true)}
                  className="w-full py-3 bg-white text-blue-600 rounded-xl text-sm font-bold shadow-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  Chuyển đổi ngay <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- MODAL CHUYỂN ĐỔI ---- */}
      <ConvertTrialModal 
        open={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        trial={trial}
        onSuccess={handleConvertSuccess}
      />

      <ScheduleTrialModal
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        trial={trial}
      />
    </div>
  );
};

export default TrialDetailPage;
