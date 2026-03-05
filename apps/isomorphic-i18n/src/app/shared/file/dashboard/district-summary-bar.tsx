"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import { useMemo } from "react";
import { useAtom } from 'jotai';
import { selectedTimeRangeAtom } from '@/app/components/time-range-selector';
import { selectedMetricAtom } from '@/app/components/filter-selector';
import { hoveredDistrictAtom } from './atoms';
import { DISTRICT_COLORS } from "./charts/utils";
import { formatDashboardNumber, getAggregatedDistrictValue, computeDateRange } from "./utils";
import { CURRENCY_CODE } from "@/config/constants";

// Fallback colors for any districts not in the predefined mapping
const FALLBACK_COLORS = [
  "#167288", "#8cdaec", "#b45248", "#d48c84", "#a89a49", "#d6cfa2", "#3cb464", "#9bddb1", "#643c6a", "#836394", "#90a4ae"
];

// List of metrics to show in tooltip
export const METRICS = [
  { key: "mean_cpue", labelKey: "metric-mean_cpue-title", unitKey: "metric-mean_cpue-unit", descKey: "metric-mean_cpue-desc" },
  { key: "mean_rpue", labelKey: "metric-mean_rpue-title", unitKey: "metric-mean_rpue-unit", descKey: "metric-mean_rpue-desc" },
  { key: "n_fishers", labelKey: "metric-n_fishers-title", unitKey: "metric-n_fishers-unit", descKey: "metric-n_fishers-desc" },
  { key: "n_submissions", labelKey: "metric-n_submissions-title", unitKey: "metric-n_submissions-unit", descKey: "metric-n_submissions-desc" },
  { key: "trip_duration_hrs", labelKey: "metric-trip_duration_hrs-title", unitKey: "metric-trip_duration_hrs-unit", descKey: "metric-trip_duration_hrs-desc" },
  { key: "mean_price_kg", labelKey: "metric-mean_price_kg-title", unitKey: "metric-mean_price_kg-unit", descKey: "metric-mean_price_kg-desc" },
  { key: "estimated_revenue", labelKey: "metric-estimated_revenue-title", unitKey: "metric-estimated_revenue-unit", descKey: "metric-estimated_revenue-desc" },
  { key: "estimated_catch_tn", labelKey: "metric-estimated_catch_tn-title", unitKey: "metric-estimated_catch_tn-unit", descKey: "metric-estimated_catch_tn-desc" },
];

function DistrictTooltip({ active, payload, allData, selectedMetric, lang }: any) {
  const { t } = useTranslation("common");
  if (!active || !payload || !payload.length) return null;
  const { name } = payload[0].payload;
  const districtData = allData.find((d: any) => d.gaul_2_name === name);
  if (!districtData) return null;
  return (
    <div className="bg-gray-0/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200 min-w-[180px] text-gray-900">
      <div className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">{name}</div>
      <div className="space-y-1">
        {METRICS.map(m => (
          <div key={m.key} className={`flex justify-between items-center text-xs gap-3 ${m.key === selectedMetric ? ' font-bold' : ''}`}>
            <span className="text-gray-600">{t(m.labelKey)}:</span>
            <span className="font-medium text-gray-900">
              {districtData[m.key] !== null && districtData[m.key] !== undefined && !isNaN(districtData[m.key])
                ? formatDashboardNumber(districtData[m.key], m.key, lang)
                : "-"}
              {t(m.unitKey, { currency: CURRENCY_CODE }) ? ` ${t(m.unitKey, { currency: CURRENCY_CODE })}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DistrictSummaryBar({ className, lang: propLang }: { className?: string, lang?: string }) {
  const lang = propLang || 'en';
  const { t } = useTranslation("common");
  const [range] = useAtom(selectedTimeRangeAtom);
  const { start, end } = useMemo(() => computeDateRange(range), [range]);
  const [selectedMetric] = useAtom(selectedMetricAtom);
  const [hoveredDistrict, setHoveredDistrict] = useAtom(hoveredDistrictAtom);
  const metricConfig = METRICS.find(m => m.key === selectedMetric) || METRICS[0];
  // Fetch summary for all districts (using the same API as DistrictMetricsTable)
  const { data = [], isLoading, error } = api.districtSummary.getDistrictsSummaryByDateRange.useQuery({ startDate: start, endDate: end });

  // Prepare and sort chart data by selected metric
  const chartData = useMemo(() => {
    const mapped = data
      .map((row: any) => ({
        name: row.gaul_2_name,
        value: getAggregatedDistrictValue(row, selectedMetric),
        ...row,
      }));

    const filtered = mapped.filter((d: any) => d.value !== null && !isNaN(d.value));

    return filtered
      .sort((a: any, b: any) => b.value - a.value)
      .map((d: any, idx: number) => ({ ...d, rank: idx + 1 }));
  }, [data, selectedMetric]);

  if (isLoading) {
    return (
      <div className={`h-full w-full flex flex-col${className ? ` ${className}` : ''}`}>
        <div className="h-80 flex items-center justify-center animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`h-full w-full flex flex-col${className ? ` ${className}` : ''}`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[256px]">
          <p className="text-gray-500">{t('text-no-data-available')}</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`h-full w-full flex flex-col${className ? ` ${className}` : ''}`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[256px]">
          <p className="text-gray-500">{t('text-no-data-available-for-districts')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full w-full${className ? ` ${className}` : ''}`}>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" strokeOpacity={0.7} className="dark:stroke-gray-700" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) => formatDashboardNumber(value, selectedMetric, lang)}
              label={{
                value: `${t(metricConfig.labelKey)}${t(metricConfig.unitKey, { currency: CURRENCY_CODE }) ? ` (${t(metricConfig.unitKey, { currency: CURRENCY_CODE })})` : ''} (${['n_submissions', 'estimated_catch_tn', 'estimated_revenue'].includes(selectedMetric) ? t('text-aggregated') : t('text-average')})`,
                position: 'insideBottom',
                offset: -5,
                style: { fontSize: 13, fill: '#64748b', fontWeight: 500, textAnchor: 'middle' }
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
            <Tooltip content={<DistrictTooltip allData={data} selectedMetric={selectedMetric} lang={lang} />} wrapperStyle={{ background: 'transparent' }} />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => {
                const districtName = entry.name;
                const color = DISTRICT_COLORS[districtName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                const isHovered = hoveredDistrict === districtName;
                const isAnyHovered = !!hoveredDistrict;
                const fillOpacity = isAnyHovered && !isHovered ? 0.3 : 1;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={fillOpacity}
                    onMouseEnter={() => setHoveredDistrict(districtName)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
                  />
                );
              })}
              {/* Show value at end of bar */}
              <LabelList dataKey="value" position="right" formatter={(value: number) => formatDashboardNumber(value, selectedMetric, lang)} style={{ fontSize: 12, fill: '#222', filter: 'invert(1) brightness(2)' }} className="dark:fill-white" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 