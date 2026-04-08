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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year = searchParams.get("year");
  const make = searchParams.get("make");
  const model = searchParams.get("model");

  if (!year || !make || !model) {
    return NextResponse.json({ error: "year, make, model required" }, { status: 400 });
  }

  try {
    // Step 1: get list of vehicle option IDs for this year/make/model
    const optionsUrl = `${BASE}/vehicle/menu/options?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
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
    const city = parseInt(xmlVal(vXml, "city08"), 10);
    const highway = parseInt(xmlVal(vXml, "hwy08"), 10);
    const fuelType = xmlVal(vXml, "fuelType1");
    const trims = xmlVals(optXml, "text");

    return NextResponse.json({
      combined: isNaN(combined) ? null : combined,
      city: isNaN(city) ? null : city,
      highway: isNaN(highway) ? null : highway,
      fuelType,
      trims,
      vehicleId: ids[0],
    });
  } catch (err) {
    console.error("MPG fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch MPG data" }, { status: 500 });
  }
}
