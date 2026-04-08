export type VehicleCategory =
  | "small-suv"
  | "midsize-suv"
  | "large-suv"
  | "small-sedan"
  | "midsize-sedan"
  | "large-sedan"
  | "pickup"
  | "minivan"
  | "sports"
  | "luxury-suv"
  | "luxury-sedan"
  | "ev"
  | "hybrid";

/** Bankrate sample vehicle per category (as used in their methodology) */
export const CATEGORY_SAMPLE: Record<VehicleCategory, { make: string; model: string; year: number }> = {
  "small-suv":    { make: "Toyota",    model: "RAV4",     year: 2023 },
  "midsize-suv":  { make: "Honda",     model: "Pilot",    year: 2023 },
  "large-suv":    { make: "Buick",     model: "Enclave",  year: 2023 },
  "small-sedan":  { make: "Honda",     model: "Civic",    year: 2023 },
  "midsize-sedan":{ make: "Toyota",    model: "Camry",    year: 2023 },
  "large-sedan":  { make: "Dodge",     model: "Charger",  year: 2023 },
  "pickup":       { make: "Ford",      model: "F-150",    year: 2023 },
  "minivan":      { make: "Toyota",    model: "Sienna",   year: 2023 },
  "sports":       { make: "Chevrolet", model: "Corvette Stingray", year: 2023 },
  "luxury-suv":   { make: "Acura",     model: "RDX",      year: 2023 },
  "luxury-sedan": { make: "BMW",       model: "330i",     year: 2023 },
  "ev":           { make: "Chevrolet", model: "Bolt EUV", year: 2023 },
  "hybrid":       { make: "Toyota",    model: "Prius",    year: 2023 },
};

