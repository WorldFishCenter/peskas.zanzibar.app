'use client';
import React, { useState, useMemo, useCallback, memo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl';
import { GridLayer } from '@deck.gl/aggregation-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import {
  TIME_BREAKS,
  COLOR_RANGE,
  INITIAL_VIEW_STATE,
  GRID_LAYER_SETTINGS,
} from '@/app/constants/mapConfig';
import { api } from '@/trpc/react';
import { IconSatellite, IconMap } from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/app/i18n/client';
import { useAtom } from 'jotai';
import { selectedMetricAtom } from '@/app/components/filter-selector';
import { selectedTimeRangeAtom } from '@/app/components/time-range-selector';
import { activeCountry } from '@/config/countryConfig';
import { formatDashboardNumber, computeDateRange } from '../utils';
import type { Theme, TimeBreak, DataPoint, GridMapProps, ChoroplethLegend } from './types';
import {
  CHOROPLETH_COLORS,
  MAP_STYLES,
  interpolateChoroplethColor,
  METRIC_LABEL_KEYS,
  getColorForValue,
} from './colors';
import { InfoPanel } from './info-panel';

const GridMap = memo(function GridMap({ lang = 'en' }: GridMapProps) {
  const { theme: rawTheme = 'light' } = useTheme();
  const theme = (rawTheme === 'dark' ? 'dark' : 'light') as Theme;
  const { t } = useTranslation('common');

  // Grid track data
  const { data = [] } = api.gridSummary.all.useQuery();
  const FILTERED_DATA: DataPoint[] = useMemo(
    () =>
      (data as any[])
        .filter((d) => !d.type?.includes('metadata'))
        .map((d) => ({
          position: [d.lng_grid_1km, d.lat_grid_1km] as [number, number],
          avgTimeHours: d.avg_time_hours || 0,
          totalVisits: parseInt(d.total_visits) || 0,
          avgSpeed: parseFloat(d.avg_speed) || 0,
          originalCells: parseInt(d.original_cells) || 0,
        })),
    [data]
  );

  // Choropleth: shared metric + time range atoms
  const [selectedMetric] = useAtom(selectedMetricAtom);
  const [range] = useAtom(selectedTimeRangeAtom);
  const { start, end } = useMemo(() => computeDateRange(range), [range]);

  const { data: boundariesData } = api.gaul2Boundaries.getByCountry.useQuery({
    iso3Code: activeCountry.iso3Code,
  });

  const { data: districtMetrics = [] } =
    api.districtSummary.getDistrictsSummaryByDateRange.useQuery({
      startDate: start,
      endDate: end,
    });

  // Map district name → metric value
  const metricByDistrict = useMemo(() => {
    const map = new Map<string, number>();
    (districtMetrics as any[]).forEach((row) => {
      const v = row[selectedMetric];
      if (v != null && !isNaN(Number(v))) map.set(row.gaul_2_name, Number(v));
    });
    return map;
  }, [districtMetrics, selectedMetric]);

  const [minVal, maxVal] = useMemo(() => {
    const vals = Array.from(metricByDistrict.values());
    if (!vals.length) return [0, 1];
    return [Math.min(...vals), Math.max(...vals)];
  }, [metricByDistrict]);

  // Choropleth legend props
  const choroplethLegend = useMemo((): ChoroplethLegend | undefined => {
    if (!boundariesData || metricByDistrict.size === 0) return undefined;
    const labelKey = METRIC_LABEL_KEYS[selectedMetric] ?? selectedMetric;
    return {
      colors: CHOROPLETH_COLORS,
      metricLabel: t(labelKey),
      minLabel: formatDashboardNumber(minVal, selectedMetric, lang),
      maxLabel: formatDashboardNumber(maxVal, selectedMetric, lang),
    };
  }, [boundariesData, metricByDistrict, selectedMetric, minVal, maxVal, lang, t]);

  const [viewState, setViewState] = useState<typeof INITIAL_VIEW_STATE>(INITIAL_VIEW_STATE);
  const [selectedRanges, setSelectedRanges] = useState<TimeBreak[]>(TIME_BREAKS);
  const transformedData: DataPoint[] = useMemo(
    () =>
      FILTERED_DATA.filter((d) =>
        selectedRanges.some(
          (range) =>
            d.avgTimeHours >= range.min &&
            (range.max === Infinity ? true : d.avgTimeHours < range.max)
        )
      ),
    [FILTERED_DATA, selectedRanges]
  );

  const handleRangeToggle = useCallback((range: TimeBreak) => {
    setSelectedRanges((current: TimeBreak[]) => {
      const isSelected = current.some(
        (r) => r.min === range.min && r.max === range.max
      );
      if (isSelected) {
        return current.length === 1
          ? current
          : current.filter((r) => r.min !== range.min || r.max !== range.max);
      }
      return [...current, range];
    });
  }, []);

  const getTooltip = useCallback(
    (info: {
      object?: any;
      layer?: { id: string };
    }) => {
      const object = info.object;
      if (!object) return null;

      // GeoJSON polygon feature (choropleth layer)
      if (info.layer?.id === 'gaul2-choropleth' && object.properties?.gaul2_name) {
        const name = object.properties.gaul2_name as string;
        const val = metricByDistrict.get(name);
        const labelKey = METRIC_LABEL_KEYS[selectedMetric] ?? selectedMetric;
        return {
          html: `
            <div style="padding: 8px">
              <div><strong>${name}</strong></div>
              ${val != null
                ? `<div>${t(labelKey)}: ${formatDashboardNumber(val, selectedMetric, lang)}</div>`
                : '<div>No data</div>'}
            </div>
          `,
          style: {
            backgroundColor: 'rgba(20,20,20,0.9)',
            color: '#ffffff',
            fontSize: '12px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          },
        };
      }

      // Grid cell (existing logic)
      if (!object.points) return null;
      const avgTime =
        object.points.reduce((sum: number, p: { source: DataPoint }) => sum + p.source.avgTimeHours, 0) /
        object.points.length;
      const breakIndex = TIME_BREAKS.findIndex(
        (range) =>
          avgTime >= range.min && (range.max === Infinity ? true : avgTime < range.max)
      );
      const cellColor = COLOR_RANGE[breakIndex >= 0 ? breakIndex : 0];
      const totalVisits = object.points.reduce(
        (sum: number, p: { source: DataPoint }) => sum + p.source.totalVisits,
        0
      );
      return {
        html: `
          <div style="padding: 8px">
            <div><strong>Time spent</strong></div>
            <div>Average time: ${avgTime.toFixed(2)} hours</div>
            <div><strong>Activity</strong></div>
            <div>Total visits: ${totalVisits}</div>
          </div>
        `,
        style: {
          backgroundColor: `rgba(${cellColor.join(',')}, 0.95)`,
          color: breakIndex > COLOR_RANGE.length / 2 ? '#ffffff' : '#000000',
          fontSize: '12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
      };
    },
    [metricByDistrict, selectedMetric, lang, t]
  );

  // Choropleth layer (rendered on top of the grid layer via depthTest: false)
  const choroplethLayer = useMemo(() => {
    if (!boundariesData) return null;
    return new GeoJsonLayer({
      id: 'gaul2-choropleth',
      data: boundariesData as any,
      pickable: true,
      stroked: true,
      filled: true,
      getFillColor: (f: any) => {
        const name = f.properties?.gaul2_name as string | undefined;
        const val = name != null ? metricByDistrict.get(name) : undefined;
        if (val == null) return [200, 200, 200, 120] as [number, number, number, number];
        return interpolateChoroplethColor(val, minVal, maxVal);
      },
      getLineColor: [255, 255, 255, 200] as [number, number, number, number],
      getLineWidth: 1,
      lineWidthUnits: 'pixels' as const,
      parameters: { depthTest: false },
      updateTriggers: {
        getFillColor: [metricByDistrict, minVal, maxVal],
      },
    });
  }, [boundariesData, metricByDistrict, minVal, maxVal]);

  const layers = useMemo(
    () =>
      [
        new GridLayer({
          ...GRID_LAYER_SETTINGS,
          id: 'grid-layer',
          data: transformedData,
          pickable: true,
          extruded: true,
          getPosition: (d: DataPoint) => d.position,
          getElevationWeight: (d: DataPoint) => d.avgTimeHours,
          colorRange: COLOR_RANGE as any,
          colorScaleType: 'ordinal',
          getColorWeight: (d: DataPoint) => (d ? getColorForValue(d.avgTimeHours) : 0),
          updateTriggers: {
            getColorWeight: [selectedRanges],
          },
        }),
        choroplethLayer,
      ].filter(Boolean),
    [transformedData, selectedRanges, choroplethLayer]
  );

  // Only two states: 'satellite' and 'map'
  const [viewMode, setViewMode] = useState<'satellite' | 'map'>('satellite');
  const iconColor = theme === 'dark' ? '#fff' : '#222';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Single Icon Map Style Switcher, now theme-aware */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <button
          onClick={() => setViewMode(viewMode === 'satellite' ? 'map' : 'satellite')}
          style={{
            background: theme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #d1d5db',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, border 0.2s',
          }}
          title={viewMode === 'satellite' ? 'Switch to Map View' : 'Switch to Satellite View'}
          aria-label={viewMode === 'satellite' ? 'Switch to Map View' : 'Switch to Satellite View'}
        >
          {viewMode === 'satellite' ? (
            <IconMap size={28} color={iconColor} />
          ) : (
            <IconSatellite size={28} color={iconColor} />
          )}
        </button>
      </div>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={(params) => setViewState(params.viewState as typeof INITIAL_VIEW_STATE)}
        getTooltip={getTooltip as any}
        style={{ width: '100%', height: '100%' }}
      >
        <MapGL
          mapStyle={
            viewMode === 'satellite'
              ? MAP_STYLES.satellite
              : theme === 'dark'
                ? MAP_STYLES.dark
                : MAP_STYLES.light
          }
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
          reuseMaps
          attributionControl={false}
          renderWorldCopies={false}
          antialias
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>
      <InfoPanel
        theme={theme}
        data={transformedData}
        colorRange={COLOR_RANGE}
        selectedRanges={selectedRanges}
        onRangeToggle={handleRangeToggle}
        choroplethLegend={choroplethLegend}
      />
    </div>
  );
});

export default GridMap;
