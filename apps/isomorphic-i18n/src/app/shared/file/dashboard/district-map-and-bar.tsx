"use client";

import React from "react";
import WidgetCard from "@components/cards/widget-card";
import { useTranslation } from "@/app/i18n/client";
import { useAtom } from "jotai";
import { selectedMetricAtom } from "@/app/components/filter-selector";
import type { MetricKey } from "@/app/shared/file/dashboard/charts/types";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@ui/select";
import { METRICS } from "./district-summary-bar";
import DistrictSummaryBar from "./district-summary-bar";
import GridMap from "./grid-map";

export default function DistrictMapAndBar({ lang = 'en', className }: { lang?: string, className?: string }) {
    const { t } = useTranslation("common");
    const [selectedMetric, setSelectedMetric] = useAtom(selectedMetricAtom);

    return (
        <WidgetCard
            title={
                <div className="flex flex-row items-center gap-3">
                    <span className="font-semibold text-gray-900 dark:text-gray-700">
                        {t("text-district-summary")}
                    </span>
                    <div className="min-w-fit">
                        <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricKey)}>
                            <SelectTrigger className="w-full max-w-[180px] sm:max-w-[240px] md:max-w-[300px]">
                                <SelectValue>{t(METRICS.find(m => m.key === selectedMetric)?.labelKey || "")}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {METRICS.map(m => (
                                    <SelectItem key={m.key} value={m.key}>{t(m.labelKey)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            }
            className={`border border-muted bg-gray-0 p-3 sm:p-5 dark:bg-gray-50 rounded-lg h-full flex flex-col w-full overflow-hidden${className ? ` ${className}` : ''}`}
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1 min-h-0 relative -mx-3 sm:-mx-5 -mb-3 sm:-mb-5 mt-2 rounded-b-lg overflow-hidden border-t border-muted">
                {/* Left side: Bar Chart */}
                <div className="md:col-span-4 h-64 xs:h-72 sm:h-80 md:h-[400px] lg:h-[500px] xl:h-[700px] border-b md:border-b-0 md:border-r border-muted bg-gray-0 dark:bg-gray-50 p-2 sm:p-4">
                    <DistrictSummaryBar lang={lang} />
                </div>

                {/* Right side: Map */}
                <div className="md:col-span-8 h-64 xs:h-72 sm:h-80 md:h-[400px] lg:h-[500px] xl:h-[700px] relative bg-slate-100 dark:bg-slate-900">
                    <GridMap lang={lang} />
                </div>
            </div>
        </WidgetCard>
    );
}
