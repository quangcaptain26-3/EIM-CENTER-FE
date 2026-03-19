/**
 * React Query mutation hooks cho các thao tác ghi trên Trial Leads
 * Bao gồm: tạo mới, cập nhật, đặt lịch học thử, và convert sang học viên
 * Mỗi mutation tự động invalidate cache liên quan sau khi thành công
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { trialsApi } from '@/infrastructure/services/trials.api';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';
import type { CreateTrialDto, UpdateTrialDto, ScheduleTrialDto, ConvertTrialDto } from '@/application/trials/dto/trials.dto';

// ===================================================
// TẠO MỚI TRIAL LEAD
// ===================================================

/**
 * Hook tạo mới một Trial Lead
 * Sau khi thành công: invalidate toàn bộ danh sách trials để refresh
 * Chỉ role WRITE_ROLES (ROOT, DIRECTOR, SALES) mới được phép
 *
 * @example
 * const { mutate: createTrial, isPending } = useCreateTrial();
 * createTrial({ fullName: 'Nguyễn Văn A', phone: '0912345678' });
 */
export const useCreateTrial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTrialDto) => trialsApi.createTrial(dto),
    onSuccess: () => {
      // Xóa toàn bộ cache trials để force refetch danh sách
      queryClient.invalidateQueries({ queryKey: queryKeys.trials.all });
      toastAdapter.success('Đã thêm khách hàng học thử thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

// ===================================================
// CẬP NHẬT TRIAL LEAD
// ===================================================

/**
 * Hook cập nhật thông tin và trạng thái một Trial Lead
 * Invalidate cả danh sách lẫn detail của trial sau khi thành công
 * Chỉ role WRITE_ROLES mới được phép
 *
 * @param trialId - ID của trial lead đang được chỉnh sửa
 *
 * @example
 * const { mutate: updateTrial } = useUpdateTrial(id);
 * updateTrial({ status: 'CONTACTED', note: 'Đã gọi điện tư vấn' });
 */
export const useUpdateTrial = (trialId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateTrialDto) => {
      if (!trialId) throw new Error('Thiếu ID trial lead');
      return trialsApi.updateTrial(trialId, dto);
    },
    onSuccess: () => {
      // Invalidate danh sách để cập nhật status/note trong bảng
      queryClient.invalidateQueries({ queryKey: queryKeys.trials.all });
      // Invalidate detail để cập nhật thông tin trong trang chi tiết
      if (trialId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.trials.detail(trialId) });
      }
      toastAdapter.success('Đã cập nhật thông tin học thử thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

// ===================================================
// ĐẶT LỊCH HỌC THỬ
// ===================================================

/**
 * Hook đặt hoặc cập nhật lịch học thử cho một Trial Lead
 * Backend tự động chuyển status sang SCHEDULED sau khi upsert lịch
 * Invalidate detail trial để hiển thị lịch mới ngay
 * Chỉ role PROCESS_ROLES (ROOT, DIRECTOR, ACADEMIC) mới được phép
 *
 * @param trialId - ID của trial lead cần đặt lịch
 *
 * @example
 * const { mutate: scheduleTrial } = useScheduleTrial(id);
 * scheduleTrial({ classId: 'uuid-class', trialDate: '2024-09-02T18:00:00Z' });
 */
export const useScheduleTrial = (trialId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ScheduleTrialDto) => {
      if (!trialId) throw new Error('Thiếu ID trial lead');
      return trialsApi.scheduleTrial(trialId, dto);
    },
    onSuccess: () => {
      // Invalidate toàn bộ cache trials (status đã đổi sang SCHEDULED)
      queryClient.invalidateQueries({ queryKey: queryKeys.trials.all });
      // Cập nhật lại detail để hiển thị thông tin lịch mới
      if (trialId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.trials.detail(trialId) });
      }
      toastAdapter.success('Đã đặt lịch học thử thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

// ===================================================
// CONVERT SANG HỌC VIÊN CHÍNH THỨC
// ===================================================

/**
 * Hook convert một Trial Lead thành học viên chính thức + enrollment
 * Đây là mutation phức tạp nhất — backend thực hiện 3 bước:
 *   1. Tạo Student mới từ thông tin trong dto.student
 *   2. Tạo Enrollment cho student vào class được chọn
 *   3. Lưu TrialConversion và chuyển trial status sang CONVERTED
 *
 * Rule từ ConvertTrialRule (backend): KHÔNG cho convert nếu status là CONVERTED hoặc CLOSED
 * FE nên kiểm tra bằng canConvert() từ trial.rule.ts trước khi gọi hook này
 *
 * Sau khi thành công:
 *   - Invalidate trials.all (để cập nhật status CONVERTED trong danh sách)
 *   - Invalidate trials.detail(id) (để cập nhật trang chi tiết trial)
 *   - Invalidate students.all (học viên mới vừa được tạo)
 *   - Toast thành công kèm tên học viên vừa tạo
 *
 * @param trialId - ID của trial lead cần convert
 * @returns mutation với data chứa { studentId, enrollmentId } để navigate sau
 *
 * @example
 * const { mutate: convertTrial, data } = useConvertTrial(id);
 * convertTrial(dto, {
 *   onSuccess: (result) => navigate(`/students/${result.studentId}`)
 * });
 */
export const useConvertTrial = (trialId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ConvertTrialDto) => {
      if (!trialId) throw new Error('Thiếu ID trial lead');
      return trialsApi.convertTrial(trialId, dto);
    },
    onSuccess: (_result, variables) => {
      // 1. Làm mới danh sách trials (status đã đổi sang CONVERTED)
      queryClient.invalidateQueries({ queryKey: queryKeys.trials.all });

      // 2. Làm mới detail trial này (hiển thị trạng thái CONVERTED)
      if (trialId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.trials.detail(trialId) });
      }

      // 3. Làm mới danh sách học viên vì có học viên mới vừa được tạo
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });

      // 4. Làm mới Roster và Sĩ số lớp học mục tiêu
      if (variables.classId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.roster(variables.classId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.detail(variables.classId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      }

      // 5. Toast thành công kèm tên học viên để xác nhận rõ ràng
      const studentName = variables.student.fullName;
      toastAdapter.success(
        `Đã chuyển đổi thành công — học viên "${studentName}" đã được tạo`
      );
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};
