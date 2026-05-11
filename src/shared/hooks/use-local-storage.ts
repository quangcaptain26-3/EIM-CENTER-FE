import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  }, [key, initial]);

  const [value, setValue] = useState<T>(() => read());
  const [storedKey, setStoredKey] = useState(key);
  if (key !== storedKey) {
    setStoredKey(key);
    setValue(read());
  }

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
          /* ignore */
        }
        return v;
      });
    },
    [key],
  );

  return [value, set] as const;
}
