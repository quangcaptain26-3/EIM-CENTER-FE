/**
 * Kiểm tra user có ít nhất một permission trong tập granted (hỗ trợ wildcard prefix).
 */
export function hasPermission(
  granted: string[] | null | undefined,
  required: string,
): boolean {
  if (!granted || granted.length === 0) return false;
  if (granted.includes('*')) return true;
  if (granted.includes(required)) return true;
  return granted.some((p) => p.endsWith(':*') && required.startsWith(p.slice(0, -1)));
}
