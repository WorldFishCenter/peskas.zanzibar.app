import FileDashboard from "@/app/shared/file/dashboard";
import { metaObject } from "@/config/site.config";

export const metadata = {
  ...metaObject(),
};

export default async function FileDashboardPage(
  props: {
    params: Promise<{
      lang: string;
    }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  return <FileDashboard lang={lang} />;
}
