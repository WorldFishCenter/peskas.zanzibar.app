"use client";
import { useState } from "react";
import { useAtom } from "jotai";
import { useTranslation } from "@/app/i18n/client";
import { MetricKey } from "./charts/types"; 
import CatchMetricsChart from "./catch-metrics";
import type { DefaultSession } from "next-auth";
import type { TBmu } from "@repo/nosql/schema/bmu";
import FileStats from "@/app/shared/file/dashboard/file-stats";
import PerformanceTable from "@/app/shared/file/dashboard/file-list/table";
import GearTreemap from "@/app/shared/file/dashboard/gear-treemap";
import CatchRadarChart from "@/app/shared/file/dashboard/catch-radar";
import BMURanking from "@/app/shared/file/dashboard/bmu-ranking";
import { selectedMetricAtom } from "@/app/components/filter-selector";
import { useUserPermissions } from "./hooks/useUserPermissions";

type SerializedBmu = {
  _id: string;
  BMU: string;
  group: string;
}

type CustomSession = {
  user?: {
    bmus?: Omit<TBmu, "lat" | "lng" | "treatments">[];
    userBmu?: SerializedBmu;
  } & DefaultSession["user"]
}

export default function FileDashboard({ lang }: { lang?: string }) {
  const [selectedMetric, setSelectedMetric] = useAtom(selectedMetricAtom);
  const [activeTab, setActiveTab] = useState("trends");
  const { t } = useTranslation("common");
  const { referenceBMU } = useUserPermissions();

  // Use reference BMU if available or fall back to user's BMU
  const effectiveBMU = referenceBMU || undefined;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-5 xl:gap-6">
        <FileStats lang={lang} bmu={effectiveBMU} />
        <div className="grid grid-cols-12 gap-5 xl:gap-6">
          <div className="col-span-12 md:col-span-9">
            <CatchMetricsChart
              lang={lang}
              selectedMetric={selectedMetric}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              bmu={effectiveBMU}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <CatchRadarChart 
              lang={lang} 
              bmu={effectiveBMU}
            />
          </div>
        </div>
        <GearTreemap lang={lang} bmu={effectiveBMU} />
        <BMURanking lang={lang} bmu={effectiveBMU} />
        {/* <PerformanceTable lang={lang} /> */}
      </div>
    </div>
  );
}