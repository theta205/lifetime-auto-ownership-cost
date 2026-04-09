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
  { key: "value", label: "Value vs. Balance" },
];

export function CarCostCalculator() {
  const [inputs, setInputs] = useState<CarInputs>(DEFAULT_INPUTS);
  const [chartView, setChartView] = useState<ChartView>("cumulative");
  const [tab, setTab] = useState<Tab>("chart");
  const [insuranceStatus, setInsuranceStatus] = useState<InsuranceStatus>("idle");
  const [regularFuelPrice, setRegularFuelPrice] = useState<number | null>(null);
  const insuranceController = useRef<AbortController | null>(null);
  const depreciationController = useRef<AbortController | null>(null);
  const rawResiduals = useRef<number[] | null>(null);
  const depreciationVersion = useRef(0);

  const result = useMemo(() => calculate(inputs), [inputs]);

  // Fetch EPA regular gasoline price once on mount
  useEffect(() => {
    fetch("/api/fuelprices")
      .then((r) => r.json())
      .then((data: { regular?: number }) => { if (data.regular) setRegularFuelPrice(data.regular); })
      .catch(() => {});
  }, []);

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
      year:      String(year),
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

  // Apply age offset to raw CarEdge residuals based on model year
  function applyAgeOffset(raw: number[], modelYear: number): number[] | undefined {
    const age = Math.max(0, new Date().getFullYear() - modelYear);
    const base = age === 0 ? 1 : (raw[age - 1] ?? raw[raw.length - 1]);
    const adjusted = raw.slice(age).map((r) => r / base);
    return adjusted.length > 0 ? adjusted : undefined;
  }

  // Fetch CarEdge depreciation curve when make + model + price change (not year)
  useEffect(() => {
    const { make, model, purchasePrice, milesPerYear } = inputs;
    if (!make || !model || !purchasePrice) return;

    depreciationController.current?.abort();
    depreciationController.current = new AbortController();
    depreciationVersion.current += 1;
    const version = depreciationVersion.current;

    rawResiduals.current = null;
    setInputs((prev) => ({ ...prev, depreciation: undefined }));

    const params = new URLSearchParams({
      make,
      model,
      price: String(purchasePrice),
      miles: String(milesPerYear),
    });

    fetch(`/api/depreciation?${params}`, { signal: depreciationController.current.signal })
      .then((r) => r.json())
      .then((data: { residuals?: number[]; error?: string }) => {
        if (version !== depreciationVersion.current) return;
        if (data.residuals && data.residuals.length > 0) {
          rawResiduals.current = data.residuals;
          setInputs((prev) => ({ ...prev, depreciation: applyAgeOffset(data.residuals!, prev.year) }));
        } else {
          rawResiduals.current = null;
          setInputs((prev) => ({ ...prev, depreciation: undefined }));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError" && version === depreciationVersion.current) {
          rawResiduals.current = null;
          setInputs((prev) => ({ ...prev, depreciation: undefined }));
        }
      });

    return () => depreciationController.current?.abort();
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    inputs.make, inputs.model, inputs.purchasePrice, inputs.milesPerYear,
  ]);

  // Re-offset the stored raw residuals when the model year changes (no re-fetch needed)
  useEffect(() => {
    if (!rawResiduals.current) return;
    const adjusted = applyAgeOffset(rawResiduals.current, inputs.year);
    setInputs((prev) => ({ ...prev, depreciation: adjusted }));
  }, [inputs.year]); // eslint-disable-line react-hooks/exhaustive-deps

  const missing = [
    !inputs.make                  && "make",
    !inputs.model                 && "model",
    !inputs.state                 && "state",
    inputs.zipCode.length !== 5   && "ZIP code",
    !(inputs.driverAge > 0)       && "driver age",
    !(inputs.purchasePrice > 0)   && "purchase price",
  ].filter(Boolean) as string[];
  const isComplete = missing.length === 0;

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
            {!isComplete && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center text-sm">
                <p className="text-gray-400 mb-2">Still needed to calculate:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {missing.map((field) => (
                    <span key={field} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 capitalize">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {isComplete && <SummaryCards result={result} />}

            {isComplete && <>
              {/* Chart / Table tabs */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
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
                  <CostChart years={result.years} view={chartView} purchasePrice={inputs.purchasePrice} downPayment={inputs.downPayment} />
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
              {/* Insights */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-800">Insights</h2>
                <ul className="space-y-3 text-sm text-gray-600">
                  {(() => {
                    const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
                    const years = result.years.length;
                    const { totalInterest, grandTotal, totalFuel, totalInsurance, totalMaintenance, netTotalCost } = result.summary;
                    const interestPct = grandTotal > 0 ? ((totalInterest / inputs.purchasePrice) * 100).toFixed(1) : "0";
                    const avgFuel = (14500 / 28) * (regularFuelPrice ?? inputs.fuelPricePerGallon);
                    const avgInsurance = 2700;
                    const avgMaintenance = 1400;
                    const annualFuel = totalFuel / years;
                    const annualInsurance = totalInsurance / years;
                    const annualMaintenance = totalMaintenance / years;
                    // Future value: invest netTotalCost/10 at start of each year for `years` years at 10%
                    const annualInvestment = netTotalCost / 10;
                    let spValue = 0;
                    for (let y = 1; y <= years; y++) {
                      spValue += annualInvestment * Math.pow(1.10, years - y + 1);
                    }
                    const diff = (val: number, avg: number) => val >= avg
                      ? <><span className="text-red-500 font-medium">{fmt(Math.abs(val - avg))} more</span> than the national average of {fmt(avg)}</>
                      : <><span className="text-green-600 font-medium">{fmt(Math.abs(val - avg))} less</span> than the national average of {fmt(avg)}</>;
                    return <>
                      {totalInterest > 0 && <li>You'll pay <span className="font-medium">{fmt(totalInterest)}</span> in interest — <span className="font-medium">{interestPct}%</span> of the vehicle's purchase price.</li>}
                      <li>Your fuel costs <span className="font-medium">{fmt(annualFuel)}/yr</span>, {diff(annualFuel, avgFuel)}.</li>
                      <li>Your insurance runs <span className="font-medium">{fmt(annualInsurance)}/yr</span>, {diff(annualInsurance, avgInsurance)}.</li>
                      <li>Your maintenance averages <span className="font-medium">{fmt(annualMaintenance)}/yr</span>, {diff(annualMaintenance, avgMaintenance)}.</li>
                      <li>Invested in the S&P 500 at 10%/yr, your {fmt(netTotalCost)} net ownership cost would grow to <span className="font-medium text-blue-600">{fmt(spValue)}</span> over {years} years</li>
                    </>;
                  })()}
                </ul>
              </div>
            </>}
          </main>
        </div>
      </div>
    </div>
  );
}
