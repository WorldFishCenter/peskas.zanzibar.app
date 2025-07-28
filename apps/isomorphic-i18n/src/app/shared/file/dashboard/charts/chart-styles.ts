// Shared chart styling configuration for consistency across the dashboard

export const CHART_STYLES = {
  // Grid styling
  grid: {
    strokeDasharray: "3 3",
    stroke: "#e5e7eb",
    strokeOpacity: 0.7,
    className: "dark:stroke-gray-700"
  },

  // Axis styling
  axis: {
    tick: {
      fontSize: 12,
      fill: "#64748b"
    },
    axisLine: {
      stroke: '#cbd5e1',
      strokeWidth: 1,
      className: 'dark:stroke-gray-700'
    },
    tickLine: {
      stroke: '#cbd5e1',
      className: 'dark:stroke-gray-700'
    }
  },

  // Tooltip styling
  tooltip: {
    wrapperStyle: { background: 'transparent' },
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '16px',
      minWidth: '200px'
    },
    darkContentStyle: {
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      color: '#f9fafb'
    }
  },

  // Legend styling
  legend: {
    wrapperStyle: { paddingTop: '10px' },
    iconType: "circle" as const,
    iconSize: 8
  },

  // Animation settings
  animation: {
    isAnimationActive: true,
    animationDuration: 1000,
    animationEasing: "ease-out" as const
  },

  // Chart margins
  margins: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 20
  },

  // Area chart specific styles
  area: {
    fillOpacity: 0.6,
    strokeWidth: 2
  },

  // Line chart specific styles
  line: {
    strokeWidth: 2,
    dot: { r: 4 },
    activeDot: { r: 6 }
  },

  // Bar chart specific styles
  bar: {
    radius: [0, 4, 4, 0],
    isAnimationActive: true,
    animationDuration: 1000,
    animationEasing: "ease-out" as const
  }
};

// Shared color palette for districts
export const DISTRICT_COLOR_PALETTE = [
  "#167288", "#8cdaec", "#b45248", "#d48c84", "#a89a49", 
  "#d6cfa2", "#3cb464", "#9bddb1", "#643c6a", "#836394", "#90a4ae"
];

// Shared metric configuration
export const SHARED_METRIC_CONFIG = {
  mean_effort: {
    label: "Effort",
    color: "#F28F3B",
    unit: "fishers/km²/day"
  },
  mean_cpue: {
    label: "Catch Rate",
    color: "#75ABBC",
    unit: "kg/fisher/day"
  },
  mean_rpue: {
    label: "Fisher Revenue", 
    color: "#4A90E2",
    unit: "KES/fisher/day"
  },
  mean_price_kg: {
    label: "Price per KG",
    color: "#9B59B6", 
    unit: "KES/kg"
  },
  total_catch_kg: {
    label: "Total Catch",
    color: "#E74C3C",
    unit: "kg"
  },
  total_value: {
    label: "Total Value",
    color: "#27AE60",
    unit: "KES"
  },
  n_trips: {
    label: "Number of Trips",
    color: "#F39C12",
    unit: "trips"
  },
  n_fishers: {
    label: "Number of Fishers",
    color: "#3498DB",
    unit: "fishers"
  },
  estimated_catch_tn: {
    label: "Estimated Catch",
    color: "#8E44AD",
    unit: "tonnes"
  }
};

// Utility function to get district color consistently
export const getDistrictColor = (districtName: string, index: number, districtColors: Record<string, string>) => {
  return districtColors[districtName] || DISTRICT_COLOR_PALETTE[index % DISTRICT_COLOR_PALETTE.length];
};

// Utility function to format chart titles
export const formatChartTitle = (metricKey: string, chartType: string) => {
  const metricConfig = SHARED_METRIC_CONFIG[metricKey as keyof typeof SHARED_METRIC_CONFIG];
  return `${metricConfig?.label || "Metric"} ${chartType}`;
}; 