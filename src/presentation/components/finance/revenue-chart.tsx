import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatVnd } from '@/shared/utils/format-vnd';
import { useChartColors } from '@/shared/lib/chart-colors';

export interface RevenueChartPoint {
  label: string;
  cashBasis: number;
  accrualBasis: number;
}

interface RevenueChartProps {
  data: RevenueChartPoint[];
  className?: string;
}

export function RevenueChart({ data, className = '' }: RevenueChartProps) {
  const c = useChartColors();

  return (
    <div className={`h-80 w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: c.axis }}
            axisLine={{ stroke: c.axisLine }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: c.axis }}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  className="rounded-md px-3 py-2 text-xs shadow-md"
                  style={{
                    background: c.tooltipBg,
                    border: `1px solid ${c.tooltipBorder}`,
                    color: c.tooltipText,
                  }}
                >
                  {payload.map((item) => (
                    <p key={item.name} style={{ color: item.color }} className="font-medium">
                      {item.name}: {formatVnd(item.value as number)}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ color: c.axis, fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="cashBasis"
            name="Cash-basis"
            stroke={c.brand}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="accrualBasis"
            name="Accrual-basis"
            stroke={c.success}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
