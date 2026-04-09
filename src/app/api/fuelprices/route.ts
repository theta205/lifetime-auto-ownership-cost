import { NextResponse } from "next/server";

function xmlVal(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match?.[1]?.trim() ?? "";
}

export async function GET() {
  try {
    const res = await fetch("https://fueleconomy.gov/ws/rest/fuelprices", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`fuelprices fetch failed: ${res.status}`);
    const xml = await res.text();
    return NextResponse.json({
      regular:  parseFloat(xmlVal(xml, "regular"))  || null,
      midgrade: parseFloat(xmlVal(xml, "midgrade")) || null,
      premium:  parseFloat(xmlVal(xml, "premium"))  || null,
      diesel:   parseFloat(xmlVal(xml, "diesel"))   || null,
      e85:      parseFloat(xmlVal(xml, "e85"))       || null,
      electric: parseFloat(xmlVal(xml, "electric")) || null,
    });
  } catch (err) {
    console.error("[fuelprices]", err);
    return NextResponse.json({ error: "Failed to fetch fuel prices" }, { status: 500 });
  }
}
