"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from "recharts";
import { STATUS_BADGE_COLORS, STATUS_LABELS, Stats } from "@/lib/types";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #e5e9f0",
  boxShadow: "0 8px 24px rgba(13,27,51,0.10)",
  fontSize: 12,
  fontWeight: 600,
  color: "#16294a",
};

const AXIS_TICK = { fontSize: 11, fill: "#8a97ab" };

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
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={chartData} barSize={44}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(31,56,100,0.04)" }} />
        <Bar dataKey="count" radius={[8, 8, 2, 2]}>
          {chartData.map((d) => (
            <Cell
              key={d.status}
              fill={
                STATUS_BADGE_COLORS[d.status as keyof typeof STATUS_BADGE_COLORS]
                  ?.text ?? "#1f3864"
              }
              fillOpacity={0.85}
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
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e75b6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#2e75b6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#2e75b6", strokeOpacity: 0.25 }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#2e75b6"
          strokeWidth={2.5}
          fill="url(#volumeFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
