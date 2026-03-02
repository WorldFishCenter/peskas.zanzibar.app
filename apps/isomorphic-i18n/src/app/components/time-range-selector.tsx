"use client";

import { useState } from "react";
import { useAtom, atom } from "jotai";
import { PiCaretDownBold, PiClockCountdownDuotone } from "react-icons/pi";
import { Popover } from "rizzui";
import cn from "@utils/class-names";
import { useTranslation } from "@/app/i18n/client";

// Global time range selector atom and options
export const TIME_RANGES = [
  { label: "Last 3 months", value: 3 },
  { label: "Last 6 months", value: 6 },
  { label: "Last year", value: 12 },
  { label: "Last 6 years", value: 72 },
  { label: "All time", value: "all" },
];

export const selectedTimeRangeAtom = atom<string | number>(6);

export default function TimeRangeSelector() {
  const { t } = useTranslation("common");
  const [selectedTimeRange, setSelectedTimeRange] = useAtom(selectedTimeRangeAtom);
  const [isOpen, setIsOpen] = useState(false);

  const translatedTimeRanges = [
    { label: t("text-last-3-months") || "Last 3 months", value: 3 },
    { label: t("text-last-6-months") || "Last 6 months", value: 6 },
    { label: t("text-last-year") || "Last year", value: 12 },
    { label: t("text-all-time") || "All time", value: "all" },
  ];

  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} placement="bottom-end">
      <Popover.Trigger>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 text-sm font-medium rounded-lg transition-all",
            "border border-blue-200/80 dark:border-blue-600/50",
            "bg-blue-50/50 dark:bg-blue-800/20 text-gray-800 dark:text-gray-700",
            "hover:bg-blue-100/70 dark:hover:bg-blue-700/25 hover:border-blue-300 dark:hover:border-blue-500/60",
            "focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600",
            isOpen && "ring-2 ring-blue-300 dark:ring-blue-600 bg-blue-50 dark:bg-blue-800/30"
          )}
        >
          <PiClockCountdownDuotone className="h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
          <span className="truncate">
            {translatedTimeRanges.find(r => r.value === selectedTimeRange)?.label || translatedTimeRanges[0].label}
          </span>
          <PiCaretDownBold className={cn("h-3 w-3 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
        </button>
      </Popover.Trigger>
      <Popover.Content className="w-48 p-2 bg-gray-0 dark:bg-gray-50 border border-muted rounded-lg">
        {translatedTimeRanges.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setSelectedTimeRange(option.value);
              setIsOpen(false);
            }}
            className={cn(
              "w-full px-2 py-1.5 text-left text-sm rounded transition-colors",
              selectedTimeRange === option.value
                ? "bg-blue-50 dark:bg-blue-800 text-blue-900 dark:text-blue-200"
                : "text-gray-900 dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100/80"
            )}
          >
            {option.label}
          </button>
        ))}
      </Popover.Content>
    </Popover>
  );
}
