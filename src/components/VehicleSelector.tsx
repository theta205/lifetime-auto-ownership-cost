"use client";

import { useState, useEffect } from "react";
import { VEHICLE_MAKES, MAKE_MAP, MODEL_YEARS } from "@/lib/vehicles";

interface VehicleSelectorProps {
  make: string;
  model: string;
  year: number;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  onYearChange: (year: number) => void;
  onMpgFetched: (mpg: number) => void;
  onFuelPriceFetched: (price: number) => void;
}

interface MpgResult {
  combined: number | null;
  city: number | null;
  highway: number | null;
  fuelType: string;
  fuelPrice: number | null;
  trims: string[];
}

export function VehicleSelector({
  make,
  model,
  year,
  onMakeChange,
  onModelChange,
  onYearChange,
  onMpgFetched,
  onFuelPriceFetched,
}: VehicleSelectorProps) {
  const [mpg, setMpg] = useState<MpgResult | null>(null);
  const [mpgLoading, setMpgLoading] = useState(false);

  const selectedMake = MAKE_MAP.get(make);
  const models = selectedMake?.models ?? [];

  // Fetch MPG whenever make + model + year are all set
  useEffect(() => {
    if (!make || !model || !year) {
      setMpg(null);
      return;
    }
    const controller = new AbortController();
    setMpgLoading(true);

    const modelDisplay = selectedMake?.models.find((m) => m.slug === model)?.displayName ?? model;
    const params = new URLSearchParams({ year: String(year), make: selectedMake?.displayName ?? make, model: modelDisplay });
    fetch(`/api/mpg?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: MpgResult & { error?: string }) => {
        if (data.error) {
          setMpg(null);
          onMpgFetched(25);
        } else {
          setMpg(data);
          onMpgFetched(data.combined ?? 25);
          if (data.fuelPrice) onFuelPriceFetched(data.fuelPrice);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") onMpgFetched(25);
      })
      .finally(() => setMpgLoading(false));

    return () => controller.abort();
  }, [make, model, year]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      {/* Year */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Year</label>
        <select
          value={year}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {MODEL_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Make */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Make</label>
        <select
          value={make}
          onChange={(e) => {
            onMakeChange(e.target.value);
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select Make</option>
          {VEHICLE_MAKES.map((m) => (
            <option key={m.slug} value={m.slug}>{m.displayName}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Model</label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={!make}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">{make ? "Select Model" : "Select Make first"}</option>
          {models.map((m) => (
            <option key={m.slug} value={m.slug}>{m.displayName}</option>
          ))}
        </select>
      </div>

      {/* MPG feedback */}
      {(mpgLoading || mpg) && (
        <div className={`rounded-lg px-3 py-2 text-xs ${mpgLoading ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
          {mpgLoading && (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Fetching EPA fuel economy...
            </span>
          )}
          {mpg && !mpgLoading && (
            <div>
              <span className="font-semibold">EPA: {mpg.combined} mpg combined</span>
              {mpg.fuelType && <span className="ml-2">· {mpg.fuelType}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
