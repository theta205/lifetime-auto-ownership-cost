"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { YearlyCost } from "@/types/calculator";

interface CostChartProps {
  years: YearlyCost[];
  view: "cumulative" | "annual" | "value";
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const COLORS = {
  principal: "#3b82f6",
  interest:  "#f59e0b",
  fuel:      "#10b981",
  insurance: "#8b5cf6",
  maintenance: "#ef4444",
  tax:       "#6b7280",
  cumulative: "#1d4ed8",
  value:     "#059669",
  netCost:   "#dc2626",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs">
      <p className="mb-2 font-semibold text-gray-700">Year {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium">{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function CostChart({ years, view }: CostChartProps) {
  if (view === "value") {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={years} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -2 }} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="vehicleValue" name="Vehicle Value" stroke={COLORS.value} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="cumulativeTotal" name="Cumulative Spent" stroke={COLORS.cumulative} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="netCost" name="Net Cost" stroke={COLORS.netCost} strokeWidth={2} dot={false} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (view === "cumulative") {
    const data = years.map((y) => ({
      year: y.year,
      Principal: y.principal,
      Interest: y.interest,
      "Tax & Fees": y.tax + y.registration,
      Fuel: y.fuel,
      Insurance: y.insurance,
      Maintenance: y.maintenance,
    }));

    // Convert to cumulative stacks
    const cumData = data.map((_, i) => {
      const acc: Record<string, number> = { year: data[i].year };
      const keys = ["Principal", "Interest", "Tax & Fees", "Fuel", "Insurance", "Maintenance"];
      keys.forEach((k) => {
        acc[k] = data.slice(0, i + 1).reduce((s, d) => s + ((d as Record<string, number>)[k] ?? 0), 0);
      });
      return acc;
    });

    return (
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={cumData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -2 }} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area type="monotone" dataKey="Principal" stackId="1" stroke={COLORS.principal} fill={COLORS.principal} fillOpacity={0.7} />
          <Area type="monotone" dataKey="Interest" stackId="1" stroke={COLORS.interest} fill={COLORS.interest} fillOpacity={0.7} />
          <Area type="monotone" dataKey="Tax & Fees" stackId="1" stroke={COLORS.tax} fill={COLORS.tax} fillOpacity={0.7} />
          <Area type="monotone" dataKey="Fuel" stackId="1" stroke={COLORS.fuel} fill={COLORS.fuel} fillOpacity={0.7} />
          <Area type="monotone" dataKey="Insurance" stackId="1" stroke={COLORS.insurance} fill={COLORS.insurance} fillOpacity={0.7} />
          <Area type="monotone" dataKey="Maintenance" stackId="1" stroke={COLORS.maintenance} fill={COLORS.maintenance} fillOpacity={0.7} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Annual view
  const data = years.map((y) => ({
    year: y.year,
    Principal: y.principal,
    Interest: y.interest,
    "Tax & Fees": y.tax + y.registration,
    Fuel: y.fuel,
    Insurance: y.insurance,
    Maintenance: y.maintenance,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -2 }} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area type="monotone" dataKey="Principal" stackId="1" stroke={COLORS.principal} fill={COLORS.principal} fillOpacity={0.7} />
        <Area type="monotone" dataKey="Interest" stackId="1" stroke={COLORS.interest} fill={COLORS.interest} fillOpacity={0.7} />
        <Area type="monotone" dataKey="Tax & Fees" stackId="1" stroke={COLORS.tax} fill={COLORS.tax} fillOpacity={0.7} />
        <Area type="monotone" dataKey="Fuel" stackId="1" stroke={COLORS.fuel} fill={COLORS.fuel} fillOpacity={0.7} />
        <Area type="monotone" dataKey="Insurance" stackId="1" stroke={COLORS.insurance} fill={COLORS.insurance} fillOpacity={0.7} />
        <Area type="monotone" dataKey="Maintenance" stackId="1" stroke={COLORS.maintenance} fill={COLORS.maintenance} fillOpacity={0.7} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
