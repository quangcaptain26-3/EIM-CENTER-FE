import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueChartPoint } from '@/shared/types/dashboard-stats.type';
import { useChartColors } from '@/shared/lib/chart-colors';

const moneyFmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function axisMoneyShort(v: number): string {
  if (v >= 1_000_000) return `${v / 1_000_000}M`;
  if (v >= 1000) return `${v / 1000}K`;
  return String(v);
}

export function RevenueChart({ data }: { data: RevenueChartPoint[] }) {
  const c = useChartColors();
  const uid = useId().replace(/:/g, '');

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`brandArea-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={c.brand}
                stopOpacity={c.isDark ? 0.3 : 0.15}
              />
              <stop offset="100%" stopColor={c.brand} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`successArea-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={c.success}
                stopOpacity={c.isDark ? 0.25 : 0.12}
              />
              <stop offset="100%" stopColor={c.success} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: c.axis, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
            axisLine={{ stroke: c.axisLine }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => axisMoneyShort(Number(v))}
            tick={{ fill: c.axis, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  style={{
                    background: c.tooltipBg,
                    border: `1px solid ${c.tooltipBorder}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-lg)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <p
                    style={{
                      color: c.tooltipMuted,
                      fontSize: '11px',
                      marginBottom: '8px',
                    }}
                  >
                    {label != null ? String(label) : ''}
                  </p>
                  {payload.map((p) => (
                    <div
                      key={String(p.dataKey)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '24px',
                        color: c.tooltipText,
                        fontSize: '13px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: p.color,
                          }}
                        />
                        {p.name}
                      </span>
                      <span style={{ fontWeight: 500 }}>
                        {moneyFmt.format(Number(p.value))}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: c.axis }} />
          <Area
            type="monotone"
            dataKey="accrual"
            name="Học phí phát sinh"
            stroke={c.success}
            strokeWidth={2}
            strokeDasharray="6 3"
            fill={`url(#successArea-${uid})`}
            dot={false}
            activeDot={{ r: 5, fill: c.success, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="cash"
            name="Thực thu"
            stroke={c.brand}
            strokeWidth={2.5}
            fill={`url(#brandArea-${uid})`}
            dot={false}
            activeDot={{ r: 5, fill: c.brand, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
