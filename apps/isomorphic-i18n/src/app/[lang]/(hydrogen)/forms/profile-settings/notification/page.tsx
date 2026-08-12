import { routes } from '@/config/routes';
import NotificationSettingsView from '@/app/shared/account-settings/notification-settings';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Notification'),
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

  return <NotificationSettingsView />;
}
