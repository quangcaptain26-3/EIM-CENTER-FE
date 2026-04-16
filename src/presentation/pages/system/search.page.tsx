import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchBox } from '@/shared/ui/search-box';
import { globalSearch } from '@/infrastructure/services/system.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';

function unwrap(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const r = raw as { data?: unknown };
  return r.data !== undefined ? r.data : raw;
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const qParam = params.get('q') ?? '';
  const [localQ, setLocalQ] = useState(qParam);

  useEffect(() => {
    setLocalQ(qParam);
  }, [qParam]);

  const q = useQuery({
    queryKey: QUERY_KEYS.SEARCH.global(localQ.trim()),
    queryFn: () => globalSearch(localQ.trim()),
    enabled: localQ.trim().length > 0,
  });

  const body = q.data ? unwrap(q.data) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">Tìm kiếm</h1>
      <SearchBox
        value={localQ}
        onValueChange={(v) => {
          setLocalQ(v);
          setParams(v.trim() ? { q: v.trim() } : {});
        }}
        onSearch={(debounced) => {
          setParams(debounced.trim() ? { q: debounced.trim() } : {});
        }}
        placeholder="Nhập từ khóa…"
      />
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
        {localQ.trim().length === 0 ? (
          <p>Nhập từ khóa để tìm (hoặc dùng ⌘K).</p>
        ) : q.isLoading ? (
          <div className="space-y-2">
            <div className="animate-shimmer h-4 w-full rounded" />
            <div className="animate-shimmer h-4 w-3/4 rounded" />
          </div>
        ) : q.isError ? (
          <p className="text-red-400">Không tải được kết quả.</p>
        ) : (
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap wrap-break-word text-xs text-[var(--text-secondary)]">
            {body != null ? JSON.stringify(body, null, 2) : 'Không có dữ liệu.'}
          </pre>
        )}
      </div>
    </div>
  );
}
