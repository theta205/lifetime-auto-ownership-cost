import { CarInputs, CalculationResult, YearlyCost } from "@/types/calculator";

/** Standard NADA-style depreciation rates by year */
const DEPRECIATION_RATES: Record<string, number[]> = {
  //          Y1    Y2    Y3    Y4    Y5    Y6    Y7    Y8    Y9   Y10+
  standard: [0.20, 0.15, 0.13, 0.12, 0.11, 0.10, 0.09, 0.08, 0.07, 0.06],
  fast:     [0.30, 0.20, 0.16, 0.14, 0.12, 0.11, 0.09, 0.08, 0.07, 0.06],
  slow:     [0.15, 0.12, 0.10, 0.09, 0.08, 0.07, 0.07, 0.06, 0.06, 0.05],
};

/** Maintenance cost multiplier by age (relative to baseMaintenance) */
function maintenanceMultiplier(year: number): number {
  if (year <= 2) return 0.5;
  if (year <= 4) return 0.8;
  if (year <= 6) return 1.0;
  if (year <= 8) return 1.4;
  if (year <= 10) return 1.8;
  return 2.4;
}

function depreciationRateForYear(model: CarInputs["depreciationModel"], year: number): number {
  const rates = DEPRECIATION_RATES[model];
  return rates[Math.min(year - 1, rates.length - 1)];
}

/** Monthly payment for an amortized loan */
function monthlyPayment(principal: number, annualRatePct: number, termMonths: number): number {
  if (annualRatePct === 0) return principal / termMonths;
  const r = annualRatePct / 100 / 12;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

/** Returns [principal paid, interest paid] for a given calendar year of the loan */
function loanPaymentsForYear(
  loanAmount: number,
  annualRatePct: number,
  termMonths: number,
  calendarYear: number // 1-indexed year of ownership
): { principal: number; interest: number; remainingBalance: number } {
  if (loanAmount <= 0) return { principal: 0, interest: 0, remainingBalance: 0 };

  const r = annualRatePct / 100 / 12;
  const payment = monthlyPayment(loanAmount, annualRatePct, termMonths);

  let balance = loanAmount;
  let totalPrincipal = 0;
  let totalInterest = 0;

  const startMonth = (calendarYear - 1) * 12 + 1;
  const endMonth = calendarYear * 12;

  for (let m = 1; m <= endMonth && balance > 0; m++) {
    const interestCharge = balance * r;
    const principalCharge = Math.min(payment - interestCharge, balance);
    if (m >= startMonth) {
      totalInterest += interestCharge;
      totalPrincipal += principalCharge;
    }
    balance = Math.max(0, balance - principalCharge);
  }

  return { principal: totalPrincipal, interest: totalInterest, remainingBalance: balance };
}

export function calculate(inputs: CarInputs): CalculationResult {
  const {
    purchasePrice,
    downPayment,
    salesTaxRate,
    registrationFees,
    loanInterestRate,
    loanTermMonths,
    fuelMpg,
    milesPerYear,
    fuelPricePerGallon,
    annualInsurancePremium,
    depreciationModel,
    baseMaintenance,
    ownershipYears,
  } = inputs;

  const loanAmount = Math.max(0, purchasePrice - downPayment);
  const payment = loanAmount > 0 ? monthlyPayment(loanAmount, loanInterestRate, loanTermMonths) : 0;
  const loanPaidOffYear = Math.ceil(loanTermMonths / 12);
  const annualFuel = (milesPerYear / fuelMpg) * fuelPricePerGallon;
  const salesTaxAmount = purchasePrice * (salesTaxRate / 100);

  const years: YearlyCost[] = [];
  let vehicleValue = purchasePrice;
  let cumulativeTotal = 0;

  // Year 0 up-front costs: down payment + tax + fees (not included in yearly loop)
  const upfrontCosts = downPayment + salesTaxAmount + registrationFees;

  for (let year = 1; year <= ownershipYears; year++) {
    // Depreciation
    const rate = depreciationRateForYear(depreciationModel, year);
    vehicleValue = vehicleValue * (1 - rate);

    // Loan
    const { principal, interest } = loanPaymentsForYear(loanAmount, loanInterestRate, loanTermMonths, year);

    // First year: tax and registration are already paid upfront, so don't double-count
    const taxThisYear = year === 1 ? salesTaxAmount : 0;
    const registrationThisYear = year === 1 ? registrationFees : 0;

    const fuel = annualFuel;
    const insurance = annualInsurancePremium;
    const maintenance = baseMaintenance * maintenanceMultiplier(year);

    const totalThisYear = principal + interest + taxThisYear + registrationThisYear + fuel + insurance + maintenance;
    cumulativeTotal += totalThisYear;

    // Net cost = cumulative total + down payment - current residual value
    const netCost = cumulativeTotal + downPayment - vehicleValue;

    years.push({
      year,
      principal,
      interest,
      tax: taxThisYear,
      registration: registrationThisYear,
      fuel,
      insurance,
      maintenance,
      totalThisYear,
      cumulativeTotal,
      vehicleValue,
      netCost,
    });
  }

  const totals = years.reduce(
    (acc, y) => ({
      principal: acc.principal + y.principal,
      interest: acc.interest + y.interest,
      taxAndFees: acc.taxAndFees + y.tax + y.registration,
      fuel: acc.fuel + y.fuel,
      insurance: acc.insurance + y.insurance,
      maintenance: acc.maintenance + y.maintenance,
    }),
    { principal: 0, interest: 0, taxAndFees: 0, fuel: 0, insurance: 0, maintenance: 0 }
  );

  return {
    years,
    summary: {
      totalPrincipal: totals.principal + downPayment,
      totalInterest: totals.interest,
      totalTaxAndFees: totals.taxAndFees,
      totalFuel: totals.fuel,
      totalInsurance: totals.insurance,
      totalMaintenance: totals.maintenance,
      grandTotal: years[years.length - 1]?.cumulativeTotal ?? 0,
      finalVehicleValue: years[years.length - 1]?.vehicleValue ?? 0,
      netTotalCost: years[years.length - 1]?.netCost ?? 0,
      monthlyPayment: payment,
      loanPaidOffYear,
    },
  };
}

export const DEFAULT_INPUTS: CarInputs = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  state: "",
  zipCode: "",
  driverAge: 35,
  driverSex: "Male",
  purchasePrice: 30000,
  downPayment: 5000,
  salesTaxRate: 7.5,
  registrationFees: 300,
  loanInterestRate: 6.5,
  loanTermMonths: 60,
  fuelMpg: 30,
  milesPerYear: 12000,
  fuelPricePerGallon: 3.5,
  annualInsurancePremium: 1800,
  depreciationModel: "standard",
  baseMaintenance: 600,
  ownershipYears: 10,
};
