import { cn } from '@/shared/lib/cn';
import type { ProgramCode } from '@/shared/types/api-contract';
import type { ProgramOption } from '@/shared/types/class.type';

export type ProgramFilterSlug = 'all' | 'kindy' | 'starters' | 'movers' | 'flyers';

/**
 * Pill theo cấp — mỗi cấp một gam tách bạch: tím hồng (Kindy) · xanh dương (Starters) · xanh lá (Movers) · cam (Flyers).
 * Hex cố định để luôn có contrast, không phụ thuộc scale Tailwind.
 */
export const PROGRAM_PILL_CLASS: Record<Exclude<ProgramFilterSlug, 'all'>, string> = {
  kindy:
    'border-[#e879f9] bg-[#fdf4ff] text-[#86198f] dark:border-[#c026d3] dark:bg-[#3b0764]/80 dark:text-[#f5d0fe]',
  starters:
    'border-[#3b82f6] bg-[#eff6ff] text-[#1e40af] dark:border-[#2563eb] dark:bg-[#172554]/85 dark:text-[#93c5fd]',
  movers:
    'border-[#10b981] bg-[#ecfdf5] text-[#065f46] dark:border-[#059669] dark:bg-[#022c22]/85 dark:text-[#6ee7b7]',
  flyers:
    'border-[#f97316] bg-[#fff7ed] text-[#9a3412] dark:border-[#ea580c] dark:bg-[#431407]/85 dark:text-[#fdba74]',
};

const KEYWORDS: Record<Exclude<ProgramFilterSlug, 'all'>, string[]> = {
  kindy: ['kindy', 'kindie', 'kinder'],
  starters: ['starters', 'starter'],
  movers: ['movers', 'mover'],
  flyers: ['flyers', 'flyer'],
};

/** Suy ra slug từ tên chương trình (API) */
export function inferProgramSlug(programName: string | null | undefined): keyof typeof PROGRAM_PILL_CLASS | null {
  if (!programName) return null;
  const n = programName.toLowerCase();
  for (const slug of Object.keys(KEYWORDS) as (keyof typeof KEYWORDS)[]) {
    if (KEYWORDS[slug].some((k) => n.includes(k))) return slug;
  }
  return null;
}

const SLUG_TO_CODE: Record<keyof typeof PROGRAM_PILL_CLASS, ProgramCode> = {
  kindy: 'KINDY',
  starters: 'STARTERS',
  movers: 'MOVERS',
  flyers: 'FLYERS',
};

/** Dùng khi tạo lớp — ưu tiên `program.code` từ API, fallback suy từ tên */
export function resolveProgramCode(program: ProgramOption | undefined): ProgramCode | null {
  if (!program) return null;
  if (program.code) return program.code;
  const slug = inferProgramSlug(program.name);
  return slug ? SLUG_TO_CODE[slug] ?? null : null;
}

export function programPillClass(programName: string | null | undefined): string {
  const slug = inferProgramSlug(programName);
  if (!slug) {
    return 'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)]';
  }
  return cn('border font-semibold', PROGRAM_PILL_CLASS[slug]);
}
