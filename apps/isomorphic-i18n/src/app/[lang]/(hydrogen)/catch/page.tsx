"use client";

import { useAtom } from "jotai";
import PageHeader from "@/app/shared/page-header";
import CatchTimeSeries from "@/app/shared/file/dashboard/charts/catch-time-series";
import CatchRadar from "@/app/shared/file/dashboard/charts/catch-radar";
import { selectedMetricAtom } from "@/app/components/filter-selector";

const pageHeader = {
  title: "Catch Analysis",
  breadcrumb: [
    {
      href: "/",
      name: "Home",
    },
    {
      name: "Catch",
    },
  ],
};

export default function CatchPage() {
  const [selectedMetric] = useAtom(selectedMetricAtom);

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      />
      
      <div className="space-y-6">
        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CatchTimeSeries 
            selectedMetrics={[selectedMetric]}
            months={12}
          />
          <CatchRadar 
            selectedMetrics={[selectedMetric]}
            year={new Date().getFullYear()}
          />
        </div>
      </div>
    </>
  );
}