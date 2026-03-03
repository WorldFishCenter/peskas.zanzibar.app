export type Theme = 'light' | 'dark';

export interface TimeBreak {
  min: number;
  max: number;
  label: string;
}

export interface DataPoint {
  position: [number, number];
  avgTimeHours: number;
  totalVisits: number;
  avgSpeed: number;
  originalCells: number;
}

export interface GridMapProps {
  lang?: string;
}

export interface TimeRangeButtonProps {
  range: TimeBreak;
  index: number;
  isSelected: boolean;
  colorRange: number[][];
  theme: Theme;
  onToggle: (range: TimeBreak) => void;
}

export interface ChoroplethLegend {
  colors: [number, number, number][];
  metricLabel: string;
  minLabel: string;
  maxLabel: string;
}

export interface InfoPanelProps {
  theme: Theme;
  data: DataPoint[];
  colorRange: number[][];
  selectedRanges: TimeBreak[];
  onRangeToggle: (range: TimeBreak) => void;
  choroplethLegend?: ChoroplethLegend;
}
