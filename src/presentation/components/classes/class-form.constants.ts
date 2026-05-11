import type { ProgramOption } from '@/shared/types/class.type';

/** Khi API /programs trống — 4 CT Cambridge Young Learners + học phí gợi ý */
export const FALLBACK_PROGRAMS: ProgramOption[] = [
  { id: 'prog-kindy', name: 'Kindy', code: 'KINDY', feePerSession: 150_000 },
  { id: 'prog-starters', name: 'Starters', code: 'STARTERS', feePerSession: 160_000 },
  { id: 'prog-movers', name: 'Movers', code: 'MOVERS', feePerSession: 170_000 },
  { id: 'prog-flyers', name: 'Flyers', code: 'FLYERS', feePerSession: 180_000 },
];

export const SHIFT_OPTIONS = [
  { value: 1 as const, label: 'Ca 1 · 18:00 – 19:30' },
  { value: 2 as const, label: 'Ca 2 · 19:30 – 21:00' },
] as const;
