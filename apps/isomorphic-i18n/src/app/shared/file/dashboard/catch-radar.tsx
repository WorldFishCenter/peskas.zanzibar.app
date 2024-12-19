"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/client";
import WidgetCard from "@components/cards/widget-card";
import { useAtom } from "jotai";
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
import { api } from "@/trpc/react";
import cn from "@utils/class-names";

type MetricKey = "mean_trip_catch" | "mean_effort" | "mean_cpue" | "mean_cpua";

interface RadarData {
  month: string;
  [key: string]: string | number;
}

interface MetricInfo {
  label: string;
  unit: string;
}

interface CatchRadarChartProps {
  className?: string;
  lang?: string;
  selectedMetric: MetricKey;
}

interface VisibilityState {
  [key: string]: {
    opacity: number;
  };
}

const METRIC_INFO: Record<MetricKey, MetricInfo> = {
  mean_trip_catch: { label: "Mean Catch per Trip", unit: "kg" },
  mean_effort: { label: "Mean Effort", unit: "hours" },
  mean_cpue: { label: "Mean CPUE", unit: "kg/hour" },
  mean_cpua: { label: "Mean CPUA", unit: "kg/area" },
};

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

const CustomTooltip = ({ active, payload, metric }: any) => {
  if (active && payload && payload.length) {
    const metricInfo = METRIC_INFO[metric as MetricKey];
    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: "0.5rem",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#4b5563" }}>
          {payload[0]?.payload?.month ?? ""}
        </p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} style={{ display: "flex", gap: "0.5rem" }}>
            <div
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                backgroundColor: entry.color,
              }}
            />
            <p style={{ fontSize: "0.875rem" }}>
              <span style={{ fontWeight: "500" }}>{entry.name}:</span>{" "}
              {entry.value?.toFixed(1) ?? "N/A"} {metricInfo.unit}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CatchRadarChart({
  className,
  lang,
  selectedMetric,
}: CatchRadarChartProps) {
  const [data, setData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibilityState, setVisibilityState] = useState<VisibilityState>({});
  const [siteColors, setSiteColors] = useState<Record<string, string>>({});

  const handleLegendClick = (site: string) => {
    setVisibilityState((prev) => ({
      ...prev,
      [site]: {
        opacity: prev[site]?.opacity === 1 ? 0.2 : 1,
      },
    }));
  };

  const CustomLegend = ({ payload }: any) => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        justifyContent: "center",
        marginTop: "0.5rem",
      }}
    >
      {payload?.map((entry: any) => (
        <div
          key={entry.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            transition: "opacity 0.2s",
            opacity: visibilityState[entry.dataKey]?.opacity ?? 1,
          }}
          onClick={() => handleLegendClick(entry.dataKey)}
        >
          <div
            style={{
              width: "0.75rem",
              height: "0.75rem",
              borderRadius: "50%",
              backgroundColor: entry.color,
            }}
          />
          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  const { t } = useTranslation(lang!);
  const [bmus] = useAtom(bmusAtom);

  const { data: meanCatch } = api.aggregatedCatch.meanCatchRadar.useQuery({
    bmus,
    metric: selectedMetric,
  });

  useEffect(() => {
    setLoading(true);

    if (!meanCatch) {
      setLoading(false);
      return;
    }

    try {
      if (!Array.isArray(meanCatch) || meanCatch.length === 0) {
        setError("No data available");
      } else {
        const uniqueSites = Object.keys(meanCatch[0]).filter(
          (key) => key !== "month"
        );

        const newSiteColors = uniqueSites.reduce(
          (acc, site, index) => ({
            ...acc,
            [site]: generateColor(index),
          }),
          {}
        );
        setSiteColors(newSiteColors);

        setVisibilityState(
          uniqueSites.reduce(
            (acc, site) => ({
              ...acc,
              [site]: { opacity: 1 },
            }),
            {}
          )
        );

        const sortedData = [...meanCatch].sort(
          (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
        );

        setData(sortedData);
        setError(null);
      }
    } catch (e) {
      console.error("Error processing data:", e);
      setError("Error processing data");
    } finally {
      setLoading(false);
    }
  }, [meanCatch, selectedMetric]);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0) return <div>No data available</div>;

  return (
    <WidgetCard
      title={METRIC_INFO[selectedMetric].label}
      className={className}
    >
      <div style={{ marginTop: "1.25rem", height: "24rem", width: "100%" }}>
        <ResponsiveContainer
          key={JSON.stringify(data)} // Forces a re-render when data changes
          width="100%"
          height="100%"
        >
          <RadarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis
              dataKey="month"
              tick={{ fill: "#666", fontSize: 14 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, "auto"]}
              tick={{ fill: "#666" }}
            />
            {Object.entries(siteColors).map(([site, color]) => (
              <Radar
                key={site}
                name={site}
                dataKey={site}
                stroke={color}
                fill={color}
                fillOpacity={visibilityState[site]?.opacity * 0.25}
                strokeOpacity={visibilityState[site]?.opacity}
              />
            ))}
            <Tooltip content={(props) => <CustomTooltip {...props} metric={selectedMetric} />} />
            <Legend content={CustomLegend} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
