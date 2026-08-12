"use client";

import { useMemo } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useAtom } from "jotai";
import WidgetCard from "@components/cards/widget-card";

import { api } from "@/trpc/react";
import { districtsAtom } from "@/app/components/filter-selector";
import { selectedTimeRangeAtom } from "@/app/components/time-range-selector";
import { useTranslation } from "@/app/i18n/client";
import { DISTRICT_COLORS } from "./utils";
import { formatDashboardNumber } from "../utils";
import { formatChartTitle, getDistrictColor } from "./chart-styles";
import {
  CHART_HEIGHT_CLASS,
  CHART_STYLES,
  ChartStatusCard,
  DistrictTooltip,
  useHiddenDistricts,
} from "./chart-common";

interface MetricRadarProps {
  selectedMetrics: string[];
  className?: string;
}

/**
 * Month-of-year seasonality per district for whichever metric the page supplies.
 * Shared by the catch and revenue pages.
 */
export default function MetricRadar({
  selectedMetrics,
  className = "",
}: MetricRadarProps) {
  const { t } = useTranslation("common");
  const [selectedDistricts] = useAtom(districtsAtom);
  const [selectedTimeRange] = useAtom(selectedTimeRangeAtom);
  const { hiddenDistricts, handleLegendClick } = useHiddenDistricts();

  const months = typeof selectedTimeRange === "number" ? selectedTimeRange : 12;

  const { data, isLoading, error } = api.monthlySummary.radarData.useQuery(
    {
      districts: selectedDistricts,
      metrics: selectedMetrics,
      months,
    },
    {
      enabled: selectedDistricts.length > 0 && selectedMetrics.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  );

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  /**
   * Pad the radius axis 10% above the largest plotted value so the outermost
   * ring is not flush against the chart edge.
   */
  const radarDomainMax = useMemo<number>(() => {
    if (!chartData.length) return 1;
    const allValues = chartData.flatMap((point) =>
      Object.entries(point)
        .filter(([key]) => key !== "month")
        .map(([, val]) => Number(val))
        .filter((v) => !isNaN(v))
    );
    const max = Math.max(...allValues);
    return max > 0 ? parseFloat((max * 1.1).toFixed(2)) : 1;
  }, [chartData]);

  if (isLoading) return <ChartStatusCard status="loading" className={className} />;
  if (error || !data)
    return <ChartStatusCard status="error" className={className} />;
  if (chartData.length === 0)
    return <ChartStatusCard status="empty" className={className} />;

  const selectedMetric = selectedMetrics[0];

  const timeRangeLabels: { value: string | number; label: string }[] = [
    { value: 3, label: t("text-last-3-months") || "Last 3 months" },
    { value: 6, label: t("text-last-6-months") || "Last 6 months" },
    { value: 12, label: t("text-last-year") || "Last year" },
    { value: "all", label: t("text-all-time") || "All time" },
  ];
  const timeRangeLabel =
    timeRangeLabels.find((r) => r.value === selectedTimeRange)?.label ??
    timeRangeLabels[1].label;

  return (
    <WidgetCard
      title={formatChartTitle(
        selectedMetric,
        t("text-seasonality") || "Seasonality",
        t
      )}
      description={timeRangeLabel}
      className={className}
    >
      <div className={CHART_HEIGHT_CLASS}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={CHART_STYLES.margins}>
            <PolarGrid />
            <PolarAngleAxis dataKey="month" />
            <PolarRadiusAxis
              domain={[0, radarDomainMax]}
              tickFormatter={(value) =>
                formatDashboardNumber(value, selectedMetric)
              }
            />
            <Tooltip
              content={({ active, payload, label }: any) => (
                <DistrictTooltip
                  active={active}
                  payload={payload}
                  heading={label}
                  selectedMetric={selectedMetric}
                />
              )}
              wrapperStyle={CHART_STYLES.tooltip.wrapperStyle}
            />
            <Legend {...CHART_STYLES.legend} onClick={handleLegendClick} />
            {selectedDistricts.map((district, idx) => {
              const color = getDistrictColor(district, idx, DISTRICT_COLORS);
              return (
                <Radar
                  key={district}
                  name={district}
                  dataKey={district}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  hide={hiddenDistricts.includes(district)}
                  {...CHART_STYLES.animation}
                />
              );
            })}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
