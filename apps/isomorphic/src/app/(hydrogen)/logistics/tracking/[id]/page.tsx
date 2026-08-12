import { useMemo, use } from 'react';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import ShippingInfo from '@/app/shared/logistics/tracking/shipping-info';
import TrackingOverview from '@/app/shared/logistics/tracking/tracking-overview';
import TrackingHistory from '@/app/shared/logistics/tracking/tracking-history';
import { metaObject } from '@/config/site.config';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  // read route params
  const id = params.id;

  return metaObject(`Edit ${id}`);
}

export default function TrackingPage(props: any) {
  const params = use(props.params);
  const pageHeader = useMemo(() => {
    return {
      title: 'Tracking',
      breadcrumb: [
        {
          name: 'Logistics',
        },
        {
          href: routes.logistics.dashboard,
          name: 'Tracking',
        },
        {
          name: params.id,
        },
      ],
    };
  }, [params.id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <TrackingOverview className="mb-10" />
      <ShippingInfo />
      <TrackingHistory />
    </>
  );
}
