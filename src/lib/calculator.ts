import { CarInputs, CalculationResult, YearlyCost } from "@/types/calculator";

/** Standard NADA-style depreciation rates by year */
const DEPRECIATION_RATES: Record<string, number[]> = {
  //          Y1    Y2    Y3    Y4    Y5    Y6    Y7    Y8    Y9   Y10+
  standard: [0.20, 0.15, 0.13, 0.12, 0.11, 0.10, 0.09, 0.08, 0.07, 0.06],
  fast:     [0.30, 0.20, 0.16, 0.14, 0.12, 0.11, 0.09, 0.08, 0.07, 0.06],
  slow:     [0.15, 0.12, 0.10, 0.09, 0.08, 0.07, 0.07, 0.06, 0.06, 0.05],
};

/** Annual maintenance cost for a given ownership year */
function maintenanceCostForYear(y1to5: number, y6to10: number, year: number): number {
  if (year <= 5) return y1to5;
  if (year <= 10) return y6to10;
  return y6to10 * 1.3; // extrapolate 11+ years
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
    depreciation,
    maintenanceCost1to5,
    maintenanceCost6to10,
    ownershipYears,
    year: modelYear,
  } = inputs;

  // Vehicle age at the time of purchase (0 for brand-new cars)
  const vehicleAgeAtPurchase = Math.max(0, new Date().getFullYear() - modelYear);

  const safePurchasePrice = Math.max(0, purchasePrice);
  const safeDownPayment = Math.min(Math.max(0, downPayment), safePurchasePrice);
  const loanAmount = safePurchasePrice - safeDownPayment;
  const payment = loanAmount > 0 ? monthlyPayment(loanAmount, loanInterestRate, loanTermMonths) : 0;
  const loanPaidOffYear = Math.ceil(loanTermMonths / 12);
  const annualFuel = fuelMpg > 0 ? (milesPerYear / fuelMpg) * fuelPricePerGallon : 0;
  const salesTaxAmount = safePurchasePrice * (salesTaxRate / 100);

  const years: YearlyCost[] = [];
  let vehicleValue = safePurchasePrice;
  // Down payment is a year-0 cash outflow; seed cumulativeTotal with it so all
  // per-year and summary totals reflect the true amount spent.
  let cumulativeTotal = safeDownPayment;

  for (let year = 1; year <= ownershipYears; year++) {
    // Depreciation: use CarEdge residual fractions for years 1–10 when available,
    // then continue with standard compounding rates for years beyond the data.
    if (depreciation && year <= depreciation.length) {
      vehicleValue = safePurchasePrice * depreciation[year - 1];
    } else {
      const rate = depreciationRateForYear(depreciationModel, year);
      vehicleValue = vehicleValue * (1 - rate);
    }

    // Loan
    const { principal, interest, remainingBalance: loanBalance } = loanPaymentsForYear(loanAmount, loanInterestRate, loanTermMonths, year);

    // First year: tax and registration are already paid upfront, so don't double-count
    const taxThisYear = year === 1 ? salesTaxAmount : 0;
    const registrationThisYear = year === 1 ? registrationFees : 0;

    const fuel = annualFuel;
    const insurance = annualInsurancePremium;
    // Use vehicle age (not ownership year) to pick the correct maintenance bucket
    const vehicleAge = vehicleAgeAtPurchase + year;
    const maintenance = maintenanceCostForYear(maintenanceCost1to5, maintenanceCost6to10, vehicleAge);

    const totalThisYear = principal + interest + taxThisYear + registrationThisYear + fuel + insurance + maintenance;
    cumulativeTotal += totalThisYear;

    // Net cost = cumulative total (already includes down payment) - current residual value
    const netCost = cumulativeTotal - vehicleValue;

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
      loanBalance,
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
      totalPrincipal: totals.principal + safeDownPayment, // loan repayment + down payment = full purchase price
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
  purchasePrice: 0,
  downPayment: 0,
  salesTaxRate: 0,
  registrationFees: 0,
  loanInterestRate: 6.5,
  loanTermMonths: 60,
  fuelMpg: 30,
  milesPerYear: 13500,
  fuelPricePerGallon: 3.5,
  annualInsurancePremium: 1800,
  depreciationModel: "standard",
  maintenanceCost1to5: 290,
  maintenanceCost6to10: 1250,
  ownershipYears: 10,
};
