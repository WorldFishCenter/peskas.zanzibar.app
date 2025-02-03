import WidgetCard from "@components/cards/widget-card";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";

import { bmusAtom } from "@/app/components/filter-selector";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import { useMedia } from "@hooks/use-media";
import SimpleBar from "@ui/simplebar";
import cn from "@utils/class-names";
import { ActionIcon, Popover } from "rizzui";
import { useSession } from "next-auth/react";


type MetricKey = "mean_effort" | "mean_cpue" | "mean_cpua" | "mean_rpue" | "mean_rpua";

interface ChartDataPoint {
  date: number;
  [key: string]: number | undefined;
}

interface ApiDataPoint {
  date: string;
  landing_site: string;
  mean_effort: number;
  mean_cpue: number;
  mean_cpua: number;
  mean_rpue: number;
  mean_rpua: number;
}

interface MetricOption {
  value: MetricKey;
  label: string;
  unit: string;
  category: "catch" | "revenue";
}

interface CatchMetricsChartProps {
  className?: string;
  lang?: string;
  selectedMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
  bmu?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
    dataKey: string | number;
    color: string;
  }>;
  label?: string | number;
  separator?: string;
  selectedMetric: MetricKey;
  selectedMetricOption: MetricOption | undefined;
}

interface VisibilityState {
  [key: string]: {
    opacity: number;
  };
}

type TickProps = {
  x?: number;
  y?: number;
  payload?: {
    value: number;
  };
};

const METRIC_OPTIONS: MetricOption[] = [
  {
    value: "mean_effort",
    label: "Effort",
    unit: "fishers/km²/day",
    category: "catch",
  },
  {
    value: "mean_cpue",
    label: "Catch Rate",
    unit: "kg/fisher/day",
    category: "catch",
  },
  {
    value: "mean_cpua",
    label: "Catch Density",
    unit: "kg/km²/day",
    category: "catch",
  },
  {
    value: "mean_rpue",
    label: "Fisher Revenue",
    unit: "KES/fisher/day",
    category: "revenue",
  },
  {
    value: "mean_rpua",
    label: "Area Revenue",
    unit: "KES/km²/day",
    category: "revenue",
  },
];

const generateColor = (index: number): string => {
  const colors = [
    "#0c526e",
    "#fc3468",
    "#f09609",
    "#2563eb",
    "#16a34a",
    "#9333ea",
    "#ea580c",
    "#0891b2",
  ];
  return colors[index % colors.length];
};

const LoadingState = () => {
  return (
    <WidgetCard title="Catch Metrics">
      <div className="h-96 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading chart...</span>
        </div>
      </div>
    </WidgetCard>
  );
};

