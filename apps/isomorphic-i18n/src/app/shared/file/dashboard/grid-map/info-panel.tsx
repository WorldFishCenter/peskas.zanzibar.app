'use client';
import React, { useMemo, memo, ReactNode } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { TIME_BREAKS, COLOR_RANGE, SHARED_STYLES } from '@/app/constants/mapConfig';
import type { Theme, TimeBreak, DataPoint, TimeRangeButtonProps, InfoPanelProps } from './types';

type Stats = {
  totalVisits: string;
  avgTime: string;
  maxTime: string;
  gridCells: string;
  avgSpeed: string;
};

function calculateStats(data: DataPoint[]): Stats {
  const totalVisits = data.reduce((sum, d) => sum + (d.totalVisits || 0), 0);
  const avgTime = data.reduce((sum, d) => sum + (d.avgTimeHours || 0), 0) / (data.length || 1);
  const maxTime = Math.max(...data.map(d => d.avgTimeHours || 0), 0);
  const avgSpeed = data.reduce((sum, d) => sum + (d.avgSpeed || 0), 0) / (data.length || 1);
  return {
    totalVisits: totalVisits.toLocaleString(),
    avgTime: avgTime.toFixed(1),
    maxTime: maxTime.toFixed(1),
    gridCells: data.length.toLocaleString(),
    avgSpeed: avgSpeed.toFixed(1),
  };
}

export const TimeRangeButton = memo(function TimeRangeButton({
  range,
  index,
  isSelected,
  colorRange,
  theme,
  onToggle,
}: TimeRangeButtonProps) {
  return (
    <div
      onClick={() => onToggle(range)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        cursor: 'pointer',
        backgroundColor: isSelected
          ? theme === 'dark'
            ? 'rgba(59, 130, 246, 0.15)'
            : 'rgba(59, 130, 246, 0.1)'
          : 'transparent',
        borderRadius: '4px',
        opacity: isSelected ? 1 : 0.6,
        transition: SHARED_STYLES.transitions.default,
      }}
    >
      <div
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: `rgb(${colorRange[index].join(',')})`,
          marginRight: '6px',
          borderRadius: '2px',
        }}
      />
      <span
        style={{
          fontSize: '12px',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        }}
      >
        {range.label}
      </span>
    </div>
  );
});

export const InfoPanel = memo(function InfoPanel({
  theme,
  data,
  colorRange,
  selectedRanges,
  onRangeToggle,
  choroplethLegend,
}: InfoPanelProps) {
  const { t } = useTranslation('common');
  const stats = useMemo(() => calculateStats(data), [data]);
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        padding: '16px',
        width: '380px',
        zIndex: 1,
        ...SHARED_STYLES.glassPanel(theme),
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          ...(SHARED_STYLES.text.heading(theme) as React.CSSProperties),
        }}
      >
        {t('info-fishing-effort-title')}
      </h3>
      <div
        style={{
          marginBottom: '20px',
          padding: '8px 12px',
          backgroundColor:
            theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
          fontSize: '13px',
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          <strong>{t('info-grid-resolution')}</strong> {t('info-grid-resolution-value')}
        </div>
        <div
          style={{
            color:
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(0, 0, 0, 0.7)',
            fontSize: '12px',
            lineHeight: '1.4',
          }}
        >
          {t('info-each-cell')}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            marginBottom: '8px',
            ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
          }}
        >
          {t('info-average-time-spent')}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              height: '8px',
              flex: 1,
              background: `linear-gradient(to right, ${colorRange
                .map((c: number[]) => `rgb(${c.join(',')})`)
                .join(', ')})`,
              borderRadius: '4px',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
          }}
        >
          <span>{t('info-fewer-hours')}</span>
          <span>{t('info-more-hours')}</span>
        </div>
      </div>
      {choroplethLegend && (
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              marginBottom: '8px',
              ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
            }}
          >
            {choroplethLegend.metricLabel}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                height: '8px',
                flex: 1,
                background: `linear-gradient(to right, ${choroplethLegend.colors
                  .map((c) => `rgb(${c.join(',')})`)
                  .join(', ')})`,
                borderRadius: '4px',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
            }}
          >
            <span>{choroplethLegend.minLabel}</span>
            <span>{choroplethLegend.maxLabel}</span>
          </div>
        </div>
      )}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            marginBottom: '8px',
            ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
          }}
        >
          {t('info-time-ranges')}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
          }}
        >
          {TIME_BREAKS.map((range: TimeBreak, i: number) => (
            <TimeRangeButton
              key={range.label}
              range={range}
              index={i}
              isSelected={selectedRanges.some(
                (r: TimeBreak) => r.min === range.min && r.max === range.max
              )}
              colorRange={colorRange}
              theme={theme}
              onToggle={onRangeToggle}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              marginBottom: '4px',
              ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
            }}
          >
            {t('info-activity')}
          </div>
          <div>
            <strong>{t('info-total-visits', { count: Number(stats.totalVisits) })}</strong>
          </div>
          <div>
            <strong>{t('info-active-cells', { count: Number(stats.gridCells) })}</strong>
          </div>
        </div>
        <div>
          <div
            style={{
              marginBottom: '4px',
              ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
            }}
          >
            {t('info-time-speed')}
          </div>
          <div>
            <strong>{t('info-avg-time', { value: stats.avgTime })}</strong>
          </div>
          <div>
            <strong>{t('info-max-time', { value: stats.maxTime })}</strong>
          </div>
          <div>
            <strong>{t('info-avg-speed', { value: stats.avgSpeed })}</strong>
          </div>
        </div>
        <div
          style={{
            marginTop: '8px',
            paddingTop: '12px',
            borderTop:
              theme === 'dark'
                ? '1px solid rgba(156, 163, 175, 0.2)'
                : '1px solid rgba(107, 114, 128, 0.2)',
            ...(SHARED_STYLES.text.label(theme) as React.CSSProperties),
          }}
        >
          {t('info-rotate-hint')}
        </div>
      </div>
    </div>
  );
});
