"use client";

import { YearlyCost } from "@/types/calculator";

interface YearlyTableProps {
  years: YearlyCost[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export function YearlyTable({ years }: YearlyTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-3 py-2 font-semibold text-gray-600">Yr</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Principal</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Interest</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Fuel</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Insurance</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Maint.</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Tax/Fees</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right border-l border-gray-200">Total</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Cumulative</th>
            <th className="px-3 py-2 font-semibold text-gray-600 text-right">Car Value</th>
            <th className="px-3 py-2 font-semibold text-red-500 text-right">Net Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {years.map((y) => (
            <tr key={y.year} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-700">{y.year}</td>
              <td className="px-3 py-2 text-right text-blue-700">{fmt(y.principal)}</td>
              <td className="px-3 py-2 text-right text-amber-700">{fmt(y.interest)}</td>
              <td className="px-3 py-2 text-right text-emerald-700">{fmt(y.fuel)}</td>
              <td className="px-3 py-2 text-right text-purple-700">{fmt(y.insurance)}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmt(y.maintenance)}</td>
              <td className="px-3 py-2 text-right text-gray-500">{fmt(y.tax + y.registration)}</td>
              <td className="px-3 py-2 text-right font-semibold border-l border-gray-200">{fmt(y.totalThisYear)}</td>
              <td className="px-3 py-2 text-right text-gray-600">{fmt(y.cumulativeTotal)}</td>
              <td className="px-3 py-2 text-right text-green-700">{fmt(y.vehicleValue)}</td>
              <td className="px-3 py-2 text-right font-semibold text-red-600">{fmt(y.netCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
