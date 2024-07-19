import { Metadata } from "next";
import PageHeader from "@/app/shared/page-header";

// SEO metadata
export const metadata: Metadata = {
  title: "New Page | Isomorphic",
};

const pageHeader = {
  title: "Peppe",
  breadcrumb: [
    {
      href: "/",
      name: "Home",
    },
    {
      name: "NewPage",
    },
  ],
};

export default function NewPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      />
    </>
  );
}