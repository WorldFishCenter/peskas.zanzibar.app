"use client";

import React, { useEffect, useState } from "react";
import WidgetCard from "@components/cards/widget-card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import SimpleBar from "@ui/simplebar";
import { useMedia } from "@hooks/use-media";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";

interface ChartDataPoint {
  date: number;
  mean_catch: number;
}

interface ApiDataPoint {
  date: string;
  mean_trip_catch: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.[0]) {
    const date = new Date(label);
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-sm font-medium text-gray-600 mb-2">
          {date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0c526e]" />
          <p className="text-sm">
            <span className="font-medium">Average Catch:</span>{' '}
            {payload[0].value.toFixed(1)} kg
          </p>
        </div>
      </div>
    );
  }
  return null;
};

function CustomYAxisTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" className="text-xs fill-gray-500">
        {payload.value.toFixed(0)}
      </text>
    </g>
  );
}

export default function CatchMonthly({ className, lang }: { className?: string; lang?: string; }) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [fiveYearMarks, setFiveYearMarks] = useState<number[]>([]);
  const isTablet = useMedia("(max-width: 800px)", false);
  const { t } = useTranslation(lang!, "common");

  const { data: monthlyData } = api.aggregatedCatch.monthly.useQuery();

  useEffect(() => {
    if (!monthlyData) return

    try {
      const processedData = monthlyData.map((item: ApiDataPoint) => ({
        date: new Date(item.date).getTime(),
        mean_catch: item.mean_trip_catch,
      }));
      
      // Find 5-year interval marks
      const allYears = processedData.map((item: ChartDataPoint) => new Date(item.date).getFullYear());
      const minYear = Math.min(...allYears);
      const maxYear = Math.max(...allYears);
      const startYear = Math.floor(minYear / 5) * 5;
      const marks: number[] = [];
      
      for (let year = startYear; year <= maxYear; year += 5) {
        marks.push(new Date(`${year}-01-01`).getTime());
      }
      
      setFiveYearMarks(marks);
      setChartData(processedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }    
  }, [ monthlyData ]);

  if (loading) return <div>Loading chart...</div>;
  if (!chartData || chartData.length === 0) return <div>No data available.</div>;

  return (
    <WidgetCard
      title={t("Mean catch per trip (kg)")}
      //titleClassName="font-normal text-gray-700 sm:text-base font-inter"
      className={className}
    >
      <SimpleBar>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: "700px" })}
          >
            <AreaChart
              data={chartData}
              margin={{
                left: 16,
                right: 16,
                bottom: 20
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient
                  id="mean_catch"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0c526e" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="#0c526e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="date"
                scale="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(unixTime) => {
                  if (fiveYearMarks.includes(unixTime)) {
                    return new Date(unixTime).getFullYear().toString();
                  }
                  return '';
                }}
                ticks={fiveYearMarks}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              {fiveYearMarks.map((date) => (
                <ReferenceLine
                  key={date}
                  x={date}
                  stroke="#718096"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              ))}
              <Area
                type="monotone"
                dataKey="mean_catch"
                stroke="#0c526e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#mean_catch)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}