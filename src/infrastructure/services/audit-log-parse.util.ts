import type { AuditLogRow } from '@/shared/types/audit-log.type';
import type { ApiResponse } from '@/shared/types/api.type';

function unwrap(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  // GET /audit-logs: { data: AuditLog[], total, page, limit, totalPages } — không bóc `data` thành payload gốc
  if (
    Array.isArray(r.data) &&
    ('total' in r || 'totalPages' in r || 'page' in r || 'limit' in r)
  ) {
    return r;
  }

  const ar = raw as ApiResponse<unknown>;
  const d = ar.data !== undefined ? ar.data : raw;
  if (d && typeof d === 'object' && !Array.isArray(d)) return d as Record<string, unknown>;
  return null;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function obj(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

export function parseAuditLogRow(raw: Record<string, unknown>): AuditLogRow | null {
  const id = str(raw.id ?? raw._id);
  if (!id) return null;
  const actor = obj(raw.actor) ?? obj(raw.actorUser);
  const eventTime = raw.eventTime ?? raw.event_time;
  const createdAtIso =
    eventTime instanceof Date
      ? eventTime.toISOString()
      : str(eventTime ?? raw.createdAt ?? raw.created_at ?? raw.timestamp);

  return {
    id,
    createdAt: createdAtIso,
    actorId: str(raw.actorId ?? raw.actor_id ?? actor?.id ?? ''),
    actorName: str(raw.actorName ?? raw.actor_name ?? actor?.fullName ?? actor?.name) || undefined,
    actorCode: str(raw.actorCode ?? raw.actor_code ?? actor?.userCode) || undefined,
    action: str(raw.action ?? raw.actionType ?? raw.type),
    entityType: str(raw.entityType ?? raw.entity_type ?? raw.resource) || undefined,
    entityId: str(raw.entityId ?? raw.entity_id) || undefined,
    entityCode: str(raw.entityCode ?? raw.entity_code) || undefined,
    description: str(raw.description ?? raw.message ?? raw.summary) || undefined,
    oldValues: obj(raw.oldValues ?? raw.old_values ?? raw.before),
    newValues: obj(raw.newValues ?? raw.new_values ?? raw.after),
    metadata: obj(raw.metadata),
    diff: obj(raw.diff),
  };
}

export function parseAuditLogListResponse(raw: unknown): {
  items: AuditLogRow[];
  total: number;
  page: number;
  limit: number;
} {
  const o = unwrap(raw);
  if (!o) return { items: [], total: 0, page: 1, limit: 20 };
  const data = o.data ?? o.items ?? o.logs;
  const arr = Array.isArray(data) ? data : [];
  const items = arr
    .map((row) => parseAuditLogRow(row as Record<string, unknown>))
    .filter(Boolean) as AuditLogRow[];
  const total = Number(o.total ?? items.length) || items.length;
  const page = Number(o.page ?? 1) || 1;
  const limit = Number(o.limit ?? o.perPage ?? 20) || 20;
  return { items, total, page, limit };
}
