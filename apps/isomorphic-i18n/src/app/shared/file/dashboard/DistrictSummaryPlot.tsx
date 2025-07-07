"use client";
import WidgetCard from "@components/cards/widget-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import { useMemo, useRef, useState } from "react";
import { useAtom } from 'jotai';
import { selectedTimeRangeAtom } from '@/app/components/filter-selector';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "/Users/lore/Desktop/work/wf_projects/peskas.zanzibar.v2/packages/isomorphic-core/src/ui/select";
import { DISTRICT_COLORS } from "./charts/utils";

// Fallback colors for any districts not in the predefined mapping
const FALLBACK_COLORS = [
  "#167288", "#8cdaec", "#b45248", "#d48c84", "#a89a49", "#d6cfa2", "#3cb464", "#9bddb1", "#643c6a", "#836394", "#90a4ae"
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
    <div className="bg-gray-0 dark:bg-gray-50 p-3 rounded shadow-lg border border-muted min-w-[180px] text-gray-900 dark:text-gray-700">
      <div className="font-semibold text-gray-900 dark:text-gray-700 mb-1">{name}</div>
      <div className="space-y-1">
        {METRICS.map(m => (
          <div key={m.key} className={`flex justify-between text-xs${m.key === selectedMetric ? ' font-bold' : ''}`}>
            <span className="text-gray-500 dark:text-gray-400">{m.label}:</span>
            <span className="font-medium text-gray-900 dark:text-gray-700">
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
  const [range] = useAtom(selectedTimeRangeAtom);
  const { start, end } = useMemo(() => {
    if (range === "all") return { start: "1900-01-01", end: new Date().toISOString() };
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - Number(range));
    return { start: start.toISOString(), end: end.toISOString() };
  }, [range]);
  const [selectedMetric, setSelectedMetric] = useState("mean_cpue");
  const metricConfig = METRICS.find(m => m.key === selectedMetric) || METRICS[0];
  // Fetch summary for all districts (using the same API as DistrictMetricsTable)
  const { data = [], isLoading, error } = api.districtSummary.getDistrictsSummaryByDateRange.useQuery({ startDate: start, endDate: end });

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
          <span className="font-semibold text-gray-900 dark:text-gray-700">
            {t("text-district-summary") || "District Summary"} — {metricConfig.label}{metricConfig.unit ? ` (${metricConfig.unit})` : ''}
          </span>
          <div className="w-48 mb-4 mt-2">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue>{METRICS.find(m => m.key === selectedMetric)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      className={`border border-muted bg-gray-0 p-5 dark:bg-gray-50 rounded-lg h-full flex flex-col${className ? ` ${className}` : ''}`}
    >
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" strokeOpacity={0.7} className="dark:stroke-gray-700" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{
                value: `${metricConfig.label}${metricConfig.unit ? ` (${metricConfig.unit})` : ''}`,
                position: 'insideBottomRight',
                offset: 0,
                style: { fontSize: 13, fill: '#64748b', fontWeight: 500 }
              }}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1, className: 'dark:stroke-gray-700' }}
              tickLine={{ stroke: '#cbd5e1', className: 'dark:stroke-gray-700' }}
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
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1, className: 'dark:stroke-gray-700' }}
              tickLine={{ stroke: '#cbd5e1', className: 'dark:stroke-gray-700' }}
            />
            <Tooltip content={<DistrictTooltip allData={data} selectedMetric={selectedMetric} />} wrapperStyle={{ background: 'transparent' }} />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => {
                const districtName = entry.name;
                const color = DISTRICT_COLORS[districtName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
              {/* Show value at end of bar */}
              <LabelList dataKey="value" position="right" formatter={(value: number) => value?.toLocaleString(undefined, { maximumFractionDigits: 2 })} style={{ fontSize: 12, fill: '#222', filter: 'invert(1) brightness(2)'}} className="dark:fill-white" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
} 