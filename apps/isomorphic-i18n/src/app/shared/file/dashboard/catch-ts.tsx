"use client";

import React, { useEffect, useState } from "react";
import { Title, Text } from "rizzui";
import WidgetCard from "@components/cards/widget-card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { CustomTooltip } from "@components/charts/custom-tooltip";
import SimpleBar from "@ui/simplebar";
import { useMedia } from "@hooks/use-media";
import { useTranslation } from "@/app/i18n/client";

function CustomYAxisTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" className="fill-gray-500">
        {payload.value}
      </text>
    </g>
  );
}

export default function CatchMonthly({ className, lang }: { className?: string; lang?: string; }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isTablet = useMedia("(max-width: 800px)", false);
  const { t } = useTranslation(lang!, "common");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/aggregated-catch");
        const jsonData = await response.json();

        const processedData = jsonData.map((item: any) => ({
          date: new Date(item.date).getTime(),
          mean_trip_catch: item.mean_trip_catch,
        }));

        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (!chartData || chartData.length === 0)
    return <div>No data available.</div>;

  return (
    <WidgetCard
      title={t("Mean catch per trip (kg)")}
      titleClassName="font-normal text-gray-700 sm:text-base font-inter"
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
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient
                  id="mean_trip_catch"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#6B46FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6B46FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="date"
                scale="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(unixTime) =>
                  new Date(unixTime).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })
                }
                axisLine={false}
                tickLine={false}
                label={{ value: "Date", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
                label={{
                  value: "Mean Trip Catch (kg)",
                  angle: -90,
                  position: "insideCenter",
                  offset: 10,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="mean_trip_catch"
                stroke="#6B46FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#mean_trip_catch)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}