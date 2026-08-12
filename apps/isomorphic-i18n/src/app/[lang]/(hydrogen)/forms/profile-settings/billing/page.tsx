import BillingSettingsView from '@/app/shared/account-settings/billing-settings';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Billing'),
};

export default async function IntegrationSettingsFormPage(
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

  return <BillingSettingsView />;
}
