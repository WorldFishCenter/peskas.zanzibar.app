"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import { useAtom } from "jotai";
import { districtsAtom } from "@/app/components/filter-selector";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
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
  },
  estimated_catch_tn: {
    label: "Estimated Catch",
    color: "#8E44AD",
    unit: "tonnes"
  }
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

interface CatchRadarProps {
  selectedMetrics: string[];
  year?: number;
  className?: string;
}

export default function CatchRadar({ 
  selectedMetrics, 
  year = new Date().getFullYear(),
  className = "" 
}: CatchRadarProps) {
  const { t } = useTranslation("common");
  const [selectedDistricts] = useAtom(districtsAtom);

  const { data, isLoading, error } = api.monthlySummary.radarData.useQuery(
    {
      districts: selectedDistricts,
      metrics: selectedMetrics,
      year
    },
    {
      enabled: selectedDistricts.length > 0 && selectedMetrics.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  );

  const chartData = useMemo(() => {
    if (!data) return [];

    return MONTHS.map((month, index) => {
      const point: any = { month };
      
      selectedMetrics.forEach(metric => {
        if (data[index] && data[index][metric] !== undefined) {
          point[metric] = Math.round(data[index][metric] * 100) / 100; // Round to 2 decimals
        } else {
          point[metric] = 0;
        }
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
    <WidgetCard 
      title={`Catch Metrics Seasonality (${year})`}
      className={className}
    >
      <div className="h-96 sm:h-[18rem] md:h-[22rem] lg:h-[26rem] xl:h-[30rem]">
      <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey="month" />
            <PolarRadiusAxis />
            <Tooltip 
              formatter={(value: any, name: string) => [
                `${value} ${METRIC_CONFIG[name as keyof typeof METRIC_CONFIG]?.unit || ''}`,
                METRIC_CONFIG[name as keyof typeof METRIC_CONFIG]?.label || name
              ]}
            />
            <Legend />
            {selectedMetrics.map((metric) => (
              <Radar
                key={metric}
                name={METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG]?.label}
                dataKey={metric}
                stroke={METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG]?.color}
                fill={METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG]?.color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
} 