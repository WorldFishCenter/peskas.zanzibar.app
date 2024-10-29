"use client";

import { Button, Text } from "rizzui";
import cn from "@utils/class-names";
import { useScrollableSlider } from "@hooks/use-scrollable-slider";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import MetricCard from "@components/cards/metric-card";
import TrendingUpIcon from "@components/icons/trending-up";
import TrendingDownIcon from "@components/icons/trending-down";
import { useTranslation } from "@/app/i18n/client";
import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";

type FileStatsType = {
  className?: string;
  lang?: string;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-sm font-medium">
          <span>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const filesStatData = [
  {
    id: "1",
    title: "Total surveys",
    metric: "36,476",
    increased: true,
    decreased: false,
    percentage: "+32.40",
    fill: "#015DE1",
    chart: [
      { day: "Jan", sale: 2000 },
      { day: "Feb", sale: 2800 },
      { day: "Mar", sale: 3200 },
      { day: "Apr", sale: 2780 },
      { day: "May", sale: 3900 },
      { day: "Jun", sale: 3490 },
      { day: "Jul", sale: 4200 },
    ],
  },
  {
    id: "2",
    title: "Total fishers",
    metric: "53,406",
    increased: false,
    decreased: true,
    percentage: "-18.45",
    fill: "#048848",
    chart: [
      { day: "Jan", sale: 3500 },
      { day: "Feb", sale: 3000 },
      { day: "Mar", sale: 2800 },
      { day: "Apr", sale: 2600 },
      { day: "May", sale: 2400 },
      { day: "Jun", sale: 2200 },
      { day: "Jul", sale: 2000 },
    ],
  },
  {
    id: "3",
    title: "Total landings",
    metric: "90,875",
    increased: true,
    decreased: false,
    percentage: "+20.34",
    fill: "#B92E5D",
    chart: [
      { day: "Jan", sale: 4500 },
      { day: "Feb", sale: 5000 },
      { day: "Mar", sale: 5500 },
      { day: "Apr", sale: 6000 },
      { day: "May", sale: 6500 },
      { day: "Jun", sale: 7000 },
      { day: "Jul", sale: 7500 },
    ],
  },
  {
    id: "4",
    title: "Monthly tonnes",
    metric: "63,076",
    increased: true,
    decreased: false,
    percentage: "+14.45",
    fill: "#8200E9",
    chart: [
      { day: "Jan", sale: 3000 },
      { day: "Feb", sale: 3300 },
      { day: "Mar", sale: 3600 },
      { day: "Apr", sale: 3900 },
      { day: "May", sale: 4200 },
      { day: "Jun", sale: 4500 },
      { day: "Jul", sale: 4800 },
    ],
  },
];

export function FileStatGrid({
  className,
  lang,
}: {
  className?: string;
  lang?: string;
}) {
  const { t } = useTranslation(lang!, "common");

  return (
    <>
      {filesStatData.map((stat) => (
        <MetricCard
          key={stat.title + stat.id}
          title={t(stat.title)}
          metric={stat.metric}
          rounded="lg"
          metricClassName="text-2xl mt-1"
          info={
            <Text className="mt-4 flex items-center text-sm">
              <Text
                as="span"
                className={cn(
                  "me-2 inline-flex items-center font-medium",
                  stat.increased ? "text-green-500" : "text-red-500"
                )}
              >
                {stat.increased ? (
                  <TrendingUpIcon className="me-1 h-4 w-4" />
                ) : (
                  <TrendingDownIcon className="me-1 h-4 w-4" />
                )}
                {stat.percentage}%
              </Text>
              {t("text-last-month")}
            </Text>
          }
          chart={
            <div className="h-12 w-20 @[16.25rem]:h-16 @[16.25rem]:w-24 @xs:h-20 @xs:w-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart barSize={6} barGap={5} data={stat.chart}>
                  <Bar dataKey="sale" fill={stat.fill} radius={[2, 2, 0, 0]} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
          chartClassName="flex flex-col w-auto h-auto text-center"
          className={cn(
            "@container @7xl:text-[15px] [&>div]:items-end",
            "w-full max-w-full",
            className
          )}
        />
      ))}
    </>
  );
}

export default function FileStats({ className, lang }: FileStatsType) {
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  return (
    <div
      className={cn(
        "relative flex w-auto items-center overflow-hidden",
        className
      )}
    >
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 3xl:hidden dark:from-gray-50 dark:via-gray-50/70"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden">
        <div
          ref={sliderEl}
          className="custom-scrollbar-x grid grid-flow-col gap-5 overflow-x-auto scroll-smooth 2xl:gap-6 3xl:gap-8"
        >
          <FileStatGrid className="min-w-[292px]" lang={lang} />
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="!absolute right-0 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 3xl:hidden dark:from-gray-50 dark:via-gray-50/70"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}
