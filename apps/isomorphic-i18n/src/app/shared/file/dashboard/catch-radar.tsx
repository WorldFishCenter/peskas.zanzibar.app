"use client";

import WidgetCard from "@components/cards/widget-card";
import { useAtom } from "jotai";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { districtsAtom, selectedMetricAtom } from "@/app/components/filter-selector";
import { useTranslation } from "@/app/i18n/client";
import { api } from "@/trpc/react";
import cn from "@utils/class-names";
import { useSession } from "next-auth/react";
// Import shared permissions hook
import useUserPermissions from "./hooks/useUserPermissions";
// Import shared color function
import { generateColor, updateBmuColorRegistry } from "./charts/utils";
import { MetricKey, MetricOption, RadarMetricKey } from "./charts/types";

interface RadarData {
  month: string;
  monthDisplay?: string;
  [key: string]: number | string | undefined;
}

interface MetricInfo {
  translationKey: string;
  unit: string;
}

interface VisibilityState {
  [key: string]: { opacity: number };
}

const METRIC_INFO: Record<MetricKey, MetricInfo> = {
  mean_effort: { translationKey: "text-metrics-effort", unit: "fishers/km²/day" },
  mean_cpue: { translationKey: "text-metrics-catch-rate", unit: "kg/fisher/day" },
  mean_rpue: { translationKey: "text-metrics-fisher-revenue", unit: "KSH/fisher/day" },
  mean_price_kg: { translationKey: "text-metrics-price-per-kg", unit: "KSH/kg" },
  mean_cpua: { translationKey: "text-metrics-catch-per-area", unit: "kg/km²/day" },
  mean_rpua: { translationKey: "text-metrics-revenue-per-area", unit: "KSH/km²/day" },
  estimated_catch_tn: { translationKey: "text-metrics-estimated-catch", unit: "tons" },
  estimated_revenue_TZS: { translationKey: "text-metrics-estimated-revenue", unit: "TZS" },
};

