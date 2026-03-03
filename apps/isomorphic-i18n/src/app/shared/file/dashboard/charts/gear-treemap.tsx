"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useAtom } from "jotai";
import type { ApexOptions } from "apexcharts";
import WidgetCard from "@components/cards/widget-card";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import { districtsAtom } from "@/app/components/filter-selector";
import { selectedTimeRangeAtom } from "@/app/components/time-range-selector";
import { CURRENCY_CODE } from "@/config/constants";
import { useTheme } from "next-themes";
import cn from "@utils/class-names";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Curated palette — distinct, accessible colors for gear type tiles
const TREEMAP_COLORS = [
  "#167288",
  "#3cb464",
  "#b45248",
  "#a89a49",
  "#643c6a",
  "#8cdaec",
  "#9bddb1",
  "#d48c84",
  "#d6cfa2",
  "#836394",
  "#00B4D8",
  "#F97316",
];

const capitalizeGearType = (gear: string) =>
  gear
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const formatValue = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

interface SeriesPoint {
  x: string;
  y: number;
  total_records: number;
  district_count: number;
}

export interface GearTreemapProps {
  metric: "cpue" | "rpue";
  className?: string;
}

export default function GearTreemap({ metric, className }: GearTreemapProps) {
  const { t } = useTranslation("common");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [districts] = useAtom(districtsAtom);
  const [selectedTimeRange] = useAtom(selectedTimeRangeAtom);

  // Mirror the monthlySummary pattern: pass months as a plain integer.
  // Avoids client-side new Date() in query params (causes unstable cache keys).
  const months =
    typeof selectedTimeRange === "number" ? selectedTimeRange : undefined;

  const queryParams = useMemo(
    () => ({ districts: districts ?? [], months }),
    [districts, months]
  );

  const { data: rawData = [], isLoading, error } = api.gear.byGear.useQuery(
    { ...queryParams, indicator: metric },
    {
      enabled: queryParams.districts.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  );

  const titleKey = metric === "cpue" ? "text-cpue-by-gear" : "text-rpue-by-gear";
  const fallbackTitle =
    metric === "cpue" ? "CPUE by Gear Type" : "RPUE by Gear Type";

  const seriesData: SeriesPoint[] = useMemo(() => {
    if (!rawData.length) return [];
    return (rawData as Record<string, unknown>[])
      .map((item) => {
        const rawValue =
          metric === "cpue"
            ? (item.avg_cpue as number)
            : (item.avg_rpue as number);
        return {
          x: capitalizeGearType(
            ((item.gear as string) ?? "").replace(/_/g, " ")
          ),
          y: Number((rawValue ?? 0).toFixed(2)),
          total_records: item.total_records as number,
          district_count: item.district_count as number,
        };
      })
      .filter((item) => item.y > 0);
  }, [rawData, metric]);

  const options: ApexOptions = useMemo(() => {
    const unit =
      metric === "cpue" ? "kg/fisher/day" : `${CURRENCY_CODE}/fisher/day`;
    const surface = isDark ? "#1b2434" : "#ffffff";
    const border = isDark ? "#2d3748" : "#e5e7eb";
    const textMuted = isDark ? "#9ca3af" : "#6b7280";
    const textStrong = isDark ? "#f3f4f6" : "#111827";
    const strokeColor = isDark ? "#0f1117" : "#ffffff";

    const metricLabel =
      metric === "cpue"
        ? t("text-average-cpue") || "Average CPUE"
        : t("text-average-rpue") || "Average RPUE";
    const districtsLabel = t("text-districts") || "Districts";
    const recordsLabel = t("text-records") || "Records";

    return {
      chart: {
        type: "treemap",
        background: "transparent",
        fontFamily: "inherit",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
        toolbar: { show: false },
      },
      theme: { mode: isDark ? "dark" : "light" },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          fontWeight: "600",
          fontFamily: "inherit",
        },
        formatter: (text: string, op: { value: number }) =>
          [`${text}`, `${formatValue(op.value)} ${unit}`] as unknown as string,
      },
      stroke: {
        show: true,
        width: 2,
        colors: [strokeColor],
      },
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
        },
      },
      colors: TREEMAP_COLORS,
      tooltip: {
        theme: isDark ? "dark" : "light",
        custom: ({
          seriesIndex,
          dataPointIndex,
          w,
        }: {
          seriesIndex: number;
          dataPointIndex: number;
          w: { globals: { initialSeries: Array<{ data: SeriesPoint[] }> } };
        }) => {
          const point =
            w.globals.initialSeries[seriesIndex]?.data[dataPointIndex];
          if (!point) return "";
          return `
            <div style="background:${surface};border:1px solid ${border};border-radius:8px;padding:12px 14px;min-width:190px;font-family:inherit;line-height:1.5">
              <div style="font-weight:700;color:${textStrong};margin-bottom:6px;font-size:13px">${point.x}</div>
              <div style="font-size:12px;color:${textMuted};margin-bottom:2px">
                ${metricLabel}:&nbsp;<span style="color:${textStrong};font-weight:600">${formatValue(point.y)}&nbsp;${unit}</span>
              </div>
              ${point.district_count ? `<div style="font-size:12px;color:${textMuted}">${districtsLabel}:&nbsp;<span style="color:${textStrong};font-weight:600">${point.district_count}</span></div>` : ""}
              ${point.total_records ? `<div style="font-size:12px;color:${textMuted}">${recordsLabel}:&nbsp;<span style="color:${textStrong};font-weight:600">${Number(point.total_records).toLocaleString()}</span></div>` : ""}
            </div>
          `;
        },
      },
    };
  }, [isDark, metric, t]);

  if (isLoading) {
    return (
      <WidgetCard title={t("text-loading") || "Loading..."} className={className}>
        <div className="animate-pulse space-y-3 pt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </WidgetCard>
    );
  }

  if (error || !rawData) {
    return (
      <WidgetCard title={t("text-error") || "Error"} className={className}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">
            {t("text-no-data-available")}
          </p>
        </div>
      </WidgetCard>
    );
  }

  if (!seriesData.length) {
    return (
      <WidgetCard title={t(titleKey) || fallbackTitle} className={className}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">
            {t("text-no-data-available-for-filters") ||
              "No data available for selected filters"}
          </p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={t(titleKey) || fallbackTitle}
      className={cn("h-full", className)}
    >
      <Chart
        options={options}
        series={[{ data: seriesData as unknown as number[] }]}
        type="treemap"
        height={420}
      />
    </WidgetCard>
  );
}
