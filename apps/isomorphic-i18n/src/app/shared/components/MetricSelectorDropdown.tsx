import { useAtom } from 'jotai';
import { useState } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import cn from '@utils/class-names';
import { METRIC_OPTIONS } from '@/app/shared/file/dashboard/charts/types';
import { selectedMetricAtom } from '@/app/components/filter-selector';
import { useTranslation } from '@/app/i18n/client';

export default function MetricSelectorDropdown() {
  const { t } = useTranslation('common');
  const [selectedMetric, setSelectedMetric] = useAtom(selectedMetricAtom);
  const [isMetricOpen, setIsMetricOpen] = useState(false);

  const groupedMetrics = {
    catch: METRIC_OPTIONS.filter((m) => m.category === 'catch'),
    revenue: METRIC_OPTIONS.filter((m) => m.category === 'revenue'),
  };

  const selectedMetricOption = METRIC_OPTIONS.find((m) => m.value === selectedMetric);

  const getDisplayLabel = (option: any) => {
    switch (option.value) {
      case 'mean_effort': return t('text-metrics-effort');
      case 'mean_cpue': return t('text-metrics-catch-rate');
      case 'mean_cpua': return t('text-metrics-catch-density');
      case 'mean_rpue': return t('text-metrics-fisher-revenue');
      case 'mean_rpua': return t('text-metrics-area-revenue');
      default: return option.label;
    }
  };

  const getUnitDisplay = (unit: string) => {
    return unit;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMetricOpen(!isMetricOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border border-muted bg-gray-0 dark:bg-gray-50 text-gray-900 dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100/80 focus:ring-2 focus:ring-blue-200',
          isMetricOpen && 'ring-2 ring-blue-200'
        )}
      >
        <span className="truncate">
          {selectedMetricOption ? getDisplayLabel(selectedMetricOption) : t('text-metrics-catch')}
        </span>
        <PiCaretDownBold className={cn('h-3 w-3 transition-transform flex-shrink-0', isMetricOpen && 'rotate-180')} />
      </button>
      {isMetricOpen && (
        <>
          <div className="fixed inset-0 z-[1000]" onClick={() => setIsMetricOpen(false)} />
          <div className="absolute left-1/2 sm:left-auto sm:right-0 top-full mt-1 w-80 sm:w-64 -translate-x-1/2 sm:translate-x-0 bg-gray-0 dark:bg-gray-50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-[1001] max-h-96 overflow-y-auto">
            <div className="p-2">
              {/* Catch Metrics */}
              <div className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">{t('text-metrics-catch')}</span>
                </div>
                <div className="space-y-0.5">
                  {groupedMetrics.catch.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedMetric(option.value);
                        setIsMetricOpen(false);
                      }}
                      className={cn(
                        'w-full px-2 py-1.5 text-left text-sm rounded transition-colors',
                        'flex flex-col items-start gap-0.5',
                        selectedMetric === option.value
                          ? 'bg-blue-50 dark:bg-blue-800 text-blue-900 dark:text-blue-200'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className="font-medium">{getDisplayLabel(option)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getUnitDisplay(option.unit)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Revenue Metrics */}
              <div>
                <div className="flex items-center gap-2 px-2 py-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">{t('text-metrics-revenue')}</span>
                </div>
                <div className="space-y-0.5">
                  {groupedMetrics.revenue.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedMetric(option.value);
                        setIsMetricOpen(false);
                      }}
                      className={cn(
                        'w-full px-2 py-1.5 text-left text-sm rounded transition-colors',
                        'flex flex-col items-start gap-0.5',
                        selectedMetric === option.value
                          ? 'bg-amber-50 dark:bg-amber-800 text-amber-900 dark:text-amber-200'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className="font-medium">{getDisplayLabel(option)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getUnitDisplay(option.unit)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 