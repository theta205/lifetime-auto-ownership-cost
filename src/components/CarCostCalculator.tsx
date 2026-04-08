"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { CarCostForm } from "./CarCostForm";
import { CostChart } from "./CostChart";
import { SummaryCards } from "./SummaryCards";
import { YearlyTable } from "./YearlyTable";
import { calculate, DEFAULT_INPUTS } from "@/lib/calculator";
import { CarInputs } from "@/types/calculator";

type ChartView = "cumulative" | "annual" | "value";
type Tab = "chart" | "table";
type InsuranceStatus = "idle" | "loading" | "fetched" | "error";

const CHART_VIEWS: { key: ChartView; label: string }[] = [
  { key: "cumulative", label: "Cumulative" },
  { key: "annual", label: "Annual" },
  { key: "value", label: "Value vs. Cost" },
];

export function CarCostCalculator() {
  const [inputs, setInputs] = useState<CarInputs>(DEFAULT_INPUTS);
  const [chartView, setChartView] = useState<ChartView>("cumulative");
  const [tab, setTab] = useState<Tab>("chart");
  const [insuranceStatus, setInsuranceStatus] = useState<InsuranceStatus>("idle");
  const insuranceController = useRef<AbortController | null>(null);

  const result = useMemo(() => calculate(inputs), [inputs]);

  // Fetch insurance when all required fields are present
  useEffect(() => {
    const { make, model, year, state, zipCode, driverAge, driverSex, milesPerYear } = inputs;
    if (!make || !model || !year || !state || zipCode.length !== 5 || !driverAge) return;


    insuranceController.current?.abort();
    insuranceController.current = new AbortController();
    setInsuranceStatus("loading");

    const params = new URLSearchParams({
      age:       String(driverAge),
      sex:       driverSex,
      state,
      zipCode,
      makeSlug:  make,
      modelSlug: model,
      miles:     String(milesPerYear),
    });

    fetch(`/api/insurance?${params}`, { signal: insuranceController.current.signal })
      .then((r) => r.json())
      .then((data: { median?: number; avg?: number; error?: string }) => {
        if (data.error || (!data.median && !data.avg)) {
          setInsuranceStatus("error");
        } else {
          const annual = data.median ?? data.avg ?? 0;
          setInputs((prev) => ({ ...prev, annualInsurancePremium: annual }));
          setInsuranceStatus("fetched");
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setInsuranceStatus("error");
      });

    return () => insuranceController.current?.abort();
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    inputs.make, inputs.model, inputs.year,
    inputs.state, inputs.zipCode,
    inputs.driverAge, inputs.driverSex,
    inputs.milesPerYear,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Auto Ownership Cost Calculator</h1>
          <p className="mt-1 text-gray-500">
            Project total cost of ownership — financing, fuel, insurance, maintenance, and depreciation — over your ownership horizon.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Inputs panel */}
          <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:w-72 xl:w-80">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Inputs</h2>
            <CarCostForm inputs={inputs} onChange={setInputs} insuranceStatus={insuranceStatus} />
          </aside>

          {/* Results panel */}
          <main className="flex-1 space-y-5">
            <SummaryCards result={result} />

            {/* Chart / Table tabs */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                {/* Tab switcher */}
                <div className="flex rounded-lg bg-gray-100 p-0.5">
                  {(["chart", "table"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Chart view selector */}
                {tab === "chart" && (
                  <div className="flex rounded-lg bg-gray-100 p-0.5">
                    {CHART_VIEWS.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setChartView(v.key)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          chartView === v.key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {tab === "chart" ? (
                <CostChart years={result.years} view={chartView} />
              ) : (
                <YearlyTable years={result.years} />
              )}
            </div>

            {/* Cost breakdown summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-800">
                {inputs.ownershipYears}-Year Cost Breakdown
              </h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm sm:grid-cols-3">
                {[
                  { label: "Vehicle Purchase", value: result.summary.totalPrincipal, color: "bg-blue-500" },
                  { label: "Interest Paid", value: result.summary.totalInterest, color: "bg-amber-500" },
                  { label: "Tax & Registration", value: result.summary.totalTaxAndFees, color: "bg-gray-400" },
                  { label: "Fuel", value: result.summary.totalFuel, color: "bg-emerald-500" },
                  { label: "Insurance", value: result.summary.totalInsurance, color: "bg-purple-500" },
                  { label: "Maintenance", value: result.summary.totalMaintenance, color: "bg-red-500" },
                ].map(({ label, value, color }) => {
                  const pct = ((value / result.summary.grandTotal) * 100).toFixed(1);
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                      <span className="text-gray-600 truncate">{label}</span>
                      <span className="ml-auto font-medium text-gray-900 tabular-nums">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)}
                      </span>
                      <span className="w-10 text-right text-gray-400 tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm font-semibold">
                <span>Grand Total</span>
                <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.summary.grandTotal)}</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
