"use client";

import WidgetCard from "@components/cards/widget-card";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
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
import { bmusAtom } from "@/app/components/filter-selector";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import cn from "@utils/class-names";

type MetricKey =
  | "mean_effort"
  | "mean_cpue"
  | "mean_cpua"
  | "mean_rpue"
  | "mean_rpua";

interface RadarData {
  month: string;
  [key: string]: number | string;
}

interface MetricInfo {
  label: string;
  unit: string;
}

interface VisibilityState {
  [key: string]: { opacity: number };
}

const METRIC_INFO: Record<MetricKey, MetricInfo> = {
  mean_effort: { label: "Effort", unit: "fishers/km²/day" },
  mean_cpue: { label: "Catch Rate", unit: "kg/fisher/day" },
  mean_cpua: { label: "Catch Density", unit: "kg/km²/day" },
  mean_rpue: { label: "Fisher Revenue", unit: "KSH/fisher/day" },
  mean_rpua: { label: "Area Revenue", unit: "KSH/km²/day" },
};

const getMetricLabel = (metric: string): string => {
  return METRIC_INFO[metric as MetricKey]?.label || "Catch Metrics";
};

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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

const CustomTooltip = ({ active, payload, metric }: any) => {
  if (active && payload && payload.length) {
    const metricInfo = METRIC_INFO[metric as MetricKey];
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-600 mb-2">
          {payload[0]?.payload?.month ?? ""}
        </p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm">
              <span className="font-medium">{entry.name}:</span>{" "}
              {entry.value?.toFixed(1) ?? "N/A"} {metricInfo.unit}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
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

const CustomLegend = ({ payload, visibilityState, handleLegendClick }: any) => (
  <div className="flex flex-wrap gap-4 justify-center mt-2">
    {payload?.map((entry: any) => (
      <div
        key={entry.value}
        className={cn(
          "flex items-center gap-2 cursor-pointer select-none transition-all duration-200",
          "hover:opacity-80"
        )}
        style={{ opacity: visibilityState[entry.dataKey]?.opacity ?? 1 }}
        onClick={() => handleLegendClick(entry.dataKey)}
      >
        <div
          className="w-3 h-3 rounded-full transition-all duration-200"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-sm font-medium">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function CatchRadarChart({
  className,
  lang,
  selectedMetric,
}: {
  className?: string;
  lang?: string;
  selectedMetric: MetricKey;
}) {
  const { t } = useTranslation(lang!);
  const [bmus] = useAtom(bmusAtom);

  const [data, setData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibilityState, setVisibilityState] = useState<VisibilityState>({});
  const [siteColors, setSiteColors] = useState<Record<string, string>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { data: meanCatch, isLoading: isFetching } =
    api.aggregatedCatch.meanCatchRadar.useQuery(
      { bmus, metric: selectedMetric },
      {
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        retry: 3,
      }
    );

  useEffect(() => {
    if (isInitialLoad) {
      setLoading(true);
    }

    const processData = async () => {
      if (!meanCatch) {
        console.warn("meanCatch is undefined");
        return;
      }

      try {
        if (!Array.isArray(meanCatch) || meanCatch.length === 0) {
          setError("No data available");
          console.warn("meanCatch is not an array or is empty:", meanCatch);
          return;
        }

        // Extract unique BMUs from all data points
        const uniqueSitesSet = meanCatch.reduce((sites, item) => {
          Object.keys(item).forEach((key) => {
            if (key !== "month") sites.add(key);
          });
          return sites;
        }, new Set<string>());
        const uniqueSites: string[] = Array.from(uniqueSitesSet);

        console.log("Unique Sites:", uniqueSites);

        const newSiteColors = uniqueSites.reduce<Record<string, string>>(
          (acc: Record<string, string>, site: string, index: number) => {
            acc[site] = generateColor(index);
            return acc;
          },
          {}
        );
        setSiteColors(newSiteColors);

        const newVisibilityState: VisibilityState =
          uniqueSites.reduce<VisibilityState>(
            (acc: VisibilityState, site: string) => ({
              ...acc,
              [site]: { opacity: 1 },
            }),
            {}
          );
        setVisibilityState(newVisibilityState);

        // Sort data by month order and ensure all BMUs are present
        const sortedData = [...meanCatch]
          .sort(
            (a, b) =>
              MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
          )
          .map((item) => {
            const completeItem: RadarData = { month: item.month };
            uniqueSites.forEach((site) => {
              completeItem[site] =
                (item as Record<string, number | string>)[site] !== undefined
                  ? (item as Record<string, number | string>)[site]
                  : 0; // Use 0 or null as default
            });
            return completeItem;
          });

        setData(sortedData);
        setError(null);
      } catch (e) {
        console.error("Error processing data:", e);
        setError("Error processing data");
      } finally {
        setLoading(false);
        if (isInitialLoad) setIsInitialLoad(false);
      }
    };

    processData();
  }, [meanCatch, selectedMetric, isInitialLoad]);

  // Handle bmus changes
  useEffect(() => {
    if (bmus) {
      setLoading(true);
    }
  }, [bmus]);

  const handleLegendClick = (site: string) => {
    setVisibilityState((prev) => ({
      ...prev,
      [site]: {
        opacity: prev[site]?.opacity === 1 ? 0.2 : 1,
      },
    }));
  };

  if (loading || isFetching) return <LoadingState />;

  if (error) {
    return (
      <WidgetCard title={METRIC_INFO[selectedMetric].label}>
        <div className="h-96 w-full flex items-center justify-center">
          <span className="text-sm text-gray-500">Error: {error}</span>
        </div>
      </WidgetCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <WidgetCard title={METRIC_INFO[selectedMetric].label}>
        <div className="h-96 w-full flex items-center justify-center">
          <span className="text-sm text-gray-500">No data available</span>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={getMetricLabel(selectedMetric)}
      className={cn(className)}
    >
      <div className="mt-5 h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis
              dataKey="month"
              tick={{ fill: "#666", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, "auto"]}
              tick={{ fill: "#666" }}
            />
            {Object.entries(siteColors).map(([site, color]) => {
              const opacity = visibilityState[site]?.opacity ?? 1;
              return (
                <Radar
                  key={site}
                  name={site}
                  dataKey={site}
                  stroke={color}
                  fill={color}
                  fillOpacity={opacity * 0.25}
                  strokeOpacity={opacity}
                />
              );
            })}
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} metric={selectedMetric} />
              )}
            />
            <Legend
              content={(props) => (
                <CustomLegend
                  {...props}
                  visibilityState={visibilityState}
                  handleLegendClick={handleLegendClick}
                />
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
