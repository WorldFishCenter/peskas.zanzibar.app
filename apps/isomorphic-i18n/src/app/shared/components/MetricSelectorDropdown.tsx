import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { PiCaretDownBold, PiChartBarDuotone } from 'react-icons/pi';
import { Popover } from 'rizzui';
import cn from '@utils/class-names';
import { METRIC_OPTIONS, MetricOption, MetricKey } from '@/app/shared/file/dashboard/charts/types';
import { CURRENCY_CODE } from '@/config/constants';
import { selectedMetricAtom, selectedRevenueMetricAtom } from '@/app/components/filter-selector';
import { useTranslation } from '@/app/i18n/client';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export default function MetricSelectorDropdown() {
  const { t } = useTranslation('common');
  const [selectedMetric, setSelectedMetric] = useAtom(selectedMetricAtom);
  const [selectedRevenueMetric, setSelectedRevenueMetric] = useAtom(selectedRevenueMetricAtom);
  const [isMetricOpen, setIsMetricOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on the catch page or revenue page
  const isCatchPage = pathname?.includes('/catch');
  const isRevenuePage = pathname?.includes('/revenue');

  // Define catch-specific metrics
  const CATCH_METRIC_OPTIONS: MetricOption[] = [
    {
      value: "mean_cpue",
      label: "Catch Rate",
      unit: "kg/fisher/hour",
      category: "catch",
    },
    {
      value: "estimated_catch_tn",
      label: "Estimated Catch",
      unit: "tonnes",
      category: "catch",
    },
  ];

  // Define revenue-specific metrics
  const REVENUE_METRIC_OPTIONS: MetricOption[] = [
    {
      value: "mean_rpue",
      label: "Fisher Revenue",
      unit: `${CURRENCY_CODE}/fisher/hour`,
      category: "revenue",
    },
    {
      value: "estimated_revenue",
      label: "Estimated Revenue",
      unit: CURRENCY_CODE,
      category: "revenue",
    },
  ];

  // Use page-specific metrics based on current page
  const availableMetrics = isCatchPage ? CATCH_METRIC_OPTIONS : 
                          isRevenuePage ? REVENUE_METRIC_OPTIONS : 
                          METRIC_OPTIONS;

  // Only show the relevant category based on the current page
  const groupedMetrics = isCatchPage ? {
    catch: availableMetrics.filter((m) => m.category === 'catch'),
    revenue: []
  } : isRevenuePage ? {
    catch: [],
    revenue: availableMetrics.filter((m) => m.category === 'revenue')
  } : {
    catch: availableMetrics.filter((m) => m.category === 'catch'),
    revenue: availableMetrics.filter((m) => m.category === 'revenue'),
  };

  // Use the appropriate metric based on the current page
  const currentMetric = isRevenuePage ? selectedRevenueMetric : selectedMetric;
  const setCurrentMetric = isRevenuePage ? setSelectedRevenueMetric : setSelectedMetric;
  
  const selectedMetricOption = availableMetrics.find((m) => m.value === currentMetric);

  const handleMetricSelect = (value: MetricKey) => {
    // Re-picking the current metric is not a filter change. The route-driven resets
    // in the effects below are deliberately not tracked.
    if (value !== currentMetric) {
      trackEvent('filter_metric_change', {
        metric: value,
        control_source: 'header',
      });
    }
    setCurrentMetric(value);
    setIsMetricOpen(false);
  };

  const getDisplayLabel = (option: any) => {
    switch (option.value) {
      case 'mean_effort': return t('text-metrics-effort');
      case 'mean_cpue': return t('text-metrics-catch-rate');
      case 'mean_cpua': return t('text-metrics-catch-density');
      case 'mean_rpue': return t('text-metrics-fisher-revenue');
      case 'mean_rpua': return t('text-metrics-area-revenue');
      case 'estimated_catch_tn': return t('metric-estimated_catch_tn-title');
      default: return option.label;
    }
  };

  const getUnitDisplay = (unit: string) => {
    return unit;
  };

  // If on catch page and selected metric is not available, default to mean_cpue
  useEffect(() => {
    if (isCatchPage && selectedMetric && !availableMetrics.find(m => m.value === selectedMetric)) {
      setSelectedMetric('mean_cpue' as MetricKey);
    }
  }, [isCatchPage, selectedMetric, availableMetrics, setSelectedMetric]);

  // If on revenue page and selected metric is not available, default to estimated_revenue
  useEffect(() => {
    if (isRevenuePage && selectedRevenueMetric && !availableMetrics.find(m => m.value === selectedRevenueMetric)) {
      setSelectedRevenueMetric('estimated_revenue' as MetricKey);
    }
  }, [isRevenuePage, selectedRevenueMetric, availableMetrics, setSelectedRevenueMetric]);

  return (
    <Popover isOpen={isMetricOpen} setIsOpen={setIsMetricOpen} placement="bottom-end">
      <Popover.Trigger>
        <button
          onClick={() => setIsMetricOpen(!isMetricOpen)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 text-sm font-medium rounded-lg transition-all',
            'border border-blue-200/80 dark:border-blue-600/50',
            'bg-blue-50/50 dark:bg-blue-800/20 text-gray-800 dark:text-gray-700',
            'hover:bg-blue-100/70 dark:hover:bg-blue-700/25 hover:border-blue-300 dark:hover:border-blue-500/60',
            'focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600',
            isMetricOpen && 'ring-2 ring-blue-300 dark:ring-blue-600 bg-blue-50 dark:bg-blue-800/30'
          )}
        >
          <PiChartBarDuotone className="h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
          <span className="truncate">
            {selectedMetricOption ? getDisplayLabel(selectedMetricOption) : t('text-metrics-catch')}
          </span>
          <PiCaretDownBold className={cn('h-3 w-3 transition-transform flex-shrink-0', isMetricOpen && 'rotate-180')} />
        </button>
      </Popover.Trigger>
      <Popover.Content className="w-64 p-2 bg-gray-0 dark:bg-gray-50 border border-muted rounded-lg">
        {groupedMetrics.catch.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 px-2 py-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-700">{t('text-metrics-catch')}</span>
            </div>
            <div className="space-y-0.5">
              {groupedMetrics.catch.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMetricSelect(option.value as MetricKey)}
                  className={cn(
                    'w-full px-2 py-1.5 text-left text-sm rounded transition-colors flex flex-col items-start gap-0.5',
                    currentMetric === option.value
                      ? 'bg-blue-50 dark:bg-blue-800 text-blue-900 dark:text-blue-200'
                      : 'text-gray-900 dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100/80'
                  )}
                >
                  <span className="font-medium">{getDisplayLabel(option)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{getUnitDisplay(option.unit)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {groupedMetrics.revenue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-2 py-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-700">{t('text-metrics-revenue')}</span>
            </div>
            <div className="space-y-0.5">
              {groupedMetrics.revenue.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMetricSelect(option.value as MetricKey)}
                  className={cn(
                    'w-full px-2 py-1.5 text-left text-sm rounded transition-colors flex flex-col items-start gap-0.5',
                    currentMetric === option.value
                      ? 'bg-amber-50 dark:bg-amber-800 text-amber-900 dark:text-amber-200'
                      : 'text-gray-900 dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100/80'
                  )}
                >
                  <span className="font-medium">{getDisplayLabel(option)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{getUnitDisplay(option.unit)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
} 