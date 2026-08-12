"use client";

import { useState } from "react";
import WidgetCard from "@components/cards/widget-card";

import { useTranslation } from "@/app/i18n/client";
import { formatDashboardNumber } from "../utils";
import { CHART_STYLES } from "./chart-styles";

/**
 * Pieces shared by the district-series charts (time series and radar, for both
 * catch and revenue). These used to be copy-pasted per chart, which is how the
 * catch and revenue variants drifted apart on number formatting and mobile
 * margins.
 */

/** Legend click-to-toggle state, identical across every district chart. */
export function useHiddenDistricts() {
  const [hiddenDistricts, setHiddenDistricts] = useState<string[]>([]);

  // recharts types the legend payload loosely; dataKey is the district name here.
  const handleLegendClick = (entry: any) => {
    const district = String(entry?.dataKey ?? "");
    if (!district) return;
    setHiddenDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district]
    );
  };

  return { hiddenDistricts, handleLegendClick };
}

type ChartStatus = "loading" | "error" | "empty";

/** Loading / error / empty placeholders, previously duplicated in each chart. */
export function ChartStatusCard({
  status,
  className = "",
}: {
  status: ChartStatus;
  className?: string;
}) {
  const { t } = useTranslation("common");

  if (status === "loading") {
    return (
      <WidgetCard title={t("text-loading") || "Loading..."} className={className}>
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </WidgetCard>
    );
  }

  const title =
    status === "error"
      ? t("text-error") || "Error"
      : t("text-no-data") || "No Data";

  const message =
    status === "error"
      ? t("text-no-data-available")
      : t("text-no-data-available-for-filters") ||
        "No data available for selected filters";

  return (
    <WidgetCard title={title} className={className}>
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-gray-500">{message}</p>
      </div>
    </WidgetCard>
  );
}

interface DistrictTooltipProps {
  active?: boolean;
  payload?: any[];
  /** Pre-rendered heading (a formatted date for time series, month for radar). */
  heading?: string;
  selectedMetric?: string;
}

/**
 * Ranks the hovered districts high-to-low and highlights the best and worst.
 * Values always go through formatDashboardNumber so a tooltip can never
 * disagree with the axis beside it.
 */
export function DistrictTooltip({
  active,
  payload,
  heading,
  selectedMetric,
}: DistrictTooltipProps) {
  if (!active || !payload?.length) return null;

  const withValues = payload.filter(
    (entry) => entry.value !== null && entry.value !== undefined
  );
  if (withValues.length === 0) return null;

  const sorted = [...withValues].sort((a, b) => (b.value || 0) - (a.value || 0));
  const maxValue = sorted[0]?.value || 0;
  const minValue = sorted[sorted.length - 1]?.value || 0;

  return (
    <div className="min-w-[180px] rounded border border-muted bg-gray-0 p-3 text-gray-900 shadow-lg dark:bg-gray-50 dark:text-gray-700">
      <div className="mb-1 font-semibold text-gray-900 dark:text-gray-700">
        {heading}
      </div>
      <div className="space-y-1">
        {sorted.map((entry, index) => {
          const isHighest = entry.value === maxValue && maxValue > 0;
          const isLowest =
            entry.value === minValue && minValue > 0 && maxValue !== minValue;

          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span
                  className={`text-xs ${
                    isHighest
                      ? "font-semibold text-green-600 dark:text-green-400"
                      : isLowest
                        ? "font-semibold text-red-600 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {entry.name}
                </span>
              </div>
              <span
                className={`text-xs font-medium ${
                  isHighest
                    ? "text-green-600 dark:text-green-400"
                    : isLowest
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-700"
                }`}
              >
                {formatDashboardNumber(entry.value, selectedMetric)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Charts render full-width inside their card at every breakpoint. */
export const CHART_HEIGHT_CLASS = "h-80 md:h-96 lg:h-[28rem] xl:h-[32rem]";

export { CHART_STYLES };
