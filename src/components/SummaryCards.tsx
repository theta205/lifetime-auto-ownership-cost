"use client";

import { CalculationResult } from "@/types/calculator";

interface SummaryCardsProps {
  result: CalculationResult;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const { summary } = result;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Card label="Total Spent" value={fmt(summary.grandTotal)} sub={`incl. down payment: ${fmt(summary.grandTotal + summary.totalPrincipal - (summary.totalPrincipal))}`} />
      <Card label="Net Cost" value={fmt(summary.netTotalCost)} sub="after resale value" color="text-red-600" />
      <Card label="Residual Value" value={fmt(summary.finalVehicleValue)} sub="estimated resale" color="text-green-600" />
      <Card label="Monthly Payment" value={fmt(summary.monthlyPayment)} sub={`${result.years[0]?.year ?? 0} of ${Math.ceil(result.years.length)}-yr term`} />
      <Card label="Total Interest" value={fmt(summary.totalInterest)} sub="financing cost" color="text-amber-600" />
      <Card label="Total Fuel" value={fmt(summary.totalFuel)} sub="over ownership period" />
    </div>
  );
}
