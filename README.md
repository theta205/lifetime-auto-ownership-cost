# Lifetime Auto Ownership Cost Calculator

A Next.js app that projects the full cost of owning a vehicle — financing, fuel, insurance, maintenance, and depreciation — over a user-defined ownership horizon.

## Features

- **Vehicle selection** — make, model, year with EPA fuel economy auto-filled
- **Depreciation** — CarEdge residual curves (years 1–10), age-offset for used cars, fallback to NADA-style rates
- **Insurance** — live rates fetched from Bankrate/Quadrant by driver profile and location
- **Fuel** — EPA fuel price by fuel type; compare against national average
- **Maintenance** — Consumer Reports 5-year cost buckets (years 1–5 and 6–10) by make, keyed to vehicle age not ownership year
- **Tax** — auto-filled from state selection
- **Charts** — cumulative spend, annual breakdown, vehicle value vs. loan balance
- **Insights** — interest as % of price, fuel/insurance/maintenance vs. national averages, S&P 500 opportunity cost
- **Income needed** — 15% rule based on year-1 total cost of ownership

## Data Sources

| Data | Source |
|------|--------|
| Fuel economy (MPG) | [FuelEconomy.gov](https://fueleconomy.gov/ws/rest/) |
| Fuel prices | [FuelEconomy.gov](https://fueleconomy.gov/ws/rest/fuelprices) |
| Insurance rates | Bankrate / Quadrant rate table API |
| Depreciation curves | [CarEdge](https://caredge.com) |
| Maintenance costs | Consumer Reports 5-year brand reliability data |
| State sales tax | Compiled state tax rate table |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    api/
      depreciation/   CarEdge residual curve scraper
      fuelprices/     EPA fuel price proxy
      insurance/      Bankrate rate table fetcher
      mpg/            FuelEconomy.gov MPG + fuel price lookup
  components/
    CarCostCalculator  Root component, orchestrates all fetches and state
    CarCostForm        Input panel
    VehicleSelector    Make/model/year dropdowns with EPA MPG feedback
    CostChart          Recharts visualizations (cumulative, annual, value vs. balance)
    SummaryCards       Key metrics at a glance
    InputField         Controlled text input with prefix/suffix
  lib/
    calculator         Core cost calculation logic
    maintenanceCosts   Consumer Reports maintenance data by make
    vehicleCategories  VIN samples for insurance category lookup
    vehicles           Make/model catalog
    stateTax           State sales tax rates
  types/
    calculator         CarInputs, YearlyCost, CalculationResult types
```
