import { TIME_BREAKS } from '@/app/constants/mapConfig';

// Sequential Blues palette (light → dark), used for choropleth fill
export const CHOROPLETH_COLORS: [number, number, number][] = [
  [247, 251, 255],
  [198, 219, 239],
  [107, 174, 214],
  [33, 113, 181],
  [8, 69, 148],
  [8, 37, 82],
];

export function interpolateChoroplethColor(
  value: number,
  min: number,
  max: number
): [number, number, number, number] {
  if (min === max) return [...CHOROPLETH_COLORS[2], 180] as [number, number, number, number];
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const scaled = t * (CHOROPLETH_COLORS.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(lo + 1, CHOROPLETH_COLORS.length - 1);
  const frac = scaled - lo;
  const r = Math.round(CHOROPLETH_COLORS[lo][0] * (1 - frac) + CHOROPLETH_COLORS[hi][0] * frac);
  const g = Math.round(CHOROPLETH_COLORS[lo][1] * (1 - frac) + CHOROPLETH_COLORS[hi][1] * frac);
  const b = Math.round(CHOROPLETH_COLORS[lo][2] * (1 - frac) + CHOROPLETH_COLORS[hi][2] * frac);
  return [r, g, b, 180];
}

// Translation-key lookup for each metric (mirrors METRICS in district-summary-bar.tsx)
export const METRIC_LABEL_KEYS: Record<string, string> = {
  mean_cpue: 'metric-mean_cpue-title',
  mean_rpue: 'metric-mean_rpue-title',
  n_fishers: 'metric-n_fishers-title',
  n_submissions: 'metric-n_submissions-title',
  trip_duration_hrs: 'metric-trip_duration_hrs-title',
  mean_price_kg: 'metric-mean_price_kg-title',
  estimated_revenue: 'metric-estimated_revenue-title',
  estimated_catch_tn: 'metric-estimated_catch_tn-title',
};

// Mapbox style URLs
export const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
};

// Maps an avgTimeHours value to a COLOR_RANGE index (used for GridLayer coloring)
export function getColorForValue(value: number): number {
  for (let i = TIME_BREAKS.length - 1; i >= 0; i--) {
    const range = TIME_BREAKS[i];
    if (value >= range.min && (range.max === Infinity ? true : value < range.max)) {
      return i;
    }
  }
  return 0;
}
