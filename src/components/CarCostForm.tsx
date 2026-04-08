"use client";

import { CarInputs } from "@/types/calculator";
import { InputField } from "./InputField";

interface CarCostFormProps {
  inputs: CarInputs;
  onChange: (inputs: CarInputs) => void;
}

const DEPRECIATION_OPTIONS = [
  { value: "slow", label: "Slow (luxury/trucks)" },
  { value: "standard", label: "Standard (average car)" },
  { value: "fast", label: "Fast (economy/high-mileage)" },
];

export function CarCostForm({ inputs, onChange }: CarCostFormProps) {
  const handle = (name: string, value: number | string) => {
    onChange({ ...inputs, [name]: value });
  };

  return (
    <div className="space-y-6">
      {/* Purchase */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Purchase</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Purchase Price" name="purchasePrice" value={inputs.purchasePrice} onChange={handle} prefix="$" min={0} step={500} />
          <InputField label="Down Payment" name="downPayment" value={inputs.downPayment} onChange={handle} prefix="$" min={0} step={500} />
          <InputField label="Sales Tax Rate" name="salesTaxRate" value={inputs.salesTaxRate} onChange={handle} suffix="%" min={0} max={15} step={0.1} />
          <InputField label="Registration / Fees" name="registrationFees" value={inputs.registrationFees} onChange={handle} prefix="$" min={0} step={50} />
        </div>
      </section>

      {/* Loan */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Financing</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Interest Rate (APR)" name="loanInterestRate" value={inputs.loanInterestRate} onChange={handle} suffix="%" min={0} max={30} step={0.1} />
          <InputField label="Loan Term" name="loanTermMonths" value={inputs.loanTermMonths} onChange={handle} suffix="mo" min={12} max={96} step={12} />
        </div>
      </section>

      {/* Fuel */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Fuel</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Fuel Economy" name="fuelMpg" value={inputs.fuelMpg} onChange={handle} suffix="mpg" min={1} max={200} step={1} />
          <InputField label="Miles Per Year" name="milesPerYear" value={inputs.milesPerYear} onChange={handle} suffix="mi" min={1000} max={100000} step={500} />
          <InputField label="Gas Price" name="fuelPricePerGallon" value={inputs.fuelPricePerGallon} onChange={handle} prefix="$" suffix="/gal" min={0} step={0.05} />
        </div>
      </section>

      {/* Insurance */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Insurance</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Annual Premium" name="annualInsurancePremium" value={inputs.annualInsurancePremium} onChange={handle} prefix="$" suffix="/yr" min={0} step={50} />
        </div>
      </section>

      {/* Depreciation & Maintenance */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Depreciation & Maintenance</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Depreciation Model" name="depreciationModel" value={inputs.depreciationModel} onChange={handle} type="select" options={DEPRECIATION_OPTIONS} />
          <InputField label="Base Annual Maintenance" name="baseMaintenance" value={inputs.baseMaintenance} onChange={handle} prefix="$" suffix="/yr" min={0} step={50} />
        </div>
      </section>

      {/* Horizon */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Ownership Horizon</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Years to Own" name="ownershipYears" value={inputs.ownershipYears} onChange={handle} suffix="yr" min={1} max={20} step={1} />
        </div>
      </section>
    </div>
  );
}
