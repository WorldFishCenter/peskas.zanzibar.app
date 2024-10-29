"use client";
import FileStats from "@/app/shared/file/dashboard/file-stats";
import CatchMonthly from "@/app/shared/file/dashboard/catch-ts";
import FileListTable from "@/app/shared/file/dashboard/file-list/table";
import GearTreemap from '@/app/shared/file/dashboard/gear-treemap';
import CatchRadarChart from '@/app/shared/file/dashboard/catch-radar';
import DeckGL from "@/app/shared/file/dashboard/deck-map";


export default function FileDashboard({ lang }: { lang?: string }) {
  return (
    <div className="@container">
      {/* General Stats Row */}
      <FileStats className="mb-5 2xl:mb-8" lang={lang} />

      {/* Map Row - Full Width */}
      <div className="mb-6 2xl:mb-8">
        <div className="h-[500px] w-full relative @4xl:col-span-12 @[96.937rem]:col-span-12">
          <DeckGL />
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <CatchMonthly
          className="@container @4xl:col-span-9 @[96.937rem]:col-span-10"
          lang={lang}
        />
        <CatchRadarChart
          className="@4xl:col-span-3 @[96.937rem]:col-span-2"
          lang={lang}
        />
      </div>

      {/* Treemap Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <GearTreemap
          className="@container @4xl:col-span-12 @[96.937rem]:col-span-12"
          lang={lang}
        />
      </div>

      {/* Table Row Full Width */}
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <FileListTable
          className="@container @4xl:col-span-12 @[96.937rem]:col-span-12"
          lang={lang}
        />
      </div>
    </div>
  );
}
