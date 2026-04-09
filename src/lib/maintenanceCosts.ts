/**
 * Annual base maintenance cost by make slug, derived from Consumer Reports 5-year totals.
 * Source: Consumer Reports brand maintenance rankings (5-yr total ÷ 5).
 */
export const MAKE_MAINTENANCE: Record<string, number> = {
  "buick":          1052,
  "lincoln":        1124,
  "toyota":         1190,
  "hyundai":        1190,
  "tesla":          1225,
  "nissan":         1254,
  "chevrolet":      1255,
  "ford":           1270,
  "mazda":          1284,
  "mitsubishi":     1284,
  "kia":            1310,
  "honda":          1364,
  "chrysler":       1429,
  "dodge":          1429, // CR lists Chrysler; Dodge same parent/tier
  "jeep":           1439,
  "genesis":        1480, // CR not listed; estimated = Lexus
  "lexus":          1480,
  "cadillac":       1506,
  "volkswagen":     1509,
  "acura":          1545,
  "gmc":            1545,
  "subaru":         1584,
  "ram":            1730,
  "infiniti":       2004,
  "mini":           2040,
  "volvo":          2066,
  "bmw":            2200,
  "fiat":           2200, // CR not listed; estimated = BMW
  "audi":           2270,
  "mercedes-benz":  2526,
  "alfa-romeo":     2526, // CR not listed; estimated = Mercedes-Benz
  "aston-martin":   2526, // CR not listed; estimated = Mercedes-Benz
  "bentley":        2526, // CR not listed; estimated = Mercedes-Benz
  "jaguar":         2526, // CR not listed; estimated = Mercedes-Benz
  "land rover":     2526, // CR not listed; estimated = Mercedes-Benz
  "maserati":       2526, // CR not listed; estimated = Mercedes-Benz
  "porsche":        3580, // CR 5-yr $17,900
};

export const DEFAULT_MAINTENANCE = 1400; // fallback for unlisted makes
