import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const make  = p.get("make");
  const model = p.get("model");
  const price = p.get("price");
  const miles = p.get("miles");

  if (!make || !model || !price || !miles) {
    return NextResponse.json({ error: "make, model, price, miles required" }, { status: 400 });
  }

  // CarEdge slugs use hyphens; our slugs may have spaces
  const makeSlug  = make.replace(/\s+/g, "-");
  const modelSlug = model.replace(/\s+/g, "-");

  // The JS variable name uses underscores for both spaces and hyphens
  const varSuffix = `${make}_${model}`.replace(/[-\s]+/g, "_").toLowerCase();

  const url = `https://caredge.com/${makeSlug}/${modelSlug}/depreciation?p=${price}&m=${miles}`;
  console.log(`[depreciation] fetching ${url} (varSuffix="${varSuffix}")`);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.error(`[depreciation] CarEdge returned ${res.status} for ${url}`);
      return NextResponse.json({ error: `CarEdge returned ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    console.log(`[depreciation] fetched ${html.length} bytes, searching for var data_${varSuffix}`);

    // Extract: var data_acura_integra = [{date:'0',price:1,...}, ...];
    const varRegex = new RegExp(`var\\s+data_${varSuffix}\\s*=\\s*(\\[.*?\\]);`, "s");
    const match = html.match(varRegex);

    if (!match) {
      console.error(`[depreciation] variable "data_${varSuffix}" not found in page HTML`);
      return NextResponse.json({ error: "Depreciation data not found on page" }, { status: 404 });
    }
    console.log(`[depreciation] found variable, raw length=${match[1].length}`);

    // CarEdge uses single-quoted keys — convert to valid JSON
    const jsonStr = match[1]
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":');

    const rows: { date: string; price: number; confidence: number; resale: number }[] = JSON.parse(jsonStr);

    // rows[0] is year 0 (new, price=1). We want years 1–10 residual fractions.
    const residuals = rows
      .filter((r) => parseInt(r.date) >= 1)
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .map((r) => r.price);

    console.log(`[depreciation] residuals (${residuals.length} years):`, residuals.map((r, i) => `Y${i+1}=${(r*100).toFixed(1)}%`).join(" "));
    return NextResponse.json({ residuals });
  } catch (err) {
    console.error("[depreciation] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch depreciation data" }, { status: 500 });
  }
}
