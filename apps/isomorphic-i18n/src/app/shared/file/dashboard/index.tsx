"use client";
import { useState, useEffect } from "react";
import FileStats from "@/app/shared/file/dashboard/file-stats";
import CatchMonthly from "@/app/shared/file/dashboard/catch-ts";
import PerformanceTable from "@/app/shared/file/dashboard/file-list/table";
import GearTreemap from "@/app/shared/file/dashboard/gear-treemap";
import CatchRadarChart from "@/app/shared/file/dashboard/catch-radar";

type MetricKey = "mean_effort" | "mean_cpue" | "mean_cpua" | "mean_rpue" | "mean_rpua";

export default function FileDashboard({ lang }: { lang?: string }) {
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("mean_effort");
  const [activeTab, setActiveTab] = useState('standard');

  // Extract BMU from user email
  const userEmail = "test+WBCIA+Kuruwitu@mountaindev.com"; // This should be dynamically obtained
  const bmu = userEmail.split('+')[2].split('@')[0];

  useEffect(() => {
    console.log("User BMU:", bmu);
  }, [bmu]);

  return (
    <div className="@container">
      {/* General Stats Row */}
      <FileStats className="mb-5 2xl:mb-8" lang={lang} bmu={bmu} />

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <CatchMonthly
          className="@container @4xl:col-span-8 @[96.937rem]:col-span-9"
          lang={lang}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          bmu={bmu}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <CatchRadarChart
          className="@4xl:col-span-4 @[96.937rem]:col-span-3"
          lang={lang}
          selectedMetric={selectedMetric}
          bmu={bmu}
          activeTab={activeTab}
        />
      </div>

      {/* Treemap Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <GearTreemap
          className="@container @4xl:col-span-12 @[96.937rem]:col-span-12"
          lang={lang}
          bmu={bmu}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-12 2xl:mb-8 2xl:gap-8">
        <PerformanceTable
          className="@container @4xl:col-span-12 @[96.937rem]:col-span-12"
          lang={lang}
          bmu={bmu}
        />
      </div>
    </div>
  );
}
