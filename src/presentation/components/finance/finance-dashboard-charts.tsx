import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { currencyShort } from '@/shared/utils/format-vnd';
import type { FinanceDashboardData } from '@/shared/types/finance.type';
import { useChartColors } from '@/shared/lib/chart-colors';

export interface TrendPoint {
  label: string;
  cashBasis: number;
  accrualBasis: number;
}

export function FinanceTrendAreaChart({ data }: { data: TrendPoint[] }) {
  const c = useChartColors();
  const uid = useId().replace(/:/g, '');

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`finBrand-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.brand} stopOpacity={c.isDark ? 0.35 : 0.2} />
              <stop offset="100%" stopColor={c.brand} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`finSucc-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.success} stopOpacity={c.isDark ? 0.3 : 0.18} />
              <stop offset="100%" stopColor={c.success} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: c.axis, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
            axisLine={{ stroke: c.axisLine }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: c.axis, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
            tickFormatter={(v) => currencyShort(Number(v))}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  className="rounded-xl px-3 py-2 text-xs shadow-lg"
                  style={{
                    background: c.tooltipBg,
                    border: `1px solid ${c.tooltipBorder}`,
                    color: c.tooltipText,
                  }}
                >
                  <p className="mb-1 font-medium" style={{ color: c.tooltipText }}>
                    {label != null ? String(label) : ''}
                  </p>
                  {payload.map((item, i) => (
                    <p
                      key={`${String(item.name)}-${i}`}
                      className="tabular-nums"
                      style={{ color: c.tooltipMuted }}
                    >
                      <span style={{ color: item.color }}>{String(item.name)}:</span>{' '}
                      {currencyShort(Number(item.value))}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="cashBasis"
            name="Thực thu"
            stroke={c.brand}
            fill={`url(#finBrand-${uid})`}
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="accrualBasis"
            name="Phát sinh"
            stroke={c.success}
            fill={`url(#finSucc-${uid})`}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function programColor(code: string, palette: readonly string[]): string {
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = (h + code.charCodeAt(i) * (i + 3)) % palette.length;
  }
  return palette[h] ?? palette[0];
}

export function FinanceProgramBarChart({
  byProgram,
}: {
  byProgram: FinanceDashboardData['byProgram'];
}) {
  const c = useChartColors();

  const data = (byProgram ?? []).map((row) => ({
    name: row.programName ?? row.programCode,
    code: row.programCode,
    cash: row.cashBasis,
    fill: programColor(row.programCode || row.programName || '', c.barColors),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={c.grid} vertical={false} horizontal />
          <XAxis
            type="number"
            tick={{ fill: c.axis, fontSize: 11 }}
            tickFormatter={(v) => currencyShort(Number(v))}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fill: c.axis, fontSize: 10 }}
            tickFormatter={(v) => (String(v).length > 14 ? `${String(v).slice(0, 14)}…` : String(v))}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as { name: string; cash: number };
              return (
                <div
                  className="rounded-xl px-3 py-2 text-xs shadow-lg"
                  style={{
                    background: c.tooltipBg,
                    border: `1px solid ${c.tooltipBorder}`,
                    color: c.tooltipText,
                  }}
                >
                  <p className="font-medium">{row.name}</p>
                  <p className="tabular-nums" style={{ color: c.tooltipMuted }}>
                    {currencyShort(row.cash)}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="cash" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={`${d.code}-${i}`} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
