"use client";

import { Text, Button } from "rizzui";
import cn from "@utils/class-names";
import { useScrollableSlider } from "@hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  LabelList,
  Tooltip,
} from 'recharts';
import { activeCountry } from "@/config/countryConfig";
import { CURRENCY_CODE, LOCALE } from "@/config/constants";

type FileStatsType = {
  className?: string;
  lang?: string;
};

const METRIC_CONFIG = {
  n_submissions: {
    titleKey: 'metric-n_submissions-title',
    unitKey: 'metric-n_submissions-unit',
    descKey: 'metric-n_submissions-desc',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  // n_fishers: disabled — not available in current data pipeline
  // {
  //   titleKey: 'metric-n_fishers-title',
  //   unitKey: 'metric-n_fishers-unit',
  //   descKey: 'metric-n_fishers-desc',
  //   color: '#F28F3B',
  //   currentColor: '#75ABBC',
  // },
  trip_duration_hrs: {
    titleKey: 'metric-trip_duration_hrs-title',
    unitKey: 'metric-trip_duration_hrs-unit',
    descKey: 'metric-trip_duration_hrs-desc',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  mean_cpue: {
    titleKey: 'metric-mean_cpue-title',
    unitKey: 'metric-mean_cpue-unit',
    descKey: 'metric-mean_cpue-desc',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  mean_rpue: {
    titleKey: 'metric-mean_rpue-title',
    unitKey: 'metric-mean_rpue-unit',
    descKey: 'metric-mean_rpue-desc',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  // mean_price_kg: disabled — not available in current data pipeline
  // {
  //   titleKey: 'metric-mean_price_kg-title',
  //   unitKey: 'metric-mean_price_kg-unit',
  //   descKey: 'metric-mean_price_kg-desc',
  //   color: '#F28F3B',
  //   currentColor: '#75ABBC',
  // },
  estimated_catch_tn: {
    titleKey: 'metric-estimated_catch_tn-title',
    unitKey: 'metric-estimated_catch_tn-unit',
    descKey: 'metric-estimated_catch_tn-desc',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
  estimated_revenue: {
    titleKey: 'metric-estimated_revenue-title',
    unitKey: 'metric-estimated_revenue-unit',
    descKey: 'metric-estimated_revenue-desc',
    color: '#F28F3B',
    currentColor: '#75ABBC',
  },
};

type MetricConfigEntry = (typeof METRIC_CONFIG)[keyof typeof METRIC_CONFIG];
type MetricDataPoint = { month: string } & Record<string, number | null>;
type MonthlyRegionData = { data: MetricDataPoint[]; months?: string[] };

function MetricBarCard({
  metric,
  config,
  data,
  lang
}: {
  metric: string;
  config: MetricConfigEntry;
  data: MonthlyRegionData;
  lang?: string;
}) {
  const resolvedLang = lang ?? 'en';
  const { t } = useTranslation(resolvedLang, 'common');
  const regionBreakdown = activeCountry.features.regionBreakdown;

  if (!data || !data.data || data.data.length === 0) {
    return null;
  }

  // Take last 3 months of data
  const last3Months = data.data.slice(-3);

  // Use the months from the API if available, otherwise fallback to last3Months
  const allMonths = (data.months && data.months.slice(-3)) || last3Months.map((item) => item.month);

  // Build chartData for all months, filling missing region/total values with null
  const chartData = allMonths.map((month: string) => {
    const item: Partial<MetricDataPoint> = last3Months.find((d) => d.month === month) ?? {};
    const entry: Record<string, string | number | null> = { month };
    if (regionBreakdown) {
      regionBreakdown.regions.forEach((region) => {
        entry[region] = item[region] ?? null;
      });
    } else {
      entry['total'] = item.total ?? null;
    }
    return entry;
  });

  // Helper to format values with commas or compact notation for large numbers
  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    // Special case: Estimated Revenue always in millions
    if (metric === 'estimated_revenue') {
      const millions = value / 1_000_000;
      return millions.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 0 }) + 'M';
    }
    if (Math.abs(value) >= 1_000_000) {
      return new Intl.NumberFormat(lang || LOCALE, { notation: 'compact', maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(value);
    }
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  };

  const lastDataPoint = last3Months[last3Months.length - 1];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 bg-gray-0/95 backdrop-blur-sm shadow-xl rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex flex-col gap-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <span className="text-gray-500 whitespace-nowrap">{entry.name}:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    {formatValue(entry.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-muted bg-gray-0 p-4 sm:p-6 dark:bg-gray-50 dark:border-gray-700 rounded-xl min-w-[180px] max-w-full sm:min-w-[260px] sm:max-w-[320px] flex flex-col overflow-visible transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-500 hover:-translate-y-1 cursor-default">
      <div className="mb-2" style={{ minHeight: 48 }}>
        {/* 1st row: Metric name (unit) */}
        <Text className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-700">
          {t(config.titleKey)}{t(config.unitKey, { currency: CURRENCY_CODE }) ? ` (${t(config.unitKey, { currency: CURRENCY_CODE })})` : ''}
        </Text>
        {/* 2nd row: Metric description */}
        <Text className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t(config.descKey)}</Text>
      </div>
      {regionBreakdown && (
        <div className="flex items-baseline gap-3 mb-2">
          <div className="flex gap-2 text-sm sm:text-base">
            {regionBreakdown.regions.map((region) => (
              <span key={region} className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: regionBreakdown.colors[region] }} />
                <span className="text-gray-700 dark:text-gray-700">{region}: {formatValue(lastDataPoint?.[region])}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 flex items-end">
        <div className="w-full h-32 sm:h-30">
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(100, 116, 139, 0.08)' }}
              />
              {regionBreakdown
                ? regionBreakdown.regions.map((region) => (
                  <Bar key={region} dataKey={region} fill={regionBreakdown.colors[region]} radius={[4, 4, 0, 0]} barSize={18} minPointSize={6}>
                    <LabelList dataKey={region} position="top" formatter={formatValue} fill={regionBreakdown.colors[region]} style={{ fontSize: 11, fontWeight: 600 }} />
                  </Bar>
                ))
                : (
                  <Bar dataKey="total" fill="#64748b" radius={[4, 4, 0, 0]} barSize={18} minPointSize={6}>
                    <LabelList dataKey="total" position="top" formatter={formatValue} fill="#64748b" style={{ fontSize: 11, fontWeight: 600 }} />
                  </Bar>
                )
              }
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function FileStatGrid({ className, lang }: { className?: string; lang?: string }) {
  const resolvedLang = lang ?? 'en';
  const { t } = useTranslation(resolvedLang, 'common');

  // Fetch monthly region summary data for last 3 months
  const { data: monthlyData, isLoading, error } = api.districtSummary.getMonthlyRegionSummary.useQuery(
    { months: 3 },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  );

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

export default function MetricCards({ className, lang }: FileStatsType) {
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
        'relative flex w-auto items-center min-h-[224px]',
        className
      )}
    >
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-2 top-1/2 -translate-y-1/2 z-10 !h-10 !w-10 !justify-center rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50 hover:scale-110 transition-transform 3xl:hidden flex items-center p-0 hover:bg-white dark:hover:bg-gray-800"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden -mx-2 px-2">
        <div
          ref={sliderEl}
          className="custom-scrollbar-x grid grid-flow-col gap-5 overflow-x-auto scroll-smooth py-2 px-1"
        >
          <FileStatGrid className={className} lang={lang} />
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="!absolute -right-2 top-1/2 -translate-y-1/2 z-10 !h-10 !w-10 !justify-center rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50 hover:scale-110 transition-transform 3xl:hidden flex items-center p-0 hover:bg-white dark:hover:bg-gray-800"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}