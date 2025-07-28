"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { useAtom } from "jotai";
import { districtsAtom, selectedTimeRangeAtom } from "@/app/components/filter-selector";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import WidgetCard from "@components/cards/widget-card";
import { Title } from "rizzui";
import { useTranslation } from "@/app/i18n/client";
import { DISTRICT_COLORS } from "../charts/utils";
import { 
  CHART_STYLES, 
  SHARED_METRIC_CONFIG, 
  getDistrictColor, 
  formatChartTitle 
} from "./chart-styles";

// Custom tooltip component for modern styling
const CustomTooltip = ({ active, payload, label, selectedMetric }: any) => {
  const { t } = useTranslation("common");
  
  if (active && payload && payload.length) {
    // Sort payload by value to rank districts
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));
    const maxValue = sortedPayload[0]?.value || 0;
    const minValue = sortedPayload[sortedPayload.length - 1]?.value || 0;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 min-w-[200px]">
        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {new Date(label).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long'
          })}
        </div>
        <div className="space-y-2">
          {sortedPayload.map((entry: any, index: number) => {
            const isHighest = entry.value === maxValue && maxValue > 0;
            const isLowest = entry.value === minValue && minValue > 0 && maxValue !== minValue;
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className={`text-sm font-medium ${
                    isHighest ? 'text-green-600 dark:text-green-400 font-semibold' :
                    isLowest ? 'text-red-600 dark:text-red-400 font-semibold' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    {entry.name}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  isHighest ? 'text-green-600 dark:text-green-400' :
                  isLowest ? 'text-red-600 dark:text-red-400' :
                  'text-gray-900 dark:text-gray-100'
                }`}>
                  {entry.value?.toFixed(2) || '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};



interface CatchTimeSeriesProps {
  selectedMetrics: string[];
  className?: string;
}

export default function CatchTimeSeries({ 
  selectedMetrics, 
  className = "" 
}: CatchTimeSeriesProps) {
  const { t } = useTranslation("common");
  const [selectedDistricts] = useAtom(districtsAtom);
  const [selectedTimeRange] = useAtom(selectedTimeRangeAtom);
  const [hiddenDistricts, setHiddenDistricts] = useState<string[]>([]);
  
  // Convert time range to months
  const months = typeof selectedTimeRange === 'number' ? selectedTimeRange : 12;
  
  const { data, isLoading, error } = api.monthlySummary.timeSeries.useQuery(
    {
      districts: selectedDistricts,
      metrics: selectedMetrics,
      months
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
    return dates.map(date => {
      const point: any = { date };
      Object.keys(data[date][selectedMetrics[0]] || {}).forEach(district => {
        point[district] = data[date][selectedMetrics[0]][district];
      });
      return point;
    });
  }, [data, selectedMetrics]);

  const handleLegendClick = (entry: any) => {
    const district = entry.dataKey;
    setHiddenDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };



  if (isLoading) {
    return (
      <WidgetCard title={t("text-loading") || "Loading..."} className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </WidgetCard>
    );
  }

  if (error || !data) {
    return (
      <WidgetCard title={t("text-error") || "Error"} className={className}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">{t('text-no-data-available')}</p>
        </div>
      </WidgetCard>
    );
  }

  if (chartData.length === 0) {
    return (
      <WidgetCard title={t("text-no-data") || "No Data"} className={className}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">{t("text-no-data-available-for-filters") || "No data available for selected filters"}</p>
        </div>
      </WidgetCard>
    );
  }

  const selectedMetric = selectedMetrics[0];
  const metricConfig = SHARED_METRIC_CONFIG[selectedMetric as keyof typeof SHARED_METRIC_CONFIG];

  return (
    <WidgetCard 
      title={
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {formatChartTitle(selectedMetric, t("text-time-series") || "Time Series")}
          </div>
          {metricConfig?.unit && (
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Unit: {metricConfig.unit}
            </div>
          )}
        </div>
      } 
      className={className}
    >
      <div className="h-96 sm:h-[18rem] md:h-[22rem] lg:h-[26rem] xl:h-[28rem]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={CHART_STYLES.margins}
          >
            <CartesianGrid {...CHART_STYLES.grid} />
            <XAxis 
              dataKey="date" 
              {...CHART_STYLES.axis}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis {...CHART_STYLES.axis} />
            <Tooltip 
              content={<CustomTooltip selectedMetric={selectedMetric} />}
              wrapperStyle={CHART_STYLES.tooltip.wrapperStyle}
            />
            <Legend 
              {...CHART_STYLES.legend} 
              onClick={handleLegendClick}
            />
            {Object.keys(chartData[0] || {}).filter(key => key !== 'date').map((district, idx) => {
              const color = getDistrictColor(district, idx, DISTRICT_COLORS);
              return (
                <Line
                  key={district}
                  type="monotone"
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