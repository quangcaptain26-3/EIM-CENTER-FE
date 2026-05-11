import { REFUND_REASON_TYPES } from '@/shared/constants/statuses';

/** Các `reason_type` chủ quan khi nghỉ học sau ≥3 buổi */
export const SUBJECTIVE_DROP_REASON_ENTRIES = Object.entries(REFUND_REASON_TYPES).filter(([key]) =>
  key.startsWith('subjective_')
) as [keyof typeof REFUND_REASON_TYPES, string][];

/** Khi &lt; 3 buổi: BE chấp nhận `center_unable_to_open` hoặc subjective_* */
export const EARLY_DROP_REASON_ENTRIES = [
  ['center_unable_to_open', REFUND_REASON_TYPES.center_unable_to_open] as const,
  ...SUBJECTIVE_DROP_REASON_ENTRIES,
];
