import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createStudent, updateStudent } from '@/infrastructure/services/students.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import {
  useActivateEnrollment,
  useCreateEnrollment,
  useDropEnrollment,
  usePauseEnrollment,
  useResumeEnrollment,
  useTransferClass,
} from '@/presentation/hooks/students/use-enrollment-mutations';
import {
  useApprovePauseRequest,
  useRejectPauseRequest,
} from '@/presentation/hooks/students/use-pause-requests';
import {
  useCompleteMakeupSession,
  useCreateMakeupSession,
} from '@/presentation/hooks/students/use-makeup-sessions';

function useCreateStudentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createStudent(data),
    onSuccess: () => {
      toast.success('Đã tạo học viên');
      void qc.invalidateQueries({ queryKey: ['students', 'list'] });
    },
  });
}

function useUpdateStudentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateStudent(id, data),
    onSuccess: (_r, { id }) => {
      toast.success('Đã cập nhật học viên');
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.detail(id) });
      void qc.invalidateQueries({ queryKey: ['students', 'list'] });
    },
  });
}

/** Gộp mutation ghi danh / bảo lưu / makeup */
export function useStudentMutations() {
  return {
    createEnrollment: useCreateEnrollment(),
    activateEnrollment: useActivateEnrollment(),
    dropEnrollment: useDropEnrollment(),
    pauseEnrollment: usePauseEnrollment(),
    resumeEnrollment: useResumeEnrollment(),
    transferClass: useTransferClass(),
    approvePauseRequest: useApprovePauseRequest(),
    rejectPauseRequest: useRejectPauseRequest(),
    createMakeupSession: useCreateMakeupSession(),
    completeMakeup: useCompleteMakeupSession(),
  };
}

export const useCreateStudent = useCreateStudentMutation;
export const useUpdateStudent = useUpdateStudentMutation;
