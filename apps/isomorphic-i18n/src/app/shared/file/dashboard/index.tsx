"use client";
import MetricCards from "./metric-cards";
import DistrictMetricsTable from "./district-metrics-table";
import DistrictMapAndBar from "./district-map-and-bar";

export default function FileDashboard({ lang }: { lang?: string }) {
  return (
    <div className="w-full">
      <MetricCards lang={lang} />
      <div className="mt-4 md:mt-6">
        <DistrictMapAndBar lang={lang} />
      </div>
      <div className="mt-4 md:mt-6">
        <DistrictMetricsTable />
      </div>
    </div>
  );
}
