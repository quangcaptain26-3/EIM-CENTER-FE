import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  closeClass,
  createClass,
  generateSessions,
  replaceTeacher,
  updateClass,
} from '@/infrastructure/services/classes.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';
import {
  useAssignCover,
  useCancelCover,
  useRescheduleSession,
} from '@/presentation/hooks/sessions/use-session-mutations';

function useCreateClassMutation() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createClass(data),
  });
}

function useUpdateClassMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateClass(id, data),
    onSuccess: (_r, { id }) => {
      toast.success('Đã cập nhật lớp');
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.detail(id) });
      void qc.invalidateQueries({ queryKey: ['classes', 'list'] });
    },
    onError: mutationToastApiError,
  });
}

function useGenerateSessionsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
      generateSessions(id, body ?? {}),
    onSuccess: (_r, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.sessions(id) });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.detail(id) });
    },
    onError: mutationToastApiError,
  });
}

function useReplaceTeacherMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => replaceTeacher(id, body),
    onSuccess: () => {
      toast.success('Đã thay giáo viên');
    },
    onError: mutationToastApiError,
    onSettled: (_d, _e, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.detail(id) });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.sessions(id) });
    },
  });
}

function useCloseClassMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeClass(id),
    onSuccess: () => {
      toast.success('Đã đóng lớp');
    },
    onError: mutationToastApiError,
    onSettled: (_d, _e, id) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.detail(id) });
      void qc.invalidateQueries({ queryKey: ['classes', 'list'] });
    },
  });
}

/**
 * Gộp mutation lớp + cover / đổi lịch buổi (sessions).
 * assignCover, cancelCover, reschedule cần sessionId + classId tuỳ API.
 */
export function useClassMutations() {
  return {
    createClass: useCreateClassMutation(),
    updateClass: useUpdateClassMutation(),
    generateSessions: useGenerateSessionsMutation(),
    replaceTeacher: useReplaceTeacherMutation(),
    closeClass: useCloseClassMutation(),
    assignCover: useAssignCover(),
    cancelCover: useCancelCover(),
    reschedule: useRescheduleSession(),
  };
}

export const useCreateClass = useCreateClassMutation;
export const useUpdateClass = useUpdateClassMutation;
export const useGenerateSessions = useGenerateSessionsMutation;
export const useReplaceTeacher = useReplaceTeacherMutation;
export const useCloseClass = useCloseClassMutation;
