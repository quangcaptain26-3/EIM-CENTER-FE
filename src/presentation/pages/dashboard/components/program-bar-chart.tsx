import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EnrollmentProgramSlice } from '@/shared/types/dashboard-stats.type';
import { useChartColors } from '@/shared/lib/chart-colors';

export function ProgramBarChart({ data }: { data: EnrollmentProgramSlice[] }) {
  const c = useChartColors();

  const total = data.reduce((s, x) => s + x.count, 0) || 1;
  const chartData = data.map((d) => ({
    ...d,
    pct: Math.round((d.count / total) * 1000) / 10,
  }));

  return (
    <div className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="program"
            width={72}
            tick={{ fontSize: 11, fill: c.axis }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, _name, item) => {
              const n = Number(value ?? 0);
              const pct = (item?.payload as { pct?: number })?.pct;
              return [`${n} học viên (${pct ?? 0}% tổng)`, 'Số lượng'];
            }}
            labelFormatter={(l) => String(l)}
            contentStyle={{
              background: c.tooltipBg,
              border: `1px solid ${c.tooltipBorder}`,
              borderRadius: '0.5rem',
              color: c.tooltipText,
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.program} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
