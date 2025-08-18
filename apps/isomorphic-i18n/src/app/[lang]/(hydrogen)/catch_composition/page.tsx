"use client";

import PageHeader from "@/app/shared/page-header";
import SpeciesCompositionStackedBar from "@/app/shared/file/dashboard/charts/species-composition-stacked-bar";
import LengthDistributionBar from "@/app/shared/file/dashboard/charts/length-distribution-bar";
import DistrictSpeciesHeatmap from "@/app/shared/file/dashboard/charts/district-species-heatmap";
import { useTranslation } from "@/app/i18n/client";

export default function CatchCompositionPage() {
  const { t } = useTranslation("common");

  const pageHeader = {
    title: t("text-catch-composition-analysis") || "Catch Composition Analysis",
    breadcrumb: [
      {
        href: "/",
        name: t("text-home") || "Home",
      },
      {
        name: t("nav-catch-composition") || "Catch Composition",
      },
    ],
  };

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      />
      
      <div className="space-y-4 md:space-y-6">
        {/* Charts Section - responsive 2-column layout */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <SpeciesCompositionStackedBar />
          <LengthDistributionBar />
        </div>
        
        {/* District-Species Heatmap - Full width */}
        <div className="grid grid-cols-1">
          <DistrictSpeciesHeatmap />
        </div>
      </div>
    </>
  );
}