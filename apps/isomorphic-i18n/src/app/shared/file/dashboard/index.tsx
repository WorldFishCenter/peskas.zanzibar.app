"use client";

import StorageReport from "@/app/shared/file/dashboard/storage-report";
import FileStats from "@/app/shared/file/dashboard/file-stats";
import StorageSummary from "@/app/shared/file/dashboard/storage-summary";
import RecentFiles from "@/app/shared/file/dashboard/recent-files";
import QuickAccess from "@/app/shared/file/dashboard/quick-access";
import CatchMonthly from "@/app/shared/file/dashboard/catch-ts";
import Members from "@/app/shared/file/dashboard/members";
import FileListTable from "@/app/shared/file/dashboard/file-list/table";
import UpgradeStorage from "@/app/shared/file/dashboard/upgrade-storage";
import RecentActivities from "@/app/shared/file/dashboard/recent-activities";
import GearTreemap from '@/app/shared/file/dashboard/gear-treemap';



export default function FileDashboard({ lang }: { lang?: string }) {
  return (
    <div className="@container">
      <FileStats className="mb-5 2xl:mb-8" lang={lang} />
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <StorageReport
          className="@container @4xl:col-span-12 @[96.937rem]:col-span-12"
          lang={lang}
        />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <CatchMonthly
          className="@container @4xl:col-span-7 @[96.937rem]:col-span-8"
          lang={lang}
        />
        <GearTreemap
          className="@4xl:col-span-5 @[96.937rem]:col-span-4"
          lang={lang}
        />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <FileListTable
          className="@container @4xl:col-span-12 @[96.937rem]:col-span-12"
          lang={lang}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 @container lg:grid-cols-12 2xl:gap-8 ">
      </div>
    </div>
  );
}
