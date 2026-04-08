import { NextRequest, NextResponse } from "next/server";
import { getCategoryForVehicle, CATEGORY_SAMPLE } from "@/lib/vehicleCategories";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const age      = p.get("age");
  const sex      = p.get("sex");
  const state    = p.get("state");
  const zipCode  = p.get("zipCode");
  const makeSlug = p.get("makeSlug");
  const modelSlug= p.get("modelSlug");
  const miles    = p.get("miles");

  if (!age || !sex || !state || !zipCode || !makeSlug || !modelSlug || !miles) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  // Map user's vehicle to the closest Bankrate sample vehicle
  const category = getCategoryForVehicle(makeSlug, modelSlug);
  const sample = CATEGORY_SAMPLE[category];

  const body = {
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
          vin: "4T1H31AK.N",
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
          model_year_y2k: String(sample.year),
          purchase_status: "New",
        },
      ],
      geo: { state, zipcode: zipCode },
    },
  };

  console.log(`[insurance] category="${category}" sample="${sample.make} ${sample.model} ${sample.year}" state=${state} zip=${zipCode} age=${age} sex=${sex}`);
  console.log("[insurance] Request body:", JSON.stringify(body, null, 2));

  try {
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

    if (!res.ok) {
      const text = await res.text();
      console.error("Bankrate error:", res.status, text);
      return NextResponse.json({ error: `API returned ${res.status}` }, { status: 502 });
    }

    const data = await res.json();

    console.log("[insurance] Bankrate response keys:", Object.keys(data));
    console.log("[insurance] Bankrate response (truncated):", JSON.stringify(data).slice(0, 1000));

    const annuals: number[] = [];
    const dig = (obj: unknown, path = "") => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) { obj.forEach((v, i) => dig(v, `${path}[${i}]`)); return; }
      const o = obj as Record<string, unknown>;
      for (const key of ["annual", "annualPremium", "annual_premium", "totalAnnual", "total_annual"]) {
        if (typeof o[key] === "number" && (o[key] as number) > 200) {
          console.log(`[insurance] Found rate at ${path}.${key} =`, o[key]);
          annuals.push(o[key] as number);
        }
      }
      Object.entries(o).forEach(([k, v]) => dig(v, `${path}.${k}`));
    };
    dig(data);

    if (annuals.length === 0) {
      console.error("[insurance] No rates found. Full response:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: "No rates in response", raw: data }, { status: 404 });
    }

    annuals.sort((a, b) => a - b);
    const median = annuals[Math.floor(annuals.length / 2)];
    const avg    = Math.round(annuals.reduce((s, v) => s + v, 0) / annuals.length);

    return NextResponse.json({
      median, avg,
      low:      annuals[0],
      high:     annuals[annuals.length - 1],
      count:    annuals.length,
      category,
      sample:   `${sample.make} ${sample.model}`,
    });
  } catch (err) {
    console.error("Insurance fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch insurance rates" }, { status: 500 });
  }
}
