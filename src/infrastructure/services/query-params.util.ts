/** Bỏ undefined để axios không gửi key rỗng */
export function compactParams<T extends Record<string, unknown>>(input: T): Record<string, string | number | boolean> {
  const o: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (typeof v === 'number' || typeof v === 'boolean') o[k] = v;
    else o[k] = String(v);
  }
  return o;
}
