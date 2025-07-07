"use client";

import { Text } from "rizzui";
import cn from "@utils/class-names";
import { useScrollableSlider } from "@hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { Button } from "rizzui";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

type FileStatsType = {
  className?: string;
  lang?: string;
};

const METRIC_CONFIG = {
  n_submissions: {
    title: 'n_submissions',
    unit: '',
    description: 'Number of submissions per month by island',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  n_fishers: {
    title: 'n_fishers',
    unit: '',
    description: 'Number of fishers per month by island',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  trip_duration: {
    title: 'trip_duration',
    unit: '',
    description: 'Average trip duration per month by island',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  mean_cpue: {
    title: 'mean_cpue',
    unit: '',
    description: 'Mean catch per unit effort (CPUE) per month by island',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  mean_rpue: {
    title: 'mean_rpue',
    unit: '',
    description: 'Mean revenue per unit effort (RPUE) per month by island',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  mean_price_kg: {
    title: 'mean_price_kg',
    unit: '',
    description: 'Mean price per kg per month by island',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
};

function MetricBarCard({ 
  metric, 
  config, 
  data,
  lang 
}: { 
  metric: string;
  config: any;
  data: any;
  lang?: string;
}) {
  const { t } = useTranslation(lang!, 'common');
  
  if (!data || !data.data || data.data.length === 0) {
    return null;
  }

  // Take last 3 months of data
  const last3Months = data.data.slice(-3);

  // Prepare chart data for grouped bars
  const chartData = last3Months.map((item: any) => ({
    month: item.month.split(' ')[0], // Only show the month name (e.g., 'May')
    Unguja: item.Unguja,
    Pemba: item.Pemba,
  }));

  // Get individual region values for current month
  const lastDataPoint = last3Months[last3Months.length - 1];
  const ungujaValue = Math.round(lastDataPoint?.Unguja || 0);
  const pembaValue = Math.round(lastDataPoint?.Pemba || 0);

  return (
    <div className="border border-muted bg-gray-0 p-4 sm:p-6 dark:bg-gray-50 rounded-xl min-w-[180px] max-w-full sm:min-w-[260px] sm:max-w-[320px] flex flex-col overflow-visible">
      <div className="mb-2" style={{ minHeight: 48 }}>
        <Text className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-700">
          {config.title} <span className="text-[11px] sm:text-sm font-normal text-gray-500 dark:text-gray-400">{config.unit}</span>
        </Text>
        <Text className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{config.description}</Text>
      </div>
      <div className="flex items-baseline gap-3 mb-2">
        <div className="flex gap-2 text-sm sm:text-base">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{background:'#F28F3B'}}></span><span className="text-gray-700 dark:text-gray-700">Unguja: {ungujaValue}</span></span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{background:'#75ABBC'}}></span><span className="text-gray-700 dark:text-gray-700">Pemba: {pembaValue}</span></span>
        </div>
      </div>
      <div className="flex-1 flex items-end">
        <div className="w-full h-16 sm:h-24">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              barCategoryGap={0}
            >
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                className="dark:fill-gray-300"
              />
              <Bar dataKey="Unguja" fill="#F28F3B" radius={[2, 2, 0, 0]} barSize={18}>
                <LabelList dataKey="Unguja" position="top" formatter={(value: number) => Math.round(value)} style={{ fontSize: 11, fontWeight: 600, fill: '#F28F3B' }} className="dark:fill-gray-100" />
              </Bar>
              <Bar dataKey="Pemba" fill="#75ABBC" radius={[2, 2, 0, 0]} barSize={18}>
                <LabelList dataKey="Pemba" position="top" formatter={(value: number) => Math.round(value)} style={{ fontSize: 11, fontWeight: 600, fill: '#75ABBC' }} className="dark:fill-gray-100" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function FileStatGrid({ className, lang }: { className?: string; lang?: string }) {
  const { t } = useTranslation(lang!, 'common');
  
  // Fetch monthly region summary data for last 3 months
  const { data: monthlyData, isLoading, error } = api.districtSummary.getMonthlyRegionSummary.useQuery(
    { months: 3 },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  );
  console.log('monthlyData', monthlyData);

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="min-w-[240px] max-w-[280px] animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        ))}
      </>
    );
  }

  if (error || !monthlyData) {
    return (
      <div className="min-w-[240px] col-span-full">
        <div className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Text className="text-gray-500 dark:text-gray-400">{t('text-no-data-available')}</Text>
        </div>
      </div>
    );
  }

  // Only show the metrics that have data
  const metricsToShow = Object.entries(METRIC_CONFIG).filter(([metric]) => 
    monthlyData[metric] && monthlyData[metric].data && monthlyData[metric].data.length > 0
  );

  return (
    <>
      {metricsToShow.map(([metric, config]) => (
        <MetricBarCard
          key={metric}
          metric={metric}
          config={config}
          data={monthlyData[metric]}
          lang={lang}
        />
      ))}
    </>
  );
}

export default function FileStats({ className, lang }: FileStatsType) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  return (
    <div
      className={cn(
        'relative flex w-auto items-center overflow-hidden',
        className
      )}
    >
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-1 top-0 z-10 !h-full w-12 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 3xl:hidden dark:from-gray-50 dark:via-gray-50/70"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden">
        <div
          ref={sliderEl}
          className="custom-scrollbar-x grid grid-flow-col gap-4 overflow-x-auto scroll-smooth"
        >
          <FileStatGrid className={className} lang={lang} />
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="!absolute right-0 top-0 z-10 !h-full w-12 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 3xl:hidden dark:from-gray-50 dark:via-gray-50/70"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}