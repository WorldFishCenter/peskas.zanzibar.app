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
        {/* Charts Section - 8:4 ratio layout */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <CatchTimeSeries 
              selectedMetrics={[selectedMetric]}
              months={12}
            />
          </div>
          <div className="col-span-4">
            <CatchRadar 
              selectedMetrics={[selectedMetric]}
              year={new Date().getFullYear()}
            />
          </div>
        </div>
      </div>
    </>
  );
}