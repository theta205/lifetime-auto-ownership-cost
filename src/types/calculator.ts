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
  // CarEdge residual fractions for years 1–10 (index 0 = end of year 1).
  // When present, these override the model-based rates for those years.
  depreciation?: number[];

  // Maintenance (annual cost by age bucket, from Consumer Reports)
  maintenanceCost1to5: number;   // avg annual cost for years 1-5
  maintenanceCost6to10: number;  // avg annual cost for years 6-10

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
  // Remaining loan balance at end of year
  loanBalance: number;
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
