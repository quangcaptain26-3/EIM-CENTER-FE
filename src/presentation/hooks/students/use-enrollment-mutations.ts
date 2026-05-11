import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  activateEnrollment,
  createEnrollment,
  dropEnrollment,
  pauseEnrollment,
  resumeEnrollment,
  resetMakeupBlocked,
  startTrialEnrollment,
  transferClass,
} from '@/infrastructure/services/students.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';

function invalidateStudentEnrollments(qc: ReturnType<typeof useQueryClient>, studentId: string) {
  void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.enrollments(studentId) });
  void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.detail(studentId) });
  void qc.invalidateQueries({ queryKey: ['students', 'list'] });
  void qc.invalidateQueries({ queryKey: ['classes'] });
}

export function useCreateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { studentId: string }) => createEnrollment(data),
    onSuccess: (_r, vars) => {
      toast.success('Đã ghi danh');
      invalidateStudentEnrollments(qc, vars.studentId);
    },
    onError: mutationToastApiError,
  });
}

export function useActivateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      studentId: string;
      body?: Record<string, unknown>;
    }) => activateEnrollment(id, body),
    onSuccess: (_r, { studentId }) => {
      toast.success('Đã kích hoạt ghi danh');
      invalidateStudentEnrollments(qc, studentId);
    },
    onError: mutationToastApiError,
  });
}

export function useStartTrialEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; studentId: string }) => startTrialEnrollment(id),
    onSuccess: (_r, { studentId }) => {
      toast.success('Đã bắt đầu học thử');
      invalidateStudentEnrollments(qc, studentId);
    },
    onError: mutationToastApiError,
  });
}

export function useDropEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      studentId: string;
      body: Record<string, unknown>;
    }) => dropEnrollment(id, body),
    onSuccess: (_r, { studentId }) => {
      toast.success('Đã cho nghỉ');
      invalidateStudentEnrollments(qc, studentId);
    },
    onError: mutationToastApiError,
  });
}

export function usePauseEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      studentId: string;
      body: Record<string, unknown>;
    }) => pauseEnrollment(id, body),
    onSuccess: (result, { studentId }) => {
      invalidateStudentEnrollments(qc, studentId);
      void qc.invalidateQueries({ queryKey: ['pause-requests'] });
      if (result.kind === 'needsApproval') {
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.PAUSE_REQUESTS.list({ status: 'pending' }) });
      }
    },
    onError: mutationToastApiError,
  });
}

export function useResumeEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; studentId: string }) => resumeEnrollment(id),
    onSuccess: (_r, { studentId }) => {
      toast.success('Đã tiếp tục học');
      invalidateStudentEnrollments(qc, studentId);
    },
    onError: mutationToastApiError,
  });
}

export function useTransferClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      studentId: string;
      body: Record<string, unknown>;
    }) => transferClass(id, body),
    onSuccess: (_r, { studentId }) => {
      toast.success('Đã chuyển lớp');
      invalidateStudentEnrollments(qc, studentId);
    },
    onError: mutationToastApiError,
  });
}

export function useResetMakeupBlocked() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; studentId: string; reason: string }) =>
      resetMakeupBlocked(id, { reason }),
    onSuccess: (_r, { studentId }) => {
      toast.success('Đã mở khóa học bù');
      invalidateStudentEnrollments(qc, studentId);
    },
    onError: mutationToastApiError,
  });
}
