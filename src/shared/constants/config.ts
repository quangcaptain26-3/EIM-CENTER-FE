export const SHIFTS = {
  1: { label: 'Ca 1', time: '18:00–19:30' },
  2: { label: 'Ca 2', time: '19:30–21:00' },
} as const;

export const WEEKDAY_LABELS: Record<number, string> = {
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7',
};

/** T2–T7 — chọn tối đa 2 ngày, khoảng cách tối thiểu do form + BE validate */
export const WEEKDAY_OPTIONS: { value: number; label: string }[] = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
];

export const CLASS_RULES = {
  MAX_CAPACITY: 12,
  FREE_PERIOD_SESSIONS: 3,
  MAX_TRANSFERS: 1,
  MAX_UNEXCUSED: 3,
  TOTAL_SESSIONS: 24,
};

export const PROGRAM_COLORS = {
  KINDY: 'purple',
  STARTERS: 'blue',
  MOVERS: 'teal',
  FLYERS: 'amber',
} as const;
