export interface CarInputs {
  // Vehicle identity
  make: string;
  model: string;
  year: number;

  // Driver & location (drives insurance fetch + tax auto-fill)
  state: string;       // 2-letter code, e.g. "FL"
  zipCode: string;
  driverAge: number;
  driverSex: "Male" | "Female";

  // Purchase
  purchasePrice: number;
  downPayment: number;
  salesTaxRate: number; // percentage, e.g. 8.5
  registrationFees: number; // one-time

  // Loan
  loanInterestRate: number; // APR percentage, e.g. 6.5
  loanTermMonths: number; // e.g. 60

  // Fuel
  fuelMpg: number;
  milesPerYear: number;
  fuelPricePerGallon: number;

  // Insurance
  annualInsurancePremium: number;

  // Depreciation
  depreciationModel: "standard" | "fast" | "slow";

  // Maintenance (base annual cost; increases with age)
  baseMaintenance: number;

  // Ownership horizon
  ownershipYears: number;
}

export interface YearlyCost {
  year: number;
  // Absolute values for that year
  principal: number;
  interest: number;
  tax: number; // first year only
  registration: number; // first year only
  fuel: number;
  insurance: number;
  maintenance: number;
  totalThisYear: number;
  cumulativeTotal: number;

  // Vehicle residual value at end of year
  vehicleValue: number;
  // Net cost = cumulative total - residual value (what you've "spent" net of resale)
  netCost: number;
}

export interface CalculationResult {
  years: YearlyCost[];
  summary: {
    totalPrincipal: number;
    totalInterest: number;
    totalTaxAndFees: number;
    totalFuel: number;
    totalInsurance: number;
    totalMaintenance: number;
    grandTotal: number;
    finalVehicleValue: number;
    netTotalCost: number;
    monthlyPayment: number;
    loanPaidOffYear: number;
  };
}
