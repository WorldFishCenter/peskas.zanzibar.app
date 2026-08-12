"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAtom } from "jotai";
import WidgetCard from "@components/cards/widget-card";

import { api } from "@/trpc/react";
import { districtsAtom } from "@/app/components/filter-selector";
import { selectedTimeRangeAtom } from "@/app/components/time-range-selector";
import { useTranslation } from "@/app/i18n/client";
import { LOCALE } from "@/config/constants";
import { DISTRICT_COLORS } from "./utils";
import { formatDashboardNumber } from "../utils";
import {
  SHARED_METRIC_CONFIG,
  formatChartTitle,
  getDistrictColor,
} from "./chart-styles";
import {
  CHART_HEIGHT_CLASS,
  CHART_STYLES,
  ChartStatusCard,
  DistrictTooltip,
  useHiddenDistricts,
} from "./chart-common";

interface MetricTimeSeriesProps {
  selectedMetrics: string[];
  className?: string;
}

/**
 * Monthly time series per district for whichever metric the page supplies.
 * Catch and revenue pages both render this; they differ only in the metric
 * atom they read from.
 */
export default function MetricTimeSeries({
  selectedMetrics,
  className = "",
}: MetricTimeSeriesProps) {
  const { t } = useTranslation("common");
  const [selectedDistricts] = useAtom(districtsAtom);
  const [selectedTimeRange] = useAtom(selectedTimeRangeAtom);
  const { hiddenDistricts, handleLegendClick } = useHiddenDistricts();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const months =
    typeof selectedTimeRange === "number" ? selectedTimeRange : undefined;

  const { data, isLoading, error } = api.monthlySummary.timeSeries.useQuery(
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
    if (!data) return [];
    const dates = Object.keys(data).sort();
    return dates.map((date) => {
      const point: any = { date };
      Object.keys(data[date][selectedMetrics[0]] || {}).forEach((district) => {
        point[district] = data[date][selectedMetrics[0]][district];
      });
      return point;
    });
  }, [data, selectedMetrics]);

  if (isLoading) return <ChartStatusCard status="loading" className={className} />;
  if (error || !data)
    return <ChartStatusCard status="error" className={className} />;
  if (chartData.length === 0)
    return <ChartStatusCard status="empty" className={className} />;

  const selectedMetric = selectedMetrics[0];
  const metricConfig =
    SHARED_METRIC_CONFIG[selectedMetric as keyof typeof SHARED_METRIC_CONFIG];

  return (
    <WidgetCard
      title={formatChartTitle(
        selectedMetric,
        t("text-time-series") || "Time Series",
        t
      )}
      description={metricConfig?.unit ? `Unit: ${metricConfig.unit}` : undefined}
      className={className}
    >
      <div className={CHART_HEIGHT_CLASS}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={isMobile ? CHART_STYLES.mobileMargins : CHART_STYLES.margins}
          >
            <CartesianGrid {...CHART_STYLES.grid} />
            <XAxis
              dataKey="date"
              {...CHART_STYLES.axis}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(LOCALE, {
                  month: "short",
                  year: "2-digit",
                })
              }
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              {...CHART_STYLES.axis}
              domain={[
                0,
                (dataMax: number) => parseFloat((dataMax * 1.1).toFixed(2)),
              ]}
              tickFormatter={(value) =>
                formatDashboardNumber(value, selectedMetric)
              }
            />
            <Tooltip
              content={({ active, payload, label }: any) => (
                <DistrictTooltip
                  active={active}
                  payload={payload}
                  heading={
                    label
                      ? new Date(label).toLocaleDateString(LOCALE, {
                          year: "numeric",
                          month: "long",
                        })
                      : undefined
                  }
                  selectedMetric={selectedMetric}
                />
              )}
              wrapperStyle={CHART_STYLES.tooltip.wrapperStyle}
            />
            <Legend {...CHART_STYLES.legend} onClick={handleLegendClick} />
            {Object.keys(chartData[0] || {})
              .filter((key) => key !== "date")
              .map((district, idx) => {
                const color = getDistrictColor(district, idx, DISTRICT_COLORS);
                return (
                  <Line
                    key={district}
                    type="linear"
                    dataKey={district}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: color, stroke: color }}
                    activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                    name={district}
                    hide={hiddenDistricts.includes(district)}
                    {...CHART_STYLES.animation}
                  />
                );
              })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
