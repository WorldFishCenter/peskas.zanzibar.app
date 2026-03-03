"use client";
import MetricCards from "./metric-cards";
import DistrictSummaryBar from "./district-summary-bar";
import DistrictMetricsTable from "./district-metrics-table";
import GridMap from "./grid-map";

export default function FileDashboard({ lang }: { lang?: string }) {
  return (
    <div className="w-full">
      <MetricCards lang={lang} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 xl:gap-6 w-full mt-4">
        <div className="md:col-span-4 h-64 xs:h-72 sm:h-80 md:h-[400px] lg:h-[500px] xl:h-[700px]">
          <DistrictSummaryBar />
        </div>
        <div className="md:col-span-8 h-64 xs:h-72 sm:h-80 md:h-[400px] lg:h-[500px] xl:h-[700px] overflow-hidden">
          <GridMap lang={lang} />
        </div>
      </div>
      <div className="mt-4 md:mt-6">
        <DistrictMetricsTable />
      </div>
    </div>
  );
}
