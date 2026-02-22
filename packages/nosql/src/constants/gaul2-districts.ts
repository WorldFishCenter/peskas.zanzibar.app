/**
 * Official FAO GAUL2 adm2 district names for Zanzibar (single source of truth).
 * Used for summary collections (monthly_summaries, districts_summaries, taxa_summaries, gear_summaries).
 */
export const GAUL2_DISTRICT_NAMES = [
  "Chake Chake",
  "Kaskazini A",
  "Kaskazini B",
  "Kati",
  "Kusini",
  "Magharibi A",
  "Magharibi B",
  "Micheweni",
  "Mjini",
  "Mkoani",
  "Wete",
] as const;

export type GAUL2DistrictName = (typeof GAUL2_DISTRICT_NAMES)[number];

/** Map GAUL2 adm2 name to island region (Unguja vs Pemba). */
export const GAUL2_TO_REGION: Record<string, "Unguja" | "Pemba"> = {
  "Chake Chake": "Pemba",
  "Kaskazini A": "Unguja",
  "Kaskazini B": "Unguja",
  "Kati": "Unguja",
  "Kusini": "Unguja",
  "Magharibi A": "Unguja",
  "Magharibi B": "Unguja",
  "Micheweni": "Pemba",
  "Mjini": "Unguja",
  "Mkoani": "Pemba",
  "Wete": "Pemba",
};
