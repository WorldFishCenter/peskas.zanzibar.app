"use client";
import { useAtom } from "jotai";
import { useTranslation } from "@/app/i18n/client";
import CatchMetricsChart from "./catch-metrics";
import FileStats from "@/app/shared/file/dashboard/file-stats";
import GearTreemap from "@/app/shared/file/dashboard/gear-treemap";
import CatchRadarChart from "@/app/shared/file/dashboard/catch-radar";
import DistrictRanking from "@/app/shared/file/dashboard/district-ranking";
import GridMap from "./grid-map";
import { selectedMetricAtom } from "@/app/components/filter-selector";
import Table from "@/app/shared/table";
import TableFilter from "@/app/shared/controlled-table/table-filter";
import { api } from "@/trpc/react";
import { useState, useMemo } from "react";
import type { AlignType } from "rc-table/lib/interface";
import { HeaderCell } from "@/app/shared/table";

// YlGnBu-8 palette
const YLGNBU_8 = [
  "#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb",
  "#41b6c4", "#1d91c0", "#225ea8", "#253494"
];

function getPaletteColor(value: number | null, min: number, max: number) {
  if (value === null || isNaN(value)) return YLGNBU_8[0];
  if (max === min) return YLGNBU_8[YLGNBU_8.length - 1];
  const idx = Math.floor(((value - min) / (max - min)) * (YLGNBU_8.length - 1));
  return YLGNBU_8[idx];
}

// Utility to determine if text should be white or black based on background color
function getTextColor(bgColor: string) {
  // Convert hex to RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#222' : '#fff';
}

function formatNumber(val: number | null) {
  if (val === null || isNaN(val)) return "-";
  return Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const TIME_RANGES = [
  { label: "Last 3 months", value: 3 },
  { label: "Last 6 months", value: 6 },
  { label: "Last year", value: 12 },
  { label: "All time", value: "all" },
];

function getDateRange(months: number | string) {
  if (months === "all") return { start: "1900-01-01", end: new Date().toISOString() };
  const end = new Date();
  const start = new Date();
  start.setMonth(end.getMonth() - Number(months));
  return { start: start.toISOString(), end: end.toISOString() };
}

function DistrictMetricsTable() {
  const [range, setRange] = useState<string | number>(3);
  const [sorter, setSorter] = useState<{ columnKey: string; order: 'ascend' | 'descend' | null }>({ columnKey: 'district', order: null });
  const { start, end } = useMemo(() => getDateRange(range), [range]);
  const { data = [], isLoading } = api.districtSummary.getDistrictsSummaryByDateRange.useQuery({ startDate: start, endDate: end });
  const metricKeys = [
    "n_submissions",
    "n_fishers",
    "trip_duration",
    "mean_cpue",
    "mean_rpue",
    "mean_price_kg"
  ];
  // Compute min/max for each metric for palette
  const minMax: Record<string, { min: number, max: number }> = {};
  for (const key of metricKeys) {
    const vals = data.map((row: any) => row[key]).filter((v: any) => v !== null && !isNaN(v));
    minMax[key] = {
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 1
    };
  }
  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sorter.order) return data;
    const { columnKey, order } = sorter;
    return [...data].sort((a, b) => {
      let va = a[columnKey];
      let vb = b[columnKey];
      if (va === undefined || va === null) va = '';
      if (vb === undefined || vb === null) vb = '';
      if (typeof va === 'string' && typeof vb === 'string') {
        return order === 'ascend' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return order === 'ascend' ? va - vb : vb - va;
    });
  }, [data, sorter]);

  const columns = [
    {
      title: (
        <HeaderCell
          title="District"
          align="center"
          sortable
          ascending={sorter.columnKey === 'district' ? sorter.order === 'ascend' : undefined}
        />
      ),
      dataIndex: "district",
      key: "district",
      align: "center" as AlignType,
      sorter: true,
      sortOrder: sorter.columnKey === 'district' ? sorter.order : null,
      onHeaderCell: () => ({
        onClick: () => setSorter(s => ({
          columnKey: 'district',
          order: s.columnKey === 'district' && s.order === 'ascend' ? 'descend' : 'ascend',
        }))
      }),
      render: (val: string) => <div className="text-center font-bold text-gray-900">{val}</div>
    },
    ...metricKeys.map(key => ({
      title: (
        <HeaderCell
          title={key}
          align="center"
          sortable
          ascending={sorter.columnKey === key ? sorter.order === 'ascend' : undefined}
        />
      ),
      dataIndex: key,
      key,
      align: "center" as AlignType,
      sorter: true,
      sortOrder: sorter.columnKey === key ? sorter.order : null,
      onHeaderCell: () => ({
        onClick: () => setSorter(s => ({
          columnKey: key,
          order: s.columnKey === key && s.order === 'ascend' ? 'descend' : 'ascend',
        }))
      }),
      render: (val: number | null) => {
        const { min, max } = minMax[key];
        const bg = getPaletteColor(val, min, max);
        const color = getTextColor(bg);
        return (
          <div style={{ background: bg, color, borderRadius: 4, padding: '0.25em 0.5em', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
            {formatNumber(val)}
          </div>
        );
      }
    }))
  ];
  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <span className="font-semibold text-gray-700">District Metrics</span>
        <div className="flex gap-2">
          {TIME_RANGES.map(opt => (
            <button
              key={opt.value}
              className={`px-3 py-1 rounded text-xs border ${range === opt.value ? 'bg-gray-200 border-gray-400 font-semibold' : 'bg-white border-gray-200'}`}
              onClick={() => setRange(opt.value as string | number)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        {isLoading && <div className="py-4 text-center text-gray-500">Loading...</div>}
        <Table
          columns={columns}
          data={sortedData}
          variant="elegant"
          className="min-w-[600px]"
        />
      </div>
    </div>
  );
}

export default function FileDashboard({ lang }: { lang?: string }) {
  const [selectedMetric, setSelectedMetric] = useAtom(selectedMetricAtom);
  const [activeTab, setActiveTab] = useState("trends");
  const { t } = useTranslation("common");

  // Default district-level dashboard for all users
  return (
    <div className="w-full">
      {/* Dashboard header */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {t('text-fishing-dashboard')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('text-dashboard-description')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 xl:gap-6">
        <FileStats 
          lang={lang} 
        />
        <GridMap />
        <DistrictMetricsTable />
        {/* <div className="grid grid-cols-12 gap-5 xl:gap-6">
          <div className="col-span-12 md:col-span-9">
            <CatchMetricsChart
              lang={lang}
              selectedMetric={selectedMetric}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              district={undefined} // Show all districts by default
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <CatchRadarChart 
              lang={lang} 
              district={undefined} // Show all districts by default
            />
          </div>
        </div>
        <GearTreemap 
          lang={lang} 
          district={undefined} // Show all districts by default
        />
        <DistrictRanking 
          lang={lang} 
          district={undefined} // Show all districts by default
        /> */}
      </div>
    </div>
  );
}