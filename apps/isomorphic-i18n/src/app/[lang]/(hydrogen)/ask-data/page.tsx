import PageHeader from "@/app/shared/page-header";
import { routes } from "@/config/routes";
import { metaObject } from "@/config/site.config";
import ComingSoonPlaceholder from "@/app/shared/coming-soon-placeholder";

export const metadata = {
  ...metaObject("Ask Data"),
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

export default async function AskDataPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

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
