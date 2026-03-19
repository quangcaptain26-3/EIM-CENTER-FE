/**
 * Barrel export cho tất cả hooks của module Trials
 * Import từ '@/presentation/hooks/trials' thay vì đường dẫn cụ thể
 */

// Query hooks — đọc dữ liệu
export { useTrials, useTrial } from './use-trials';

// Mutation hooks — ghi dữ liệu
export {
  useCreateTrial,
  useUpdateTrial,
  useScheduleTrial,
  useConvertTrial,
} from './use-trial-mutations';