const getMetricLabel = (metric: string, t: any): string => {
  const metricKey = metric as MetricKey;
  const translationKey = METRIC_INFO[metricKey]?.translationKey || "text-metrics-catch";
  return t(translationKey);
};

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomTooltip = ({ active, payload, metric, t }: any) => {
  if (active && payload && payload.length) {
    const metricInfo = METRIC_INFO[metric as MetricKey];
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-600 mb-2">
          {payload[0]?.payload?.monthDisplay || 
            payload[0]?.payload?.month || ""}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => {
            // Check if the value is undefined, null, or 0 when it should be N/A
            const isValidValue = entry.value !== undefined && entry.value !== null;
            const displayValue = isValidValue ? entry.value.toFixed(1) : t("text-na");
            
            return (
              <div key={entry.dataKey} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-sm">
                  <span className="font-medium">{entry.name}:</span>{" "}
                  <span className="font-semibold">{displayValue}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const LoadingState = ({ t }: { t: any }) => {
  return (
    <WidgetCard title="" className="h-full">
      <div className="h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">{t("text-loading-chart")}</span>
        </div>
      </div>
    </WidgetCard>
  );
};

const CustomLegend = ({ payload, visibilityState, handleLegendClick, siteColors, localActiveTab }: any) => {
  // Helper function to safely get the site key from an entry
  const getSiteKey = (entry: any): string => {
    return entry.dataKey || entry.value || entry.name || '';
  };
  
  // Helper function to safely get opacity
  const getOpacity = (entry: any): number => {
    const key = getSiteKey(entry);
    return visibilityState[key]?.opacity ?? 1;
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-2">
      {payload?.map((entry: any) => {
        const siteKey = getSiteKey(entry);
        return (
          <div
            key={siteKey || entry.value || Math.random().toString()}
            className="flex items-center gap-2 cursor-pointer select-none transition-all duration-200"
            onClick={() => handleLegendClick(siteKey)}
            style={{ opacity: getOpacity(entry) }}
          >
            <div
              className="w-3 h-3 rounded-full transition-all duration-200"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
};

interface CatchRadarChartProps {
  className?: string;
  lang?: string;
  bmu?: string;
  district?: string;
  activeTab?: string;
}

export default function CatchRadarChart({
  className,
  lang,
  bmu,
  district,
  activeTab = 'standard',
}: CatchRadarChartProps) {
  const { t } = useTranslation(lang!, "common");
  const [districts] = useAtom(districtsAtom);
  const [selectedMetric] = useAtom(selectedMetricAtom);
  
  // Default districts list if none selected
  const defaultDistricts = useMemo(() => [
    'Central', 'North A', 'North B', 'South', 'Urban', 'West',
    'Chake Chake', 'Mkoani', 'Micheweni', 'Wete'
  ], []);
  
  // Use default districts if none are selected
  const selectedDistricts = useMemo(() => 
    district ? [district] : 
    (districts.length > 0 ? districts : defaultDistricts),
    [district, districts, defaultDistricts]
  );
  
  // Use centralized permissions hook
  const {
    userBMU,
    isCiaUser,
    isWbciaUser,
    isAdmin,
    getAccessibleBMUs,
    hasRestrictedAccess,
    shouldShowAggregated,
    canCompareWithOthers
  } = useUserPermissions();
  
  // Determine which district/BMU to use for filtering - prefer district, then bmu, then user's BMU
  const effectiveBMU = district || bmu || userBMU;

  const [data, setData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibilityState, setVisibilityState] = useState<VisibilityState>({});
  const [siteColors, setSiteColors] = useState<Record<string, string>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Add ref to track districts changes
  const previousDistricts = useRef<string[]>([]);
  const previousMetric = useRef<string>(selectedMetric);
  const previousActiveTab = useRef<string>(activeTab);

  // Force refetch when districts or metric changes - optimized with memoized dependency string
  const districtsDependencyString = useMemo(() => JSON.stringify(selectedDistricts), [selectedDistricts]);
  
  // Filter out estimated_revenue_TZS if it's not supported by the radar API
  type SupportedRadarMetric = "mean_effort" | "mean_cpue" | "mean_cpua" | "mean_rpue" | "mean_rpua";
  const supportedRadarMetrics: SupportedRadarMetric[] = ["mean_effort", "mean_cpue", "mean_cpua", "mean_rpue", "mean_rpua"];
  const radarMetric: SupportedRadarMetric = supportedRadarMetrics.includes(selectedMetric as any) 
    ? selectedMetric as SupportedRadarMetric
    : "mean_cpue"; // Default to mean_cpue if metric not supported
  
  const { data: meanCatch, isLoading: isFetching, error: queryError, refetch } =
    api.aggregatedCatch.meanCatchRadar.useQuery(
      { bmus: selectedDistricts, metric: radarMetric },
      {
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: true, // Always enabled now
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      }
    );

  // Force refetch when districts or metric changes - more efficient check
  useEffect(() => {
    // Save current scroll position
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    
    // Check if districts array or metric has changed
    const districtsChanged = JSON.stringify(previousDistricts.current) !== districtsDependencyString;
    const metricChanged = previousMetric.current !== selectedMetric;
    const tabChanged = previousActiveTab.current !== activeTab;
    
    if (districtsChanged || metricChanged) {
      console.log('Districts or metric changed, refetching data');
      setData([]);
      setIsInitialLoad(true);
      previousDistricts.current = [...selectedDistricts];
      previousMetric.current = selectedMetric;
      previousActiveTab.current = activeTab;
      refetch();
    } else if (tabChanged) {
      // Just update the tab reference without refetching
      previousActiveTab.current = activeTab;
      setIsInitialLoad(true);
    }
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 10);
  }, [districtsDependencyString, selectedMetric, activeTab, refetch, selectedDistricts]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      console.error('Error fetching radar data:', queryError);
      setError(t('text-failed-to-fetch-data'));
      setLoading(false);
    }
  }, [queryError, t]);

  // Memoize data processing logic to avoid unnecessary recalculations
  const processedData = useMemo(() => {
    // Return early if conditions aren't met for processing
    if (isFetching || !meanCatch || selectedDistricts.length === 0) {
      return { data: [], error: null, siteColors: {}, visibilityState: {} };
    }
    
    try {
      if (!Array.isArray(meanCatch) || meanCatch.length === 0) {
        return { data: [], error: t("text-no-data-available"), siteColors: {}, visibilityState: {} };
      }

      // Extract unique BMUs from all data points
      const uniqueSitesSet = meanCatch.reduce((sites, item) => {
        Object.keys(item).forEach((key) => {
          if (key !== "month") sites.add(key);
        });
        return sites;
      }, new Set<string>());
      const uniqueSites: string[] = Array.from(uniqueSitesSet);

      // If no sites found, show error
      if (uniqueSites.length === 0) {
        return { data: [], error: t("text-no-bmu-data-available"), siteColors: {}, visibilityState: {} };
      }

      // Apply user permissions to filter BMUs
      const accessibleSites = hasRestrictedAccess 
        ? getAccessibleBMUs(uniqueSites) 
        : uniqueSites;

      // Update the global BMU color registry to ensure unique colors
      updateBmuColorRegistry(uniqueSites);

      const newSiteColors = uniqueSites.reduce<Record<string, string>>(
        (acc: Record<string, string>, site: string, index: number) => {
          acc[site] = generateColor(index, site, effectiveBMU || undefined);
          return acc;
        },
        {}
      );

      const newVisibilityState: VisibilityState =
        uniqueSites.reduce<VisibilityState>(
          (acc: VisibilityState, site: string) => ({
            ...acc,
            [site]: { 
              opacity: hasRestrictedAccess
                ? accessibleSites.includes(site) ? 1 : 0.2
                : site === effectiveBMU ? 1 : 0.2 
            },
          }),
          {}
        );

      // Create a map to track which sites have data for which months
      const dataMap: Record<string, Record<string, number | string>> = {};
      
      // First pass: collect all available data
      meanCatch.forEach((item) => {
        const month = item.month;
        if (!dataMap[month]) {
          dataMap[month] = { month, monthDisplay: month };
        }
        
        // Add any data values present in this item
        Object.entries(item).forEach(([key, value]) => {
          if (key !== 'month' && key !== 'monthDisplay' && value !== undefined && value !== null) {
            dataMap[month][key] = value as string | number;
          }
        });
      });
      
      // Process and sort the data by month
      let processedData = MONTH_ORDER
        .filter(month => dataMap[month]) // Only include months that have data
        .map(month => {
          const completeItem: RadarData = { 
            month, 
            monthDisplay: month 
          };
          
          // For each site, use the value from dataMap if available, otherwise undefined
          // Using undefined instead of 0 ensures proper gaps in visualizations
          uniqueSites.forEach(site => {
            completeItem[site] = dataMap[month][site] !== undefined 
              ? dataMap[month][site] 
              : undefined; // Use undefined instead of 0 to show gaps
          });
          
          return completeItem;
        });

      // Calculate differenced data if needed
      if (activeTab === 'differenced' && effectiveBMU) {
        processedData = processedData.map(item => {
          const userValue = Number(item[effectiveBMU]);
          // Only calculate difference if the BMU has data for this month
          if (isNaN(userValue) || userValue === 0) {
            return {
              month: item.month,
              [effectiveBMU]: 0
            };
          }

          const otherBMUs = uniqueSites.filter(site => 
            site !== effectiveBMU && 
            !isNaN(Number(item[site])) && 
            Number(item[site]) !== 0
          );

          // Only calculate average if there are other BMUs with data
          if (otherBMUs.length === 0) {
            return {
              month: item.month,
              [effectiveBMU]: 0
            };
          }

          const otherAverage = otherBMUs.reduce((sum, site) => {
            return sum + Number(item[site] || 0);
          }, 0) / otherBMUs.length;

          return {
            month: item.month,
            [effectiveBMU]: userValue - otherAverage
          };
        }).filter(item => Number(item[effectiveBMU]) !== 0); // Remove months with no valid difference
      }

      return { 
        data: processedData, 
        error: null,
        siteColors: newSiteColors,
        visibilityState: newVisibilityState,
      };
    } catch (e) {
      console.error("Error processing data:", e);
      return { 
        data: [], 
        error: t("text-error-processing-data"),
        siteColors: {},
        visibilityState: {}
      };
    }
  }, [meanCatch, activeTab, effectiveBMU, hasRestrictedAccess, getAccessibleBMUs, t, isFetching, selectedDistricts.length]);

  // Update state based on memoized processed data
  useEffect(() => {
    // Skip if we're still loading and have no changes
    if (!isInitialLoad && !isFetching && selectedDistricts.length > 0 && 
        JSON.stringify(previousDistricts.current) === districtsDependencyString &&
        previousMetric.current === selectedMetric &&
        previousActiveTab.current === activeTab) return;
    
    setLoading(true);
    
    // If not actively fetching, update states with processed data
    if (!isFetching) {
      setData(processedData.data);
      setError(processedData.error);
      
      // Only update site colors and visibility if they've changed
      if (Object.keys(processedData.siteColors).length > 0) {
        setSiteColors(processedData.siteColors);
      }
      
      if (Object.keys(processedData.visibilityState).length > 0) {
        setVisibilityState(processedData.visibilityState);
      }
      
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [districtsDependencyString, selectedMetric, activeTab, processedData, isFetching, isInitialLoad, selectedDistricts.length]);

  // Memoize legend click handler
  const handleLegendClick = useCallback((site: string) => {
    // Save current scroll position
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    
    setVisibilityState((prev) => ({
      ...prev,
      [site]: {
        opacity: prev[site]?.opacity === 1 ? 0.2 : 1,
      },
    }));
    
    // Restore scroll position after DOM updates
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 10);
  }, []);

  // Memoize the custom legend component
  const MemoizedCustomLegend = useCallback((props: any) => (
    <CustomLegend
      {...props}
      visibilityState={visibilityState}
      handleLegendClick={handleLegendClick}
      siteColors={siteColors}
      localActiveTab={activeTab}
      isCiaUser={isCiaUser}
    />
  ), [visibilityState, handleLegendClick, siteColors, activeTab, isCiaUser]);

  // Memoize the tooltip component
  const MemoizedCustomTooltip = useCallback((props: any) => (
    <CustomTooltip {...props} metric={selectedMetric} t={t} />
  ), [selectedMetric, t]);

  if (loading || isFetching) return <LoadingState t={t} />;

  if (error) {
    return (
      <WidgetCard title={getMetricLabel(selectedMetric, t)} className={cn("h-full", className)}>
        <div className="h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] w-full flex items-center justify-center">
          <span className="text-sm text-gray-500">{t("text-error")}: {error}</span>
        </div>
      </WidgetCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <WidgetCard title={getMetricLabel(selectedMetric, t)} className={cn("h-full", className)}>
        <div className="h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] w-full flex items-center justify-center">
          <span className="text-sm text-gray-500">{t("text-no-data-available")}</span>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={getMetricLabel(selectedMetric, t)}
      className={cn("h-full", className)}
    >
      <div className="h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] w-full flex items-center justify-center">
        {/* Render chart if data is available */}
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            className="w-full h-full"
            outerRadius="95%"
            cx="50%"
            cy="47%"
          >
            <PolarGrid 
              gridType="polygon" 
              strokeWidth={0.5} 
              stroke="#e2e8f0" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 400 }}
              tickLine={false}
              stroke="#cbd5e1"
              strokeWidth={0.5}
            />
            <PolarRadiusAxis
              angle={90}
              domain={activeTab === 'differenced' ? ['auto', 'auto'] : [0, 'auto']}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickCount={5}
              axisLine={false}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              strokeWidth={0.5}
            />
            {Object.entries(siteColors).map(([site, color]) => {
              // In differenced mode, only show the selected BMU
              if (activeTab === 'differenced' && site !== effectiveBMU) {
                return null;
              }
              const opacity = visibilityState[site]?.opacity ?? 1;
              return (
                <Radar
                  key={site}
                  name={site}
                  dataKey={site}
                  stroke={activeTab === 'differenced' ? "#fc3468" : color}
                  fill={activeTab === 'differenced' ? "#fc3468" : color}
                  fillOpacity={opacity * 0.05}
                  strokeOpacity={opacity}
                  strokeWidth={2}
                  dot
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              );
            })}
            <Tooltip content={MemoizedCustomTooltip} wrapperStyle={{ outline: 'none' }} />
            {activeTab !== 'differenced' && (
              <Legend
                content={MemoizedCustomLegend}
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ position: 'absolute', bottom: '-15px', left: 0, right: 0 }}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}