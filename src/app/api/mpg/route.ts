import { NextRequest, NextResponse } from "next/server";

const BASE = "https://fueleconomy.gov/ws/rest";

// Parse a simple XML tag value: <tagName>value</tagName>
function xmlVal(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match?.[1]?.trim() ?? "";
}

// Return all values for a repeated tag
function xmlVals(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, "g");
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
  return results;
}

/**
 * Our make displayNames that don't match EPA's exact casing.
 */
const MAKE_OVERRIDES: Record<string, string> = {
  "FIAT":     "Fiat",
  "INFINITI": "Infiniti",
  "RAM":      "Ram",
};

/**
 * Our model displayNames that can't be resolved by simple prefix-matching
 * against EPA's model list. Keyed as "EpaMake|OurModel".
 * Values are the exact string (or unambiguous prefix) EPA uses.
 */
const MODEL_OVERRIDES: Record<string, string> = {
  // BMW uses specific trim numbers, not "X Series"
  "BMW|2 Series": "230i",
  "BMW|3 Series": "330i Sedan",
  "BMW|4 Series": "430i",
  "BMW|5 Series": "530i Sedan",
  "BMW|7 Series": "740i Sedan",
  "BMW|8 Series": "840i Coupe",

  // Chevrolet/GMC drop the "1500/HD" suffix in EPA names
  "Chevrolet|Silverado 1500":   "Silverado 2WD",
  "Chevrolet|Silverado 2500HD": "Silverado Cab Chassis 2WD",
  "Chevrolet|Silverado 3500HD": "Silverado Cab Chassis 4WD",
  "GMC|Sierra 1500":   "Sierra 2WD",
  "GMC|Sierra 2500HD": "Sierra Cab Chassis 2WD",
  "GMC|Sierra 3500HD": "Sierra Cab Chassis 4WD",

  // Ford: EPA uses "F150 Pickup" (no hyphen, adds "Pickup")
  "Ford|F-150": "F150 Pickup 2WD",

  // Honda: EPA uses door count for Civic body styles
  "Honda|Civic Hatchback": "Civic 5Dr",

  // Toyota: EPA writes "GR 86" with a space
  "Toyota|GR86": "GR 86",

  // Audi: EPA drops body-style suffix from RS models
  "Audi|RS 3 Sedan":    "RS 3",
  "Audi|RS 7 Sportback": "RS 7",

  // Jeep: EPA includes door count in Wrangler 4xe
  "Jeep|Wrangler 4xe": "Wrangler 4dr 4xe",

  // Mazda: EPA names Mazda3 as "3" with body-style suffix
  "Mazda|Mazda3":           "3 4-Door 2WD",
  "Mazda|Mazda3 Hatchback": "3 5-Door 2WD",

  // Volvo: EPA abbreviates "V60 Cross Country" as "V60CC"
  "Volvo|V60 Cross Country": "V60CC",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year  = searchParams.get("year");
  const make  = searchParams.get("make");
  const model = searchParams.get("model");

  if (!year || !make || !model) {
    return NextResponse.json({ error: "year, make, model required" }, { status: 400 });
  }

  // Resolve EPA make name (handles casing differences like FIAT→Fiat)
  const epaMake = MAKE_OVERRIDES[make] ?? make;

  // Resolve EPA model name
  const overrideKey = `${epaMake}|${model}`;
  let epaModel: string;

  if (MODEL_OVERRIDES[overrideKey]) {
    epaModel = MODEL_OVERRIDES[overrideKey];
  } else {
    // Fetch EPA's model list and find the first that starts with our model name
    // (handles the common case where EPA appends drivetrain suffixes like AWD/FWD/4WD)
    try {
      const modelListRes = await fetch(
        `${BASE}/vehicle/menu/model?year=${encodeURIComponent(year)}&make=${encodeURIComponent(epaMake)}`,
        { next: { revalidate: 86400 } }
      );
      if (modelListRes.ok) {
        const listXml = await modelListRes.text();
        const epaModels = xmlVals(listXml, "text");
        const lc = model.toLowerCase();
        const match = epaModels.find((m) => m.toLowerCase().startsWith(lc));
        epaModel = match ?? model;
      } else {
        epaModel = model;
      }
    } catch {
      epaModel = model;
    }
  }

  try {
    // Step 1: get list of vehicle option IDs for this year/make/model
    const optionsUrl = `${BASE}/vehicle/menu/options?year=${encodeURIComponent(year)}&make=${encodeURIComponent(epaMake)}&model=${encodeURIComponent(epaModel)}`;
    const optRes = await fetch(optionsUrl, { next: { revalidate: 86400 } });
    if (!optRes.ok) throw new Error(`options fetch failed: ${optRes.status}`);
    const optXml = await optRes.text();

    const ids = xmlVals(optXml, "value");
    if (ids.length === 0) {
      return NextResponse.json({ error: "No vehicles found" }, { status: 404 });
    }

    // Step 2: fetch the first vehicle's data (base trim as representative)
    const vehicleUrl = `${BASE}/vehicle/${ids[0]}`;
    const vRes = await fetch(vehicleUrl, { next: { revalidate: 86400 } });
    if (!vRes.ok) throw new Error(`vehicle fetch failed: ${vRes.status}`);
    const vXml = await vRes.text();

    const combined = parseInt(xmlVal(vXml, "comb08"), 10);
    const city     = parseInt(xmlVal(vXml, "city08"), 10);
    const highway  = parseInt(xmlVal(vXml, "hwy08"), 10);
    const fuelType = xmlVal(vXml, "fuelType1");
    const trims    = xmlVals(optXml, "text");

    return NextResponse.json({
      combined: isNaN(combined) ? null : combined,
      city:     isNaN(city)     ? null : city,
      highway:  isNaN(highway)  ? null : highway,
      fuelType,
      trims,
      vehicleId: ids[0],
    });
  } catch (err) {
    console.error("MPG fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch MPG data" }, { status: 500 });
  }
}
