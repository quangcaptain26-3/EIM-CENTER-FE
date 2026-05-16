import { cn } from '@/shared/lib/cn';
import type { ProgramCode } from '@/shared/types/api-contract';
import type { ProgramOption } from '@/shared/types/class.type';

export type ProgramFilterSlug = 'all' | 'kindy' | 'starters' | 'movers' | 'flyers';

/**
 * Pill theo cấp — mỗi cấp một gam tách bạch: tím hồng (Kindy) · xanh dương (Starters) · xanh lá (Movers) · cam (Flyers).
 * Hex cố định để luôn có contrast, không phụ thuộc scale Tailwind.
 */
/** Pill cấp độ — border + nền + chữ tách bạch cho light/dark (không dùng màu chỉ hợp một mode). */
export const PROGRAM_PILL_CLASS: Record<Exclude<ProgramFilterSlug, 'all'>, string> = {
  kindy:
    'border-[#c026d3] bg-[#fae8ff] text-[#701a75] dark:border-[#e879f9] dark:bg-[#4a044e]/90 dark:text-[#f5d0fe]',
  starters:
    'border-[#2563eb] bg-[#dbeafe] text-[#1e3a8a] dark:border-[#60a5fa] dark:bg-[#1e3a8a]/90 dark:text-[#bfdbfe]',
  movers:
    'border-[#059669] bg-[#d1fae5] text-[#064e3b] dark:border-[#34d399] dark:bg-[#064e3b]/90 dark:text-[#a7f3d0]',
  flyers:
    'border-[#ea580c] bg-[#ffedd5] text-[#7c2d12] dark:border-[#fb923c] dark:bg-[#7c2d12]/90 dark:text-[#fed7aa]',
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
