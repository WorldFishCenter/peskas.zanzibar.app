'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@components/cards/widget-card';
import { CustomTooltip } from '@components/charts/custom-tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMedia } from '@hooks/use-media';
import { useTranslation } from '@/app/i18n/client';

// Define colors for each gear type
const gearColors = {
  beachseine: '#5a5fd7',
  fence_trap: '#10b981',
  gillnet: '#eab308',
  handline: '#ef4444',
  hook_and_stick: '#8b5cf6',
  monofilament: '#ec4899',
  other_nets: '#14b8a6',
  reefseine: '#f97316',
  ringnet: '#06b6d4',
  setnet: '#6366f1'
};

export default function GearDistribution({
  className,
  lang,
}: {
  className?: string;
  lang?: string;
}) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(lang!);
  const isMediumScreen = useMedia('(max-width: 1200px)', false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/gear-distribution');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching gear distribution:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (!chartData || chartData.length === 0) return <div>No data available.</div>;

  return (
    <WidgetCard 
      title={t('Gear Distribution by Landing Site')} 
      className={className}
    >
      <div className="mt-5 aspect-[1060/660] w-full lg:mt-7">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={isMediumScreen ? 18 : 24}
            margin={{
              left: -10,
            }}
            className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              tickLine={false} 
              dataKey="landing_site" 
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickLine={false}
              label={{ 
                value: 'Percentage (%)', 
                angle: -90, 
                position: 'insideLeft',
                offset: 10
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(gearColors).map((gear) => (
              <Bar
                key={gear}
                dataKey={gear}
                stackId="a"
                fill={gearColors[gear as keyof typeof gearColors]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}