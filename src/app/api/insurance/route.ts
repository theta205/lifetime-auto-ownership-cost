import { NextRequest, NextResponse } from "next/server";
import { getCategoryForVehicle, CATEGORY_SAMPLE } from "@/lib/vehicleCategories";

// VIN position 10 encodes model year
const VIN_YEAR_CHARS: Record<number, string> = {
  2020: "L", 2021: "M", 2022: "N", 2023: "P",
  2024: "R", 2025: "S", 2026: "T", 2027: "V",
};

type CarrierRate = { carrier: string; low: number; high: number; available: boolean };

async function fetchRates(body: object): Promise<CarrierRate[]> {
  const res = await fetch("https://content-api.insurance.bankrate.com/quadrant/rateTable", {
    method: "POST",
    headers: {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "origin": "https://www.bankrate.com",
      "pragma": "no-cache",
      "referer": "https://www.bankrate.com/",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Bankrate returned ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function buildBody(
  rateYear: number,
  sample: { make: string; model: string; vin: string },
  { age, sex, state, zipCode, miles }: { age: string; sex: string; state: string; zipCode: string; miles: string }
) {
  const yearChar = VIN_YEAR_CHARS[rateYear] ?? VIN_YEAR_CHARS[2023];
  const vin = sample.vin.replace(".", yearChar);
  return {
    args: {
      policy: {
        pd: "50,000",
        med: "None",
        term: 12,
        umbi: "100/300",
        liability: "100/300",
        occupancy: "Owner",
        residence: "House",
        credit_tier: "Good",
        e_signature: "Yes",
        payment_type: "Installments",
        number_drivers: 1,
        number_vehicles: 1,
        property_market: 100000,
        property_policy: "Home",
        residence_years: 5,
        incident_date_mode: 0,
        last_late_pay_time: "No Late Payment",
        paperless_discount: "Yes",
        naic_current_carrier: 99999,
        number_late_payments: 0,
        days_advance_purchase: 0,
        electronic_fund_transfer: "Yes",
        naic_current_carrier_mths: 60,
      },
      drivers: [
        {
          age: parseInt(age),
          sex,
          degree: "Bachelors",
          dlapse: 0,
          filing: "None",
          status: "Single",
          ca_license: "24y00m",
          occupation: "Employed",
          profession: "Other",
          us_license: "24y00m",
          good_student: "No",
          relationship: "Insured",
          with_parents: "No",
          license_state: state,
          student_level: "None",
          license_status: "Active",
          prior_physical: "24y00m",
          distant_student: "No",
          driver_training: "No",
          miles_from_home: 0,
          prior_liability: "24y00m",
          defensive_driver: "No",
          number_incidents: 0,
          license_suspended: "No",
          continuous_license: "24y00m",
          verifiable_license: "24y00m",
          prior_carrier_market: 200000,
          prior_carrier_months: 60,
          prior_liability_type: "Standard",
          dprior_liability_limit: "100/300",
          driver_occupation_years: 10,
        },
      ],
      vehicles: [
        {
          use: "Work",
          vin,
          coll: "500",
          comp: "500",
          make: sample.make,
          model: sample.model,
          annual: parseInt(miles),
          parked: "Garage",
          rental: "None",
          towing: "None",
          commute: 10,
          zipcode: zipCode,
          ownership: "Financed",
          days_per_week: 5,
          model_year_y2k: String(rateYear),
          purchase_status: "New",
        },
      ],
      geo: { state, zipcode: zipCode },
    },
  };
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const age       = p.get("age");
  const sex       = p.get("sex");
  const state     = p.get("state");
  const zipCode   = p.get("zipCode");
  const makeSlug  = p.get("makeSlug");
  const modelSlug = p.get("modelSlug");
  const miles     = p.get("miles");
  const yearStr   = p.get("year");

  if (!age || !sex || !state || !zipCode || !makeSlug || !modelSlug || !miles) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  const category = getCategoryForVehicle(makeSlug, modelSlug);
  const sample = CATEGORY_SAMPLE[category];
  const selectedYear = yearStr ? parseInt(yearStr) : sample.year;

  const driverInfo = { age, sex, state, zipCode, miles };

  console.log(`[insurance] category="${category}" sample="${sample.make} ${sample.model}" year=${selectedYear} state=${state} zip=${zipCode}`);

  try {
    // Try the user's selected year first; if Bankrate has no data for it
    // (e.g. future model year or discontinued vehicle), fall back to sample.year
    let rates = await fetchRates(buildBody(selectedYear, sample, driverInfo));
    let available = rates.filter((r) => r.available && typeof r.low === "number" && typeof r.high === "number");

    if (available.length === 0 && selectedYear !== sample.year) {
      console.log(`[insurance] No carriers for year=${selectedYear}, retrying with sample year=${sample.year}`);
      rates = await fetchRates(buildBody(sample.year, sample, driverInfo));
      available = rates.filter((r) => r.available && typeof r.low === "number" && typeof r.high === "number");
    }

    if (available.length === 0) {
      console.error("[insurance] No available carriers:", JSON.stringify(rates).slice(0, 500));
      return NextResponse.json({ error: "No available carriers for this state/zip" }, { status: 404 });
    }

    const midpoints = available.map((r) => Math.round((r.low + r.high) / 2));
    midpoints.sort((a, b) => a - b);
    const median = midpoints[Math.floor(midpoints.length / 2)];
    const avg    = Math.round(midpoints.reduce((s, v) => s + v, 0) / midpoints.length);

    console.log(`[insurance] ${available.length} carriers:`, available.map((r) => `${r.carrier} $${r.low}-$${r.high}`));

    return NextResponse.json({
      median, avg,
      low:      available[0].low,
      high:     available[available.length - 1].high,
      count:    available.length,
      carriers: available.map((r) => ({ carrier: r.carrier, low: r.low, high: r.high })),
      category,
      sample:   `${sample.make} ${sample.model}`,
    });
  } catch (err) {
    console.error("Insurance fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch insurance rates" }, { status: 500 });
  }
}
