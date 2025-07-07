"use client";
import WidgetCard from "@components/cards/widget-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import { useMemo, useRef, useState } from "react";

const COLORS = [
  "#4A90E2", "#F28F3B", "#27AE60", "#E74C3C", "#9B59B6", "#F39C12", "#3498DB", "#75ABBC", "#FC3468", "#2ECC71"
];

// List of metrics to show in tooltip
const METRICS = [
  { key: "mean_cpue", label: "CPUE", unit: "kg/fisher/day" },
  { key: "mean_rpue", label: "RPUE", unit: "KES/fisher/day" },
  { key: "n_fishers", label: "Fishers", unit: "" },
  { key: "n_submissions", label: "Submissions", unit: "" },
  { key: "trip_duration", label: "Trip Duration", unit: "hours" },
  { key: "mean_price_kg", label: "Price/kg", unit: "KES/kg" },
];

function DistrictTooltip({ active, payload, allData, selectedMetric }: any) {
  if (!active || !payload || !payload.length) return null;
  const { name } = payload[0].payload;
  const districtData = allData.find((d: any) => d.district === name);
  if (!districtData) return null;
  return (
    <div className="bg-white p-3 rounded shadow-lg border border-gray-200 min-w-[180px]">
      <div className="font-semibold text-gray-800 mb-1">{name}</div>
      <div className="space-y-1">
        {METRICS.map(m => (
          <div key={m.key} className={`flex justify-between text-xs${m.key === selectedMetric ? ' font-bold' : ''}`}>
            <span className="text-gray-500">{m.label}:</span>
            <span className="font-medium text-gray-900">
              {districtData[m.key] !== null && districtData[m.key] !== undefined && !isNaN(districtData[m.key])
                ? Number(districtData[m.key]).toLocaleString(undefined, { maximumFractionDigits: 2 })
                : "-"}
              {m.unit ? ` ${m.unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DistrictSummaryPlot({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  const endDateRef = useRef(new Date().toISOString());
  const [selectedMetric, setSelectedMetric] = useState("mean_cpue");
  const metricConfig = METRICS.find(m => m.key === selectedMetric) || METRICS[0];
  // Fetch summary for all districts (using the same API as DistrictMetricsTable)
  const { data = [], isLoading, error } = api.districtSummary.getDistrictsSummaryByDateRange.useQuery({ startDate: "1900-01-01", endDate: endDateRef.current });

  // Prepare and sort chart data by selected metric
  const chartData = useMemo(() => {
    return data
      .map((row: any) => ({
        name: row.district,
        value: row[selectedMetric],
        ...row,
      }))
      .filter((d: any) => d.value !== null && !isNaN(d.value))
      .sort((a: any, b: any) => b.value - a.value)
      .map((d: any, idx: number) => ({ ...d, rank: idx + 1 }));
  }, [data, selectedMetric]);

  if (isLoading) {
    return (
      <WidgetCard title={t("text-district-summary") || "District Summary"} className={`h-full flex flex-col${className ? ` ${className}` : ''}` }>
        <div className="h-80 flex items-center justify-center animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </WidgetCard>
    );
  }

  if (error || !data) {
    return (
      <WidgetCard title={t("text-district-summary") || "District Summary"} className={`h-full flex flex-col${className ? ` ${className}` : ''}` }>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">{t('text-no-data-available')}</p>
        </div>
      </WidgetCard>
    );
  }

  if (chartData.length === 0) {
    return (
      <WidgetCard title={t("text-district-summary") || "District Summary"} className={`h-full flex flex-col${className ? ` ${className}` : ''}` }>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">No data available for districts</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={
        <div className="flex flex-col gap-1">
          <span className="font-semibold">
            {t("text-district-summary") || "District Summary"} — {metricConfig.label}{metricConfig.unit ? ` (${metricConfig.unit})` : ''}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {METRICS.map(m => (
              <button
                key={m.key}
                className={`px-2 py-1 rounded text-xs border transition-colors ${selectedMetric === m.key ? 'bg-blue-500 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSelectedMetric(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      }
      className={`h-full flex flex-col${className ? ` ${className}` : ''}`}
    >
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{
                value: `${metricConfig.label}${metricConfig.unit ? ` (${metricConfig.unit})` : ''}`,
                position: 'insideBottomRight',
                offset: 0,
                style: { fontSize: 13, fill: '#64748b', fontWeight: 500 }
              }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12, fill: "#64748b" }}
              width={120}
              tickFormatter={(name: string, idx: number) => {
                const d = chartData[idx];
                return d ? `${d.rank}. ${name}` : name;
              }}
            />
            <Tooltip content={<DistrictTooltip allData={data} selectedMetric={selectedMetric} />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              {/* Show value at end of bar */}
              <LabelList dataKey="value" position="right" formatter={(value: number) => value?.toLocaleString(undefined, { maximumFractionDigits: 2 })} style={{ fontSize: 12, fill: '#222' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
} 