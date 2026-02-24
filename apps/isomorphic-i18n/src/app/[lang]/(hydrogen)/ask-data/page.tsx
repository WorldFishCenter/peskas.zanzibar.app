import { Metadata } from "next";
import PageHeader from "@/app/shared/page-header";
import { routes } from "@/config/routes";
import ComingSoonPlaceholder from "@/app/shared/coming-soon-placeholder";

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

export default function AskDataPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      />
      <ComingSoonPlaceholder lang={lang} />
    </>
  );
}
