import IntegrationSettingsView from '@/app/shared/account-settings/integration-settings';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Integration'),
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

  return <IntegrationSettingsView />;
}
