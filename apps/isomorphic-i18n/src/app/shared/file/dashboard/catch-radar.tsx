"use client";

import { useTranslation } from '@/app/i18n/client';
import WidgetCard from '@components/cards/widget-card';
import { useEffect, useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import cn from '@utils/class-names';
import { api } from "@/trpc/react";

interface RadarData {
  month: string;
  meanCatch: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-sm font-medium text-gray-600 mb-1">
          {payload[0].payload.month}
        </p>
        <p className="text-sm">
          <span className="font-medium">Mean Catch:</span>{' '}
          {payload[0].value.toFixed(1)} kg
        </p>
      </div>
    );
  }
  return null;
};

export default function CatchRadarChart({
  className,
  lang,
}: {
  className?: string;
  lang?: string;
}) {
  const [data, setData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(lang!);

  const { data: meanCatch } = api.aggregatedCatch.meanCatchRadar.useQuery();

  useEffect(() => {
    if (!meanCatch) return

    try {
      setLoading(true);
      if (!meanCatch || !Array.isArray(meanCatch) || meanCatch.length === 0) {
        setError('No data available');
        return;
      }

      setData(meanCatch);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [ meanCatch ]);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0) return <div>No data available for Bureni</div>;

  return (
    <WidgetCard
      title={t('Monthly Catch')}
      className={cn('@container', className)}
    >
      <div className="mt-5 h-96 w-full pb-2 @sm:h-96 @xl:pb-0 @2xl:aspect-[1060/660] @2xl:h-auto lg:mt-7">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis
              dataKey="month"
              tick={{ fill: '#666', fontSize: 14 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'auto']}
              tick={{ fill: '#666' }}
            />
            <Radar
              name="Mean Catch"
              dataKey="meanCatch"
              stroke="#0c526e"
              fill="#0c526e"
              fillOpacity={0.25}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}