"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import { useAtom } from "jotai";
import { districtsAtom } from "@/app/components/filter-selector";
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

const METRIC_CONFIG = {
  mean_effort: {
    label: "Effort",
    color: "#F28F3B",
    unit: "fishers/km²/day"
  },
  mean_cpue: {
    label: "Catch Rate",
    color: "#75ABBC",
    unit: "kg/fisher/day"
  },
  mean_rpue: {
    label: "Fisher Revenue", 
    color: "#4A90E2",
    unit: "KES/fisher/day"
  },
  mean_price_kg: {
    label: "Price per KG",
    color: "#9B59B6", 
    unit: "KES/kg"
  },
  total_catch_kg: {
    label: "Total Catch",
    color: "#E74C3C",
    unit: "kg"
  },
  total_value: {
    label: "Total Value",
    color: "#27AE60",
    unit: "KES"
  },
  n_trips: {
    label: "Number of Trips",
    color: "#F39C12",
    unit: "trips"
  },
  n_fishers: {
    label: "Number of Fishers",
    color: "#3498DB",
    unit: "fishers"
  }
};

interface CatchTimeSeriesProps {
  selectedMetrics: string[];
  months?: number;
  className?: string;
}

export default function CatchTimeSeries({ 
  selectedMetrics, 
  months = 12,
  className = "" 
}: CatchTimeSeriesProps) {
  const { t } = useTranslation("common");
  const [selectedDistricts] = useAtom(districtsAtom);

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

  if (isLoading) {
    return (
      <WidgetCard title="Loading..." className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </WidgetCard>
    );
  }

  if (error || !data) {
    return (
      <WidgetCard title="Error" className={className}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">{t('text-no-data-available')}</p>
        </div>
      </WidgetCard>
    );
  }

  if (chartData.length === 0) {
    return (
      <WidgetCard title="No Data" className={className}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">No data available for selected filters</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Catch Metrics Time Series" className={className}>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string) => [
                value,
                name
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              }}
            />
            <Legend />
            {Object.keys(chartData[0] || {}).filter(key => key !== 'date').map((district, idx) => (
              <Line
                key={district}
                type="monotone"
                dataKey={district}
                stroke={['#4A90E2', '#F28F3B', '#27AE60', '#E74C3C', '#9B59B6', '#F39C12', '#3498DB', '#75ABBC', '#FC3468', '#2ECC71'][idx % 10]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={district}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
} 