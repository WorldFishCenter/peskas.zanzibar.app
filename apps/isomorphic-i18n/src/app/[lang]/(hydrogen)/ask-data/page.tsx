import { Metadata } from "next";
import PageHeader from "@/app/shared/page-header";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Ask Data | Peskas Zanzibar",
};

const pageHeader = {
  title: "nav-ask-data",
  breadcrumb: [
    {
      href: routes.home,
      name: "text-home",
    },
    {
      name: "nav-ask-data",
    },
  ],
};

export default function AskDataPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      />
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/30">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Coming Soon</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This feature is under development.</p>
        </div>
      </div>
    </>
  );
}