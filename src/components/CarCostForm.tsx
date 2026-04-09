"use client";

import React from "react";
import { CarInputs } from "@/types/calculator";
import { InputField } from "./InputField";
import { VehicleSelector } from "./VehicleSelector";
import { US_STATES, STATE_TAX_RATES } from "@/lib/stateTax";
import { MAKE_MAINTENANCE, DEFAULT_MAINTENANCE } from "@/lib/maintenanceCosts";

interface CarCostFormProps {
  inputs: CarInputs;
  onChange: React.Dispatch<React.SetStateAction<CarInputs>>;
  insuranceStatus: "idle" | "loading" | "fetched" | "error";
}


const SEX_OPTIONS = [
  { value: "Male",   label: "Male" },
  { value: "Female", label: "Female" },
];

export function CarCostForm({ inputs, onChange, insuranceStatus }: CarCostFormProps) {
  const handle = (name: string, value: number | string) => {
    onChange((prev) => ({ ...prev, [name]: value }));
  };

  const handleState = (state: string) => {
    onChange((prev) => ({ ...prev, state, salesTaxRate: STATE_TAX_RATES[state] ?? prev.salesTaxRate }));
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Identity */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Vehicle</h3>
        <VehicleSelector
          make={inputs.make}
          model={inputs.model}
          year={inputs.year}
          onMakeChange={(make) => {
            const m = MAKE_MAINTENANCE[make] ?? DEFAULT_MAINTENANCE;
            onChange((prev) => ({ ...prev, make, model: "", maintenanceCost1to5: m.y1to5, maintenanceCost6to10: m.y6to10 }));
          }}
          onModelChange={(model) => onChange((prev) => ({ ...prev, model }))}
          onYearChange={(year) => onChange((prev) => ({ ...prev, year }))}
          onMpgFetched={(mpg) => onChange((prev) => ({ ...prev, fuelMpg: mpg }))}
          onFuelPriceFetched={(price) => onChange((prev) => ({ ...prev, fuelPricePerGallon: price }))}
        />
      </section>

      {/* Driver & Location */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Driver & Location</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* State dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">State</label>
            <select
              value={inputs.state}
              onChange={(e) => handleState(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              {US_STATES.map((s) => (
                <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>
              ))}
            </select>
          </div>

          {/* ZIP code */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={inputs.zipCode}
              onChange={(e) => handle("zipCode", e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 32306"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <InputField label="Driver Age" name="driverAge" value={inputs.driverAge} onChange={handle} suffix="yr" min={16} max={90} step={1} />
          <InputField label="Driver Sex" name="driverSex" value={inputs.driverSex} onChange={handle} type="select" options={SEX_OPTIONS} />
        </div>

        {/* Insurance fetch status */}
        {insuranceStatus !== "idle" && (
          <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${
            insuranceStatus === "loading" ? "bg-blue-50 text-blue-700" :
            insuranceStatus === "error"   ? "bg-amber-50 text-amber-700" :
            "bg-green-50 text-green-700"
          }`}>
            {insuranceStatus === "loading" && (
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                Fetching insurance rates...
              </span>
            )}
            {insuranceStatus === "error"   && "Could not fetch rates — using your manual input"}
            {insuranceStatus === "fetched" && "Insurance premium updated"}
          </div>
        )}
      </section>

      {/* Purchase */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Purchase</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Purchase Price" name="purchasePrice" value={inputs.purchasePrice} onChange={handle} prefix="$" min={0} step={500} />
          {!(inputs.downPayment >= inputs.purchasePrice && inputs.purchasePrice > 0) && (
            <InputField label="Down Payment" name="downPayment" value={inputs.downPayment} onChange={handle} prefix="$" min={0} step={500} />
          )}
        </div>
      </section>

      {/* Loan */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Financing</h3>
          <button
            type="button"
            onClick={() => {
              const isCash = inputs.downPayment >= inputs.purchasePrice && inputs.purchasePrice > 0;
              onChange((prev) => isCash
                ? { ...prev, downPayment: 0, loanInterestRate: 6.5, loanTermMonths: 60 }
                : { ...prev, downPayment: prev.purchasePrice, loanInterestRate: 0, loanTermMonths: 12 }
              );
            }}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              inputs.downPayment >= inputs.purchasePrice && inputs.purchasePrice > 0
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {inputs.downPayment >= inputs.purchasePrice && inputs.purchasePrice > 0 ? "Cash ✓" : "Pay cash"}
          </button>
        </div>
        {!(inputs.downPayment >= inputs.purchasePrice && inputs.purchasePrice > 0) && (
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Interest Rate (APR)" name="loanInterestRate" value={inputs.loanInterestRate} onChange={handle} suffix="%" min={0} max={30} step={0.1} />
            <InputField label="Loan Term (months)" name="loanTermMonths" value={inputs.loanTermMonths} onChange={handle} suffix="mo" min={12} max={96} step={12} />
          </div>
        )}
      </section>

      {/* Fuel */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Fuel</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Annual Miles</label>
            <select
              value={inputs.milesPerYear}
              onChange={(e) => handle("milesPerYear", parseInt(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[6000,7500,9000,10500,12000,13500,15000,16500,18000,19500,21000].map((m) => (
                <option key={m} value={m}>{m.toLocaleString()}</option>
              ))}
            </select>
          </div>
          <InputField label="Fuel Price" name="fuelPricePerGallon" value={inputs.fuelPricePerGallon} onChange={handle} prefix="$" suffix="/gal" min={0} step={0.05} />
        </div>
      </section>

      {/* Insurance */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Insurance</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Annual Premium" name="annualInsurancePremium" value={inputs.annualInsurancePremium} onChange={handle} prefix="$" suffix="/yr" min={0} step={50} />
        </div>
      </section>

      {/* Depreciation */}
      {/* <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Depreciation</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Depreciation Model" name="depreciationModel" value={inputs.depreciationModel} onChange={handle} type="select" options={DEPRECIATION_OPTIONS} />
        </div>
      </section> */}

      {/* Horizon */}
      {/* <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Ownership Horizon</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Years to Own" name="ownershipYears" value={inputs.ownershipYears} onChange={handle} suffix="yr" min={1} max={20} step={1} />
        </div>
      </section> */}
    </div>
  );
}