/** Maps "makeSlug/modelSlug" → VehicleCategory */
export const VEHICLE_CATEGORY_MAP: Record<string, VehicleCategory> = {
  // Acura
  "acura/integra":       "small-sedan",
  "acura/mdx":           "luxury-suv",
  "acura/rdx":           "luxury-suv",
  "acura/tlx":           "luxury-sedan",
  "acura/zdx":           "ev",

  // Alfa Romeo
  "alfa-romeo/giulia":   "luxury-sedan",
  "alfa-romeo/stelvio":  "luxury-suv",
  "alfa-romeo/tonale":   "luxury-suv",

  // Aston Martin
  "aston-martin/db12":   "sports",
  "aston-martin/dbx":    "luxury-suv",
  "aston-martin/vantage":"sports",

  // Audi
  "audi/a3":             "small-sedan",
  "audi/a4":             "midsize-sedan",
  "audi/a4 allroad":     "midsize-sedan",
  "audi/a5 cabriolet":   "sports",
  "audi/a5 coupe":       "sports",
  "audi/a5 sportback":   "midsize-sedan",
  "audi/a6":             "luxury-sedan",
  "audi/a6 allroad":     "luxury-sedan",
  "audi/a7 sportback":   "luxury-sedan",
  "audi/a8":             "luxury-sedan",
  "audi/e-tron gt":      "ev",
  "audi/q3":             "small-suv",
  "audi/q4 e-tron":      "ev",
  "audi/q5":             "luxury-suv",
  "audi/q7":             "large-suv",
  "audi/q8":             "large-suv",
  "audi/q8 e-tron":      "ev",
  "audi/rs 3 sedan":     "sports",
  "audi/rs 5 coupe":     "sports",
  "audi/rs 7 sportback": "sports",
  "audi/s3":             "sports",
  "audi/s4":             "sports",
  "audi/s5 coupe":       "sports",
  "audi/sq5":            "luxury-suv",
  "audi/sq7":            "luxury-suv",
  "audi/sq8":            "luxury-suv",

  // Bentley
  "bentley/bentayga":       "luxury-suv",
  "bentley/continental gt": "sports",
  "bentley/flying spur":    "luxury-sedan",

  // BMW
  "bmw/2 series":  "small-sedan",
  "bmw/3 series":  "luxury-sedan",
  "bmw/4 series":  "sports",
  "bmw/5 series":  "luxury-sedan",
  "bmw/7 series":  "luxury-sedan",
  "bmw/8 series":  "sports",
  "bmw/i4":        "ev",
  "bmw/i5":        "ev",
  "bmw/i7":        "ev",
  "bmw/ix":        "ev",
  "bmw/m2":        "sports",
  "bmw/m3":        "sports",
  "bmw/m4":        "sports",
  "bmw/m5":        "sports",
  "bmw/x1":        "small-suv",
  "bmw/x2":        "small-suv",
  "bmw/x3":        "luxury-suv",
  "bmw/x4":        "luxury-suv",
  "bmw/x5":        "luxury-suv",
  "bmw/x6":        "luxury-suv",
  "bmw/x7":        "large-suv",
  "bmw/z4":        "sports",

  // Buick
  "buick/enclave":   "large-suv",
  "buick/encore gx": "small-suv",
  "buick/envision":  "midsize-suv",
  "buick/envista":   "small-suv",

  // Cadillac
  "cadillac/ct4":          "luxury-sedan",
  "cadillac/ct5":          "luxury-sedan",
  "cadillac/escalade":     "large-suv",
  "cadillac/escalade esv": "large-suv",
  "cadillac/lyriq":        "ev",
  "cadillac/optiq":        "luxury-suv",
  "cadillac/xt4":          "luxury-suv",
  "cadillac/xt5":          "luxury-suv",
  "cadillac/xt6":          "luxury-suv",

  // Chevrolet
  "chevrolet/blazer":         "midsize-suv",
  "chevrolet/blazer ev":      "ev",
  "chevrolet/camaro":         "sports",
  "chevrolet/colorado":       "pickup",
  "chevrolet/corvette":       "sports",
  "chevrolet/equinox":        "small-suv",
  "chevrolet/equinox ev":     "ev",
  "chevrolet/malibu":         "midsize-sedan",
  "chevrolet/silverado 1500": "pickup",
  "chevrolet/silverado 2500hd":"pickup",
  "chevrolet/silverado 3500hd":"pickup",
  "chevrolet/suburban":       "large-suv",
  "chevrolet/tahoe":          "large-suv",
  "chevrolet/trailblazer":    "small-suv",
  "chevrolet/traverse":       "midsize-suv",
  "chevrolet/trax":           "small-suv",

  // Chrysler
  "chrysler/pacifica": "minivan",
  "chrysler/voyager":  "minivan",

  // Dodge
  "dodge/durango": "large-suv",
  "dodge/hornet":  "small-suv",

  // FIAT
  "fiat/500e": "ev",

  // Ford
  "ford/bronco":          "midsize-suv",
  "ford/bronco sport":    "small-suv",
  "ford/edge":            "midsize-suv",
  "ford/escape":          "small-suv",
  "ford/expedition":      "large-suv",
  "ford/expedition max":  "large-suv",
  "ford/explorer":        "midsize-suv",
  "ford/f-150":           "pickup",
  "ford/f-150 lightning": "ev",
  "ford/f-250":           "pickup",
  "ford/f-350":           "pickup",
  "ford/maverick":        "pickup",
  "ford/mustang":         "sports",
  "ford/mustang mach-e":  "ev",
  "ford/ranger":          "pickup",

  // Genesis
  "genesis/g70":  "luxury-sedan",
  "genesis/g80":  "luxury-sedan",
  "genesis/g90":  "luxury-sedan",
  "genesis/gv60": "ev",
  "genesis/gv70": "luxury-suv",
  "genesis/gv80": "luxury-suv",

  // GMC
  "gmc/acadia":       "midsize-suv",
  "gmc/canyon":       "pickup",
  "gmc/hummer ev":    "ev",
  "gmc/sierra 1500":  "pickup",
  "gmc/sierra 2500hd":"pickup",
  "gmc/sierra 3500hd":"pickup",
  "gmc/terrain":      "small-suv",
  "gmc/yukon":        "large-suv",
  "gmc/yukon xl":     "large-suv",

  // Honda
  "honda/accord":          "midsize-sedan",
  "honda/civic":           "small-sedan",
  "honda/civic hatchback": "small-sedan",
  "honda/civic si":        "small-sedan",
  "honda/cr-v":            "small-suv",
  "honda/hr-v":            "small-suv",
  "honda/odyssey":         "minivan",
  "honda/passport":        "midsize-suv",
  "honda/pilot":           "midsize-suv",
  "honda/prologue":        "ev",
  "honda/ridgeline":       "pickup",

  // Hyundai
  "hyundai/elantra":       "small-sedan",
  "hyundai/ioniq 5":       "ev",
  "hyundai/ioniq 6":       "ev",
  "hyundai/kona":          "small-suv",
  "hyundai/kona electric": "ev",
  "hyundai/palisade":      "midsize-suv",
  "hyundai/santa cruz":    "pickup",
  "hyundai/santa fe":      "midsize-suv",
  "hyundai/sonata":        "midsize-sedan",
  "hyundai/tucson":        "small-suv",
  "hyundai/venue":         "small-suv",

  // INFINITI
  "infiniti/qx50": "luxury-suv",
  "infiniti/qx55": "luxury-suv",
  "infiniti/qx60": "luxury-suv",
  "infiniti/qx80": "large-suv",

  // Jaguar
  "jaguar/e-pace": "luxury-suv",
  "jaguar/f-pace": "luxury-suv",
  "jaguar/f-type": "sports",
  "jaguar/i-pace": "ev",
  "jaguar/xf":     "luxury-sedan",

  // Jeep
  "jeep/compass":          "small-suv",
  "jeep/gladiator":        "pickup",
  "jeep/grand cherokee":   "midsize-suv",
  "jeep/grand cherokee l": "large-suv",
  "jeep/grand wagoneer":   "large-suv",
  "jeep/wagoneer":         "large-suv",
  "jeep/wrangler":         "small-suv",
  "jeep/wrangler 4xe":     "hybrid",

  // Kia
  "kia/carnival":  "minivan",
  "kia/ev6":       "ev",
  "kia/ev9":       "ev",
  "kia/forte":     "small-sedan",
  "kia/k5":        "midsize-sedan",
  "kia/niro":      "hybrid",
  "kia/seltos":    "small-suv",
  "kia/sorento":   "midsize-suv",
  "kia/soul":      "small-suv",
  "kia/sportage":  "small-suv",
  "kia/telluride": "midsize-suv",

  // Land Rover
  "land rover/defender":           "midsize-suv",
  "land rover/discovery":          "large-suv",
  "land rover/discovery sport":    "luxury-suv",
  "land rover/range rover":        "luxury-suv",
  "land rover/range rover evoque": "luxury-suv",
  "land rover/range rover sport":  "luxury-suv",
  "land rover/range rover velar":  "luxury-suv",

  // Lexus
  "lexus/es 250":  "luxury-sedan",
  "lexus/es 300h": "hybrid",
  "lexus/es 350":  "luxury-sedan",
  "lexus/gx 550":  "luxury-suv",
  "lexus/is 300":  "luxury-sedan",
  "lexus/is 350":  "luxury-sedan",
  "lexus/is 500":  "sports",
  "lexus/lc 500":  "sports",
  "lexus/ls 500":  "luxury-sedan",
  "lexus/lx 600":  "luxury-suv",
  "lexus/nx 250":  "luxury-suv",
  "lexus/nx 350":  "luxury-suv",
  "lexus/nx 350h": "hybrid",
  "lexus/rc 300":  "sports",
  "lexus/rc 350":  "sports",
  "lexus/rx 350":  "luxury-suv",
  "lexus/rx 350h": "hybrid",
  "lexus/rx 500h": "hybrid",
  "lexus/rz":      "ev",
  "lexus/tx 350":  "luxury-suv",
  "lexus/tx 500h": "hybrid",
  "lexus/ux 250h": "hybrid",

  // Lincoln
  "lincoln/aviator":  "luxury-suv",
  "lincoln/corsair":  "luxury-suv",
  "lincoln/nautilus": "luxury-suv",
  "lincoln/navigator":"large-suv",

  // Maserati
  "maserati/ghibli":      "luxury-sedan",
  "maserati/grancabrio":  "sports",
  "maserati/granturismo": "sports",
  "maserati/grecale":     "luxury-suv",
  "maserati/levante":     "luxury-suv",
  "maserati/mc20":        "sports",
  "maserati/quattroporte":"luxury-sedan",

  // Mazda
  "mazda/cx-30":            "small-suv",
  "mazda/cx-5":             "small-suv",
  "mazda/cx-50":            "small-suv",
  "mazda/cx-70":            "midsize-suv",
  "mazda/cx-90":            "large-suv",
  "mazda/mazda3":           "small-sedan",
  "mazda/mazda3 hatchback": "small-sedan",

  // Mercedes-Benz
  "mercedes-benz/amg gt":    "sports",
  "mercedes-benz/cla 250":   "small-sedan",
  "mercedes-benz/cle 300":   "sports",
  "mercedes-benz/cle 450":   "sports",
  "mercedes-benz/e 350":     "luxury-sedan",
  "mercedes-benz/e 450":     "luxury-sedan",
  "mercedes-benz/eqb 250":   "ev",
  "mercedes-benz/eqe 350":   "ev",
  "mercedes-benz/eqs 450":   "ev",
  "mercedes-benz/g 550":     "luxury-suv",
  "mercedes-benz/gla 250":   "small-suv",
  "mercedes-benz/glb 250":   "small-suv",
  "mercedes-benz/glc 300":   "luxury-suv",
  "mercedes-benz/gle 350":   "luxury-suv",
  "mercedes-benz/gle 450":   "luxury-suv",
  "mercedes-benz/gls 450":   "large-suv",
  "mercedes-benz/s 500":     "luxury-sedan",
  "mercedes-benz/s 580":     "luxury-sedan",
  "mercedes-benz/sprinter 2500": "minivan",

  // MINI
  "mini/convertible": "small-sedan",
  "mini/countryman":  "small-suv",
  "mini/hardtop":     "small-sedan",

  // Mitsubishi
  "mitsubishi/eclipse cross":   "small-suv",
  "mitsubishi/mirage":          "small-sedan",
  "mitsubishi/outlander":       "midsize-suv",
  "mitsubishi/outlander sport": "small-suv",

  // Nissan
  "nissan/altima":   "midsize-sedan",
  "nissan/ariya":    "ev",
  "nissan/armada":   "large-suv",
  "nissan/frontier": "pickup",
  "nissan/kicks":    "small-suv",
  "nissan/leaf":     "ev",
  "nissan/murano":   "midsize-suv",
  "nissan/pathfinder":"midsize-suv",
  "nissan/rogue":    "small-suv",
  "nissan/sentra":   "small-sedan",
  "nissan/titan":    "pickup",
  "nissan/versa":    "small-sedan",
  "nissan/z":        "sports",

  // RAM
  "ram/1500":           "pickup",
  "ram/2500":           "pickup",
  "ram/3500":           "pickup",
  "ram/promaster 1500": "minivan",
  "ram/promaster 2500": "minivan",
  "ram/promaster 3500": "minivan",

  // Subaru
  "subaru/ascent":    "midsize-suv",
  "subaru/brz":       "sports",
  "subaru/crosstrek": "small-suv",
  "subaru/forester":  "small-suv",
  "subaru/impreza":   "small-sedan",
  "subaru/legacy":    "midsize-sedan",
  "subaru/outback":   "midsize-suv",
  "subaru/solterra":  "ev",
  "subaru/wrx":       "sports",

  // Tesla
  "tesla/cybertruck": "ev",
  "tesla/model 3":    "ev",
  "tesla/model s":    "ev",
  "tesla/model x":    "ev",
  "tesla/model y":    "ev",

  // Toyota
  "toyota/4runner":          "midsize-suv",
  "toyota/bz4x":             "ev",
  "toyota/camry":            "midsize-sedan",
  "toyota/corolla":          "small-sedan",
  "toyota/corolla cross":    "small-suv",
  "toyota/corolla hatchback":"small-sedan",
  "toyota/crown":            "midsize-sedan",
  "toyota/gr86":             "sports",
  "toyota/highlander":       "midsize-suv",
  "toyota/land cruiser":     "large-suv",
  "toyota/prius":            "hybrid",
  "toyota/prius prime":      "hybrid",
  "toyota/rav4":             "small-suv",
  "toyota/rav4 prime":       "hybrid",
  "toyota/sequoia":          "large-suv",
  "toyota/sienna":           "minivan",
  "toyota/tacoma":           "pickup",
  "toyota/tundra":           "pickup",
  "toyota/venza":            "hybrid",

  // Volkswagen
  "volkswagen/atlas":             "midsize-suv",
  "volkswagen/atlas cross sport": "midsize-suv",
  "volkswagen/golf":              "small-sedan",
  "volkswagen/id.4":              "ev",
  "volkswagen/id.buzz":           "minivan",
  "volkswagen/jetta":             "small-sedan",
  "volkswagen/taos":              "small-suv",
  "volkswagen/tiguan":            "small-suv",

  // Volvo
  "volvo/c40 recharge":    "ev",
  "volvo/ex30":            "ev",
  "volvo/ex90":            "ev",
  "volvo/s60":             "luxury-sedan",
  "volvo/s90":             "luxury-sedan",
  "volvo/v60 cross country":"midsize-sedan",
  "volvo/xc40":            "luxury-suv",
  "volvo/xc40 recharge":   "ev",
  "volvo/xc60":            "luxury-suv",
  "volvo/xc90":            "luxury-suv",
};

export function getCategoryForVehicle(makeSlug: string, modelSlug: string): VehicleCategory {
  return VEHICLE_CATEGORY_MAP[`${makeSlug}/${modelSlug}`] ?? "midsize-sedan";
}