const MetricSelector = ({
  selectedMetric,
  onMetricChange,
  selectedMetricOption,
}: {
  selectedMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
  selectedMetricOption: MetricOption | undefined;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("common");

  const groupedMetrics = {
    catch: METRIC_OPTIONS.filter((m) => m.category === "catch"),
    revenue: METRIC_OPTIONS.filter((m) => m.category === "revenue"),
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Popover isOpen={isOpen} setIsOpen={setIsOpen} placement="bottom-end">
          <Popover.Trigger>
            <ActionIcon
              variant="text"
              className={cn(
                "relative min-w-[180px] h-auto px-4 py-2 rounded-full flex items-center justify-between",
                selectedMetric === "mean_rpue" || selectedMetric === "mean_rpua"
                  ? "bg-amber-50 text-amber-900"
                  : "bg-blue-50 text-blue-900"
              )}
            >
              <span className="text-sm font-medium">
                {selectedMetricOption?.label}
              </span>
              <svg
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </ActionIcon>
          </Popover.Trigger>{" "}
          <Popover.Content
            className="w-[280px] p-2 bg-white/75 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 gap-2">
              {/* Catch Metrics Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {t("text-metrics-catch")}
                  </span>
                </div>
                <div className="space-y-1 pl-4">
                  {groupedMetrics.catch.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onMetricChange(option.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm transition duration-200 rounded-md flex items-center justify-between",
                        selectedMetric === option.value
                          ? "bg-blue-50/90 text-blue-900"
                          : "text-gray-600 hover:bg-gray-50/90"
                      )}
                    >
                      <span>{t(`text-metrics-${option.label.toLowerCase().replace(/ /g, "-")}`)}</span>
                      <span className="text-xs text-gray-500">
                        {option.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 my-2" />

              {/* Revenue Metrics Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {t("text-metrics-revenue")}
                  </span>
                </div>
                <div className="space-y-1 pl-4">
                  {groupedMetrics.revenue.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onMetricChange(option.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm transition duration-200 rounded-md flex items-center justify-between",
                        selectedMetric === option.value
                          ? "bg-amber-50 text-amber-900"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span>{t(`text-metrics-${option.label.toLowerCase().replace(/ /g, "-")}`)}</span>
                      <span className="text-xs text-gray-500">
                        {option.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Popover.Content>
        </Popover>
      </div>
    </div>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
  selectedMetric,
}: TooltipProps) => {
  // Removed selectedMetricOption from props
  if (active && payload?.length) {
    const date = new Date(label as number);

    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-sm font-medium text-gray-600 mb-2">
          {date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm">
              <span className="font-medium">
                {entry.name || entry.dataKey}:
              </span>{" "}
              {entry.value?.toFixed(1) ?? "N/A"} {/* Removed the unit here */}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
function CustomYAxisTick({ x = 0, y = 0, payload = { value: 0 } }: TickProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        className="text-xs fill-gray-500"
      >
        {payload.value.toFixed(1)}
      </text>
    </g>
  );
}

const calculateTrendline = (data: { date: number; difference: number }[]) => {
  if (data.length === 0) return { slope: 0, intercept: 0 };

  // Calculate means
  const meanX = data.reduce((sum, point) => sum + point.date, 0) / data.length;
  const meanY = data.reduce((sum, point) => sum + point.difference, 0) / data.length;

  // Calculate slope using covariance and variance
  const numerator = data.reduce((sum, point) => {
    return sum + (point.date - meanX) * (point.difference - meanY);
  }, 0);

  const denominator = data.reduce((sum, point) => {
    return sum + Math.pow(point.date - meanX, 2);
  }, 0);

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate monthly slope for display
  const msPerMonth = 30 * 24 * 60 * 60 * 1000;
  const monthlySlope = slope * msPerMonth;

  return { 
    slope,           // For the visualization
    intercept,       // For the visualization
    displaySlope: monthlySlope  // For display purposes
  };
};

export default function CatchMetricsChart({
  className,
  lang,
  selectedMetric,
  onMetricChange,
  bmu,
}: CatchMetricsChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [fiveYearMarks, setFiveYearMarks] = useState<number[]>([]);
  const [visibilityState, setVisibilityState] = useState<VisibilityState>({});
  const [siteColors, setSiteColors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('standard');

  const isTablet = useMedia("(max-width: 800px)", false);
  const { t } = useTranslation("common");
  const [bmus] = useAtom(bmusAtom);
  const { data: session } = useSession();

  // Determine if the user is part of the CIA group
  const isCiaUser = session?.user?.groups?.some((group: { name: string }) => group.name === 'CIA');

  const { data: monthlyData } = api.aggregatedCatch.monthly.useQuery({ bmus });

  const handleLegendClick = (site: string) => {
    setVisibilityState((prev) => ({
      ...prev,
      [site]: {
        opacity: prev[site]?.opacity === 1 ? 0.2 : 1,
      },
    }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (!monthlyData) return;

    try {
      const uniqueSites = Array.from(
        new Set(monthlyData.map((item: ApiDataPoint) => item.landing_site))
      );

      const newSiteColors = uniqueSites.reduce<Record<string, string>>(
        (acc, site, index) => ({
          ...acc,
          [site as string]: generateColor(index),
        }),
        {}
      );
      setSiteColors(newSiteColors);

      // Set visibility state based on user's BMU
      setVisibilityState(
        uniqueSites.reduce<VisibilityState>(
          (acc, site) => ({
            ...acc,
            [site as string]: { opacity: site === bmu ? 1 : 0.2 },
          }),
          {}
        )
      );

      const groupedData = monthlyData.reduce<Record<string, ChartDataPoint>>(
        (acc, item: ApiDataPoint) => {
          const date = new Date(item.date).getTime();
          if (!acc[date]) {
            acc[date] = {
              date,
              ...uniqueSites.reduce(
                (sites, site) => ({ ...sites, [site]: undefined }),
                {}
              ),
            };
          }
          acc[date][item.landing_site] = item[selectedMetric];
          return acc;
        },
        {}
      );

      const processedData = Object.values(groupedData).sort(
        (a, b) => a.date - b.date
      );

      const allYears = processedData.map((item: ChartDataPoint) =>
        new Date(item.date).getFullYear()
      );
      const minYear = Math.min(...allYears);
      const maxYear = Math.max(...allYears);
      const startYear = Math.floor(minYear / 5) * 5;
      const marks: number[] = [];

      for (let year = startYear; year <= maxYear; year += 5) {
        marks.push(new Date(`${year}-01-01`).getTime());
      }

      setFiveYearMarks(marks);
      setChartData(processedData);
    } catch (error) {
      console.error("Error processing data:", error);
    } finally {
      setLoading(false);
    }
  }, [monthlyData, selectedMetric, bmu]);

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        {payload?.map((entry: any) => (
          <div
            key={entry.value}
            className="flex items-center gap-2 cursor-pointer select-none transition-all duration-200"
            onClick={() => handleLegendClick(entry.value)}
            style={{ opacity: visibilityState[entry.value]?.opacity }}
          >
            <div
              className="w-3 h-3 rounded-full transition-all duration-200"
              style={{
                backgroundColor: entry.color,
              }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const calculateDifferenceData = (data: ChartDataPoint[]) => {
    if (!bmu) return [];
    return data.map((item) => {
      const userValue = item[bmu] || 0;
      const otherBMUs = Object.keys(item).filter((key) => key !== "date" && key !== bmu);
      const otherAverage =
        otherBMUs.reduce((sum, key) => sum + (item[key] || 0), 0) / otherBMUs.length;
      return {
        date: item.date,
        difference: userValue - otherAverage,
      };
    });
  };

  const differenceData = calculateDifferenceData(chartData);

  console.log("Difference Data:", differenceData);

  const trendline = calculateTrendline(differenceData);

  // Create trendline data separately
  const trendlineData = differenceData.map((point) => {
    const trendValue = trendline.slope * point.date + trendline.intercept;
    return {
      date: point.date,
      difference: point.difference,
      trendline: trendValue
    };
  });

  if (loading) return <LoadingState />;
  if (!chartData || chartData.length === 0) {
    return (
      <WidgetCard title="Catch Metrics">
        <div className="h-96 w-full flex items-center justify-center">
          <span className="text-sm text-gray-500">No data available</span>
        </div>
      </WidgetCard>
    );
  }

  const selectedMetricOption = METRIC_OPTIONS.find(
    (m) => m.value === selectedMetric
  );


  return (
    <WidgetCard
      title={
        <div className="flex items-center justify-between w-full">
          <MetricSelector
            selectedMetric={selectedMetric}
            onMetricChange={onMetricChange}
            selectedMetricOption={selectedMetricOption}
          />
          {!isCiaUser && (
            <div className="flex flex-wrap justify-end space-x-2">
              <button
                className={`px-3 py-1 text-sm ${activeTab === 'standard' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} rounded shadow-sm transition duration-200 hover:bg-blue-600`}
                onClick={() => handleTabChange('standard')}
              >
                Standard
              </button>
              <button
                className={`px-3 py-1 text-sm ${activeTab === 'differenced' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} rounded shadow-sm transition duration-200 hover:bg-blue-600`}
                onClick={() => handleTabChange('differenced')}
              >
                Differenced
              </button>
            </div>
          )}
        </div>
      }
      className={className}
    >
      {activeTab === 'standard' && (
        <SimpleBar>
          <div className="h-96 w-full pt-9">
            <ResponsiveContainer
              width="100%"
              height="100%"
              {...(isTablet && { minWidth: "700px" })}
            >
              <AreaChart
                data={chartData}
                margin={{
                  left: 32,
                  right: 16,
                  bottom: 20,
                  top: 10,
                }}
                className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
              >
                <defs>
                  {Object.entries(siteColors).map(([site, color]) => (
                    <linearGradient
                      key={site}
                      id={`${site}_gradient`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.75} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                <XAxis
                  dataKey="date"
                  scale="time"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(unixTime) => {
                    if (fiveYearMarks.includes(unixTime)) {
                      return new Date(unixTime).getFullYear().toString();
                    }
                    return "";
                  }}
                  ticks={fiveYearMarks}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={CustomYAxisTick}
                  width={60}
                  label={{
                    value: selectedMetricOption?.unit,
                    angle: -90,
                    position: "insideLeft",
                    offset: -20,
                    style: {
                      fontSize: 14,
                      fill: "#666666",
                      textAnchor: "middle",
                    },
                  }}
                />
                <Tooltip
                  content={(props: any) => (
                    <CustomTooltip {...props} selectedMetric={selectedMetric} />
                  )}
                />
                <Legend content={CustomLegend} />
                {Object.entries(siteColors).map(([site, color]) => (
                  <Area
                    key={site}
                    type="monotone"
                    dataKey={site}
                    name={site}
                    stroke={color}
                    strokeWidth={2}
                    fillOpacity={visibilityState[site]?.opacity ?? 1}
                    strokeOpacity={visibilityState[site]?.opacity ?? 1}
                    fill={`url(#${site}_gradient)`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SimpleBar>
      )}
      {activeTab === 'differenced' && (
        <SimpleBar>
          <div className="h-96 w-full pt-9">
            <ResponsiveContainer
              width="100%"
              height="100%"
              {...(isTablet && { minWidth: "700px" })}
            >
              <AreaChart
                data={trendlineData}
                margin={{
                  left: 32,
                  right: 16,
                  bottom: 20,
                  top: 10,
                }}
                className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
              >
                <defs>
                  <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FC766A" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#FC766A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                <XAxis
                  dataKey="date"
                  scale="time"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(unixTime) => {
                    if (fiveYearMarks.includes(unixTime)) {
                      return new Date(unixTime).getFullYear().toString();
                    }
                    return "";
                  }}
                  ticks={fiveYearMarks}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={CustomYAxisTick}
                  width={60}
                  domain={['auto', 'auto']}
                  label={{
                    value: `Difference (${selectedMetricOption?.unit})`,
                    angle: -90,
                    position: 'insideLeft',
                    offset: -20,
                    style: {
                      fontSize: 14,
                      fill: '#666666',
                      textAnchor: 'middle',
                    },
                  }}
                />
                <Tooltip
                  content={(props: any) => (
                    <CustomTooltip {...props} selectedMetric={selectedMetric} />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="difference"
                  stroke="#5B84B1"
                  strokeWidth={2}
                  fillOpacity={0.75}
                  fill="url(#colorDiff)"
                />
                <Area
                  type="monotone"
                  dataKey="trendline"
                  stroke="#FF0000"
                  strokeWidth={3}
                  fillOpacity={0}
                  isAnimationActive={false}
                  name="Trend"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <span className="text-sm font-medium">
              Trendline Slope:{' '}
              <span style={{ 
                color: (trendline.displaySlope ?? 0) > 0 ? '#16a34a' : '#dc2626'
              }}>
                {(trendline.displaySlope ?? 0).toFixed(3)} per month
              </span>
            </span>
          </div>
        </SimpleBar>
      )}
    </WidgetCard>
  );
}
