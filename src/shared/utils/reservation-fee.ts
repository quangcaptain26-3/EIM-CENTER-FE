/** Tỷ lệ phí giữ chỗ — khớp BE system_config.reservation_fee_ratio */
export const RESERVATION_FEE_RATIO = 0.2;

export function computeReservationFee(tuitionFee: number): number {
  return Math.floor(tuitionFee * RESERVATION_FEE_RATIO);
}
