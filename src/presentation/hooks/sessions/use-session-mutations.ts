import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  assignCover,
  cancelCover,
  recordAttendance,
  reschedule,
} from '@/infrastructure/services/sessions.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { mutationToastApiError, toastApiError } from '@/presentation/hooks/toast-api-error';
import type { SessionDetailPayload } from '@/shared/types/session.type';
import type { ApiError } from '@/shared/types/api.type';

export function useRescheduleSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
      classId?: string;
    }) => reschedule(id, body),
    onSuccess: () => {
      toast.success('Đã đổi lịch buổi học');
    },
    onError: mutationToastApiError,
    onSettled: (_d, _e, { id, classId }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.SESSIONS.detail(id) });
      if (classId) void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.sessions(classId) });
      void qc.invalidateQueries({ queryKey: ['classes', 'list'] });
    },
  });
}

export function useAssignCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
      classId?: string;
      coverTeacherName?: string;
    }) => assignCover(id, body),
    onSuccess: (_data, variables) => {
      const name = variables.coverTeacherName?.trim();
      toast.success(name ? `Đã gán cover: ${name}` : 'Đã gán cover');
    },
    onError: (err, variables) => {
      const e = err as Partial<ApiError>;
      if (e.code === 'CLASS_TEACHER_CONFLICT') {
        toast.error('GV này vừa có lịch trùng, vui lòng chọn lại');
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.SESSIONS.availableCovers(variables.id) });
        return;
      }
      toastApiError(err);
    },
    onSettled: (_d, e, { id, classId }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.SESSIONS.detail(id) });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.SESSIONS.availableCovers(id) });
      if (classId) void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.sessions(classId) });
      if (!e) {
        void qc.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'sessions' && q.queryKey[1] === 'my',
        });
      }
    },
  });
}

export function useCancelCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; classId?: string; coverTeacherName?: string }) => cancelCover(id),
    onSuccess: (_d, variables) => {
      const name = variables.coverTeacherName?.trim();
      toast.success(name ? `Đã hủy cover của ${name}` : 'Đã hủy cover');
    },
    onError: mutationToastApiError,
    onSettled: (_d, _e, { id, classId }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.SESSIONS.detail(id) });
      if (classId) void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.sessions(classId) });
      void qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'sessions' && q.queryKey[1] === 'my',
      });
    },
  });
}

export function useRecordSessionAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
      classId?: string;
    }) => recordAttendance(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.SESSIONS.detail(id) });
      const previous = qc.getQueryData<SessionDetailPayload | null>(QUERY_KEYS.SESSIONS.detail(id));
      const records = body.records as Array<{ enrollmentId: string; status: string; note?: string }> | undefined;
      if (previous && Array.isArray(records)) {
        const map = new Map(records.map((r) => [r.enrollmentId, r]));
        qc.setQueryData<SessionDetailPayload | null>(QUERY_KEYS.SESSIONS.detail(id), {
          ...previous,
          // Teacher must be locked right after first submit; backend sets completed anyway.
          // Academic can still edit completed; admin will be blocked by rule.
          status: 'completed',
          attendanceRows: previous.attendanceRows.map((row) => {
            const u = map.get(row.enrollmentId);
            return u ? { ...row, status: u.status, note: u.note ?? row.note } : row;
          }),
        });
      }
      return { previous, id };
    },
    onError: (err, { id }, ctx) => {
      toastApiError(err);
      if (ctx && 'previous' in ctx && ctx.previous !== undefined) {
        qc.setQueryData(QUERY_KEYS.SESSIONS.detail(id), ctx.previous);
      }
    },
    onSuccess: () => {
      toast.success('Đã lưu điểm danh');
    },
    onSettled: (_d, _e, { id, classId }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.SESSIONS.detail(id) });
      if (classId) {
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.sessions(classId) });
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.roster(classId) });
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.detail(classId) });
      }
      void qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'students' &&
          (q.queryKey[1] === 'list' || q.queryKey[2] === 'enrollments'),
      });
    },
  });
}
