"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";
import { STATUS_COLORS, STATUS_LABELS, Stats } from "@/lib/types";

export function StatusBreakdownChart({
  data,
}: {
  data: Stats["statusBreakdown"];
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: STATUS_LABELS[d.status as keyof typeof STATUS_LABELS] ?? d.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((d) => (
            <Cell
              key={d.status}
              fill={STATUS_COLORS[d.status as keyof typeof STATUS_COLORS]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VolumeOverTimeChart({ data }: { data: Stats["volume"] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.week.slice(5),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#2e75b6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
