/**
 * Annual maintenance cost by make slug, split into two age buckets.
 * Source: Consumer Reports 5-year totals for years 1-5 and years 6-10.
 * y1to5 = total_1_5 / 5, y6to10 = total_6_10 / 5
 */
export const MAKE_MAINTENANCE: Record<string, { y1to5: number; y6to10: number }> = {
  "buick":          { y1to5:  232, y6to10: 1052 },
  "toyota":         { y1to5:  250, y6to10: 1190 },
  "mazda":          { y1to5:  272, y6to10: 1110 },
  "hyundai":        { y1to5:  280, y6to10: 1160 },
  "honda":          { y1to5:  290, y6to10: 1250 },
  "kia":            { y1to5:  296, y6to10: 1256 },
  "subaru":         { y1to5:  302, y6to10: 1370 },
  "chevrolet":      { y1to5:  304, y6to10: 1286 },
  "nissan":         { y1to5:  310, y6to10: 1300 },
  "ford":           { y1to5:  316, y6to10: 1396 },
  "acura":          { y1to5:  330, y6to10: 1426 },
  "lincoln":        { y1to5:  332, y6to10: 1410 },
  "gmc":            { y1to5:  340, y6to10: 1480 },
  "volkswagen":     { y1to5:  342, y6to10: 1576 },
  "mitsubishi":     { y1to5:  360, y6to10: 1430 },
  "genesis":        { y1to5:  360, y6to10: 1120 }, // estimated = Lexus
  "lexus":          { y1to5:  360, y6to10: 1120 },
  "tesla":          { y1to5:  368, y6to10: 1176 },
  "cadillac":       { y1to5:  370, y6to10: 1620 },
  "ram":            { y1to5:  376, y6to10: 1666 },
  "jeep":           { y1to5:  390, y6to10: 1666 },
  "chrysler":       { y1to5:  293, y6to10: 1429 },
  "dodge":          { y1to5:  293, y6to10: 1429 }, // same parent/tier as Chrysler
  "mini":           { y1to5:  400, y6to10: 1840 },
  "infiniti":       { y1to5:  404, y6to10: 1916 },
  "volvo":          { y1to5:  408, y6to10: 2000 },
  "bmw":            { y1to5:  410, y6to10: 2270 },
  "fiat":           { y1to5:  410, y6to10: 2270 }, // estimated = BMW
  "audi":           { y1to5:  430, y6to10: 2480 },
  "porsche":        { y1to5:  800, y6to10: 3000 },
  "land rover":     { y1to5: 1112, y6to10: 3840 },
  "mercedes-benz":  { y1to5:  666, y6to10: 2526 },
  "alfa-romeo":     { y1to5: 1112, y6to10: 3840 }, // estimated = LR
  "aston-martin":   { y1to5: 1112, y6to10: 3840 }, // estimated = LR
  "bentley":        { y1to5: 1112, y6to10: 3840 }, // estimated = LR
  "jaguar":         { y1to5: 1112, y6to10: 3840 }, // estimated = LR
  "maserati":       { y1to5: 1112, y6to10: 3840 }, // estimated = LR
};

export const DEFAULT_MAINTENANCE = { y1to5: 290, y6to10: 1250 }; // fallback ≈ Honda
