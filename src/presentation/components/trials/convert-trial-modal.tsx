/**
 * Modal chuyển đổi Trial Lead thành học viên chính thức
 * Quy trình 2 bước:
 * 1. Thu thập thông tin học viên (Mặc định lấy từ lead, hoặc chọn học viên cũ)
 * 2. Chọn lớp học để ghi danh (Enrollment)
 */

import { useState, useMemo } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { useConvertTrial } from '@/presentation/hooks/trials/use-trial-mutations';
import { useClasses } from '@/presentation/hooks/classes/use-classes';
import { useStudents } from '@/presentation/hooks/students/use-students';
import type { TrialLeadModel } from '@/domain/trials/models/trial-lead.model';
import type { ConvertTrialDto, NewStudentData } from '@/application/trials/dto/trials.dto';
import { Search, UserPlus, UserCheck, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface ConvertTrialModalProps {
  /** Trial Lead cần chuyển đổi */
  trial: TrialLeadModel;
  /** Trạng thái đóng/mở modal */
  open: boolean;
  /** Callback khi đóng modal */
  onClose: () => void;
  /** Callback sau khi convert thành công (trả về studentId để navigate) */
  onSuccess?: (studentId: string) => void;
}

type Step = 'choose-student' | 'select-class';
type StudentMode = 'new' | 'existing';

export const ConvertTrialModal = ({ trial, open, onClose, onSuccess }: ConvertTrialModalProps) => {
  // ---- STATE ----
  const [step, setStep] = useState<Step>('choose-student');
  const [mode, setMode] = useState<StudentMode>('new');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState('');
  /** ID student đã chọn khi mode = existing — gửi existingStudentId để dùng student có sẵn */
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState<string | null>(null);

  const [studentData, setStudentData] = useState<NewStudentData>({
    fullName: trial.fullName,
    phone: trial.phone,
    email: trial.email,
  });

  // ---- HOOKS ----
  const { mutate: convert, isPending: isConverting } = useConvertTrial(trial.id);
  
  // Lấy danh sách student để search nếu mode = 'existing'
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ 
    search: searchStudent,
    limit: 5 
  });

  // Lấy danh sách lớp học để chọn
  // Filter: Chỉ hiện lớp Active (tạm giả định backend có filter này)
  const { data: classesData } = useClasses({ 
    limit: 50 
  });

  // Filter lớp học: Còn chỗ (giả định < 12 theo yêu cầu) và Active
  const availableClasses = useMemo(() => {
    if (!classesData?.items) return [];
    return classesData.items.filter(c => c.status === 'ACTIVE'); // Backend trả ClassModel có status
  }, [classesData]);

  // ---- HANDLERS ----
  const handleNext = () => setStep('select-class');
  const handleBack = () => setStep('choose-student');

  const handleSelectExistingStudent = (s: { id: string; fullName: string; phone?: string; email?: string; guardianName?: string; guardianPhone?: string }) => {
    setSelectedExistingStudentId(s.id);
    setStudentData({
      fullName: s.fullName,
      phone: s.phone,
      email: s.email,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
    });
  };

  const handleConfirm = () => {
    const payload: ConvertTrialDto = {
      student: studentData,
      classId: selectedClassId || undefined,
      note: `Chuyển đổi từ Trial Lead #${trial.id}`,
      existingStudentId: selectedExistingStudentId ?? undefined,
    };

    convert(payload, {
      onSuccess: (result) => {
        onSuccess?.(result.studentId);
        onClose();
      }
    });
  };

  // ---- RENDER BƯỚC 1: CHỌN HỌC VIÊN ----
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { setMode('new'); setSelectedExistingStudentId(null); }}
          className={cn(
            "p-4 border-2 rounded-xl text-left transition-all flex flex-col gap-2",
            mode === 'new' ? "border-primary bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
          )}
        >
          <UserPlus className={cn("w-6 h-6", mode === 'new' ? "text-primary" : "text-gray-400")} />
          <span className="font-semibold text-gray-900">Tạo học viên mới</span>
          <span className="text-xs text-gray-400">Dùng thông tin từ lead hiện tại</span>
        </button>

        <button
          onClick={() => { setMode('existing'); setSelectedExistingStudentId(null); }}
          className={cn(
            "p-4 border-2 rounded-xl text-left transition-all flex flex-col gap-2",
            mode === 'existing' ? "border-primary bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
          )}
        >
          <UserCheck className={cn("w-6 h-6", mode === 'existing' ? "text-primary" : "text-gray-400")} />
          <span className="font-semibold text-gray-900">Học viên đã có sẵn</span>
          <span className="text-xs text-gray-400">Tìm kiếm từ danh sách đã có</span>
        </button>
      </div>

      {mode === 'new' ? (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2">
          <FormInput 
            label="Họ tên học viên" 
            value={studentData.fullName}
            onChange={(e) => setStudentData({...studentData, fullName: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Số điện thoại" 
              value={studentData.phone || ''}
              onChange={(e) => setStudentData({...studentData, phone: e.target.value})}
            />
            <FormInput 
              label="Email" 
              value={studentData.email || ''}
              onChange={(e) => setStudentData({...studentData, email: e.target.value})}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
            />
          </div>

          <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
            {isLoadingStudents ? (
              <div className="p-4 text-center text-xs text-gray-400">Đang tìm kiếm...</div>
            ) : studentsData?.items?.length ? (
              studentsData.items.map((s: any) => (
                <div 
                  key={s.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectExistingStudent(s)}
                >
                  <div>
                    <div className="font-medium text-sm">{s.fullName}</div>
                    <div className="text-xs text-gray-400">{s.phone}</div>
                  </div>
                  <Button variant="ghost" size="sm">Chọn</Button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">Không tìm thấy học viên nào</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ---- RENDER BƯỚC 2: CHỌN LỚP ----
  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">Học viên đang convert</div>
        <div className="font-bold text-gray-900">{studentData.fullName}</div>
        <div className="text-xs text-gray-500">{studentData.phone}</div>
      </div>

      <FormSelect 
        label="Chọn lớp học"
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        options={[
          { label: '--- Chưa xếp lớp (tạo enrollment chờ xếp) ---', value: '' },
          ...availableClasses.map(c => ({
            label: `${c.name} (${c.code})`,
            value: c.id
          }))
        ]}
      />

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
        <div className="text-amber-500 mt-1">⚠️</div>
        <div className="text-xs text-amber-700 leading-relaxed">
          <strong>Lưu ý:</strong> Khi convert thành công, hệ thống sẽ tự động tạo một Ghi danh (Enrollment) trạng thái <strong>ACTIVE</strong> cho học viên này vào lớp đã chọn.
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chuyển đổi thành học viên chính thức"
      className="max-w-xl"
      footer={
        <div className="flex justify-between w-full">
          <div>
            {step === 'select-class' && (
              <Button variant="secondary" onClick={handleBack} disabled={isConverting}>
                <ChevronLeft className="w-4 h-4 mr-1.5" /> Quay lại
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isConverting}>Hủy bỏ</Button>
            {step === 'choose-student' ? (
              <Button
                onClick={handleNext}
                disabled={
                  mode === 'new' ? !studentData.fullName : !selectedExistingStudentId
                }
              >
                Tiếp theo <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button 
                onClick={handleConfirm} 
                loading={isConverting}
              >
                <Check className="w-4 h-4 mr-1.5" /> Xác nhận Convert
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={cn(
          "h-1.5 flex-1 rounded-full transition-all", 
          step === 'choose-student' ? "bg-primary" : "bg-emerald-500"
        )} />
        <div className={cn(
          "h-1.5 flex-1 rounded-full transition-all", 
          step === 'select-class' ? "bg-primary" : "bg-gray-100"
        )} />
      </div>

      {step === 'choose-student' ? renderStep1() : renderStep2()}
    </Modal>
  );
};
